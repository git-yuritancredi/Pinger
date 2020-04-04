const { ipcRenderer } = require('electron');
var currentWindow = require('electron').remote.getCurrentWindow();
window.is_edit = false;
window.edit_id = null;
document.getElementById("saveSite").addEventListener("click", function () {

    let siteName    = document.getElementById("name").value;
    let siteUrl     = document.getElementById("url").value;
    let sitePort    = document.getElementById("port").value;
    let check       = true;

    if(!siteName){
        document.getElementById("name").classList.add("validation-failed");
        check = false;
    }else{
        document.getElementById("name").classList.remove("validation-failed");
    }

    let regexp = /^^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
    if(!siteUrl || !regexp.test(siteUrl)){
        document.getElementById("url").classList.add("validation-failed");
        check = false;
    }else{
        document.getElementById("url").classList.remove("validation-failed");
    }
    if(!sitePort || isNaN(sitePort)){
        document.getElementById("port").classList.add("validation-failed");
        check = false;
    }else{
        document.getElementById("port").classList.remove("validation-failed");
    }

    if(check){
        ipcRenderer.send("saveNewSite", {name: siteName, url: siteUrl, port: sitePort, is_edit: window.is_edit, id: window.edit_id});
        document.getElementById("add").classList.add("loading");
    }
});
ipcRenderer.on('saveNewSitePost', (event, arg) => {
    if(arg.success) {
        currentWindow.close();
    }else{
        document.getElementById("add").classList.remove("loading");
    }
});
ipcRenderer.on('setSiteParam', (event, arg) => {
    document.getElementById("name").value = arg.name;
    document.getElementById("url").value = arg.url;
    document.getElementById("port").value = arg.port;
    window.is_edit = true;
    window.edit_id = arg.id;
});