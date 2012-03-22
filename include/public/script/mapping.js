var known_mappings = [];
var attributes = ["tooltip", "color"];
var options = {data : []};

function Mapping(){

}

Mapping.prototype.matches = function(metricDef, attrib){}

Mapping.prototype.setAttribute = function(metricDef, attrib, value){}

function TooltipDefaultMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip";
  }

  this.setAttribute = function(metricDef, attrib, value){
    set_tooltip(metricDef.metric, value);
  }

}

function ColorDefaultMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "color";
  }

  this.setAttribute = function(metricDef, attrib, value){
    set_color(metricDef.metric, value);
  }

}



function selectMapping(metricDef, attrib){
  var current;
  for(var i = known_mappings.length - 1; i >= 0; i--) {
    current = known_mappings[i];
    if(current.matches(metricDef, attrib))
     return current;
    
  }
  return undefined;

}


function set_tooltip(metric, tooltip){
  $("." + metric).attr('title', tooltip);
}

function set_color(metric, percent){
  var rgb = get_color(percent);
  $("." + metric).css('background-color',  rgb_to_hex(rgb.r, rgb.g, rgb.b));
}


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

function set_mapping(id, value){
  var current_option;
  for(var i = 0; i < options.data.length; i++){
    current_option = options.data[i];
    for(var j = 0; j < current_option.attributes.length; j++){
      if(current_option.attributes[j].id === id){
        current_option.attributes[j].setAttribute(current_option.metric_def, current_option.attributes[j].name, value);
      }

    }
  }
}




function get_metric(id){
 var current_option;
 
 for(var i = 0; i < options.data.length; i++){
    current_option = options.data[i];  
    for(var j = 0; j < current_option.attributes.length; j++){
      if(current_option.attributes[j].id === id){
        return current_option.metric_def.metric;
      }
    }
  }
 return false;

}

// UTILS 

function rgb_to_hex(r, g, b){
  if( r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255)
    return false;

  var r_hex = r.toString(16).length === 1 ? '0' + r.toString(16) : r.toString(16);
  var g_hex = g.toString(16).length === 1 ? '0' + g.toString(16) : g.toString(16);
  var b_hex = b.toString(16).length === 1 ? '0' + b.toString(16) : b.toString(16);
  
  return ('#' + r_hex + g_hex + b_hex).toUpperCase();

}



// get a color between green |---------------| red
// according to the percent given
function get_color(percent){
  if( 0 > percent || percent > 100 )
    return false;

  return {

    r : Math.round((255 * percent) / 100),
    g : Math.round((255 * (100 - percent) / 100)),
    b : 0
  };
 
  }





known_mappings.push(new TooltipDefaultMapping());
known_mappings.push(new ColorDefaultMapping());


