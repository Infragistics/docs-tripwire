/// <reference path="../typings/node/node.d.ts"/>
const through = require('through2');
const path = require('path');
const buildVariables = require(path.join(__dirname, '../tasks/buildVariables.js'));

module.exports = function(variables){
	
	var processStream = function(file, encoding, next){
		var contents, stream;
		contents = file.contents.toString(encoding);
		stream = this;
        file.contents = new Buffer(buildVariables.replace(contents, variables), encoding);
        stream.push(file);
        next();
	};
	
	return through.obj(processStream);
};