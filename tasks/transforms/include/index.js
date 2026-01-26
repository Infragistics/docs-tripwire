const fs = require('fs');
const path = require('path');

const INCLUDE_SUPPORT_DEPTH = 4;
const INCLUDE_PATTERN = /include::(.*?)\[\]/gi;

var includeFile = (asciidoc, sourceFolder) => {
    var filePath;
    
    asciidoc = asciidoc.replace(INCLUDE_PATTERN, (match, g) => {
        filePath = path.resolve(sourceFolder, g);
        if(fs.existsSync(filePath)){
            match = fs.readFileSync(filePath, 'utf8').trim();
        }
        return match;
    });
    
    return asciidoc;
};

module.exports.apply = (asciidoc, sourceFolder) => {

    if(INCLUDE_PATTERN.test(asciidoc) && sourceFolder){
        for (var i = 0; i < INCLUDE_SUPPORT_DEPTH; i++) {
            asciidoc = includeFile(asciidoc, sourceFolder);
        }
    }
    
    return asciidoc;    
}; 