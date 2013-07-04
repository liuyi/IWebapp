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


IWebUISlider.DIRECTION_HORIZON=1;
IWebUISlider.DIRECTION_VERTICAL=2;
/**
 *
 * @constructor
 */
function IWebUISlider(){
    this.container=null;
    this.activeNode=null;
    this.downNode=null;
    this.dragNode=null;
    this.snap=false;
    this.percent=0;
    this.direction=1;
    this.supportTransform=getsupportedprop(['transform', 'MozTransform', 'WebkitTransform', 'OTransform']);

}

IWebUISlider.prototype.create=function(target){
    this.container=target;


    this.activeNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-active")[0];
    this.downNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-down")[0];
    this.dragNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-slug")[0];


    this.dragNode.context=this;
    this.dragNode.onFingerMove=this._onTouchMove;
    this.dragNode.onFingerStart=this._onTouchStart;



}

IWebUISlider.prototype.onDestroy=function(){
    this.dragNode.context=null;
    this.dragNode.onFingerMove=null;
    this.container=null;
    this.activeNode=null;
    this.downNode=null;
    this.dragNode=null;
    this.snap=false;

}


IWebUISlider.prototype._onTouchStart=function(x,y){
    this.prevPos=x;
}
IWebUISlider.prototype._onTouchMove=function(x,y){
    // trace(this.touchX+"/"+this.touchY +">>"+this.touchXMov+"/"+this.touchYMov);


    var p=0;
    if(this.context.direction==IWebUISlider.DIRECTION_HORIZON){



        // p=(this.touchXMov-this.context.container.offsetLeft)/(this.context.container.offsetWidth);


        this.pos=this.offsetLeft+this.touchXMov-this.prevPos;
        if(this.pos<0) this.pos=0;
        else if(this.pos>(this.context.container.offsetWidth-this.offsetWidth)){
            this.pos=this.context.container.offsetWidth-this.offsetWidth
        }
        this.prevPos=this.touchXMov;
        if(this.supportTransform!=null){

            this.style[this.supportTransform]="translate3d("+this.pos+"px,0px,0px)";
        }else{
            this.style.left=this.pos+"px";

        }

    }else{

       // p=(this.touchYMov-this.context.container.offsetTop)/this.context.container.offsetHeight;
        this.pos=this.offsetTop+this.touchYMov-this.prevPos;
        if(this.pos<0) this.pos=0;
        else if(this.pos>this.context.container.offsetHeight-this.offsetHeight){
            this.pos=this.context.container.offsetHeight-this.offsetHeight
        }
        if(this.supportTransform!=null){
            this.style[this.supportTransform]="translate3d(0px,"+this.pos+"px,0px)";
        }else{
            this.style.top=this.pos+"px";
        }
    }


}

IWebUISlider.prototype._setPercent=function(p){

    this.percent=p;



}

