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

/**
 * @desc use this class to tween css of elements. It's specially for gpu accelerator.
 * @constructor
 */
function IWPTween() {

}

IWPTween._targets = [];
IWPTween._count = 0;
IWPTween._tweenId = 0;
IWPTween._targetId = 0;
IWPTween._transform = getsupportedprop(['transform', 'MozTransform', 'WebkitTransform', 'OTransform']);
IWPTween._transition = getsupportedprop([ 'transition', 'MozTransition', 'WebkitTransition', 'OTransition']);
IWPTween.hasTranslate3d = (IWPTween._transform == null || IWPTween._transition == null);
IWPTween.hasTranslate3d=true
IWPTween._timer = null;
IWPTween._cssEaseList = {
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    ease: "ease",
    linear: "linear",
    stepEnd: "step-end"
};

IWPTween._jsEaseList = {
    easeIn: "easeInCubic",
    easeOut: "easeOutCubic",
    easeInOut: "easeInOutCubic",
    linear: "linearTween",
    ease: "easeInCubic"
};


IWPTween._getCssEase = function (name) {
    var ease = IWPTween._cssEaseList[name];
    if (ease == null) return "";
    else return ease;
}

IWPTween._getJsEase = function (name) {
    var ease = IWPTween._jsEaseList[name];
    if (ease == null) return name;
    else return ease;
}

IWPTween.killOf = function (target) {


    if (target._tweenTargetId == null && IWPTween._targets[target._tweenTargetId] == null) {
        return;
    }

    var tweens = IWPTween._targets[target._tweenTargetId]._tweens;
    var obj = null;

    if (tweens == null) return;

    for (var i in tweens) {
        obj = tweens[i];

        obj.onComplete = null;
        obj.onCompleteParams = null;
        IWPTween._count--;
    }

    obj = null;
    IWPTween._targets[target._tweenTargetId]._tweens = null;
    delete IWPTween._targets[target._tweenTargetId]._tweens;
}

IWPTween.to = function (target, time, obj) {
    if (obj == null) {
        return;
    }


    var css = {};
    var cssUnit = {};
    var ease = (obj.ease == null) ? "easeOut" : obj.ease;
    var origin = {css: {}}
    if (obj.css != null) {
        for (var style in obj.css) {
            if (typeof obj.css[style] == "string") {
                cssUnit[style] = obj.css[style].replace(/[\d\.\-]/g, "")
                css[style] = Number(obj.css[style].replace(/[^\d\.\-]/g, ""));

                // trace(style + "***" + obj.css[style] + "**" + css[style])

            } else {
                cssUnit[style] = "";
                css[style] = obj.css[style];
                // trace(style + "XXXXX" + obj.css[style] + "XXXX" + css[style])

            }


        }
    }
    var tweenObj = {time: time * 1000, ease: ease, css: css, cssUnit: cssUnit, spentTime: 0, onComplete: obj.onComplete, onCompleteParams: obj.onCompleteParams, _origin: origin}
    tweenObj.jsEase = IWPTween._getJsEase(ease);
    tweenObj.cssEase = IWPTween._getCssEase(ease);
    if (time < 0.01) time = 0;


    if (time == 0) {

        if (IWPTween.hasTranslate3d) {

            if (tweenObj.css["x"] != null) {
                target.style["left"] = tweenObj.css["x"] + tweenObj.cssUnit["x"];
            }
            if (tweenObj.css["y"] != null) {
                target.style["top"] = tweenObj.css["y"] + tweenObj.cssUnit['y'];
            }

        } else {
            if (tweenObj.css.x != null || tweenObj.css.y != null || tweenObj.css.z != null) {
                var martix = window.getComputedStyle(target)[IWPTween._transform];

                target.style[IWPTween._transition] = time + "s" + " " + tweenObj.cssEase;

                if (martix != "none") {
                    if (martix.indexOf("3d") > 0) {
                        martix = martix.split(",");
                        var ox = Number(martix[12]);
                        var oy = Number(martix[13]);
                        var oz = Number(martix[14]);
                    } else {
                        martix = martix.split(",");


                        ox = Number(martix[4]);
                        oy = Number(martix[5].replace(")", ""));
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
                    clearTimeout(timer);
                }, 0)

            }


        }

        for (var i in tweenObj.css) {


            if (i != "x" && i != "y" && i != "z") {

                target.style[i] = tweenObj.css[i] + tweenObj.cssUnit[i];


                trace(i + ">" + target.style[i])

            }


        }

        if (tweenObj.onComplete != null) {
            if (tweenObj.onCompleteParams == null) tweenObj.onCompleteParams = [];
            tweenObj.onComplete.apply(target, tweenObj.onCompleteParams)
            tweenObj.onComplete = null;
            tweenObj.onCompleteParams = null;
        }


    } else {

        //update css in modern browsers
        //get current transform

        if (IWPTween.hasTranslate3d != true && (tweenObj.css.x != null || tweenObj.css.y != null || tweenObj.css.z != null)) {


            martix = window.getComputedStyle(target)[IWPTween._transform];

            if (martix != "none") {

                if (martix.indexOf("3d") > 0) {
                    martix = martix.split(",");
                    ox = Number(martix[12]);
                    oy = Number(martix[13]);
                    oz = Number(martix[14]);
                } else {
                    martix = martix.split(",");


                    ox = Number(martix[4]);
                    oy = Number(martix[5].replace(")", ""));
                    oz = 0;

                }
            } else {
                ox = 0;
                oy = 0;
                oz = 0;
            }


            tweenObj._origin.css["x"] = ox;
            tweenObj._origin.css["y"] = oy;
            tweenObj._origin.css["z"] = oz;


            if (tweenObj.css.x == null) {
                tweenObj.css.x = ox;
                delete tweenObj.css.x

            }else{
                tweenObj.css["x"] -= tweenObj._origin.css["x"];
            }

            if (tweenObj.css.y == null) {
                tweenObj.css.y = oy;
                delete tweenObj.css.y
            }else{
                tweenObj.css["y"] -= tweenObj._origin.css["y"];
            }

            if (tweenObj.css.z == null) {
                tweenObj.css.z = oz;
                delete tweenObj.css.z
            }else{
                tweenObj.css["z"] -= tweenObj._origin.css["z"];
            }

            //trace("ox:"+ox+",oy:"+oy+",oz:"+oz)


        }

        var val = null;



        for (style in tweenObj.css) {


            if (IWPTween.hasTranslate3d == true) {
                if (style == "x") {
                    val = target.style["offsetLeft"]
                } else if (style == "y") {

                    val = target.style["offsetTop"]
                }else{
                    val = target.style[style];
                }

                if (val == "undefined" || val == "none" || val == "" || val == undefined || val == "null") {

                    if (style == "opacity") {

                        val = 1;
                    } else {
                        val = 0;
                    }
                }


            } else  {

                val = target.style[style];
                if (val == "undefined" || val == "none" || val == "" || val == undefined || val == "null") {

                    if (style == "opacity") {

                        val = 1;
                    } else {
                        val = 0;
                    }
                }

            }


            if (typeof val == "string") {
                val = val.replace(/[^\d\.\-]/g, "")

            }


            if (style != "x" && style != "y" && style != "z") {
                tweenObj._origin.css[style] = Number(val);
                tweenObj.css[style] -= tweenObj._origin.css[style];
            }



             trace("target to :"+style+":"+tweenObj.css[style]+"  origin:"+tweenObj._origin.css[style]+" unit:"+tweenObj.cssUnit[style])
        }


        IWPTween._addTweenItem(target, tweenObj);

    }


    return IWPTween._tweenId;

}

IWPTween.prototype._getCurrentTransform = function (element) {

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
            if (IWPTween.hasTranslate3d) {
                if (tweenObj.css.x != null) {

                    var result = Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css.x, tweenObj.css.x, tweenObj.time);

                    //trace("result:"+result)

                    item.style.left = result + tweenObj.cssUnit["x"];
                }

                if (tweenObj.css.y != null) {

                    item.style.top = Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css.y, tweenObj.css.y, tweenObj.time) + tweenObj.cssUnit["y"]
                }


                // trace("style:top "+item.style.top+",left "+item.style.left+">>> oy "+tweenObj._origin.css.y+",ox "+tweenObj._origin.css.x+"  time:"+tweenObj.time+",spentTime:"+tweenObj.spentTime+", target pos:"+tweenObj.css.y+", "+tweenObj.css.x+" ease:"+tweenObj.ease)


            }else if(tweenObj.css.x !=null || tweenObj.css.y !=null || tweenObj.css.z !=null){
//                var tx=;
//                var ty=Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css["y"], tweenObj.css["y"], tweenObj.time) + (tweenObj.cssUnit["y"] || "px");
//                var tz=Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css["z"], tweenObj.css["z"], tweenObj.time) + (tweenObj.cssUnit["z"] || "px");

               // trace(tx+","+ty+","+tz)

                item.style[IWPTween._transform] = "translate3d(" + Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css["x"], tweenObj.css["x"], tweenObj.time) + (tweenObj.cssUnit["x"] || "px") +"," + Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css["y"], tweenObj.css["y"], tweenObj.time) + (tweenObj.cssUnit["y"] || "px") + "," + Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css["z"], tweenObj.css["z"], tweenObj.time) + (tweenObj.cssUnit["z"] || "px")+ ")";

            }

            //update common style
            for (var style in tweenObj.css) {


                if (style != "x" && style != "y" && style != "z") {

                    // item.style[style] = tweenObj.css[style] + tweenObj.cssUnit[style];
                    item.style[style] = Math[tweenObj.jsEase](tweenObj.spentTime, tweenObj._origin.css[style], tweenObj.css[style], tweenObj.time) + (tweenObj.cssUnit[style] || "");
                    //trace("update:"+style+":"+item.style[style])

                }


            }


            tweenObj.spentTime += 30;

            if (tweenObj.spentTime >= tweenObj.time) {

                if (tweenObj.onComplete != null) {
                    if (tweenObj.onCompleteParams == null) tweenObj.onCompleteParams = [];
                    tweenObj.onComplete.apply(item, tweenObj.onCompleteParams)
                    tweenObj.onComplete = null;
                    tweenObj.onCompleteParams = null;
                }
                tweens[k] = null;
                delete tweens[k];
                IWPTween._count--;


            }
        }


    }//end loop


}