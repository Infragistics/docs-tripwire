
module.exports.registerTask = function(gulp, config){
	
	gulp.task('copyImages', function(done){
		var path = require('path');

		var plumber = require('gulp-plumber');
		var flatten = require('gulp-flatten');
		
		require('yargs')
			.usage('\n== Error ==\n\nUsage: gulp copyImages --version 1.0')
			.demand(['version'])
			.argv;
		
		var onError = function(e){
			console.log('Gulp error:\n');
			console.log(e);
		};
		
		var sourcePath = path.join(config.helpTopicsFolder, '/**/*.EXT');

		var sources = [
			sourcePath.replace('EXT', 'png'),
			sourcePath.replace('EXT', 'PNG'),
			sourcePath.replace('EXT', 'jpg'),
			sourcePath.replace('EXT', 'JPG'),
			sourcePath.replace('EXT', 'gif'),
			sourcePath.replace('EXT', 'GIF')
			];
		
		gulp.src(sources)
				.pipe(plumber({errorHandler: onError}))
				.pipe(flatten())
				.pipe(gulp.dest(config.topics.dest + '\\images'));
		
		done();
	});
};