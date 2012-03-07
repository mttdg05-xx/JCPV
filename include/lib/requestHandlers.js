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




var fs = require("fs"),
    formidable = require("formidable"),
    rootPath = process.cwd(),
    url = require("url"),
    argv = process.argv.splice(2),
    taggen = require("./../taggen"),
    htmlgen = require("./../htmlgen");
    //$ = require("jquery");
    //js2js = require("js2js");

function start(response, request) {
    var result = [];
    var itemList = argv;

    
    get_json(itemList, result);

    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    response.write(
        '<html>' + '<head>' +
                              '<link href=/include/prettify/prettify.css type="text/css" rel="stylesheet" />' + 
                              '<link href=/include/myCss/index.css type="text/css" rel="stylesheet" />'       + 
                              '<script type="text/javascript" src=/include/prettify/prettify.js></script>'    + 
                              '<script type="text/javascript" src=/include/jquery-1.7.1.min.js></script>'     + 
                              '<script type="text/javascript" src=/include/lib/test.js></script>'                     + 
                              '<script type="text/javascript" src=/include/jquery.jstree.js></script>'        + 
                              '<script type="text/javascript" src=/include/json2.js></script>'                +     
                              //'<script type="text/javascript" src=' + currentPath + '/lib/requestHandlers.js> </script>'         + 
                              //'<script type="text/javascript" src=/taggen.js> </script>'                      + 
                              //'<script type="text/javascript" src=/htmlgen.js> </script>'                     + 
                              //'<script type="text/javascript" src=/node_modules/js2js/lib/js2js-lib.js> </script>'+
                              //'<script type="text/javascript" src=/node_modules/js2js/lib/my_js2js.js> </script>'+

                   '</head>' + 
                   '<body onload=" ">' + 
                              '<script>' +
                                          '$(document).ready(function(){' + 
                                          '$("#demo1").jstree(' + ' {' + '  "json_data" : {' + '   "data" : [' +
                                           JSON.stringify(result) +
                                          ']' + '},' +
                                          '"plugins" : [ "themes", "json_data", "ui" ]' +
                                          '}' + ').bind("select_node.jstree",' + 
                                          'function(event, data){' + 
                                               '$.get(data.rslt.obj.data("id"),' + 
                                                     'function(dat){ $("#me").html(dat);' + 
                                                          'alert(data.rslt.obj.data("lo")); var node_selected_name = data.rslt.obj.data("id").replace(/^.*[\\\/]/, "");' + 
                                                          'var length = node_selected_name.length;' +
                                                          //'if(node_selected_name.substring(length - 3) === ".js") tagify(dat, node_selected_name);' + 
                                                          'prettyPrint();});   });' +
                                          '});' +
                              '</script>' + 
    
                              ' <div id = "wrapper">' + '<div id = "demo1" class = "left_box">' + '</div>' + 
                              '<pre class = "prettyprint"> <div id = "me" class = "right_box"> </div> </pre>' + '</div>' +

                   '</body>' +

        '</html>');


    response.end();


}





// check for errors 
// => if (errors) do something;
//


function doIt(){
  console.log('---------------------------');
  console.log( "" +document.getElementById("me").innerHTML);
  console.log('---------------------------');


} 

// itemList contains relative paths
function to_json(currentPath, itemList, result) {

    var children = [],
        itemPath = currentPath + "/" + itemList,
        js_ext = ".js",
        length, current, item_name, item, stat = fs.statSync(itemPath);

    if (stat && !stat.isDirectory()) {      
        current =  itemPath.substring(rootPath.length, itemPath.length)
        length = current.length;
        item_name = "" + itemPath.replace(/^.*[\\\/]/, '');

        if (current.substring(length - 3, length) === js_ext) {
            result.push({
                data: {
                    title: item_name,
                    icon: "/include/img/file.png"
                },
                metadata: {
                    id: current
                }

            }
            );
        }
    }

    else {
        currentPath = itemPath;
        item = fs.readdirSync(itemPath);
        for (var i = 0; i < item.length; i++) {

            current =  (itemPath + "/" + item[i]).substring(rootPath.length, (itemPath + "/" + item[i]).length)
            item_name = "" + item[i];
            stat = fs.statSync(itemPath + "/" + item[i]);

            if (stat && stat.isDirectory()) {
                children = [];
                to_json(currentPath, item[i], children);
                result.push({
                    data: {
                        title: item_name
                    },
                    children: children,
                    metadata: {
                        id:  current
                    },
                });
            }

            else {

                length = current.length;
                if (current.substring(length - 3, length) === js_ext) {
                    result.push({
                        data: {
                            title: item_name,
                            icon: "/include/img/file.png"
                        },
                        metadata: {
                            id:  current
                        }
                    }
                    );
                }
            }
        }

    }
}

// ItemList contains the set of relative paths
function get_json(itemList, result) {
    var temp_result = [];
    for (k in itemList) {
      var currentPath = rootPath;
        to_json(rootPath, itemList[k], temp_result);
        result.push(temp_result);
    }
}


var loadedFiles = [];
function loadFile(response, request) {

    var relative_path = url.parse(request.url).pathname;
    var abs_path = rootPath + relative_path;
    fs.readFile(abs_path, "binary", function(error, file) {
        if (error) {
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write(error + "\n");

            //response.end();
        } 
        else if(loadedFiles["'" + relative_path + "'"] !== undefined){
          response.writeHead(200, {
            "Content-Type": "text/html"

            });

          response.write(loadedFiles["'" + relative_path + "'"], "binary");
          console.log("Loaded@");

 
        }
                    
        else {


          if(relative_path.substring(0, 8) === "/include"){

            response.writeHead(200, {
            "Content-Type": "text/html"

            });

          response.write(file, "binary");
                   //response.end();
          }
          else{
            var filename = relative_path.replace(/^.*[\\\/]/, '');
            var tagged_file = taggen.tagify(file, filename);
            console.log('-------------------------------');
            console.log(tagged_file);
             response.writeHead(200, {
            "Content-Type": "text/html"

            });

          response.write(tagged_file, "binary");

        
          }
          loadedFiles["'" + relative_path + "'"] = file;
  //response.end();


        }

    
      response.end();

    });

}


exports.start = start;
exports.loadFile = loadFile;
