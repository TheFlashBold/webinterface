const express = require('express');
const router = express.Router();
const fs = require('fs');
const configHandler = require('./../modules/configHandler');
const serverHandler = require('./../modules/serverHandler');
const Promise = require('bluebird');
const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;

router.post('/login', function (req, res, next) {
    let username = req.body.username;
    let password = crypto.createHash('md5').update(req.body.password).digest("hex");

    let user = null;
    let sessionID = crypto.createHash('md5').update(username + "_" + new Date()).digest("hex")

    MongoClient.connect("mongodb://localhost:27017/webinterface", function (err, db) {
        db.collection('users').findOne({username: username}, function (err, data) {
            if (data === null) {
                res.json({success: false, message: "Ung�ltige Eingabe"});
                return;
            }

            if (data.password !== password) {
                res.json({success: false, message: "Ung�ltige Eingabe"});
                return;
            }

            user = data;

            db.collection('users').updateOne({
                username: username,
                password: password
            }, {$set: {session: sessionID}}, function (err) {
                db.close();
            });

            res.cookie('session', sessionID, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true
            });
            res.locals.user = data;
            res.json({success: true});
        });
    });
});

router.post('/logout', function (req, res, next) {
    res.clearCookie('session');
    res.json({success: true});
});

router.post('/saveFile/:id/:file', function (req, res, next) {
    let id = req.params.id;
    let file = req.params.file;

    let data = req.body.config || {};

    return configHandler.LoadConfig(id).then((config) => {
        if (!config) {
            return;
        }

        if (file !== 'vars') {
            return configHandler.MergeConfig(config, data, file).then((config) => {
                config.markModified('config_files');
                config.save();
                return configHandler.WriteallConfigs(config, id).then(() => {
                    res.json({"message": "saved"});
                });
            });
        }

        data.forEach(function (setting) {
            config.vars[setting.name].value = setting.value;
        });

        config.markModified('config_files');
        config.save();

        configHandler.WriteallConfigs(config, id).then(() => {
            res.json({"message": "saved"});
        });
    }).catch((err) => {
        res.json({"error": err.toString()});
    });
});

router.post('/start/:id/', function (req, res, next) {
    let id = req.params.id;

    serverHandler.StartServer(id).then((result) => {
        res.json(result);
    });
});

router.post('/stop/:id/', function (req, res, next) {
    let id = req.params.id;

    serverHandler.StopServer(id).then((r) => {
        if (r) {
            res.json({"message": "stopped"});
        }
        else {
            res.json({"message": "error"});
        }
    });
});

router.post('/status/:id/', function (req, res, next) {
    let id = req.params.id;

    serverHandler.GetServerState(id).then((r) => {
        console.log("state " + r.status)
        res.json(r);
    });
});

router.post('/create/:id/', function (req, res, next) {
    let id = req.params.id;

    let user = JSON.parse(JSON.stringify(req.user));

    let data = req.body;

    configHandler.MakeServer(id, data.game, data.version, user).then(() => {
        res.json({success: true});
    }, (err) => {
        console.error(err);
        res.json({success: false, error: "id exists"});
    });
});

router.post('/install/:id', function (req, res, next) {

});

module.exports = router;
