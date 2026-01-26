/*
* Cleans badly formatted links in the *source* topics
* Encodes parentheses [and sanitizes underscores and spaces]
*/

module.exports = function(grunt) {
    
    'use strict';
    
    grunt.config.merge({"fixLinks": {
        sourceFolder: "../topics",
        options: { 
          replaceUnderscores: true
        }
    }});

    grunt.registerMultiTask('fixLinks', 'Fixes links and image sources pointing to file names with parenthesis.', function() {
 		var done = this.async(),
            cleaner = require("./linksCleaner.js"),
            path = this.data,
            replaceUnderscores = this.options().replaceUnderscores;

        cleaner.fixParenthesisLinks(path, function(){
            if (replaceUnderscores) {
                cleaner.sanitizeLinks(path, function(){
                    done();
                });
            }
            else{
                done();
            }
        });
    });
};