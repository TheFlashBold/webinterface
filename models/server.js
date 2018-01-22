const mongoose = require('mongoose');

let Schema = mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    access: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    label: String,
    game: String,
    version: String,
    files: mongoose.Schema.Types.Mixed,
    config_files: mongoose.Schema.Types.Mixed,
    vars: mongoose.Schema.Types.Mixed,
    log_files: mongoose.Schema.Types.Mixed,
    install: String,
    start: String,
    mods: [{type: mongoose.Schema.Types.Mixed}]
});

module.exports = Schema;