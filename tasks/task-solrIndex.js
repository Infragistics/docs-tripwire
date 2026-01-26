module.exports = function (grunt) {

    'use strict';

    grunt.registerMultiTask('solrIndex', 'Creates files to submit to Solr index.', function () {

        if (!grunt.option('index')) {
            return;
        }

        if (!grunt.option('latest')) {
            grunt.log.writeln(('Skipping indexing (not latest)').yellow);
            return;
        }
        
        var fs = require('fs'),
            http = require('http'),
            path = require('path'),
            config = this.data,
            done = this.async(),
            destPath, destAPIPath, directoryPath;


        destPath = path.join(__dirname, config.dest);
        destAPIPath = path.join(__dirname, config.destAPI);
        directoryPath = path.dirname(destPath);


        var solrIndex = require('./solrIndex.js');

        grunt.log.writeln('Creating Solr index file.');

        solrIndex.build(config, function (response) {
            var serialized = JSON.stringify(response.items),
                serializedAPI = JSON.stringify(response.docXItems),
                finishedRequests = 0,
                pathParts;

            if (response.hasErrors) {
                grunt.log.writeln('Some files encountered errors'.red);
                done();
                return;
            }

            grunt.log.writeln((response.itemsCount + ' topics indexed').yellow);
            grunt.log.writeln((response.docXItemsCount + ' Document! X files indexed').yellow);

           
            solrIndex.sendFiles()
                .then(function() { 
                    console.log("done sending");
                    done(); 
                }, function(e){
                    console.log('Request error: ' + e.message);
                    done();
                });
        });
    });

};