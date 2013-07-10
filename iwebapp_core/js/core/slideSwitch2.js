
IWebapp.extend(SlideSwitch,IWPSwitch);
function SlideSwitch(){
    SlideSwitch.$super(this);
}


SlideSwitch.prototype.showPage=function(page,container,onComplete,completeParams,isBack){


    if(IWebapp.getInstance()._pages.length==1){
        if(onComplete!=null){
            onComplete(completeParams)
        }

        return;
    }

    if(isBack){
        page.view.html.style.left="-100%";
        TweenLite.to(page.view.html,0.8,{left:"0px",onComplete:onComplete,onCompleteParams:completeParams});
    }else{
        page.view.html.style.left="100%";
        TweenLite.to(page.view.html,0.8,{left:"0",onComplete:onComplete,onCompleteParams:completeParams});
    }

}

SlideSwitch.prototype.removePage=function(page,container,onComplete,completeParams,isBack){
    trace("slide remove page:"+page.id)


    if(isBack){

        TweenLite.to(page.view.html,0.8,{left:"100%",onComplete:onComplete,onCompleteParams:completeParams});
    }else{

        TweenLite.to(page.view.html,0.8,{left:"-100%",onComplete:onComplete,onCompleteParams:completeParams});
    }

}


SlideSwitch.prototype.hideParentPage=function(page,container,onComplete,completeParams){
    TweenLite.to(page.view.html,0.8,{left:"-100%",onComplete:onComplete,onCompleteParams:completeParams});
}

SlideSwitch.prototype.resumeParentPage=function(page,container,onComplete,completeParams){
    iwp.removeClass(page.view.html,IWPPage.PAGE_CLASS_PAUSEPAGE);

    TweenLite.to(page.view.html,0.8,{left:"0",onComplete:onComplete,onCompleteParams:completeParams});
}


SlideSwitch.prototype.removeChildPage=function(page,container,onComplete,completeParams){

    TweenLite.to(page.view.html,0.8,{left:"100%",onComplete:onComplete,onCompleteParams:completeParams});
}



SlideSwitch.prototype.showDialog=function(page,container,onComplete,completeParams){
    page.view.html.style.opacity="0";
    TweenLite.to(page.view.html,0.3,{opacity:1,onComplete:onComplete,onCompleteParams:completeParams});
}

SlideSwitch.prototype.removeDialog=function(page,container,onComplete,completeParams){

    TweenLite.to(page.view.html,0.3,{opacity:0,onComplete:onComplete,onCompleteParams:completeParams});
}


SlideSwitch.prototype.showNotify=function(page,container,onComplete,completeParams){
    page.view.html.style.opacity="0";
    page.view.html.style.top="55%";
    TweenLite.to(page.view.html,0.3,{opacity:1,top:(Math.random()*5+45-Math.random()*5)+"%",onComplete:onComplete,onCompleteParams:completeParams});

}

SlideSwitch.prototype.removeNotify=function(page,container,onComplete,completeParams){

    TweenLite.to(page.view.html,0.3,{opacity:0,top:"40%",onComplete:onComplete,onCompleteParams:completeParams});
}