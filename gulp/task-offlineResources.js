/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');

module.exports.registerTask = function (gulp, config) {

        gulp.task('offlineResources', ['copy-api-files'], function () {

                var args = require('yargs')
                        .options({ 'version': { type: 'string' } })
                        .argv;

                var shell = require('shelljs');

                // calling --version on grunt task makes grunt print the version
                // this rewrites it to use --docsVersion
                var cmd = `grunt offlineResources --name ${args.name} --folder ${args.folder} --docsVersion ${args.version} `;

                shell.exec(cmd);

                // copy blank css files (to avoid 404s and unwanted styles)
                gulp.src([
                        './offline/templates/multiproduct/template/stylesheets/slimbox2.css',
                        './offline/templates/multiproduct/template/stylesheets/hs-jquery-common.css',
                        './offline/templates/multiproduct/template/stylesheets/hs-jquery-slimbox.css',
                        './offline/templates/multiproduct/template/stylesheets/hs-jquery-expand.css',
                        './offline/templates/multiproduct/template/stylesheets/hs-expandcollapse.css',
                        './offline/templates/multiproduct/template/stylesheets/hs-boxes.css',
                        './offline/templates/multiproduct/template/stylesheets/jquery.qtip.css',
                        './offline/templates/multiproduct/template/stylesheets/jquery-ui-1.8.18.custom.css'
                ])
                        .pipe(gulp.dest(path.join(config.topics.dest, 'stylesheets')));

                // copy blank script files (to avoid 404s and unwanted scripts) 
                gulp.src([
                        './offline/templates/multiproduct/template/script/emptyFiles/jquery-1.7.2.min.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/jquery-ui-1.8.18.custom.min.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/dx.net.2012.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/dx.ajax.2012.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/jquery-1.7.2.min.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/slimbox2.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/hs-jquery-common.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/jquery-expand.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/hs-expandcollapse.js',
                        './offline/templates/multiproduct/template/script/emptyFiles/swfobject.js'
                ])
                        .pipe(gulp.dest(path.join(config.topics.dest, 'script')));


        });
};