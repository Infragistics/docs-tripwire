/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){

	gulp.task('copy-offline-files', ['rename'], function(){
		var   path = require('path')
            , args = require('yargs').argv
            , src = path.join(args.workingFolder, args.version)
        ;
		
		return gulp.src(src + '\\**\\*.*').pipe(gulp.dest(path.resolve(src, '../offline')));
	});
};