/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const iconv = require('iconv-lite');

const validation = require('./validation.js');
const cleanupRules = require('./cleanup.js');

require(path.resolve(__dirname, '../../../common/regexp.js'));

const linkPatterns = {
    html: /href="(.*?)"/gi,
    xml: /Url="(.+?)"/gi
};

var reportProgress = (count, length, message) => {
    var threshold = length > 10000 ? 1000 : 100;
    var mod = (count % threshold);
    if(count > 0 && mod === 0){
        console.log(`${count} of ${length} ${message}`);
    }
};

var getFileNameMap = (pathToFiles) => {
    var isHtmlFile = (fileName) => path.extname(fileName).toLowerCase() === '.html';

    return new Promise((resolve, reject) => {
        fs.readdir(pathToFiles, (err, files) => {
            if(err) {
                console.log('Error: ' + err);
                reject(err);
            } else {
                var nameMap = {};
                files.forEach((fileName) => {
                    if(isHtmlFile(fileName)){
                        nameMap[sanitizeFileName(fileName, linkPatterns.html)] = {
                            guid: uuid.v4(),
                            originalName: fileName
                        };
                    }
                });
                resolve(nameMap);
            }
        });
    });
};

var renameFiles = (map, pathToFiles) => {
    var fileNames = Object.keys(map), len;
    len = fileNames.length;
    fileNames.forEach((fileName, index) => {
        var paths = {
            existing: path.join(pathToFiles, map[fileName].originalName),
            renamed: path.join(pathToFiles, map[fileName].guid + '.html') 
        };

        reportProgress(index, len, 'files renamed');

        fs.renameSync(paths.existing, paths.renamed);
    });
};

var sanitizeFileName = (fileName, linkPattern) => {
    fileName = fileName.replace(linkPattern, '$1')
                .replace(/\.html(\?v=\d\d\.\d)/i, '.html')
                .replace(/&lt;\/?sub&gt;/gi, '~')
                .replace(/_/g, '-') // keep it flexible
                .toLowerCase();

    if(/^infragistics/i.test(fileName)) {
        fileName = fileName.replace(/(-)(members|ctor|properties|ev|namespace|methods)/, (match, dash) => {
            return match.replace(dash, '_');
        });
    }

    if(/\#/.test(fileName)) {
        fileName = fileName.split('#')[0];
    }

    return fileName;
};

var saveFile = (filePath, content, culture) => {
    var encodingTypes = { utf8: 'UTF8', shiftjis: 'Shift_JIS' };
    var encoding = culture === 'en' ? encodingTypes.utf8 : encodingTypes.shiftjis;
    var buffer;
    if(encoding === encodingTypes.shiftjis) {
        buffer = iconv.encode(content, encodingTypes.shiftjis);
        fs.writeFileSync(filePath, buffer);
    } else {
        fs.writeFileSync(filePath, content, encoding);
    }
};

var replaceFileNamesInText = (map, pathToFiles, culture) => {
    var fileNames = Object.keys(map);
    var endsWith = (value, suffix) => value.substr(value.lastIndexOf(suffix), value.length) === suffix;
    var startsWith = (value, prefix) => value.substr(0, prefix.length) === prefix;

    var isRelativeLink = (value) => {
        return !startsWith(value, 'http') && 
               !startsWith(value, 'mailto') &&
               endsWith(value, '.html');
    };

    var len = fileNames.length;

    fileNames.forEach((fileName, index) => {
        var filePath = path.join(pathToFiles, map[fileName].guid + '.html');

        var buffer = fs.readFileSync(filePath);
        var text = iconv.decode(buffer, 'utf8');

        cleanupRules.forEach((rule) => {
            text = rule.apply(text, { culture: culture });
        });

        var hrefs = text.match(linkPatterns.html);
        var regex; 
        if(hrefs) {
            hrefs.forEach((href) => {

                href = sanitizeFileName(href, linkPatterns.html);

                if(isRelativeLink(href)){

                    validation.apply(href, filePath);

                    var expression = RegExp.escape(href);
                    expression = expression.replace(/\\_|\\-/g, '[_|-]');
                    regex = new RegExp(expression, 'gi');

                    if(map[href]) {
                        text = text.replace(regex, map[href].guid + '.html');
                    } else {
                        //text = text.replace(regex, 'unknown.html?n=' + href);
                        text = text.replace(regex, 'unknown.html');
                        validation.brokenLinks.push(`${fileName}: ${href}`);
                    }
                }
            });
        }

        if(culture === 'ja') {
            text = text.replace('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">', 
                                '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=Shift_JIS">');
        }

        saveFile(filePath, text, culture);

        reportProgress(index, len, 'files with replaced names');
    });
};

var replaceFileNamesToc = (map, pathToFiles, tocFileName) => {
    var filePath = path.join(pathToFiles, tocFileName);

    console.log(`Attempting to open: ${filePath}`);

    var text = fs.readFileSync(filePath, 'utf8');
    var hrefs = text.match(linkPatterns.xml);
    var regex, len, rawHref;

    len = hrefs.length;

    console.log(`Replacing ${len} names`);

    if(hrefs) {
        hrefs.forEach((href, index) => {
            rawHref = href;  // Make sure replace only hits of the full Url as intended
            href = sanitizeFileName(href, linkPatterns.xml);

            if(href.indexOf('.html') === -1) {
                href += '.html';
            }

            regex = new RegExp(RegExp.escape(rawHref), 'gi');

            if(map[href]) {
                text = text.replace(regex, "Url=\"" + map[href].guid + '.html' + "\"");
            } else {
                text = text.replace(regex, "Url=\"unknown.html\"");
                validation.brokenLinks.push(`${tocFileName}: ${href}`);
            }
            
            reportProgress(index, len, 'links replaced in TOC');
        });
    }    

    fs.writeFileSync(filePath, text, 'utf8');

    console.log(`Updated table of contents: ${tocFileName}`);
};

var addUnknownPage = (pathToFiles, productName, culture) => {
    var markup, rootPath = '../../../offline/templates/multiproduct/template';

    if(/win\-?forms/.test(productName)) {
        markup = fs.readFileSync(path.resolve(__dirname, `${rootPath}/unknown.winforms-${culture}.html`), 'utf8');
    } else {
        markup = fs.readFileSync(path.resolve(__dirname, `${rootPath}/unknown-${culture}.html`), 'utf8');
    }
    fs.writeFileSync(path.join(pathToFiles, 'unknown.html'), markup, 'utf8');
};

module.rename = (pathToFiles, productName, culture, done) => {
    var tocFileName = 'chm.xml';

    getFileNameMap(pathToFiles).then((map) => {

        try{
            console.log('** Starting to rename files **');
            renameFiles(map, pathToFiles);

            console.log('** Starting to replace file names in HTML **');        
            replaceFileNamesInText(map, pathToFiles, culture);

            console.log(`** Writing unknown.html to: ${pathToFiles}`);
            addUnknownPage(pathToFiles, productName, culture);

            console.log('** Replacing values in table of contents **');
            replaceFileNamesToc(map, pathToFiles, tocFileName); 

            validation.report(pathToFiles);
        } catch(e) {
            console.error(e);
            throw new Error(e);
        }
        
        console.log('** Finished renaming files **');
        done();
    });
};
