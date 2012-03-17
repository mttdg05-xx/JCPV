
var options = {

  data :
    [
      {
        metric : "coverage",
        type : "percent",
        attr : [
          {
            id : 1,
            title : "color",
            //min_attr : "red",
            //max_attr : "green",
            set_attr : function(percent){
              set_color("coverage", percent);
            }
          },
          {
            id : 2,
            title : "tooltip",
            set_attr : function(percent){
              set_tooltip("coverage", "coverage : " + percent + "%");
            }
          }

        ]
      
      }
  ]
  
};

function get_metric(id){
 var tmp;
 for(var i = 0; i < options.data.length; i++){
    tmp = options.data[i];
    for(var j = 0; j < tmp.attr.length; j++){
      if(tmp.attr[j].id === id){
        return tmp.metric;
      }

    }
  }
 return false;


}

function set_mapping(id, percent){
  var tmp;
  for(var i = 0; i < options.data.length; i++){
    tmp = options.data[i];
    for(var j = 0; j < tmp.attr.length; j++){
      if(tmp.attr[j].id === id){
        tmp.attr[j].set_attr(percent);
      }

    }
  }
}




function set_color(type, percent){
  var rgb = get_color(percent);
  $("." + type).css('background-color',  rgb_to_hex(rgb.r, rgb.g, rgb.b));
}

function set_tooltip(type, tooltip){
  $("." + type).attr('title', tooltip);
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




