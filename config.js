module = module.exports;

var config = null;
var path = require('path');
var fs = require('fs');
var args = require('yargs')
	.usage('\n== Error ==\n\nUsage: gulp <TASK_NAME> --name reportplus-desktop --version 1.0 --latestVersion [optional] --buildFlags [optional]')
	//.demand(['name', 'folder', 'version'])
	.options({ 'version': { type: 'string' } })
	.options({ 'docsVersion': { type: 'string' } })
	.argv;

module.get = function(){
	var version, versionParts, culture, contentConfigPath;
	
	if(config === null){
		version = args.version || args.docsVersion;
		
		culture = args.culture? args.culture : 'en';

		if(args.name) {
			args.name =  args.name.toLowerCase();
		}

		if(args.folder) {
			args.folder = args.folder.toLowerCase();
		}

		contentConfigPath = path.resolve(__dirname,'./content-config.json');

		config = fs.readFileSync(contentConfigPath, 'utf8');
		config = config.replace(/<%= VersionNumber %>/g, version);
		config = config.replace(/<%= Culture %>/g, culture);
		config = config.replace(/<%= ProductName %>/g, args.name);
		config = config.replace(/<%= FolderName %>/g, args.folder);
		config = config.replace(/<%= RootFolder %>/g, __dirname.replace(/\\/g, '\\\\'));

		

		if(args.helpRootUrl){
			config = config.replace(/<%= HelpRootUrl %>/g, args.helpRootUrl);
		}
		console.log('Changes made to ' + contentConfigPath + ' based on input args');

		config = JSON.parse(config);
		
		config.name = args.name;
        
        config.skipNameCheck = args.skipNameCheck? true : false;
		
		config.version = version;

		config.culture = culture;

		if(args.jsonFilePath) {
			config.jsonFilePath  = args.jsonFilePath;
		}

		if(args.output) {
			config.output  = args.output;
		}

		if(args.templateName) {
			config.templateName = args.templateName;
		}

		if(args.htmlSrc) {
			config.htmlSrc = args.htmlSrc;
		}
		
		if(version){
			versionParts = version.split('.');
			
			config.versionMajor = versionParts[0];
			
			if(versionParts.length >= 2){
				config.versionMinor = versionParts[1];
			}
		}
		
		config.buildFlags = [];
		if(args.buildFlags){
			config.buildFlags = args.buildFlags.split(',');
		}

		console.log('config object fully loaded based on input args');
	}
	return config;
};