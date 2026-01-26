module.exports = function(grunt) {
    
    'use strict';
	var path = require('path');
    var rootPath = path.resolve(__dirname, "../topics");
    var contentPath = path.resolve(__dirname, "../online/Tripwire.Web/Content");

    var build = "default";
    build = grunt.option('online') ? "online" : build;
    build = grunt.option('offline') ? "offline" : build;

    function addWatchConfig (argument) {
		grunt.config.merge({
			"watch" : {
				md: { files: [rootPath + '/**/*.md'],
				    tasks: [build],
				    options: {
				      spawn: false,
				      interval: 5007
				    }
				},
				css: {
					files: [contentPath + '/**/*.scss'],
					tasks: ['sass', 'autoprefixer'],
					options: {
					  livereload: true
					}
				}

	    	}
	    });
    }
	addWatchConfig();

	grunt.event.on('watch', function(action, filepath, target) {
		grunt.log.writeln(new Date().toString().green);
		grunt.log.writeln((target + ': ' + path.resolve(filepath) + ' has ' + action).cyan);
		if (action == "changed") {
			
			grunt.assignFileInfo(path.resolve(filepath));  

			// reload tasks config:
			// TODO: Stop it from re-loading tasks again? Test multiple files saved
			require('load-grunt-config')(grunt, { init: true });  
			require('./app.js')(grunt);
			addWatchConfig();
		};
	});
};