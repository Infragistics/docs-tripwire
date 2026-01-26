module.exports = function(grunt) {
    
    'use strict';
    
    grunt.registerMultiTask('contentCopier', 'Copies Markdown files to staging folder before being converted to HTML.', function() {
        var done = this.async();
        var copier = require('./contentCopier.js')(grunt);
        var config = this.data;

        if (grunt.option('fileInfo')) {
              copier.copyFile(config, function(){
                grunt.log.writeln(' Markdown file copied'.cyan);
                done();
            });
            return;
        }

        grunt.log.writeln('');

        grunt.log.write('Copying from: ');
        grunt.log.writeln(config.src.yellow);

        grunt.log.writeln('');

        grunt.log.write('Copying to: ');
        grunt.log.writeln(config.dest.yellow);

        copier.copy(config, function(count){
            grunt.log.writeln((count + ' Markdown files copied').cyan);
            done();
        });
    });
};