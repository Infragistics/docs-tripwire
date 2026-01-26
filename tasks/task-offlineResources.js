module.exports = function(grunt) {
    
    'use strict';
    
    grunt.registerMultiTask('offlineResources', 'Generates and Copies required files for offline viewer.', function() {
        var done = this.async();

        if (grunt.option('fileInfo')) {
            done();
            return;
        }

        for (var i = 0; i < this.files.length; i++) {

            if (this.files[i].copy) {
                grunt.log.writeln("Copying", this.files[i].src, "->", this.files[i].dest);
                grunt.file.copy(this.files[i].src, this.files[i].dest);
                continue;
            }

            var content = "";
            for (var j = 0; j < this.files[i].src.length; j++) {
                content += grunt.file.read(this.files[i].src[j]).replace(/^\uFEFF/, '');
            }
            if (this.files[i].replace) {
                for(var key in this.files[i].replace) {
                    content = content.replace(new RegExp(key, "gi"), this.files[i].replace[key]);
                }
            }
            for (var j = 0; j < this.files[i].dest.length; j++) {
                grunt.log.writeln("Creating " + this.files[i].dest[j]);
                grunt.file.write(this.files[i].dest[j], content);                
            }
        }

        done();
    });
};