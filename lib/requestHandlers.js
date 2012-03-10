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
    taggen = require("./taggen");
  
  

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
                              '<link href=/include/css/index.css type="text/css" rel="stylesheet" />'       + 
                              '<script type="text/javascript" src=/include/prettify/prettify.js></script>'    + 
                              '<script type="text/javascript" src=/include/jquery-1.7.1.min.js></script>'     + 
                              //'<script type="text/javascript" src=/include/lib/test.js></script>'                     + 
                              '<script type="text/javascript" src=/include/jquery.jstree.js></script>'        + 
                              '<script type="text/javascript" src=/include/json2.js></script>'                +     
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
                                                          'var node_selected_name = data.rslt.obj.data("id").replace(/^.*[\\\/]/, "");' + 
                                                          'prettyPrint();});   });' +
                                          '});' +
                              '</script>' + 
    
                              ' <div id = "wrapper">' + '<div id = "demo1" class = "left_box">' + '</div>' + 
                              '<pre class = "prettyprint"> <div id = "me" class = "right_box"> </div> </pre>' + '</div>' +

                   '</body>' +

        '</html>');



    response.end();


}


// itemList contains relative paths
function to_json(next, files, currentPath, itemList, result) {
   currentPath = currentPath + "/" + itemList;
    var children = [],
        js_ext = ".js",
        length, current, item_name, item, stat = fs.statSync(currentPath);
        
    if (stat && !stat.isDirectory()) {      
        current =  currentPath.substring(rootPath.length, currentPath.length)
        length = current.length;
        item_name = "" + currentPath.replace(/^.*[\\\/]/, '');

        if (current.substring(length - 3, length) === js_ext) {
            files.push(rootPath + currentPath);
            result.push({
                data: {
                    title: item_name,
                    icon: "/include/img/file.png"
                },
                metadata: {
                    id: "/updata?id=" + next.id++
                }

            }
            );
        }
    }

    else {
        item = fs.readdirSync(currentPath);
        for (var i = 0; i < item.length; i++) {

            current =  (currentPath + "/" + item[i]).substring(rootPath.length, (currentPath + "/" + item[i]).length)
            item_name = "" + item[i];
            stat = fs.statSync(currentPath + "/" + item[i]);

            if (stat && stat.isDirectory()) {
                children = [];
                to_json(next, files, currentPath, item[i], children);
                result.push({
                    data: {
                        title: item_name
                    },
                    children: children,
                    metadata: {
                        //id:  next.id++
                    },
                });
            }

            else {

                length = current.length;
                if (current.substring(length - 3, length) === js_ext) {
                    files.push(rootPath + current);
                    result.push({
                        data: {
                            title: item_name,
                            icon: "/include/img/file.png"
                        },
                        metadata: {
                            id:  "/updata?id=" + next.id++
                        }
                    }
                    );
                }
            }
        }

    }
}

// ItemList contains the set of relative paths
var up_data = [];
function get_json(itemList, result) {
    var temp_result = [];
    var next = {id : 0};
    var files = [];
    for (k in itemList) {
        to_json(next, files, rootPath, itemList[k], temp_result);
        result.push(temp_result);
    }
    up_data = files;
}


function loadFile() {

/*
  var loaded_include_files = [];
  loaded_include_files[0] =  fs.readFileSync(rootPath + '/include/prettify/prettify.css'); 
  loaded_include_files[1] =  fs.readFileSync(rootPath + '/include/myCss/index.css)';
  loaded_include_files[2] =  fs.readFileSync(rootPath + '/include/prettify/prettify.js'); 
  loaded_include_files[3] =  fs.readFileSync(rootPath + '/include/jquery-1.7.1.min.js');
  loaded_include_files[4] =  fs.readFileSync(rootPath + '/include/lib/test.js'); 
  loaded_include_files[5] =  fs.readFileSync(rootPath + '/include/jquery.jstree.js');
  loaded_include_files[6] =  fs.readFileSync(rootPath + '/include/json2.js');              
*/
  var tagged_updata_files = [];
  var filename, tmp, json_object, length, elements = [];
  function load_err(response, error){

      response.writeHead(500, {

        "Content-Type": "text/plain"

        });

      response.write(error + "\n");
      response.end();

      }

    return {
      load_include: function(response, request, pathname, content_type){
        fs.readFile(rootPath + pathname, "binary", function(error, file){

          if (error)  load_err(response, error);
          else{
            response.writeHead(200, {
            "Content-Type": content_type
            });

          response.write(file, "binary");
          response.end();

          }

           
        });
                
      },

      load_up_data: function(response, request, id){

        if(tagged_updata_files[id] === undefined){
          filename = up_data[id].replace(/^.*[\\\/]/, '');
          fs.readFile(up_data[id], "binary", function(error, file) {
            if (error)  load_err(response, error);

            else{

              fs.readFile(rootPath + '/include/test.json', "binary", function(err, json_file){
              if (error)  load_err(response, error);
              else{
                json_object = JSON.parse(json_file).data;
                length = json_object.length;
                for(var i = 0; i < length; i++ ){
                  tmp = json_object[i];
                  if(rootPath + "/" + tmp.target_path === up_data[id]){
                    elements.push({
                      start : tmp.start,
                      end : tmp.end,
                      kind : ["test"],
                      value : tmp.value
                    });
                  }
                }
      
                tagged_updata_files[id] = taggen.tagify(file, filename, elements);
                response.writeHead(200, {
                  "Content-Type": "text/html"
                });
              response.write(tagged_updata_files[id], "binary");
              response.end();
              }
            });

            }
          });
          
        } else{

          response.writeHead(200, {
            "Content-Type": "text/html"
            });
          response.write(tagged_updata_files[id], "binary");
          response.end();
        
        }
        
      }

    }
}






exports.start = start;
exports.loadFile = loadFile;
