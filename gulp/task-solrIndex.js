/*jslint node: true */
/*jshint esversion: 6 */

var fs = require('fs'),
	path = require('path'),
    args = require('yargs').argv,
    http = require('http'),
	productConfigurationReader = require('../tasks/productConfigurationReader.js');

	var spawn = require('child_process').spawn;

module.exports.registerTask = function(gulp, config){

	var dependencies = ['asciidoc'];

	// temp work-around while build scripts are being refactored
	if(args.workingFolder) {
		dependencies.push('sync-file-system-to-toc');
	}
	
	gulp.task('solrIndex', dependencies, function(done) {
		var childArgs = [];
		childArgs.push(process.argv[1]); // gulp executable
		childArgs.push('solrIndex-internal');
		childArgs = childArgs.concat(process.argv.slice(3)); //all other args
		
		// isolate indexing in child process to cap the memory leak..
		var child = spawn(process.execPath, childArgs , { stdio: 'inherit' });
		child.on('exit', function (code) {
			console.log("solrIndex-internal finished with code: " + code);
			//console.log("on done, ", ` ${process.memoryUsage().rss/1000} KB`);
			done();
		});
	});

	gulp.task('solrIndex-internal', /*dependencies,*/ function(done){
        productConfigurationReader.getConfiguration(config.docsConfigFilePath)
        .then((productConfiguration, error) => {

			var isLatestVersion = !!productConfiguration.variables[config.name].IsLatestVersion;

			if(isLatestVersion){
				var indexConfig, variables = {}, finishedRequests = 0,
					productConfig = productConfiguration.products[config.name],
					apiFolderPath = "../APIHelp",
					solrCollectionUrl = '/solr/collection1/update?commit=true&optimize=true',
					solrAPICollectionUrl = '/solr/apiCollectionEn/update?commit=true&optimize=true';

				if(error){
					console.log('Error: ' + error);
					process.exit(1);
				}

				if(productConfiguration.variables[config.name]) {
					variables = productConfiguration.variables[config.name];
				}

				/* recreate the grunt config the indexer expects */
				if (config.culture == 'ja') {
					solrCollectionUrl = '/solr/collectionJa/update?commit=true&optimize=true';
					solrAPICollectionUrl = '/solr/apiCollectionJa/update?commit=true&optimize=true';
				}
				apiFolderPath = path.join(config.topics.dest, apiFolderPath);
				indexConfig = {
					// also index files from folders APIHelp one level above output folder:
					src: [config.topics.dest],
					version: config.version,
					dest: '../solr/solr-index-' + config.culture + '.txt',
					destAPI: '../solr/solr-index-API-' + config.culture + '.txt',
					errorLogPath: '../solr/errors/',
					helpRootUrl: '/help/' + productConfig.helpPath + "/",
					productId: productConfig.productFamilyID,
					platformName: variables.PlatformName,
					culture: config.culture,
					tagsFile: '../Tags.xml',
					tagProperty: "JP_NAME",
					connectionString: 'data source=db2.staging.infragistics.local;initial catalog=CustomerGuidance.Database;user id=WebStagingUser;password=bl@uel@bel;multipleactiveresultsets=True;',
					searchProduct: productConfig.searchProduct,
					searchGuide: productConfig.searchGuide,
					postOptions: {
						hostname: '10.20.9.199',						
						port: 8080,
						path: solrCollectionUrl,
						method: 'POST',
						headers: {
							'Content-Type': 'text/json; charset=utf-8'
						}
					},
					solrAPICollectionUrl: solrAPICollectionUrl
				};
				// Check for apiFolderPath
				if (fs.existsSync(apiFolderPath)) {
					indexConfig.src.push(apiFolderPath);
				} else {
					console.log('Found no API folder at:', apiFolderPath);
				}

				if (config.name === "win-forms") {
					//Patch WinForms build: Generated API docs are unzipped in \Online directly rather than using "APIHelp" + copy step
					var winAPIFolder = path.join(config.topics.dest, "../Online");
					if (fs.existsSync(winAPIFolder)) {
						indexConfig.src.push(winAPIFolder);
					} else {
						console.log('Found no API folder at:', winAPIFolder);
					}
				}

				console.log('Starting to index HTML files:');
				console.log(' - source: ', indexConfig.src);	

				var indexer = require('../tasks/solrIndex');
				indexer.build(indexConfig, (response) => {
					console.log(response.itemsCount + ' topics indexed');
					console.log(response.docXItemsCount + ' Document! X files indexed');


					indexer.sendFiles()
					.then(function() { 
						console.log("done sending");
						indexer.items = null;
						indexer.docXItems = null;
						indexer = null;
						setTimeout(function () {
							//console.log("on done, ", ` ${process.memoryUsage().rss/1000} KB`);
							done();
						}, 1000);
					}, function(e){
						console.log('Request error: ' + e.message);
						indexer.items = null;
						indexer.docXItems = null;
						indexer = null;
						setTimeout(function () {
							//console.log("on done, ", ` ${process.memoryUsage().rss/1000} KB`);
							done();
						}, 1000);
					});
				});
			}
			else {
				console.log('Not building latest version of help. Skipping indexing.');
			}

		}).catch(function(reason) {
			 console.log(reason);
			 process.exit(1);
		});
	});
};