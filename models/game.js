const mongoose = require('mongoose');

let Schema = mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    access: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    label: String,
    game: String,
    version: String,
    locations: mongoose.Schema.Types.Mixed,
    files: mongoose.Schema.Types.Mixed,
    vars: mongoose.Schema.Types.Mixed,
    install: String,
    start: String
});

module.exports = Schema;