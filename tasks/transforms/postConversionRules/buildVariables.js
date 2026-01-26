/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');

require(path.resolve(__dirname, '../../../common/regexp.js'));

module.exports.replace = (content, options) => {

    var isJapanese = RegExp.isJapanese(content);

    if(!options.prepForTranslation) {
        var keys = Object.keys(options.variables);
        var regex, localizedKey;

        keys.forEach((key) => {

            localizedKey = key;

            if(isJapanese) {
                if(options.variables[key + 'JP']) {
                    localizedKey = key + 'JP';
                }
            }

            if(!/JP$/.test(key)) {
                regex = new RegExp(`\\{${key}\\}`, 'gi');
                content = content.replace(regex, options.variables[localizedKey]);
            }

        });
    }

    return content;
}; 