(function (module) {

    'use strict';

    module.cleanup = function (config, done) {

        var 
            fs = require('fs'), 
            path = require('path');

        config.oldPath = path.join(__dirname, config.oldPath);
        config.newPath = path.join(__dirname, config.newPath);

        fs.rename(config.oldPath, config.newPath, function () {
            done();
        });
    };



}(module.exports));