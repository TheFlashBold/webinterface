const fs = require('fs');
const Promise = require('bluebird');
const Path = require('path');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoose = require('mongoose');

Promise.promisifyAll(fs);

let config = {};
let configPath = __dirname + "/../config";

function init() {
    return global.models.game.find().lean().then((games) => {
        return new Promise.map(games, (game) => {
            config[game.label] = config[game.label] || {};
            config[game.label][game.version] = game;
            console.log("loading " + game.version);
        });
    });
}

function WriteallConfigs(config, id) {
    return Promise.map(Object.keys(config.config_files)).then((file) => {
        return WriteConfigFile(config.config_files, file, id);
    });
}

function WriteConfigFile(config, fname, id) {
    new Promise((resolve, reject) => {
        let content = "";
        let _conf = config[fname]._conf;

        if (_conf.type && _conf.type === "JSON-Array") {

            Object.keys(config[fname]).forEach(function (key) {
                if (key !== "_conf") {
                    content += JSON.stringify(config[fname][key].value, null, 4);
                }
            });
            try {
                fs.writeFileSync(process.cwd() + "/server/" + id + "/" + fname.replace("_", "."), content);
            } catch (err) {
                console.error(err);
            }
            return;
        }

        Object.keys(config[fname]).forEach(function (key) {
            if (key !== "_conf") {
                content += key + _conf.separator + (config[fname][key].value == "" ? config[fname][key].default : config[fname][key].value) + _conf.line_ending;
            }
        });

        try {
            fs.writeFileSync(process.cwd() + "/server/" + id + "/" + fname.replace("_", "."), content);
        } catch (err) {
            console.error(err);
        }

        return resolve();
    });
}

function LoadConfig(id) {
    return global.models.server.findOne({_id: new mongodb.ObjectID(id)}).then((server) => {
        if (server) {
            return server;
        }

        if (!fs.existsSync(process.cwd() + "/server/" + id + "/conf.json")) {
            return false;
        }

        return JSON.parse(fs.readFileSync(process.cwd() + "/server/" + id + "/conf.json"));
    });
}

function SaveConfig(config, id) {
    return new Promise((resolve, reject) => {
        Object.keys(config).forEach((key) => {
            server[key] = config[key];
        });
        server.save();
        return;

        fs.writeFileSync(process.cwd() + "/../server/" + id + "/conf.json", JSON.stringify(config));
    });
}

function MergeConfig(config, c, file) {
    return new Promise((resolve, reject) => {
        c.forEach(function (setting) {
            config.config_files[file.replace(".", "_")][setting.name].value = setting.value;
        });
        return resolve(config);
    });
}

function GetConfig(game, version) {
    return new Promise((resolve, reject) => {
        return global.models.game.findOne({label: game, version: version}).exec().then((gameConfig) => {
            if (gameConfig) {
                return global.models.file.find({game: game, versions: version}).then((files) => {
                    gameConfig.configs = files;
                });
            }
        });
    });
}

function MakeServer(id, game, version, user) {
    return new Promise((resolve, reject) => {
        let server = new global.models.server();

        if (fs.existsSync(process.cwd() + "/server/" + server._id)) {
            return reject();
        }
        else {
            fs.mkdir(process.cwd() + "/server/" + server._id);
        }

        return global.models.game.findOne({label: game, version: version}).lean().exec().then((template) => {
            Object.keys(template).forEach((key) => {
                server.set(key, template[key]);
            });

            server.label = id;
            server.access = [mongoose.mongo.ObjectId(user._id)];

            return global.models.file.find({game: template.game, version: version}).lean().then((config_files) => {
                let files = {};
                for (let i = 0; i < config_files.length; i++) {
                    let file = config_files[i];
                    files[file.label.replace(".", "_")] = file;
                }

                server.set('config_files', files);

                server.markModified('config_files');
                server.markModified('files');
                server.markModified('vars');
                server.save();
                //return WriteallConfigs(server, id);
            });

        });
        /*
        return GetConfig(game, version).then((config) => {
            return SaveConfig(config, id).then(() => {
                return WriteallConfigs(config, id);
            });
        });
        */
    });
}

function GetGames() {
    return new Promise((resolve, reject) => {
        var games = [];

        Object.keys(config).forEach(function (game) {
            var versions = [];
            Object.keys(config[game]).forEach(function (version) {
                versions.push(version);
            });
            games.push({"name": game, versions: versions});
        });

        return resolve(games);
    });
}

function ConfigGetString(id, path) {
    return LoadConfig(id).then((config) => {
        return PrepareString(config, path);
    });
}

function PrepareString(config, path) {
    return new Promise(function (resolve, reject) {
        var s = config[path];
        if (typeof s === 'object') {
            return reject(false);
        }
        var re = /\%([^\%]*)\%/g;
        var m;

        do {
            m = re.exec(s);
            if (m) {
                var p = m[1].replace(":", ".");

                var val = ResolvePath(p, config);
                if (!val || typeof val === 'object') {
                    val = ResolvePath(p + ".value", config);
                }
                if (!val || val === "") {
                    val = ResolvePath(p + ".default", config);
                }
                var suf = ResolvePath(p + ".suffix", config);
                if (!suf) {
                    suf = "";
                }
                s = s.replace("%" + m[1] + "%", val + suf, config);
            }
        } while (m);

        return resolve(s);
    });
}

function ResolvePath(path, obj) {
    return path.split('.').reduce(function (prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj)
}

module.exports = {
    init: init,
    WriteallConfigs: WriteallConfigs,
    WriteConfigFile: WriteConfigFile,
    SaveConfig: SaveConfig,
    LoadConfig: LoadConfig,
    GetConfig: GetConfig,
    MergeConfig: MergeConfig,
    GetGames: GetGames,
    MakeServer: MakeServer,
    PrepareString: PrepareString,
    ConfigGetString: ConfigGetString,
    ResolvePath: ResolvePath
};