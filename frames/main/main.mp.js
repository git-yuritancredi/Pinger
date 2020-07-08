const { ipcMain, dialog, app, BrowserWindow } = require('electron');
const isReachable = require('is-reachable');
var ping = require('ping');
let fs = require('fs');
let xmlConverter = require('xml2js');
const ElectronOnline = require('electron-online');
const connection = new ElectronOnline();
let appPath = app.getPath("home")+"/Pinger/";

connection.on('online', () => {
    global.mainWindow.webContents.send('restartProcesses');
});
connection.on('offline', () => {
    global.mainWindow.webContents.send('blockProcesses');
});


ipcMain.on('showAddWindow', (event, arg) => {
    let addSiteWindow = new BrowserWindow({
        show: false,
        width: 350,
        height: 250,
        resizable: false,
        frame: false,
        hasShadow: true,
        title: "Pinger | Aggiungi sito",
        webPreferences: {
            nodeIntegration: true
        }
    });
    addSiteWindow.loadFile('frames/add/add.html');
    addSiteWindow.once('ready-to-show', () => {
        addSiteWindow.show();
    });
    addSiteWindow.on('closed', () => {
        loadSitesList();
    });
    if(arg.edit){
        fs.readFile(appPath+"config/sites.xml", function (err, data) {
            xmlConverter.parseString(data, function (err, res) {
                if (err != null) {
                    dialog.showErrorBox("Errore imprevisto!", err.message);
                }
                if(res.sites.site) {
                    res.sites.site.forEach((elm) => {
                        if (elm.$.id == arg.id) {
                            addSiteWindow.webContents.on('did-finish-load', () => {
                                addSiteWindow.send("setSiteParam", {
                                    id: elm.$.id,
                                    port: elm.$.port,
                                    name: elm.name,
                                    url: elm.url
                                });
                            });
                        }
                    });
                }
            });
        });
    }
});
ipcMain.on('searchInList', (event, arg) => {
    fs.readFile(appPath+"config/sites.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            if (res.sites.site){
                let regex = arg.toLowerCase();
                let results = {sites: {site: []}};
                res.sites.site.forEach((elm) => {
                    if(elm.name.toString().toLowerCase().includes(regex) || elm.url.toString().toLowerCase().includes(regex) || elm.$.port.toString().toLowerCase().includes(regex)){
                        results.sites.site.push({
                            '$': {id: elm.$.id, port: elm.$.port},
                            name: elm.name,
                            url: elm.url
                        });
                        isReachable(elm.url + ":" + elm.$.port)
                        .then((reachable) => {
                            results.sites.site[results.sites.site.length - 1].$.reachable = reachable;
                            global.mainWindow.webContents.send('setReachability', results);
                        });
                    }
                });
                global.mainWindow.webContents.send('renderSitesList', results);
            }
        });
    });
});
ipcMain.on('showSettingWindow', (event, arg) => {
    let settingWindow = new BrowserWindow({
        show: false,
        width: 500,
        height: 450,
        resizable: false,
        frame: false,
        hasShadow: true,
        title: "Pinger | Impostazioni",
        webPreferences: {
            nodeIntegration: true
        }
    });
    settingWindow.loadFile('frames/settings/settings.html');
    settingWindow.once('ready-to-show', () => {
        settingWindow.show();
    });
    fs.readFile(appPath+"config/configs.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            settingWindow.webContents.on('did-finish-load', () => {
                settingWindow.send('loadSettings', res.configs);
            });
        });
    });
});
ipcMain.on('showCronjobWindow', (event, arg) => {
    let cronWindow = new BrowserWindow({
        show: false,
        width: 350,
        height: 250,
        resizable: false,
        frame: false,
        hasShadow: true,
        title: "Pinger | Cron",
        webPreferences: {
            nodeIntegration: true
        }
    });
    cronWindow.loadFile('frames/cron/cron.html');
    cronWindow.once('ready-to-show', () => {
        cronWindow.show();
    });
    fs.readFile(appPath+"config/cron.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            cronWindow.webContents.on('did-finish-load', () => {
                cronWindow.send('loadCronSettings', res.cron);
            });
        });
    });
});
ipcMain.on('loadSitesList', (event, arg) => {
    loadSitesList();
});
ipcMain.on('getSiteIp', (event, arg) => {
    fs.readFile(appPath+"config/sites.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            res.sites.site.forEach((elm) => {
                if (elm.$.id == arg.id) {
                    ping.promise.probe(elm.url, {}).then((res) => {
                        if (res.alive) {
                            event.sender.send('copySiteIp', {ip: res.numeric_host, id: arg.id});
                        } else {
                            event.sender.send('copySiteIp', {ip: false, id: arg.id});
                        }
                    });
                }
            });
        });
    });
});
ipcMain.on('deleteSite', (event, arg) => {
    fs.readFile(appPath+"config/sites.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            res.sites.site.forEach((elm) => {
                if(elm.$.id == arg.id) {
                    res.sites.site.splice(res.sites.site.indexOf(elm), 1);
                }
            });

            var js2xmlBuilder = new xmlConverter.Builder();
            fs.writeFile(appPath+'config/sites.xml', js2xmlBuilder.buildObject(res), (err) => {
                if (err) {
                    dialog.showErrorBox("Errore imprevisto!", err.message);
                }else{
                    res.sites.site.forEach((elm) => {
                        isReachable(elm.url + ":" + elm.$.port)
                        .then((reachable) => {
                            res.sites.site[res.sites.site.indexOf(elm)].$.reachable = reachable;
                            global.mainWindow.webContents.send('setReachability', res);
                        });
                    });
                }
            });
            global.mainWindow.webContents.send('renderSitesList', res);
        });
    });
});
ipcMain.on("pingSite", (event, arg) => {
    let pingWindow = new BrowserWindow({
        show: false,
        width: 500,
        minWidth: 500,
        height: 400,
        minHeight: 400,
        resizable: true,
        frame: false,
        hasShadow: true,
        title: "Pinger | Ping Test",
        webPreferences: {
            nodeIntegration: true
        }
    });
    pingWindow.loadFile('frames/ping/ping.html');
    pingWindow.once('ready-to-show', () => {
        pingWindow.show();
    });

    fs.readFile(appPath+"config/sites.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            res.sites.site.forEach((elm) => {
                if (elm.$.id == arg.id) {
                    pingWindow.webContents.on('did-finish-load', () => {
                        pingWindow.send("initPing", elm);
                    });
                }
            });
        });
    });
});
function loadSitesList(){
    fs.readFile(appPath+"config/sites.xml", function (err, data) {
        xmlConverter.parseString(data, function (err, res) {
            if (err != null) {
                dialog.showErrorBox("Errore imprevisto!", err.message);
            }
            if(res.sites.site) {
                res.sites.site.forEach((elm) => {
                    isReachable(elm.url + ":" + elm.$.port)
                        .then((reachable) => {
                            res.sites.site[res.sites.site.indexOf(elm)].$.reachable = reachable;
                            global.mainWindow.webContents.send('setReachability', res);
                        });
                });
                global.mainWindow.webContents.send('renderSitesList', res);
            }
        });
    });
}
