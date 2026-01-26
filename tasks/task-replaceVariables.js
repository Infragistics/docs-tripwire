module.exports = function(grunt) {
    
    'use strict';
    
    grunt.registerMultiTask('replaceVariables', 'Replaces variables in the content based on the global Grunt configuration for platform.', function() {
        var config = this.data,
            path = require('path');

        var rootPath = path.resolve(__dirname, config.src);

        if (grunt.option('fileInfo')) {
            callback(grunt.option('fileInfo').cleanFileName, "", "", "");
            return;
        }

        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);

        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        grunt.file.recurse(rootPath, callback);

        function callback(abspath, rootdir, subdir, filename) {
            var src = grunt.file.read(abspath);
            if (src.indexOf("%%") > 0) {
                for (var key in config.options){
                    var matcher = new RegExp("%%" + key + "%%", "g");
                    src = src.replace(matcher, config.options[key]);
                }
                grunt.file.write(abspath, src);
            }
        }
    });
};