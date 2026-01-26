/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){
	
	gulp.task('copy-online-files',  ['sync-file-system-to-toc', 'copyImages', 'solrIndex'], function(){
		var   path = require('path')
            , args = require('yargs').argv
            , rename = require('gulp-rename')
            , src = path.join(args.workingFolder, args.version)
            , dest = path.resolve(src, '../online')
        ;

		gulp.src(args.jsonFilePath)
			.pipe(rename((path) => { path.basename = 'toc' }))
			.pipe(gulp.dest(dest))
			.on('end', () => {
				console.log(`TOC written from ${path} to: ${dest}\\toc.json`);
			});
		
		gulp.src(src + '\\**\\*.*')
			.pipe(gulp.dest(dest))
			.on('end', () => {
				console.log(`All other files copied from ${src}\\**\\*.* to: ${dest}`);
			});
	});
};