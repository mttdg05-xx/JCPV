var uploadedFiles = require("./uploadedFiles");

// get all the parents of child.


function get_reference_parents(child_from, child_to, file_selected_path, json_obj) {
    var tmp, from, to, parents = [];
    for (var i = 0; i < json_obj.data.length; i++) {
        tmp = json_obj.data[i];
        if (uploadedFiles.lookup(tmp.target_path) === uploadedFiles.lookup(file_selected_path)) {
            for (var j = 0; j < tmp.info.length; j++) {
                if (tmp.info[j].metric === "reference" && (child_from !== tmp.from || child_to !== tmp.to)) {
                    for (var k = 0; k < tmp.info[j].value.length; k++) {
                        from = tmp.info[j].value[k][0];
                        to = tmp.info[j].value[k][1];
                        if (child_from === from && child_to === to) parents.push([tmp.from, tmp.to]);
                    }
                }
            }
        }
    }
    return parents;
}
// Get the min & max value (execcount) in json_obj.


function get_execcount_min_max(file_selected_path, json_obj) {
    var tmp, min = Number.MAX_VALUE,
        max = Number.MIN_VALUE;
    for (var i = 0; i < json_obj.data.length; i++) {
        tmp = json_obj.data[i];
        if (tmp.target_path === file_selected_path) {
            for (var j = 0; j < tmp.info.length; j++) {
                if (tmp.info[j].metric === "execcount") {
                    if (max < tmp.info[j].value) max = tmp.info[j].value;
                    if (min > tmp.info[j].value) min = tmp.info[j].value;
                }
            }
        }
    }
    return {
        min: min === Number.MAX_VALUE ? undefined : min,
        max: max === Number.MIN_VALUE ? undefined : max
    }
}

exports.get_reference_parents = get_reference_parents;
exports.get_execcount_min_max = get_execcount_min_max;
