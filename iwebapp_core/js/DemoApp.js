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

    window.onhashchange=function(){
        core.onHashChange(window.location.hash);
    }




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


    this.loginBtn = this.findViewItem("loginBtn", false)
    this.regBtn = this.findViewItem("regBtn", true)
    this.forget = this.findViewItem("forget", true)
    this.usernameTxt = this.findViewItem("username", true)
    this.passwordTxt = this.findViewItem("password", true)
    this.learnLink = this.findViewItem("learnLink", true)


   // addEvent(this.view.html, "click", this.onClicked, this);
    addEvent(this.view.html, "tap", this.onTap, this);
    addEvent(this.view.html, "longtap", this.onLongTap, this);





}

LoginPage.prototype.onDestroy = function () {

    this.loginBtn = null;
    this.regBtn = null;
    this.forget = null;
    this.usernameTxt = null;
    this.passwordTxt = null;
    this.learnLink = null;
    removeEvent(this.view.html, "tap", this.onTap);
    removeEvent(this.view.html, "longtap", this.onLongTap);

}


LoginPage.prototype.onTap = function (e, context) {

    var target = (e.target) ? e.target : e.srcElement;//fot ie8


    if (target == context.loginBtn) {

        app.login({username: context.usernameTxt.value, password: context.passwordTxt.value})
    } else if (target == context.regBtn) {
        trace("Do register");
        iwp.getInstance().openPage("ConfirmPage")
//       iwp.getInstance().openDialog("ConfirmPage")
    }else if(target==context.forget){
        trace("Forgot the password!!");
    }else if(target==context.learnLink){
        trace("learnLink tap!!");
    }

    //iwp.getInstance().notify("HI, welcome to here!")
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

    addEvent(this.view.html, "click", this.onClicked, this);

}

HomePage.prototype.onDestroy = function () {
    removeEvent(this.view.html, "click", this.onClicked);
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

    addEvent(this.view.html, "click", this.onClicked, this);


}

AnnouncePage.prototype.onDestroy = function () {
    removeEvent(this.view.html, "click", this.onClicked);
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

        iwp.getInstance().removePage(context)
    }else if(target==context.newDialogBtn){
        iwp.getInstance().openPage("ConfirmPage")
    }else if(target==context.newPageBtn){
       // iwp.getInstance().openPage("AnnouncePage")
        iwp.getInstance().openChildPage("AnnouncePage",null,context)
    }

    return false
}