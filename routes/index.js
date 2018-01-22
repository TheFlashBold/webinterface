const express = require('express');
const router = express.Router();
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const configHandler = require('./../modules/configHandler');

router.get('/', function (req, res, next) {
    let ids = [];

    let user = JSON.parse(JSON.stringify(req.user));

    return configHandler.GetGames().then((games) => {
        return global.models.server.find({$or: [{owner: user._id}, {access: user._id}]}).lean().then((server) => {
            return res.render('index', {file: "index",data: {user: user,games: games, ids: ids, server: server}});
        });
    });
});

module.exports = router;
