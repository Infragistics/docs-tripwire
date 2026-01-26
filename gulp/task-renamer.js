/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){

    const  path = require('path')
         , renamer = require(path.resolve(__dirname, '../tasks/transforms/renamer'))
         , dependencies = []
         , _args = require('yargs').argv
    ;

    if(_args.workingFolder) {
        dependencies.push('sync-file-system-to-toc');
    }

	gulp.task('rename', dependencies, function(done){

        const args = require('yargs')
                        .usage('\n== Error ==\n\nUsage: gulp rename --name PRODUCT_NAME --workingFolder PATH_TO_HTML_FILES')
                        .argv
            , src = args.workingFolder ? path.join(args.workingFolder, args.version) : args.src
        ;
            
		renamer.rename(src, args.name, args.culture, done);
	});
};