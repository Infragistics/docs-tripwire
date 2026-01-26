/*
 * Initial entry point for the grunt build
 * 
 * Shared Grunt functions
 * Handles additional options and conditions before tasks run
 */

module.exports = function(grunt) {
    
    'use strict';

    grunt.replaceUnderscoreWithDash = function(name){
        return name.replace(/_/g,'-');   
    };

    grunt.replaceSpaceWithDash = function(name){
        return name.replace(/ /g,'-');   
    };

    grunt.stripOrderingNumbers = function(name){

        var nameParts = name.split('_');

        if(nameParts.length > 0 && !isNaN(nameParts[0])){
            nameParts.shift();
            name = nameParts.join('_');
        }

        if(name[0] === '~'){
            name = name.substring(1);
        }

        return name;
    };

    grunt.assignFileInfo = function(file){
        if (grunt.option('file') || file) {
            var path = require('path'),
                ext, cleanFileName,
                srcPath, origFileName;

            srcPath = origFileName = file || grunt.option('file');

            if (!grunt.file.isPathAbsolute(srcPath)) {
                // expand path
                srcPath = path.join(__dirname, srcPath);
            }

            if (!grunt.file.isFile(srcPath)) {
                // option is not a a path
                srcPath = null;
            }

            ext = path.extname(origFileName);
            origFileName = path.basename(origFileName, ext);

            cleanFileName = grunt.stripOrderingNumbers(origFileName);
            cleanFileName = grunt.replaceUnderscoreWithDash(cleanFileName);
            cleanFileName = grunt.replaceSpaceWithDash(cleanFileName);
           
            grunt.option('fileInfo',  {
                origFileName: origFileName,
                cleanFileName: cleanFileName,
                ext: ext,
                fullPath: srcPath
            });
        }
    };
    grunt.assignFileInfo();


    /*
    *  Build run configuration:
    */

    var platform = grunt.option('platform') || "jquery";
    grunt.option('lang', grunt.option('lang') || "en");
    var major = grunt.option('major') || '15';
    var minor = grunt.option('minor') || '1';
    
    grunt.config.set("major", major);
    grunt.config.set("minor", minor);
    
    if (grunt.option('latest') === undefined) {
        grunt.option('latest', true);
    }

    var config = require('../config/' + platform + '-' + grunt.option('lang') + '.json');

    // ensure Ignite UI API links are absolute for offline builds
    // argv[0] is node, argv[1] is grunt, and argv[2] is the task called
    // if (platform === "jquery" &&
    //         grunt.cli.tasks[0].indexOf("offline") > -1 &&
    //         config.jQueryApiUrl.indexOf(config.HelpRootUrl) === -1) {
    //     config.jQueryApiUrl = config.HelpRootUrl + config.jQueryApiUrl;
    // };

    for (var key in config) {        
        grunt.config.set(key, config[key]);
    }
};