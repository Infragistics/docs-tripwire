(function (module) {
    'use strict';

    var config,
        breakAt = 20000,
        fs = require('fs'),
        path = require('path'),
        http = require('http'),
        parseString = require('xml2js').parseString,
        productMetadata = require('./productMetadata.js'),
        htmlContentParser = require('./lib/htmlContentParser.js');

    var createItem = function (fileName, title, content, controlName, keywords) {

        var disallowOnlyNumbers = function (controlName) {
            for (var i = 0; i < controlName.length; i++) {
                controlName[i] = controlName[i].match(/(?!^\d+$)^.+$/) !== null ? controlName[i] : '';
            }
        };
        
        controlName = controlName || [];
        if (controlName.split) {
            controlName = controlName.split(/\s*,\s*/);
        }
        disallowOnlyNumbers(controlName);

        var metadata = productMetadata.find(controlName);

        if(controlName.length && !metadata.FriendlyName.length) {
            console.log("WARN: Missing control from Customer Guidance DB!:", controlName, fileName);
            // failures.push({
            //     filePath: fileName,
            //     stack: '',
            //     reason: 'Missing control from CG database'
            // });
        }

        var item = {
            'ig_source': 'Tripwire Help Indexing ' + config.version,
            'ig_category': 'Help Topic',
            'url': config.helpRootUrl + fileName,
            'title': title,
            'content': content,
            'ig_control': metadata.ControlName, // ["igGrid", "igHierarchicalGrid"] internal name of the control(s), distinctive
            'ig_control_friendly': metadata.FriendlyName, // should be ['Grid', 'Data Chart', 'Tree'] etc, distinctive
            'ig_control_group': metadata.GroupName, // ['Grids', 'Charts', 'Frameworks'] , etc, distinctive
            'ig_product': config.searchProduct?config.searchProduct:metadata.ProductFamilyName,
            'ig_help_guide': config.searchGuide,
            'ig_platform': config.platformName,
            'id': config.searchProduct? config.searchProduct + ':' + config.searchGuide + ':' + fileName : config.productId + ':' + fileName,
            'keywords': keywords
        };

        return item;
    };

    /**
     * Add item to one of the arrays and up the counter.
     * Dump array to file if break point is reached and reset the array.
     */
    var addItem = function (item, type) {
        // temporary adjustments:
        if (type === "docx") {
            module.docXItems.push(item);
            docXItemsCount++;
            if (module.docXItems.length === breakAt) {
                writeDocxFile();
                // -.-
                htmlContentParser = require('./lib/htmlContentParser.js');
                 //global.gc();
            }
        } else {
            module.items.push(item);
            itemsCount++;
            if (module.items.length === breakAt) {
                writeTopicsFile();
                 // -.-
                htmlContentParser = require('./lib/htmlContentParser.js');
                 //global.gc();
            }
        }
    };

    /** Writes a file to config.dest with the current module.items */
    var writeTopicsFile = function () {
        var dest = path.join(__dirname, config.dest) + files.length;
        //console.log('Writing ' + module.items.length + ' results to: ' + dest);
        fs.writeFileSync(dest, JSON.stringify(module.items));
        files.push({path: dest, url: config.postOptions.path});
        module.items = [];
    };

    /** Writes a file to config.destAPI with the current module.docXItems */
    var writeDocxFile = function () {
        var dest = path.join(__dirname, config.destAPI) + docXfiles.length;
        //console.log('Writing ' + module.docXItems.length + ' results to: ' + dest);
        fs.writeFileSync(dest, JSON.stringify(module.docXItems));
        docXfiles.push({path: dest, url: config.solrAPICollectionUrl});
        module.docXItems = [];
    };

    /**
     * Makes a Http post using the config postOptions
     * @param files Accepts an array with files. Last entry's content is sent to the sepecified path
     * @returns Returns a promise that resolves with the remaining files array
     */
    var httpPromiseWrap = function(files) {
        var file = files.pop();
        //this normally won't be hit with the current chain setup with for loop
        if (!file) return Promise.resolve();

        return new Promise(function(resolve, reject) {
            var postOptions = Object.assign({}, config.postOptions);
            postOptions.path = file.url;

            if (files.length) {
                // only optimize the very last send (reduce Solr load)
                postOptions.path = postOptions.path.replace("&optimize=true", "");
            }

            var fileContents = fs.readFileSync(file.path, 'utf-8');

            var request = http.request(postOptions, function(response) {           
                if (response.statusCode != 200) {
                    console.log('STATUS: ' + response.statusCode);
                    response.setEncoding('utf8');
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                else {
                    console.log('POST successful');
                }

                response.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                })

                //resolve with the file queue: 
                .on('end', () => resolve(files));
            });
            request.on('error', (err) => reject(err));
            console.log('Posting ' + file.path +  ' JSON to: ' + postOptions.hostname + postOptions.path);
            request.write(fileContents);
            request.end();
        });
    };

    var tags = [],
        files = [],
        docXfiles = [],
        itemsCount = 0,
        docXItemsCount = 0,
        failures = [];

    var isDirectory = function (name) {
        return name.indexOf('.') === -1;
    };

    var isHtmlTopic = function (name) {
        var ext = path.extname(name),
            ignoredFiles = /(web(toc|search|nav|index|frame)|_hierarchy|toc)\.html/i;
        if (ext === '.html' || ext === '.htm') {
            return !ignoredFiles.test(name);
        }
        return false;
    };

    var memoryLeakFix = function(data) {
        //From https://github.com/cheeriojs/cheerio/issues/830 / https://github.com/cheeriojs/cheerio/issues/263 / https://bugs.chromium.org/p/v8/issues/detail?id=2869
         //Convert result to strings, to drop all refences to leaky data.
        var str = JSON.stringify(data);
        //Be paranoid and modify string to force copy.
        str = (' ' + str).substr(1);

        // if(typeof global.gc !== 'function')
        // throw Error('You should expose GC, run Node with "--expose-gc".');
        // global.gc();

        return JSON.parse(str);
    };

    var readDirectory = function (directoryPath) {

        var names = fs.readdirSync(directoryPath), name;
        
        for (var i = 0; i < names.length; i++) {
             name = names[i];

            let contents,
                topic, item, fileName,
                fullPath = path.join(directoryPath, name);

            if (isDirectory(name)) {

                readDirectory(fullPath);

            } else if (isHtmlTopic(name)){

                contents = fs.readFileSync(fullPath, 'utf-8');
                //console.log("before parse", `${module.items.length}/${module.docXItems.length}`, `, ${process.memoryUsage().rss/1000} KB`);
                topic = memoryLeakFix(htmlContentParser.parseDocument(contents));
                //console.log("after parse, ", ` ${process.memoryUsage().rss/1000} KB`);

                // Use actual file name, meta entry optional for future reuse
                fileName = name.replace(/\.html?$/, "").toLowerCase();
                if (topic.metadata.fileName !== fileName) {
                    failures.push({
                        filePath: fullPath,
                        stack: '',
                        reason: 'Metadata: file name mismatch: ' + topic.metadata.fileName +  " actual: " + fileName
                    });
                }
                topic.metadata.fileName = fileName;
                if (!topic.title) {
                    failures.push({
                        filePath: fullPath,
                        stack: '',
                        reason: 'html missing title'
                    });
                }

                topic.metadata.fileName = topic.metadata.fileName; // URL encode?

                if (config.culture.toLowerCase() != 'en') {
                    if (topic.metadata.tags) {
                        localizeTags(topic.metadata);
                    } else {
                        console.log("WARN: Bad file metadata, missing tags!:", topic.metadata, name);
                    }
                }

                item = createItem(
                        fileName,
                        topic.title,
                        topic.content,
                        topic.metadata.controlName,
                        topic.metadata.tags);
                
                topic.content = '';

                // temporary adjustments:
                if (topic.type === "docx" && topic.subType === "Reference") {
                    item['ig_category'] = 'Help API Topic';
                    item['ig_api_member'] = topic.metadata.netAPINames;
                    addItem(item, topic.type);
                } else {
                    addItem(item);
                }
            }
        }
    };

    var logFailures = function (failures) {

        if (failures.length > 0) {
            var log = '', dt = new Date();
            
            console.log("WARN: Indexing failures: " + failures.length);
            
            failures.forEach(function (failure) {
                log += failure.reason + '\t' + failure.filePath + '\r\n';
                log += failure.stack + '\r\n';
                // TODO: return these for build log output.
                //console.log(failure.reason + '\t' + failure.filePath + '\r\n');
                //console.log(failure.stack + '\r\n');
            });

            var errorPath = path.join(__dirname, config.errorLogPath + path.sep);
            if (!fs.existsSync(errorPath)) {
                fs.mkdirSync(errorPath);
            }

            fs.writeFileSync(path.join(errorPath,
                'errors-' +
                dt.getFullYear() + '-' +
                dt.getMonth() + '-' +
                dt.getDay() + '-' +
                dt.getTime() +
                '.txt'), log);
        }
    };

    var localizeTags = function (json) {
        // lower all EN tags:
        for (var i = 0; i < json.tags.length; i++) {
            json.tags[i] = json.tags[i].toLowerCase();
        }

        var match = tags.filter(function (elem) {
            return json.tags.indexOf(elem.EN_NAME) >= 0;
        });

        /*var match = tags.filter(function (elem) {
            return json.tags.indexOf(elem.EN_NAME) >= 0;
        });*/

        if (match.length != json.tags.length) {
            console.log("WARN: Missing tags!", { found: match, required: json.tags});
        }

        json.tags = [];
        for (var i = 0; i < match.length; i++) {
            json.tags.push(match[i].JP_NAME);  
        }
    };

    var readLocalizedTags = function (success, error) {
        var tagsFile = path.join(__dirname, config.tagsFile);
        if (config.culture.toLowerCase() == 'en') {
            success();
            return;
        }
        try {
            parseString(fs.readFileSync(tagsFile, 'utf-8'), function (err, result) {
                if (err) {
                    failures.push({
                        filePath: tagsFile,
                        stack: err,
                        reason: 'xml parser'
                    });
                }
                else {
                    for (var i = 0; i < result.Tags.Tag.length; i++) {
                        // fix parsed objects
                        result.Tags.Tag[i].EN_NAME = result.Tags.Tag[i].EN_NAME[0].toLowerCase();
                        result.Tags.Tag[i][config.tagProperty] = result.Tags.Tag[i][config.tagProperty][0];
                    }
                    tags = result.Tags.Tag;
                }
                success();
            });
        }
        catch (e) {
            failures.push({
                filePath: tagsFile,
                stack: e ? e.stack : '',
                reason: 'missing/bad file.'
            });
            error();
        }
    };

    module.init = function (config, done, fail) {

        module.items = [];
        module.docXItems = [];
        // must create solr directory *before* loading modules that may need to log errors
		var dest = path.dirname(path.join(__dirname, config.dest));
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        productMetadata.get(config, function () {
            readLocalizedTags(done, fail);
        }, function () {
            failures.push({
                hasErrors: true,
                items: [],
                message: 'Cannot connect to Customer Guidance database.'
            });
            fail();
        });
    };

    module.indexSrcFiles = function () {
        // src can be array of folders to read from
        if (config.src instanceof Array) {
            for (var i = 0; i < config.src.length; i++) {
                if (!path.isAbsolute(config.src[i])) {
                    config.src[i] = path.join(__dirname, config.src[i]);
                }
                readDirectory(config.src[i]);
            }
        } else {
            if (!path.isAbsolute(config.src)) {
                config.src = path.join(__dirname, config.src);
            }
            readDirectory(config.src);
        }
        // dump remaining files:
        writeTopicsFile();
        writeDocxFile();
    };

    module.build = function (cg, done) {
        config = cg;
        module.init(config, function () {
            
            module.indexSrcFiles();
            
            logFailures(failures);
            done({
                hasErrors: failures.length > 0,
                itemsCount: itemsCount,
                docXItemsCount: docXItemsCount
            });
        }, function () {
            // error
            logFailures(failures);
            done({
                hasErrors: failures.length > 0,
                itemsCount: itemsCount,
                docXItemsCount: docXItemsCount
            });
        });
    };

    /**
     * Chains requests to submit all files recorded by the module Indexing
     * @return A promise that resolves when all requests finish
     */
    module.sendFiles = function () {
        var clone = files.slice(0).reverse();
        var docxClone = docXfiles.slice(0).reverse();

        // chain file requests:
        var chain = Promise.resolve(clone);
        
        var index;
        for (index = 0; index < files.length; index++) {
            chain = chain.then(function(files){
                return httpPromiseWrap(files);
            });
        }

        // swap to docXfiles
        chain = chain.then(function(files){
            return Promise.resolve(docxClone);
        });
        for (index = 0; index < docXfiles.length; index++) {
            chain = chain.then(function(files){
                return httpPromiseWrap(files);
            });
        }

        return chain;
    };

}(module.exports));