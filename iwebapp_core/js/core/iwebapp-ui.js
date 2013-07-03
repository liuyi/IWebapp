function IWebUI(){

}
function IWebUISwitch(){
    this.container=null;
    this.dragNode=null;
    this.dragContainer=null;
    this.dragWidth="25%";
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

    this.container.context=this;
    this.container.onFingerStart=this.onTouch;
    this.container.onFingerMove=this.onMove;
}

IWebUISwitch.prototype.onDrag=function(e,context){
   if(context.value==true){

       context.setVal(false)
   }else{
       context.setVal(true)

   }
    return false;

}

IWebUISwitch.prototype.onTouch=function(x,y){

    if(this.context.value==true){

        this.context.setVal(false)
    }else{
        this.context.setVal(true)

    }


}

IWebUISwitch.prototype.onMove=function(x,y){




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

/************************************/

function IWebUISlider(){
    this.root=null;
    this.activeNode=null;
    this.downNode=null;
    this.dragNode=null;
    this.snap=false;
    this.percent=0;
    this.direction="horizon";

}

IWebUISlider.prototype.create=function(target){
    this.container=target;


    this.activeNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-active")[0];
    this.downNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-down")[0];
    this.dragNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-slug")[0];


    this.container.context=this;
    this.container.onFingerStart=this.onTouchStart;
    this.container.onFingerMove=this.onTouchMove;
}

IWebUISlider.prototype.onTouchStart=function(x,y){
     trace(this.touchX+"/"+this.touchY);
     trace(this.offsetTop)
     trace(this.offsetLeft)
    trace(this.offsetWidth)
}

IWebUISlider.prototype.onTouchMove=function(x,y){
   // trace(this.touchX+"/"+this.touchY +">>"+this.touchXMov+"/"+this.touchYMov);

}