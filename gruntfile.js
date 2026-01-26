module.exports = function (grunt) {
    
    require('load-grunt-tasks')(grunt);
    
    require('./tasks/app.js')(grunt);

    require('load-grunt-config')(grunt, {
        data: grunt.config.data // preserve global config so far
    });  

    grunt.loadTasks('./tasks');

};