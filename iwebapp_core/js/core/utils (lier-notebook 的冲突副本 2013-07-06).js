// JavaScript Document
//if set debug to false, it would not print content to console.
debug = true;
/*Just don't want write too many codes */
var outTxt = null;
function trace(msg) {
    if (outTxt == null) {
        outTxt = window.document.createElement("textarea");
        window.document.body.appendChild(outTxt);
        outTxt.className = "outTxt";
    }


    if (debug == true) {
        try {
            console.log(msg);
        } catch (e) {
        }

       outTxt.innerHTML+=("\n"+msg);
    }
}//end function

function clearOut() {
    JQHtml("#outTxt", "");

}

String.prototype.len = function () {


    return this.replace(/[^\x00-\xff]/g, "00").length;
}

String.prototype.trim= function() {

    return this.replace(/^\s+|\s+$/g, "");
}

function cssToNum(str) {
    return (Number(str.replace("px", "")));
}


function RegX() {

}

RegX._ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

RegX.isIp = function (str) {

    var result = str.match(RegX._ip);
    return !(result == 0 || result == null )

};


function loadStrFile(url, callback, onError, opts) {
    dataType = (opts == null || opts.dataType == null) ? "xml" : opts.dataType;
    context = (opts == null || opts.context == null) ? null : opts.context;
    $.ajax({
        type: "get",
        url: url,
        cache: true,
        dataType: dataType,
        context: context,
        success: function (data) {
            trace(data)
            if (callback != null) callback(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

            if (onError != null) {
                onError(errorThrown)
            }
        }
    });
}

//check a value is null.
function isNull(val) {

    if (typeof(val) == "string" && val.length == 0) {
        return true;
    } else {
        return (val == null);
    }

}//end function

function simpleClone(sourceObj) {

    var str = JSON.stringify(sourceObj);
    return JSON.parse(str);

}
function simpleUID(rndLen) {
    if (rndLen == null) rndLen = 10000;
    var t = new Date();
    return t.getTime() + "" + Math.round(Math.random() * rndLen);
}

function getFileName(str) {
    var $name = str.substring(str.lastIndexOf('/') + 1);
    var paramPos = $name.indexOf("?");
    if (paramPos >= 0) {
        $name = $name.substring(0, paramPos);
    }

    return $name;
}

function getDir(str) {
    var dotPos = str.lastIndexOf('.');
    var slashPos = str.lastIndexOf('/');

    if (dotPos > slashPos)
        return addSlash(str.substring(0, str.lastIndexOf('/')));
    else {

        return addSlash(str);
    }
}

function addSlash(str) {
    if (str == null) return "";
    else if (str.lastIndexOf("/") < (str.length - 1)) {
        str = str + "/";
    }

    return str;
}


/*insert one or more js/css file to current html*/
function addJsCss(file, fRoot, onAllLoad) {

    var files = typeof file == "string" ? [file] : file;
    var headID = document.getElementsByTagName("head")[0];


    var cssLen = window.document.styleSheets.length;

    var jsList = [];

    for (var i = 0; i < files.length; i++) {

        if (files[i].indexOf(".css") > 0) {
            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = addSlash(fRoot) + files[i];
            cssNode.media = 'screen';
            cssLen++;

            headID.appendChild(cssNode);
        } else if (files[i].indexOf(".js") > 0) {
            jsList.push(files[i]);
        }


    }//end for

    var check = setInterval(checkCss, 50);

    function checkCss() {

        if (window.document.styleSheets.length == cssLen) {
            clearInterval(check);
            if (jsList.length > 0) {
                loadJs(0);
            } else {
                onFload();
            }
        }

    }

    function loadJs(id) {
        $.getScript(addSlash(fRoot) + jsList[id], function (d) {

            if (id < jsList.length - 1) {
                id++;
                loadJs(id);
            } else {
                onFload();
            }
        });
    }

    function onFload() {


        if (onAllLoad) onAllLoad();

    }


}


function getStyleRule(selector, styleSheet) {
    var style = "";
    for (var i in styleSheet.cssRules) {
        style = styleSheet.cssRules[i];

        if (style.selectorText == selector) {
            return style;
        }
    }
}

function getStyleSheet(unique_title) {
    for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];

        if (sheet.title == unique_title) {
            return sheet;
        }
    }
}


function Local() {

}

Local.ns = "";

Local.set = function (key, content) {
    window.localStorage.setItem(Local.ns + "." + key, content);


}

Local.get = function (key) {

    return window.localStorage.getItem(Local.ns + "." + key);
}

Local.remove = function (key) {
    window.localStorage.removeItem(Local.ns + "." + key);
}


function FrameAnim(targetTag, width, height, srcWidth, srcHeight) {
    this.name = "";
    if (srcHeight == null || srcHeight == 0) srcHeight = height;
    if (srcWidth == null || srcWidth == 0) srcWidth = width;


    var target = window.document.getElementById(targetTag);//class name or id name
    var isPlaying = false;

    var speed = 100;
    var posY = 0;
    var posX = 0;
    var x = 0;
    var y = 0;
    var currentFrame = 1;
    var targetFrame = 0;
    var targetPercent = 0;
    var vFrame = Math.floor((srcHeight) / height);
    var hFrame = Math.floor((srcWidth) / width);
    var totalFrames = vFrame * hFrame;
    var timer = null;
    var completeCallback;


    this.gotoPercent = function (percent, jump, $speed, callback, loop) {

        if ($speed == null) $speed = speed;

        completeCallback = callback;
        targetPercent = percent;
        targetFrame = Math.floor(targetPercent * totalFrames);
        if (targetFrame <= 0) targetFrame = 0;
        isPlaying = true;


        // timer=setInterval(toFrame,speed);

        if (jump == true) {

            currentFrame = targetFrame;
            toFrame();
        } else {

            timer = setInterval(toFrame, $speed);

        }

    };


    this.loop = function ($speed) {
        if ($speed == null) $speed = speed;
        if (timer != null) {

            clearInterval(timer);

        }
        timer = setInterval(loopAnim, $speed);
    };

    this.stop = function () {
        if (timer != null) {

            clearInterval(timer);

        }
    }

    function loopAnim() {
        currentFrame++;
        if (currentFrame == totalFrames) currentFrame = 1;
        getPOS();
    }


    function getPOS() {

        x = (currentFrame - 1) % hFrame;
        y = Math.floor(currentFrame / hFrame) - 1;
        if (y < 0) y = 0;

        posX = x * width;
        posY = y * height;

        target.style.backgroundPosition = (-posX + "px ") + (-posY + "px");
    }

    function toFrame() {


        if (isPlaying == false) return;
        if (currentFrame > targetFrame) {
            currentFrame--;
            getPOS();
        } else if (currentFrame < targetFrame) {
            currentFrame++;
            getPOS();
        } else {
            getPOS();

            if (timer != null) {

                clearInterval(timer);

            }
            isPlaying = false;

            if (completeCallback != null) {
                completeCallback();
            }
        }


    }


}


//addEvent and removeEvent =========================

function addEvent(element, type, handler,context) {
    if (!handler.$$guid) handler.$$guid = addEvent.guid++;
    if (!element.events) element.events = {};
    var handlers = element.events[type];
    if (!handlers) {
        handlers = element.events[type] = {};
        if (element["on" + type]) {
            handlers[0] = element["on" + type];
        }
    }

    if(context) element.context=context;//define event context for this element;
    handlers[handler.$$guid] = handler;
    element["on" + type] = handleEvent;
}

addEvent.guid = 1;

function removeEvent(element, type, handler) {
    if (element.events && element.events[type]) {
        delete element.events[type][handler.$$guid];
    }
}
function handleEvent(event) {
    var returnValue = true;
    event = event || fixEvent(window.event);
    var handlers = this.events[event.type];

    for (var i in handlers) {
        this.$$handleEvent = handlers[i];
        if (this.$$handleEvent(event,this.context) === false) {
            returnValue = false;
        }
    }
    return returnValue;
};

function fixEvent(event) {
    event.preventDefault = fixEvent.preventDefault;
    event.stopPropagation = fixEvent.stopPropagation;
    return event;
};
fixEvent.preventDefault = function() {
    this.returnValue = false;
};
fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
};


//addEvent and removeEvent end=========================




