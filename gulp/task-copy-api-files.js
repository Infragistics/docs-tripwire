/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){
	
	gulp.task('copy-api-files', function(){
		var   path = require('path')
            , args = require('yargs').argv
            , src = path.join(args.workingFolder, 'APIHelp')
            , dest = path.join(args.workingFolder, args.version)
        ;
		
		return gulp.src(src + '\\**\\*.*').pipe(gulp.dest(dest));
	});
};