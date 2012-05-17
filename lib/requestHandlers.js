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
    rootPath = process.cwd(),
    url = require("url"),
    path = require("path"),
    taggen = require("./taggen"),
    jsonUtils = require("./jsonUtils"),
    uploadedFiles = require("./uploadedFiles");



function init() {
    uploadedFiles.init();
}


function start(response, request) {
    init();
    fs.readFile(rootPath + "/include/public/html/index.html", function(err, data) {
        if (err) {
            response.writeHead(200, {
                "Content-Type": "text/plain"
            });
            response.write(err);
            response.end();
        }
        else {
            response.writeHead(200, {
                "Content-Type": "text/html"
            });
            response.write(data);
            response.end();
        }
    });
}

function reload(response, request){
  fs.readFile(rootPath + "/include/public/html/index.html", function(err, data) {
    if (err) {
      response.writeHead(200, {
        "Content-Type": "text/plain"
      });
      response.write(err);
      response.end();
    }
    else {
      response.writeHead(200, {
        "Content-Type": "text/html"
      });
      response.write(data);
      response.end();
    }
  });

}




function utils() {
    var mappings = [];

    return {

        /* Get the json information that we have about a file.
          Ex url : file_selected=3&metric=reference
          Since we have the same response for the same url at any time,
          we store the response in mappings.
        */
        fetch_json_info: function(response, request, url) {

            // We know this url! => same response.
            if (mappings[url] !== undefined) {
                response.writeHead(200, {
                    "Content-Type": "application/json"
                });
                response.write(JSON.stringify(mappings[url]));
                response.end();
            }
            else {
                var tmp, loc_id, file_selected = url.split("&")[0].split("=")[1],
                    file_selected_path = uploadedFiles.get_relative_paths()[file_selected],
                    metric = url.split("&")[1].split("=")[1],
                    json_obj = JSON.parse(uploadedFiles.get_json_file()),
                    mapping = [],
                    parents = [];

                for (var i = 0; i < json_obj.data.length; i++) {
                    tmp = json_obj.data[i];
                    if (uploadedFiles.lookup(tmp.target_path) === uploadedFiles.lookup(file_selected_path)) {
                        for (var j = 0; j < tmp.info.length; j++) {
                            loc_id = "loc" + tmp.from + "_" + tmp.to;
                            // if the metric is reference then we we want to have all the parents of a child
                            // in order to ease the mapping.
                            if (tmp.info[j].metric === metric && metric === "reference") {
                                parents = jsonUtils.get_reference_parents(tmp.from, tmp.to, file_selected_path, json_obj);
                                mapping.push({
                                    value: tmp.info[j].value,
                                    loc_id: loc_id,
                                    parents: parents
                                });
                            }
                            // if the metric is execcount then we'll have to find the min & max value
                            // so that we can convert value to a percent.
                            else if (tmp.info[j].metric === metric && metric === "execcount") {
                                var min = jsonUtils.get_execcount_min_max(file_selected_path, json_obj).min;
                                var max = jsonUtils.get_execcount_min_max(file_selected_path, json_obj).max;
                                mapping.push({
                                    value: tmp.info[j].value,
                                    loc_id: loc_id,
                                    min: min,
                                    max: max
                                });
                            }
                            // no special treatment.
                            else if (tmp.info[j].metric === metric) {
                                mapping.push({
                                    value: tmp.info[j].value,
                                    loc_id: loc_id
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
                mappings[url] = mapping;
            }
        },

        // the tree structure of all the files/folders uploaded.
        // jstree need this.
        fetch_tree_struct: function(response, request) {
            var result = [];
            result = uploadedFiles.get_tree_struct();
            response.writeHead(200, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(result));
            response.end();
        }
    }
}


function load_err(response, error) {
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    response.write("Error while trying to read the file.\n" + error + "\n");
    response.end();

}

function loadFile() {

    var tagged_updata_files = [],
        filename, tmp, length, include_files = [];




    return {

        // All the urls beginning by /include/
        // We store all the responses because for the 
        // same url we have the same reponse.
        load_include: function(response, request, pathname, content_type) {

            // Let's meet!
            if (include_files[pathname] === undefined) {
                fs.readFile(rootPath + pathname, "binary", function(error, file) {
                    if (error) load_err(response, error);
                    else {
                        response.writeHead(200, {
                            "Content-Type": content_type
                        });

                        response.write(file, "binary");
                        response.end();
                        include_files[pathname] = file;
                    }
                });
            }
            // same url => same response.
            else {
                response.write(include_files[pathname], "binary");
                response.end();
            }

        },

        // all the urls beginning with updata
        // same policy as above.
        load_up_data: function(response, request, id) {

            // -1 is to get the json definition
            if (id === -1) {
                var json_def = uploadedFiles.get_json_definitions();
                var answer = json_def !== undefined ? JSON.stringify(json_def) : "undefined";
                response.writeHead(200, {
                    "Content-Type": "application/json"
                });
                response.write(answer);
                response.end();
            }

            else if (tagged_updata_files[id] === undefined) {
                filename = uploadedFiles.get_absolute_paths()[id];
                fs.readFile(filename, "binary", function(error, file) {
                    if (error) load_err(response, error);
                    else {

                        // we add tag to all the js files.
                        tagged_updata_files[id] = taggen.tagify(file, filename);
                        response.writeHead(200, {
                            "Content-Type": "text/html"
                        });
                        response.write(tagged_updata_files[id], "binary");
                        response.end();
                    }
                });

            } else {
                console.log("loading");
                response.writeHead(200, {
                    "Content-Type": "text/html"
                });
                response.write(tagged_updata_files[id], "binary");
                response.end();
            }
        }
    }
}


function getFaviconIco(response) {
    fs.readFile(rootPath + "/include/img/favicon.ico", function(err, favicon) {
        if (err) {
            console.log("ERRR");
        }
        else {
            response.writeHead(200, {
                "Content-Type": "image/x-icon"
            });

            response.write(favicon);
            response.end();
        }
    });


}

exports.start = start;
exports.reload = reload;
exports.loadFile = loadFile;
exports.utils = utils;
exports.getFaviconIco = getFaviconIco;
