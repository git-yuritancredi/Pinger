const { ipcMain, dialog, app } = require('electron');
let fs = require('fs');
let xmlConverter = require('xml2js');
let appPath = app.getPath("home")+"/Pinger/";

ipcMain.on('saveNewSite', (event, arg) => {
    if(arg.name && arg.port && arg.url){

        fs.readFile(appPath+"config/sites.xml", function (err, data) {
            xmlConverter.parseString(data, function (err, res) {
                if(err != null){
                    dialog.showErrorBox("Errore imprevisto!", err.message);
                }
                if(!arg.is_edit) {
                    if (res.sites.site) {
                        res.sites.site.push({
                            '$': {id: res.sites.site.length, port: arg.port},
                            name: arg.name,
                            url: arg.url
                        });
                    } else {
                        res.sites = {'site': [{'$': {id: 0, port: arg.port}, name: arg.name, url: arg.url}]};
                    }
                }else{
                    res.sites.site.forEach((elm) => {
                       if(elm.$.id == arg.id){
                           elm.$.port = arg.port;
                           elm.name = arg.name;
                           elm.url = arg.url;
                       }
                    });
                }
                var js2xmlBuilder = new xmlConverter.Builder();
                fs.writeFile(appPath+'config/sites.xml', js2xmlBuilder.buildObject(res), (err) => {
                    if (err) {
                        event.sender.send('saveNewSitePost', {success: false, message: err.message});
                    }else{
                        event.sender.send('saveNewSitePost', {success: true, siteName: arg.name});
                    }
                });
            });
        });
    }
});