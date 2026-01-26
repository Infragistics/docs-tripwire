var through = require('through2');
var cleanup = require('../tasks/cleanup');

module.exports = function(sourceType){
	
	var processStream = function(file, encoding, next){
		var contents = file.contents.toString(encoding);
		var stream = this;
		file.contents = new Buffer(cleanup.asciidoc(contents), encoding);
		stream.push(file);
		next();
	};
	
	return through.obj(processStream);
};