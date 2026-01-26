/*jslint node: true */
/*jshint esversion: 6 */

const cheerio = require('cheerio');
const path = require('path');

require(path.resolve(__dirname, '../../../common/regexp.js'));

const jqueryRules = [
    {
        description: 'replacese inline CODE elements with SPANs to support translation', 
        apply: ($, options) => {

            var values = [];

            if(options.prepForTranslation) {
                $('code:not(pre code)').each((i, pre) => {
                    var $pre = $(pre);
                    values.push({
                        src: $('<div>').append($pre).html(),
                        dest: `<span class="ig-code-in-text">${$pre.html()}</span>`
                    });
                });
            }

            return values;
        }
    }
];

module.exports.apply = (source, options) => {
	var $ = cheerio.load(source);
	var replacements = [];
	
	jqueryRules.forEach((rule) => {
		replacements = replacements.concat(rule.apply($, options));
	});
	
	replacements.forEach((rule) => {						   
        var regex = new RegExp(RegExp.escape(rule.src), 'gi');
		source = source.replace(regex, rule.dest);
	});
	
	return source;
};