/*jslint node: true */
/*jshint esversion: 6 */

const buildVariables = require('./buildVariables.js');
const jqueryRules = require('./jquery-rules.js');
const pickMacroRules = require('./pick-macro-rules.js');
const metadataRules = require('./metadata-rules.js');
const localizationRules = require('./localization-rules.js');
const generalRules = require('./general-rules.js');

module.exports = (source, options) => {
    source = jqueryRules.apply(source, options);
    source = buildVariables.replace(source, options);
    source = pickMacroRules.apply(source, options);
    source = metadataRules.apply(source, options);
    source = localizationRules.apply(source, options);
    source = generalRules.apply(source, options);
    return source;
};