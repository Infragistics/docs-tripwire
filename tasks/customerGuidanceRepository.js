(function (module) {

    'use strict';

    var get = require('./services/customerGuidance').get;

    module.getControlInfo = function (config, success, fail) {

        get(config, function (error, response) {
            if (error) {
                fail(error);
                return;
            }

            success(response);
        });
    };

}(module.exports));
