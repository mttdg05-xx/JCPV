/*
var options =   {
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
      
        },
        {
          metric : "reference",
          type : "reference",
          attr : [
            {
              id : 3,
              title : "color",
              //min_attr : "red",
              //max_attr : "green",
              set_attr : function(percent){
                // $$green color
                set_color("reference", 0);
              }
            },
            {
              id : 4,
              title : "tooltip",
              set_attr : function(ref){
                set_tooltip("reference", "coverage : " + ref + "%");
              }
            }

          ]
      
        },

        {
          metric : "execcount",
          type : "int",
          attr : [
            {
              id : 5,
              title : "tooltip",
              set_attr : function(count){
                set_tooltip("execcount", "execcount : " + count + "times");
              }
            }

          ]
      
        }

      ]
  
  };
*/


function get_options(){
  return  {
    /*
    definitions : 
      [
        {
          "type" : "int",
          "metric" : "execcount"
        },
        {
          "type" : "percent",
          "metric" : "coverage"
        },
        {
          "type" : "reference",
          "metric" : "reference"
        }

      ],
      */
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
      
        },
        {
          metric : "reference",
          type : "reference",
          attr : [
            {
              id : 3,
              title : "color",
              //min_attr : "red",
              //max_attr : "green",
              set_attr : function(reference){
                // $$green color
                set_color("reference", 0);
              }
            },
          
          ]
      
        },
        {
          metric : "pattern",
          type : "string",
          attr : [
            {
              id : 4,
              title : "color",
              //min_attr : "red",
              //max_attr : "green",
              set_attr : function(reference){
                // $$green color
                set_color("pattern", 0);
              }
            },
          
          ]
      
        },


        {
          metric : "execcount",
          type : "int",
          attr : [
            {
              id : 5,
              title : "tooltip",
              set_attr : function(count){
                set_tooltip("execcount", "execcount : " + count + " times");
              }
            }

          ]
      
        }

      ]
  
  };
}
// intersection of what we know & what the
// json file knows
var options;
function options_intersect(outside_def){
  var my_options = get_options().data,
      intersect = {data : []}; 

  for(var i = 0; i < my_options.length; i++){
    for(var j = 0; j < outside_def.length; j++){
      if( my_options[i].type === outside_def[j].type && my_options[i].metric === outside_def[j].metric )
        intersect.data.push(my_options[i]);
    }
  }
  options = intersect;
  return intersect;
}

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

function set_mapping(id, value){
  var tmp;
  for(var i = 0; i < options.data.length; i++){
    tmp = options.data[i];
    for(var j = 0; j < tmp.attr.length; j++){
      if(tmp.attr[j].id === id){
        tmp.attr[j].set_attr(value);
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




