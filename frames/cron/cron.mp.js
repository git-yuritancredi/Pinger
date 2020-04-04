const { ipcMain, dialog, app } = require('electron');
let fs = require('fs');
let xmlConverter = require('xml2js');
let appPath = app.getPath("home")+"/Pinger/";

ipcMain.on('saveCronSettings', (event, arg) => {
    fs.readFile(appPath+"config/cron.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }

            res.cron.enabled = arg.enabled;
            res.cron.time = arg.time;

            var js2xmlBuilder = new xmlConverter.Builder();
            fs.writeFile(appPath+'config/cron.xml', js2xmlBuilder.buildObject(res), (err) => {
                if (!err) {
                    global.mainWindow.webContents.send('reloadAppConfig', '');
                    event.sender.send('doneCronConfig', {success: true});
                }else{
                    dialog.showErrorBox("Errore imprevisto!", err.message);
                }
            });

        });
    });
});