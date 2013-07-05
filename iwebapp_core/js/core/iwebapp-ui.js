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
function IWebUISlider(target,opts){
    this.container=null;
    this.activeNode=null;
    this.downNode=null;
    this.dragNode=null;
    this.snap=false;
    this.percent=0;
    this.direction=1;
    this.supportTransform=getsupportedprop(['transform','MozTransform', 'WebkitTransform', 'OTransform']);
    this.supportTransition=getsupportedprop([ 'transition','MozTransition', 'WebkitTransition', 'OTransition']);
    this.onChange=null;
    this.min=0;
    this.max=1;
    this.value=0;
    this.increment=1;
    this.animate=false;

    this._timer=null;

    if(target!=null){
        this.create(target,opts);
    }


}

IWebUISlider.prototype.create=function(target,opts){
    this.container=target;


    this.activeNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-active")[0];
    this.downNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-down")[0];
    this.dragNode=IWebapp.getElementsByClassName(target,"iwp-ui-slider-slug")[0];


    this.container.context=this;
    this.dragNode.context=this;
    this.dragNode.onFingerMove=this._onTouchMove;
    this.dragNode.onFingerStart=this._onTouchStart;
    this.dragNode.onFingerUp=this._onTouchEnd;

    this.container.onFingerStart=this._onBarClick;
    this.container.onFingerUp=this._onBarUp;


    if(opts!=null){

        this.min=(opts.min!=null)?opts.min:this.min;
        this.max=(opts.max!=null)?opts.max:this.max;
        this.direction=(opts.direction!=null)?opts.direction:this.direction;
        this.onChange=(opts.onChange!=null)?opts.onChange:this.onChange;
        this.animate=(opts.animate!=null)?opts.animate:this.animate;
        this.snap=(opts.snap!=null)?opts.snap:this.snap;
        this.increment=(opts.increment!=null)?opts.increment:this.increment;


        if(opts.value!=null){
            this.setVal(opts.value);
        }else if(opts.percent!=null){
            this.setPercent(opts.percent);
        }
    }



}

IWebUISlider.prototype.destroy=function(){
    clearInterval(this._timer);
    this._timer=null;
    this.container.onFingerStart=null;
    this.container.onFingerUp=null;
    this.container.context=null;
    this.dragNode.context=null;
    this.dragNode.onFingerMove=null;
    this.container=null;
    this.activeNode=null;
    this.downNode=null;
    this.dragNode=null;
    this.snap=false;
    this.onChange=null;
    this.dataList=null;

}

IWebUISlider.prototype.setRange=function(min,max){
    this.min=min;
    this.max=max;
    this.value=this.percent*(this.max-this.min)+this.min;
}

IWebUISlider.prototype.setPercent=function(p){
    if(p>1) p=1;
    if(p<0) p=0;



    if(this.snap!=true){
        this.percent=p;
        this.value=this.percent*(this.max-this.min)+this.min;
    }else{

        var val=p*(this.max-this.min)+this.min;
        var n=(val-this.min)/this.increment;

        this.value=Math.round(n)*this.increment+this.min;
        this.percent=(this.value-this.min)/(this.max-this.min);
        if(this.percent>1) this.percent=1;
        else if(this.percent<0) this.percent=0;
    }


    this._updateDrag(this.percent);


}

IWebUISlider.prototype.setVal=function(val){
    if(val>this.max) val=this.max;
    else if(val<this.min) val=this.min;


    if(this.snap!=true){
        this.value=val;
    }else{

        var n=(val-this.min)/this.increment;

        this.value=Math.round(n)*this.increment+this.min;
    }



    this.percent=(this.value-this.min)/(this.max-this.min);
    if(this.percent>1) this.percent=1;
    else if(this.percent<0) this.percent=0;



    this._updateDrag(this.percent);


}


/**********private function list********/

IWebUISlider.prototype._onBarClick=function(){
    var p=0;
    if(this.context.direction==IWebUISlider.DIRECTION_HORIZON){
        p=(this.touchX-this.offsetLeft-this.context.dragNode.offsetWidth)/(this.offsetWidth-this.context.dragNode.offsetWidth);

    }else{

        p=(this.touchY-this.offsetTop-this.context.dragNode.offsetHeight)/(this.offsetHeight-this.context.dragNode.offsetHeight);
    }

    if(p<0) p=0;
    else if(p>1) p=1;

    if(this.context.snap!=true){
        this.context._updateData(p);
    }

    this.context._updateDrag(p);
}


IWebUISlider.prototype._onBarUp=function(){

    if(this.context.snap!=true) return;

    var p=0;
    if(this.context.direction==IWebUISlider.DIRECTION_HORIZON){
        p=(this.touchX-this.offsetLeft-this.context.dragNode.offsetWidth)/(this.offsetWidth-this.context.dragNode.offsetWidth);

    }else{

        p=(this.touchY-this.offsetTop-this.context.dragNode.offsetHeight)/(this.offsetHeight-this.context.dragNode.offsetHeight);
    }



    if(p<0) p=0;
    else if(p>1) p=1;
    var val=this.context.min+p*(this.context.max-this.context.min);
    var n=(val-this.context.min)/this.context.increment;

    var val2=Math.round(n)*this.context.increment+this.context.min;



    this.context.setVal(val2);
    if(this.onChange!=null) this.onChange(this.context.percent,this.context.value);

}


IWebUISlider.prototype._updateDrag=function(p){

    trace("_updateDrag")
    if(this.direction==IWebUISlider.DIRECTION_HORIZON){

        this.dragNode.pos=p*(this.container.offsetWidth-this.dragNode.offsetWidth);

        if(this.animate!=true){


            if(this.supportTransform!=null){

                this.dragNode.style[this.supportTransform]="translate3d("+ this.dragNode.pos+"px,0px,0px)";
            }else{
                this.dragNode.style.left= this.dragNode.pos+"px";

            }
        }else{

            if(this.supportTransform!=null){
               trace(this.supportTransition)
               this.dragNode.style[this.supportTransition]=" 0.2s";

                this.dragNode.style[this.supportTransform]="translate3d("+ this.dragNode.pos+"px,0px,0px)";

            }else{

              //  this.dragNode.style.left= this.dragNode.pos+"px";
                if(this._timer!=null){
                    clearInterval(this._timer);


                }
                var context=this;
                this._timer=setInterval(function(){context._tween(context);},30);

            }
        }

    }else{
        this.dragNode.pos=p*(this.container.offsetHeight-this.dragNode.offsetHeight);

        if(this.animate!=true){
            if(this.supportTransform!=null){
                this.dragNode.style[this.supportTransform]="translate3d(0px,"+ this.dragNode.pos+"px,0px)";
            }else{
                this.dragNode.style.top= this.dragNode.pos+"px";
            }
        }else{
            if(this.supportTransform!=null){
                this.dragNode.style[this.supportTransition]=" 0.2s";
                this.dragNode.style[this.supportTransform]="translate3d(0px,"+ this.dragNode.pos+"px,0px)";
            }else{
               // this.dragNode.style.top= this.dragNode.pos+"px";
                if(this._timer!=null){
                    clearInterval(this._timer);


                }
                var context=this;
                this._timer=setInterval(function(){context._tween(context);},30);

            }
        }

    }
}

IWebUISlider.prototype._tween=function(context){
    var left=Number(context.dragNode.style.left.replace("px",""));
    var pos=left+(context.dragNode.pos-left)*0.6;


    var len=(context.container.offsetWidth-context.dragNode.offsetWidth)
    if(pos<=0) {
        pos=0;
        clearInterval(context._timer);

    }
    else if(pos>=(len-1) && pos <=(len+1) ){
        pos=context.container.offsetWidth-context.dragNode.offsetWidth;
        clearInterval(context._timer)

    }
   // trace(pos+"/"+context.dragNode.pos)
    context.dragNode.style.left=pos+"px";
    context=null;

}

IWebUISlider.prototype._onTouchStart=function(x,y){

    this.style[this.context.supportTransition]="0s";
    if(this.context.direction==IWebUISlider.DIRECTION_HORIZON){
        this.prevPos=this.touchX;
    }else{
        this.prevPos=this.touchY;
    }

}
IWebUISlider.prototype._onTouchMove=function(x,y){

    if(this.pos==null) {

        this.pos=0;
    }

    if(this.context.direction==IWebUISlider.DIRECTION_HORIZON){

        this.pos=this.pos+this.touchXMov-this.prevPos;

        if(this.pos<0) this.pos=0;
        else if(this.pos>=(this.context.container.offsetWidth-this.offsetWidth)){
            this.pos=this.context.container.offsetWidth-this.offsetWidth

        }

        if(this.context.supportTransform!=null){

            this.style[this.context.supportTransform]="translate3d("+this.pos+"px,0px,0px)";
        }else{
            this.style.left=this.pos+"px";


        }
        this.prevPos=this.touchXMov;

        if(this.context.snap!=true)
        this.context._updateData(this.pos/(this.context.container.offsetWidth-this.offsetWidth));

    }else{

       // p=(this.touchYMov-this.context.container.offsetTop)/this.context.container.offsetHeight;
        this.pos=this.pos+this.touchYMov-this.prevPos;

        if(this.pos<0) this.pos=0;
        else if(this.pos>=(this.context.container.offsetHeight-this.offsetHeight)){
            this.pos=this.context.container.offsetHeight-this.offsetHeight
        }
        if(this.context.supportTransform!=null){
            this.style[this.context.supportTransform]="translate3d(0px,"+this.pos+"px,0px)";
        }else{
            this.style.top=this.pos+"px";
        }

        this.prevPos=this.touchYMov;

        if(this.context.snap!=true)
        this.context._updateData(this.pos/(this.context.container.offsetHeight-this.offsetHeight));
    }


}

IWebUISlider.prototype._onTouchEnd=function(){

    if(this.context.snap==true){
        //snap drag node to the best position
        if(this.context.direction==IWebUISlider.DIRECTION_HORIZON){
            var p=this.pos/(this.context.container.offsetWidth-this.offsetWidth);


        }else{
              p=this.pos/(this.context.container.offsetHeight-this.offsetHeight);
        }

        if(p<0) p=0;
        else if(p>1) p=1;
        var val=this.context.min+p*(this.context.max-this.context.min);
        var n=(val-this.context.min)/this.context.increment;

        var val2=Math.round(n)*this.context.increment+this.context.min;

        this.context.setVal(val2);
        if(this.onChange!=null) this.onChange(this.percent,this.value);
    }
}
IWebUISlider.prototype._updateData=function(p){
    if(p<0) p=0;
    else if(p>1) p=1;

    this.percent=p;
    this.value=this.percent*(this.max-this.min)+this.min;
    if(this.onChange!=null) this.onChange(this.percent,this.value);

}

