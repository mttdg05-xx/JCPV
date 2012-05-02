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
    json_file = undefined,
    path = require("path"),
    taggen = require("./taggen"),
    target_path = [];
  
  
function start(response, request) {
    var result = [];
    var itemList = [];
    var tmp;

    for(var i = 0; i < argv.length; i++){
      argv[i] = path.relative(rootPath, argv[i]);
    }

    for(var i = 0; i < argv.length; i++){
      if(argv[i] === "--json"){
        i++;
        if(i >= argv.length){
          console.log("No json file given.");
          return;
        }
        json_file = fs.readFileSync(path.resolve(argv[i]), "binary");       
      }
      else itemList.push(argv[i]);
    }
   
    get_json(itemList, result);

    for(var i = 0; i < up_data.length; i++){

      tmp = up_data[i].split(rootPath + "/")[1];
      for( var k = 0; k < argv.length; k++){        
        if(tmp.split(argv[k] + "/").length === 2 )
          target_path[i] = tmp.split(argv[k] + "/")[1];
      }
    }
    fs.readFile(rootPath + "/include/public/html/index.html", function(err, data){
      if(err){
        response.writeHead(200, {
          "Content-Type": "text/plain"
        });
        response.write(err);                                   
        response.end();

      }
      else{
        response.writeHead(200, {
          "Content-Type": "text/html"
        });
        response.write(data);                                   
        response.end();
      }
    });
}


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

            current =  (currentPath + "/" + item[i]).substring(rootPath.length, (currentPath + "/" + item[i]).length);
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
        to_json(next, files, rootPath, path.relative(rootPath, itemList[k]), temp_result);
        result.push(temp_result);
    }
    up_data = files;
}

function lookup(filename) {
  var candidate;
  for(var i = 0; i < argv.length; i++) {
    candidate = path.resolve(argv[i], filename);
    if (path.existsSync(candidate)){
      return candidate;
    }
  }
  return undefined;
}

function get_up_json_file(){
 for(var i = 0; i < argv.length; i++){
      if(argv[i] === "--json"){
        i++;
        if(i >= argv.length){
          console.log("No json file given.");
          return undefined;
        }
        return fs.readFileSync(path.resolve(argv[i]), "binary");       
      }
  }
 return undefined;
}

function get_up_json_def(){
  var json = get_up_json_file();
  return json !== undefined ? JSON.parse(json).definitions : undefined;
}

function utils(){
  var mappings = [];

  function get_reference_parents(child_from, child_to, file_selected, json_obj){
    var tmp, from, to, parents = [];
    for( var i = 0; i < json_obj.data.length; i++){
      tmp = json_obj.data[i];
      if(tmp.target_path === target_path[file_selected]){ 
        for(var j = 0; j < tmp.info.length; j++){ 
          if(tmp.info[j].metric === "reference" && ( child_from !== tmp.from || child_to !== tmp.to)){ 
            for(var k = 0; k < tmp.info[j].value.length; k++){
              from = tmp.info[j].value[k][0];
              to =  tmp.info[j].value[k][1];
              if(child_from === from && child_to === to)
                parents.push([tmp.from, tmp.to]);
            }
        }
        }


      }

    }
    return parents;


  }

  return {
    fetch_json_info : function(response, request, url){
      if( mappings[url] !== undefined){
        response.writeHead(200, {
          "Content-Type": "application/json"
        });
        response.write(JSON.stringify(mappings[url]));
        response.end();
      }
      else{

        var file_selected = url.split("&")[0].split("=")[1];
        var metric = url.split("&")[1].split("=")[1];
        var tmp, loc_id, json_obj = JSON.parse(json_file), mapping = [];
        var parents = [];
        for(var i = 0; i < json_obj.data.length; i++ ){
          tmp = json_obj.data[i];
          if(tmp.target_path === target_path[file_selected]){ 
            for(var j = 0; j < tmp.info.length; j++){ 
              if(tmp.info[j].metric === metric){
                parents = get_reference_parents(tmp.from, tmp.to, file_selected, json_obj);
                loc_id = "loc" + tmp.from + "_" + tmp.to; 
                if(parents.length === 0){
                  mapping.push({
                    value : tmp.info[j].value,
                    loc_id : loc_id 
                  });
                }
                else{
                  mapping.push({
                    value : tmp.info[j].value,
                    loc_id : loc_id,
                    parents : parents
                  });
                }
              }                                    
            }
          }                                             
        }
        response.writeHead(200, {
          "Content-Type": "application/json"
        });
        response.write(JSON.stringify(mapping));
        response.end();
        mappings[url] = mapping;
      }  
    },

    fetch_tree_struct : function(response, request){
      var result = [];
      var itemList = [];
      for(var i = 0; i < argv.length; i++){
        if(argv[i] === "--json") i++;
        else itemList.push(argv[i]);
      }
      get_json(itemList, result);
      response.writeHead(200, {
        "Content-Type": "application/json"
      });
      response.write(JSON.stringify(result));
      response.end();
    }
  }
}

function loadFile() {

  var tagged_updata_files = [],
      filename, tmp, length, include_files = [];
  
  function load_err(response, error){
    response.writeHead(200, {
      "Content-Type": "text/plain"
    });
    response.write("Error while trying to read the file.\n" + error + "\n");
    response.end();

  }


  return {
    load_include: function(response, request, pathname, content_type){
      if(include_files[pathname] === undefined){
        fs.readFile(rootPath + pathname, "binary", function(error, file){
          if (error)  load_err(response, error);
          else{
            response.writeHead(200, {
            "Content-Type": content_type
            });

          response.write(file, "binary");
          response.end();
          include_files[pathname] = file;
          }
        });
      }
      else{
        response.write(include_files[pathname], "binary");
        response.end();
      }
                
    },

    load_up_data: function(response, request, id){
      if( id === -1){
        var json = get_up_json_def();
        var answer = json !== undefined ? JSON.stringify(json) : "undefined";
        response.writeHead(200, {
          "Content-Type": "application/json"
        });
          response.write(answer);
          response.end();
        }

        else if(tagged_updata_files[id] === undefined){
          filename = up_data[id].replace(/^.*[\\\/]/, '');
          fs.readFile(up_data[id], "binary", function(error, file) {
            if (error)  load_err(response, error);
            else {
             
              tagged_updata_files[id] = taggen.tagify(file, filename);
              response.writeHead(200, {
                "Content-Type": "text/html"
              });
              response.write(tagged_updata_files[id], "binary");
              response.end();
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
exports.utils = utils;
