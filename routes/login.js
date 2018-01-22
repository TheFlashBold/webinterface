const express = require('express');
const router = express.Router();
const fs = require('fs');

const configHandler = require('./../modules/configHandler');

router.get('/', function (req, res, next) {

    res.render('login', {});
});

module.exports = router;
