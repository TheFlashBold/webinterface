const mongoose = require('mongoose');
const Promise = require('bluebird');
const fs = require('fs');

Promise.promisifyAll(fs);

function GetServer(id) {
    return global.models.server.findOne({_id: new mongoose.ObjectID(id)}).then((server) => {
        return server;
    });
}

function WriteFiles(serverid) {
    return GetServer(serverid).then((server) => {
        return new Promise.map(Object.keys(server.configs), (config) => {
            if (!config) {
                return;
            }
            return global.modules.file.find({_id: new mongoose.ObjectID(config._id)}).then((configFile) => {
                if (!configFile) {
                    return;
                }
                return MergeConfigs(configFile.content, config.content).then((data) => {
                    return PrepareString(configFile.template, data).then((configData) => {
                        console.log(configData);
                    });
                });
            });
        });
    });
}

function MergeConfigs(config, data) {
    let newConfig = {};
    return new Promise.map(Object.keys(config), (key) => {
        if (data[key]) {
            newConfig[key] = data[key];
        } else {
            newConfig[key] = config[key].default;
        }
    }).then(() => {
        return newConfig;
    });
}

function WriteFile(server, file) {
    file = file.replace(".", "_");
    return global.models.server.findOne({_id: new mongodb.ObjectID(server)}).then((server) => {
        if (server && server.configs[file]) {
            return global.models.file.findOne({_id: new mongoose.ObjectID(server.configs[file]._id)}).then((configData) => {
                    if (!configData) {
                        return;
                    }
                    let data = {};
                    return new Promise.map(Object.keys(configData.content), (key) => {
                        if (server.configs[file].content[key]) {
                            data[key] = server.configs[file].content[key];
                        } else {
                            data[key] = configData.content[key].default;
                        }
                    }).then(() => {
                        return PrepareString(configData.template, data).then((configFile) => {
                            console.log(configFile);
                            return fs.writeFileAsync(process.cwd() + "/server/" + server + "/" + configData.file, configFile);
                        });
                    });
                }
            );
        }
    });
}

function PrepareString(string, data) {
    return new Promise(function (resolve, reject) {
        if (typeof string === 'object') {
            return reject(false);
        }
        let regex = /\%([^\%]*)\%/g;
        let textVar;

        do {
            textVar = regex.exec(string);
            if (textVar) {
                let varPath = textVar[1].replace(":", ".");

                let value = ResolvePath(varPath, data);
                if (!value || typeof value === 'object') {
                    value = ResolvePath(varPath + ".value", data);
                }
                if (!value || value === "") {
                    value = ResolvePath(varPath + ".default", data);
                }
                string = string.replace("%" + textVar[1] + "%", value, data);
            }
        } while (textVar);

        return resolve(string);
    });
}

function ResolvePath(path, obj) {
    return path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj);
}