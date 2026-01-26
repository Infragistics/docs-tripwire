/// <reference path="../typings/node/node.d.ts"/>
var path = require('path');

var through = require('through2');
var converter = require(path.resolve(__dirname, '../tasks/asciidoc.js'));

module.exports = function(buildFlags, version, sourceFolder){
	
	var processStream = function(file, encoding, next){
		var asciiDocContent, stream, html;
		
		asciiDocContent = file.contents.toString(encoding);
		stream = this;
		html = converter.convert(asciiDocContent, buildFlags, version, sourceFolder);
		file.contents = new Buffer(html, encoding);
		stream.push(file);
		next();
	};
	
	return through.obj(processStream);
};