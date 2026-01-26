module.exports = function(grunt) {
    
    'use strict';
    
    grunt.registerMultiTask('imagesCopier', 'Copies topic images to destination locations.', function() {
        var done = this.async();
        if (grunt.option('fileInfo')) {
            // TODO: pick images from file / folder later on
            done();
            return; 
        };
        var path = require('path');
        var config = this.data;

        grunt.log.writeln('');

        grunt.log.write('Copying from: ');
        grunt.log.writeln(config.src.yellow);

        grunt.log.writeln('');

        grunt.log.writeln('Copying to: ');
        config.dests.forEach(function(dest){
            grunt.log.writeln('  ' + dest.yellow);
        });

        grunt.file.recurse(config.src, copyCallback);

        function copyCallback (abspath, rootdir, subdir, filename) {
            if (/^.+\.(png|jpg|gif)$/i.test(filename)) {
                config.dests.forEach(function(dest){
                    // copy image maintaining lowest level subdir name
                    var destpath = path.join(dest, subdir.split(/[\/\\]+/).pop(), filename);
                    grunt.file.copy(abspath, destpath);
                });
            }
        }
        
        done();
    });
};