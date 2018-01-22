const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

mongoose.Promise = Promise;

let schemaHandler = {};

schemaHandler.init = function () {
    mongoose.connect(global.config.mongodb, {useMongoClient: true});
    console.log("loading models:");
    let modelPath = path.join(__dirname, "..", "models");
    let models = fs.readdirSync(modelPath);
    global.models = {};
    models.map(function (model) {
        if (model.indexOf('.js') === -1) {
            return;
        }
        let name = model.split('.js')[0];

        global.models[name] = mongoose.model(name, require('./../models/' + name));

        console.log('   +   ' + model);
    });
};

module.exports = schemaHandler;