// quelques outils pratiques pour simplifier la programmation client
// c'est en quelque sorte un "micro-web-framework"

// retourne l'élement ayant l'argument comme "id"
function $(id){return document.getElementById(id)}

// Crétion d'un élément DOM
function domElement(tagName,body,attrs){
    var e = document.createElement(tagName);
    if(arguments.length>1){
        if(typeof(body)=="string")
            body=document.createTextNode(body);
        if(body!=null)
            e.appendChild(body);
        if(attrs!=undefined){
            for(var a in attrs)
                e.setAttribute(a,attrs[a]);
        }
    }
    return e;
}

function getText(node){
	if(node.firstChild)return node.firstChild.nodeValue;
	else return "";
}

// changer ou ajouter un text comme enfant d'un noeud
function setText(node,text){
    if(node.firstChild)node.firstChild.nodeValue=text;
    else node.appendChild(document.createTextNode(text));
}

// retourner une description d'un object sous forme d'une chaîne
//   attention: un objet avec des références récursives peut faire boucler le système 
function inspect(o){
    if(o==null)return "null";
    if(typeof(o)=="string")return '"'+o+'"';
    var l=o.length;
    if(l!=null){
        var s="[";
        for(var i=0;i<l;i++){
            s+=inspect(o[i]);
            if(i<l-1)s+=", "
        }
        return s+"]";
    }
    if(typeof(o)=="object"){
        var s= "{";
        for(var i in o)
            if(typeof(o[i])!="function")
                s+=i+":"+inspect(o[i])+",";
        return (s.length==1?s:s.substr(0,s.length-1))+"}";
    }
    return ""+o;
}

//  gestion des classes d'un objet
//    on conserve les noms de classe dans une liste pour en faciliter
//    l'ajout ou l'enlèvement

//  un élément comporte-t-il une classe
function hasClass(elem,cName){
	if(!elem.classNames)return false;
	return elem.classNames.indexOf(cName)>=0;
}

// ajouter une classe à un élément, s'il n'y est pas déjà
// retourne l'élément possiblement modifié
function addClassName(elem,cName){
    if(!elem.classNames)elem.classNames=[];
    if(!hasClass(elem,cName)){
        elem.classNames.push(cName);
        elem.className=elem.classNames.join(" ");
    }
	return elem;
}

// enlever une classe d'un élément, s'il y est déjà
// retourne l'élément possiblement modifié
function removeClassName(elem,cName){
    if(!elem.classNames)return;
    var i=elem.classNames.indexOf(cName);
    if(i>=0){
        elem.classNames.splice(i,1);
        elem.className=elem.classNames.join(" ")
    }
	return elem;
}

