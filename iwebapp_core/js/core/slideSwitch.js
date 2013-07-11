
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
        IWPTween.to(page.view.html,0.6,{left:"0px",onComplete:onComplete,onCompleteParams:completeParams});
    }else{
 //    page.view.html.style.left="100%";
        //IWPTween.to(page.view.html,0.6,{left:"0px",onComplete:onComplete,onCompleteParams:completeParams});

       IWPTween.to(page.view.html,0,{css:{x:IWebapp.getInstance()._container.offsetWidth+"px"}});
       setTimeout(function(){

            IWPTween.to(page.view.html,0.6,{css:{x:"0px"},ease:"easeOut",onComplete:onComplete,onCompleteParams:completeParams});
        },0)

    }

}

SlideSwitch.prototype.removePage=function(page,container,onComplete,completeParams,isBack){
    trace("slide remove page:"+page.id)


    if(isBack){

        TweenLite.to(page.view.html,0.6,{left:"100%",onComplete:onComplete,onCompleteParams:completeParams});
    }else{

        IWPTween.to(page.view.html,0.6,{css:{x:"-"+IWebapp.getInstance()._container.offsetWidth+"px"},ease:"easeOut",onComplete:onComplete,onCompleteParams:completeParams});
    }

}


SlideSwitch.prototype.hideParentPage=function(page,container,onComplete,completeParams){
    //IWPTween.to(page.view.html,0.6,{left:"-100%",onComplete:onComplete,onCompleteParams:completeParams});
    IWPTween.to(page.view.html,0.6,{css:{x:"-"+IWebapp.getInstance()._container.offsetWidth+"px"},ease:"easeOut",onComplete:onComplete,onCompleteParams:completeParams});
}

SlideSwitch.prototype.resumeParentPage=function(page,container,onComplete,completeParams){
    iwp.removeClass(page.view.html,IWPPage.PAGE_CLASS_PAUSEPAGE);

   // TweenLite.to(page.view.html,0.6,{left:"0",onComplete:onComplete,onCompleteParams:completeParams});
    IWPTween.to(page.view.html,0.6,{css:{x:"0px"},ease:"easeOut",onComplete:onComplete,onCompleteParams:completeParams});
}


SlideSwitch.prototype.removeChildPage=function(page,container,onComplete,completeParams){

  //  TweenLite.to(page.view.html,0.6,{left:"100%",onComplete:onComplete,onCompleteParams:completeParams});
    IWPTween.to(page.view.html,0.6,{css:{x:IWebapp.getInstance()._container.offsetWidth+"px"},ease:"easeOut",onComplete:onComplete,onCompleteParams:completeParams});
}



SlideSwitch.prototype.showDialog=function(page,container,onComplete,completeParams){

    trace(window.document.body.opacity)
    if(window.document.body.opacity==undefined ){
        if(onComplete!=null){
            onComplete.apply(page.view.html,completeParams)
        }
    }else{
        IWPTween.to(page.view.html,0,{css:{opacity:0},onComplete:function(){
            IWPTween.to(page.view.html,0.2,{css:{opacity:1},onComplete:onComplete,onCompleteParams:completeParams});
        }});
    }


}

SlideSwitch.prototype.removeDialog=function(page,container,onComplete,completeParams){
    if(window.document.body.opacity==undefined ){
        if(onComplete!=null){
            onComplete.apply(page.view.html,completeParams)
        }
    }else{
        IWPTween.to(page.view.html,0.2,{css:{opacity:0},onComplete:onComplete,onCompleteParams:completeParams});
    }
    //TweenLite.to(page.view.html,0.3,{opacity:0,onComplete:onComplete,onCompleteParams:completeParams});

}


SlideSwitch.prototype.showNotify=function(page,container,onComplete,completeParams){

    if(IWPTween.hasTranslate3d){
        var middle=IWebapp.getInstance()._container.offsetHeight*0.5 -page.view.html.offsetTop;
        IWPTween.to(page.view.html,0,{css:{y:(middle-40)+"px",opacity:1},onComplete:function(){
            IWPTween.to(page.view.html,0.3,{css:{opacity:1,y:((Math.random()*25+(middle-25)-Math.random()*25)+"px")},onComplete:onComplete,onCompleteParams:completeParams});

        }});
    }else{
         middle=50;
        IWPTween.to(page.view.html,0,{css:{y:(middle+10)+"%",opacity:1},onComplete:function(){
             IWPTween.to(page.view.html,0.3,{css:{opacity:1,y:((Math.random()*5+(middle)-Math.random()*5)+"%")},onComplete:onComplete,onCompleteParams:completeParams});

        }});
    }


    trace("middle:"+middle+" page height:"+IWebapp.getInstance()._container.offsetHeight+"  ,dialog top:"+page.view.html.offsetTop)




}

SlideSwitch.prototype.removeNotify=function(page,container,onComplete,completeParams){

    if(IWPTween.hasTranslate3d){
        var middle=IWebapp.getInstance()._container.offsetHeight*0.5-page.view.html.offsetTop;

        IWPTween.to(page.view.html,0.3,{css:{opacity:0,y:(middle-20)+"px"},onComplete:onComplete,onCompleteParams:completeParams});
    }else{
         middle=50;

        IWPTween.to(page.view.html,0.3,{css:{opacity:0,y:(middle-10)+"%"},onComplete:onComplete,onCompleteParams:completeParams});
    }
}

