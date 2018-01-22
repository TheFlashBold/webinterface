let login = {};

login.init = function (app) {
    app.use(function (req, res, next) {

        if (global.config.noLogin.indexOf(req.url) !== -1) {
            next();
            return;
        }

        if (!req.cookies.session) {
            res.redirect("/login");
            return;
        }

        return global.models.user.findOne({session: req.cookies.session}).then((data) => {
            if(data === null){
                if(req.url.indexOf("/api/") !== -1){
                    next();
                    return;
                }
                res.redirect("/login");
                return;
            }
            req.user = data;
            next();
        });
    });
};

module.exports = login;