function DemoApp() {
    if (DemoApp._instance != null) throw  new Error("DemoApp is singleton class")

    this.username = null;
    this.password = null;
    this.userChangeHash=false;
}
DemoApp._instance = null;
DemoApp.getInstance = function () {
    if (DemoApp._instance == null) DemoApp._instance = new DemoApp();
    return DemoApp._instance;
}

DemoApp.prototype.init = function () {


    if(window.location.hash!=""){
        core.onHashChange(window.location.hash);
    }else{
        core.openPage("LoginPage", {username: "liu yi"})
    }


    var str="-1000.0223222px";
    var val=str.replace(/[^\d\.\-]/g,"")
    var val2=str.replace(/[\d\.\-\+]/g,"")
    trace("vvv:"+val)
    trace("uuuuu:"+val2)
    //handle deeplink, if this app is a web.

    return


    if(checkIEVersion(8)==true ){
        window.onhashchange=function(){
            core.onHashChange(window.location.hash);
        }
    }else{

        setInterval(function(){

            core.onHashChange(window.location.hash);
        },100)
    }





}


    function checkIEVersion(requireVersion){
        var userAgent = navigator.userAgent.toLowerCase();
        // Test if the browser is IE and check the version number is lower than 9
        if (/msie/.test(userAgent) &&
            parseFloat((userAgent.match(/.*(?:rv|ie)[\/: ](.+?)([ \);]|$)/) || [])[1]) < requireVersion) {
            // Navigate to error page
            return false
        }

        return true
    }


DemoApp.prototype.login = function (obj) {
    core.openPage("HomePage", {username: "liu yi"})
}

DemoApp.prototype.logout = function (obj) {
    core.openPage("LoginPage", {username: "liu yi"})
}


//===================pages================================


IWebapp.extend(LoginPage, IWPPage);
function LoginPage() {
    LoginPage.$super(this);
    this.loginBtn = null;
    this.regBtn = null;
    this.forget = null;
    this.usernameTxt = null;
    this.passwordTxt = null;
    this.learnLink = null;


}

LoginPage.prototype.onCreate = function (pageData) {
    LoginPage.method(this, "onCreate", pageData);



    this.setView("loginView");


    this.loginBtn = this.findViewItem("loginBtn")
    this.regBtn = this.findViewItem("regBtn")
    this.forget = this.findViewItem("forget")
    this.usernameTxt = this.findViewItem("username")
    this.passwordTxt = this.findViewItem("password")
    this.learnLink = this.findViewItem("learnLink")

    this.switchBtn=new IWebUISwitch(this.findViewItem("switchBtn"));


    this.slider=new IWebUISlider(this.findViewItem("slider"),{min:200,max:1000,snap:true,increment:800,animate:true});



    this.setValBtn=this.findViewItem("setValBtn");
    this.setPerBtn=this.findViewItem("setPerBtn");
    this.ball=this.findViewItem("ball");


      IWPTween.to(this.ball,1,{css:{x:"400px",y:"200px",opacity:0.5},
          onComplete:function(p){
          trace("commmm:"+p);
         IWPTween.to(this,1,{css:{x:"200px",y:"-50px",opacity:1}})
      },completeParams:["hahahah"]});



    addEvent(this.setValBtn,"change",function(e,context){
        context.slider.setVal(Number(this.value))
    },this)

    addEvent(this.setPerBtn,"change",function(e,context){
        context.slider.setPercent(Number(this.value))
    },this)


    var sliderVal= this.sliderVal=this.findViewItem("sliderVal");


    this.slider.onChange=function(p,val){
        sliderVal.innerText="percent:"+Math.round(p*100)+"  value:"+val;
    }


    // addEvent(this.view.html, "click", this.onClicked, this);
    addEvent(this.view.html, "tap", this.onTap, this);
    addEvent(this.view.html, "longtap", this.onLongTap, this);

//    var target= $(this.setValBtn)
//    target.fadeTo(500,0,function(){this.style.visibility="hidden";this.style.display="";})
//
//
//    setTimeout(function(){
//        //target[0].style.visibility="visible";
//        //我擦， 这才是JQ吗
//        target.css("visibility","visible")
//        target.fadeTo(500,1)
//    },2000)



}

LoginPage.prototype.onDestroy = function () {

    this.loginBtn = null;
    this.regBtn = null;
    this.forget = null;
    this.usernameTxt = null;
    this.passwordTxt = null;
    this.learnLink = null;
    this.switchBtn=null;
    removeEvent(this.view.html, "tap", this.onTap);
    removeEvent(this.view.html, "longtap", this.onLongTap);


}





LoginPage.prototype.onTap = function (e, context) {

    var target = (e.target) ? e.target : e.srcElement;//fot ie8


    if (target == context.loginBtn) {

        app.login({username: context.usernameTxt.value, password: context.passwordTxt.value})
    } else if (target == context.regBtn) {
        trace("Do register");
        iwp.getInstance().confirm("Do you want open a new page?",function(){trace("ok")},function(){trace("cancel")})

    }else if(target==context.forget){
        iwp.getInstance().notify("HI, check your email!")
    }else if(target==context.learnLink){
        trace("learnLink tap!!");
       // iwp.getInstance().notify("HI, easy work easy life!")
        iwp.getInstance().alert("WOWOWOWOWOW",function(){trace("ok")},function(){trace("cancel")})
    }

    return false

}

LoginPage.prototype.onLongTap = function (e, context) {

    var target = (e.target) ? e.target : e.srcElement;//fot ie8


    if (target == context.learnLink) {
        trace("Learn more....")
    }
    return false

}


IWebapp.extend(HomePage, IWPPage);
function HomePage() {
    HomePage.$super(this);
    this.logoutBtn = null;

}

HomePage.prototype.onCreate = function (pageData) {
    HomePage.method(this, "onCreate", pageData);

    this.setView("homeView");

    this.logoutBtn = this.findViewItem("logoutBtn", true);
    this.announceBtn = this.findViewItem("announceBtn", true);

    addEvent(this.view.html, "tap", this.onClicked, this);

    var btn=this.announceBtn;
    this.timer=setTimeout(function(){

        iwp.resumeNode(btn)
    },1000)

    this.timer2=setTimeout(function(){

        iwp.disableNode(btn)
    },3000)

}

HomePage.prototype.onDestroy = function () {
    removeEvent(this.view.html, "tap", this.onClicked);
    clearTimeout(this.timer)
    clearTimeout(this.timer2)
}

HomePage.prototype.onClicked = function (e, context) {
    var target = (e.target) ? e.target : e.srcElement;//fot ie8
    if (target == context.logoutBtn) {
        app.logout();
    } else if (target == context.announceBtn) {

        core.openChildPage("AnnouncePage", null, context);
    }

    return false
}


HomePage.prototype.onBack=function(){

    iwp.getInstance().notify("Do you realy want logout?")
    return true;
}

//HomePage.prototype.onHashChange=function(hash){
//
//    trace("homepage hash changed:"+hash)
//    hash.splice(0,1);
//    var childHash=hash[0];
//    if(childHash=="annouce"){
//        core.openChildPage("AnnouncePage", null, this);
//    }else if(childHash==""|| childHash==null){
//        trace("no child hash");
//        this.removeChildPage();
//    }
//}


IWebapp.extend(AnnouncePage, IWPPage);
function AnnouncePage() {

    AnnouncePage.$super(this);

}

AnnouncePage.prototype.onCreate = function (pageData) {

    this.setView("announceView");
    this.backBtn = this.findViewItem("backBtn");
    this.detailBtn=this.findViewItem("detailBtn");

    addEvent(this.view.html, "tap", this.onClicked, this);


}

AnnouncePage.prototype.onDestroy = function () {
    removeEvent(this.view.html, "tap", this.onClicked);
}


AnnouncePage.prototype.onClicked = function (e, context) {
    var target = (e.target) ? e.target : e.srcElement;//fot ie8
    if(target==context.backBtn){
        context.close()
    }else if(target==context.detailBtn){
        core.openChildPage("AnnounceChildPage",null,context);
    }

}




IWebapp.extend(AnnounceChildPage, IWPPage);
function AnnounceChildPage() {

    AnnounceChildPage.$super(this);

}

AnnounceChildPage.prototype.onCreate=function(){
    this.setView("annouceChildView");
    this.backBtn=this.findViewItem("backBtn");
    addEvent(this.view.html,"tap",this.onClicked,this);
}


AnnounceChildPage.prototype.onDestroy=function(){
    removeEvent(this.view.html,"tap",this.onClicked)
}

AnnounceChildPage.prototype.onClicked=function(e,context){
    var target = (e.target) ? e.target : e.srcElement;//fot ie8
    if(target==context.backBtn){
        context.close()
    }
}

IWebapp.extend(ConfirmPage, IWPPage);
function ConfirmPage(){
    AnnouncePage.$super(this);
    this.type=IWPPage.PAGE_TYPE_DIALOG;
}


ConfirmPage.prototype.onCreate=function(pageData){

    this.setView("confirmView");

    this.confirmBtn=this.findViewItem("confirmBtn");
    this.cancelBtn=this.findViewItem("cancelBtn");
    this.newDialogBtn=this.findViewItem("newDialogBtn");
    this.newPageBtn=this.findViewItem("newPageBtn");

    addEvent(this.view.html,"tap",this.onTap,this);

}


ConfirmPage.prototype.onTap=function(e,context){
    var target = (e.target) ? e.target : e.srcElement;//fot ie8
    if (target == context.confirmBtn) {
        app.logout();
    } else if (target == context.cancelBtn) {

        context.close();
    }else if(target==context.newDialogBtn){
        iwp.getInstance().openPage("ConfirmPage")
    }else if(target==context.newPageBtn){
       // iwp.getInstance().openPage("AnnouncePage")
        iwp.getInstance().openChildPage("AnnouncePage",null,context)
    }

    return false
}