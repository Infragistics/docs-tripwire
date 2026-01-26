/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');

require(path.resolve(__dirname, '../../../common/regexp.js'));

const buildFlagRules = [
    {
        description: 'convert pick macros to SPANs (markup is cleaned up in postConversionRules)',
        apply: (source, options) => {

            if(options.prepForTranslation) { 
                var pickMatches = source.match(/pick:\[(.+?)\]_{0,}\*{0,}"?\]?/gi);
                var expression;

                if(pickMatches) {
                    pickMatches = Array.from(new Set(pickMatches));
                    pickMatches.forEach((pickMatch) => {
                        var flagsMatches = /\[(.+)=/gi.exec(pickMatch);
                        var pickBodyMatches = /\"(.+)\"/gi.exec(pickMatch);
                        if(flagsMatches && pickBodyMatches) {
                            if(flagsMatches.length > 1 && pickBodyMatches.length > 1) {	  
                                expression = new RegExp(RegExp.escape(pickMatch), 'gi');
                                source = source.replace(expression, `pass:[<span style="hs-build-flags:${flagsMatches[1]}">${pickBodyMatches[1]}</span>]`);
                            }
                        }
                    });
                }
            }

            return source;
        }
    },
    {
        description: 'convert ifdefs to DIVs',
        apply: (source, options) => {

            if(options.prepForTranslation) {
                var buildFlagMatches = source.match(/ifdef::.+\[\]/gi);
                var expression, flags = '';

                if(buildFlagMatches) {
                    buildFlagMatches = Array.from(new Set(buildFlagMatches));
                    buildFlagMatches.forEach((buildFlagMatch) => {
                        expression = new RegExp(RegExp.escape(buildFlagMatch), 'gi');
                        flags = buildFlagMatch.replace(/ifdef::/g, '').replace('[]', '');
                        //source = source.replace(expression, `pass:[<build-flag value="${flags}" type="begin"></build-flag>]`);
                        source = source.replace(expression, `image:tripwire-build-flag-begin.png["${flags}"]\n`);
                        //source = source.replace(new RegExp(RegExp.escape(`endif::${flags}[]`), 'gi'), `pass:[<build-flag value="${flags}" type="end"></build-flag>]`);
                        source = source.replace(new RegExp(RegExp.escape(`endif::${flags}[]`), 'gi'), `\nimage:tripwire-build-flag-end.png["${flags}"]`);
                    });
                }
            }

            return source;
        }
    }
];

module.exports.apply = (source, options) => {
	
	buildFlagRules.forEach((rule) => {						   
        source = rule.apply(source, options);
	});
	
	return source;
};