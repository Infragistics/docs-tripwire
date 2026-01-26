/*jslint node: true */
/*jshint esversion: 6 */

const 
	  fs = require('fs')
    , path = require('path')
	;


const _module = {
    readFile: (tocFilePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(tocFilePath, 'utf8', (err, tocData) => { 
                if(err) {
                    reject(err);
                } else {
                    resolve(tocData);
                }
            });
        });
    },

    isAPITopicName: (fileName) => /^infragistics\d|~/i.test(fileName),

    getFileNames: (tocFilePath) => {

        return new Promise((resolve, reject) => {
            _module.readFile(tocFilePath).then((tocData) => {
                const fileNames = {};

                const allFileNames = tocData.match(/fileName":\s?"(.*?)"/gi);

                allFileNames.forEach((fileName) => {
                    fileName = fileName.replace(/"/g, '')
                                       .replace(/fileName:/gi, '')
                                       .toLowerCase()
                                       .trim();

                    if(!/\.html/.test(fileName)){
                        fileName = fileName + '.html';
                    }               

                    if(!_module.isAPITopicName(fileName)) {
                        // uses file names as object keys in order to make 
                        // finding file names as fast as possible
                        fileNames[fileName] = true; //the value is meaningless, the key is what's important here
                    }
                });

                resolve(fileNames);

            }).catch((err) => {
                reject(err);
            });
        });

    },

    removeFilesNotInTOC: (tocFileNames, htmlTopicsFilePath) => {
        return new Promise((resolve, reject) => {
            fs.readdir(htmlTopicsFilePath, (err, diskFileNames) => {
                if(err) reject(err);

                var numberOfFilesDeleted = 0;

                var skipNames = [
                    'home-page.html',
                    'toc.html'
                ];

                var shouldLookForFileInTOC = (fileName) => {
                    return !_module.isAPITopicName(fileName) && 
                           /\.html$/i.test(fileName) &&
                           skipNames.indexOf(fileName) === -1;
                };

                diskFileNames.forEach((fileName) => {
                    fileName = fileName.toLowerCase();
                    if(shouldLookForFileInTOC(fileName)) {
                        if(!tocFileNames[fileName]) {
                            numberOfFilesDeleted++;
                            var fileToDeletePath = path.join(htmlTopicsFilePath, fileName);
                            fs.unlink(fileToDeletePath, function(err) {
                                if(err && err.code == 'ENOENT') {
                                    // file doens't exist
                                    console.info("File " + fileToDeletePath + " doesn't exist, won't remove it.");
                                } else if (err) {
                                    // other errors, e.g. maybe we don't have enough permission
                                    console.error("Error occurred while trying to remove file " + fileToDeletePath);
                                } else {
                                    console.info(fileToDeletePath + ' removed because it is not in the TOC file');
                                }
                            });
                        }
                    }
                });

                console.log(`Deleted ${numberOfFilesDeleted} files that were not included in the TOC.`);

                resolve();
            });
        });
    }
};

module.exports.syncFileSystemToTOC = (tocFilePath, htmlTopicsFilePath, done) => {
    console.log('Sync HTML files to TOC file - delete the HTML files that are not in the TOC file ' + tocFilePath);
    console.log('Reading TOC from: ' + tocFilePath);
    console.log('Reading HTML files from: ' + htmlTopicsFilePath);


    _module.getFileNames(tocFilePath).then((fileNames) => {
        _module.removeFilesNotInTOC(fileNames, htmlTopicsFilePath)
            .then(done)
            .catch((err) => {
                console.log('Error while trying to delete files from: ' + htmlTopicsFilePath);
                console.log(err);    
        });
    }).catch((err) => {
        console.log('Error while trying to read toc file: ' + tocFilePath);
        console.log(err);
    });
};