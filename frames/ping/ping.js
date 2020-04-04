const { ipcRenderer, clipboard } = require('electron');
var currentWindow = require('electron').remote.getCurrentWindow();
var pingedIp;
ipcRenderer.on('initPing', (event, arg) => {
    ipcRenderer.send('executePing', arg);
});
ipcRenderer.on('setPingResults', (event, arg) => {
    let p = '';
    if(arg.port_check){
        p = '<p>' + arg.output + '</p>';
    }else {
        p = '<p>PING ' + arg.output.host + ' (' + arg.output.numeric_host + ') risposta in ' + arg.output.time + 'ms</p>';
    }

    let title = document.querySelector(".icons.title span");
    if(!title.innerHTML && arg.output.numeric_host){
        title.innerHTML = arg.output.numeric_host;
    }

    let container = document.getElementsByClassName("results_container")[0]
    container.innerHTML = p+container.innerHTML;
    if(arg.ip){
        pingedIp = arg.ip;
        document.getElementById("copyAndClose").classList.remove("hidden");
    }else{
        document.getElementById("copyAndClose").classList.add("hidden");
    }
});
document.getElementById("copyAndClose").addEventListener("click", function () {
    clipboard.writeText(pingedIp);
    currentWindow.close();
});