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
IWPTween.hasTranslate3d = (IWPTween._transform != null || IWPTween._transition != null);
//IWPTween.hasTranslate3d=false;
IWPTween.useCssTimer = false;
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
        obj.jsEase=null;
        IWPTween._count--;
    }

    obj = null;
    if(  IWPTween._targets[target._tweenTargetId]._tweens!=null){
        IWPTween._targets[target._tweenTargetId]._tweens = null;
        //delete IWPTween._targets[target._tweenTargetId]["_tweens"];
    }

}

IWPTween.to = function (target, time, obj) {
    if (obj == null) {
        return;
    }


    var css = {};
    var cssUnit = {};
    var ease = (obj.ease == null) ? "easeOut" : obj.ease;
    var origin = {css: {}}
    if (time < 0.01) time = 0;

    //[get ride of x,y,z]
    if (obj.css != null) {
        if (IWPTween.hasTranslate3d == true) {
            if (obj.css.x != null || obj.css.y != null || obj.css.z != null) {
                var pos = IWPTween._getCurrentTransform(target);
                origin.css.x = pos[0]//-target["offsetLeft"];//add offset to x
                origin.css.y = pos[1]//-target["offsetTop"];//add offset to y
                origin.css.z = pos[2];

               // trace("left:"+target["offsetLeft"]+">"+target["offsetTop"])


                if (obj.css.x == null) {
                    css.x = origin.css.x;
                } else {
                    css.x = Number(obj.css.x.replace(/[^\d\.\-]/g, ""));
                    cssUnit.x = obj.css.x.replace(/[\d\.\-]/g, "");
                    delete obj.css.x;
                }
                if (obj.css.y == null) {
                    css.y = origin.css.y
                } else {
                    css.y = Number(obj.css.y.replace(/[^\d\.\-]/g, ""));
                    cssUnit.y = obj.css.y.replace(/[\d\.\-]/g, "");
                    delete obj.css.y;
                }
                if (obj.css.z == null) {
                    css.z = origin.css.z;
                } else {
                    css.z = Number(obj.css.z.replace(/[^\d\.\-]/g, ""));
                    cssUnit.z = obj.css.z.replace(/[\d\.\-]/g, "");
                    delete obj.css.z;
                }

                if (IWPTween.useCssTimer == false) {
                    css.x -= origin.css.x;
                    css.y -= origin.css.y;
                    css.z -= origin.css.z;
                }
            }
        } else if (obj.css.z != null) {
            delete obj.css.z;
        } else if (obj.css.x != null) {
            obj.css.left = obj.css.x;
            delete obj.css.x;

        } else if (obj.css.y != null) {
            obj.css.top = obj.css.y;
            delete obj.css.y;

        }

    }


    var val = null;
    for (var style in obj.css) {


        if (typeof obj.css[style] == "string") {
            cssUnit[style] = obj.css[style].replace(/[\d\.\-]/g, "") //GET UNIT
            css[style] = Number(obj.css[style].replace(/[^\d\.\-]/g, "")); //GET VALUE

              trace(style + "***" + obj.css[style] + "**" + css[style])

        } else {
            cssUnit[style] = "";
            css[style] = obj.css[style];
              trace(style + "XXXXX" + obj.css[style] + "XXXX" + css[style])

        }


        //get origin value

        if (style == "x" || style == "left") {
            if(cssUnit[style]=="%"){
                val = target.style[style]
            }else{
                val = target["offsetLeft"]
            }

        } else if (style == "y" || style == "top") {
            if(cssUnit[style]=="%"){
                val = target.style[style]
            }else{
                 val = target["offsetTop"]
            }
        } else {
            val = target.style[style];
        }

        if (val == "undefined" || val == "none" || val == "" || val == undefined || val == "null") {

            if (style == "opacity") {

                val = 1;
            } else {
                val = 0;
            }
        }

        //remove unit

        if (typeof val == "string") {
            val = val.replace(/[^\d\.\-]/g, "")

        }

        origin.css[style] = Number(val);
        css[style] -= origin.css[style];


    }


    var tweenObj = {time: time * 1000, ease: ease, css: css, cssUnit: cssUnit, spentTime: 0, onComplete: obj.onComplete, onCompleteParams: obj.onCompleteParams, origin: origin}


    if (tweenObj.time == 0) {
        if (tweenObj.css.x != null || tweenObj.css.y != null || tweenObj.css.z != null) {

             trace("set translate3d>>>>"+tweenObj.css.x );
            var tx=(tweenObj.css.x+tweenObj.origin.css.x) + (tweenObj.cssUnit["x"] || "px");
            var ty=(tweenObj.css.y +tweenObj.origin.css.y)+ (tweenObj.cssUnit["y"] || "px")
            var tz=(tweenObj.css.z +tweenObj.origin.css.z)+ (tweenObj.cssUnit["z"] || "px")
            target.style[IWPTween._transform] = "translate3d(" +  tx+ "," + ty + "," + tz+ ")";

        }


        //update common style
        for (var style in tweenObj.css) {


            if (style != "x" && style != "y" && style != "z") {


                // item.style[style] = tweenObj.css[style] + tweenObj.cssUnit[style];
                var unit=(tweenObj.cssUnit[style] || "")

                target.style[style] = ( tweenObj.css[style] + tweenObj.origin.css[style]) +unit ;
                trace("update:" + style + ":" + target.style[style])

            }


        }


        if (tweenObj.onComplete != null) {
            if (tweenObj.onCompleteParams == null) tweenObj.onCompleteParams = [];
            tweenObj.onComplete.apply(target, tweenObj.onCompleteParams)
            tweenObj.onComplete = null;
            tweenObj.onCompleteParams = null;
        }


    } else {

        tweenObj.jsEase = Math[IWPTween._getJsEase(ease)];
        tweenObj.cssEase = IWPTween._getCssEase(ease);
        IWPTween._addTweenItem(target, tweenObj);
    }


    return IWPTween._tweenId;

}

IWPTween._getCurrentTransform = function (target) {
    var martix = window.getComputedStyle(target)[IWPTween._transform];


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

    return [ox, oy, oz];
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

            if (IWPTween.hasTranslate3d && IWPTween.useCssTimer == false &&(tweenObj.css["x"]!=null || tweenObj.css["y"]!=null || tweenObj.css["z"]!=null)) {
                var tx = tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css["x"], tweenObj.css["x"], tweenObj.time) + (tweenObj.cssUnit["x"] || "px")
                var ty = tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css["y"], tweenObj.css["y"], tweenObj.time) + (tweenObj.cssUnit["y"] || "px")
                var tz = tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css["z"], tweenObj.css["z"], tweenObj.time) + (tweenObj.cssUnit["z"] || "px")

               // trace(">>>>" + tx + "," + ty + "," + tz)

//                item.style[IWPTween._transform] = "translate3d(" + tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css["x"], tweenObj.css["x"], tweenObj.time) + (tweenObj.cssUnit["x"] || "px") +"," + tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css["y"], tweenObj.css["y"], tweenObj.time) + (tweenObj.cssUnit["y"] || "px") + "," + tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css["z"], tweenObj.css["z"], tweenObj.time) + (tweenObj.cssUnit["z"] || "px")+ ")";
                item.style[IWPTween._transform] = "translate3d(" + tx + "," + ty + "," + tz + ")";

            }


            //update common style
            for (var style in tweenObj.css) {


                if (style != "x" && style != "y" && style != "z") {

                    // item.style[style] = tweenObj.css[style] + tweenObj.cssUnit[style];
                    item.style[style] = tweenObj.jsEase(tweenObj.spentTime, tweenObj.origin.css[style], tweenObj.css[style], tweenObj.time) + (tweenObj.cssUnit[style] || "");
                    trace("tween update:"+style+":"+item.style[style]+" origin:"+ tweenObj.origin.css[style])

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


        }//end tweens
    }//end targets

}