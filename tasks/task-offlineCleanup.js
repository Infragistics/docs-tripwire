module.exports = function(grunt) {
    
    'use strict';
    
    grunt.registerMultiTask('offlineCleanup', 'Cleans up differences between online and offline applications.', function() {
    	var cleaner = require('./offlineCleanup.js');
        var done = this.async();        
        var config = this.data;

        cleaner.cleanup(config, function(count){
            grunt.log.writeln(('Offline cleaned up').cyan);
            done();
        });
    });
};