 /*  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */



var fs = require('fs');

if (typeof print === 'undefined') print = console.log;

//------------------------------------------------------------------------------ 

function StringBuffer() {
    this.data = '';
}

StringBuffer.prototype.write = function (s) {
    this.data += s;
}

StringBuffer.prototype.writeln = function (s) {
    this.write(s);
    this.write('\n');
}

StringBuffer.prototype.toString = function () {
    return this.data;
}

//------------------------------------------------------------------------------ 

function JSElement(start, end, classes) {
    this.start = start;
    this.end = end;
    this.classes = classes !== undefined ? classes : [];
    this.contained = [];
}

JSElement.prototype.before = function (other) {
    return this.end <= other.start;
}

JSElement.prototype.within = function (other) {
    console.log("other " + other);
    return this.start >= other.start && this.end <= other.end;
}

JSElement.prototype.after = function (other) {
    return this.start >= other.end;
}

JSElement.prototype.contains = function (other) {
    return other.within(this);
}

JSElement.prototype.toString = function () {
    return '(' + this.start + '-' + this.end + ')';
}

//------------------------------------------------------------------------------ 

function Stack() {
    this.data = [];
}

Stack.prototype.peek = function () {
    return this.data[this.data.length - 1];
};

Stack.prototype.push = function (val) {
    this.data.push(val);
};

Stack.prototype.pop = function () {
    this.data = this.data.slice(0, this.data.length - 1);
};

//------------------------------------------------------------------------------ 

function JS2HTML(jsText) {
    this.origJS = jsText;
    this.elements = [];
}

/**
 * Unflatten produces takes a flat list of [start,end] pairs and produces
 * a nested list suitable for tag generation.
 *
 * NB: this function modifies its input!
 */
JS2HTML.prototype.unflatten = function (indexList) {
    if (indexList === undefined || indexList.length === 0) {
        return [];
    }

    // Sort list by increasing start loc, then by decreasing end loc
    indexList.sort(function (a, b) {
        if (a.start === b.start) {
            return b.end - a.end;
        } else {
            return a.start - b.start;
        }
    });

    var toplevel = new JSElement(indexList[0].start, this.origJS.length);
    var stack = new Stack();
    stack.push(toplevel);

    for (var i = 0; i < indexList.length; i++) {
        var e = indexList[i];
        while (!e.within(stack.peek())) {
            console.log("PEEK " + stack.peek());
            stack.pop();
            console.log("stack " + stack);
        }
        stack.peek().contained.push(e);
        stack.push(e);
    }

    return toplevel.contained;
}

JS2HTML.prototype._insertTags = function (start, end, elements, sb) {
    var prevLoc = start;
    for (var i = 0; i < elements.length; i++) {
        var e = elements[i];
        var id = 'loc' + e.start + '_' + e.end;
        sb.write(this.origJS.substring(prevLoc, e.start));        
        sb.write('<span id="' + id + '" class="' + e.classes.join(' ') + '">');
        if (e.contained) {
            this._insertTags(e.start, e.end, e.contained, sb);
        } else {
            sb.write(this.origJS.substring(e.start, e.end));
        }
        sb.write('</span>');
        prevLoc = e.end;
    }
    sb.write(this.origJS.substring(prevLoc, end));
}

JS2HTML.prototype.insertTags = function (elements) {
    var out = new StringBuffer();
    this._insertTags(0, this.origJS.length, this.unflatten(elements), out);
    return out.toString();
}

// test it
//var orig_js = fs.readFileSync('foo.js').toString('ascii');

function element(start, end) {
    var classes = [];
    for (var i = 2; i < arguments.length; i++) {
        classes.push(arguments[i]);
    }
    return new JSElement(start, end, classes);
}


function contains(arr, val){
  for(var i = 0; i < arr.length; i++){
    if(arr[i] === val)
      return true;
  }
  return false;

}
function genHtmlWithTags(orig_js, elements){

  var js_elements = [], visited = [];

    for(var i = 0; i < elements.length; i++ ){
      for(var j = i + 1; j < elements.length; j++){

        if(elements[i].start === elements[j].start && elements[i].end === elements[j].end && !contains(visited, j)){  
          elements[i].kind.push(elements[j].kind);
          visited.push(j);
        }
      }
      if(!contains(visited, i))
        js_elements.push(new JSElement(
          elements[i].start,
          elements[i].end,
          elements[i].kind
        ));

    }

  var js2html = new JS2HTML(orig_js);

  return js2html.insertTags(js_elements);
 

}

exports.genHtmlWithTags = genHtmlWithTags;

