//some hacks for ie7,ie8

/**
 * @desc inheritance,idea come from: Kevin Lindsey
 * @param subClass
 * @param baseClass
 */
IWebapp.extend = function (subClass, baseClass) {


    function Empty() {
    }

    Empty.prototype = baseClass.prototype;

    subClass.prototype = new Empty();
    subClass.prototype.constructor = subClass;

    subClass.superConstructor = baseClass;
    subClass.superClass = baseClass.prototype;

    subClass.$super = function (context, params) {

        var p = [];
        for (var i = 0; i < arguments.length; i++) {
            if (i != 0) {
                p.push(arguments[i]);
            }
        }
        subClass.superConstructor.apply(context, p);
        p = null;

    }

    subClass.method = function (context, fun, params) {
        var p = [];
        for (var i = 0; i < arguments.length; i++) {
            if (i > 1) {
                p.push(arguments[i]);
            }
        }
        subClass.superClass[fun].apply(context, p)
        p = null;

    }


}


/**
 * @constant
 * @type {number}
 * @desc If this device is a pc or mac
 *
 * */
IWebapp.APP_ENV_NORMAL = 1;
/**
 * @constant
 * @type {number}
 * @desc If this device can be touch
 * */
IWebapp.APP_ENV_TOUCH = 2;

IWebapp.TAP_TYPE_SHORT = "short";
IWebapp.TAP_TYPE_LONG = "long";

IWebapp._instance = null;

/**
 *
 * @returns {IWebapp} the instance of IWebapp Class
 */
IWebapp.getInstance = function () {
    if (IWebapp._instance == null) IWebapp._instance = new IWebapp();
    return IWebapp._instance;
}

/** @constructor
 *  @desc IWebapp version 2.0<br/>
 Rewrite from previous version,some api changed.<br/>
 The target is make it more fast, smoothing and less memory.
 * */
function IWebapp() {

    this.name = "IWebapp";

    if (IWebapp._instance != null) {
        throw  new Error("IWebapp is singleton class.")
    }
    IWebapp._instance = this;
    this.id = simpleUID();
    /*the assets configuration file*/
    this._assetsXML = null;
    /*the config data of the  app, defined how to use assets and the special behaviour of the app*/
    this._configData = null;
    /*store all views assets to this list*/
    this._viewSources = [];
    /*store all pages to this list, the array only store key, and store all the objects as key-value*/
    this._pages = [];
    /**
     * Store all the notifications object to the list.
     * @type {Array}
     */
    this._notifications=[];
    this._notifyViewId=null;
    this._confirmViewId=null;
    this._alertViewId=null;


    /*attach pages to this HTMLElement*/
    this._container = null;
    /*sometimes we want use jquery object of this HTMLElement*/
    this._$container = null;
    /*root path of meida assets*/
    this._mediaServer = "";
    /*root path of api address*/
    this._apiServer = "";
    this._defaultLang = null;
    /*load views of app*/
    this._loader = new IWPLoader();

    IWebapp.checkTouchable();
    this._ieFix();

    //touch handle stuff
    this._touchDisThreshold = 225;
    this._touchStartTimeThreshold = 60;
    this._touchLongTapTimeThreshold = 600;

    /**
     * If a html element support tap style, css can be like this: a[tap="short"]  or a[tap="long"]
     * @type {string}
     * @private
     */
    this._touchTapAttr = "tap";

    /**
     * If a html element support long tap, add attribute: longtap to node. example:<a longtap="any value" >long tap</a>
     * @type {string}
     * @private
     */
    this._touchLongTapAttr = "longtap";

    this._touchableNodes = ["A", "INPUT", "TEXTAREA", "BUTTON"];
    this._touchableAttr = "touchable";
    this._tapEventTag = "tap";
    this._longTapEventTag = "longtap";
    this._ignoreTouchTag = "ignore";
    this._disableTag = "disbale";


    this._touchTarget = null;
    this._touchTime = null;


}

iwp = window.iwp = IWebapp;
//static function at here=================

/**
 * Sometimes we want know if the target device is touchable.
 */
IWebapp.checkTouchable = function () {
    trace("check touch")
    if (IWebapp.touchable == true) {
        IWebapp.getInstance().handleTouch();
    } else {
        var touchResult = function (e, context) {
            IWebapp.touchable = true;

            removeEvent(window.document.body, "touchstart", touchResult)
            removeEvent(window.document.body, "mousedown", mouseResult)
            removeEvent(window.document.body, "mousemove", mouseResult)

            IWebapp.getInstance().handleTouch();
            trace(IWebapp.touchable)
        }

        var mouseResult = function (e, context) {
            IWebapp.touchable = false;

            removeEvent(window.document.body, "touchstart", touchResult)
            removeEvent(window.document.body, "mousedown", mouseResult)
            removeEvent(window.document.body, "mousemove", mouseResult)

            IWebapp.getInstance().handleMouse();

            trace("mouse handle" + IWebapp.touchable)
        }

        addEvent(window.document.body, "touchstart", touchResult)
        addEvent(window.document.body, "mousedown", mouseResult)
        addEvent(window.document.body, "mousemove", mouseResult)
    }


}


IWebapp._simpleCheckTouchEnable = function () {


    var appVersion = window.navigator.appVersion.toLowerCase();


    return appVersion.indexOf("iphone") >= 0 || appVersion.indexOf("ipad") >= 0 || appVersion.indexOf("ipod") >= 0 || appVersion.indexOf("android") >= 0;
}


IWebapp.touchable = IWebapp._simpleCheckTouchEnable();

IWebapp.removeNode = function (htmlElement) {
    if (htmlElement.parentNode != null) htmlElement.parentNode.removeChild(htmlElement);
}

IWebapp.hasClass = function (target, className) {

    if (target.className == null) return false;
    var regx = new RegExp("\\b" + className + "\\b", "gi");
    var has = target.className.match(regx);
    return (has != null && has.length > 0);

}

IWebapp.removeClass = function (target, className) {
    if (target.className == null) {
        target.className = "";
    } else {
        var regx = new RegExp("\\b" + className + "\\b", "gi");
        var has = target.className.match(regx);

        if (has != null && has.length >= 0) {
            target.className = target.className.replace(className, "");

        }
    }

}
IWebapp.addClass = function (target, className) {
    if (target.className == null) {
        target.className = className;
    } else {
        var regx = new RegExp("\\b" + className + "\\b", "gi");
        var has = target.className.match(regx);
        if (has == null || has.length < 0) {
            target.className += (" " + className);

          //  trace("className:"+className)
        }
    }


}


//public function at below=================


/**
 * @desc initialize the app with a config xml and config data.
 * @param container  {HTMLElement }dom element, attach whole pages to it.
 * @param configPath {string} the path of assets xml. (not include root path)
 * @param configData {object} {
 *  mediaServer:string,
 *  apiServer:string,
 *  _lang:default language name
 *  onReady:call back function when whole required assets loaded.
 * }
 */
IWebapp.prototype.init = function (container, configPath, configData) {
    this._configData = (null == configData) ? {} : configData;

    this._mediaServer = (this._configData.mediaServer == null) ? "" : this._configData.mediaServer;
    this._apiServer = (this._configData.apiServer == null) ? "" : this._configData.apiServer;

    //set language
    if (this._configData._lang != null) {

        L10n.setLang(this._configData._lang);
    } else if (navigator.globalization != null) {
        navigator.globalization.getLocaleName(
            function (language) {
                L10n.setLang(language.value.substring(0, language.value.indexOf("_")));

            },
            function (e) {
                console.log("get language error:" + e);

            }
        );
    }


    //set container
    if (container == null) this._container = window.document.body;
    else this._container = container;

    this._container = $(this._container)

    this._container = $(this._container)

    if (this._container.nodeType) {
        this._$container = $(this._container)
    } else if (this._container[0] != null && this._container[0].nodeType != null) {
        this._$container = this._container;
        this._container = this._container[0];
    } else {
        throw new Error("IWebapp.prototype.init:" + container + " is not a HTML Element");
    }


    //load config xml:
    this.loadStrFile(this._mediaServer + "" + configPath, this._onConfigLoaded, this._loadConfigError, {dataType: "xml", context: this})

}


/**
 * @desc navigate to a page
 * @param pageName
 * @param pageData
 */
IWebapp.prototype.openPage = function (pageObj, pageData) {


    var page = this._initPage(pageObj);

    this._pages.push(page.id);//only push the id of page to array
    this._pages[page.id] = page;

    page.onCreate(pageData);

    
    page = null;



}

IWebapp.prototype.openChildPage = function (pageObj, pageData, parentObj) {


    var parentPage = null;
    if (parentObj == null) {
        //have not set parentPage, use the latest page.
    } else if (typeof parentObj == "string") {
        parentPage = this._pages[parentObj]
    } else if (parentObj instanceof IWPPage) {
        parentPage = parentObj;
    }


    if (parentPage == null) throw new Error(IWPError.PAGE_NOT_EXIST, "Can not find page when open child page");


    var page = this._initPage(pageObj);
    page._parentPageId = parentPage.id;


    this._pages.push(page.id);//only push the id of page to array
    this._pages[page.id] = page;

    parentPage._childPages.push(page.id);


    page.onCreate(pageData);

    parentPage = null;
    page = null;
}




IWebapp.prototype.removePage = function (pageObj) {
    var page = null;
    if (pageObj == null) {
        //have not set parentPage, use the latest page.
    } else if (typeof pageObj == "string") {
        page = this._pages[pageObj]
    } else if (pageObj instanceof IWPPage) {
        page = pageObj;
    }
    if (page == null) throw new Error(IWPError.PAGE_NOT_EXIST, "Can not find page when open child page");

    //remove child pages
    if (page._childPages.length > 0) {

        for (var i = 0; i < page._childPages.length; i++) {
            this.removePage(page._childPages[i]);
            page._childPages.splice(i, 1);
            i--;
        }


    }

    //resume parent page
    if (page._parentPageId != null) {
        var parentPage = this._pages[page._parentPageId];
        if (parentPage != null && parentPage.view != null && parentPage.view.html != null) {

            IWebapp.removeClass(parentPage.view.html, IWPPage.PAGE_CLASS_PAUSEPAGE);

            var index = parentPage._childPages.indexOf(page.id);
            if (index >= 0)  parentPage._childPages.splice(index, 1);
        }
    }

    //destroy self
    this._destroyPage(page);

    page = null;
}



IWebapp.prototype.navBack = function () {

}


IWebapp.prototype.alert = function () {

}

IWebapp.prototype.confirm = function () {

}

/**
 * @desc set the default system view for the app.
 * @param obj [object]: {alertViewId:string, confirmViewId:string, nofifyViewId:string}
 */
IWebapp.prototype.setSystemViews=function(obj){


    if(obj.alertViewId!=null){
        this._alertViewId=obj.alertViewId;
    }

    if(obj.notifyViewId!=null){
        this._notifyViewId=obj.notifyViewId;
    }

    if(obj.confirmViewId!=null){
        this._confirmViewId=obj.confirmViewId;
    }
}
IWebapp.prototype.notify = function (content,opts) {

    var notifyObj=new IWPNotify(this._notifyViewId);
    notifyObj.onCreate();
    this._notifications[notifyObj.id]=notifyObj;
    this._notifications.push(notifyObj.id);

    this._container.appendChild(notifyObj.view.html);


    notifyObj.show(content,opts);
}

IWebapp.prototype.removeNotify=function(target){
    if(target instanceof IWPNotify){

    }else if( typeof(target) =="string"){
        target=this._notifications[target];
    }else{
        target=null;
    }

    if(target!=null) {
        target.view.html.parentNode.removeChild(target.view.html);
        this._notifications[target.id]=null;
        delete  this._notifications[target.id];
        this._notifications.splice(this._notifications.indexOf(target.id),1);

    }

}

/**
 *  return the view which defined in assets xml.
 * @param viewId {string} the id of view
 *
 */
IWebapp.prototype.getView = function (viewId) {
    var view = this._viewSources[viewId];
    var copy = null;
    if (view != null) {
        copy = view.clone();

        //this._createViewElement(copy, viewData);
    }

    return copy;
}


/**
 * @desc :load text format file
 * @param url {string}
 * @param callback {function}
 * @param onError {function}
 * @param opts {object} {dataType:xml|html|text, context:object}
 */
IWebapp.prototype.loadStrFile = function (url, callback, onError, opts) {
    dataType = (opts == null || opts.dataType == null) ? "xml" : opts.dataType;
    context = (opts == null || opts.context == null) ? null : opts.context;
    $.ajax({
        type: "get",
        url: url,
        cache: true,
        dataType: dataType,
        context: context,
        success: callback,
        error: onError
    });


}

/**
 * @desc preload whole images source of app
 * @param file {string | array} the collection of images, it can be single file path or a list of file path
 * @param assetsRoot {string} If there is special root paht of current file.
 * @param placeId   {string} put the file or files to a HTMLElement
 * @param callback  {function} When all the images are done (ignore incorrectly file)
 */
IWebapp.prototype.prepareImages = function (file, assetsRoot, placeId, callback) {
    var files = typeof file == "string" ? [file] : file;
    var loaded = 0;
    var div = document.createElement("div");
    div.setAttribute("id", placeId);
    // div.style.width = "1px";
    // div.style.height = "1px";

    for (var i = 0; i < files.length; i++) {
        var imgNode = document.createElement("img");
        imgNode.onload = imgLoaded;
        imgNode.onerror = imgNode.onabort = imgLoaded;
        imgNode.src = addSlash(assetsRoot) + file[i];
        // imgNode.width = 1;
        // imgNode.height = 1;
        div.appendChild(imgNode)

    }


    function imgLoaded(error) {

        if (error != null && error.type == "error") {
            console.log("load image error: " + error.target.src);
            //console.log(error);
        }


        loaded++;
        if (loaded == files.length) {
            window.document.body.appendChild(div);
            if (callback != null) callback();
        }
    }
}


/**
 * @desc insert one or more js/css file to current html
 * @param file {string | array} the collection of text files, it can be single file path or a list of file path
 * @param assetsRoot {string} If there is special root paht of current file.
 * @param onAllLoad {function}  When all the images are done.
 */
IWebapp.prototype.addJsCss = function (file, assetsRoot, onAllLoad) {

    var files = typeof file == "string" ? [file] : file;
    var headID = document.getElementsByTagName("head")[0];


    var cssLen = window.document.styleSheets.length;

    var jsList = [];

    for (var i = 0; i < files.length; i++) {

        if (files[i].indexOf(".css") > 0) {
            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = addSlash(assetsRoot) + files[i] + "?" + Math.random();
            cssNode.media = 'screen';
            cssLen++;

            headID.appendChild(cssNode);
        } else if (files[i].indexOf(".js") > 0) {
            jsList.push(files[i]);
        }


    }//end for

    var check = setInterval(checkCss, 50);

    function checkCss() {

        //UC has a strange problem, the length of css files more than loaded.
        //so have to use >= instead of ==
        if (window.document.styleSheets.length >= cssLen) {

            clearInterval(check);
            if (jsList.length > 0) {
                loadJs(0);
            } else {
                onFload();
            }
        }

    }

    function loadJs(id) {
        $.getScript(addSlash(assetsRoot) + jsList[id], onJsLoad);
    }

    function onJsLoad(id) {
        if (id < jsList.length - 1) {
            id++;
            loadJs(id);
        } else {
            onFload();
        }
    }

    function onFload() {


        if (onAllLoad) onAllLoad();

    }


}


//protected function at below==============================

IWebapp.prototype._ieFix=function(){
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function(elt , from)
        {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++)
            {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }
}
IWebapp.prototype._onConfigLoaded = function (data) {

    this._assetsXML = $(data);
    //this._loadViews();
    this._loadRequires();


}

IWebapp.prototype._loadConfigError = function (e) {
    trace("load config xml error:" + e);
}

/*load files which are required by app*/
IWebapp.prototype._loadRequires = function () {


    var list = this._assetsXML.find("data > textFile").text().split(";");
    //load language package
    var lanPath = this._assetsXML.find("data > _lang > " + L10n.getLang()).text();
    list.push(lanPath);

    //load all required files.
    this.addJsCss(list, this._mediaServer, this._loadViews);


}

IWebapp.prototype._preLoadImages = function () {
    var _iwebapp = IWebapp.getInstance();

    var imgs = [];
    _iwebapp._assetsXML.find("data > images >img").each(function (index, element) {

        imgs.push($(element).attr("src"));
    });
    _iwebapp.prepareImages(imgs, _iwebapp._mediaServer, "preload", _iwebapp._preImagesLoaded());

    _iwebapp = null;
    imgs = null;
}


IWebapp.prototype._preImagesLoaded = function () {

    this._loader.clear();
    this._onReady();

}

IWebapp.prototype._loadViews = function () {


    var _iwebapp = IWebapp.getInstance();
    if (_iwebapp._viewSources != null) _iwebapp._viewSources = [];
    var loadItem;
    var view;
    _iwebapp._assetsXML.find('data > views >view').each(function (index, element) {
        element = $(element)
        view = new IWPView();
        view.id = element.attr('id');
        view.url = element.text();
        _iwebapp._viewSources.push(view);
        _iwebapp._viewSources[view.id] = view;
        loadItem = new IWPLoadItem();
        loadItem.url = _iwebapp._mediaServer + view.url;
        loadItem.alias = view.id;
        loadItem.dataType = "text";

        _iwebapp._loader.addFile(loadItem);
        element = null;

    })//end find


    view = null;
    loadItem = null;


    _iwebapp._loader.onAllLoaded = _iwebapp._preLoadImages;
    _iwebapp._loader.onItemLoaded = _iwebapp._viewItemLoaded;
    _iwebapp._loader.start();

}

IWebapp.prototype._viewItemLoaded = function (index, content) {
    var _iwebapp = IWebapp.getInstance();

    var view = _iwebapp._viewSources[index];
    if (null == view) {
        console.log("can not find view data index:" + index)
        return;
    }
    view.text = content;

    _iwebapp = null;
    view = null;

}


IWebapp.prototype._onReady=function(){

    var views=this._assetsXML.find("data > views")
    var obj={notifyViewId:views.attr("notifyViewId"),alertViewId:views.attr("alertViewId"),confirmViewId:views.attr("confirmViewId")};
    this.setSystemViews(obj);

    views=null;


    if (this._configData.onReady != null){
        this._configData.onReady();
        this._configData.onReady=null;//clear reference
    }

}



//IWebapp.prototype._createViewElement = function (view, viewData) {
//    if (view.html == null) {
//        var viewContainer = window.document.createElement("div");
//
//        if(viewData!=null){
//            if(viewData.type==IWPPage.PAGE_TYPE_DIALOG){
//                viewContainer.className = IWPPage.PAGE_CLASS_DIALOG;
//            }else{
//                viewContainer.className = IWPPage.PAGE_CLASS_NORMAL;
//            }
//        }else{
//            viewContainer.className = IWPPage.PAGE_CLASS_NORMAL;
//        }
//        view.html = viewContainer;
//    }
//    view.html.innerHTML = view.text;
//    return view;
//}


/**
 * @desc append  view of  the page to stage
 * @param page
 */
IWebapp.prototype._addPageToStage = function (page) {
    if (page == null || page.view == null || page.view.html == null) throw new Error(IWPError.PAGE_NOT_EXIST_VIEW);



    if(page.type==IWPPage.PAGE_TYPE_NORMAL){



        if (page.view.fillView == true) {
            var $page = null;
            for (var i = 0; i < this._pages.length; i++) {
                $page = this._pages[this._pages[i]];


                //&& $page.type!=IWPPage.PAGE_TYPE_DIALOG
                if ($page.view != null && $page.view.html != null && $page.id != page.id  ) {

                    //If target page is  parent of current page,hidden target page.
                    if ($page.id == page._parentPageId) {
                        IWebapp.addClass($page.view.html, IWPPage.PAGE_CLASS_PAUSEPAGE);
                    } else {
                    //If not, remove it.
                        this.removePage($page);
                        i--;
                    }

                }
            }
        } else {
            trace("The page have not fill view ")
        }

    }else if(page.type==IWPPage.PAGE_TYPE_DIALOG){
        //Current page is a dialog, so we can not remove old page.
        //Just display over these layers
//         $page = null;
//        for ( i = 0; i < this._pages.length; i++) {
//            $page = this._pages[this._pages[i]];
//
//
//        }


    }


    this._$container.append(page.view.html);
}


IWebapp.prototype._destroyPage = function (page) {

    IWebapp.removeNode(page.view.html); //remove view from stage
    delete this._pages[page.id]; //remove the object from page collection
    var index = this._pages.indexOf(page.id);
    if (index >= 0) {
        this._pages.splice(index, 1);//remove the id from page list.
    }
    page.onDestroy();
}

IWebapp.prototype._initPage = function (pageObj) {
    var page = null;
    if (typeof pageObj == "string") {

        page = eval("new " + pageObj + "()");//need test, if it's too slowly, should change other way.
    } else if (pageObj instanceof IWPPage) {

        page = pageObj;
    } else {
        throw new Error(IWPError.PAGE_INCORRECT_OBJECT, "This is not a instance of IWPPage");
    }

    if (page.id == null) {
        throw new Error(IWPError.PAGE_NOT_INITIALIZED, "The IWPPage need execute super constructor function,example: ClassName.$super(this)");
    }

    return page;
}


IWebapp.prototype.handleTouch = function () {
    console.log("====handleTouch====")
    addEvent(window.document.body, "touchstart", this._onTouchStart, this);
    //addEvent(window.document.body, "touchend", this._onTouchEnd, this);


}

IWebapp.prototype.handleMouse = function () {
    console.log("====handle mouse====")
    addEvent(window.document.body, "mousedown", this._onMouseDown, this);
    // addEvent(window.document.body, "mouseup", this._onTouchEnd, this);
}


IWebapp.prototype._onTouchStart = function (e, context) {


    if (context._touchTarget != null) {
        var preTarget = context._touchTarget;
        preTarget.removeAttribute(context._tapEventTag);
    }

    context._touchTarget = context._getTouchTarget(e.target);


    if (context._touchTarget != null) {

        var touch = e.touches[0];

        context._touchTarget.touchTime = (e.timestamp || Date.now());
        context._touchTarget.touchXMov = context._touchTarget.touchX = touch.pageX;
        context._touchTarget.touchYMov = context._touchTarget.touchY = touch.pageY;
        context._touchTarget.timer = setInterval(context._onTouching, 30);
        addEvent(window.document.body, "touchmove", context._onTouchMove, context);
        addEvent(window.document.body, "touchend", context._onTouchEnd, context);
    }

    e.preventDefault();
    return false;

}

IWebapp.prototype._onTouching = function (target) {

    var context = IWebapp.getInstance();
    if (target == null) target = context._touchTarget;

    var delayTime = Date.now() - target.touchTime;
    if (delayTime >= context._touchStartTimeThreshold) {
        //trace("short:"+(target.tap ==null)+"   :"+typeof  target.tap)
        if (target.tap == null || target.tap=="") {
            //IE8,IE7 has bug when use css selector: .classname[attr=""]
            //target.setAttribute(context._touchTapAttr, IWebapp.TAP_TYPE_SHORT);

            IWebapp.addClass(target,context._touchTapAttr)
            target.tap = IWebapp.TAP_TYPE_SHORT;

            //trace(target.tap)

        } else if ((target.tap == IWebapp.TAP_TYPE_SHORT) && (delayTime >= context._touchLongTapTimeThreshold) && (IWebapp.hasClass(context._touchLongTapAttr) ==false)) {
            target.tap = IWebapp.TAP_TYPE_LONG;

           // target.setAttribute(context._touchTapAttr, IWebapp.TAP_TYPE_LONG);

            IWebapp.addClass(target,context._touchLongTapAttr);
            IWebapp.removeClass(target,context._touchTapAttr);
            clearInterval(target.timer);
            target.timer = null;
             trace("===========dispatch long tap======target:"+target.nodeName+"===========");
            context._dispatchEvent(target, context._longTapEventTag)
        } else {

        }


    }

   // trace("toccc:"+target.tap  +" delayTime:"+delayTime+"/"+context._touchStartTimeThreshold)


}

IWebapp.prototype._onTouchMove = function (e, context) {
    // e.preventDefault();

    var touch = e.touches[0];
    var target = context._touchTarget;
    target.touchXMov = touch.pageX;
    target.touchYMov = touch.pageY;


}

IWebapp.prototype._onTouchEnd = function (e, context) {

    if (IWebapp.touchable == true) {
        removeEvent(window.document.body, "touchmove", context._onTouchMove);
        removeEvent(window.document.body, "touchend", context._onTouchEnd);
    } else {
        removeEvent(window.document.body, "mousemove", context._onMouseMove);
        removeEvent(window.document.body, "mouseup", context._onTouchEnd);
    }

    var target = context._touchTarget;


    if (target.tap != null) {

        var distance = (target.touchXMov - target.touchX) * (target.touchXMov - target.touchX) + (target.touchYMov - target.touchY) * (target.touchYMov - target.touchY);
        //trace("x:"+target.touchXMov+"-"+target.touchX+",y:"+target.touchYMov+"-"+target.touchY+","+distance +"/"+context._touchDisThreshold+"   " +target.tap+"/"+IWebapp.TAP_TYPE_SHORT)
        if (distance < context._touchDisThreshold && target.tap == IWebapp.TAP_TYPE_SHORT) {

            context._dispatchEvent(target, context._tapEventTag);

        }


    }

    clearInterval(target.timer);
    target.timer = null;
    //IE 8 don't have delete.
//    delete target.timer;
//    delete target.tap;
//    delete target.touchX;
//    delete target.touchY;
//    delete target.touchTime;

    target.tap=null;
    target.touchX=0;
    target.touchY=0;
    target.touchTime=0;

//    delete target["timer"];
//    delete target["tap"];
//    delete target["touchX"];
//    delete target["touchY"];
//    delete target["touchTime"];

   // target.setAttribute(context._touchTapAttr, "");
    IWebapp.removeClass(target,context._touchTapAttr);
    IWebapp.removeClass(target,context._touchLongTapAttr);

    context._touchTarget = null;
    target = null;


}

IWebapp.prototype._dispatchEvent = function (target, EventType) {


    var bindEvent = target.getAttribute("on" + EventType);

    if (bindEvent != null && bindEvent != "undefined" && bindEvent != "") {
        eval(bindEvent.trim());
    }


//    if(document.createEvent){
//         var event = document.createEvent("MouseEvents");
//        event.initMouseEvent(EventType, true, true, window,
//        0, 0, 0, 0, 0, false, false, false, false, 0, null);
//        $(target).trigger(EventType, event);
//    }else{
//         event = document.createEventObject();
//
//       // trace( window.document.getElementById("loginBtn"));
//        // window.document.getElementById("loginBtn").fireEvent("on"+EventType, event);
//
//        target.fireEvent("onclick");
//
//    }

    $(target).trigger(EventType)


}

IWebapp.prototype._onMouseDown = function (e, context) {

    //
    if (context._touchTarget != null) {
        var preTarget = context._touchTarget;
        preTarget.removeAttribute(context._tapEventTag);
    }

    var target = (e.target) ? e.target : e.srcElement;
    context._touchTarget = context._getTouchTarget(target);


    if (context._touchTarget != null) {
        //trace("got touch target:" + context._touchTarget.nodeName)


        context._touchTarget.touchTime = (e.timestamp || Date.now());
        context._touchTarget.touchXMov = context._touchTarget.touchX = e.pageX || e.clientX ;
        context._touchTarget.touchYMov = context._touchTarget.touchY = e.pageY || e.clientY ;
        context._touchTarget.timer = setInterval(context._onTouching, 30);
        addEvent(window.document.body, "mousemove", context._onMouseMove, context);
        addEvent(window.document.body, "mouseup", context._onTouchEnd, context);
    }

    e.preventDefault();
    return false;
}

IWebapp.prototype._onMouseMove = function (e, context) {
    //e.preventDefault();


    var target = context._touchTarget;
    target.touchXMov = e.pageX || e.clientX ;
    target.touchYMov = e.pageY || e.clientY;


}

IWebapp.prototype._onMouseUp = function (e, context) {

    //use _onTouchEnd to instead of this function.
    /*
     removeEvent(window.document.body, "mousemove", context._onMouseMove);

     var target = context._touchTarget;


     clearInterval(target.timer);
     target.timer = null;
     delete target.timer;
     delete target.tap;
     delete target.touchX;
     delete target.touchY;
     delete target.touchTime;
     target.setAttribute(context._touchTapAttr, "");




     if (target.tap != null) {

     var distance = (target.touchXMov - target.touchX) * (target.touchXMov - target.touchX) + (target.touchYMov - target.touchY) * (target.touchYMov - target.touchY);

     if (distance < context._touchDisThreshold) {
     trace("dispatch event");
     //context._dispatchEvent(target,context._tapEventTag);

     }
     }


     context._touchTarget=null;
     target=null;*/
}


IWebapp.prototype._getTouchTarget = function (target) {

    //  trace("_getTouchTarget:"+target+"  :"+target.parentNode.nodeName)


    while (target != null) {



        if (target.getAttribute != null && (target.getAttribute(this._ignoreTouchTag) == null) && (this._touchableNodes.indexOf(target.nodeName) >= 0 || target.getAttribute(this._touchableAttr) == this._touchableAttr)) {

            return target;
        } else {

//            if(target.hasOwnProperty("getAttribute")){
//                trace("ignore:"+target.getAttribute(this._ignoreTouchTag))
//                trace("ignore:"+target.getAttribute(this._touchableAttr))
//            }else{
//                trace("No getAttribute "+target.getAttribute);
//            }
//
//
//            trace("touchable:"+this._touchableNodes.indexOf(target.nodeName)+">>"+target.nodeName+"?"+this._touchableNodes);
//            trace("continure find:"+target.nodeName+ " parent:"+target.parentNode);
            target = target.parentNode;
        }



    }

    trace("have not get touch target>>>")
    return null;


}
//==============OTHER CLASS=================================


/**
 *
 * @constructor
 * @desc Page's view
 */
function IWPView() {
    /**
     *
     * @type {string}
     */
    this.id = null;
    /**
     * @desc usually make it to null, we use text to hold content
     * @type {HTMLElement}
     */
    this.html = null;
    /**
     *
     * @type {string}
     */
    this.text = null;

    /**
     * @desc If this is true,will hidden whole views behind this view.
     * @type {boolean}
     */
    this.fillView = true;

}
IWPView.prototype.clone = function () {
    return $.extend(true, {}, this);
}
/**
 * @desc the app have lots of page, the same like Activity in android.
 * @constructor
 */
function IWPPage() {
    /**
     * Unique id
     * @type {string}
     */
    this.id = "IWPPage_" + IWPPage._index++;

    /**
     * @desc the IWPPage object used by the page
     * @type {IWPView}
     */
    this.view = null;
    /**
     * @desc If singlePage is true, when open a new page, this page would be destroy.
     * @type {boolean}
     */
    this.singlePage = true;

    /**
     * @desc store id of child pages. if the parent page removed, all child pages would be remove.
     * @type {Array}
     */
    this._childPages = [];

    /**
     * If this page is a child page of others
     * @type {string}
     */
    this._parentPageId = null;

    this._status = IWPPage.STATUS_UNREADY;
    this._viewItemId = 1;
    this.type=IWPPage.PAGE_TYPE_NORMAL;


}

IWPPage.STATUS_UNREADY = 0;
IWPPage.STATUS_NORMAL = 1;
IWPPage.STATUS_PAUSED = 2;
IWPPage.STATUS_STOPED = 3;

IWPPage.PAGE_TYPE_NORMAL=0;
IWPPage.PAGE_TYPE_DIALOG=1;
IWPPage.PAGE_TYPE_NOTIFY=2;

IWPPage.PAGE_CLASS_NORMAL="page";
IWPPage.PAGE_CLASS_DIALOG="dialog";
IWPPage.PAGE_CLASS_NOTIFY="notify";
IWPPage.PAGE_CLASS_PAUSEPAGE="pausePage";
IWPPage._index=0;

/**
 * check the page's status, don't set it.
 * @type {number}
 */
IWPPage.prototype.getStatus = function () {
    return this._status
}

/**
 * @desc When the page will be add to container, this function would be execute.<br/>Don't execute this function manually.
 * @param pageData {object} Data from other pages or classes
 */
IWPPage.prototype.onCreate = function (pageData) {


}

IWPPage.prototype.onPause = function () {

}

IWPPage.prototype.onResume = function () {

}

IWPPage.prototype.onStop = function () {

}

IWPPage.prototype.onRestart = function () {

}

IWPPage.prototype.onDestroy = function () {

}


/**
 * @desc get HTMLElement in the view of the page.
 * @param id {string}
 * @param needUpdateId {boolean} If the element need update to a new unique id, set it to true; default is true.
 * @param newId {string} If this needUpdatedId to true,and you want define the special id. but the real id is page's id+"+"+newId
 * @returns {HTMLElement}
 */
IWPPage.prototype.findViewItem = function (id, needUpdateId, newId) {
    var item = window.document.getElementById(id);
    if (item == null) {
        return null;
    }

    if(needUpdateId==null) needUpdateId=true;

    if (needUpdateId == true) {
        if (newId != null) {
            item.id = this.id + "_" + newId;
        } else {
            item.id = this.id + "_" + this._viewItemId++;
        }
    }

    return item;
}

/**
 * @desc set view of page and add it to stage.
 * @param viewId
 * @param autoAddedToStage
 */
IWPPage.prototype.setView = function (viewId, viewData, autoAddedToStage) {
    this.view = IWebapp.getInstance().getView(viewId);
    if (this.view == null) {
        //throw  new Error("Can not find the view:"+viewId,IWPError.PAGE_NOT_EXIST_VIEW);
        throw  new Error(IWPError.PAGE_NOT_EXIST_VIEW, "Can not find the view:" + viewId);
    }



    this._createViewElement(viewData);
    if (autoAddedToStage != false) {

        IWebapp.getInstance()._addPageToStage(this);

    }
}

IWPPage.prototype._createViewElement = function ( viewData) {

    var container=null;
    if (this.view.html == null) {
        var viewContainer = window.document.createElement("div");
        container=viewContainer;
        if(this.type==IWPPage.PAGE_TYPE_DIALOG){
            viewContainer.className = IWPPage.PAGE_CLASS_DIALOG;

            var wrapper=window.document.createElement("div");
            wrapper.className="dialogWrapper";
            viewContainer.appendChild(wrapper);

            container=wrapper;

        }else if(this.type==IWPPage.PAGE_TYPE_NORMAL){
            viewContainer.className = IWPPage.PAGE_CLASS_NORMAL;

        }else if(this.type==IWPPage.PAGE_TYPE_NOTIFY){
            viewContainer.className = IWPPage.PAGE_CLASS_NOTIFY;

        }

        this.view.html = viewContainer;
        container.innerHTML = this.view.text;

        if(this.type==IWPPage.PAGE_TYPE_DIALOG){
            IWebapp.addClass(container.childNodes[0],"dialogContent");
        }
    }//end if



    container=null;



}

/**
 * @desc If set autoAddedToStage to false when setView, can add view to stage manually.
 */
IWPPage.prototype.addViewToStage = function () {
    if (this.view == null) throw  new Error(IWPError.PAGE_NOT_EXIST_VIEW, "Can not find view of the page");

    IWebapp.getInstance()._addPageToStage(this);
}

IWPPage.prototype.close = function () {
    if (this._parentPageId == null) return;

    IWebapp.getInstance().removePage(this);

}

function IWPPageData() {

}

IWebapp.extend(IWPNotify, IWPPage);
/**
 * Set the message node's id to "msgTxt", the message will display in that node
 * @constructor
 */
function IWPNotify(viewId){
    IWPNotify.$super(this);
    this.type=IWPPage.PAGE_TYPE_NOTIFY;
    this.msgTxt=null;
    this.delay=1000;
    this.viewId=viewId;
}

IWPNotify.prototype.onCreate=function(pageData){

    trace(this.viewId)
    this.setView(this.viewId);
    var txtId=this.view.html.childNodes[0].getAttribute("data-notify-target");
    if(txtId==null || txtId.trim().length==0) this.msgTxt= this.view.html.childNodes[0];
    else  this.msgTxt=this.findViewItem(txtId);

}


IWPNotify.prototype.close=function(){

}

/**
 *
 * @param content [object | string]
 * @param delay [number]
 */
IWPNotify.prototype.show=function(content,delay){
    if(typeof content =="string"){
        this.msgTxt.innerHTML=content
    }else {
        this.msgTxt.appendChild(content);
    }

    if(delay!=null) this.delay=delay;

    var target=this;
    setTimeout(function(){
        IWebapp.getInstance().removeNotify(target)
    },this.delay);
}

/**
 * @desc the error code start from 100001
 * @constructor
 */
function IWPError() {

}

IWPError.PAGE_NOT_EXIST = 100001;
IWPError.PAGE_INCORRECT_OBJECT = 100002;
IWPError.PAGE_NOT_INITIALIZED = 100003;
IWPError.PAGE_NOT_EXIST_VIEW = 100004;


/**
 * IWPLoader:Load html,text content.
 *
 * */

/**
 *
 * @constructor
 * @desc Load text files by queue
 */
function IWPLoader() {
    this.index = 0;
    this.list = [];
    this.state = IWPLoader.STATUS_FREE;
    /**
     *
     * @type {function}
     */
    this.onAllLoaded = null;
    /**
     *
     * @type {function}
     */
    this.onItemLoaded = null;

    /**
     *
     * @type {function}
     */
    this.onLoadError = null;

}
/**
 * @constant
 * @type {number}
 */
IWPLoader.STATUS_FREE = 1;
/**
 * @constant
 * @type {number}
 */
IWPLoader.STATUS_BUSY = 2;

/**
 * @desc add a load object to queue
 * @param loadItem
 */
IWPLoader.prototype.addFile = function (loadItem) {
    this.list.push(loadItem);
}

/**
 * @desc start to load
 */
IWPLoader.prototype.start = function () {

    if (IWPLoader.STATUS_FREE == this.state) {
        this.state = IWPLoader.STATUS_BUSY;
        this._loadItem(this.index);
    }
}

IWPLoader.prototype._allLoaded = function () {
    this.state = IWPLoader.STATUS_FREE;
    if (this.onAllLoaded != null) this.onAllLoaded();
}


/**
 * @desc Clear all the data in this object
 */
IWPLoader.prototype.clear = function () {
    var item = null;

    while (this.list.length > 0) {
        item = this.list[0];
        item.content = null;

        delete item;
        this.list.splice(0, 1);
    }
    item = null;
    this.index = 0;
    this.state = IWPLoader.STATUS_FREE;
    this.onAllLoaded = null;
    this.onItemLoaded = null;
    this.onLoadError = null;


}

/**
 * @desc get loadItem by index
 * @param id {number}
 * @returns {IWPLoadItem}
 */
IWPLoader.prototype.getItemByIndex = function (id) {
    if (this.list == null || id >= this.list.length) return null;
    return  this.list[id];
}

/**
 * @desc get loadItem by name
 * @param alias {string}
 * @returns {IWPLoadItem}
 */
IWPLoader.prototype.getItemByName = function (alias) {
    var len = this.list.length;
    var loadItem;
    for (var i = 0; i < len; i++) {
        loadItem = this.list[i];
        if (loadItem.alias == alias) return loadItem;
    }
    return null;
}


IWPLoader.prototype._loadItem = function (id) {
    var loadItem = this.list[id];
    $.ajax({
        type: "get",
        url: loadItem.url,
        cache: loadItem.cache,
        dataType: loadItem.dataType,
        context: this,
        success: this._itemLoaded,
        error: this._loadError
    });
}

IWPLoader.prototype._itemLoaded = function (content) {

    var $loadItem = this.list[this.index];
    $loadItem.content = content;

    if (this.onItemLoaded != null) {

        this.onItemLoaded(this.index, content);
    }
    if (this.index == this.list.length - 1) this._allLoaded();
    else {

        this.index++;
        this._loadItem(this.index);

    }
}

IWPLoader.prototype._loadError = function (XMLHttpRequest, textStatus, errorThrown) {
    trace("load item: failed!");
    if (this.onLoadError != null) this.onLoadError(XMLHttpRequest, textStatus, errorThrown)
}


/**
 * @desc the item of IWPLoader
 * @constructor
 */
function IWPLoadItem() {
    /**
     * @desc the url of file
     * @type {string}
     */
    this.url = null;
    /**
     * @desc the loaded content
     * @type {object}
     */
    this.content = null;
    this.dataType = "html";
    this.cache = "false";
    /**
     * the name of file
     * @type {string}
     */
    this.alias = null;

}


/**
 * @desc Localization of languages
 * @constructor
 */
function L10n() {


}

/**
 * @desc set the default language
 * @type {string}
 */
L10n.defaultLang = "en";
L10n._lang = "en";
/**
 * @desc set support languages,  example: L10n.support="en,zh"
 * @type {string}
 */
L10n.support = "en,zh";
L10n._langData = null;

L10n.setLang = function (lang) {
    lang = lang.toLowerCase();

    if (L10n.support.indexOf(lang) < 0) {

        L10n._lang = L10n.defaultLang;
    }
    L10n._lang = lang;

}
/**
 * @desc get the name of language
 * @returns {string}
 */
L10n.getLang = function () {
    return L10n._lang;
}

/**
 * set the data of current language
 * @param obj
 */
L10n.setData = function (obj) {
    if (obj == null)  L10n._langData = eval(L10n._lang);
    else L10n._langData = obj;
}

/**
 * @desc translate the tag to localize words.
 * @param label {string}
 * @returns {string}
 */
L10n.trans = function (label) {
    return L10n._langData[label];

}


/**
 * @desc Convert all the tag:${tag name} to localized words.
 * @param content {string}
 * @returns {string}
 */
L10n.apply = function (content) {

    var regx = /\$\{\w+\}/g;
    var labels = content.match(regx);
    if (labels == null || labels.length == 0) {
        return content;
    }
    var len = labels.length;

    var langStr = "";

    var transtr = content;
    for (var i = 0; i < len; i++) {
        label = labels[i].replace("${","").replace("}", "");

        langStr = L10n._langData[label];

        transtr = transtr.replace(new RegExp("\\${"+label+"}", "g"), langStr);


    }


    return transtr
}

L = L10n;



