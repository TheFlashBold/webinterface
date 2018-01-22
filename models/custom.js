const mongoose = require('mongoose');

let Schema = mongoose.Schema({
    type: String,
    game: String,
    versions: [{
        type: String
    }],
    label: String,
    command: String,
    icon: String
});

module.exports = Schema;