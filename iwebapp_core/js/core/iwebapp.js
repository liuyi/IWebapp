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
    this._notifications = [];
    this._notifyViewId = null;
    this._confirmViewId = null;
    this._alertViewId = null;

    /**
     * Store all the history data to this list.
     * @type {Array}
     * @private
     */
    this._history = [];
    this._historyIndex = -1;
    this._hashList = [];
    this._currentPageAlias = "";
    this._defualtPageId = "";
    // this._userChangeHash=false;//If is user press back button or forward button, set it to true;

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
    this._switchPlus = null;


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
    this._touchBubblesNodes = ["INPUT", "TEXTAREA"];
    this._touchableAttr = "touchable";
    this._tapEventTag = "tap";
    this._longTapEventTag = "longtap";
    this._ignoreTouchTag = "ignore";
    this._disableTag = "disabled";

    this._isMouseDown = false;


    this._touchTarget = null;
    this._touchTime = null;

    IWebapp.checkTouchable();
    this._ieFix();
}

iwp = window.iwp = IWebapp;
//static function at here=================

/**
 * Sometimes we want know if the target device is touchable.
 */
IWebapp.checkTouchable = function () {
    //trace("check touch")
    if (IWebapp.touchable == true) {
        IWebapp.getInstance()._handleTouch();
    } else {
        var touchResult = function (e, context) {
            IWebapp.touchable = true;

            removeEvent(window.document.body, "touchstart", touchResult)
            removeEvent(window.document.body, "mousedown", mouseResult)
            removeEvent(window.document.body, "mousemove", mouseResult)

            IWebapp.getInstance()._handleTouch();
            // trace(IWebapp.touchable)
        }

        var mouseResult = function (e, context) {
            IWebapp.touchable = false;

            removeEvent(window.document.body, "touchstart", touchResult)
            removeEvent(window.document.body, "mousedown", mouseResult)
            removeEvent(window.document.body, "mousemove", mouseResult)

            IWebapp.getInstance()._handleMouse();

            //trace("mouse handle" + IWebapp.touchable)
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
            target.className = target.className.replace(className, "").trim();

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
            target.className = target.className.trim() + " " + className;

            //  trace("className:"+className)
        }
    }


}
IWebapp.disableNode = function (htmlElement) {
    IWebapp.addClass(htmlElement, IWebapp.getInstance()._disableTag);
    htmlElement.setAttribute(IWebapp.getInstance()._disableTag)
}

IWebapp.resumeNode = function (htmlElement) {


    IWebapp.removeClass(htmlElement, IWebapp.getInstance()._disableTag);
    htmlElement.removeAttribute(IWebapp.getInstance()._disableTag)
}

IWebapp.getElementsByClassName = function (target, classname) {
    if (target.getElementsByClassName != null) {

        return target.getElementsByClassName(classname);
    } else {
        var regx = new RegExp("\\b" + classname + "\\b", "gi");
        var has = null;
        var elements = [];
        getList(target);
        return elements;
    }

    function getList(target) {
        if (target.childNodes == null || target.childNodes.length == 0)  return;


        var len = target.childNodes.length;

        for (var i = 0; i < len; i++) {
            var item = target.childNodes[i];
            if (item.className != null) {
                has = item.className.match(regx);
                if (has != null && has.length > 0) {

                    elements.push(item);
                }
            }
            getList(item);
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
IWebapp.prototype.openPage = function (pageObj, pageData, hash) {

    var page = this._initPage(pageObj);

    this._pages.push(page.id);//only push the id of page to array
    this._pages[page.id] = page;

    console.time("create_page")
    page.onCreate(pageData);
    console.timeEnd("create_page")

    if (hash == null || hash.length === 0) {

        this._addToHistory(page, pageData);
    } else {

        this._currentPageAlias = "/" + page.alias;


        page.onHashChange(hash);
    }

    var pageId = page.id;
    page = null;

    return pageId;


}

IWebapp.prototype.setSwitchPlus = function (iwpSwitch) {
    this._switchPlus = iwpSwitch;
}


IWebapp.prototype.openChildPage = function (pageObj, pageData, parentObj, hash) {


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
    if (hash == null || hash.length === 0) {

        this._addToHistory(page, pageData, parentPage);
    } else {
        //open child page

        this._currentPageAlias += "/" + page.alias;

        page.onHashChange(hash);
    }


    var pageId = page.id;
    parentPage = null;
    page = null;

    return pageId;
}


IWebapp.prototype.removePage = function (pageObj, changeLink, resumeParent) {

    var context = IWebapp.getInstance();
    if (resumeParent == null) resumeParent = true;
    var page = null;
    if (pageObj == null) {
        //have not set parentPage, use the latest page.
    } else if (typeof pageObj == "string") {
        page = context._pages[pageObj]
    } else if (pageObj instanceof IWPPage) {
        page = pageObj;
    }

    // if (page == null) throw new Error(IWPError.PAGE_NOT_EXIST, "Can not find page when open child page:"+pageObj);
    if (page == null) throw new Error("Can not find page when remove page:" + pageObj, IWPError.PAGE_NOT_EXIST);

    //remove child pages
    if (page._childPages.length > 0) {

        for (var i = 0; i < page._childPages.length; i++) {
            context.removePage(page._childPages[i]);
            page._childPages.splice(i, 1);
            i--;
        }


    }

    //resume parent page
    if (page._parentPageId != null && resumeParent == true) {
        var parentPage = context._pages[page._parentPageId];
        if (parentPage != null && parentPage.view != null && parentPage.view.html != null) {

            var index = parentPage._childPages.indexOf(page.id);
            if (index >= 0)  parentPage._childPages.splice(index, 1);


            if (this._switchPlus != null) {

                this._switchPlus.resumeParentPage(parentPage, this._container, context._resumePage, [parentPage.id])

            } else {
                this._resumePage(parentPage)
            }


        }
    }

    //remove hash tag
    if (page.type == IWPPage.PAGE_TYPE_NORMAL && page._parentPageId != null) {

        var hash = window.location.hash.split("/");
        hash.splice(0, 1);

        //if app remove this page, not by browser, updata hash.
        if (window.location.hash == "#" + this._currentPageAlias && changeLink != false) {

            index = hash.indexOf(page.name);
            hash.splice(index);

            this._setHash("/" + hash.join("/"));
        } else {
            //else only update current alias

            this._currentPageAlias = "/" + hash.join("/");

        }


    }

    //destroy self
    var pageId = page.id;


    if (context._switchPlus != null) {
        if (page.type == IWPPage.PAGE_TYPE_NORMAL) {

            // this._switchPlus.removePage($page,context._container,function(){context.removePage(p,null,false)});


            if (resumeParent == true && page._parentPageId != null) {
                context._switchPlus.removeChildPage(page, context._container, context._destroyPage, [pageId])
            } else {
                context._switchPlus.removePage(page, context._container, context._destroyPage, [pageId]);
            }


        } else if (page.type == IWPPage.PAGE_TYPE_NOTIFY) {
            context._switchPlus.removeNotify(page, context._container, context._destroyPage, [pageId]);
        } else if (page.type == IWPPage.PAGE_TYPE_DIALOG) {
            context._switchPlus.removeDialog(page, context._container, context._destroyPage, [pageId]);
        }
    } else {
        context._destroyPage(pageId);
    }


    parentPage = null;
    context = null;
    page = null;
}

/**
 * @desc if user pressed back button or forward button, it should return true else return false.
 * @returns {boolean}
 */
IWebapp.prototype.getCurrentHash = function () {

    return this._currentPageAlias;

}

/**
 * @desc if the hash tag has changed by user or want back/forward, execute this method.
 * @param hash [string] current hash from browse
 */
IWebapp.prototype.onHashChange = function (hash) {

    if (window.location.hash == "#" + this._currentPageAlias) {
        //trace("this is the same hash as app");
        return;
    }


    //remove "#" from hash tag.
    if (hash.indexOf("#/") == 0) {
        hash = hash.substring(2);
    }


    var hashArray = hash.split("/");


    if (this._currentPageAlias == null) this._currentPageAlias = "";
    var currentHash = this._currentPageAlias.toString();
    if (currentHash.indexOf("/") == 0) currentHash = currentHash.substring(1);

    if (currentHash.length > 0) {
        var currentHashArray = currentHash.split("/");
    }

    else {
        currentHashArray = []
    }


    var diffIndex = 0;
    var maxLen = (currentHashArray.length > hashArray.length) ? currentHashArray.length : hashArray.length;
    for (var i = 0; i < maxLen; i++) {
        if (currentHashArray[i] == null || hashArray[i] == null || currentHashArray[i] != hashArray[i]) {
            diffIndex = i;
            break;
        }
    }


    if (diffIndex > 0) {

        //find the parent page:
        var len = this._pages.length;
        var page = null;
        var parentAlias = hashArray[diffIndex - 1];

        for (i = len - 1; i >= 0; i--) {
            page = this._pages[this._pages[i]];
            if (page.alias == parentAlias) {
                break;
            }
        }


        hashArray.splice(0, diffIndex);

        if (page != null) {
            page.onHashChange(hashArray)
        }


    } else {

        var rootPage = this._hashList[hashArray[0]];


        if (rootPage == null) rootPage = this._defualtPageId;
        else rootPage = rootPage.name;

        hashArray.splice(0, 1)

        this.openPage(rootPage, null, hashArray);
    }


}


IWebapp.prototype.back = function () {

    //find current page.
    var pageId = this._pages[this._pages.length - 1];
    var currentPage = this._pages[pageId];

    if (currentPage == null) {
        trace("no current page right now.")
    } else {
        if (currentPage.onBack() == false) {
            //system hold back event

        }
    }

    //trace(this._history)
}


IWebapp.prototype.alert = function (content, confirmCallBack, cancelCallBack, alertName, pageData) {
    if (alertName == null) alertName = "IWPAlert";
    var pageId = this.openPage(alertName, pageData);
    var page = this._pages[pageId];
    page.show(content, confirmCallBack, cancelCallBack);
}

IWebapp.prototype.confirm = function (content, confirmCallBack, cancelCallBack, confirmName, pageData) {

    if (confirmName == null) confirmName = "IWPConfirm";
    var pageId = this.openPage(confirmName, pageData);
    var page = this._pages[pageId];
    page.show(content, confirmCallBack, cancelCallBack);

}

/**
 * @desc set the default system view for the app.
 * @param obj [object]: {alertViewId:string, confirmViewId:string, nofifyViewId:string}
 */
IWebapp.prototype.setSystemViews = function (obj) {


    if (obj.alertViewId != null) {
        this._alertViewId = obj.alertViewId;
    }

    if (obj.notifyViewId != null) {
        this._notifyViewId = obj.notifyViewId;
    }

    if (obj.confirmViewId != null) {
        this._confirmViewId = obj.confirmViewId;
    }
}
IWebapp.prototype.notify = function (content, delay, viewId) {

    if (viewId == null) viewId = this._notifyViewId;
    var notifyObj = new IWPNotify(viewId);
    notifyObj.onCreate();
    this._notifications[notifyObj.id] = notifyObj;
    this._notifications.push(notifyObj.id);

    this._container.appendChild(notifyObj.view.html);


    notifyObj.show(content, delay);


}

IWebapp.prototype.removeNotify = function (target) {
    if (target instanceof IWPNotify) {

    } else if (typeof(target) == "string") {
        target = this._notifications[target];
    } else {
        target = null;
    }

    if (target != null) {
        target.view.html.parentNode.removeChild(target.view.html);
        this._notifications[target.id] = null;
        delete  this._notifications[target.id];
        this._notifications.splice(this._notifications.indexOf(target.id), 1);
        target.onDestroy();

    }

    target = null;

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

IWebapp.prototype._ieFix = function () {

    //add indexOf to Array
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (elt, from) {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
                from += len;

            for (; from < len; from++) {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1;
        };
    }


    //add getElementsByClassName to htmlElement

//    if(Element.prototype.getElementsByClassName==null){
//        trace("old brwoser")
//
//        Element.prototype.getElementsByClassName=function(className){
//            var array=[];
//            return ["sdssd"]
//        }
//    }
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


IWebapp.prototype._onReady = function () {

    var views = this._assetsXML.find("data > views")
    var obj = {notifyViewId: views.attr("notifyViewId"), alertViewId: views.attr("alertViewId"), confirmViewId: views.attr("confirmViewId")};
    this.setSystemViews(obj);

    views = null;

    //these data are use for web mode, not app mode.
    var pages = this._assetsXML.find("data > pages");

    var alias = pages.attr("defualtPageAlias")
    var pagesMap = this._hashList;
    if (pages != null) {
        pages.children("page").each(function () {
            var pageObj = initPageMap(this, alias)
            pagesMap.push(pageObj.alias);
            pagesMap[pageObj.alias] = pageObj;
            if (alias == pageObj.alias) {
                IWebapp.getInstance()._defualtPageId = pageObj.name;
            }
        })
    }
    // trace("this._defualtPageId:"+this._defualtPageId)
    //trace(pagesMap)
    pages = null;
    pagesMap = null;

    function initPageMap(target, parentAlias) {
        var pageObj = {};
        var page = $(target);
        pageObj.name = page.attr("name");
        pageObj.alias = page.attr("alias");

        if (parentAlias != pageObj.alias) {
            pageObj.parentAlias = parentAlias;
        } else {
            pageObj.parentAlias = "";
        }

        pageObj.pages = []


        page.children("page").each(function () {

            var childObj = initPageMap(this, pageObj.alias);
            pageObj.pages.push(childObj.alias);
            pagesMap[childObj.alias] = childObj;
        })

        page = null;
        return pageObj;
    }

    if (this._configData.onReady != null) {
        this._configData.onReady();
        this._configData.onReady = null;//clear reference
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

    var context = this;

    if (page.type == IWPPage.PAGE_TYPE_NORMAL) {


        if (page.view.fillView == true) {
            //find out the chain of parent page
            var pageChain = this._getPageChain(page.id);
            //  trace(pageChain)

            //remove pages
            var $page = null;
            for (var i = 0; i < this._pages.length; i++) {
                $page = this._pages[this._pages[i]];


                //&& $page.type!=IWPPage.PAGE_TYPE_DIALOG
                if ($page.view != null && $page.view.html != null && $page.id != page.id && $page.type != IWPPage.PAGE_TYPE_NOTIFY) {

                    //If target page is  parent of current page,hidden target page.
                    if ($page.id == page._parentPageId) {
//                        IWebapp.addClass($page.view.html, IWPPage.PAGE_CLASS_PAUSEPAGE);
//                        $page._status=IWPPage.STATUS_PAUSED;
//                        $page.onPause();
                        var p = this._pages[i];

                        if (this._switchPlus != null) {
                            if (this._switchPlus.hideParentPage != null) {
                                // this._switchPlus.hideParentPage($page,context._container,function(){context._hidePage(p)})
                                this._switchPlus.hideParentPage($page, context._container, context._hidePage, [p])
                            }

                        } else {
                            context._hidePage(p);
                        }
                    } else if (pageChain.indexOf($page.id) < 0) {
                        //If not, remove it.
//                         trace("pageChain:"+pageChain.indexOf($page.id) +"  id:"+$page.id)
//                         trace(pageChain)
//                         p=this._pages[i];
//                        if(this._switchPlus!=null){
//                            if($page.type==IWPPage.PAGE_TYPE_NORMAL){
//
//                               // this._switchPlus.removePage($page,context._container,function(){context.removePage(p,null,false)});
//                                this._switchPlus.removePage($page,context._container,context.removePage,[p,null,false]);
//                            }else if($page.type==IWPPage.PAGE_TYPE_NOTIFY){
//                                this._switchPlus.removeNotify($page,context._container,context.removePage,[p,null,false]);
//                            }else if($page.type==IWPPage.PAGE_TYPE_DIALOG){
//                                this._switchPlus.removeDialog($page,context._container,context.removePage,[p,null,false]);
//                            }
//                        }else{
//                            this.removePage($page);
//                        }

                        this.removePage($page, null, false);

                    }

                }

            }
        } else {
            trace("The page have not fill view ")
        }

    } else if (page.type == IWPPage.PAGE_TYPE_DIALOG) {
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

    if (this._switchPlus != null) {
        if (page.type == IWPPage.PAGE_TYPE_NORMAL) {


            this._switchPlus.showPage(page, context._container);
        } else if (page.type == IWPPage.PAGE_TYPE_DIALOG) {
            this._switchPlus.showDialog(page, context._container);
        } else if (page.type == IWPPage.PAGE_TYPE_NOTIFY) {
            // this._switchPlus.showNotify(page, context._container);
        }

    }

    context = null;
    page = null;
}




IWebapp.prototype._hidePage = function (pageObj) {
    var context = IWebapp.getInstance()
    var page = null;
    if (typeof pageObj == "string") {
        page = context._pages[pageObj]
    } else if (pageObj instanceof IWPPage) {
        page = pageObj;
    }

    IWebapp.addClass(page.view.html, IWPPage.PAGE_CLASS_PAUSEPAGE);
    page._status = IWPPage.STATUS_PAUSED;
    page.onPause();

    context = null;
    page = null;

}

IWebapp.prototype._resumePage = function (pageObj) {
    var context = IWebapp.getInstance()
    var page = null;
    if (typeof pageObj == "string") {
        page = context._pages[pageObj]
    } else if (pageObj instanceof IWPPage) {
        page = pageObj;
    }

    IWebapp.removeClass(page.view.html, IWPPage.PAGE_CLASS_PAUSEPAGE);

//    var index = page._childPages.indexOf(page.id);
//    if (index >= 0)  page._childPages.splice(index, 1);
    page._status = IWPPage.STATUS_NORMAL;
    page.onResume();

    context = null;
    page = null;

}


IWebapp.prototype._getPageChain = function (pageId, chain) {
    if (chain == null) chain = [];

    var page = this._pages[pageId];
    if (page == null) {
        return chain;
    } else {
        chain.push(page.id);
        var parentPage = this._pages[page._parentPageId];
        if (parentPage != null) {

            this._getPageChain(parentPage.id, chain)
        }
    }


    return chain;
}

IWebapp.prototype._destroyPage = function (page) {

    var context = IWebapp.getInstance();


    if (typeof page == "string") {
        page = context._pages[page]
    }

    if (page == null) {
        return;
    }


    IWebapp.removeNode(page.view.html); //remove view from stage
    delete context._pages[page.id]; //remove the object from page collection
    var index = context._pages.indexOf(page.id);

    //trace("remove page:"+page.id+" index:"+index)
    // trace(this._pages)
    if (index >= 0) {
        context._pages.splice(index, 1);//remove the id from page list.
    }
    page.onDestroy();

    context = null;
    page = null;
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


IWebapp.prototype._handleTouch = function () {
    console.log("====_handleTouch====")
    addEvent(window.document.body, "touchstart", this._onTouchStart, this);
    //addEvent(window.document.body, "touchend", this._onTouchEnd, this);


}

IWebapp.prototype._handleMouse = function () {
    console.log("====handle mouse====")
    addEvent(window.document.body, "mousedown", this._onMouseDown, this);
    // addEvent(window.document.body, "mouseup", this._onTouchEnd, this);
}


IWebapp.prototype._onTouchStart = function (e, context) {


    if (context._touchTarget != null) {
        var preTarget = context._touchTarget;
        preTarget.removeAttribute(context._tapEventTag);
        IWebapp.removeClass(preTarget, context._touchTapAttr);
        IWebapp.removeClass(preTarget, context._touchLongTapAttr);


        if (IWebapp.touchable == true) {
            removeEvent(window.document.body, "touchmove", context._onTouchMove);
            removeEvent(window.document.body, "touchend", context._onTouchEnd);
        } else {
            removeEvent(window.document.body, "mousemove", context._onMouseMove);
            removeEvent(window.document.body, "mouseup", context._onTouchEnd);
        }

        preTarget.tap = null;
        preTarget.touchX = 0;
        preTarget.touchY = 0;
        preTarget.touchTime = 0;

        clearInterval(preTarget.timer);
        preTarget.timer = null;


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


        if (context._touchTarget.onFingerStart) {
            context._touchTarget.onFingerStart(touch.pageX, touch.pageY);
        }

    }

    //e.preventDefault();
    // return false;
    if (context._touchTarget != null && context._touchBubblesNodes.indexOf(context._touchTarget.nodeName) < 0) {
        e.preventDefault();
        return false;
    }
}


IWebapp.prototype._onTouching = function (target) {

    var context = IWebapp.getInstance();
    if (target == null) target = context._touchTarget;

    if (target == null) {


        return;
    }

    var delayTime = Date.now() - target.touchTime;
    if (delayTime >= context._touchStartTimeThreshold) {
        //trace("short:"+(target.tap ==null)+"   :"+typeof  target.tap)
        if (target.tap == null || target.tap == "") {
            //IE8,IE7 has bug when use css selector: .classname[attr=""]
            //target.setAttribute(context._touchTapAttr, IWebapp.TAP_TYPE_SHORT);

            IWebapp.addClass(target, context._touchTapAttr)
            target.tap = IWebapp.TAP_TYPE_SHORT;


        } else if ((target.tap == IWebapp.TAP_TYPE_SHORT) && (delayTime >= context._touchLongTapTimeThreshold) && (IWebapp.hasClass(context._touchLongTapAttr) == false)) {
            target.tap = IWebapp.TAP_TYPE_LONG;

            // target.setAttribute(context._touchTapAttr, IWebapp.TAP_TYPE_LONG);

            IWebapp.addClass(target, context._touchLongTapAttr);
            IWebapp.removeClass(target, context._touchTapAttr);
            clearInterval(target.timer);
            target.timer = null;

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
    if (target == null) {

        return;
    }
    ;
    target.touchXMov = touch.pageX;
    target.touchYMov = touch.pageY;


    if (target.onFingerMove) {
        target.onFingerMove(target.touchXMov, target.touchYMov);
    }
}

IWebapp.prototype._onTouchEnd = function (e, context) {

    context._isMouseDown = false;

    if (IWebapp.touchable == true) {
        removeEvent(window.document.body, "touchmove", context._onTouchMove);
        removeEvent(window.document.body, "touchend", context._onTouchEnd);
    } else {
        removeEvent(window.document.body, "mousemove", context._onMouseMove);
        removeEvent(window.document.body, "mouseup", context._onTouchEnd);
    }

    var target = context._touchTarget;
    if (target == null) {

        return;
    }

    if (target.tap != null) {

        var distance = (target.touchXMov - target.touchX) * (target.touchXMov - target.touchX) + (target.touchYMov - target.touchY) * (target.touchYMov - target.touchY);
        //trace("x:"+target.touchXMov+"-"+target.touchX+",y:"+target.touchYMov+"-"+target.touchY+","+distance +"/"+context._touchDisThreshold+"   " +target.tap+"/"+IWebapp.TAP_TYPE_SHORT)
        if (distance < context._touchDisThreshold && target.tap == IWebapp.TAP_TYPE_SHORT) {

            context._dispatchEvent(target, context._tapEventTag);

        }


    }

    if (context._touchTarget.onFingerUp) {
        context._touchTarget.onFingerUp();
    }
    clearInterval(target.timer);
    target.timer = null;
    //IE 8 don't have delete.
//    delete target.timer;
//    delete target.tap;
//    delete target.touchX;
//    delete target.touchY;
//    delete target.touchTime;

    target.tap = null;
    target.touchX = 0;
    target.touchY = 0;
    target.touchTime = 0;

//    delete target["timer"];
//    delete target["tap"];
//    delete target["touchX"];
//    delete target["touchY"];
//    delete target["touchTime"];

    // target.setAttribute(context._touchTapAttr, "");
    IWebapp.removeClass(target, context._touchTapAttr);
    IWebapp.removeClass(target, context._touchLongTapAttr);


    context._touchTarget = null;
    target = null;


}

IWebapp.prototype._dispatchEvent = function (target, EventType) {


    var bindEvent = target.getAttribute("on" + EventType);

    if (bindEvent != null && bindEvent != "undefined" && bindEvent != "") {
        eval(bindEvent);
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


    context._isMouseDown = true;
    //
    if (context._touchTarget != null) {
        var preTarget = context._touchTarget;
        preTarget.removeAttribute(context._tapEventTag);
        IWebapp.removeClass(preTarget, context._touchTapAttr);
        IWebapp.removeClass(preTarget, context._touchLongTapAttr);


        if (IWebapp.touchable == true) {
            removeEvent(window.document.body, "touchmove", context._onTouchMove);
            removeEvent(window.document.body, "touchend", context._onTouchEnd);
        } else {
            removeEvent(window.document.body, "mousemove", context._onMouseMove);
            removeEvent(window.document.body, "mouseup", context._onTouchEnd);
        }

        preTarget.tap = null;
        preTarget.touchX = 0;
        preTarget.touchY = 0;
        preTarget.touchTime = 0;

        clearInterval(preTarget.timer);
        preTarget.timer = null;


    }

    var target = (e.target) ? e.target : e.srcElement;
    context._touchTarget = context._getTouchTarget(target);


    if (context._touchTarget != null) {


        context._touchTarget.touchTime = (e.timestamp || Date.now());
        context._touchTarget.touchXMov = context._touchTarget.touchX = e.pageX || e.clientX;
        context._touchTarget.touchYMov = context._touchTarget.touchY = e.pageY || e.clientY;


        context._touchTarget.timer = setInterval(context._onTouching, 30);
        addEvent(window.document.body, "mousemove", context._onMouseMove, context);
        addEvent(window.document.body, "mouseup", context._onTouchEnd, context);

        if (context._touchTarget.onFingerStart) {

            context._touchTarget.onFingerStart(context._touchTarget.touchX, context._touchTarget.touchY);
        }
    }

    if (context._touchTarget != null && context._touchBubblesNodes.indexOf(context._touchTarget.nodeName) < 0) {
        e.preventDefault();
        return false;
    }

}

IWebapp.prototype._onMouseMove = function (e, context) {
    //e.preventDefault();


    if (context._isMouseDown != true) {
        IWebapp.prototype._onTouchEnd(e, context);
        return;
    }
    var target = context._touchTarget;
    if (target == null) {

        return;
    }

    target.touchXMov = e.pageX || e.clientX;
    target.touchYMov = e.pageY || e.clientY;

    if (target.onFingerMove) {
        target.onFingerMove(target.touchXMov, target.touchYMov);
    }

}


IWebapp.prototype._getTouchTarget = function (target) {

    while (target != null) {


        if (target.getAttribute != null && (target.getAttribute(this._disableTag) === null || target.getAttribute(this._disableTag) === false || target.getAttribute("disabled").value == undefined) && (target.getAttribute(this._ignoreTouchTag) == null) && (this._touchableNodes.indexOf(target.nodeName) >= 0 || target.getAttribute(this._touchableAttr) == "true")) {

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

            // trace("===>"+target.nodeName +">>"+">"+( (target.getAttribute("disabled").value)==undefined)+">"+ (target.getAttribute(this._ignoreTouchTag) == null)+">"+(this._touchableNodes.indexOf(target.nodeName) >= 0 || target.getAttribute(this._touchableAttr) == this._touchableAttr))

            // trace("<"+target.getAttribute("disabled")+">")
            target = target.parentNode;
        }


    }


    return null;


}


IWebapp.prototype._addToHistory = function (page, pageData, parentPage) {
    if (page.type != IWPPage.PAGE_TYPE_NORMAL) return;
    var hash = window.location.hash.split("/");

//    var pageItem={};
//    pageItem.constructorName=page.constructor.name;
//    pageItem.params=pageData;
//    pageItem.type=page.type;
//    pageItem.parentPageId=page._parentPageId;


    var hash2 = "";
    if (parentPage) {
        //set hash tag
        hash.splice(0, 1)
        var parentHash = parentPage.alias;
        var index = hash.indexOf(parentHash);
        hash.splice(index + 1);

        hash.push(page.alias);
        hash2 = "/" + hash.join("/");


    } else {
        //set hash tag
        hash2 = "/" + page.alias;


    }

    //don't need history,use native history instead of this. (for web mode)
    //this._history.push(pageItem);
    //this._historyIndex=this._history.length-1;

    this._setHash(hash2);


}


IWebapp.prototype._setHash = function (hash) {


    trace("will set hash to :" + hash)

    if (hash == null || hash == "undefined") {
        hash = "";
        //window.location.href = window.location.href.replace(/#.*$/, '#');
    }
    this._currentPageAlias = hash;
    window.location.hash = hash;



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

    /**
     * @desc The class name, don't set it.
     * @type {string}
     */
    this.name = this.constructor.name;

    //fix ie
    if (this.name == null) {
        this.name = this.constructor.toString();
        this.name = this.name.substring(0, this.name.indexOf("(")).replace("function", "").trim();
    }

    this.id = this.name + "_" + IWPPage._index++;

    /**
     * @desc alias will display in url.
     * @type {string} default value is the page's name, maybe it's not friendly for user, should reset it.
     */
        //trace("name:"+this.name)
        //trace(IWebapp.getInstance()._hashList)
        //this.alias=IWebapp.getInstance()._hashList[this.name].alias;
    this.alias = this.name;
    this.childAliasList = [];

    for (var i in IWebapp.getInstance()._hashList) {
        var item = IWebapp.getInstance()._hashList[i];
        // trace("item.name:"+item.name  +"/"+ this.name)
        if (item.name == this.name) {
            this.alias = item.alias;


            for (var k = 0; k < item.pages.length; k++) {
                this.childAliasList[k] = item.pages[k];

            }
            break;
        }

    }


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
    /**
     * @desc the page's type.
     * @type {number}  value should be: [IWPPage.PAGE_TYPE_NORMAL|IWPPage.PAGE_TYPE_DIALOG|IWPPage.PAGE_TYPE_NOTIFY]
     */
    this.type = IWPPage.PAGE_TYPE_NORMAL;


}

IWPPage.STATUS_UNREADY = 0;
IWPPage.STATUS_NORMAL = 1;
IWPPage.STATUS_PAUSED = 2;


IWPPage.PAGE_TYPE_NORMAL = 0;
IWPPage.PAGE_TYPE_DIALOG = 1;
IWPPage.PAGE_TYPE_NOTIFY = 2;

IWPPage.PAGE_CLASS_NORMAL = "page";
IWPPage.PAGE_CLASS_DIALOG = "dialog";
IWPPage.PAGE_CLASS_NOTIFY = "notify";
IWPPage.PAGE_CLASS_PAUSEPAGE = "pausePage";
IWPPage._index = 0;

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

IWPPage.prototype.onDestroy = function () {

}


/**
 * @desc IWPPage can hold back event come from device or browser.
 * @returns {boolean} If return false, use default function of IWEBAPP hold back event.
 */
IWPPage.prototype.onBack = function () {
    return false;
};

IWPPage.prototype.onHashChange = function (hash) {
    //  trace(this.name+ "   >>page hash changed:"+hash)

    // hash.splice(0,1);
    var childHash = hash[0];
    hash.splice(0, 1);
//    trace("childHash:"+childHash +">>>>>>>>"+hash)
//    trace("childAliasList:"+this.childAliasList)
//    trace("find index:"+this.childAliasList.indexOf(childHash))
    if (childHash == "" || childHash == null) {
        // trace("remove child page")
        this.removeChildPage(false);//don't change hash when remove page.
    } else if (this.childAliasList.indexOf(childHash) >= 0) {
        // trace("open child page!!!!!!!"+hash)
        var pageObj = IWebapp.getInstance()._hashList[childHash];
        if (pageObj != null) {
            core.openChildPage(pageObj.name, null, this, hash);
        }

    } else {
        trace("can not find child page, current alias is:" + IWebapp.getInstance()._currentPageAlias);
        IWebapp.getInstance()._setHash(IWebapp.getInstance()._currentPageAlias)
    }
//    if(childHash=="annouce"){
//        core.openChildPage("AnnouncePage", null, this);
//    }else if(childHash==""|| childHash==null){
//        trace("no child hash");
//        this.removeChildPage();
//    }
}

IWPPage.prototype.removeChildPage = function (changeLink) {
    var len = this._childPages.length;

    if (len > 0) {
        for (var i = 0; i < len; i++) {
            IWebapp.getInstance().removePage(this._childPages[i], changeLink);

        }

    }
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

    if (needUpdateId == null) needUpdateId = true;

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

IWPPage.prototype._createViewElement = function (viewData) {

    var container = null;
    if (this.view.html == null) {
        var viewContainer = window.document.createElement("div");

        container = viewContainer;
        if (this.type == IWPPage.PAGE_TYPE_DIALOG) {
            viewContainer.className = IWPPage.PAGE_CLASS_DIALOG;

            var wrapper = window.document.createElement("div");
            wrapper.className = "dialogWrapper";
            viewContainer.appendChild(wrapper);

            container = wrapper;

        } else if (this.type == IWPPage.PAGE_TYPE_NORMAL) {


            viewContainer.className = IWPPage.PAGE_CLASS_NORMAL;

            wrapper = window.document.createElement("div");
            wrapper.className = "pageWrapper";
            viewContainer.appendChild(wrapper);

            container = wrapper;

        } else if (this.type == IWPPage.PAGE_TYPE_NOTIFY) {
            viewContainer.className = IWPPage.PAGE_CLASS_NOTIFY;

        }

        this.view.html = viewContainer;
        container.innerHTML = this.view.text;

        if (this.type == IWPPage.PAGE_TYPE_DIALOG) {
            IWebapp.addClass(container.childNodes[0], "dialogContent");
        }
    }//end if


    container = null;


}

/**
 * @desc If set autoAddedToStage to false when setView, can add view to stage manually.
 */
IWPPage.prototype.addViewToStage = function () {
    if (this.view == null) throw  new Error(IWPError.PAGE_NOT_EXIST_VIEW, "Can not find view of the page");

    IWebapp.getInstance()._addPageToStage(this);
}

IWPPage.prototype.close = function () {
    IWebapp.getInstance().removePage(this);


}

function IWPPageData() {

}

IWebapp.extend(IWPNotify, IWPPage);
/**
 * Set the message node's id to "msgTxt", the message will display in that node
 * @constructor
 */
function IWPNotify(viewId) {
    IWPNotify.$super(this);
    this.type = IWPPage.PAGE_TYPE_NOTIFY;
    this.msgTxt = null;
    this.delay = 1000;
    this.viewId = viewId;
    this.timer = null;
}

IWPNotify.prototype.onCreate = function (pageData) {


    this.setView(this.viewId);
    var txtId = this.view.html.childNodes[0].getAttribute("data-notify-target");
    if (txtId == null || txtId.trim().length == 0) this.msgTxt = this.view.html.childNodes[0];
    else  this.msgTxt = this.findViewItem(txtId);

}


IWPNotify.prototype.close = function (target) {

    target = (target != null) ? target : this;
    var context = IWebapp.getInstance();
    context.removeNotify(target);

    target = null;
}

/**
 *
 * @param content [object | string]
 * @param delay [number]
 */
IWPNotify.prototype.show = function (content, delay) {
    if (typeof content == "string") {
        this.msgTxt.innerHTML = content
    } else {
        this.msgTxt.appendChild(content);
    }

    if (delay != null) this.delay = delay;

    var target = this;
    var context = IWebapp.getInstance();
    if (context._switchPlus != null) {

        context._switchPlus.showNotify(target, context._container, target.startTimer, [target]);
    } else {
        target.startTimer();
    }

    target = null;

}

IWPNotify.prototype.startTimer = function (target) {
    target = (target != null) ? target : this;
    var context = IWebapp.getInstance();
    if (context._switchPlus != null) {


        target.timer = setTimeout(function () {


            context._switchPlus.removeNotify(target, context._container, target.close, [target]);
            target = null;
        }, target.delay);
    } else {

        target.timer = setTimeout(function () {
            target.close();
            target = null;
        }, target.delay);
    }


}


IWPNotify.prototype.onDestroy = function () {
    clearTimeout(this.timer);
    this.timer = null;
    this.msgTxt = null;

}


IWebapp.extend(IWPConfirm, IWPPage);
function IWPConfirm() {
    IWPConfirm.$super(this);
    this.viewId = null;
    this.type = IWPPage.PAGE_TYPE_DIALOG;
    this.onCancel = null;
    this.onConfirm = null;
    this.msgTxt = null;
    this.cancelBtn = null;
    this.confirmBtn = null;
    this.closeBtn = null;
}

IWPConfirm.prototype.onCreate = function (pageData) {
    if (pageData != null && pageData.viewId != null) {
        this.viewId = pageData.viewId;
    } else {
        this.viewId = IWebapp.getInstance()._confirmViewId;
    }
    this.setView(this.viewId);
    var dataNode = this.view.html.childNodes[0].childNodes[0];

    this.msgTxt = this.findViewItem(dataNode.getAttribute("data-confirm-msg"));
    this.cancelBtn = this.findViewItem(dataNode.getAttribute("data-confirm-cancel"));
    this.confirmBtn = this.findViewItem(dataNode.getAttribute("data-confirm-submit"));
    this.closeBtn = this.findViewItem(dataNode.getAttribute("data-confirm-close"));


    addEvent(this.view.html, IWebapp.getInstance()._tapEventTag, this.onClicked, this);
}

IWPConfirm.prototype.onDestroy = function () {
    removeEvent(this.view.html, IWebapp.getInstance()._tapEventTag, this.onClicked);
    this.onCancel = null;
    this.onConfirm = null;
    this.msgTxt = null;
    this.cancelBtn = null;
    this.confirmBtn = null;
    this.closeBtn = null;
}

IWPConfirm.prototype.onClicked = function (e, context) {
    var target = (e.target) ? e.target : e.srcElement;//fot ie8
    if (target == context.confirmBtn) {
        if (context.onConfirm != null) {
            context.onConfirm();
        }
    } else if (target == context.cancelBtn || target == context.closeBtn) {
        if (context.onCancel != null) {
            context.onCancel();
        }
    }

    context.close();
    context = null;
    target = null;
}


IWPConfirm.prototype.show = function (content, confirmCallBack, cancelCallBack) {
    this.onCancel = cancelCallBack;
    this.onConfirm = confirmCallBack;


    if (typeof content == "string") {
        this.msgTxt.innerHTML = content
    } else {
        this.msgTxt.appendChild(content);
    }

}


IWebapp.extend(IWPAlert, IWPPage);
function IWPAlert() {
    IWPAlert.$super(this);
    this.viewId = null;
    this.type = IWPPage.PAGE_TYPE_DIALOG;
    this.onCancel = null;
    this.onConfirm = null;
    this.msgTxt = null;

    this.confirmBtn = null;
    this.closeBtn = null;
}

IWPAlert.prototype.onCreate = function (pageData) {
    if (pageData != null && pageData.viewId != null) {
        this.viewId = pageData.viewId;
    } else {
        this.viewId = IWebapp.getInstance()._alertViewId;
    }
    this.setView(this.viewId);
    var dataNode = this.view.html.childNodes[0].childNodes[0];



    this.msgTxt = this.findViewItem(dataNode.getAttribute("data-alert-msg"));

    this.confirmBtn = this.findViewItem(dataNode.getAttribute("data-alert-submit"));
    this.closeBtn = this.findViewItem(dataNode.getAttribute("data-alert-close"));


    addEvent(this.view.html, IWebapp.getInstance()._tapEventTag, this.onClicked, this);
}

IWPAlert.prototype.onDestroy = function () {
    removeEvent(this.view.html, IWebapp.getInstance()._tapEventTag, this.onClicked);
    this.onCancel = null;
    this.onConfirm = null;
    this.msgTxt = null;

    this.confirmBtn = null;
    this.closeBtn = null;
}

IWPAlert.prototype.onClicked = function (e, context) {
    var target = (e.target) ? e.target : e.srcElement;//fot ie8
    if (target == context.confirmBtn) {
        if (context.onConfirm != null) {
            context.onConfirm();
        }
    } else if (target == context.closeBtn) {
        if (context.onCancel != null) {
            context.onCancel();
        }
    }

    context.close();
    context = null;
    target = null;
}


IWPAlert.prototype.show = function (content, confirmCallBack, cancelCallBack) {
    this.onCancel = cancelCallBack;
    this.onConfirm = confirmCallBack;


    if (typeof content == "string") {
        this.msgTxt.innerHTML = content
    } else {
        this.msgTxt.appendChild(content);
    }

}


function IWPSwitch() {

}

IWPSwitch.prototype.showPage = function (page, container, onComplete, completeParams, isBack) {

    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}
IWPSwitch.prototype.removePage = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {

        onComplete.apply(this, completeParams);

    }
}


IWPSwitch.prototype.resumeParentPage = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}

IWPSwitch.prototype.hideParentPage = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}

IWPSwitch.prototype.showChildPage = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}

IWPSwitch.prototype.removeChildPage = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}


IWPSwitch.prototype.showDialog = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}

IWPSwitch.prototype.removeDialog = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}

IWPSwitch.prototype.showNotify = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
}

IWPSwitch.prototype.removeNotify = function (page, container, onComplete, completeParams, isBack) {
    if (onComplete != null) {
        onComplete.apply(this, completeParams);

    }
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



