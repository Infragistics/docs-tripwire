/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp){
	// Note: This task must run AFTER:
	//  - the HTML is generated from AsciiDoc 
	//  - Tablewire generates the table of contents
	// and must run BEFORE:
	//  - the solr index task runs
	gulp.task('sync-file-system-to-toc', ['asciidoc', 'copy-api-files'], function(done){

		const  path = require('path')
			 , syncer = require(path.resolve(__dirname, '../tasks/syncFileSystemToTOC.js'))
			 , args = require('yargs').demand(['workingFolder', 'version']).argv
			 , tocPath = args.jsonFilePath
			 , topicsFolder = path.join(args.workingFolder, args.version)
		;
		console.log('Note: this task must be run AFTER: ');
		console.log('  - the HTML is generated from AsciiDoc ');
		console.log('  - Tablewire generates the table of contents');
		console.log(' and must run BEFORE:');
		console.log('  - the solr index task runs');
		syncer.syncFileSystemToTOC(tocPath, topicsFolder, done);
	});
};