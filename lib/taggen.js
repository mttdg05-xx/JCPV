var fs = require('fs');
var js2js = require('js2js');
var elements = [];
var htmlgen = require('./htmlgen.js');
var p2l = js2js.position_to_line;
var p2c = js2js.position_to_column;

function sameLoc(loc1, loc2) {
    return p2l(loc1) === p2l(loc2) && p2c(loc1) === p2c(loc2);
}

function sameRange(e1, e2) {
    return sameLoc(e1.start, e2.start) && sameLoc(e1.end, e2.end);
}

function PositionQueue(elements) {
    // Merge elements with same range
    elements.sort(function (a, b) {
        var v = p2l(b.start) - p2l(a.start);
        if (v === 0) {
            v = p2c(b.start) - p2c(a.start);
            if (v === 0) {
                v = p2l(b.end) - p2l(a.end);
                if (v === 0) {
                    v = p2c(b.end) - p2c(a.end);
                }
            }
        }
        return v;
    });


    this.elements = {
        start: [],
        end: undefined
    };

    
    var a = this.elements.start;
    a.push(elements[0]);
    for (var i = 1; i < elements.length; i++) {
        if (sameRange(elements[i-1], elements[i])) {
            a[a.length - 1].kind.push(elements[i].kind[0]);
        } else {
            a.push(elements[i]);
        }
    }

    this.elements.end = this.elements.start.slice();

    // Sort elements by decreasing end position
    this.elements.end.sort(function (a, b) {
        var v = p2l(b.end) - p2l(a.end);
        if (v === 0) {
            v = p2c(b.end) - p2c(a.end);
        }
        return v;
    });

    this.pos = {
        start: this.elements.start.length - 1,
        end: this.elements.end.length - 1
    };

    this.currentQueue = undefined;
    this.advance();
}

PositionQueue.prototype.advance = function () {
    if (this.currentQueue && this.pos[this.currentQueue] >= 0) {
        this.pos[this.currentQueue]--;
    }

    if (this.pos.start < 0) {
        this.currentQueue = 'end';
        return;
    }

    if (this.pos.end < 0) {
        this.currentQueue = 'start';
        return;
    }

    var pstart = this.elements.start[this.pos.start].start;
    var pend = this.elements.end[this.pos.end].end;

    var q;
    if (pstart === undefined) q = 'start';
    else if (pend === undefined) q = 'end';
    else if (p2l(pstart) < p2l(pend)) q = 'start';
    else if (p2l(pstart) > p2l(pend)) q = 'end';
    else if (p2c(pstart) <= p2c(pend)) q = 'start';
    else q = 'end';

    this.currentQueue = q;
};

PositionQueue.prototype.currentPos = function () {
    var which = this.currentQueue;
    var index = this.pos[which];
    if (index >= 0) {
        return this.elements[which][index][which];
    } else {
        return undefined;
    }
};

PositionQueue.prototype.set = function (pos) {
    var which = this.currentQueue;
    var index = this.pos[which];
    this.elements[which][index][which] = pos;
    this.advance();
};

PositionQueue.prototype.getElements = function () {
    return this.elements.start;
};

function ast_taggen_ctx(source) {
    this.source = source;
    this.elements = [];

}

ast_taggen_ctx.prototype.fixPositions = function () {
    var q = new PositionQueue(this.elements);

    var index = 0;
    var currentLine = 1;
    var currentColumn = 1;
    var src = this.source;
    var srcLen = src.length;
    var nextPos = q.currentPos();
    for (var i = 0; i <= srcLen; i++, index++) {
        if (nextPos === undefined) break;
        while (p2l(nextPos) === currentLine && p2c(nextPos) === currentColumn) {
            q.set(index);
            nextPos = q.currentPos();
        }
        var c = src.charAt(i);
        if (c === '\n') {
            currentLine++;
            currentColumn = 1;
        } else {
            currentColumn++;
        }
    }

    this.elements = q.getElements();
};

ast_taggen_ctx.prototype.kindInPlace = function (current_start, current_end, current_kind) {
  this.elements.push({
    start : current_start,
    end : current_end, 
    kind : [current_kind]
  });
};

ast_taggen_ctx.prototype.visitNode = function (ast) {
    if (ast === null) return;
    if (ast instanceof js2js.Program) kind = 'prog';
    else if (ast instanceof js2js.BlockStatement) kind = 'block';
    else if (ast instanceof js2js.VariableStatement) kind = 'var';
    else if (ast instanceof js2js.Decl) kind = 'decl';
    else if (ast instanceof js2js.ConstStatement) kind = 'const';
    else if (ast instanceof js2js.FunctionDeclaration) kind = 'funcdecl';
    else if (ast instanceof js2js.ExprStatement) kind = 'expr';
    else if (ast instanceof js2js.IfStatement) kind = 'if';
    else if (ast instanceof js2js.DoWhileStatement) kind = 'dowhile';
    else if (ast instanceof js2js.WhileStatement) kind = 'while';
    else if (ast instanceof js2js.ForStatement) kind = 'for';
    else if (ast instanceof js2js.ForVarStatement) kind = 'forvar';
    else if (ast instanceof js2js.ForInStatement) kind = 'forin';
    else if (ast instanceof js2js.ForVarInStatement) kind = 'forvarin';
    else if (ast instanceof js2js.ContinueStatement) kind = 'continue';
    else if (ast instanceof js2js.BreakStatement) kind = 'break';
    else if (ast instanceof js2js.ReturnStatement) kind = 'return';
    else if (ast instanceof js2js.WithStatement) kind = 'with';
    else if (ast instanceof js2js.SwitchStatement) kind = 'switch';
    else if (ast instanceof js2js.CaseClause) kind = 'case';
    else if (ast instanceof js2js.LabelledStatement) kind = 'label';
    else if (ast instanceof js2js.ThrowStatement) kind = 'throw';
    else if (ast instanceof js2js.TryStatement) kind = 'try';
    else if (ast instanceof js2js.CatchPart) kind = 'catch';
    else if (ast instanceof js2js.DebuggerStatement) kind = 'debug';
    else if (ast instanceof js2js.OpExpr) kind = 'op';
    else if (ast instanceof js2js.NewExpr) kind = 'new';
    else if (ast instanceof js2js.CallExpr) kind = 'call';
    else if (ast instanceof js2js.FunctionExpr) kind = 'funcexpr';
    else if (ast instanceof js2js.Literal) kind = 'lit';
    else if (ast instanceof js2js.ArrayLiteral) kind = 'arraylit';
    else if (ast instanceof js2js.ObjectLiteral) kind = 'objlit';
    else if (ast instanceof js2js.Property) kind = 'prop';
    else if (ast instanceof js2js.Ref) kind = 'ref';
    else if (ast instanceof js2js.This) kind = 'this';
    else kind = '<unknown>';
    var start = ast.loc.start_pos;
    var end = ast.loc.end_pos;
    this.kindInPlace(start, end, kind);
};        

ast_taggen_ctx.prototype.walk_statement = function (ast) {
    this.visitNode(ast);
    return js2js.ast_walk_statement(ast, this);
};

ast_taggen_ctx.prototype.walk_expr = function (ast) {
    this.visitNode(ast);
    return js2js.ast_walk_expr(ast, this);
};

function taggen(ast) {
    var ctx = new ast_taggen_ctx(ast.source);
    ctx.walk_statement(ast);
    ctx.fixPositions();
    return ctx.elements;
}


function parse(orig_js, filename) {

  var source = orig_js;
  source = source.replace(/\r\n/g, '\n');
  source = source.replace(/\r/g, '\n');
   
  var ast = js2js.parseSource(source, filename);
  ast.source = source;
  return ast;
}


function tagify(orig_js, filename){
  var elements = taggen(parse(orig_js, filename));

  return htmlgen.genHtmlWithTags(orig_js, elements);
}

exports.taggen = taggen;
exports.tagify = tagify;

