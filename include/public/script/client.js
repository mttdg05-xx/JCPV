
// If the color option is unselected/selected => hide/show color inputs.
function checkOptionsSelected() {
    var options = document.getElementsByTagName("option");
    var color_buttons_selector = $("#color_buttons");
    for (var i = options.length - 1; i >= 0; i--) {
        if (options[i].selected && options[i].text === "color") {
            color_buttons_selector.show();
            return;
        }
    }
    color_buttons_selector.hide();
}

function init() {
    var options, length, option_selected, metric, tmp, button, button_title, label, label_title, 
        select, attribute, opt, loc_id, locs_id = [], attributes_selected_names = [], attributes_selected_values = [],
        json_values = [], dataRsltObjData,  up_dat = "",  file_selected;

    $("#treeView").jstree({
        "json_data": {
            "ajax": {
                "url": "utils/fetch_tree_struct"
            }
        },
        "plugins": ["themes", "json_data", "ui"]
    }).bind("select_node.jstree", function(event, data) {// This is what happens we the user click on a node(file/folder).
        dataRsltObjData = data.rslt.obj.data("id");
        // if it's undefined then the user probably
        // clicked on a folder => there's nothing 
        // to show.
        if(dataRsltObjData){
          $.get(dataRsltObjData, function(dat) {
            $(".prettyprint").html(dat);
            up_dat = dat;
            file_selected = dataRsltObjData.split("=")[1];
            prettyPrint();
          });
        }
    });
    // -1 is for the json definition
    $.get("/updata?id=-1").complete(function(up_json_def) {
        json_definitions = up_json_def.responseText;
        // Check if a json file is given.
        // If it's undefined then is no options!
        if (json_definitions !== "undefined") {
            options = createOptions(JSON.parse(json_definitions));
            for (var i = options.data.length - 1; i >= 0; i--) {
                tmp = options.data[i];
                select = document.createElement("SELECT");
                select.onchange = checkOptionsSelected;
                label_title = document.createTextNode(tmp.metric_def.metric);
                label = document.createElement("LABEL");
                label.appendChild(label_title);
                opt = document.createElement("OPTION");
                opt.innerText = "Attributes";
                opt.value = "0";
                select.appendChild(opt);
                for (var j = tmp.attributes.length - 1; j >= 0; j--) {
                    opt = document.createElement("OPTION");
                    opt.innerText = tmp.attributes[j].name;
                    opt.value = tmp.attributes[j].id;
                    select.appendChild(opt);
                }
                document.getElementById("attributes").appendChild(document.createElement("br"));
                document.getElementById("labels").appendChild(document.createElement("br"));
                document.getElementById("labels").appendChild(label);
                document.getElementById("attributes").appendChild(select);
            }
            button = document.createElement("BUTTON");
            button_title = document.createTextNode("Set attributes");
            button.appendChild(button_title);
            document.getElementById("attributes").appendChild(document.createElement("br"));
            document.getElementById("attributes").appendChild(button);
            checkOptionsSelected();
            $("button:first").click(function() {// set attributes button is clicked
                locs_id = [];
                attributes_selected_values = [];
                json_values = [];
                selects_number = $("#attributes  option:selected").length;
                $(".prettyprint").html(up_dat);
                prettyPrint();
                if (isColorSelectedMult($("#attributes option:selected"))) {
                    alert("Color can't be selected more than one time!");
                }

                else {
                    for (var k = 0; k < selects_number; k++) {
                        attribute = $("#attributes option:selected")[k].text;
                        option_selected = parseInt($("#attributes option:selected")[k].value);
                        if (option_selected !== 0) {
                            metric = get_metric(option_selected);
                            jQuery.ajax({
                                url: "utils/fetch_json_info?file_selected=" + file_selected + "&metric=" + metric,
                                complete: function(data) {
                                    json_data = JSON.parse(data.responseText);
                                    set_mapping(json_data, option_selected);
                                },
                                async: false
                            });
                        }
                    }
                }

            });
        }
    });
}
