// id starts with 1. 0 is for the default option
function createOptions(metrics_defs){
  var current_metric_def, current_attribute, mapping, 
      id = 1, attributes_match = [];
  for(var i = 0; i < metrics_defs.length; i++){
    current_metric_def = metrics_defs[i];
      attributes_match = [];

    for(var j = 0; j < attributes.length; j++ ){
      current_attribute = attributes[j];
      mapping = selectMapping(current_metric_def, current_attribute);
      if(mapping !== undefined){
        attributes_match.push({
          id : id++,
          name : current_attribute,
          setAttribute : mapping.setAttribute
        });
    
      }
    }

    if(attributes_match.length !== 0){
      options.data.push({
        metric_def : current_metric_def,
        attributes : attributes_match
      });
    }

  }
  return options;

}

// UTILS 
function rgb_to_hex(r, g, b){
  if( r < 0 || g < 0 || b < 0)
    return false;

  r = r <= 255 ? r : 255;
  g = g <= 255 ? g : 255;
  b = b <= 255 ? b : 255;

  var r_hex = r.toString(16).length === 1 ? '0' + r.toString(16) : r.toString(16);
  var g_hex = g.toString(16).length === 1 ? '0' + g.toString(16) : g.toString(16);
  var b_hex = b.toString(16).length === 1 ? '0' + b.toString(16) : b.toString(16);
  
  return ('#' + r_hex + g_hex + b_hex).toUpperCase();

}

function hex_to_rgb(hex){
  
  return {
    r : parseInt(hex.substring(0, 2), 16),
    g : parseInt(hex.substring(2, 4), 16),
    b : parseInt(hex.substring(4, 6), 16)
  }
}

// get a color between min |---------------| max
// according to the percent given
function get_color(percent, min, max){
  if( 0 > percent || percent > 100 )
    return false;
  var rgb_min = hex_to_rgb(min);
  var rgb_max = hex_to_rgb(max);
  var p_normalized = percent / 100;

  return {

    r : Math.round( rgb_min.r * (1 - p_normalized) + rgb_max.r * p_normalized ),
    g : Math.round( rgb_min.g * (1 - p_normalized) + rgb_max.g * p_normalized ),
    b : Math.round( rgb_min.b * (1 - p_normalized) + rgb_max.b * p_normalized )
  }; 
}

function manage_color_fields_visibility(){
  var options = document.getElementsByTagName("option");
  for(var i = 0; i < options.length; i++){
    if(options[i].selected && options[i].text === "color"){
      $("#color_buttons").show();
      return;
    }

  }
  $("#color_buttons").hide();
}




function setAttributesButtonClicked(up_dat, file_selected){
  var selects_number = $("#attributes  option:selected").length;
  var option_selected, metric, json_data;
  $("#me").html(up_dat);
  prettyPrint();
  for(var k = 0; k < selects_number; k++){                                                  
    option_selected = parseInt($("#attributes option:selected")[k].value);                                              
    if(option_selected !== 0){
      metric = get_metric(option_selected);
      jQuery.ajax({
        url : "utils/fetch_json_info?file_selected=" + file_selected + "&metric=" + metric,
        complete : function(data){
          json_data = JSON.parse(data.responseText);
          for(var i = 0; i < json_data.length; i++){
            if($("#attributes option:selected")[k].text === "color")
              set_mapping(option_selected, json_data[i].value, json_data[i].loc_id, $("#min_color").val(), $("#max_color").val());
            else 
              set_mapping(option_selected, json_data[i].value, json_data[i].loc_id);
          }                                                   
        },
        async : false
      });
    }
  }
}


function overlap(start1, end1, start2, end2){
  if(start1 <= start2 && start2 <= end1 || start1 <= end2 && end2 <= end1 
     || start2 <= start1 && start1 <= end2 || start2 <= end1 && end1 <= end2)
    return true;
  return false;


}

// If at the same position or at overlapping positions 
// we have the same attribute selected then we have a conflict.
// locs_id & attributes_selected_names should be the same size.
function conflicting_choices(locs_id, attributes_selected_names){
  var start1, start2, end1, end2;
  for(var i = 0; i < locs_id.length; i++){
    for(var j = i + 1; j < locs_id.length; j++){
      start1 = locs_id[i].split("loc")[1].split("_")[0];
      end1 = locs_id[i].split("loc")[1].split("_")[1];
      start2 = locs_id[j].split("loc")[1].split("_")[0];
      end2 = locs_id[j].split("loc")[1].split("_")[1];

      // this condition attributes_selected_names[j] === 'color'
      // could be changed to have a more general one.
      if(overlap(start1, end1, start2, end2) && attributes_selected_names[i] === attributes_selected_names[j] && attributes_selected_names[j] === 'color')
        return true;
    }
  }
  return false;
}

