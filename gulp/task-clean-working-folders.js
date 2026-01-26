/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){
	
	gulp.task('clean-working-folders', function(){
		var   path = require('path')
            , args = require('yargs').argv
            , clean = require('gulp-clean')
            , type = args.offline ? 'offline' : 'online'
        ;
		
		return gulp.src([
                        path.join(args.workingFolder, args.version) + '\\**\\*.html',
                        path.join(args.workingFolder, type) + '\\**\*'
                    ])
                   .pipe(clean());
	});
};