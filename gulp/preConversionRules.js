/// <reference path="../typings/node/node.d.ts"/>
/*jslint node: true */
/*jshint esversion: 6 */

const through = require('through2');
const path = require('path');
const preConversionRules = require(path.resolve(__dirname, '../tasks/transforms/preConversionRules'));

module.exports = function(options){
	
	var processStream = function(file, encoding, next){
		var contents, stream;
		contents = file.contents.toString(encoding);
		stream = this;
        file.contents = new Buffer(preConversionRules(contents, options), encoding);
        stream.push(file);
        next();
	};
	
	return through.obj(processStream);
};