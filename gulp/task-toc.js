const fs = require('fs');

module.exports.registerTask = function(gulp, config){
	
	gulp.task('toc', function(done){
		var path = require('path');
		
		var args = require('yargs')
			.usage('\n== Error ==\n\nUsage: gulp toc --version 1.0')
			.demand(['version'])
			.argv;
		
		var getPath = function(relativePath){
			return path.resolve(__dirname, relativePath);
		};
		
		var tocGenerator = require(getPath('../tasks/tocGenerator.js'));
		var options;
		
		options = config.tableOfContents;
		options.buildVersion = '';
		options.homePageFileName = 'home-page.adoc';

		var jsonFileData = null;

		tocGenerator.init(options);

		if(args.jsonFilePath) {
			if(fs.existsSync(args.jsonFilePath)) {
				jsonFileData = JSON.parse(fs.readFileSync(args.jsonFilePath, 'utf8'));
			} else {
				throw new Error(`Error: You specified a JSON file at ${args.jsonFilePath}, but it does not exist.`);
			}
		}
		
		tocGenerator.generate(jsonFileData);
		
		console.log('\nCreated table of contents at: ');
		options.dests.forEach(function(dest){
			console.log(dest);
		});
		console.log();
		
		done();
	});
};
