// Modules to control application life and create native browser window
//require('electron-reload')(__dirname);

const {app, BrowserWindow, dialog, Menu} = require('electron');
const glob = require('glob');
const path = require('path');
let fs = require('fs');
let domXml = require('xmlbuilder');
let xmlConverter = require('xml2js');
let appPath = app.getPath("home") + "/Pinger/";

function createHome(event) {
    if (global.mainWindow != null) {
        global.mainWindow.destroy();
    }
    global.mainWindow = new BrowserWindow({
        show: false,
        width: 300,
        height: 500,
        frame: false,
        title: "Pinger",
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    global.mainWindow.loadFile('frames/main/main.html');
    global.mainWindow.once('ready-to-show', () => {
        global.mainWindow.show();
    });

    global.mainWindow.on('closed', function () {
        global.mainWindow = null;
    });
}

//CREATE SPLASH SCREEN
function createSplash(event) {
    global.mainWindow = new BrowserWindow({
        show: false,
        width: 500,
        height: 300,
        frame: false,
        hasShadow: false,
        title: "Pinger",
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    global.mainWindow.loadFile('frames/splash/splash.html');
    global.mainWindow.once('ready-to-show', () => {
        global.mainWindow.show();
    });

    //CHECK DIR
    if (!fs.existsSync(appPath)) {
        fs.mkdir(appPath);
    }
    if (!fs.existsSync(appPath + "config")) {
        fs.mkdir(appPath + "config");
    }

    fs.stat(appPath + 'config/configed.flag', function (err, stt) {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.writeFile(appPath + 'config/configed.flag', '', (err) => {
                    if (!err) {
                        fs.writeFile(appPath + 'config/sites.xml', createSitesRoot(), (err) => {
                            if (err) {
                                dialog.showErrorBox("Errore imprevisto!", err.message);
                                app.quit();
                            }
                        });
                        fs.writeFile(appPath + 'config/configs.xml', createConfigRoot(), (err) => {
                            if (err) {
                                dialog.showErrorBox("Errore imprevisto!", err.message);
                                app.quit();
                            }
                        });
                        fs.writeFile(appPath + 'config/cron.xml', createCronRoot(), (err) => {
                            if (err) {
                                dialog.showErrorBox("Errore imprevisto!", err.message);
                                app.quit();
                            }
                        });
                    } else {
                        dialog.showErrorBox("Errore imprevisto!", err.message);
                        app.quit();
                    }
                });
            }
        }
    });

    setTimeout(() => {
        createHome(event);
    }, 2000);
}


function createSitesRoot() {
    var sites = domXml.create("sites");
    return sites.end({pretty: true});
}

function createCronRoot() {
    var cron = domXml.create("cron");
    cron.ele("enabled", {}, 1);
    cron.ele("time", {}, '0 */2 * * * *');
    return cron.end({pretty: true});
}

function createConfigRoot() {
    var configs = domXml.create("configs");
    configs.ele("in_app", {}, 0);
    configs.ele("mail", {}, 0);
    configs.ele("server", {"port": "0"}, "");
    configs.ele("auth", {}, "");
    configs.ele("user", {}, "");
    configs.ele("password", {}, "");
    return configs.end({pretty: true});
}

function showAboutInfo() {
    let aboutWindow = new BrowserWindow({
        show: false,
        alwaysOnTop: true,
        width: 350,
        height: 250,
        resizable: false,
        frame: false,
        hasShadow: false,
        title: "Pinger | About",
        webPreferences: {
            nodeIntegration: true
        }
    });
    aboutWindow.loadFile('frames/about/about.html');
    aboutWindow.once('ready-to-show', () => {
        aboutWindow.show();
    });
}

app.on('ready', (event, arg) => {
    //MENUS
    const menuTemplate = [
        {
            label: 'Pinger',
            submenu: [
                {
                    label: "Informazioni",
                    click: () => {
                        showAboutInfo();
                    }
                },
                {
                    label: "Chiudi",
                    role: "close",
                    click: () => {
                        app.close();
                    }
                },
                {
                    label: "Esci",
                    role: 'quit',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Modifica',
            submenu: [
                {
                    label: "Cerca", accelerator: "CmdOrCtrl+F", click: () => {
                        global.mainWindow.webContents.send('focusOnSearch')
                    }
                },
                {type: "separator"},
                {label: "Taglia", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                {label: "Copia", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                {label: "Incolla", accelerator: "CmdOrCtrl+V", selector: "paste:"}
            ]
        },
        {
            label: 'Impostazioni',
            submenu: [
                {
                    label: "Notifiche",
                    click: () => {
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
                        fs.readFile(appPath + "config/configs.xml", function (err, data) {
                            xmlConverter.parseString(data, function (err, res) {
                                if (err != null) {
                                    dialog.showErrorBox("Errore imprevisto!", err.message);
                                }
                                settingWindow.webContents.on('did-finish-load', () => {
                                    settingWindow.send('loadSettings', res.configs);
                                });
                            });
                        });
                    }
                },
                {
                    label: "Cronjob",
                    click: () => {
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
                        fs.readFile(appPath + "config/cron.xml", function (err, data) {
                            xmlConverter.parseString(data, function (err, res) {
                                if (err != null) {
                                    dialog.showErrorBox("Errore imprevisto!", err.message);
                                }
                                cronWindow.webContents.on('did-finish-load', () => {
                                    cronWindow.send('loadCronSettings', res.cron);
                                });
                            });
                        });
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    /*tray = new Tray(__dirname+'/assets/img/tray_logo.png');
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Apri'},
        {label: 'Chiudi'}
    ]);
    tray.setToolTip('Pinger!')
    tray.setContextMenu(contextMenu)*/

    createSplash(event);

    var mpFiles = glob.sync(path.join(__dirname, 'frames/**/*.mp.js'))
    mpFiles.forEach((file) => {
        require(file)
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (global.mainWindow == null) {
        createHome();
    }
});
