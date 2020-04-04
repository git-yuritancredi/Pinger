const { ipcRenderer } = require('electron');
var currentWindow = require('electron').remote.getCurrentWindow();
document.getElementById("saveSettings").addEventListener("click", function () {

    let check = true;
    let enabled;
    let enabledElm = document.getElementById("enabled");
    if(enabledElm.checked){
        enabled = 1;
    }else{
        enabled = 0;
    }
    let time = document.getElementById("time");

    if(enabledElm.checked) {
        if (!time.value) {
            time.classList.add("validation-failed");
            check = false;
        }
    }

    if(check) {
        ipcRenderer.send('saveCronSettings', {
            enabled: enabled,
            time: time.value
        });
    }

});
ipcRenderer.on('loadCronSettings', (event, arg) => {
    if(arg.enabled == 1){
        document.getElementById("enabled").checked = true;
    }
    document.getElementById("time").value = arg.time;
});
ipcRenderer.on('doneCronConfig', (event, arg) => {
    if(arg.success){
        ipcRenderer.send("initBackground");
        currentWindow.close();
    }
});