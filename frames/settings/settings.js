const { ipcRenderer } = require('electron');
var currentWindow = require('electron').remote.getCurrentWindow();
document.getElementById("saveSettings").addEventListener("click", function () {

    let check = true;
    let in_app;
    let mail;
    let server = document.getElementById("server");
    let port = document.getElementById("port");
    let auth = document.getElementById("auth");
    let user = document.getElementById("username");
    let password = document.getElementById("password");

    if(document.getElementById("in_app").checked) {
        in_app = 1;
    }else{
        in_app = 0;
    }

    if(document.getElementById("mail").checked){
        mail = 1;

        if(!server.value){
            server.classList.add("validation-failed");
            check = false;
        }

        if(!port.value){
            port.classList.add("validation-failed");
            check = false;
        }

        if(auth.value){
            if(!user.value){
                user.classList.add("validation-failed");
                check = false;
            }

            if(!password.value){
                password.classList.add("validation-failed");
                check = false;
            }
        }
    }else{
        mail = 0;
    }

    if(check) {
        ipcRenderer.send('saveSettings', {
            in_app: in_app,
            mail: mail,
            server: server.value,
            port: port.value,
            auth: auth.value,
            user: user.value,
            password: password.value
        });
    }

});
document.getElementById("mail").addEventListener("change", function (){
    let state = document.getElementById("mail").checked;
    if(state){
        document.getElementById("mail_group").classList.remove("hidden");
    }else{
        document.getElementById("mail_group").classList.add("hidden");
    }
});
document.getElementById("auth").addEventListener("change", function () {
    let state = document.getElementById("auth").value;
    if(state == 'password'){
        document.getElementById("auth_group").classList.remove("hidden");
    }else{
        document.getElementById("auth_group").classList.add("hidden");
    }
});
ipcRenderer.on('saveSettingsPost', (event, arg) => {
    if(arg.success) {
        currentWindow.close();
    }else{
        document.getElementById("settings").classList.remove("loading");
    }
});
ipcRenderer.on('loadSettings', (event, arg) => {
    if(arg.in_app == 1){
        document.getElementById("in_app").checked = true;
    }
    if(arg.server[0].$.auth != 'password'){
        document.getElementById("auth_group").classList.add("hidden");
    }else{
        document.getElementById("auth").value = arg.server[0].$.auth;
        document.getElementById("auth_group").classList.remove("hidden");
    }
    if(arg.mail == 1){
        document.getElementById("mail").checked = true;
        document.getElementById("mail_group").classList.remove("hidden");
    }else{
        document.getElementById("mail_group").classList.add("hidden");
    }
    document.getElementById("username").value = arg.user;
    document.getElementById("password").value = arg.password;
    document.getElementById("server").value = arg.server[0]._;
    document.getElementById("port").value = arg.server[0].$.port;
});
ipcRenderer.on('doneConfig', (event, arg) => {
    if(arg.success){
        ipcRenderer.send("initBackground");
        currentWindow.close();
    }
});