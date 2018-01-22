const configHandler = require('./configHandler');
const fs = require('fs');
const ps = require('ps-node');
const Promise = require('bluebird');
const events = require('events');

function StartServer(id) {
    return new Promise((resolve, reject) => {
        let start = function () {
            return configHandler.ConfigGetString(id, "start").then((cmdParam) => {
                let args = cmdParam.split(" ");
                let cmd = args[0];
                args.splice(0, 1);

                let spawn = require('child_process').spawn;
                let child = spawn(cmd, args, {cwd: process.cwd() + '/server/' + id + '/'});

                fs.writeFileSync(process.cwd() + "/server/" + id + "/pid", child.pid);

                if (!global.log) {
                    global.log = {};
                }

                if (!(id in global.log)) {
                    global.log[id] = {
                        log: [],
                        addLog: (log) => {
                            global.log[id].log.push(log);
                            if (global.log[id].log.length > 50) {
                                global.log[id].log = global.log[id].log.slice(-50);
                            }
                        }
                    }
                }

                child.stdout.on('data', function (data) {
                    global.log[id].addLog(data.toString().replace("\n", "<br/>"));
                    global.io.sockets.in(id).emit('log', data.toString());
                    //console.log('[' + id + '] stdout: ' + data);
                });
                child.stderr.on('data', function (data) {
                    global.log[id].addLog(data.toString().replace("\n", "<br/>"));
                    global.io.sockets.in(id).emit('log', data.toString());
                    //console.log('[' + id + '] stderr: ' + data);
                });
                child.on('close', function (code) {
                    global.io.sockets.in(id).emit('log', GetTime() + ' [SYSTEM] Server shutdown. CODE: ' + code + '\n');
                    global.io.sockets.in(id).emit('shutdown');
                    //console.log('[' + id + '] closing code: ' + code);
                    fs.unlinkSync(__dirname + "/../server/" + id + "/pid");
                });

                child.stdin.setEncoding = 'utf-8';

                global.server.on(id + '.command', function (cmd) {
                    console.log(cmd);
                    try {
                        child.stdin.write(cmd + "\r\n");
                    } catch (err) {
                        console.log(err);
                    }
                });
            });
        };

        if (fs.existsSync(process.cwd() + "/server/" + id + "/pid")) {
            let pid = parseInt(fs.readFileSync(process.cwd() + "/server/" + id + "/pid"));
            return ps.lookup({pid: pid}, function (err, resultList) {
                if (err) {
                    global.io.sockets.in(id).emit('error', err.toString());
                    return reject(new Error(err));
                }

                var process = resultList[0];

                if (process) {
                    console.log('[' + id + ']: pid %s is running', process.pid);
                    return resolve({message: "pid " + process.pid + " is running!", success: false});
                }
                else {
                    console.log('[' + id + ']: PID file exists but no process found, starting anyway!');
                    start();
                    return resolve({message: "no pid file found, starting anyway!", success: true});
                }
            });
        }
        else {
            start();
            return resolve({message: "starting", success: true});
        }
    });
}

function GetServerState(id) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(process.cwd() + "/server/" + id + "/pid")) {
            let pid = parseInt(fs.readFileSync(process.cwd() + "/server/" + id + "/pid"));
            return ps.lookup({pid: pid}, function (err, resultList) {
                if (err) {
                    global.io.sockets.in(id).emit('error', err.toString());
                    return reject(new Error(err));
                }

                let process = resultList[0];

                if (process) {
                    return resolve({status: "running"});
                }
                else {
                    return resolve({status: "stopped"});
                }
            });
        }

        return resolve({status: "stopped"});
    });
}

function StopServer(id) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(process.cwd() + "/server/" + id + "/pid")) {
            console.log("no pid file found");
            return resolve(false);
        }

        var pid = parseInt(fs.readFileSync(process.cwd() + "/server/" + id + "/pid"));
        console.log('[' + id + ']: pid found: ' + pid);

        return ps.lookup({pid: pid}, function (err, resultList) {
            if (err) {
                global.io.sockets.in(id).emit('error', err.toString());
                eturn
                reject(new Error(err));
            }

            var process = resultList[0];

            if (process) {
                return ps.kill(pid, function (err) {
                    if (err) {
                        return reject(new Error(err));
                    }
                    else {
                        console.log('[' + id + ']: Process %s has been killed!', pid);
                        return resolve(true);
                    }
                });
            }
            else {
                console.log('[' + id + ']: PID file exists but no process found ...');
                return resolve(true);
            }
        });
    });
}

function GetTime() {
    var d = new Date();
    return "[" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "]";
}

module.exports = {
    StartServer: StartServer,
    StopServer: StopServer,
    GetServerState: GetServerState,
    GetTime: GetTime
};