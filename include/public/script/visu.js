
function contain_class(classes, className){
  if (classes === undefined) return;
  var split = classes.split(" ");
  for(var i = 0; i < split.length; i++){
    if(split[i] === className)
    return true;
  }
  return false;
  
}

function mouseover()
{
  var event = window.event,
      target = event.target,
      target_split;
  while (target instanceof HTMLElement)
  {
    
    if (contain_class(target.className, 'unselected'))
    {
      target.setAttribute('class', 'selected');
      break;
    }
    else if (contain_class(target.className,'selected'))
    {
      break;
    }
    else
    {
      target = target.parentNode;
    }
  }
}

function mouseout()
{
  var event = window.event,
      target = event.target;
  while (target instanceof HTMLElement)
  {
    if  (contain_class(target.className, 'unselected'))
    {
      break;
    }
    else if (contain_class(target.className, 'selected'))
    {
      target.setAttribute('class', 'unselected');
      break;
    }
    else
    {
      target = target.parentNode;
    }
  }
}

document.addEventListener( 'mouseover', mouseover, false );
document.addEventListener( 'mouseout', mouseout, false );


