/*jslint node: true */
/*jshint esversion: 6 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const _ = require('lodash');

var validation = {
    rules: [
        {
            apply: (href, filePath) => {
                if(href.indexOf('{') > -1){
                    validation.fileErrors.push(`May include unresolved build variables: ${href} | ${filePath}`);
                }
            } 
        },
        {
            apply: (href, filePath) => {
                if(href.indexOf('.html') === -1){
                    validation.fileErrors.push(`${href} does not have a file name: ${filePath}`);
                }
            } 
        },
        {
            //?v=16.2infragistics4.web.v16.2&lt;sub&gt;infragistics.web.ui.editorcontrols.webmaskeditor&lt;/sub&gt;inputmask.html
            apply: (href, filepath) => {
                if(href[0] === '?'){
                    validation.fileErrors.push(`HREF begins with ?: ${filepath}`);
                }
            }
        }
    ],
    brokenLinks: [],
    allBrokenLinks: [],
    fileErrors: [],
    allErrors: [],
    hasErrors: () => validation.fileErrors.length > 0,
    apply: (href, filePath) => {
        validation.allErrors = validation.allErrors.concat(validation.fileErrors);
        validation.allBrokenLinks = validation.allBrokenLinks.concat(validation.brokenLinks);
        validation.fileErrors = [];
        validation.brokenLinks = [];
        validation.rules.forEach((rule) => {
            rule.apply(href, filePath);
        });
    },
    report: (pathToFiles) => {
        validation.allErrors = validation.allErrors.sort();
        validation.allErrors = _.uniq(validation.allErrors);

        validation.allBrokenLinks = validation.allBrokenLinks.sort();
        validation.allBrokenLinks = _.uniq(validation.allBrokenLinks);

        var validationLog, validationFilePath;
        if(validation.allErrors.length > 0){
            validationLog = validation.allErrors.join(os.EOL);
            validationFilePath = path.join(pathToFiles, '~validation.txt');
            fs.writeFile(validationFilePath, validationLog, 'utf8', () => {
                console.log(`Validation errors are written to: ${validationFilePath}`);
            });
        }

        var linksLog, linksFilePath;
        if(validation.allBrokenLinks.length > 0){
            linksLog = validation.allBrokenLinks.join(os.EOL);
            linksFilePath = path.join(pathToFiles, '~broken-links.txt');
            fs.writeFile(linksFilePath, linksLog, 'utf8', () => {
                console.log(`Broken links are written to: ${linksFilePath}`);
            });
        }
    }
};

module.exports = validation;