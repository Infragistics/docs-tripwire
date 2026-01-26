/*jslint node: true */
/*jshint esversion: 6 */

var path = require('path');

require(path.resolve(__dirname, '../../../common/regexp.js'));

module.exports.apply = (source, options) => {

    if(options.prepForTranslation) {
        var pickMacroMatches = source.match(/&lt;span style=&quot;hs-build-flags:(.+?)&lt;\/span&gt;/);
        var expression;
        if(pickMacroMatches) {
            pickMacroMatches.forEach((pickMatch) => {
                expression = new RegExp(RegExp.escape(pickMatch), 'gi');
                source = source.replace(expression, pickMatch
                                                        .replace(/\&lt\;/gi, '<')
                                                        .replace(/\&gt\;/gi, '>')
                                                        .replace(/\&quot\;/gi, '"'));
            });
        }
    }

    return source;
}; 