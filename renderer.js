// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const currentWindow = require('electron').remote.getCurrentWindow();
const BrowserWindow = require('electron').remote.BrowserWindow;

document.addEventListener('mousewheel', function(e) {
    if(e.deltaY % 1 !== 0) {
        e.preventDefault();
    }
});

document.getElementById("close").addEventListener('click', function () {
    currentWindow.close();
});