/* 
    copies all the Markdown files from the source location
    to a single folder (flattened) in preparation for being
    converted into HTML
*/

module.exports = {
    contentCopier: {
        src: '../topics',
        dest: '../topic-files'
    }
};