module.exports = function (grunt) {

    'use strict';

    module.config = {
        getParentDirectory: function(){
            return __dirname;
        }    
    };

    module.copy = function (config, done) {

        var walk = require('walk')              // https://github.com/coolaj86/node-walk
          , fs = require('fs-extra')            // https://www.npmjs.org/package/fs-extra
          , path = require('path')              // http://nodejs.org/api/path.html
          , options
          , walker
        ;

        options = {
            followLinks: false
        };

        config.src = path.join(__dirname, config.src);
        config.dest = path.join(__dirname, config.dest);

        if (!fs.existsSync(config.src)) throw new Error('The source location does not exist: ' + config.src);
        if (!fs.existsSync(config.dest)){
            fs.mkdirSync(config.dest);
        }
        
        walker = walk.walk(config.src, options);

        var isMarkdownFile = function(fileName){
            return path.extname(fileName).toLowerCase() === ".md";
        };

        var fileCount = 0;

        walker.on("file", function (root, fileStats, next) {
            if(isMarkdownFile(fileStats.name)){

                //var filePath = path.join(module.config.getParentDirectory(), root);
                var filePath = path.join(root, fileStats.name);

                var fileName = fileStats.name;
                fileName = grunt.stripOrderingNumbers(fileName);
                fileName = grunt.replaceUnderscoreWithDash(fileName);
                fileName = grunt.replaceSpaceWithDash(fileName);

                var destPath = path.join(config.dest, fileName);

                fs.copy(filePath, destPath, function () {
                    fileCount++;
                    next();
                });
            } else {
                next();    
            }
        });

        walker.on("errors", function (root, nodeStatsArray, next) {
            next();
        });

        walker.on("end", function () {
            done(fileCount);
        });
    };

    module.copyFile = function(config, done){
        var path = require('path'),
            fileInfo = grunt.option('fileInfo');

        config.dest = path.join(__dirname, config.dest);

        if (!fileInfo.fullPath) {
            // no full path, build from config:
            config.src = path.join(__dirname, config.src);
            fileInfo.ext = fileInfo.ext || '.md'
            fileInfo.origFileName = fileInfo.origFileName + fileInfo.ext;
            fileInfo.fullPath = grunt.file.expand(config.src + "/**/**" + fileInfo.origFileName )[0];
        }
        
        fileInfo.cleanFileName = config.dest + path.sep + fileInfo.cleanFileName + '.md';
       
        grunt.file.copy(fileInfo.fullPath, fileInfo.cleanFileName, { matchBase: false});
        done();
    }    

    return module;
};