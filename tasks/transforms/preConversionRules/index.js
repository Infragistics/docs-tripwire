/*jslint node: true */
/*jshint esversion: 6 */

const buildFlagRules = require('./build-flag-rules.js');
const tocMacroRules = require('./toc-macro-rules.js');

module.exports = (source, options) => {
    source = buildFlagRules.apply(source, options);
    source = tocMacroRules.apply(source, options);
    return source;
};