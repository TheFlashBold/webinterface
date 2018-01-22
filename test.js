const steamcmd = require('steamcmd');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const steamPath = path.join(__dirname, "steamcmd");

return new Promise((resolve) => {
    if(!fs.existsSync(steamPath)){
        return steamcmd.download({binDir: steamPath});
    } else {
        return steamcmd.touch().then(() => {
            return steamcmd.prep();
	});
    }
}).then(() => {
    // steamcmd.updateApp(90, path.resolve('hlds'));
    return;
});
