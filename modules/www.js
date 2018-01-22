const http = require('http');
const events = require('events');

let www = {};

www.init = function (app) {
    app.set('port', global.config.www.port);

    let server = http.createServer(app);
    server.listen(global.config.www.port);

    const io = require('socket.io')(server);
    global.io = io;

    io.on('connection', function (socket) {
        socket.on('reg', function (data) {
            socket.join(data.server);
            console.log("   +   " + socket.id + " on " + data.server);
            if (!global.server) {
                global.server = new events.EventEmitter();
            }
        });

        socket.on('command', function (cmd) {
            let id = socket.rooms[Object.keys(socket.rooms)[1]];
            if (global.server) {
                global.server.emit(id + '.command', cmd);
            }
        });
    });
};

module.exports = www;