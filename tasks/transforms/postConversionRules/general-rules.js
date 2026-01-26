/*jslint node: true */
/*jshint esversion: 6 */

const rules = [
    {
        description: 'replace single quote entities',
        apply: (source) => source.replace(/&#x2019;|&#x2018;/gi, "'") 
    },
    {
        description: 'replace non-sensical latin characters',
        apply: (source) => source.replace(/Infragistics&#xC2;/gi, 'Infragistics') 
    }
];

module.exports.apply = (source, options) => {

    rules.forEach((rule) => {
        source = rule.apply(source, options);
    });

    return source;
}; 