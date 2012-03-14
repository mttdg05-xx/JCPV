var fs = require('fs');
var js2js = require('js2js');
var elements = [];
var htmlgen = require('./htmlgen.js');
function ast_taggen_ctx(source) {
    this.source = source;
}



ast_taggen_ctx.prototype.pos_to_char_index = function (pos) {
    var line = js2js.position_to_line(pos);
    var column = js2js.position_to_column(pos);

    var index = 0;
    for (var i = 1; i < line; i++) {
        index = this.source.indexOf('\n', index) + 1;
    }

    index += column - 1;

    return index;
};

ast_taggen_ctx.prototype.printLoc = function (loc, kind) {
    var start = this.pos_to_char_index(loc.start_pos);
    var end = this.pos_to_char_index(loc.end_pos);
    var fragment = this.source.substring(start, end).replace(/\n/g, "\\n");
    //var _class  = kind;
    //var span = '<span id = "loc' + start + "_" + end + '" class="' + _class + '">' + fragment + '</span>';
    //var myFile = fs.readFileSync('foo.js').toString('ascii');
    //var js2html = new JS2HTML(myFile);
    //var elements = [element(start, end, "'" + kind + "'")]
    //console.log(start + "," + end + ":" + kind + " -> '" + fragment + "'");
    //console.log(span);
    //console.log('--------------');
    //console.log(js2html.insertTags(elements));
    //elements.push(start, end, kind, fragment);
    //htmlgen.hey(start, end, fragment);
    
    kindInPlace(start, end, kind);

};

var elements = [];
function kindInPlace(current_start, current_end, current_kind){
  
  if(elements.length === 0 ){
    elements.push({
      start : current_start,
      end : current_end, 
      kind : [current_kind]
      });
    
    return;

  }
  
  for( var i = 0; i < elements.length; i++){
    if(elements[i].start === undefined){
      elements.push({
        start : current_start,
        end : current_end, 
        kind : [current_kind]
      });
  
      return;
    }
    else{ 

      if(elements[i].start === current_start && elements[i].end === current_end){
        elements[i].kind.push(current_kind);
  
        return;
      }

    }


  }

  elements.push({
    start : current_start,
    end : current_end, 
    kind : [current_kind]
    });
    
}
          

ast_taggen_ctx.prototype.visitNode = function (ast) {
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
    var start = this.pos_to_char_index(ast.loc.start_pos);
    var end = this.pos_to_char_index(ast.loc.end_pos);
    //var fragment = this.source.substring(start, end).replace(/\n/g, "\\n");
    kindInPlace(start, end, kind);

    //this.printLoc(ast.loc, kind);
};

ast_taggen_ctx.prototype.walk_statement = function (ast) {
    this.visitNode(ast);
    return js2js.ast_walk_statement(ast, this);
};

ast_taggen_ctx.prototype.walk_expr = function (ast) {
    this.visitNode(ast);
    return js2js.ast_walk_expr(ast, this);
};

ast_taggen_ctx.prototype.walk_statements = function (ast) {
    return js2js.ast_walk_statements(ast, this);
};

function taggen(ast) {
    var ctx = new ast_taggen_ctx(ast.source);
    ctx.walk_statement(ast);
}

function parse(orig_js, filename) {
    //var source = fs.readFileSync(filename).toString('ascii');
    var source = orig_js;

    // make sure we have unix line endings
    //console.log("-----------------------------------------");
    //console.log(source);
    //console.log("-----------------------------------------");

    source = source.replace(/\r\n/g, '\n');
    source = source.replace(/\r/g, '\n');
   
  
    var ast = js2js.parseSource(source, filename);
    ast.source = source;
    return ast;
}

function clone_elements(elements){
  var clone = [];
  for(var i in elements){
    if(elements.hasOwnProperty(i))
      clone[i] = elements[i];
  }
  return clone;
}

function tagify(orig_js, filename, json_elements){
  //var orig_js = document.getElementById("me").innerHTML;
  taggen(parse(orig_js, filename));
  //var myFile = fs.readFileSync('foo.js').toString('ascii');
  //var js2html = new JS2HTML(myFile);
  //console.log(js2html.insertTags(elements));
  //var json_object = JSON.parse(json_file);
  //console.log("@@@ " + json_object.data.length);
  //console.log(elements.length);
  var clone = clone_elements(elements);
  clone.push.apply(clone, json_elements);
  //console.log('-------------');
  //console.log(clone_elements(elements));
  //console.log('-------------');
  //console.log(elements);
  //console.log('-------------');


  //elements.push.apply(elements, json_elements);
  //console.log(elements.length);
  //console.log("<<<<<>>>>> " + JSON.stringify(json_elements));
  //console.log("@@@ " + JSON.stringify(elements));
  return htmlgen.genHtmlWithTags(orig_js, clone);
  //console.log(elements);
}
//console.log(tagify(fs.readFileSync('foo.js').toString('ascii'), 'foo.js'));
exports.tagify = tagify;
