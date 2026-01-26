/*jslint node: true */
/*jshint esversion: 6 */

module.exports.apply = (source, options) => {

    if(options.prepForTranslation) {
        source = source.replace(/(<!---)\n\|metadata/, (match, group) => {
            return match.replace(group, `<pre id="metadata">`);
        });

        source = source.replace(/metadata\|\n(--->)/, (match, group) => {
            return match.replace(group, '</pre>');
        });
    }

    return source;
}; 