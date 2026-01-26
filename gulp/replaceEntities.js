/// <reference path="../typings/node/node.d.ts"/>
const through = require('through2');
const path = require('path');

function decodeCharRefs(string) {
    return string
        .replace(/&#(\d+);/g, function(match, num) {
            return String.fromCharCode(num);
        })
        .replace(/&#x([A-Za-z0-9]+);/g, function(match, num) {
            return String.fromCharCode(parseInt(num, 16));
        });
}

module.exports = function(variables){
	
	var processStream = function(file, encoding, next){
		var contents, stream;
		contents = file.contents.toString(encoding);
		stream = this;
        file.contents = new Buffer(decodeCharRefs(contents), encoding);
        stream.push(file);
        next();
	};
	
	return through.obj(processStream);
};