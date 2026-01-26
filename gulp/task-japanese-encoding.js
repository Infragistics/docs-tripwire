/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){
	
	gulp.task('japanese-encoding', function () {

// Empty for now and delete after getting stable builds

/*
		const args = require('yargs').argv;
		const path = require('path');
		const plumber = require('gulp-plumber');
		const shiftjisEncoding = require(path.join(__dirname, './shiftjisEncoding.js'));
		
		const onError = function(e){
			console.log('Gulp error:\n');
			console.log(e);
		};

		gulp.src(path.join(args.src, '*.html'))
				.pipe(plumber({errorHandler: onError}))
				.pipe(shiftjisEncoding())
				.pipe(gulp.dest(args.src));
*/
	});
};