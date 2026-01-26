module = module.exports;

var asciiDocRules = require('./rules-asciidoc.js');

module.asciidoc = function(source){
	asciiDocRules.regex.forEach(function (rule) {
		source = source.replace(rule.pattern, rule.replacement);
	});
	return source;
};