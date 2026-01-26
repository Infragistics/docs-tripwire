/*jslint node: true */
/*jshint esversion: 6 */

const through = require('through2');
const iconv = require('iconv-lite');

module.exports = function() {
	
	var processStream = function(file, encoding, next){
		var contents, stream;
		
		contents = file.contents.toString(encoding);
		stream = this;

		encoding = 'shift_jis';
		contents = iconv.encode(contents, encoding);

		file.contents = new Buffer(contents, encoding);
		stream.push(file);
		next();
	};
	
	return through.obj(processStream);
};