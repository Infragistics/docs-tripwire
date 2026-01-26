/*jslint node: true */
/*jshint esversion: 6 */

module.exports.registerTask = function(gulp, config){

	const  _args = require('yargs').argv
		 , dependencies = []
	;

	if(_args.workingFolder && _args.offline) {
		dependencies.push('clean-working-folders');
	}
	
	gulp.task('asciidoc', dependencies, function (done) {
		
		var args = require('yargs')
			.usage('\n== Error ==\n\nUsage: gulp asciidoc --name wpf --folder wpf-docs-en --version 1.0')
			.demand(['name', 'version', 'folder'])
			.argv;

		if(!args.prepForTranslation) {
			args.prepForTranslation = false;
		}
		
		var path = require('path');
		var flatten = require('gulp-flatten');
		var rename = require('gulp-rename');
		var plumber = require('gulp-plumber');
		var wrap = require('gulp-wrap');
		var gulpif = require('gulp-if');
		var fs = require('fs-extra');
		var asciiDoc = require('./asciidoc.js');
		var cleanup = require('./cleanup');
		var replaceEntitiesWithJapaneseCharacters = require('./replaceEntities.js');
		var productConfigurationReader = require(path.resolve(__dirname, '../tasks/productConfigurationReader.js'));
		var repeatFiles = require(path.resolve(__dirname, '../tasks/repeat-files.js'));
		var fileNameCleaner = require(path.resolve(__dirname, '../tasks/fileNameCleaner.js'));
        var bom = require('gulp-bom');
		var postConversionRules = require('./postConversionRules.js');
		var preConversionRules = require('./preConversionRules.js');

		var variables = {};
		var offlineTemplate = '';
		
		var onError = function(e){
			console.log('Gulp error:\n');
			console.log(e);
		};

		console.log('Going to look for files with non-unique names in all subdirectories of ' + config.helpTopicsFolder);
				
		repeatFiles.check(config.helpTopicsFolder).then(function(result){
			if(result.hasRepeats && !config.skipNameCheck){
				console.log();
				console.log('Error: All file names must be unique. The following files have the same names:');
				console.log();
				Object.keys(result.repeatedFiles).forEach(function(key){
					result.repeatedFiles[key].forEach(function(file){
						console.log(file.path);
					});
					console.log();
				});
				done();
			} else {

				console.log();

				console.log('Reading build variables from configuration file ' + config.docsConfigFilePath);

				productConfigurationReader.getConfiguration(config.docsConfigFilePath).then((productConfiguration, error) => {

					if(error){
						console.log('Error: ' + error);
						done();
					}

					if(productConfiguration.variables[config.name]) {
						variables = productConfiguration.variables[config.name];
					}
		
					console.log('Starting to generate HTML from AsciiDoc:');			
					console.log(' - source dir: ' + config.helpTopicsFolder);
					console.log(' - applying buildFlags: ' + productConfiguration.products[config.name].buildFlags);
					console.log(' - destination dir: ' + config.topics.dest );

					if(args.prepForTranslation) {
						console.log(' - applying special formatting in preparation for translation');
					}

					if(args.offline) {
						offlineTemplate = fs.readFileSync(path.resolve(__dirname, `../offline/templates/multiproduct/template/topic-${config.culture}.html`), 'utf8');
						console.log(' - applying offline template');
					}

					console.log();

					console.log('Processing ' + path.join(config.helpTopicsFolder, '/**/*.adoc'));
					
					gulp.src(path.join(config.helpTopicsFolder, '/**/*.adoc'))
						.pipe(plumber({errorHandler: onError}))
						.pipe(cleanup())
						.pipe(preConversionRules({
							prepForTranslation: args.prepForTranslation,
							variables: variables,
							culture: config.culture
						}))
						.pipe(asciiDoc(productConfiguration.products[config.name].buildFlags, config.version, config.helpTopicsFolder))
						.pipe(gulpif(!args.offline, replaceEntitiesWithJapaneseCharacters()))
						.pipe(bom())
						.pipe(postConversionRules({
							prepForTranslation: args.prepForTranslation,
							variables: variables,
							isOffline: args.offline,
							isJapanese: config.culture === 'ja'
						}))
						.pipe(gulpif(args.offline, wrap(offlineTemplate, {}, { parse: false })))
						.pipe(rename((path) => {
							path.basename = fileNameCleaner.clean(path.basename).replace('.ja-JP', '');
							path.extname = '.html';
						}))
						.pipe(flatten())
						.pipe(gulp.dest(config.topics.dest))
						// return only when the stream is has finished processing:
						.on('end', function () { done(); });
				});				
			}
		});
	});
};