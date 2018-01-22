const fs = require('fs');
const path = require('path');

let routes = {};

routes.init = function (app) {

    /* --- Routes --- */
    console.log("loading routes:");

    let routePath = path.join(global.config.rootPath, "routes");

    let files = fs.readdirSync(routePath);
    files.map(function (file) {
        if (file.indexOf('.js') === -1) {
            return;
        }

        let name = file.split('.js')[0];

        app.use(global.config.rewrites[name] || ('/' + name), require(path.join(routePath, name)));
        console.log('   +   ' + file);
    });

    /* --- 404 --- */
    app.use(function (req, res, next) {
        res.render('404', {error: req.url});
    });

    /* --- 500 --- */
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
};

module.exports = routes;