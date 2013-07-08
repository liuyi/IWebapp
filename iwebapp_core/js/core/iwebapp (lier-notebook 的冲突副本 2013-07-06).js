//**********TOOLS******************************


/*
Project name:iwebapp
Description:It's a lite framework, you can use it to built your web app. It don't have lots of components, but it's faster than jquery moblie, and more flexible.
Author: Liu yi
Email:liuyi@ourbrander.com
Site:open.ourbrander.com/iwebapp
version:1.0b

*/

iwebapp.prototype.LOADMODE_ALL="load_all";
iwebapp.prototype.LOADMODE_For_Need="load_for_need";
iwebapp.instance=null;
iwebapp.localFolder="iwebapp";
iwebapp.assetsRoot="./";
iwebapp.APP_ENV="internet";

iwebapp.setAssetsRoot=function(path){
	if(path==null) path="./";
	iwebapp.assetsRoot=addSlash(path);
	trace("set assets root:"+iwebapp.assetsRoot);
}

iwebapp.getAssetsRoot=function(){
	return iwebapp.assetsRoot;
	
}


iwebapp.setLocalFolder=function(path){
    //need remove old folder(will do later);
    iwebapp.localFolder=path;
    try{
         getFilePath(path,false,{create:true})
    }catch(e){trace(e);}

}

iwebapp.getLocalFolder=function(){

}

iwebapp.getInstance=function(){
	if(iwebapp._instance==null) iwebapp._instance=new iwebapp();
	return iwebapp._instance;	
	
}

iwebapp.setLang=function(lang){
	if(isNull(lang)==false  ){
		 
		L10n.setLang(lang);
	}else if(navigator.globalization!=null){
		 navigator.globalization.getLocaleName(
			function (language) {
				var lan=(language.value.substring(0,language.value.indexOf("_")));
				L10n.setLang(lan);
			 
				 
			},
			function () {trace('Error getting language\n');}
     	);
	}
	
	
 
	  
}

function iwebapp(){
	iwebapp.instance=this;
	var _self=this;
	var _currentPage="";
	var _tranEffect="";
	var _containerId="";
    var _pageContainer=null;

	var _history=[];
	var _historyIndex=-1;
	var pages=[];
	var _events={};
	this.defaultPage="";
	this.popLayer=null;//put all the popup to this layer.
	this.tipLayer=null;//put all tips to this layer.
	this.configXML=null;
	this.loader=new Loader();
	this.themer=new ThemesManager();
	this.updater=null;
	
	this.finger=null;//we only need support one finger right now.
	this.homeLnk="";
	this.defaultPageLoaded=null;//This is the default callback.
	this.defaultPageLoadError=null;//This is the default callback.
	this.onPageLoadStart=null;
	this.onAllPageLoaded=null;
	this.onConfigLoaded=null;
	this.onTouchStart=null;//call back;
	this.onTouchMove=null;//call back;
	this.onTouchEnd=null;//call back;
	this.onTouchCancel=null;//call back;
	this.onOrientation=null;
	this.orientation=null;
	this.loadMode="load-all";//"only-on-need";
	this.transPlug=null;//webapp can use this function do transition effect when switch page. such as slide or 3d transition etc.
	this.onBackKeyDown=null;
	this.availHeight=0;
	this.availWidth=0;
	this.isMobile=true;
	this.appVersion=0;

	
	 
	if(navigator.platform.indexOf("Win")==0 || navigator.platform.indexOf("Mac")==0 ) {
		_self.isMobile=false;
	}
	
	
	var locationStr=String(window.document.location)
	if(locationStr.indexOf("http")==0) {
	 
		iwebapp.APP_ENV="internet";
	}else{
		 
		if(locationStr.indexOf("ms-appx")==0){
			iwebapp.APP_ENV="win8";
		}else {
			iwebapp.APP_ENV="normal";
		}
	}
	
	this.refresh=function(){
		window.document.location="";	
		
	}
	
	 
	
	this.init=function(containerId,configPath,mode){
		
	 
		_containerId=containerId;
		if(isNull(mode)) _self.mode=_self.LOADMODE_ALL;
		else _self.mode=mode;
		layoutConfig();
		
		
		window.document.addEventListener("touchstart", touchStart, false);
		window.document.addEventListener("touchmove", touchMove, false);
		window.document.addEventListener("touchend", touchEnd, false);
		window.document.addEventListener("touchcancel", touchCancel, false);
		window.document.addEventListener("touchcancel", touchCancel, false);
		//window.document.activeElement("onorientationchange",onOrientation,false);
		
		document.addEventListener("backbutton", backKeyDown, true); 




		window.onorientationchange=onOrientationChange;
		onOrientationChange();
		loadStrFile(iwebapp.assetsRoot+configPath,onConfigLoaded);
	}//end function


    this.getPageContainerId=function(){
        return _containerId;
    }

    this.getPageContainer=function(){
        if(_pageContainer==null){
            _pageContainer=$(_containerId);
        }
        return _pageContainer;
    }
	
	this.destroy=function(){
		document.removeEventListener("backbutton", backKeyDown, true); 
	}
	
	function layoutConfig(){
		//_self.availWidth= window.screen.availWidth;
		//_self.availHeight= window.screen.availHeight;

        var body=$("body");
        _self.availWidth= body.width();
        _self.availHeight= body.height();
		 
		 // $(_containerId).css("height",_self.availHeight+"px");
		 // $(_containerId).css("width",_self.availWidth+"px");
		styleSheet=getStyleSheet("main");
		//var pageStyle=getStyleRule(".page, .popup",styleSheet);
		 
		//pageStyle.style.setProperty("height",_self.availHeight+"px");
		//pageStyle.style.setProperty("width",_self.availWidth+"px");
		
		//var bodyStyle=getStyleRule("body",styleSheet);
		//bodyStyle.style.setProperty("height",_self.availHeight+"px")
		
		//trace(" window.screen.availWidth:"+ window.screen.availWidth+" window.screen.availHeight："+window.screen.availHeight)
       // trace(" window.screen.availHeight:"+ window.screen.availHeight+" window.screen.availHeight："+window.screen.availHeight)
	}
	
	function backKeyDown() { 
		if(onBackKeyDown!=null){
			onBackKeyDown();
		}else{
			 _self.goback();
		}
		
	}
	
	
	
	function onConfigLoaded(data){
		//trace("config xml loaded");
		_self.configXML=data;
		_self.defaultPage=$(_self.configXML).find("data > pages").attr('defaultPage');
        PageData.defaultBg=$(_self.configXML).find("data > pages").attr('defaultBg');
		$(_self.configXML).find('data > pages >page').each(function(){
				//str+=$(this).text()+"\n"
				var $page= new PageData();
				$page.id=$(this).attr('id');
				$page.tempId=$(this).attr('id');
				$page.url=$(this).find('link').text();
				$page.script=$(this).attr('script');
				$page.effectIn=$(this).attr('effectIn');
				$page.effectOut=$(this).attr('effectOut');
                $page.bg=$(this).attr('bg');
				if(!isNull($(this).attr('type'))){$page.type=$(this).attr('type');}
				pages.push($page);	 
				 
		 })//end find
		 _self.appVersion=$(_self.configXML).find('data > config >appVersion').text();
		 

		  _self.themer.server=$(_self.configXML).find('data > config >themer').text();;
		 
		 
		if(_self.onConfigLoaded!=null) _self.onConfigLoaded();
		 loadAllPages();
	}
	
	function loadAllPages(){
		
		var loadItem;
		var $page;
		for(var i=0;i<pages.length;i++ ){
			page=pages[i];
			loadItem=new LoadItem();
			loadItem.url=iwebapp.assetsRoot+page.url;
			loadItem.alias=page.id;
			loadItem.dataType="html";
			_self.loader.addFile(loadItem);
			 
			
		}
		
	 
		 
		_self.loader.start();
		_self.loader.onAllLoaded=allPageLoaded;
		_self.loader.onItemLoaded=pageItemLoaded;
	}
	
	function pageItemLoaded(id){
		if(id<pages.length){
            pages[id].content=_self.loader.getItemByIndex(id).content;

            //L10n
            pages[id].content=L10n.apply(pages[id].content);

        }
		
		
	}
	
	function allPageLoaded(){
		
		if(_self.onAllPageLoaded!=null) _self.onAllPageLoaded();
		else _self.loadPage(_self.defaultPage);
		
		
	}
	
	
	
	
	
	
	
	 
 
 	/*get cached page by id or url*/
	function getPage(str,onlyURL){
		var $onlyURL= (onlyURL!=null);
		
		var len=pages.length;
		 
		var $page=null;
		for(var i=0;i<len;i++){
			$page=pages[i];
			 
			if($onlyURL==false && ($page.tempId==str || $page.url==str) ){
				 return $page;
			}else if ($page.url==str){
				return $page;
			}
		}//end for;
		trace("can not get this page:"+str)
		return null;
	}//end function
	
	this.getPageById=function(tempId){
		 
		var len=pages.length;
		var $page=null;
		for(var i=0;i<len;i++){
			$page=pages[i];
			if($page.tempId==tempId) return $page;
		}
		return null;
	};
	this.closePop=function(targetId){
		
		 if(_self.transPlug!=null) {
						
			 _self.transPlug.closePop(targetId);
		 }else{
			// $(".page").fadeIn(0);
			$(".page").css("display","block");
			$(".popup").remove();
		 }


	};


    var overlayers={};

    this.hidenPage=function(){
        var ct=_self.getPageContainer();
        ct.css("display","none")
    };
    this.resumePage=function(){
        var ct=_self.getPageContainer();
        ct.css("display","")
    };

    this.hidenLayers=function(id){
        if(id==null){
            for(var i in overlayers ){
                overlayers[i].style.display="none";
            }
        }else{
            var target=overlayers[id];
            target.style.display="none";
        }

    };

    this.resumeLayers=function(id){
        if(id==null){

            var ct=null;
            var middle=false;
            for(var i in overlayers ){
               ct= overlayers[i];

               middle=(ct.getAttribute("data-layer-middle")=="true");
                if(middle){
                    ct.style.display="table";


                }else{
                    ct.style.display="";
                }

            }
        }else{
            var target=overlayers[id];
            target.style.display="";
        }
    }

    /*opts:{hidenPage:true/false,hidenOtherLayers}*/
    this.addLayer=function(id,target,to,opts){

        if(overlayers[id]!=null) {
           // trace("There is a same overlayer at here.");
            return;
        }

        if(opts!=null && opts.hidenPage==true){
            _self.hidenPage()
        }

        if(opts!=null && opts.hidenOtherLayers==true){
            _self.hidenLayers();
        }

        var bgAlpha=0.8;
        if(opts!=null && opts.bgAlpha!=null){
            bgAlpha=opts.bgAlpha;
        }

        var middle=(opts!=null && opts.middle!=null) ?opts.middle:null;

        var overLayerCt=window.document.createElement("div");
        overLayerCt.style.width="100%";
        overLayerCt.style.height="100%" ;
        overLayerCt.style.background="rgba(0,0,0,"+bgAlpha+")" ;
        overLayerCt.style.position="absolute" ;
        overLayerCt.style.zIndex="1000";


        overLayerCt.className="overLayerCt-root";

        var wrap=window.document.createElement("div");
        wrap.style.width="100%";
        wrap.style.height="100%" ;
        wrap.style.verticalAlign="middle";

        wrap.className="overLayerCt-wrap";

        if(middle==true){
            overLayerCt.style.display="table";
            overLayerCt.setAttribute("data-layer-middle","true")
            wrap.style.display="table-cell";
        }


        overLayerCt.appendChild(wrap);
        $(wrap).append(target);


        if(to==null) to="body";

        $(to).append(overLayerCt);

        _self.handleAllLink();

        overlayers[id]=overLayerCt;
      //  _self.handleAllLink();//for pc debugger.

    };


    this.delLayerById=function (id,opts){
        var target=overlayers[id];
        if(target==null) {
            trace("There is no overlayer here:"+id);
            return ;
        }

        $(target).remove();
        delete  overlayers[id];

        if(opts!=null && opts.resumePage==true){
            _self.resumePage();

        }

        if(opts!=null && opts.resumeOtherLayers==true){
            _self.resumeLayers();
        }

    };

    this.delLayerByTarget=function(target,resumePage){


        //remove all the overlayer in the same parent.

        var parentCt=null;
        var tempCt=null;

        while(target.parent()!=null && parentCt==null){
            tempCt=target;
            if($(target).hasClass("overLayerCt-root")){
                parentCt=tempCt;
            }else{
                target=target.parent();
            }


        }

        for(var i in overlayers){
            if(overlayers[i]==parentCt[0]){
                delete  overlayers[i];
                break;
            }
        }

        $(parentCt).remove();


        if(resumePage==true){
            _self.resumePage();
        }


    };

    this.delLayers=function(){
        for(var i in overlayers){
            $(overlayers[i]).remove();
             delete  overlayers[i];


        }

    }



	this.showAlert=function(content,cb_confirm,cb_cancel){
		_self.closeAlert(null,true);
		
		$(content).find(".confirm").click(function(){
			$(content).remove();
			$(_self.tipLayer).css("display","none");
			if(cb_confirm!=null) cb_confirm();	
		});
		
		JQHtml(_self.tipLayer,content);
		//$(_self.tipLayer).html(content);
		var p=$(content).wrap("<div class='wrap'></div>");
		$(_self.tipLayer).css("display","table");
		$(_self.tipLayer).css("z-index","999999");
		
	};
	this.closeAlert =function(cls,keepDark){
		if(cls==null) cls=".tipTemplate";
		$(".tipTemplate").remove();
		
		if(keepDark!=true) $(_self.tipLayer).css("display","none");
	};
	
	//It looks we don't need go front. 
	this.goback=function(num){
		if(num==null) num=1;
		if(num>_history.length-1 || num<0) return;





		_history=_history.slice(0,_history.length-num);

        var p=_history[_history.length-1];


		_self.loadPage(p.url, p.id,p.target,p.onLoaded,p.onLoadError, p.loadedParams, p.loadedParams,p.autoRender,{isBack:true});
	};

    this.getLastPage=function(index){
        if(index==null) index=1;
        if(_history.length==0 || _history.length-1<index) return null;

        return _history[_history.length-1];
    };
	
	/*
		return current page.
		example: {id:$page.id+"page",name:$page.id,target:target,onLoaded:onLoaded,onLoadError:onLoadError,autoRender:autoRender,url:url}
	*/
	this.currentPage=function(){
		if(_history==null|| _history.length==0) return null;
		
		return _history[_history.length-1];
	};
	//url:the link of page,target:the container of the page
	/*
	* pass params to onLoaded.
	* */
	this.loadPage=function(url,id,target,onLoaded,onLoadError,loadedParams,loadErrorParams,autoRender,params){
		if(autoRender==null) autoRender=true;
		if(isNull(target)) target=_containerId;
		if(_self.onPageLoadStart!=null ) _self.onPageLoadStart();
	  
		var $page=getPage(url);

		 
		 if ($page!=null){
             if(id!=null) $page.id=id;
             else $page.id=url;
			 onGetContent($page.content);
			 return;
		 }
		 
	 
		 $.ajax({
			type: "get",
			url: url,
			cache: true,
			success: onGetContent,
			
			error:function(XMLHttpRequest, textStatus, errorThrown) {
				// 通常 textStatus 和 errorThrown 之中
				// 只有一个会包含信息
				// 调用本次AJAX请求时传递的options参数
				trace("load page error:\n"+"XMLHttpRequest:\n"+XMLHttpRequest+"textStatus:\n"+textStatus+"errorThrown:\n"+errorThrown+"\n");
				if(onLoadError!=null)onLoadError(onLoadError);
				else if(_self.defaultLoadError!=null) _self.defaultLoadError(onLoadError);
			}
		});
		
		
		function onGetContent(html){
				 
			if(autoRender==true){
				if(target!=null && target!="") {
					
					 
					 var p=document.createElement("div")
					 
					 if($page!=null){
						 $(p).attr("id",$page.id+"page");

						 if($page.type=="pop"){
							  $(p).addClass("popup");
							  //If this page is a popup, don't recored this page
						 }
						 else {
							 $(p).addClass("page");
							 
							 if(params!=null && params.isBack==true){
								 //If this is go back to history, don't recored this page
							 }else{
								 
								 _history.push({
                                     tempId:$page.tempId,id:$page.id,name:$page.id,
                                     target:target,url:url,
                                     onLoaded:onLoaded,onLoadError:onLoadError,
                                     loadedParams:loadedParams,loadErrorParams:loadErrorParams,
                                     autoRender:autoRender});
								 
							 }
						 }

                        //set the color of background.
                        if(isNull($page.bg)==false){
                            $(p).addClass($page.bg);
                        }

					 }
					 else {
						 $(p).attr("id",getFileName(url)+"page");
					 }


					 JQHtml(p,html);
				 
					
					 
					 if(_self.transPlug!=null) {
						
						 _self.transPlug.switchTo(target,p,{effectIn:$page.effectIn,effectOut:$page.effectOut,type:$page.type,params:params},onPageComplete);
						 
					 } else {
						 
						 if($page.type=="pop"){
							 $(".page").css("display","none");
						 	JQAppend(target,p);
						 }else{
						 	JQHtml(target,p);
						 }
						 onPageComplete();
					 }
				
				}
			}else{
				onPageComplete();
			}
			
			function onPageComplete(){

				if(onLoaded!=null) onLoaded(loadedParams);
				else if (_self.defaultPageLoaded!=null) _self.defaultPageLoaded(loadedParams);
				_self.handleAllLink();
			   
			   
			  
				
			}
			
		}//end function
		
	}//end function
	
	//hiden top bar.
	this.hidenTopBar=function(t){
		if(t==null) t=50;
		setTimeout(function(){
		// Hide the address bar!
		window.scrollTo(0, 1);
		},t);
	};//end function
	
	//Manage all the link.
	this.handleAllLink=function (){
		
		//this only for pc test.
	    if(_self.isMobile) return;
        var linkBtn=$("a");
        linkBtn.unbind("click",onClicked);
        linkBtn.bind("click",onClicked);

        linkBtn=$(".touchable");
        linkBtn.unbind("click",onClicked);
        linkBtn.bind("click",onClicked);

        linkBtn=$("input");
        linkBtn.unbind("click",onClicked);
        linkBtn.bind("click",onClicked);


		
	};//end function
	
	 
	
	function onClicked(d){

			 d.stopPropagation(); 
			 d.preventDefault();

			var target= getTouchTarget(d.currentTarget);
            if(!isNull(target) ) {


              //  var regx=/\bdisable\b/;

               //var isDisable=target.className.match(regx);
               var isDisable=hasClass(target,disableCss);
               // if ( isDisable==null || isDisable.length==0){
                if ( isDisable==false){
                    dispacthEvent(target);
                    components(target);
                }

            }

			return false;//prevent this event, we need deal with this event.
	}
	
	
	function onOrientationChange(e){
		
		if(window.orientation==0) _self.orientation="portrait";
		else _self.orientation="landscape";
		
		if(_self.onOrientation!=null)_self.onOrientation(_self.orientation);
	}



    var touchedObjs={};
    var touchLen=0;
    var sensibility=225;
    var touchSDelayTime=60;
    var touchEventNodeList=["A","INPUT"];
    var touchCss="touchable";
    var touchEventTag="ontouch";
    var selectedTag="selected";
    var selectEventTag="onselect";
    var checkbox="checkbox";
    var radio="radio";
    var radioGroup="data-radio-group";
    var radioValueTag="data-radio-value";
    var button="button";
    var ignoreCls="ignore";//if the tag has this class, ignore its touch effect.
    var disableCss="disable";



    var touchStartTime=0;
    var touchCurrentTime=0;
    var touchDiffTime=0;
    var touchIntervalId=null;
    var touchTarget=null;
    var touchJTarget=null;
    var touchedNodes=null;
	
	function touchStart(e){
		
	 
		// e.preventDefault();
		 //_self.hidenTopBar(0);

          var touch = e.touches[0];
         startX = touch.pageX;
         startY = touch.pageY;
		 
	 
		
		_self.finger=new Finger();
		 _self.finger.target=e.target;
		_self.finger.pageX=touch.pageX;
		_self.finger.pageY=touch.pageY;
		_self.finger.prePageX=_self.finger.pageX;
		_self.finger.prePageY=_self.finger.pageY;
		
		_self.finger.detalX();
		_self.finger.detalY();
		
		
		var target=getTouchTarget(e.target,"touchstart");
		if(target!=null){

//            if(target.nodeName=="INPUT"){
//                e.preventDefault();
//                return false;
//            }

			if(hasClass(target,"touch") ==false  && hasClass(target,disableCss) ==false){
				
				//remove other item's status,because of js is too slow.
//				$(".touch").removeClass("touch");
//				$(target).addClass("touch");

                startCheckTouch(target, e.timestamp);
			}




		}else{
			e.preventDefault();
		}
		
		if(_self.onTouchStart!=null){
			_self.onTouchStart(e,_self.finger);
		}



		//return false
		
	}//end function




    function startCheckTouch(target,startTime){
        touchTarget=target;
        touchStartTime=startTime || Date.now();
        touchedNodes=$(".touch");
        touchTarget= target;
        touchJTarget=$(target);
        touchIntervalId=setInterval(touchHandler,30);
    }
    function touchHandler(){
        touchDiffTime=Date.now()-touchStartTime;
        //trace(touchDiffTime);
        if(touchDiffTime>touchSDelayTime && hasClass(touchTarget,"touch")==false && _self.finger!=null){
            var d=(_self.finger.pageX-startX)*(_self.finger.pageX-startX)+(_self.finger.pageY-startY)*(_self.finger.pageY-startY);



            if(d<sensibility ){
                if(touchJTarget!=null){
                    touchJTarget.addClass("touch");
                }
                if(touchedNodes!=null){
                    touchedNodes.removeClass("touch");
                }



            }

            clearTouchCheck();



        //alert("ssd:"+touchDiffTime)
         }
    }

    function clearTouchCheck(){
        clearInterval(touchIntervalId);
        touchStartTime=0;
        touchCurrentTime=0;
        touchDiffTime=0;
        touchIntervalId=null;
        touchJTarget=null;
        touchedNodes=null;

    }



	function getTouchTarget(target,type){
		if(isTarget(target)) {
			onGetTarget(target);
			return target;
		} 
		
		 
		while(target.parentNode!=null){
			 target=target.parentNode;
			 if(isTarget(target)) {
				 onGetTarget(target);
				return target;
			 }
		 }
		 
		 function isTarget(target){

			//return ($(target).hasClass(ignoreCls) ==false &&(touchEventNodeList.indexOf(target.nodeName)>=0  || $(target).hasClass(touchCss)==true))
			return ( hasClass(target,ignoreCls) ==false  &&(touchEventNodeList.indexOf(target.nodeName)>=0  ||  hasClass(target,touchCss)==true))
		 }
		 
		 
		  function onGetTarget(target){
			  target.attributes["touchStatus"]= type;
			   
			  if( isNull(target.attributes["touchId"]) ){
				  target.attributes["touchId"]=touchLen+1;
				  touchedObjs[touchLen+1]=target;
				  
			  };


			
			  
		  }
		
		return null;
	}
	
	//remove touch status of touched target. now we only need support 1 finger.have no time to do more things.
	function updateTouchStatus(){
		
		
		$(".touch").removeClass("touch");
		 
	}
	
	function touchMove(e){
		 e.preventDefault();
    
		  var touch = e.touches[0];
		  _self.finger.target=e.target;
		  
		 // there is a issue on android, when use e.touches[0], we use event.pageY instead of it.
		 //see:http://stackoverflow.com/questions/7681894/how-do-i-get-android-to-respond-to-touch-drags/7833982#7833982
		 
		 
	 
		_self.finger.prePageX=_self.finger.pageX;
		_self.finger.prePageY=_self.finger.pageY;
		
		_self.finger.pageX=touch.pageX;
		_self.finger.pageY=touch.pageY;
		
	 
		
		if(_self.onTouchMove!=null){
			_self.onTouchMove(_self.finger);
		}
		//_self.hidenTopBar(0);
		return false;
		
	}//end function
	

	function touchEnd(e){

        clearTouchCheck();
		$(".touch").removeClass("touch");
		updateTouchStatus();
		var target=getTouchTarget(e.target,"touchend");
		 if(target!=null){
			 
			 var d=(_self.finger.pageX-startX)*(_self.finger.pageX-startX)+(_self.finger.pageY-startY)*(_self.finger.pageY-startY);



			 if(d<sensibility && hasClass(target,disableCss)==false){

				dispacthEvent(target);
                components(target)
				
			}

		 }
		if(_self.onTouchEnd!=null){
			_self.onTouchEnd(_self.finger);
		}

		//return false
		
	}//end function

    function hasClass(target,className){

        if(target.className==null) return false;
        var regx = new RegExp("\\b"+className+"\\b","gi");
        var has=target.className.match(regx);
        return (has!=null && has.length>0);

    }

    this.updateComponent=function(target){
        components(target);
    }

	/*add compoments behaviours to touch event*/

	function components(target){
		var jqTarget=$(target);
		if(jqTarget.hasClass(checkbox)==true){
		 	if(jqTarget.hasClass(selectedTag)==true){
					jqTarget.removeClass(selectedTag);
			}else{
					jqTarget.addClass(selectedTag);
					 
			}

            dispacthEvent(target,selectEventTag);
			//dispacthEvent(target);
			
			
		}else if(jqTarget.hasClass(button)==true){
			
			//dispacthEvent(target);
	    }else if(jqTarget.hasClass(radio)==true){

            var item=null;
            var groupId=jqTarget.attr(radioGroup);
            var radioVal=jqTarget.attr(radioValueTag);
            if(isNull(groupId)){
                return ;
            }

            var parent=window.document.getElementById(groupId);

            if($(parent).attr(radioValueTag)==radioVal){
                return ;
            }
            $("#"+groupId+" ."+radio).each(function(e){
                item=$(this);
                if(item.attr(radioGroup)==groupId){
                    item.removeClass(selectedTag);
                }
            })
            jqTarget.addClass(selectedTag);
            $(parent).attr(radioValueTag,radioVal);

            dispacthEvent(parent,selectEventTag);

           // $("#"+groupId).trigger("onchange",touchEvent);

        }
		
		
	}
	
	function dispacthEvent(target,type){
            if(type==null) type= touchEventTag;

			var onEvent=$(target).attr(type);
				
			if(isNull(onEvent)==false){
				eval(onEvent);
			}
			
			var touchEvent=document.createEvent("MouseEvents");
			touchEvent.initMouseEvent(type, true, true, window,
		  	0, 0, 0, 0, 0, false, false, false, false, 0, null);
			$(target).trigger(type,touchEvent);

	}
		
	function touchCancel(e){
		e.preventDefault();
		_self.finger=null;
		if(_self.onTouchCancel!=null){
			_self.onTouchCancel();
		}
		//_self.hidenTopBar(0);
		return false;
	}//end function
	
	
	this.addEventType=function (type){
		if(_events[type]==null){
			_events[type]={};
			
		}
	}//end function
	
	this.removeEventType=function(type){
		if( _events[type]!=null){
			delete _events[type];
		}
	}
	
	this.removeEventHandle=function(type,id){
		delete _events[type][id];
	}
	
	this.addEventHandle=function(type,id,callback){

		_events[type][id]=callback;
		
	}
	
	this.dispatchEvent=function(type,params){
		if(isNull(_events[type])) return;
		var e=_events[type];
		for (var i in e){
			// trace(i+">"+e[i])
			if(params!=null) e[i](params);
			else e[i]();
		}
	}
	
	
	
	
	
	
	
	// finger class we use it control interactive ui.
	function Finger(){
		
		this.target=null;
		this.pageX=0;
		this.pageY=0;
		
		this.prePageX=0;
		this.prePageY=0;
		var _self=this;
		
		this.detalX=function(){

			return  _self.pageX-_self.prePageX;
		};
		this.detalY=function(){
			return  _self.pageY-_self.prePageY;
		}
	}//end class
	
	


}//end Class

PageData.defaultBg="";
function PageData(){
    this.id="";//id don't need as the same as tempId.
    this.tempId=""; //tempId come from assets.xml.
    this.url="";
    this.html="";
    this.script="";
    this.effectIn="";
    this.effectOut="";
    this.type="page";
    this.bg="";
}


function ThemesManager(serverPath){
	var _themer=this;
 
	var xmlfile="themes.xml";
	var _xml=null;
 
	var _localList=[];//dont'use _localList directly, use getThemes instead of _localList.
 
	
	this.server=serverPath;
	this.defaultFolder="themes/";
	
	
	
	
	this.getThemes=function(){
		var str=Local.get("themer");
 
		if(isNull(str)){
			str=JSON.stringify(_localList);
 
			Local.set("themer",str);
		}	
		var list=JSON.parse(str);
		
		var newList=[];
		for(var i=0;i<list.length;i++){
			if(	list[i]!=null) newList.push(list[i]);
		}
 
		return newList;
		
	}
	
	function saveThemeList(list){
		var newList=[];
		for(var i=0;i<list.length;i++){
			if(	list[i]!=null) newList.push(list[i]);
		}
		str=JSON.stringify(newList);
		
		Local.set("themer",str);

	}
	

	function saveTheme(theme,themeList,replaceOld,saveListNow){
			if(isNull(theme)) {trace("can not save a null theme.");return false;}
			var list=(themeList==null)?_themer.getThemes():themeList;
			var len=list.length;

			var existTheme=null;
			var ctheme=null;
			for(var i=0;i<len;i++){
				ctheme=list[i];
				if(ctheme==null) continue;

				if(ctheme.id==theme.id){
					existTheme=theme;
				 	if(replaceOld==true){
						list[i]=theme;
					}else if(list[i].file!=theme.file){
							list[i].file=theme.file;
							list[i].screenshot=theme.screenshot;
							list[i].title=theme.title;
							list[i].author=theme.author;
					}
					break;	
				}
			}
			 
			if(existTheme==null) list.push(theme);
			
			if(saveListNow!=false){saveThemeList(list);}
	}
	
	function getTheme(themeId,themeList){
		
		var list=(themeList==null)?_themer.getThemes():themeList;
		var len=list.length;
	 	var theme;
	  	for(var i=0;i<len;i++){
			theme=list[i];
		 	if(theme.id==themeId){return theme;}
	 	 }
	  
	 	 return null;	
	}
 
	
	//update themes infomation from server
    this.update=function(serverPath,callback){
		if(isNull(serverPath)==false) _themer.server=serverPath;
		if(isNull(_themer.server)){ trace("Incorrect path of themes assets"); return false;}
		 
		loadStrFile(_themer.server+xmlfile,onXmlLoaded);
		
		
		function onXmlLoaded(data){
			_xml=data;

			var localList=_themer.getThemes();
			//update the list of themes.
			
			$(_xml).find("theme").each(function(index, element) {
			 
				$(element).find("version").each(function() {
				 
					if($(this).attr("support").indexOf(iwebapp.instance.appVersion)>=0){
						var theme=new Theme();
						theme.id=$(element).attr("id");
						theme.title=$(element).attr("title");
						theme.screenshot=$(this).find("screenshot").text();	
						theme.file=$(this).find("file").text();	
						theme.support=$(this).attr("support");
						theme.author=$(element).attr("author");
						
						saveTheme(theme,localList,false,false);
					 
						return;
					}
				}); 
				
				
			});

			saveThemeList(localList);
			
			if(callback!=null){
				 callback(localList);
			}
			
				
		}
		
	}//end function 
	
 
    
	
	
	this.download =function(themeId,filePath,callback,failed){
		
		var theme=getTheme(themeId);
		var fileTransfer = new FileTransfer();
		var uri = encodeURI(_themer.server+theme.file);
		
		
		
		
		
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);

		function onFileSystemSuccess(fileSystem) {
	 
			if(isNull(filePath)) {
				filePath=addSlash(_themer.defaultFolder)+theme.file;
			}
			 
		 
			filePath=addSlash(fileSystem.root.fullPath)+addSlash(iwebapp.localFolder)+filePath;
			 
			fileTransfer.download(
				uri,
				filePath,
				function(entry) {
					console.log("download complete: " + entry.fullPath+":/parent:"+getDir(entry.fullPath));
					if(callback!=null) callback({type:"download",path:entry.fullPath});
					ExtractZipFile.extract(entry.fullPath,getDir(entry.fullPath),extractWin,extractFailed);
				},
				function(error) {
				 
					if(failed!=null) failed({error:error,type:"download"});
				},
				true
			);
			
		}
		
		
		function extractWin(filename,to){
			var dir=filename.substring(0,filename.lastIndexOf("."));
			theme.local=dir;
			saveTheme(theme,null,true,true);
			if(callback!=null) callback({type:"extract",path:to,filename:filename});
			
		}
		
		function extractFailed(error){
			if(failed!=null) failed({error:error,type:"extract"});
		}
		
		
		function fail(evt) {
			console.log("fileSystem error:"+evt.target.error.code);
			if(failed!=null) failed(evt.target.error);
		}
	}//end function
	
	
	this.apply=function(themeId){
	  var theme=getTheme(themeId);	
	  if(isNull(theme) || isNull(theme.local)) {
		trace("Can not find files of current theme:"+themeId);  
		return false;
		
	  }
	  
	  Local.set("currentTheme",themeId+"");
	  return true;
	}
	
	this.reset=function(){
		 Local.set("currentTheme","");
	}
	
	
	this.getCurrent=function(){
		 var themeId=Local.get("currentTheme");
		 if(isNull(themeId)) {
			 trace("themeId is null")	 
			 return null;
		}
		//trace("currentTheme is "+themeId+" type:"+ typeof(themeId)+ ">"+(themeId==0))
		var theme=getTheme(themeId);
		if(isNull(theme)){
			trace("theme is null") 
			return null;
		}
		else{
			return theme;
		}
	}
	
	
	
	
	
	
	 
	
	
	function Theme(){
		this.title=null;
		this.id=null;
		this.support=null;
		this.file=null;
		this.screenshot=null;
		this.author=null;
		this.server=null;
		this.local=null;//The root path of extract files;  
			
	}
		
}


function Loader(){
	var _self=this;
	var index=0;
	var list=[];
	var state="free";
	this.onAllLoaded=null;
	this.onItemLoaded=null;
	this.addFile=function($item){
		list.push($item);
	}
	this.start=function(){
	
		if(state=="free") loadItem(index);
	}
	
	function loadItem(id){
		var loadItem=list[id];
		$.ajax({
			type: "get",
			url: loadItem.url,
			cache: loadItem.cache,
			dataType:loadItem.dataType,
			
			success: function(content){
				
				itemLoaded(content);
				
			},
			error:function(XMLHttpRequest, textStatus, errorThrown) {
				trace("load item: "+loadItem.url+" failed!");
			}
		});
	}
	
	function itemLoaded(content){
		
		var $loadItem=list[index];
		$loadItem.content=content;
		if(_self.onItemLoaded!=null) _self.onItemLoaded(index);
		if(index==list.length-1) allLoaded();
		else{
			
			index++
			loadItem(index);
			
		}
	}
	
	function allLoaded(){
		//trace("All item loaded");
		if(_self.onAllLoaded!=null) _self.onAllLoaded();
	}
	
	this.getItemByName= function(alias){
		var len=list.length;
		var $item;
		for(var i=0;i<len;i++){
			 $item=list[i];
			if($item.alias==alias) return $item;
		}
		return null;
	}
	
	this.getItemByIndex= function(id){
		if(  list==null || id>=list.length ) return null;
		return list[id];
	}
}

function LoadItem(){
	this.url=null;
	this.content=null;
	this.dataType="html";
	this.cache="true";
	this.alias=null;
	
}

//=========Utils (need iwebapp)======================
function JQHtml(target,content){
	
	 
  if(iwebapp.APP_ENV=="win8"){
	MSApp.execUnsafeLocalFunction( function(){$(target).html((content))});
  }else{
	$(target).html(content)
  }
}

function JQAppend(target,content){
  if(iwebapp.APP_ENV=="win8"){
	MSApp.execUnsafeLocalFunction( function(){$(target).append((content))});
  }else{
	$(target).append(content)
  }
}


//========Utils (need phonegap)======================================

/*
* Create a path, it could be a file,or directory. example:createPath("aa/bb/cc/test.txt");
* */
function getFilePath(filePath,isFile,opts,onSuccess,onFailed){
    filePath=$.trim(filePath);
    if(filePath.indexOf("/")==0){
        filePath=filePath.substring(1);
    }

    if(filePath.lastIndexOf("/")==(filePath.length-1)){

        filePath=filePath.substring(0,filePath.length-1);
    }

    var list=filePath.split("/");
    var index=0;
    var len=list.length;
    var fileSystem=null;
    var create=(opts==null || opts["create"]==null) ?true:opts["create"];


    var outTime=2000;
    var fileResult=null;

    setTimeout(check,100);

    function check(){
        outTime-=100;
        if(outTime<=0 && fileResult==null) {
            if(onFailed!=null){
                onFailed({code:1001})

            }
        }else{
            setTimeout(check,100)
        }


    }
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFail);




    function  createtDirectory(){
        filePath="";
        index++;
        for(var i=0;i<index;i++){
            filePath+=list[i]+"/";

        }

        //If this is a file, create it.
        if(index==list.length  && isFile){
            createFile(filePath);
        }else{
           // trace("onFileSystemSuccess and get file:"+filePath);
            fileSystem.root.getDirectory(filePath,{create: create, exclusive: false}, onGetDirectoryWin, onGetDirectoryFail);
        }


    }

    function createFile(filename){
        fileSystem.root.getFile(filename, {create: create, exclusive: false}, gotFileEntry, onFileFail);
    }


    function onFileSystemSuccess($fileSystem ) {
        fileSystem=$fileSystem;
        fileResult=true;
        createtDirectory();

    }


    function onGetDirectoryWin(parent){
      //  trace("onGetDirectoryWin:"+parent.name);
        fileResult=true;
        if(index==list.length){

            if(onSuccess!=null) onSuccess(parent);
        }else{
            createtDirectory();
        }

    }

    function onGetDirectoryFail(e){
       // trace("onGetDirectoryFail:"+e.code);
       // trace(getOSErrorInfo(e.code));
        if(onFailed!=null) onFailed(e);
    }

    function gotFileEntry(fileEntry){
        fileResult=true;
      //  trace("gotFileEntry:"+JSON.stringify(fileEntry));
        if(onSuccess!=null) onSuccess(fileEntry);
    }

    function onFileFail(e){
       // trace("on file fail"+ e.code);
      //  trace(getOSErrorInfo(e.code));
        if(onFailed!=null) onFailed(e);
    }

    function onFail(e){
        trace("ge file stytem fail.");
        fileResult=false;
        if(onFailed!=null) onFailed(e);
    }









}//end function


/*get error info from FileError*/
function getOSErrorInfo(code){

    switch (code){
        case FileError.NOT_FOUND_ERR:
            trace("FileError.NOT_FOUND_ERR");
            break;
        case FileError.ABORT_ERR:
            trace("FileError.ABORT_ERR");
            break;
        case FileError.NOT_READABLE_ERR:
            trace("FileError.NOT_READABLE_ERR");
            break;
        case  FileError.ENCODING_ERR:
            trace("FileError.ENCODING_ERR");
            break;
        case  FileError.NO_MODIFICATION_ALLOWED_ERR:
            trace("FileError.NO_MODIFICATION_ALLOWED_ERR");
            break;
        case  FileError.INVALID_STATE_ERR:
            trace("FileError.INVALID_STATE_ERR");
            break;
        case FileError.SYNTAX_ERR:
            trace("FileError.SYNTAX_ERR");
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            trace("FileError.INVALID_MODIFICATION_ERR");
            break;
        case  FileError.QUOTA_EXCEEDED_ERR:
            trace("FileError.QUOTA_EXCEEDED_ERR");
            break;
        case FileError.TYPE_MISMATCH_ERR:
            trace("FileError.TYPE_MISMATCH_ERR");
            break;
        case FileError.PATH_EXISTS_ERR:
            trace("FileError.PATH_EXISTS_ERR");
            break;
    }


}//end function



//================================================
//trainstion effect
function coolTransition(targetContainer,content){
    var container=null;
    var currentPage=null;
    var prePage=null
    var speed=0.6;
    var onComplete=null;
    var self=this;
    var preEffect=null;
    var currentEffect=null;


    function alphaTransition(){

        $(prePage).fadeOut(250,function(){

            if(currentEffect.type!="pop")
                $(prePage).remove();

            $(container).append(currentPage);

            $(currentPage).fadeIn(300);

            if(onComplete!=null) onComplete();
        });
    }

    function slideTransition(){
        var width=$(prePage).width();
        $(container).append(currentPage);


        $(currentPage).css("display","block");
        /*$(prePage).css("position","absolute");
         $(currentPage).css("position","absolute");
         $(prePage).css("width",width+"px");
         $(currentPage).css("width",width+"px");
         */
        var endPos;

        if(currentEffect.params!=null && currentEffect.params.isBack==true){
            $(currentPage).css("left",-width+"px");
            endPos=width;
        }else{
            $(currentPage).css("left",width+"px");
            endPos=-width;
        }

        TweenLite.to($(prePage),0.8,{delay:0.1,css:{left:endPos},onComplete:function(){
            //if current page is a popup, don't need remove previous page.
            if(currentEffect.type!="pop")
                $(prePage).remove();
        }});
        TweenLite.to($(currentPage),0.8,{delay:0.1,css:{left:0},onComplete:function(){

            // $(currentPage).css("position","relative");
            //$(currentPage).css("width","100%");
        }})

        if(onComplete!=null) onComplete();
    }


    var transition=alphaTransition;


    this.switchTo =function(targetContainer,content,effect,success){

        currentEffect=effect;
        container=targetContainer;
        currentPage=content;

        var pages=$(container).children(".page");
        prePage=pages[0];

        $(currentPage).css("display","none");
        onComplete=success;
        if(isNull(prePage)){
            JQHtml(container,currentPage);
            //$(container).html(currentPage);
            $(currentPage).fadeIn(600);
            complete();
        } else{
            var eft=effect.effectIn

            if(preEffect!=null && preEffect.effectOut!=null){
                eft=preEffect.effectOut
            }

            if(effect.type=="pop") eft="alpha";//if this is a popup.

            if(eft=="alpha") transition=alphaTransition;
            else transition=slideTransition;
            transition();

            preEffect=currentEffect;
        }



    }//end function


    this.closePop=function(){
        var popup= $(".popup")
        var page= $(".page")

        popup.remove()
        page.css("display","block");
        // page.fadeIn(0);

    };




    function complete(){

        if(onComplete!=null) onComplete();
    }
}//end class


/****************Tools List**************************/





 
