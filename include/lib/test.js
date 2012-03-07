function count(text, word){
  var pos = 0,
      num = -1,
      i = -1;

  while(pos != -1){
    pos = text.indexOf(word, i+1);
    num += 1;
    i = pos;
  }

 return num;
}

function buildSpans(text, word){  
  var index = 0,
      mySpans = [],
      n = count(text, word),
      spanId;
  for(var i = 0; i < n; i++){
    spanId = "span_num" + i;
    mySpans[i] = '<span id="' + spanId +'" onmouseover = "highlight(' + spanId + 
      ');" onmouseout = "removeHighlight(' + spanId + ');" >var</span>';
  }

  return mySpans;

}

function test(){
  var mySpans = buildSpans(document.getElementById("me").innerHTML, "var");
  var index = 0;
  document.getElementById("me").innerHTML =  
    document.getElementById("me").innerHTML.replace(/var/g, function(){
      return mySpans[index++];
    });
}


function highlight(spanId){
 document.getElementById(spanId.id).style.textDecoration = "underline";
 
 //alert(spanId.id);
 //document.getElementById("span_num0").style.textDecoration = "underline";

}

function removeHighlight(spanId){
  document.getElementById(spanId.id).style.textDecoration = "none";
  //document.getElementById("span_num0").style.textDecoration = "none";


}

function vamos(){
  var ok = /\w/g, text = "test ok bfj.";

  while( match = ok.exec(text)){
  
   
   console.log(match.index);}
}
function vas(){
var myRe = /ab*/g;
var str = "abbcdefabh";
var myArray;
while ((myArray = myRe.exec(str)) != null)
{
    var msg = "Found " + myArray[0] + ".  ";
      msg += "Next match starts at " + myRe.lastIndex;
        console.log(msg);
}


}
vamos();
function test3(){
  var spanId, i = 0;
  document.getElementById("me").innerHTML = 
    document.getElementById("me").innerHTML.replace(/\S/g, function(){
      spanId = "span_num" + i++;

      return  '<span id="' + spanId +'" onmouseover = "highlight(' + spanId + 
      ');" onmouseout = "removeHighlight(' + spanId + ');" >' + /\S/+ '</span>';
  
    }
        );


}


var text = "oko bhsdnb 4bdb bdjcb <div>"; 
var ok = text.replace(/\S/g, 1);
console.log(ok);

/**
 function test(){
  var tempinnerHTML = document.getElementById("me").innerHTML;
  document.getElementById("me").innerHTML = tempinnerHTML.replace(/var/g, '<span style= "BACKGROUND-COLOR : yellow;">var</span>');

}

function test2(){
  var tempinnerHTML = document.getElementById("me").innerHTML;
  document.getElementById("me").innerHTML = tempinnerHTML.replace(/var/g, '<span class="moi" onmouseover="highlight();" onmouseout="removeHighlight();">var</span>');
}

var previousColor;
function highlight(){
  var text = document.getElementById("moi");
  previousColor = text.style.color;
  text.style.color = "yellow";
}

function removeHighlight(){
  var text = document.getElementById("moi");
  text.style.color = previousColor;
  }

function test3(){
  var tempinnerHTML = document.getElementById("me").innerHTML,
  var indexOfMatch = strReplaceAll.indexOf("var");
  var start = -1;
  var id = 0;
  var pos = 0;

  while(pos != -1){
    strReplaceAll = strReplaceAll




  }




}



/**
function test(){
  var tempinnerHTML = document.getElementById("me").innerHTML;
  document.getElementById("me").innerHTML = tempinnerHTML.replace(/var/g, '<span style= "BACKGROUND-COLOR : yellow;">var</span>');

}

function test2(){
  var tempinnerHTML = document.getElementById("me").innerHTML;
  document.getElementById("me").innerHTML = tempinnerHTML.replace(/var/g, '<span class="moi" onmouseover="highlight();" onmouseout="removeHighlight();">var</span>');
}

var previousColor;
*/


