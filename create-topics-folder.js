var exec = require('child_process').exec;
var fs = require('fs');

var args = process.argv;

if(args.length >= 3){
	fs.readFile(__dirname + '/content-config.json', 'utf8', function(readError, content){
		
		if(readError) console.log(readError);
		var config = JSON.parse(content);
		
		exec('create-topics-folder ' + config.helpTopicsFolder, function(execError, stout, stderror){
			if(execError) console.log(execError);
			console.log(stout);
		});
	});
} else {
	console.log();
	console.log('You need to pass the product name as an argument to this script');
	console.log();
	console.log('Example:');
	console.log();
	console.log('  node create-topics-folder.js reportPlusDesktop');
}