var known_mappings = [];
var attributes = ["tooltip", "color"];
var options = {data : []};

function Mapping(){

}

Mapping.prototype.matches = function(metricDef, attrib){}

Mapping.prototype.setAttribute = function(metricDef, attrib, value, loc_id){}

function TooltipDefaultMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip" &&  metricDef.metric !== "reference";
  }

  this.setAttribute = function(metricDef, attrib, value, loc_id){
    set_tooltip(value, loc_id);
  }

}

function TooltipExeccountMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip" && metricDef.metric === "execcount";
  }

  this.setAttribute = function(metricDef, attrib, value, loc_id, min, max){  
     set_tooltip("execcount : " + value, loc_id);
  }

}


function TooltipCoverageMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip" && metricDef.metric === "coverage";
  }

  this.setAttribute = function(metricDef, attrib, value, loc_id, min, max){  
     set_tooltip("coverage : " + value + "%", loc_id);
  }

}



function ColorDefaultMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "color";
  }

  this.setAttribute = function(metricDef, attrib, value, loc_id, min, max){
    set_color(value, loc_id, min, max);
  }

}

function ColorReferenceMapping(){

  function colorReference(source_id, actual_reference, references, min, max){

    var actual_reference_id = actual_reference !== source_id ? "loc" + actual_reference[0] + "_" + actual_reference[1] : source_id;
    var reference_id;

    $("#" + actual_reference_id).mouseenter(function(){
      set_color(100, source_id, min, max);

      for(var i = 0; i < references.length; i++ ){
        reference_id = "loc" + references[i][0] + "_" + references[i][1];
        set_color(0, reference_id, min, max);
      }
    })
    .mouseout(function(){      
      $("#" + source_id).css('background-color',  'transparent');

      for(var i = 0; i < references.length; i++ ){
        reference_id = "loc" + references[i][0] + "_" + references[i][1];
        $("#" + reference_id).css('background-color',  'transparent');
      }
    });
  }


  this.matches = function(metricDef, attrib){
    return attrib === "color" && metricDef.metric === "reference";
  }

  this.setAttribute = function(metricDef, attrib, references, source_id, min, max){  
    var references_id;

    colorReference(source_id, source_id, references, min, max);

    for(var i = 0; i < references.length; i++ )
      colorReference(source_id, references[i], references, min, max);

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


function set_tooltip(tooltip, loc_id){
  $("#" + loc_id).attr('title', function(i, previous_tooltip){
    return previous_tooltip === undefined ? tooltip : previous_tooltip + "\n" + tooltip;
  });
}

function set_color(percent, loc_id, min, max){
  var rgb = get_color(percent, min, max);
  /*
  $("#" + loc_id).css('background-color',  function(i, previous_color){
    if(previous_color === undefined || previous_color === "rgba(0, 0, 0, 0)")
      return rgb_to_hex(rgb.r, rgb.g, rgb.b);
    else{
      alert(previous_color);
      alert("An element can have just one color applied to it at a time. \n The first color choosen will be selected.");

      return previous_color;

    }
  });
  */
  //alert(loc_id);
 $("#" + loc_id).css('background-color',  rgb_to_hex(rgb.r, rgb.g, rgb.b));

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

function set_mapping(id, value, loc_id, min, max){
  //alert("min : " + min + "max : " + max);
  //alert("^^ " + arguments.length);
  var current_option;
  for(var i = 0; i < options.data.length; i++){
    current_option = options.data[i];
    for(var j = 0; j < current_option.attributes.length; j++){
      if(current_option.attributes[j].id === id){
        if(arguments.length === 5)
          current_option.attributes[j].setAttribute(current_option.metric_def, current_option.attributes[j].name, value, loc_id, min, max);
        else 
          current_option.attributes[j].setAttribute(current_option.metric_def, current_option.attributes[j].name, value, loc_id);

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


// default mapping are the last ones
known_mappings.push(new TooltipDefaultMapping());
known_mappings.push(new ColorDefaultMapping());

// custom mappings are the first ones 
known_mappings.push(new ColorReferenceMapping());
known_mappings.push(new TooltipCoverageMapping());
known_mappings.push(new TooltipExeccountMapping());

