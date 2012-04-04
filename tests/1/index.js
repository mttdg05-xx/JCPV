var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var handle = {};
var currentDirectory = process.cwd();


handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;


handle[currentDirectory + "/prettify/prettify.js"] = requestHandlers.loadFile;
handle[currentDirectory + "/prettify/prettify.css"] = requestHandlers.loadFile;
handle[currentDirectory + "/_lib/jquery-1.7.1.min.js"] = requestHandlers.loadFile;
handle[currentDirectory + "/test.js"] = requestHandlers.loadFile;
handle[currentDirectory + "/jquery.jstree.js"] = requestHandlers.loadFile;
handle[currentDirectory + "/json2.js"] = requestHandlers.loadFile;
handle[currentDirectory + "/myCss/index.css"] = requestHandlers.loadFile;
handle[currentDirectory + "/themes/default/style.css"] = requestHandlers.loadFile;
handle[currentDirectory + "/themes/default/d.png"] = requestHandlers.loadFile;
handle[currentDirectory + "/img/file.png"] = requestHandlers.loadFile;
server.start(router.route, handle);

