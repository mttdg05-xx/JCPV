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
    //var target_path = [];
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
    response.writeHead(200, {
        "Content-Type": "text/html"
    });
    response.write(
        '<html>' + '<head>' +
                              '<link href=/include/prettify/prettify.css type="text/css" rel="stylesheet" />'  + 
                              '<link href=/include/css/index.css type="text/css" rel="stylesheet" />'          +
                              '<link href=/include/public/css/visu.css type="text/css" rel="stylesheet" />'    + 
                              '<script type="text/javascript" src=/include/prettify/prettify.js></script>'     + 
                              '<script type="text/javascript" src=/include/jquery-1.7.1.min.js></script>'      + 
                              '<script type="text/javascript" src=/include/jscolor/jscolor.js></script>'       + 
                              '<script type="text/javascript" src=/include/public/script/mapping.js></script>' +
                              '<script type="text/javascript" src=/include/public/script/visu.js></script>'    +
                              '<script type="text/javascript" src=/include/public/script/utils.js></script>'    + 
                              '<script type="text/javascript" src=/include/jquery.jstree.js></script>'         + 
                              '<script type="text/javascript" src=/include/json2.js></script>'                 +     
                   '</head>' + 
                   '<body>' +
                              '<div id = "wrapper">' +
                                    '<div id = "labels_attributes">'+
                                        '<div id = "labels">'+
                                        '</div>'+
					'<div id = "attributes">' +
                                        '</div>' +
                                    '</div>' +
                                        '<br/>' +
	                                '<span id = "color_buttons">' +
                                          '<form>' +
                                          '<label> Min : </label> <input id = "min_color" class="color" value="00FF00"/>' +
                                          '<label> Max : </label> <input id = "max_color" class="color" value="FF0000"/>' +
                                          '</ form>' +
                                        '</span>' +
                              '</div>' + 
					  
			      '</div>'+
                                  '<div id = "demo1" class = "left_box">' + 
                                  '</div>' + 
                                '<pre class = "prettyprint">' + 
                                  '<div id = "me" class = "right_box"> </div>' + 
                                '</pre>' + 

                              '<script>' +
                                          'function checkOptionsSelected(){' +
                                            'var options = document.getElementsByTagName("option");'+
                                            'for(var i = 0; i < options.length; i++){' +
                                              'if(options[i].selected && options[i].text === "color"){'+
                                                '$("#color_buttons").show();'+
                                                'return;'+
                                              '}' +
                                            '}' +
                                            '$("#color_buttons").hide();'+
                                          '}'+
                                          '$(document).ready(function(){' + 
                                            'var options, length, target_path, option_selected, metric, timp, button, button_title, label, label_title, select, opt, loc_id, locs_id = [], attributes_selected_names = [];' +
                                            'var attributes_selected_values = [], json_values = [], up_dat = ""; var file_selected, up_json;' + 
                                          '$("#demo1").jstree(' + ' {' + '  "json_data" : {' + '   "data" : [' +
                                           JSON.stringify(result) +
                                          ']' + '},' +
                                          '"plugins" : [ "themes", "json_data", "ui" ]' +
                                          '}' + ').bind("select_node.jstree",' + 
                                          'function(event, data){' + 
                                               '$.get(data.rslt.obj.data("id"),' + 
                                                     'function(dat){' + 
                                                          '$("#me").html(dat);' +
                                                          'up_dat = dat;' + 
                                                          'file_selected = data.rslt.obj.data("id").split("=")[1];' +
                                                          'prettyPrint();});   });' +
                                          '$.get("/updata?id=-1").complete(function(up_json_def){'+
                                            'json_definitions = JSON.parse(up_json_def.responseText);'+
                                            //'alert(json_definitions);'+
                                          //'up_json =' + json_file + ';'+
                                          'up_json =' + get_up_json_file() + ';'+

                                          'if(up_json !== undefined){'+
                                          'target_path = ' + JSON.stringify(target_path) + ';' +
                                          'options = createOptions(json_definitions);' +
                                          'for(var i = 0; i < options.data.length; i++){'+
                                            'tmp = options.data[i];' +
                                            'select = document.createElement("SELECT");'+
                                            'select.onchange=checkOptionsSelected;' +
                                            'label_title = document.createTextNode(tmp.metric_def.metric);' +
                                            'label = document.createElement("LABEL");' + 
                                            'label.appendChild(label_title);' + 
                                            'opt = document.createElement("OPTION");'+
                                            'opt.innerText = "Attributes";'+
                                            'opt.value = "0";'+
                                            'select.appendChild(opt);' +
                                            'for(var j = 0; j < tmp.attributes.length; j++){' +
                                              'opt = document.createElement("OPTION");'+
                                              'opt.innerText = tmp.attributes[j].name;'+
                                              'opt.value = tmp.attributes[j].id;'+
                                            
                                              'select.appendChild(opt);' +
                                            '}' +
                                            'document.getElementById("attributes").appendChild(document.createElement("br"));' +
                                            'document.getElementById("labels").appendChild(document.createElement("br"));' +
                                            'document.getElementById("labels").appendChild(label);'+
                                            'document.getElementById("attributes").appendChild(select);'+
                                          '}'+
                                          'button = document.createElement("BUTTON");' +
                                          'button_title = document.createTextNode("Set attributes");'+
                                          'button.appendChild(button_title);' +                                        
                                          'document.getElementById("attributes").appendChild(document.createElement("br"));' +
                                          'document.getElementById("attributes").appendChild(button);'+
                                          '$("button:first").click(function(){' +
                                            'locs_id = [];'+
                                            'attributes_selected_names = [];'+    
                                            'attributes_selected_values = [];'+
                                            'json_values = [];'+
                                             
                                                      'selects_number = $("#attributes  option:selected").length;' +
                                                      '$("#me").html(up_dat);' +
                                                      'prettyPrint();' +
                                                      'for(var k = 0; k < selects_number; k++){' +      
                                                        
                                                        'option_selected = parseInt($("#attributes option:selected")[k].value);' +
                                                  
                                                        'if(option_selected !== 0){' + 
                                                        'metric = get_metric(option_selected);' +                                 
                                                        'jQuery.ajax({'+
                                                          'url : "utils/fetch_json_info?file_selected=" + file_selected + "&metric=" + metric,'+
                                                          'complete : function(data){'+
                                                            'json_data = JSON.parse(data.responseText);' + 
                                                            'for(var i = 0; i < json_data.length; i++){'+
                                                              'locs_id.push(json_data[i].loc_id);' +
                                                              'attributes_selected_names.push($("#attributes option:selected")[k].text);' +
                                                              'attributes_selected_values.push(parseInt($("#attributes option:selected")[k].value));'+
                                                              'json_values.push(json_data[i].value);'+
                                                              '}'+                                                
                                                            '},'+
                                                          'async : false'+
                                                          '});'+
                                                        '}'+
                                                      '}'+

                                                      'if(conflicting_choices(locs_id, attributes_selected_names))'+
                                                         'alert("The same element can\'t be colored twice!");'+
                                                      'else{'+
                                                        'for(var k = 0; k < locs_id.length; k ++){'+
                                                          'if(attributes_selected_names[k] === "color")'+
                                                            'set_mapping(attributes_selected_values[k], json_values[k], locs_id[k], $("#min_color").val(), $("#max_color").val());' +
                                                          'else '+
                                                            'set_mapping(attributes_selected_values[k], json_values[k], locs_id[k]);' +                                                          
                                                        '}'+
                                                      '}'+
                                                      '});'+
                                                '}' +
                                                '});'+
                                            '});'+
                              '</script>' + 
                   '</body>' +  
        '</html>');
    response.end();
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
          return;
        }
        return fs.readFileSync(path.resolve(argv[i]), "binary");       
      }
  }
}

function get_up_json_def(){
  return JSON.parse(get_up_json_file()).definitions; 
}

function utils(){

  return {

    fetch_json_info : function(response, request, url){
      //file_selected & metric get it!
      // Ex url : file_selected=3&metric=coverage
      var file_selected = url.split("&")[0].split("=")[1];
      var metric = url.split("&")[1].split("=")[1];
      console.log("metric " + metric + "fie " + target_path[file_selected]);

    var mapping = [],
        tmp, loc_id, json_obj = JSON.parse(json_file);
    for(var i = 0; i < json_obj.data.length; i++ ){
       tmp = json_obj.data[i];
      if(tmp.target_path === target_path[file_selected]){ 
         for(var j = 0; j < tmp.info.length; j++){ 
           if(tmp.info[j].metric === metric){ 
             loc_id = "loc" + tmp.from + "_" + tmp.to; 
            mapping.push({
               value : tmp.info[j].value,
              loc_id : loc_id 
            });

          }                                    
        }
      }
                                                        
    }
 response.writeHead(200, {

   "Content-Type": "application/json"

   });
   response.write(JSON.stringify(mapping));
   response.end();
  console.log(JSON.stringify(mapping));
    //return mapping;
  }
      
  }
}

function loadFile() {

  var tagged_updata_files = [],
      filename, tmp, json_object, length, include_files = [];//, elements = [];
  
  function load_err(response, error){
      var elements = [];
      
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
      
      
        if(id===-1){
           response.writeHead(200, {
                  "Content-Type": "application/json"
                });
              response.write(JSON.stringify(get_up_json_def()));
              response.end();
        }

        else if(tagged_updata_files[id] === undefined){
          filename = up_data[id].replace(/^.*[\\\/]/, '');
          fs.readFile(up_data[id], "binary", function(error, file) {
            if (error)  load_err(response, error);

            else{
              elements = [];

              if(json_file !== undefined){
                json_object = JSON.parse(json_file).data;
                length = json_object.length;

                for(var i = 0; i < length; i++ ){
                  tmp = json_object[i]; 
                  if(lookup(path.relative(rootPath, tmp.target_path)) === path.normalize(up_data[id])){
                    for(var j = tmp.info.length - 1; j >= 0; j--){

                      if( tmp.info[j].metric === 'reference'){
                          for(var k = 0; k < tmp.info[j].value.length; k++){
                            elements.push({
                              start : tmp.info[j].value[k][0],
                              end : tmp.info[j].value[k][1],
                              kind : ["target_reference"]
                            });
                          }
                          elements.push({
                            start : tmp.from,
                            end : tmp.to,
                            kind : ["source_reference"]
                          });
                      }

                      else{
                        elements.push({
                          start : tmp.from,
                          end : tmp.to,
                          kind : [tmp.info[j].metric]
                        });
                      }
                  
                    }
                    
                  }
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
