var path = require('path');
var fs = require('fs');

module.exports = function(path, encoding){
	encoding = encoding? encoding : 'utf8';
	var obj  = fs.readFileSync(path, encoding);
	obj = JSON.parse(obj);
	return obj;
};