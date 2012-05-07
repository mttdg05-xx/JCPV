function contain_class(classes, className) {
    if (classes === undefined) return;
    var split = classes.split(" ");
    for (var i = 0; i < split.length; i++) {
        if (split[i] === className) return true;
    }
    return false;

}

function mouseover() {
    var event = window.event,
        target = event.target,
        target_split;
    while (target instanceof HTMLElement) {

        if (contain_class(target.className, 'unselected')) {
            target.setAttribute('class', 'selected');
            break;
        }
        else if (contain_class(target.className, 'selected')) {
            break;
        }
        else {
            target = target.parentNode;
        }
    }
}

function mouseout() {
    var event = window.event,
        target = event.target;
    while (target instanceof HTMLElement) {
        if (contain_class(target.className, 'unselected')) {
            break;
        }
        else if (contain_class(target.className, 'selected')) {
            target.setAttribute('class', 'unselected');
            break;
        }
        else {
            target = target.parentNode;
        }
    }
}


function initVisu() {
    document.addEventListener('mouseover', mouseover, false);
    document.addEventListener('mouseout', mouseout, false);
}




/*
function initVisu(){

  $("#me").find('span')
        .mouseenter(function(){
          alert("1");
          $(this).addClass('selected'); 
        })
        .mouseleave(function(){ 
          alert("2");
          $(this).removeClass("selected"); 
        });
  
}
*/

/*
function initVisu(){
  $(".unselected").mouseenter(function(){
    $(".unselected").css('background-color',  'yellow');
  })
  .mouseout(function(){
    $(".unselected").css('background-color',  'transparent');
  });
  //alert( JSON.stringify($("#demo1").find("span")));

}
*/
initVisu();
