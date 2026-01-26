/*jslint node: true */
/*jshint esversion: 6 */
/*global describe, it, expect */
const fs = require('fs-extra');
const path = require('path');
const getPath = (filePath) => path.resolve(__dirname, filePath);
const syncer = require(getPath('../tasks/syncFileSystemToTOC.js'));
describe('syncFileSystemToTOC', () => {
    describe('sync', () => {
        it('deletes files not in the TOC', (done) => {
            fs.emptyDir(getPath('./data/sync/test'), err => {
                if (err) return console.error(err);
                console.log('Sync "test" folder emptied');
                fs.copy(getPath('./data/sync/seed-data'), getPath('./data/sync/test'), err => {
                    if (err) return console.error(err);
                    console.log('Sync seed files copied to "test"');
                    syncer.syncFileSystemToTOC(getPath('./data/sync/test/toc.json'), getPath('./data/sync/test'), () => {
                        var files = {
                            fileToDelete1: fs.existsSync(getPath('./data/sync/test/file-to-delete-1.html')),
                            fileToDelete2: fs.existsSync(getPath('./data/sync/test/file-to-delete-2.html')),
                            fileToKeep1: fs.existsSync(getPath('./data/sync/test/file-to-keep-1.html')),
                            fileToKeep2: fs.existsSync(getPath('./data/sync/test/file-to-keep-2.html')),
                            tocHTML: fs.existsSync(getPath('./data/sync/test/toc.html')),
                            tocJson: fs.existsSync(getPath('./data/sync/test/toc.json')),
                            tocXml: fs.existsSync(getPath('./data/sync/test/toc.xml'))
                        };
                        expect(files.fileToDelete1).toBe(false);
                        expect(files.fileToDelete2).toBe(false);
                        expect(files.fileToKeep1).toBe(true);
                        expect(files.fileToKeep2).toBe(true);
                        expect(files.tocHTML).toBe(true);
                        expect(files.tocJson).toBe(true);
                        expect(files.tocXml).toBe(true);
                        done();
                    });
                });
            });
        });
    });
});