const { ipcMain } = require('electron');
var ping = require('ping');
const isReachable = require('is-reachable');
const { CronJob } = require('cron');

ipcMain.on('executePing', (event, arg) => {
    isReachable(arg.url+":"+arg.$.port)
    .then((reachable) => {
        //if(reachable && arg.$.port != '80'){
            event.sender.send("setPingResults", {output: 'CHECK PORTA '+arg.$.port+" --> OK", ip: null, port_check: true});
        /*}else if(arg.$.port != '80'){
            event.sender.send("setPingResults", {output: 'CHECK PORTA '+arg.$.port+' --> <span class="fail">FAIL</span>', ip: null, port_check: true});
        }*/
        new CronJob('*/2 * * * * *', function () {
            ping.promise.probe(arg.url, {}).then((res) => {
                if (res.alive) {
                    event.sender.send("setPingResults", {output: res, ip: res.numeric_host, port_check: false});
                } else {
                    event.sender.send("setPingResults", {
                        output: 'Impossibile eseguire PING: ' + res.host + " host",
                        ip: false,
                        port_check: false
                    });
                }
            }).catch((err) => {
                event.sender.send("setPingResults", {output: err.message, ip: null, port_check: false});
            });
        }, null, true, 'Europe/Paris');
    });
});