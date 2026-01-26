const path = require('path'); 

module.exports.registerTask = function(gulp, config){
    if(config.templateName) {
        const templateEngine = require(path.resolve(__dirname, '../offline/templates/' + config.templateName));

        templateEngine.init(gulp, config);

        gulp.task('offline', templateEngine.execute);
    }
};