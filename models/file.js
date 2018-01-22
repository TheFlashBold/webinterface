const mongoose = require('mongoose');

let Schema = mongoose.Schema({
    type: String,
    game: String,
    versions: [{
        type: String
    }],
    label: String,
    file: String,
    config: mongoose.Schema.Types.Mixed,
    content: mongoose.Schema.Types.Mixed
});

module.exports = Schema;