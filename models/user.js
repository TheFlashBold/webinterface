const mongoose = require('mongoose');

let Schema = mongoose.Schema({
    username: String,
    password: String
});

module.exports = Schema;