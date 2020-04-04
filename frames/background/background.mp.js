const {app, dialog, ipcMain} = require('electron');
let fs = require('fs');
let xmlConverter = require('xml2js');
let appPath = app.getPath("home")+"/Pinger/";
const isReachable = require('is-reachable');
const { CronJob } = require('cron');
var curent_cron = null;
var notifyError = [];


ipcMain.on('initBackground', (event, arg) => {

    if(curent_cron != null){
        curent_cron.stop();
    }

    fs.readFile(appPath + "config/configs.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, settings) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }

            fs.readFile(appPath+"config/cron.xml", function (err, data) {
                xmlConverter.parseString(data, function (err, cronConfig) {
                    if (err != null) {
                        dialog.showErrorBox("Errore imprevisto!", err.message);
                    }
                    if(cronConfig.cron.enabled) {
                        fs.readFile(appPath + "config/sites.xml", function (err, sites) {
                            xmlConverter.parseString(sites, function (err, res) {
                                if (err != null) {
                                    dialog.showErrorBox("Errore imprevisto!", err.message);
                                }
                                if (res.sites.site) {
                                    if(res.sites.site.length > 0) {
                                        if (settings.configs.in_app && cronConfig.cron.time) {
                                            curent_cron = new CronJob(cronConfig.cron.time.toString(), function () {
                                                res.sites.site.forEach(elm => {
                                                    isReachable(elm.url + ":" + elm.$.port)
                                                        .then((reachable) => {
                                                            if ((notifyError.includes(elm.$.id) && reachable) || (!notifyError.includes(elm.$.id) && !reachable)) {
                                                                if (!reachable) {
                                                                    global.mainWindow.webContents.send('sendDownAlert', elm);
                                                                    notifyError.push(elm.$.id);
                                                                } else {
                                                                    global.mainWindow.webContents.send('sendUpAlert', elm);
                                                                    notifyError.splice(notifyError.indexOf(elm.$.id), 1);
                                                                }
                                                            }
                                                            res.sites.site[res.sites.site.indexOf(elm)].$.reachable = reachable;
                                                            global.mainWindow.webContents.send('setReachability', res);
                                                        });
                                                });
                                            }, null, true, 'Europe/Paris');
                                        }
                                    }

                                }
                            });
                        });
                    }
                });
            });
        });
    });
});