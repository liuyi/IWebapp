function IWebUI() {

}
function IWebUISwitch() {
    this.container = null;
    this.dragNode = null;
    this.dragContainer = null;
    this.dragWidth = "25%";
}


IWebUISwitch.prototype.create = function (target, autoCreate) {
    this.container = target;
    if (autoCreate == null) autoCreate = true;

    if (autoCreate == true) {
        this.dragNode = window.document.createElement("div");
        this.dragContainer = window.document.createElement("div");
        this.dragContainer.appendChild(this.dragNode);
        this.container.appendChild(this.dragContainer);


        iwp.addClass(this.dragNode, "iwebui-switch-drag");
        iwp.addClass(this.dragContainer, "iwebui-switch-drag-container");
        iwp.addClass(this.container, "iwebui-switch-container");
    }

    this.setVal(false);

    this.container.context = this;
    this.container.onFingerStart = this.onTouch;
    this.container.onFingerMove = this.onMove;
}

IWebUISwitch.prototype.onDrag = function (e, context) {
    if (context.value == true) {

        context.setVal(false)
    } else {
        context.setVal(true)

    }
    return false;

}

IWebUISwitch.prototype.onTouch = function (x, y) {

    if (this.context.value == true) {

        this.context.setVal(false)
    } else {
        this.context.setVal(true)

    }


}

IWebUISwitch.prototype.onMove = function (x, y) {


}


IWebUISwitch.prototype.setVal = function (val) {
    TweenLite.killTweensOf(this.dragContainer)
    if (val == true) {
        this.value = true;

        TweenLite.to(this.dragContainer, 0.6, {left: "0%"})


    } else {
        this.value = false;
        TweenLite.to(this.dragContainer, 0.6, {left: "-75%"})

    }
}


IWebUISlider.DIRECTION_HORIZON = 1;
IWebUISlider.DIRECTION_VERTICAL = 2;
/**
 *
 * @constructor
 */
function IWebUISlider(target, opts) {
    this.container = null;
    this.activeNode = null;
    this.downNode = null;
    this.dragNode = null;
    this.snap = false;
    this.percent = 0;
    this.direction = 1;
    this.supportTransform = getsupportedprop(['transform', 'MozTransform', 'WebkitTransform', 'OTransform']);
    this.supportTransition = getsupportedprop([ 'transition', 'MozTransition', 'WebkitTransition', 'OTransition']);
    this.onChange = null;
    this.min = 0;
    this.max = 1;
    this.value = 0;
    this.increment = 1;
    this.animate = false;

    this._timer = null;

    if (target != null) {
        this.create(target, opts);
    }


}

IWebUISlider.prototype.create = function (target, opts) {
    this.container = target;


    this.activeNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-active")[0];
    this.downNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-down")[0];
    this.dragNode = IWebapp.getElementsByClassName(target, "iwp-ui-slider-slug")[0];


    this.container.context = this;
    this.dragNode.context = this;
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


        if (opts.value != null) {
            this.setVal(opts.value);
        } else if (opts.percent != null) {
            this.setPercent(opts.percent);
        }
    }


}

IWebUISlider.prototype.destroy = function () {
    clearInterval(this._timer);
    this._timer = null;
    this.container.onFingerStart = null;
    this.container.onFingerUp = null;
    this.container.context = null;
    this.dragNode.context = null;
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

IWebUISlider.prototype.setPercent = function (p) {
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


    this._updateDrag(this.percent);


}

IWebUISlider.prototype.setVal = function (val) {
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


    this._updateDrag(this.percent);


}


/**********private function list********/

IWebUISlider.prototype._onBarClick = function () {
    var p = 0;
    if (this.context.direction == IWebUISlider.DIRECTION_HORIZON) {
        p = (this.touchX - this.offsetLeft - this.context.dragNode.offsetWidth) / (this.offsetWidth - this.context.dragNode.offsetWidth);

    } else {

        p = (this.touchY - this.offsetTop - this.context.dragNode.offsetHeight) / (this.offsetHeight - this.context.dragNode.offsetHeight);
    }

    if (p < 0) p = 0;
    else if (p > 1) p = 1;

    if (this.context.snap != true) {
        this.context._updateData(p);
    }

    this.context._updateDrag(p);
}


IWebUISlider.prototype._onBarUp = function () {

    if (this.context.snap != true) return;

    var p = 0;
    if (this.context.direction == IWebUISlider.DIRECTION_HORIZON) {
        p = (this.touchX - this.offsetLeft - this.context.dragNode.offsetWidth) / (this.offsetWidth - this.context.dragNode.offsetWidth);

    } else {

        p = (this.touchY - this.offsetTop - this.context.dragNode.offsetHeight) / (this.offsetHeight - this.context.dragNode.offsetHeight);
    }


    if (p < 0) p = 0;
    else if (p > 1) p = 1;
    var val = this.context.min + p * (this.context.max - this.context.min);
    var n = (val - this.context.min) / this.context.increment;

    var val2 = Math.round(n) * this.context.increment + this.context.min;


    this.context.setVal(val2);
    if (this.onChange != null) this.onChange(this.context.percent, this.context.value);

}


IWebUISlider.prototype._updateDrag = function (p) {

    if (this.direction == IWebUISlider.DIRECTION_HORIZON) {

        this.dragNode.pos = p * (this.container.offsetWidth - this.dragNode.offsetWidth);

        if (this.animate != true) {


            if (this.supportTransform != null) {

                this.dragNode.style[this.supportTransform] = "translate3d(" + this.dragNode.pos + "px,0px,0px)";
            } else {
                this.dragNode.style.left = this.dragNode.pos + "px";

            }
        } else {

            if (this.supportTransform != null) {

                this.dragNode.style[this.supportTransition] = " 0.2s";

                this.dragNode.style[this.supportTransform] = "translate3d(" + this.dragNode.pos + "px,10px,20px)";


            } else {

                //  this.dragNode.style.left= this.dragNode.pos+"px";
                if (this._timer != null) {
                    clearInterval(this._timer);


                }
                var context = this;
                this._timer = setInterval(function () {
                    context._tween(context);
                }, 30);

            }
        }

        var martix = window.getComputedStyle(this.dragNode)[this.supportTransform]
        trace("martix>>" + this.supportTransform)
        trace(martix)

    } else {
        this.dragNode.pos = p * (this.container.offsetHeight - this.dragNode.offsetHeight);

        if (this.animate != true) {
            if (this.supportTransform != null) {
                this.dragNode.style[this.supportTransform] = "translate3d(0px," + this.dragNode.pos + "px,0px)";
            } else {
                this.dragNode.style.top = this.dragNode.pos + "px";
            }
        } else {
            if (this.supportTransform != null) {
                this.dragNode.style[this.supportTransition] = " 0.2s";
                this.dragNode.style[this.supportTransform] = "translate3d(0px," + this.dragNode.pos + "px,0px)";
            } else {
                // this.dragNode.style.top= this.dragNode.pos+"px";
                if (this._timer != null) {
                    clearInterval(this._timer);


                }
                var context = this;
                this._timer = setInterval(function () {
                    context._tween(context);
                }, 30);

            }
        }

    }
}

IWebUISlider.prototype._tween = function (context) {
    var left = Number(context.dragNode.style.left.replace("px", ""));
    var pos = left + (context.dragNode.pos - left) * 0.6;


    var len = (context.container.offsetWidth - context.dragNode.offsetWidth)
    if (pos <= 0) {
        pos = 0;
        clearInterval(context._timer);

    }
    else if (pos >= (len - 1) && pos <= (len + 1)) {
        pos = context.container.offsetWidth - context.dragNode.offsetWidth;
        clearInterval(context._timer)

    }
    // trace(pos+"/"+context.dragNode.pos)
    context.dragNode.style.left = pos + "px";
    context = null;

}

IWebUISlider.prototype._onTouchStart = function (x, y) {

    this.style[this.context.supportTransition] = "0s";
    if (this.context.direction == IWebUISlider.DIRECTION_HORIZON) {
        this.prevPos = this.touchX;
    } else {
        this.prevPos = this.touchY;
    }

}
IWebUISlider.prototype._onTouchMove = function (x, y) {

    if (this.pos == null) {

        this.pos = 0;
    }

    if (this.context.direction == IWebUISlider.DIRECTION_HORIZON) {

        this.pos = this.pos + this.touchXMov - this.prevPos;

        if (this.pos < 0) this.pos = 0;
        else if (this.pos >= (this.context.container.offsetWidth - this.offsetWidth)) {
            this.pos = this.context.container.offsetWidth - this.offsetWidth

        }

        if (this.context.supportTransform != null) {

            this.style[this.context.supportTransform] = "translate3d(" + this.pos + "px,10px,20px)";
        } else {
            this.style.left = this.pos + "px";


        }
        this.prevPos = this.touchXMov;

        if (this.context.snap != true)
            this.context._updateData(this.pos / (this.context.container.offsetWidth - this.offsetWidth));

    } else {

        // p=(this.touchYMov-this.context.container.offsetTop)/this.context.container.offsetHeight;
        this.pos = this.pos + this.touchYMov - this.prevPos;

        if (this.pos < 0) this.pos = 0;
        else if (this.pos >= (this.context.container.offsetHeight - this.offsetHeight)) {
            this.pos = this.context.container.offsetHeight - this.offsetHeight
        }
        if (this.context.supportTransform != null) {
            this.style[this.context.supportTransform] = "translate3d(0px," + this.pos + "px,0px)";
        } else {
            this.style.top = this.pos + "px";
        }

        this.prevPos = this.touchYMov;

        if (this.context.snap != true)
            this.context._updateData(this.pos / (this.context.container.offsetHeight - this.offsetHeight));
    }


}

IWebUISlider.prototype._onTouchEnd = function () {

    if (this.context.snap == true) {
        //snap drag node to the best position
        if (this.context.direction == IWebUISlider.DIRECTION_HORIZON) {
            var p = this.pos / (this.context.container.offsetWidth - this.offsetWidth);


        } else {
            p = this.pos / (this.context.container.offsetHeight - this.offsetHeight);
        }

        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        var val = this.context.min + p * (this.context.max - this.context.min);
        var n = (val - this.context.min) / this.context.increment;

        var val2 = Math.round(n) * this.context.increment + this.context.min;

        this.context.setVal(val2);
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


Math.linearTween = function (t, b, c, d) {
    return c * t / d + b;
};
Math.easeInQuad = function (t, b, c, d) {
    t /= d;
    return c * t * t + b;
};
Math.easeOutQuad = function (t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
};
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

Math.easeInCubic = function (t, b, c, d) {
    t /= d;
    return c * t * t * t + b;
};
Math.easeOutCubic = function (t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};
Math.easeInOutCubic = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
};
Math.easeInQuart = function (t, b, c, d) {
    t /= d;
    return c * t * t * t * t + b;
};
Math.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
};
Math.easeInOutQuart = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
};
Math.easeInQuint = function (t, b, c, d) {
    t /= d;
    return c * t * t * t * t * t + b;
};
Math.easeOutQuint = function (t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t * t * t + 1) + b;
};
Math.easeInOutQuint = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t * t * t + 2) + b;
};
Math.easeInSine = function (t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};
Math.easeOutSine = function (t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
};
Math.easeInOutSine = function (t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};
Math.easeInExpo = function (t, b, c, d) {
    return c * Math.pow(2, 10 * (t / d - 1)) + b;
};
Math.easeOutExpo = function (t, b, c, d) {
    return c * ( -Math.pow(2, -10 * t / d) + 1 ) + b;
};

Math.easeInOutExpo = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    t--;
    return c / 2 * ( -Math.pow(2, -10 * t) + 2 ) + b;
};

Math.easeInCirc = function (t, b, c, d) {
    t /= d;
    return -c * (Math.sqrt(1 - t * t) - 1) + b;
};
Math.easeOutCirc = function (t, b, c, d) {
    t /= d;
    t--;
    return c * Math.sqrt(1 - t * t) + b;
};
Math.easeInOutCirc = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    t -= 2;
    return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
};


function IWPTween() {

}

IWPTween._targets = [];
IWPTween._count = 0;
IWPTween._tweenId = 0;
IWPTween._targetId = 0;
IWPTween._transform = getsupportedprop(['transform', 'MozTransform', 'WebkitTransform', 'OTransform']);
IWPTween._transition = getsupportedprop([ 'transition', 'MozTransition', 'WebkitTransition', 'OTransition']);
IWPTween.isBadBrowser = (IWPTween._transform == null || IWPTween._transition == null);
IWPTween._timer = null;
IWPTween.isBadBrowser=true
IWPTween.killOf = function () {

}

IWPTween.to = function (target, time, obj) {
    if (obj == null) {
        return;
    }

//    var css = null;
//    var x = (obj.css.x != null) ? obj.css.x : 0;
//    var y = (obj.css.y != null) ? obj.css.y : 0;
//    var ease = (obj.ease == null) ? "easeInOutQuad" : obj.ease;
//    var origin = {css: {}}
//
//
//
//    if (IWPTween.isBadBrowser) {
//
//
//        if (obj.css.x != null) {
//            origin.css.x = Number(target.style.left.replace("px", "").replace("%", ""));
//            obj.css.x -= origin.css.x;
//
//        }
//
//        if (obj.css.y != null) {
//            origin.css.y = Number(target.style.top.replace("px", "").replace("%", ""));
//
//            obj.css.y -= origin.css.y;
//        }
//
//
//        css = {left: obj.css.x, top: obj.css.y};
//    } else {
//        var z = (obj.css.z != null) ? obj.css.z : 0;
//        css = {x: x, y: y, z: z};
//    }


    var css = {};
    var cssUnit = {};
    var ease = (obj.ease == null) ? "easeInOutQuart" : obj.ease;
    var origin = {css: {}}
    if (obj.css != null) {
        for (var style in obj.css) {
            if( typeof obj.css[style] =="string"){
                cssUnit[style] = obj.css[style].replace(/[\d+\.]/g,"")
                css[style] = Number(obj.css[style].replace(/[^\d+\.]/g,""));


            }else{
                cssUnit[style] = "";
                css[style] = obj.css[style];
            }


        }
    }
    var tweenObj = {time: time * 1000, ease: ease, css: css, cssUnit: cssUnit, spentTime: 0, onComplete: obj.onComplete, completeParams: obj.completeParams, _origin: origin}
    if (time < 0.01) time = 0;


    if (time == 0) {

        if (IWPTween.isBadBrowser) {

                if ( tweenObj.css["x"]!=null) {
                    target.style["left"] = tweenObj.css["x"] + tweenObj.cssUnit["x"];
                }
                 if ( tweenObj.css["y"]!=null) {
                    target.style["top"] = tweenObj.css["y"] + tweenObj.cssUnit['y'];
                }

        } else {
            if (tweenObj.css.x != null || tweenObj.css.y != null || tweenObj.css.z != null) {
                var martix = window.getComputedStyle(target)[IWPTween._transform];

                if (martix != "none") {
                    if (martix.indexOf("3d") > 0) {
                        martix = martix.split(",");
                        var ox = martix[12];
                        var oy = martix[13];
                        var oz = martix[14];
                    } else {
                        martix = martix.split(",");
                        ox = martix[4];
                        oy = martix[5];
                        oz = 0;
                    }
                } else {
                    ox = 0;
                    oy = 0;
                    oz = 0;
                }
                if (tweenObj.css.x == null) {
                    tweenObj.css.x = ox;
                }

                if (tweenObj.css.y == null) {
                    tweenObj.css.y = oy;
                }

                if (tweenObj.css.z == null) {
                    tweenObj.css.z = oz;
                }



                 target.style[IWPTween._transform] = "translate3d(" + tweenObj.css.x + (tweenObj.cssUnit["x"] || "px") + "," + tweenObj.css.y + (tweenObj.cssUnit["y"] || "px") + "," + tweenObj.css.z + (tweenObj.cssUnit["z"] || "px") + ")";

            }


        }

        for (var i in tweenObj.css) {


            if (i != "x" && i!="y" && i!="z") {

                target.style[i] = tweenObj.css[i] + tweenObj.cssUnit[i];

            }


        }


        if (tweenObj.onComplete != null) {
            if (tweenObj.completeParams == null) tweenObj.completeParams = [];
            tweenObj.onComplete.apply(target, tweenObj.completeParams)
            tweenObj.onComplete = null;
            tweenObj.completeParams = null;
        }


    } else {

        //update css in modern browsers
        if (IWPTween.isBadBrowser != true) {
            target.style[IWPTween._transition] = time + "s";


            if (tweenObj.css.x != null || tweenObj.css.y != null || tweenObj.css.z != null) {
                  martix = window.getComputedStyle(target)[IWPTween._transform];

                if (martix != "none") {
                    if (martix.indexOf("3d") > 0) {
                        martix = martix.split(",");
                          ox = martix[12];
                          oy = martix[13];
                          oz = martix[14];
                    } else {
                        martix = martix.split(",");
                        ox = martix[4];
                        oy = martix[5];
                        oz = 0;
                    }
                } else {
                    ox = 0;
                    oy = 0;
                    oz = 0;
                }
                if (tweenObj.css.x == null) {
                    tweenObj.css.x = ox;
                }

                if (tweenObj.css.y == null) {
                    tweenObj.css.y = oy;
                }

                if (tweenObj.css.z == null) {
                    tweenObj.css.z = oz;
                }


                var timer = setTimeout(function () {
                    target.style[IWPTween._transform] = "translate3d(" + tweenObj.css.x + (tweenObj.cssUnit["x"] || "px") + "," + tweenObj.css.y + (tweenObj.cssUnit["y"] || "px") + "," + tweenObj.css.z + (tweenObj.cssUnit["z"] || "px") + ")";

                    //update common style
                    for (var i in tweenObj.css) {


                        if (i != "x" && i!="y" && i!="z") {

                            target.style[i] = tweenObj.css[i] + tweenObj.cssUnit[i];
                        }


                    }

                }, 0);
            }


        }

        //ge origin sytle

        for ( style in tweenObj.css) {


            if ( style!="z") {
                var val =null;
                if(style=="x"){
                     val =target["offsetLeft"];
                }else if(style=="y"){
                    val =target["offsetTop"];
                }else{
                    val=target.style[style];
                }


                if(val=="undefined" || val=="none" || val=="" || val==undefined || val=="null") {

                    if(style=="opacity"){

                        val=1;
                    }else{
                        val=0;
                    }
                }



                if(typeof val == "string") {
                    val=val.replace(/[^\d+\.]/g,"")

                }


                tweenObj._origin.css[style]=Number(val);
                tweenObj.css[style]-=tweenObj._origin.css[style];

               // trace(target.style.left)

            }

        }


        IWPTween._addTweenItem(target, tweenObj);

    }

    return IWPTween._tweenId;

}

IWPTween._addTweenItem = function (target, tweenObj) {
    if (IWPTween._targets == null) {
        IWPTween._targets = {};
    }

    if (target._tweenTargetId == null && IWPTween._targets[target._tweenTargetId] == null) {
        IWPTween._targets[++IWPTween._targetId] = target;
        target._tweenTargetId = IWPTween._targetId;
    }

    if (target._tweens == null) {
        target._tweens = {};
    }

    target._tweens[ ++IWPTween._tweenId] = tweenObj;
    tweenObj._tweenId = IWPTween._tweenId;

    IWPTween._count++;
    IWPTween._initTimer();


}
IWPTween._initTimer = function () {
    if (IWPTween._timer == null) {
        IWPTween._timer = setInterval(IWPTween._tween, 30);
    }

}

IWPTween._checkTweens = function () {


    if (IWPTween._count <= 0) {
        clearInterval(IWPTween._timer);
        IWPTween._timer = null;
        IWPTween._count = 0;
        trace("Clear timer")
    }
}

IWPTween._tween = function () {
    IWPTween._checkTweens();

    var tweens = null;
    var item = null;
    for (var i  in  IWPTween._targets) {
        item = IWPTween._targets[i];
        tweens = item._tweens;


        var tweenObj = null;

        for (var k in tweens) {
            tweenObj = tweens[k];

            //tween the css style of bad brwosers such as :ie6,7,8,9, else tween them by  css
            if (IWPTween.isBadBrowser) {
                if (tweenObj.css.x != null) {

                    var result = Math[tweenObj.ease](tweenObj.spentTime, tweenObj._origin.css.x, tweenObj.css.x, tweenObj.time);

                    //trace("result:"+result)

                    item.style.left =result +  tweenObj.cssUnit["x"];
                }

                if (tweenObj.css.y != null) {

                   item.style.top = Math[tweenObj.ease](tweenObj.spentTime, tweenObj._origin.css.y, tweenObj.css.y, tweenObj.time)+ tweenObj.cssUnit["y"]
                }

 
                // trace("style:top "+item.style.top+",left "+item.style.left+">>> oy "+tweenObj._origin.css.y+",ox "+tweenObj._origin.css.x+"  time:"+tweenObj.time+",spentTime:"+tweenObj.spentTime+", target pos:"+tweenObj.css.y+", "+tweenObj.css.x+" ease:"+tweenObj.ease)

            }

            //update common style
            for (var style in tweenObj.css) {


                if (style != "x" && style!="y" && style!="z") {

                  // item.style[style] = tweenObj.css[style] + tweenObj.cssUnit[style];
                   item.style[style] = Math[tweenObj.ease](tweenObj.spentTime, tweenObj._origin.css[style], tweenObj.css[style], tweenObj.time) + tweenObj.cssUnit[style];


                }


            }


            tweenObj.spentTime += 30;

            if (tweenObj.spentTime >= tweenObj.time) {

                if (tweenObj.onComplete != null) {
                    if (tweenObj.completeParams == null) tweenObj.completeParams = [];
                    tweenObj.onComplete.apply(item, tweenObj.completeParams)
                    tweenObj.onComplete = null;
                    tweenObj.completeParams = null;
                }
                tweens[k] = null;
                delete tweens[k];
                IWPTween._count--;


            }
        }


    }//end loop


}


