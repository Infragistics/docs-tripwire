/*jslint node: true */
/*jshint esversion: 6 */

const encodeSpecialChars = {
    "™" : "&trade;",
    "®" : "&reg;",
    "©" : "&copy;",
    "•​" : "&#8226;",
    "•" : "&#8226;", // these look exactly the same, but they're not. Keep both
    "–" : "-",
    "^\\uFEFF" : "" // Strip UTF-8 BOM
};

const path = require('path');

require(path.resolve(__dirname, '../../../common/regexp.js'));

module.exports.apply = (source, options) => {

    if(options.isOffline && options.isJapanese) {
        var keys = Object.keys(encodeSpecialChars);
        keys.forEach((key) => {
            var expression = new RegExp(key, 'gi');
            source = source.replace(expression, encodeSpecialChars[key]);
        });
    }

    return source;
}; 