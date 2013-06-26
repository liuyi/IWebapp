// JavaScript Document
function Localization(){
	
	
	
}
 
Localization._lang="en";
Localization.support="en,zh";
Localization._langData=null;


Localization.setLang=function(lang){
	lang=lang.toLowerCase();
	//trace("L10n set _lang:"+_lang);
	if(Localization._lang==lang){

        return false;
    }
	if(Localization.support.indexOf(lang)<0){
        trace("don't support this _lang");
        Localization._lang="en";
     }
	Localization._lang=lang;
	//L10n._langData=eval(_lang);
	
	
}
Localization.setData=function(obj){
	
	if(isNull(obj)) obj=eval(Localization._lang);
	
	Localization._langData=obj;
}
Localization.getLang=function(){
	return Localization._lang;
}


Localization.trans=function(label){
	return Localization._langData[label];
	
}

Localization.apply=function(content){
	
	var regx =/\$\{\w+\}/g;
	var labels=content.match(regx);
	if(labels==null || labels.length==0) {
		//trace("can not find text which need be translated.");
		
		return content;
	}
	var len=labels.length;
	var lable="";
	var langStr="";
 
	var transtr=content;
	for (var i=0;i<len;i++){
		label=labels[i].replace("${","").replace("}","");
		
		langStr=Localization._langData[label];
		 
		transtr=transtr.replace(new RegExp("\\${"+label+"}","g"),langStr);

		
	}

 
	return transtr
}

L=Localization;
