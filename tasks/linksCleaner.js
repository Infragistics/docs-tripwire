/*
* Fixes links and image sources pointing to file names with parenthesis.
*/

(function (module) {

    'use strict';

    module.fixParenthesisLinks = function(sourceFolder, done){

        var walk = require('walk'), 
            fs = require('fs'), 
            path = require('path'), 
            options = {
                followLinks: false,
                encoding: 'utf-8',
                filters: ["images"] // skip images folder
            }, 
            walker,
            matches = [],
            links = 0
        ;

        /*  RegExp for finding links with parenthesis
        * 
        * Modified version of marked's link matching regex: 
        * - global (+not dependent on substringed input)
        * - only matches links with parentheses in the href/src part
        */
        //var searchPattern =  /!?\[(?:(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([^\(\)]*\([^\(\)]*\)[\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)(?=\s|\[|\(|\:|\*|$)/g; 
       
        /* Basic layout of "[text](link) / ![](src)" 
        * The last ) matched only if follwed by usually breaking characters (not ideal):
        *   - white spaces (will break with more than one () in link)
        *   - misc brackets opening new links or anything else
        *   - semi-columns in lists
        *   - asterisks for italics or bolding
        */
        var searchPattern = /!?\[(?:text)\]\(link\)(?=\s|\[|\(|\:|\.|\*|$)/;

        /* Like marked, matches groups of
        *   - literal [
        *   -  anything not closing ]
        *   or
        *   - anything not []
        *   or
        *   - ending ] followed by:
        *       -- chars (not opening "[") + closing ]
        * e.g [Columns (igGrid)] -> Columns (igGrid), [[te[s]t]] -> [te[s]t]
        */ 
        var _text = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;

        /* Link (and title) format matching only with "()" in the link. Breakdown:
        *   - white spaces
        *   - optional <
        *   - actual captured resulting link with:
                -- anything not a "(" or ")"
                -- literal (
                -- anything not "(" or ")"
                -- anything
        *   - optional >
        *   - title group, optional:
                -- spaces
                -- single or double quotes
                -- optional, captured content
                -- single or double quotes
        *   - spaces
        * e.g. [](example.com) -> null, [](examp(le).com) -> examp(le).com
        */
        var _link = /\s*<?([^\(\)]*\([^\(\)]*\)[\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

        searchPattern = new RegExp(searchPattern.source.replace('text', _text.source).replace('link', _link.source), "g");

        /* Encode parentheses before they mess up markdown parsing
        * (  -  %28
        * )  -  %29  
        */        
        var stripParentheses = function(str){
            return str.replace(/\(/g, "%28").replace(/\)/g, "%29");
        };

        var rootPath = path.resolve(__dirname, sourceFolder);

        if (!fs.existsSync(rootPath)) throw new Error('The source location does not exist: ' + rootPath);

        walker = walk.walk(rootPath, options);

        walker.on("file", function (root, fileStats, next) {
            var path = root + '\\' + fileStats.name;

            fs.readFile(path, options,  function (err, data) {
                if (err) throw err;
                var res, results = [];
                
                
                // Find all matches and keep them
                while ((res = searchPattern.exec(data)) !== null)
                {
                    results.push(res[1]);
                    //data.substr(0,searchPattern.lastIndex - res[1].length + 2)
                    //decided not to replace here, would change length of data and matching uses lastIndex to move along
                    links++;
                }

                results.forEach(function(link){
                    data = data.replace(link, stripParentheses(link), "g");
                });

                if (results.length > 0) {
                    fs.writeFile(path, data, options, function (err) {
                         if (err) return console.log(err);
                    });
                    matches.push({file: fileStats.name, matches: results});
                }
            });

            next();
        });

        walker.on("errors", function (root, nodeStatsArray, next) {
            next();
        });

        walker.on("end", function () {
            fs.appendFile(__dirname + '\\linksCleanerLog.json', JSON.stringify({execution: new Date(), run: "fixParenthesisLinks", matches: matches}, null, 4), function (err) {  if (err) throw err; });
            console.log("done, encoded links: " + links); 
            done();
        });    
    };

     module.sanitizeLinks = function(sourceFolder, done){

        var walk = require('walk'), 
            fs = require('fs'), 
            path = require('path'), 
            options = {
                followLinks: false,
                encoding: 'utf-8',
                filters: ["images"] // skip images folder
            }, 
            walker,
            matches = [],
            links = 0
        ;

        /*  RegExp for finding links with "_"
        * Matches either markdown style or html link and ignores API links by avoiding "~"
        * Matches:
        * - [ anything not "]" ]
        * - ( 
        *     - groups of:
        *         - optional chars
        *         - at least one "_" or "%20"
        *         - optional chars
        *     - .html
        *     - optionally followed by "#chars"
        *     - optionally followed by space+"title"
        *     - optional spaces
        *   )
        * OR
        * - href="
        *         - groups of:
        *             - optional chars
        *             - at least one "_" or "%20"
        *             - optional chars
        *         - .html
        *         - optionally followed by "#chars"
        *       "
        */
        var searchPattern = /\[[^\]]*\]\(([^~\(\)]*(?:_|%20|\s)+[^~\(\)]*\.html)(?:#[^\)\s]*)?(?:\s+['"][\s\S]*?['"])?\s*\)|href=['"]([^~"]*(?:_|%20)+[^~"]*\.html)(?:#[^'"\s]*)?['"]/g;

        var rootPath = path.resolve(__dirname, sourceFolder);

        if (!fs.existsSync(rootPath)) throw new Error('The source location does not exist: ' + rootPath);

        walker = walk.walk(rootPath, options);

        walker.on("file", function (root, fileStats, next) {
            var path = root + '\\' + fileStats.name;

            fs.readFile(path, options,  function (err, data) {
                if (err) throw err;
                var res, results = [];
                
                // Find all matches and keep them
                while ((res = searchPattern.exec(data)) !== null)
                {
                    if (res[1]) results.push(res[1]);
                    if (res[2]) results.push(res[2]);
                    links++;
                }

                results.forEach(function(link){
                    data = data.replace(link, link.replace(/_/g, '-').replace(/%20/g, '-').replace(/\s/g, '-'), "g");
                });

                if (results.length > 0) {
                    fs.writeFile(path, data, options, function (err) {
                         if (err) return console.log(err);
                    });
                    matches.push({file: fileStats.name, matches: results});
                }

                next();
            });

        });

        walker.on("errors", function (root, nodeStatsArray, next) {
            next();
        });

        walker.on("end", function () {
            fs.appendFile(__dirname + '\\linksCleanerLog.json', JSON.stringify({execution: new Date(), run: "replaceUnderscoresAndSpaces", matches: matches}, null, 4), function (err) {  if (err) throw err; });
            console.log("done, replaced links: " + links); 
            done();
        });    
    };

}(module.exports));