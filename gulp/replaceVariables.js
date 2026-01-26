/// <reference path="../typings/node/node.d.ts"/>
var path = require('path');
var _ = require('lodash');

var through = require('through2');

module.exports = function(options, variables){
	
	var processStream = function(file, encoding, next){
		var contents, stream, regex, keys;
		
		contents = file.contents.toString(encoding);
		stream = this;
		keys = _.keys(variables);
		
		keys.forEach(function(key){
			// replace version numbers in replacement values
			variables[key] = variables[key]
								.replace(/\{major\}/g, options.versionMajor)
								.replace(/\{minor\}/g, options.versionMinor);
			
			// resolve composite variables
			keys.forEach(function(compositeKey){
				regex = new RegExp('\{' + key + '\}', 'g');
				variables[compositeKey] = variables[compositeKey].replace(regex, variables[key]);		
			});
		});
		
		// replace variables in content
		keys.forEach(function(key){		
			regex = new RegExp('\{' + key + '\}', 'g');
			contents = contents.replace(regex, variables[key]);
		});
		
		file.contents = new Buffer(contents, encoding);
		stream.push(file);
		next();
	};
	
	return through.obj(processStream);
};