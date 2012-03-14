var options = [
  {
    title : "Couleur rouge 13_16",
    action : ""
  },
  {
    title : "tooltip 13_16",
    action : ""
  }
    
];

function get_mapping(title){
  switch(title){
    case "Couleur rouge 13_16" :
        set_background('red', 13, 16);
      break;
    case "tooltip 13_16" :
        set_tooltip(':-)', 13, 16);
      break;

  }
}

// id?!!
function set_text_color(text_color, start, end){

  var id = start + "_" + end; 
  $("." + id).css('color', text_color);

}

function set_background(background_color, start, end){
  var id = start + "_" + end;
  $("." + id).css('background-color', background_color);

}

function set_tooltip(tooltip, start, end){
  var id = start + "_" + end; 
  $("." + id).attr('title', tooltip);



}
