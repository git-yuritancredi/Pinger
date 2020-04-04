const currentWindow = require('electron').remote.getCurrentWindow();

document.addEventListener("click", function () {
    currentWindow.close();
});