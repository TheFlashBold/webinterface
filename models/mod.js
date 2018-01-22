const mongoose = require('mongoose');

let Schema = mongoose.Schema({
    type: String,
    game: String,
    versions: [{
        type: String
    }],
    label: String,
    config: mongoose.Schema.Types.Mixed,
    locations: mongoose.Schema.Types.Mixed,
    files: mongoose.Schema.Types.Mixed
});

module.exports = Schema;