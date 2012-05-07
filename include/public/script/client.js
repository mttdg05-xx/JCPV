// If the color option is unselected/selected => hide/show color inputs.


function checkOptionsSelected() {
    var options = document.getElementsByTagName("option");
    var color_buttons_selector = $("#color_buttons");
    for (var i = 0; i < options.length; i++) {
        if (options[i].selected && options[i].text === "color") {
            color_buttons_selector.show();
            return;
        }
    }
    color_buttons_selector.hide();
}

function init() {
    var options, length, option_selected, metric, timp, button, button_title, label, label_title, select, attribute, opt, loc_id, locs_id = [],
        attributes_selected_names = [];
    var attributes_selected_values = [],
        json_values = [],
        up_dat = "";
    var file_selected;
    $("#treeView").jstree({
        "json_data": {
            "ajax": {
                "url": "utils/fetch_tree_struct"
            }
        },
        "plugins": ["themes", "json_data", "ui"]
    }).bind("select_node.jstree", function(event, data) {
        $.get(data.rslt.obj.data("id"), function(dat) {
            $("#codeView").html(dat);
            up_dat = dat;
            file_selected = data.rslt.obj.data("id").split("=")[1];
            prettyPrint();
        });
    });
    $.get("/updata?id=-1").complete(function(up_json_def) {
        json_definitions = JSON.parse(up_json_def.responseText);
        if (json_definitions !== undefined) {
            options = createOptions(json_definitions);
            for (var i = 0; i < options.data.length; i++) {
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
                for (var j = 0; j < tmp.attributes.length; j++) {
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
            $("button:first").click(function() {
                locs_id = [];
                attributes_selected_values = [];
                json_values = [];
                selects_number = $("#attributes  option:selected").length;
                $("#codeView").html(up_dat);
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
