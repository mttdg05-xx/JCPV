var known_mappings = [];
var attributes = ["tooltip", "color"];
var options = {data : []};

function Mapping(){}

Mapping.prototype.matches = function(metricDef, attrib){}

Mapping.prototype.setAttribute = function(metricDef, attrib, json_data){}

function TooltipDefaultMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip" &&  metricDef.metric !== "reference";
  }

  this.setAttribute = function(metricDef, attrib, json_data){
    var value = json_data.value,
        loc_id = json_data.loc_id;
    set_tooltip(value, loc_id);
  }

}

function TooltipExeccountMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip" && metricDef.metric === "execcount";
  }

  this.setAttribute = function(metricDef, attrib, json_data, min, max){  
    var value = json_data.value,
        loc_id = json_data.loc_id;
    set_tooltip("execcount : " + value, loc_id);
  }

}


function TooltipCoverageMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "tooltip" && metricDef.metric === "coverage";
  }

  this.setAttribute = function(metricDef, attrib, json_data, min, max){  
    var value = json_data.value,
        loc_id = json_data.loc_id;
    set_tooltip("coverage : " + value + "%", loc_id);
  }

}



function ColorDefaultMapping(){
  this.matches = function(metricDef, attrib){
    return attrib === "color";
  }

  this.setAttribute = function(metricDef, attrib, json_data){
    var min = $("#min_color").val(),
        max = $("#max_color").val(), 
        value = json_data.value,
        loc_id = json_data.loc_id;
    set_color(value, loc_id, min, max);
  }

}

/*
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
*/

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

  this.setAttribute = function(metricDef, attrib, json_data){  

    //alert(JSON.stringify(references));
    var parent_id, child_id,
        loc_id = json_data.loc_id, notParent,
        parents = json_data.parents !== undefined ? json_data.parents : [] ,
        children = json_data.value !== undefined ? json_data.value : [],
        min = $("#min_color").val(),
        max = $("#max_color").val();

    // If a child isn't a parent then we give it a yellow highlight when enter.
    for(var i = 0; i < children.length; i++){
      notParent = true;
      for(var j = 0; j < parents.length; j++){
        if(children[i][0] === parents[j][0] && children[i][1] === parents[j][1])
          notParent = false;
      }
      if(notParent){
        child_id = "loc" + children[i][0] + "_" + children[i][1];
        $("#" + child_id).mouseenter(function(){
          $("#" + child_id).css('background-color',  'yellow');
        })
        .mouseleave(function(){
          $("#" + child_id).css('background-color',  'transparent');          
        });
      }
    }
    
    $("#" + loc_id).mouseenter(function(){

      $("#" + loc_id).css('background-color',  'yellow');

      for(var i = 0; i < parents.length; i++ ){
        parent_id = "loc" + parents[i][0] + "_" + parents[i][1];
        set_color(100, parent_id, min, max);
      }

      for(var i = 0; i < children.length; i++ ){
        child_id = "loc" + children[i][0] + "_" + children[i][1];
        set_color(0, child_id, min, max);
      }
    }).mouseout(function(){

      $("#" + loc_id).css('background-color',  'transparent');

      for(var i = 0; i < parents.length; i++ ){
        parent_id = "loc" + parents[i][0] + "_" + parents[i][1];
        $("#" + parent_id).css('background-color',  'transparent');

      }

      for(var i = 0; i < children.length; i++ ){
        child_id = "loc" + children[i][0] + "_" + children[i][1];
        $("#" + child_id).css('background-color',  'transparent');
      }











    });
      
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
  $("#" + loc_id).css('background-color',  rgb_to_hex(rgb.r, rgb.g, rgb.b));

}



/*
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
*/
function set_mapping(json_data, id){
  var current_option, value, loc_id;
  for( var k = 0; k < json_data.length; k++){

    value = json_data[k].value;
    loc_id = json_data[k].loc_id;

    for(var i = 0; i < options.data.length; i++){
      current_option = options.data[i];
      for(var j = 0; j < current_option.attributes.length; j++){
        if(current_option.attributes[j].id === id){
          //current_option.attributes[j].setAttribute(current_option.metric_def, current_option.attributes[j].name, value, loc_id);
          current_option.attributes[j].setAttribute(current_option.metric_def, current_option.attributes[j].name, json_data[k]);
        }

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



// default mapping are the last ones
known_mappings.push(new TooltipDefaultMapping());
known_mappings.push(new ColorDefaultMapping());

// custom mappings are the first ones 
known_mappings.push(new ColorReferenceMapping());
known_mappings.push(new TooltipCoverageMapping());
known_mappings.push(new TooltipExeccountMapping());

