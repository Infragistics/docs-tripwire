module.exports.registerTask = function(gulp){
	
	var args = require('yargs').argv;
	
	gulp.task('build-help', ['asciidoc', 'copyImages', 'toc']);

	if(args.offline) {
		gulp.task('build-help-files', ['asciidoc', 'copyImages', 'offlineResources']);
	} else {
		gulp.task('build-help-files', ['asciidoc', 'solrIndex', 'copyImages']);		
	}
};