const express = require('express');
const router = express.Router();
const configHandler = require('./../modules/configHandler');
const serverHandler = require('./../modules/serverHandler');
const fs = require('fs');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

router.get('/:id/edit/vars', function(req, res, next) {
    let id = req.params.id;

    return configHandler.LoadConfig(id).then((conf) => {
        if(!conf){
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        }

        let data = [];
        Object.keys(conf.vars).forEach(function(key) {
            if(key === "_conf"){
                return;
            }
            let d = conf.vars[key];
            d.name = key;
            data.push(d);
        });
        res.render('editfile', { id: id, file:'vars', data: data });
    });
});

router.get('/:id/edit/:file', function(req, res, next) {
    let id = req.params.id;
    let file = req.params.file;
    configHandler.LoadConfig(id).then((conf) => {
        if(!conf){
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
        }

        let data = [];
        Object.keys(conf.config_files[file]).forEach(function(key) {
            if(key === "_conf"){
                return;
            }
            let d = conf.config_files[file][key];
            d.name = key;
            data.push(d);
        });
        res.render('editfile', { id: id, file:file, data: data });
    });
});

router.get('/:id/', function(req, res, next) {
    let id = req.params.id;

    let user = JSON.parse(JSON.stringify(req.user));

    if(!fs.existsSync(__dirname + "/../server/" + id + "/")){
        res.render('404', {error: "server: " + id});
        return;
    }

    return configHandler.LoadConfig(id).then((conf) => {
        if(!conf){
            let err = new Error('Not Found');
            err.status = 404;
            next(err);
            return;
        }

        let log = "";
        if(global.log && global.log[id] && global.log[id].log) {
            let larr = global.log[id].log;
            larr.reverse();
        		log = larr.join("");
        }

        return global.models.server.findOne({_id: new mongodb.ObjectID(id)}).lean().then((server) => {
            return global.models.mod.find({type: 'mod', versions:conf.version, game:conf.name}).lean().then((mods) => {
                return global.models.file.find({type: 'config', versions:conf.version, game:conf.name}).then((configFiles) => {
                    return global.models.custom.find({type: 'Button',versions: conf.version,game: conf.game}).lean().then((bs) => {
                        return res.render('server', {data: {user: user, configFiles: conf.config_files,id: id,server: server,log: log,buttons: bs,mods: mods,conf: conf}});
                    });
                });
            });
        });


        /*
        MongoClient.connect(global.config.mongodb, function (err, db) {
        	db.collection('servers').findOne({_id: new mongodb.ObjectID(id)}, {label:1}, function(err, server) {
    	    	db.collection('mods').find({type: 'mod', versions:conf.version, game:conf.name}, {_id:0, label:1}).toArray(function(err, mods) {
    		    	db.collection('files').find({type: 'config', versions:conf.version, game:conf.name}, {_id:0, label:1, file:1}).toArray(function(err, configFiles) {
    			        db.collection('custom').find({type: 'Button', versions:conf.version, game:conf.game}, {_id:0, label:1, icon:1, command:1}).toArray(function(err, bs) {
    			            if(!global.rights.test(req.user, "user.custom")){
    			                bs = [];
                            }
    			        	res.render('server', {data:{configFiles:conf.config_files, id: id, server: server, log: log, buttons:bs, mods:mods, conf:conf}});
    			        	db.close();
    			        });
    			    });
    		    });
    	    });
    	});
    	*/
    });
});

module.exports = router;
