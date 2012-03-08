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

function start(){

  var loadFile = requestHandlers.loadFile();
  var query_id;

  function onRequest(request, response){

    var pathname = url.parse(request.url).pathname;
    console.log("!!!!!!!!!1" + pathname);
   

    if("/" === pathname) {
      console.log("Request for " + pathname + " received.");
      requestHandlers.start(response, request);
      }

    else  if(pathname.substring(0, 9) === "/include/") {
      console.log("Request for " + pathname + " received.");
      loadFile.load_include(response, request, pathname);

      }

    else if(pathname.substring(0, 7) === "/updata") {

      // Ex : query_id = "id=5"
      query_id = parseFloat(url.parse(request.url).query.slice(3));
      console.log("Request for " + url.parse(request.url).query + " received.");
      loadFile.load_up_data(response, request, query_id);
      }
    }

  
  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;
