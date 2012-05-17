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



var http = require("http");
var url = require("url");
var requestHandlers = require("./requestHandlers");

function start() {

    var loadFile = requestHandlers.loadFile();
    var utils = requestHandlers.utils();
    var pathname, tmp, file_ext, query_id;
    var already_started = false;

    function onRequest(request, response) {

        pathname = url.parse(request.url).pathname;

        if ("/" === pathname && !already_started) {
            console.log("Request for " + request.url + " received.");
            requestHandlers.start(response, request);
            already_started = true;
        }
        else if ("/" === pathname && already_started){
            console.log("Request for " + request.url + " received."); 
            requestHandlers.reload(response, request);


        }

        // Ex : pathname = /include/css/index.css
        else if (pathname.substring(0, 9) === "/include/") {
            console.log("Request for " + request.url + " received.");
            tmp = pathname.split(".");
            file_ext = tmp[tmp.length - 1];
            loadFile.load_include(response, request, pathname, get_content_type(file_ext));

        }

        // Ex : pathname = /updata?id=5
        // if id = -1 then we want the json definition.
        else if (pathname.substring(0, 7) === "/updata") {
            // Ex : query_id = "id=5"
            query_id = parseFloat(url.parse(request.url).query.slice(3));
            console.log("Request for " + request.url + " received.");
            loadFile.load_up_data(response, request, query_id);
        }


        else if (pathname.substring(0, 7) === "/utils/") {

            // Ex : /utils/fetch_json_info?file_selected=3&metric=reference
            if (pathname.split("/utils/")[1] === "fetch_json_info") utils.fetch_json_info(response, request, url.parse(request.url).query);
            // Ex : /utils/fetch_tree_struct
            else if (pathname.split("/utils/")[1] === "fetch_tree_struct") utils.fetch_tree_struct(response, request);

            console.log("Request for " + request.url + " received.");

        }

        else if (request.url === "/favicon.ico") {
            console.log("Request for /favicon.ico received.");
            requestHandlers.getFaviconIco(response);

        }
        else {
            console.log("Unknow incoming request : " + request.url);

        }

    }


    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
    console.log("Listen to port 8888");
}

function get_content_type(file_ext) {
    switch (file_ext) {
    case "js":
        return "application/javascript";
    case "json":
        return "application/json";
    case "css":
        return "text/css";
    case "html":
        return "text/html";
    case "gif":
        return "image/gif";
    case "png":
        return "image/png";
    case ("jpeg" || "jpg" || "jpe"):
        return "image/jpeg";
    default:
        return "text/plain";

    }


}

exports.start = start;
