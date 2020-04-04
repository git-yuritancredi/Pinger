const { ipcRenderer, clipboard } = require('electron');
var siteListTemplate = '<li class="site success" id="site_{{SITE_ID}}"><span class="name">{{SITE_NAME}}</span><span class="actions"><span onclick="execPing({{SITE_ID}});" class="ping"></span><span onclick="copySiteIp({{SITE_ID}});" class="copy"></span><span onclick="editSite({{SITE_ID}});" class="edit"></span><span onclick="deleteSite({{SITE_ID}});" class="delete"></span></span></li>';
const shell = require('electron').shell;
var timeout = null;
var lastOffline = false;
ipcRenderer.on('renderSitesList', (event, arg) => {
    let containerElem = document.getElementsByClassName("sites_list")[0];
    let listContainer = containerElem.getElementsByTagName("ul")[0];
    listContainer.innerHTML = "";
    if(containerElem.classList.contains("empty")){
        containerElem.classList.remove("empty");
    }
    arg.sites.site.forEach(function (site) {
        var toInsert = siteListTemplate;
        toInsert = toInsert.replace("{{SITE_NAME}}", site.name);
        toInsert = toInsert.replace("{{SITE_URL}}", site.url);
        toInsert = toInsert.replace(/{{SITE_ID}}/g, site.$.id);
        if(site.$.reachable == false){
            toInsert = toInsert.replace("success", "error");
        }else if(site.$.reachable != true){
            toInsert = toInsert.replace("success", "undefinited");
        }
        listContainer.innerHTML += toInsert;
    });
});
ipcRenderer.on('setReachability', (event, arg) => {
    arg.sites.site.forEach(function (site) {
        let siteRow = document.getElementById("site_"+site.$.id);
        siteRow.classList.remove("success");
        siteRow.classList.remove("error");
        siteRow.classList.remove("undefinited");
        if(site.$.reachable == true){
            siteRow.classList.add("success");
        }else if(site.$.reachable == false){
            siteRow.classList.add("error");
        }else{
            siteRow.classList.add("undefinited");
        }
    });
});
ipcRenderer.on('copySiteIp', (event, arg) => {
    if(arg.ip){
        clipboard.writeText(arg.ip);
        let myNotification = new Notification('Indirizzo IP Copiato.', {
            body: "L'indirizzo "+arg.ip+" è stato copiato nella tua Clipboard.",
            silent: true,
            tag: "site_"+arg.id
        })
        myNotification.onclick = () => {
            myNotification.close();
        }
    }else{
        let myNotification = new Notification('Impossibile copiare indirizzo IP.', {
            body: "Il sito di cui cerchi di copiare l'indirizzo IP risulta irraggiungibile.",
            silent: true,
            tag: "site_"+arg.id
        })
        myNotification.onclick = () => {
            myNotification.close();
        }
    }
});
ipcRenderer.on("sendDownAlert", (event, arg) => {
    if(navigator.onLine) {
        let myNotification = new Notification('ATTENZIONE', {
            body: "Il dominio " + arg.name + " (" + arg.url + ") non risulta raggiungibile sulla porta " + arg.$.port + "!",
            silent: false,
            tag: "site_" + arg.$.id
        })
        myNotification.onclick = () => {
            shell.openExternal("http://" + arg.url.toString() + ":" + arg.$.port.toString());
            myNotification.close();
        }
    }else{
        lastOffline = true;
    }
});
ipcRenderer.on("sendUpAlert", (event, arg) => {
    if(!lastOffline) {
        let myNotification = new Notification('DOMINIO ' + arg.name + " UP", {
            body: "Il dominio " + arg.name + " (" + arg.url + ") risulta essere nuovamente raggiungibile sulla porta " + arg.$.port + "!",
            silent: false,
            tag: "site_" + arg.$.id
        })
        myNotification.onclick = () => {
            shell.openExternal("http://" + arg.url.toString() + ":" + arg.$.port.toString());
            myNotification.close();
        }
    }else{
        lastOffline = false;
    }
});
ipcRenderer.on('focusOnSearch', (event, arg) => {
   document.getElementById("search").focus();
});
ipcRenderer.on('restartProcesses', (event, args) => {
    ipcRenderer.send("loadSitesList", '');
    ipcRenderer.send("initBackground");
    document.getElementById("no_connection").classList.add("hidden");
    document.getElementsByClassName("sites_list")[0].classList.remove("hidden");
});
ipcRenderer.on('blockProcesses', (event, args) => {
    document.getElementById("no_connection").classList.remove("hidden");
    document.getElementsByClassName("sites_list")[0].classList.add("hidden");
});
document.addEventListener("DOMContentLoaded", function () {
    ipcRenderer.send("loadGlobalSettings", '');
    if(navigator.onLine) {
        ipcRenderer.send("loadSitesList", '');
        ipcRenderer.send("initBackground");
    }else{
        document.getElementById("no_connection").classList.remove("hidden");
        document.getElementsByClassName("sites_list")[0].classList.add("hidden");
    }
});
document.getElementById("settings").addEventListener("click", function () {
    let menu = document.getElementsByClassName("settings_menu");
    if(menu[0].classList.contains("opened")){
        menu[0].classList.remove("opened");
    }else{
        menu[0].classList.add("opened");
    }
});
document.addEventListener("click", function () {
    let menu = document.getElementsByClassName("settings_menu");
    let icon = document.getElementById("settings");

    if((menu[0].classList.contains("opened") && !menu[0].matches(":hover") && !icon.matches(":hover"))){
        menu[0].classList.remove("opened");
    }
});
document.getElementById("addSiteButton").addEventListener("click", function() {
    ipcRenderer.send('showAddWindow', "");
    let menu = document.getElementsByClassName("settings_menu");
    if(menu[0].classList.contains("opened")){
        menu[0].classList.remove("opened");
    }
});
document.getElementById("showSettingWindow").addEventListener("click", function () {
    ipcRenderer.send('showSettingWindow', "");
    let menu = document.getElementsByClassName("settings_menu");
    if(menu[0].classList.contains("opened")){
        menu[0].classList.remove("opened");
    }
});
document.getElementById("showCronjobWindow").addEventListener("click", function () {
    ipcRenderer.send('showCronjobWindow', "");
    let menu = document.getElementsByClassName("settings_menu");
    if(menu[0].classList.contains("opened")){
        menu[0].classList.remove("opened");
    }
});
document.getElementById("search").addEventListener("keyup", function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
       if(this.value.length){
           ipcRenderer.send('searchInList', this.value);
       }else{
           ipcRenderer.send("loadSitesList", '');
       }
   }, 500);
});
window.execPing = function (id) {
    ipcRenderer.send('pingSite', {id: id});
}
window.editSite = function (id) {
    ipcRenderer.send('showAddWindow', {edit: true, id: id});
}
window.deleteSite = function (id) {
    ipcRenderer.send('deleteSite', {id: id});
    ipcRenderer.send("initBackground");
}
window.copySiteIp = function (id) {
    ipcRenderer.send('getSiteIp', {id: id});
}