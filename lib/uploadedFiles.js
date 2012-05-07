// Most of the operations that we need to deal with 
// the uploaded files are handled here.

var path = require("path"),
    rootPath = process.cwd(),
    fs = require("fs"),
    // contain the tree structure of the files/folders uploaded.
    tree_struct = [],
    // absolute paths of the uploaded files
    absolute_paths = [],
    // relative paths of the uploaded files
    relative_paths = [],
    // files/folders passed on the command line.
    itemList = [],
    argv = process.argv.splice(2),
    next = {
        id: 0
    };


function init() {

    var temp_result = [],
        temp;

    // all of the path(s) given in the command line
    // are converted to relative ones.
    for (var i = 0; i < argv.length; i++) {
        argv[i] = path.relative(rootPath, argv[i]);
    }


    for (var i = 0; i < argv.length; i++) {
        if (argv[i] === "--json") {
            i++;
        }
        else itemList.push(argv[i]);
    }

    for (var i = 0; i < itemList.length; i++) {
        to_json(next, absolute_paths, rootPath, path.relative(rootPath, itemList[i]), temp_result);
        tree_struct.push(temp_result);
    }


    for (var i = 0; i < absolute_paths.length; i++) {
        tmp = absolute_paths[i].split(rootPath + "/")[1];
        for (var k = 0; k < argv.length; k++) {
            if (tmp.split(argv[k] + "/").length === 2) {
                relative_paths[i] = tmp.split(argv[k] + "/")[1];
            }
        }
    }
}


/*
 * The files/folders uploaded are given a json structure.
 * When the operation is done ==>
 * absolute_paths will contain the absolute paths of all the files/folders uploaded,
 * result'll be an array of json object that jstree can use.
 * next is used as a counter.
 * All the inputs except argument_path are modified!
 */

function to_json(next, absolute_paths, currentPath, argument_path, result) {

    // update of the current path
    currentPath = currentPath + "/" + argument_path;

    var children = [],
        js_ext = ".js",
        length, current, item_name, item, stat = fs.statSync(currentPath);

    // not a directory. We'll push the item if it's a javascript file.
    // A javascript file for us is a file having "js" as an extension.
    if (stat && !stat.isDirectory()) {
        current = currentPath.substring(rootPath.length, currentPath.length)
        length = current.length;
        item_name = "" + currentPath.replace(/^.*[\\\/]/, '');

        if (current.substring(length - 3, length) === js_ext) {
            absolute_paths.push(rootPath + currentPath);
            result.push({
                data: {
                    title: item_name,
                    icon: "/include/img/file.png"
                },
                metadata: {
                    id: "/updata?id=" + next.id++
                }

            });
        }
    }

    // A directory. 
    else if (stat) {
        item = fs.readdirSync(currentPath);
        for (var i = 0; i < item.length; i++) {

            current = (currentPath + "/" + item[i]).substring(rootPath.length, (currentPath + "/" + item[i]).length);
            item_name = "" + item[i];
            stat = fs.statSync(currentPath + "/" + item[i]);

            // Subdirectory => recursion.
            if (stat && stat.isDirectory()) {
                children = [];
                to_json(next, absolute_paths, currentPath, item[i], children);
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

            // not a directory. We'll push the item if it's a javascript file.
            else if (stat) {
                length = current.length;
                if (current.substring(length - 3, length) === js_ext) {
                    absolute_paths.push(rootPath + current);
                    result.push({
                        data: {
                            title: item_name,
                            icon: "/include/img/file.png"
                        },
                        metadata: {
                            id: "/updata?id=" + next.id++
                        }
                    });
                }
            }
        }

    }
}




// Given a file_path, we want to know if there exist
// a valid absolute path resulting of the concatenation of one of the 
// path(s) given in the command line.


function lookup(file_path) {
    var candidate;
    for (var i = 0; i < argv.length; i++) {
        candidate = path.resolve(argv[i], file_path);
        if (path.existsSync(candidate)) {
            return candidate;
        }
    }
    return undefined;
}



function get_json_file() {
    for (var i = 0; i < argv.length; i++) {
        if (argv[i] === "--json") {
            i++;
            if (i >= argv.length) {
                console.log("Warning! '--json' means you should specify a json file.");
                return undefined;
            }
            return fs.readFileSync(path.resolve(argv[i]), "binary");
        }
    }
}

function get_json_definitions() {
  var json_file = get_json_file();
  return json_file !== undefined ? JSON.parse(get_json_file()).definitions : undefined;
}



/*
 * NB : All the below functions suppose that we have 
 * already called init.
 */

function get_absolute_paths() {
    return absolute_paths;
}

function get_relative_paths() {
    return relative_paths;
}


// get the tree structure of the uploaded files/folders.


function get_tree_struct() {
    return tree_struct;
}



exports.init = init;
exports.lookup = lookup;
exports.get_absolute_paths = get_absolute_paths;
exports.get_relative_paths = get_relative_paths;
exports.get_json_file = get_json_file;
exports.get_json_definitions = get_json_definitions;
exports.get_tree_struct = get_tree_struct;
