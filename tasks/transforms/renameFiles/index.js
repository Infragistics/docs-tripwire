/*jslint node: true */
/*jshint esversion: 6 */

module = module.exports;

const fs = require('fs');
const path = require('path');

const errors = [];

var reportProgress = (count, length, message) => {
    var threshold = length > 10000 ? 1000 : 100;
    var mod = (count % threshold);
    if(count > 0 && mod === 0){
        console.log(`${count} of ${length} ${message}`);
    }
};

module.rename = (pathToFiles, done) => {
    var paths = {};

    fs.readdir(pathToFiles, (error, names) => {
        var namesCount = names.length;
        var renamedCount = 0;
        if(error) {
            errors.push(JSON.stringify(error));
        } else {
            names.forEach((name) => {
                if(path.extname(name).toLowerCase() === '.html') {
                    if(/[A-Z]/.test(name) || /_/.test(name)) {
                        paths.existing = path.join(pathToFiles, name);
                        paths.renamed = path.join(pathToFiles, name.replace(/_/g, '-').toLowerCase());
                        fs.rename(paths.existing, paths.renamed);
                        renamedCount++;
                        reportProgress(renamedCount, namesCount, 'files renamed');
                    }
                }
            });
        }

        if(errors.length > 0) {
            fs.writeFileSync(path.join(pathToFiles, '~renameFiles-errors.txt', errors.join('\n'), 'utf8'));
        }

        done();
    });
};