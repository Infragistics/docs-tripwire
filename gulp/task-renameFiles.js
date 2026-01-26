/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){
	gulp.task('rename-files', function(done){
		const path = require('path');
		var renamer = require(path.resolve(__dirname, '../tasks/transforms/renameFiles'));

		const args = require('yargs')
            .usage('\n== Error ==\n\nUsage: gulp rename-files --src PATH_TO_HTML_FILES')
            .demand(['src'])
            .argv;

		renamer.rename(args.src, () => {
			done();
		});
	});
};