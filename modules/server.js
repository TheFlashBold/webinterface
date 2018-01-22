'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Path = require('path');

let config = {};
let configPath = __dirname + "/../config";

fs.readdirAsync(configPath).map((folder) => {
    fs.readdirAsync(configPath + "/" + folder).map((file) => {
        return Path.join(configPath, folder, file);
    }).map((path) => {
        return fs.readFileAsync(path)
            .then(JSON.parse)
            .then((data) => {
                config[data.name] = config[data.name] || {};
                config[data.name][data.version] = data;
                console.log("loading " + data.version);
            });
    });
});

class Server {
    constructor(){
        this.config = null;
        this.id = "";
    }

    static Create(type, version){
        if(this.config !== null || this.id !== ""){
            return {error: "Server not empty!"};
        }
        if(!config[type] || (!config[type] && config[type][version])){
            return {error: "Type or version doesn't exist!"};
        }
        this.config = config[type][version] || false;
    }

    static Load(id){
        let path = Path.join(__dirname, "..", "server", id, "conf.json");
        if(!fs.existsSync(path)){
            return;
        }
        this.id  = id;
        let data = fs.readFileSync(path);
        this.config = JSON.parse(data);
    }

    static Save(id) {
        fs.writeFileSync(__dirname + "/../server/" + id + "/conf.json", JSON.stringify(this.config));
    }

    static WriteallConfigs(id) {
        Object.keys(this.config.config_files).forEach(function (file) {
            WriteConfigFile(this.config.config_files, file, id);
        });
    }

    static WriteConfigFile(fileName, id) {
        let content = "";
        let _conf = this.config[fileName]._conf;

        if (_conf.type && _conf.type === "JSON-Array") {

            Object.keys(this.config[fileName]).forEach(function (key) {
                if (key !== "_conf") {
                    content += JSON.stringify(this.config[fileName][key].value, null, 4);
                }
            });
            try {
                fs.writeFileSync(__dirname + "/../server/" + id + "/" + fileName.replace("_", "."), content);
            } catch (err) {
                console.error(err);
            }
            return;
        }

        Object.keys(config[fileName]).forEach(function (key) {
            if (key !== "_conf") {
                content += key + _conf.separator + (config[fileName][key].value || config[fileName][key].default) + _conf.line_ending;
            }
        });
        try {
            fs.writeFileSync(__dirname + "/../server/" + id + "/" + fileName.replace("_", "."), content);
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = Server;