module.exports = function(grunt) {
    
    'use strict';
    
    grunt.registerMultiTask('toc', 'Create table of contents from markdown files and directories.', function() {
		if (grunt.option('fileInfo') && !grunt.option('full')) {
			return; // cancel the toc
		};

        var generator = require("./tocGenerator.js");
       
        grunt.log.writeln('Creating the TOC'.cyan);


        this.data.includeMvcAPI = !!grunt.option('mvcapi');
        generator.init(this.data);
        generator.generate();
        
        grunt.log.writeln('Finished creating the TOC'.cyan);
    });
};