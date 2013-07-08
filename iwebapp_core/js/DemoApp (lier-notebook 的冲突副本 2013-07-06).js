function DemoApp() {
    if (DemoApp._instance != null) throw  new Error("DemoApp is singleton class")

    this.username = null;
    this.password = null;
}
DemoApp._instance = null;
DemoApp.getInstance = function () {
    if (DemoApp._instance == null) DemoApp._instance = new DemoApp();
    return DemoApp._instance;
}

DemoApp.prototype.init = function () {


    core.openPage("LoginPage", {username: "liu yi"})

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
    this.usernameTxt = null;
    this.passwordTxt = null;
    this.learnLink = null;


}

LoginPage.prototype.onCreate = function (pageData) {
    LoginPage.method(this, "onCreate", pageData);



    this.setView("loginView");


    this.loginBtn = this.findViewItem("loginBtn", true)
    this.regBtn = this.findViewItem("regBtn", true)
    this.usernameTxt = this.findViewItem("username", true)
    this.passwordTxt = this.findViewItem("password", true)
    this.learnLink = this.findViewItem("learnLink", true)


    addEvent(this.view.html, "click", this.onClicked, this);
    addEvent(this.view.html, "tap", this.onTap, this);
    addEvent(this.view.html, "longtap", this.onTap, this);




}

LoginPage.prototype.onDestroy = function () {

    this.loginBtn = null;
    this.regBtn = null;
    this.usernameTxt = null;
    this.passwordTxt = null;
    this.learnLink = null;
    removeEvent(this.view.html, "click", this.onClicked);
    removeEvent(this.view.html, "tap", this.onTap);

}


LoginPage.prototype.onClicked = function (e, context) {

    var target = (e.target) ? e.target : e.srcElement;//fot ie8


    if (target == context.loginBtn) {

        app.login({username: context.usernameTxt.value, password: context.passwordTxt.value})
    } else if (target == context.regBtn) {
        trace("Do register");
    }
    return false

}

LoginPage.prototype.onTap = function (e, context) {

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


IWebapp.extend(AnnouncePage, IWPPage);
function AnnouncePage() {

    AnnouncePage.$super(this);

}

AnnouncePage.prototype.onCreate = function (pageData) {

    this.setView("announceView");
    this.backBtn = this.findViewItem("backBtn", true);

    addEvent(this.backBtn, "click", this.onClicked, this);

}

AnnouncePage.prototype.onDestroy = function () {
    removeEvent(this.backBtn, "click", this.onClicked);
}


AnnouncePage.prototype.onClicked = function (e, context) {
    context.close()
}

