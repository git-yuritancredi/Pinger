const { ipcMain, dialog, app } = require('electron');
let fs = require('fs');
let xmlConverter = require('xml2js');
let appPath = app.getPath("home")+"/Pinger/";

ipcMain.on('saveSettings', (event, arg) => {
    fs.readFile(appPath+"config/configs.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }

            if(!res.configs.server[0].$){
                let current_value = res.configs.server;
                res.configs.server = [];
                res.configs.server.push({ _: current_value, '$': {port: 0, auth: 0}});
                console.log(res.configs.server);
            }

            res.configs.in_app           = arg.in_app;
            res.configs.mail             = arg.mail;
            res.configs.server[0].$.port = arg.port;
            res.configs.server[0].$.auth = arg.auth;
            res.configs.server[0]._      = arg.server;
            res.configs.user             = arg.user;
            res.configs.password         = arg.password;

            var js2xmlBuilder = new xmlConverter.Builder();
            fs.writeFile(appPath+'config/configs.xml', js2xmlBuilder.buildObject(res), (err) => {
                if (!err) {
                    global.mainWindow.webContents.send('reloadAppConfig', '');
                    event.sender.send('doneConfig', {success: true});
                }else{
                    dialog.showErrorBox("Errore imprevisto!", err.message);
                }
            });

        });
    });
});