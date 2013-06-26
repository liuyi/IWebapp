

core=null;
app=null;
function AppStart(){


    core=IWebapp.getInstance();
    core.init($("#pageContainer"),"config.xml",{onReady:function(){

        app=DemoApp.getInstance();
        app.init();


    }})






}


/***run the app**/
$(window).ready(function(){


    if(String(window.document.location).indexOf("http")==0) {

       AppStart()
    }else{

        document.addEventListener('deviceready', onDeviceReady, false);
    }



});




