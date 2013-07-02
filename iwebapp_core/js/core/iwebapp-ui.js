function IWebUI(){

}
function IWebUISwitch(){
    this.container=null;
    this.dragNode=null;
    this.dragContainer=null;

}


IWebUISwitch.prototype.create=function(target,autoCreate){
    this.container=target;
    if(autoCreate==null) autoCreate=true;

    if(autoCreate==true){
        this.dragNode=window.document.createElement("div");
        this.dragContainer=window.document.createElement("div");
        this.dragContainer.appendChild(this.dragNode);
        this.container.appendChild(this.dragContainer);



        iwp.addClass(this.dragNode,"iwebui-switch-drag");
        iwp.addClass(this.dragContainer,"iwebui-switch-drag-container");
        iwp.addClass(this.container,"iwebui-switch-container");
    }

   this.setVal(false);

    addEvent(this.container,"tap",this.onDrag,this)

}

IWebUISwitch.prototype.onDrag=function(e,context){
   if(context.value==true){

       context.setVal(false)
   }else{
       context.setVal(true)

   }
    return false;

}

IWebUISwitch.prototype.setVal=function(val){
    TweenLite.killTweensOf(this.dragContainer)
    if(val==true){
        this.value=true;

        TweenLite.to(this.dragContainer,0.6,{left:"0%"})


    }else {
        this.value=false;
        TweenLite.to(this.dragContainer,0.6,{left:"-75%"})

    }
}