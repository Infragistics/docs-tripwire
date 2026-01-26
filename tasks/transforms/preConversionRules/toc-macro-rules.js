/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const config = require(path.resolve(__dirname, '../../../config/index.js'));

const tocMacroRules = [
    {
        description: 'Configure toc macro default text',
        apply: (source, options) => {
            source = source.replace(/toc\:\:\[]/g, `toc::[title="${config.cultures[options.culture].defaultTOCLabel}"]`);
            return source;
        }
    }
];

module.exports.apply = (source, options) => {

	tocMacroRules.forEach((rule) => {						   
        source = rule.apply(source, options);
	});
	
	return source;
};