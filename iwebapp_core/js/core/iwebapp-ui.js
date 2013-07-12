
//IWebUISlider  *****************************************
IWebUISlider.DIRECTION_HORIZON = 1;
IWebUISlider.DIRECTION_VERTICAL = 2;

/**
 *
 * @param target
 * @param opts
 * @constructor
 */
function IWebUISlider(target, opts) {
    // trace(IWebUISlider.arguments[0])
    //trace(target)
    this.container = null;

    this.dragNode = null;
    this.snap = false;
    this.percent = 0;
    this.direction = 1;

    this.supportTransition = getsupportedprop([ 'transition', 'MozTransition', 'WebkitTransition', 'OTransition']);
    this.onChange = null;
    this.min = 0;
    this.max = 1;
    this.value = 0;
    this.increment = 1;
    this.animate = true;
    this.duration = 0.2;

    this._timer = null;
    this.dragOffset=0;


    if (target != null) {

        this.create(target, opts);
    }


}

IWebUISlider.prototype.create = function (target, opts) {
    this.container = target;



    this.dragNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-slug")[0];


    this.container.sliderObj = this;
    this.dragNode.sliderObj = this;
    this.dragNode.onFingerMove = this._onTouchMove;
    this.dragNode.onFingerStart = this._onTouchStart;
    this.dragNode.onFingerUp = this._onTouchEnd;

    this.container.onFingerStart = this._onBarClick;
    this.container.onFingerUp = this._onBarUp;


    if (opts != null) {

        this.min = (opts.min != null) ? opts.min : this.min;
        this.max = (opts.max != null) ? opts.max : this.max;
        this.direction = (opts.direction != null) ? opts.direction : this.direction;
        this.onChange = (opts.onChange != null) ? opts.onChange : this.onChange;
        this.animate = (opts.animate != null) ? opts.animate : this.animate;
        this.snap = (opts.snap != null) ? opts.snap : this.snap;
        this.increment = (opts.increment != null) ? opts.increment : this.increment;
        this.dragOffset=(opts.dragOffset!=null)?opts.dragOffset:this.dragOffset;

        if (opts.value != null) {
           this.setVal(opts.value,false);
        } else if (opts.percent != null) {
            this.setPercent(opts.percent,false);
        }
    }


}

IWebUISlider.prototype.destroy = function () {
    clearInterval(this._timer);
    this._timer = null;
    this.container.onFingerStart = null;
    this.container.onFingerUp = null;
    this.container.sliderObj = null;
    this.dragNode.sliderObj = null;
    this.dragNode.onFingerMove = null;
    this.container = null;
    this.activeNode = null;
    this.downNode = null;
    this.dragNode = null;
    this.snap = false;
    this.onChange = null;
    this.dataList = null;

}

IWebUISlider.prototype.setRange = function (min, max) {
    this.min = min;
    this.max = max;
    this.value = this.percent * (this.max - this.min) + this.min;
}

IWebUISlider.prototype.setPercent = function (p,anima) {
    if (p > 1) p = 1;
    if (p < 0) p = 0;


    if (this.snap != true) {
        this.percent = p;
        this.value = this.percent * (this.max - this.min) + this.min;
    } else {

        var val = p * (this.max - this.min) + this.min;
        var n = (val - this.min) / this.increment;

        this.value = Math.round(n) * this.increment + this.min;
        this.percent = (this.value - this.min) / (this.max - this.min);
        if (this.percent > 1) this.percent = 1;
        else if (this.percent < 0) this.percent = 0;
    }


    this._updateDrag(this.percent,anima);


}

IWebUISlider.prototype.setVal = function (val,anima) {
    if (val > this.max) val = this.max;
    else if (val < this.min) val = this.min;


    if (this.snap != true) {
        this.value = val;
    } else {

        var n = (val - this.min) / this.increment;

        this.value = Math.round(n) * this.increment + this.min;
    }


    this.percent = (this.value - this.min) / (this.max - this.min);
    if (this.percent > 1) this.percent = 1;
    else if (this.percent < 0) this.percent = 0;


    this._updateDrag(this.percent,anima);


}


/**********private function list********/

IWebUISlider.prototype._onBarClick = function () {
    var p = 0;
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        p = (this.touchX - this.offsetLeft - this.sliderObj.dragNode.offsetWidth * 0.5) / (this.offsetWidth - this.sliderObj.dragNode.offsetWidth);

    } else {

        p = (this.touchY - this.offsetTop - this.sliderObj.dragNode.offsetHeight * 0.5) / (this.offsetHeight - this.sliderObj.dragNode.offsetHeight);
    }

    if (p < 0) p = 0;
    else if (p > 1) p = 1;

    if (this.sliderObj.snap != true) {
        this.sliderObj._updateData(p);
    }

    this.sliderObj._updateDrag(p);
}


IWebUISlider.prototype._onBarUp = function () {

    if (this.sliderObj.snap != true) return;

    var p = 0;
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        p = (this.touchX - this.offsetLeft - this.sliderObj.dragNode.offsetWidth * 0.5) / (this.offsetWidth - this.sliderObj.dragNode.offsetWidth);

    } else {

        p = (this.touchY - this.offsetTop - this.sliderObj.dragNode.offsetHeight * 0.5) / (this.offsetHeight - this.sliderObj.dragNode.offsetHeight);
    }


    if (p < 0) p = 0;
    else if (p > 1) p = 1;
    var val = this.sliderObj.min + p * (this.sliderObj.max - this.sliderObj.min);
    var n = (val - this.sliderObj.min) / this.sliderObj.increment;

    var val2 = Math.round(n) * this.sliderObj.increment + this.sliderObj.min;


    this.sliderObj.setVal(val2);
    if (this.onChange != null) this.onChange(this.sliderObj.percent, this.sliderObj.value);

}


IWebUISlider.prototype._updateDrag = function (p,anima) {
    var t = (this.animate ==false || anima==false) ? 0 : this.duration;

    IWPTween.killOf(this.dragNode);
    if (this.direction == IWebUISlider.DIRECTION_HORIZON) {

        this.dragNode.pos = p * (this.container.offsetWidth+(this.dragOffset*2) - this.dragNode.offsetWidth);

       // trace(this.container.className)
        //trace("this.dragNode.pos:"+this.dragNode.pos+"  p:"+p+", this.container.offsetWidth:"+this.container.offsetWidth+", this.dragNode.offsetWidth:"+this.dragNode.offsetWidth+", "+this.dragNode.offsetWidth+"  , id:"+this.container.id)

        IWPTween.to(this.dragNode, t, {css: {x: (this.dragNode.pos-this.dragOffset )+ "px"}})


    } else {
        this.dragNode.pos = p * (this.container.offsetHeight +(this.dragOffset*2) - this.dragNode.offsetHeight);
        IWPTween.to(this.dragNode, t, {css: {y: (this.dragNode.pos-this.dragOffset) + "px"}})

    }
}


IWebUISlider.prototype._onTouchStart = function (x, y) {

    this.style[this.sliderObj.supportTransition] = "0s";
    IWPTween.killOf(this);
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        this.prevPos = this.touchX;
    } else {
        this.prevPos = this.touchY;
    }




}
IWebUISlider.prototype._onTouchMove = function (x, y) {

    if (this.pos == null) {

        this.pos = -this.sliderObj.dragOffset;
    }


    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {

        this.pos = this.pos + this.touchXMov - this.prevPos;
      //  trace("pos1:"+this.pos+" this.touchXMov:"+this.touchXMov+" this.prevPos:"+this.prevPos);
        //if (this.pos < 0) this.pos = 0;
        if (this.pos < -this.sliderObj.dragOffset) {
            this.pos = -this.sliderObj.dragOffset;
        }  else if (this.pos >= (this.sliderObj.container.offsetWidth+(this.sliderObj.dragOffset*2)  - this.offsetWidth)) {
            this.pos = this.sliderObj.container.offsetWidth+(this.sliderObj.dragOffset*2) - this.offsetWidth

        }
       // trace("pos:"+this.pos);

       // this.style.left=this.pos+"px"

       IWPTween.to(this, 0, {css: {x: this.pos + "px"}});
        this.prevPos = this.touchXMov;

        if (this.sliderObj.snap != true)
            this.sliderObj._updateData(this.pos / (this.sliderObj.container.offsetWidth+(this.sliderObj.dragOffset*2) - this.offsetWidth));

    } else {
        this.pos = this.pos + this.touchYMov - this.prevPos;

        if (this.pos < -this.sliderObj.dragOffset) {
            this.pos = -this.sliderObj.dragOffset;
        }else if (this.pos >= (this.sliderObj.container.offsetHeight+(this.sliderObj.dragOffset*2) - this.offsetHeight)) {
            this.pos = this.sliderObj.container.offsetHeight +(this.sliderObj.dragOffset*2)- this.offsetHeight
        }


        IWPTween.to(this, 0, {css: {y: this.pos + "px"}});

        this.prevPos = this.touchYMov;

        if (this.sliderObj.snap != true)
            this.sliderObj._updateData(this.pos / (this.sliderObj.container.offsetHeight+(this.sliderObj.dragOffset*2) - this.offsetHeight));
    }


}

IWebUISlider.prototype._onTouchEnd = function () {

    if (this.sliderObj.snap == true) {
        //snap drag node to the best position
        if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
            var p = this.pos / (this.sliderObj.container.offsetWidth - this.offsetWidth);


        } else {
            p = this.pos / (this.sliderObj.container.offsetHeight - this.offsetHeight);
        }

        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        var val = this.sliderObj.min + p * (this.sliderObj.max - this.sliderObj.min);
        var n = (val - this.sliderObj.min) / this.sliderObj.increment;

        var val2 = Math.round(n) * this.sliderObj.increment + this.sliderObj.min;

        this.sliderObj.setVal(val2);
        if (this.onChange != null) this.onChange(this.percent, this.value);
    }
}
IWebUISlider.prototype._updateData = function (p) {
    if (p < 0) p = 0;
    else if (p > 1) p = 1;

    this.percent = p;
    this.value = this.percent * (this.max - this.min) + this.min;
    if (this.onChange != null) this.onChange(this.percent, this.value);

}




//IWebUISwitch  *****************************************
IWebapp.extend(IWebUISwitch, IWebUISlider);

/**
 *
 * @param target
 * @param opts
 * @constructor
 */
function IWebUISwitch(target, opts) {
    if (opts == null) opts = {}
    opts.snap = true;
    opts.increment = 100;
    opts.animate = true;
    opts.max = 100;
    opts.min = 0;

    this.activeNode = null;
    this.downNode = null;
    this.activeNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-active")[0];
    this.downNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-down")[0];

    IWebUISwitch.$super(this, target, opts);


}

IWebUISwitch.prototype.create = function (target, opts) {
    IWebUISwitch.method(this, "create", target, opts);
    this.activeNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-active")[0];
    this.downNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-down")[0];

}


IWebUISwitch.prototype.isOn = function () {
    return this.percent == 1
}

IWebUISwitch.prototype.toggle = function () {
    if (this.percent < 1) {
        this.setPercent(1)
    } else {
        this.setPercent(0)
    }

}

IWebUISwitch.prototype.turnOn = function () {
    this.setPercent(1)
}

IWebUISwitch.prototype.turnOff = function () {
    this.setPercent(0)
}

IWebUISwitch.prototype._onTouchMove = function (x, y) {
    IWebUISwitch.method(this, "_onTouchMove", x, y);
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        IWPTween.to(this.sliderObj.activeNode, 0, {css: {x: (this.pos - this.sliderObj.activeNode.offsetWidth + this.offsetWidth * 0.5) + "px"}});
        IWPTween.to(this.sliderObj.downNode, 0, {css: {x: (this.pos + this.offsetWidth * 0.5) + "px"}});
    } else {
        IWPTween.to(this.sliderObj.activeNode, 0, {css: {y: (this.pos - this.sliderObj.activeNode.offsetHeight + this.offsetHeight * 0.5) + "px"}});
        IWPTween.to(this.sliderObj.downNode, 0, {css: {y: (this.pos + this.offsetHeight * 0.5) + "px"}});
    }
}

IWebUISwitch.prototype._updateDrag = function (p,anim) {
    IWebUISwitch.method(this, "_updateDrag", p,anim);

    IWPTween.killOf(this.activeNode);
    IWPTween.killOf(this.downNode);

    var time=(this.animate ==false || anim==false)?0:this.duration;
    if (this.direction == IWebUISlider.DIRECTION_HORIZON) {
        IWPTween.to(this.activeNode, time, {css: {x: (this.dragNode.pos - this.activeNode.offsetWidth -this.dragOffset+ this.dragNode.offsetWidth * 0.5) + "px"}});
        IWPTween.to(this.downNode, time, {css: {x: (this.dragNode.pos + this.dragNode.offsetWidth * 0.5) + "px"}});
    } else {
        IWPTween.to(this.activeNode, time, {css: {y: (this.dragNode.pos - this.activeNode.offsetHeight -this.dragOffset+ this.dragNode.offsetHeight * 0.5) + "px"}});
        IWPTween.to(this.downNode, time, {css: {y: (this.dragNode.pos + this.dragNode.offsetHeight * 0.5) + "px"}});
    }

}


IWebUISwitch.prototype._onTouchStart = function (x, y) {


    IWPTween.killOf(this.sliderObj.activeNode);
    IWPTween.killOf(this.sliderObj.downNode);
    IWebUISwitch.method(this, "_onTouchStart", x,y);





}

IWebUISwitch.prototype.destroy=function(){
    this.activeNode=null;
    this.downNode=null;
    IWebUISwitch.method(this,"destroy");

}


//IWebUICheckBox *****************************************
/**
 *
 * @param target
 * @param opts
 * @constructor
 */
function IWebUICheckBox(target,opts){
    this.group=null;
    this.value=null;
    this.selected=false;
    this.container=null;
    this.label=null;
    this.icon=null;

    if(target!=null){
        this.create(target,opts);
    }

}


IWebUICheckBox.prototype.create=function(target,opts){
    this.container=target;
    this.label=IWebapp.getElementsByClassName(target,"iwp-ui-checkbox-label")[0];
    this.icon=IWebapp.getElementsByClassName(target,"iwp-ui-checkbox-icon")[0];

    IWebapp.addClass(target,"touchable")
    if(opts!=null){
        this.value=(opts.value!=null)? opts.value:null;
        if(opts.text!=null && this.label!=null){
            this.label.innerHTML=opts.text;
        }

        if(opts.selected!=null){
            this.setSelect(opts.selected)
        }
    }

    var checkbox=this;
    this.container.onTap=function(){
        checkbox.toggle();
    }

}

IWebUICheckBox.prototype.setSelect=function(selected){
    this.selected=selected;
    if(this.selected){
        IWebapp.addClass(this.container,"selected");
    }else{
        IWebapp.removeClass(this.container,"selected");
    }

}

IWebUICheckBox.prototype.toggle=function(){
    if(this.selected==true){
        this.setSelect(false);
    }else{
        this.setSelect(true);
    }
}

IWebUICheckBox.prototype.destroy=function(){
    this.container.onTap=null;
    this.container=null;
    this.label=null;
    this.icon=null;
}


//IWebUICheckBox end*****************************************



function IWebUIRadioBox(target,opts){
    this.group=null;
    this.value=null;
    this.selected=false;
    this.container=null;
    this.label=null;
    this.icon=null;

    if(target!=null){
        this.create(target,opts);
    }
}
