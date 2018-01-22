const path = require('path');
const fs = require('fs');

const schedule = require('node-schedule');

/* --- load config.json --- */
global.config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config.json')));
global.config.rootPath = __dirname;

require('./modules/schema').init();

require('./modules/rights').init();

require('./modules/configHandler').init();
let app = require('./modules/app').init();
require('./modules/login').init(app);
require('./modules/routes').init(app);
require('./modules/www').init(app);

/*
var j = schedule.scheduleJob('55 * * * *', function(){
    console.log(j);
});
*/

/*
let s = new require('./modules/server');
s.Load("test");
*/

module.exports = app;
