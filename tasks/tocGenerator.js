(function (module) {

    'use strict';

    String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
    };

    var fs = require('fs'),
        path = require('path'),
        _ = require('lodash'),
        arraySorter = require('./arraySorter'),
        args = require('yargs').argv;

    var getAbsolutePath = function(relativePath){
        return path.resolve(__dirname, relativePath);    
    };

    module.init = function (options) {

        if(!args.jsonFilePath) {
            if (!fs.existsSync(getAbsolutePath(options.src))) throw new Error('The source location does not exist: ' + options.src);
        }

        options.templates.forEach(function(template){
            if(!fs.existsSync(getAbsolutePath(template.src))) throw new Error('The source template location does not exist: ' + template.src);
        });

        options.encoding = options.encoding || 'utf-8';

        options.urlPrefix = options.urlPrefix || '';

        options.parentCharacter = options.parentCharacter || '~';

        options.dotToken = options.dotToken || '-DOT-';

        options.mvcTokenName = options.mvcTokenName || 'MVC_NODES';

        options.spaceToken = options.spaceToken || '-';

        options.verbose = options.verbose || false;

        options.orderByPropertyName = options.orderByPropertyName || 'orderBy';

        options.homePageFileName = options.homePageFileName || 'home-page.md';

        options.rootFolderName = options.rootFolderName || 'help';

        options.htmlElementRootId = options.htmlElementRootId || 'toc-tree';

        options.replaceFileExt = options.replaceFileExt !== undefined ? options.replaceFileExt : '.html';

        options.replaceVariables = options.replaceVariables || {};

        module.options = options;
    };

    module.toc = [];

    module.generate = function (jsonFileData) {

        var orderByPropertyName = module.options.orderByPropertyName;

        var isFileName = function(name){
            return name.indexOf('.') > -1;
        };

        var isDirectoryName = function(name){
            return name.indexOf('.') === -1;
        };

        var extractTitleFromFileContents = function(contents, ext){
            var header1;
            
            if(ext === '.adoc'){
                header1 = /^= (.*)$/m.exec(contents);                
            } else {
                header1 = /(?:\s|^) {0,3}#{1,2}[\t ]*([^\r\n]+)/.exec(contents);
            }
            
            if (header1 === null) {
                return "MISSING TITLE";
            }
            return header1[1].trim();
        };

        var stripOrderingNumbers = function(name){
            if(name.indexOf('_') > -1){
                var nameParts = name.split('_');
                if(!isNaN(nameParts[0])){
                    nameParts.shift();
                    name = nameParts.join('_');
                }
            }
            return name;
        };

        var stripClarificationBracket = function(name){
            // TODO: make ignores configurable
            if(name.indexOf("igRating") == 0) return name;
            return name.replace(/\s*\([^\)]+\)\s*$/, "");
        };


        var sanitizeTitle = function(title){

            title = stripOrderingNumbers(title);

            if(module.options.stripTitleBrackets) {
                title = stripClarificationBracket(title);
            }

            if(title.indexOf(module.options.dotToken) > -1){
                title = title.replace(eval('/' + module.options.dotToken + '/g'), '.');    
            }

            if(title.indexOf(module.options.spaceToken) > -1){
                title = title.replace(eval('/' + module.options.spaceToken + '/g'), ' ');
            }

            if (/\u2019/.test(title))
            {
                // Replace for right single quote with HTML apostrophe for offline CHM ( #227353 )
                title = title.replace(/\u2019/g, "'")
            }
        
            return title;    
        };

        var replaceVariables = function(text) {
             if (text.indexOf("%%") !== -1) {
                for (var key in module.options.replaceVariables){
                    var matcher = new RegExp("%%" + key + "%%", "g");
                    text = text.replace(matcher, module.options.replaceVariables[key]);
                }
            }
            return text;
        };

        var apiSuffixes = [
            'members',
            'ctor',
            'properties',
            'ev',
            'namespace',
            'methods'
        ];

        var sanitizeFileName = function(fileName){

            if(isFileNameOfParent(fileName)){
                fileName = fileName.substring(1);
            }

            fileName = stripOrderingNumbers(fileName);

            if(!isAPITopic(fileName)) {
                fileName = fileName
                        .replace(/_/g,'-')
                        .replace(/ /g,'-');
            } else {
                var parts = fileName.split('-');
                var suffix = parts[parts.length - 1];
                if(apiSuffixes.indexOf(suffix) > -1) {
                    fileName = fileName.replace('-' + suffix, '_' + suffix);
                }
            }

            fileName = fileName
                        .replace(/\.html(\?v=\d\d\.\d)?/, module.options.replaceFileExt)
                        .replace('.md', module.options.replaceFileExt)
                        .replace('.adoc', module.options.replaceFileExt);

            return fileName;
        };

        var getTitleFromFile = function(directoryName, fileName){
            var filePath, contents, ext;
            
            ext = path.extname(fileName);
         
            filePath = path.resolve(directoryName, fileName);
            contents = fs.readFileSync(filePath, module.options.encoding);  
            return extractTitleFromFileContents(contents, ext);
        };

        var isAPITopic = function(fileName) {
            /* Assembly (dll) patterns:
                Infragistics4.Web.jQuery.v16.2 (includes .html)
                Infragistics45.Web.v14.1
                Infragistics.Web.Mvc
                InfragisticsWPF4.v15.2
                Infragistics4.Win.XXXX~XX
                XXX~Infragistics.XXX

                So regex below requires at least two explicit dots (last could be the file ext)
            */
            return  fileName.indexOf("~") > -1 || /infragistics[a-z\d]*?\.[^\.]+\./i.test(fileName) || fileName === 'Drag and Drop.html';
        };

        var isFileNameOfParent = function(fileName){
            return fileName[0] === module.options.parentCharacter;
        };

        var isFileNameOfHomePage = function(fileName){
            return fileName === module.options.homePageFileName;  
        };

        var isDirectoryNameOfImages = function(directoryName){
            return directoryName === 'images';    
        };

        var createItem = function(title, fileName, orderBy){

            title = sanitizeTitle(title);

            //replace %% placeholders:
            title = replaceVariables(title);

            fileName = module.options.urlPrefix + sanitizeFileName(fileName);
            if(module.options.toLowerCase) fileName = fileName.toLowerCase();
            fileName = fileName + module.options.buildVersion;

            var item = {
                title: title,
                fileName: fileName,
                orderBy: orderBy.toLowerCase(),
                children: []  
            };

            if(module.options.verbose){
                console.log(item.fileName);    
            }

            return item;
        };

        var loadFromDirectory = function(directoryPath, currentLevel){

            var fileAndDirectoryNames, directoryNames, 
                fileNames, title, currentPath, orderBy,
                namesInDirectory, directoryFileNames, 
                parentFileName = 'unknown', newLevel;

            fileAndDirectoryNames = fs.readdirSync(directoryPath);

            directoryNames = fileAndDirectoryNames.filter(isDirectoryName);
            directoryNames.forEach(function(directoryName){

                if(isDirectoryNameOfImages(directoryName)) return;

                currentPath = directoryPath + path.sep + directoryName;

                namesInDirectory = fs.readdirSync(currentPath);

                directoryFileNames = namesInDirectory.filter(isFileName);

                var results = directoryFileNames.filter(function(fileName){
                    return isFileNameOfParent(fileName);
                });

                if(directoryFileNames.length > 0){
                    if(results.length > 0){
                        parentFileName = results[0];

                        title = getTitleFromFile(currentPath, parentFileName);
                    } else if(results.length === 0){
                        throw Error('There is no parent file in: ' + currentPath);
                    } else {
                        throw Error('More than one file is designated as a parent file in: ' + currentPath);
                    }
                }

                var item = createItem(title, parentFileName, directoryName);

                currentLevel.push(item);

                newLevel = currentLevel[currentLevel.length-1].children;

                loadFromDirectory(currentPath, newLevel);
            });

            fileNames = fileAndDirectoryNames.filter(isFileName);
            fileNames.forEach(function(fileName, i){

                if(isFileNameOfHomePage(fileName)) return;

                if(isFileNameOfParent(fileName)) return;

                orderBy = fileName;
                if (/\.link$/.test(fileName)) {
                    fileName = fs.readFileSync(path.resolve(directoryPath, fileName), module.options.encoding);
                }

                if (/MVC_API_Docs\.stub$/.test(fileName)) {
                    var item = createItem(module.options.mvcTokenName, fileName, orderBy);
                    currentLevel.push(item);
                    return;
                }

                title = getTitleFromFile(directoryPath, fileName);
                fileName = path.basename(fileName);

                var item = createItem(title, fileName, orderBy);

                currentLevel.push(item);

            });
           
        };

        var addIDAttributeToRootUL = function(result){
            return result.insert(3, ' id="' + module.options.htmlElementRootId + '"');   
        };
		
		function flattenLinksArray (array, flatArray){
			
			for (var i = 0; i< array.length; i++){
				if(array[i].children && array[i].children.length > 0){
					flattenLinksArray(array[i].children,flatArray);
				}
				flatArray.push({"title": array[i].title,"fileName": array[i].fileName});
			}
		}

        var writeTocToFiles = function(){
            module.options.dests.forEach(function(dest){
                dest = getAbsolutePath(dest);
                if (!fs.existsSync(path.dirname(dest))) ensureFolder(dest);
                fs.writeFileSync(dest, JSON.stringify(module.toc));
            });

            module.options.templates.forEach(function(template){

                var result;

                switch(template.output)
                {
                    case 'html':
                        _.listTemplateFn = _.template('<ul><% _.each(toc, function(item) {%>' +
                            '<li><a href="<%= item.fileName %>"><%= item.title %></a>' + 
                                '<% if(item.children && item.children.length > 0) {%>' +
                                    '<% _.each(item.children, function(item) {%>' + 
                                        '<%= _.listTemplateFn({ toc: [item], templateFn: _.listTemplateFn} )%>' +
                                   '<% }); %>' +
                                '<% } %>' +
                            '</li>' +
                        '<%});%></ul>');

                        result = _.listTemplateFn( {toc: module.toc, templateFn: _.listTemplateFn} );

                        //result = addIDAttributeToRootUL(result);

                        break;
						
					case 'xml':
						var flattenlinks = [];
						flattenLinksArray(module.toc, flattenlinks);
						

						var xmlTemplate = _.template('<% _.each(toc, function(item){%>'+
						'<url><loc><%= helpRootUrl %><%= item.fileName%></loc></url>\n<%});%>');

                        result = xmlTemplate( {helpRootUrl: module.options.helpRootUrl, toc: flattenlinks , templateFn: xmlTemplate} );
						break;

					case 'xml-toc':
                         _.listTemplateFn = _.template('<% _.each(toc, function(item) {%>' +
                            '<HelpTOCNode Title="<%- item.title %>" Url="<%= item.fileName %>">' + 
                                '<% if(item.children && item.children.length > 0) {%>' +
                                    '<% _.each(item.children, function(item) {%>' + 
                                        '<%= _.listTemplateFn({ toc: [item], templateFn: _.listTemplateFn} )%>' +
                                   '<% }); %>' +
                                '<% } %>' +
                            '</HelpTOCNode>' +
                        '<%});%>');

                        result = _.listTemplateFn( {toc: module.toc, templateFn: _.listTemplateFn} );
                        break;	
                    case 'json':
					
					
                    default:
                        result = JSON.stringify(module.toc);
                        break;
                }

                var src = fs.readFileSync(getAbsolutePath(template.src), module.options.encoding);

                src = src.replace(template.token, result);
                
                template.dests.forEach(function(destination){
                    destination = getAbsolutePath(destination);
                    if (!fs.existsSync(path.dirname(destination))) ensureFolder(destination);
                    fs.writeFileSync(destination, src, module.options.encoding);
                });
            });
        };

        function ensureFolder (dest) {
            // current + 1 lvl up...
            try{
                fs.mkdirSync(path.dirname(dest))
            } catch (e) {
                fs.mkdirSync(path.dirname(path.dirname(dest)));
                fs.mkdirSync(path.dirname(dest));
            }
        }

        function MVCtoc() {   
             if (!module.options.includeMvcAPI) return;

             var path = require('path');
             var fullPath = path.join(__dirname, module.options.mvcToc);

             var parseString = require('xml2js').parseString;
             var toc =  fs.readFileSync(fullPath, module.options.encoding); 

             //var fullToc = grunt.file.readJSON(jsonToc);

             parseString(toc, function (err, result) {

                var initTopics = result.HelpTOC.HelpTOCNode;//[0].HelpTOCNode;
                var array = new Array();

                formatter(initTopics, "");
                mvcNode (module, initTopics);
               
             });
        }

        function mvcNode (toc, newToc) {
            var prop = 'children' in toc ? 'children' : 'toc'
            for (var i = 0; i < toc[prop].length; i++) {
                if(toc[prop][i].title == module.options.mvcTokenName){
                    var mvcToc = toc[prop].slice(0,i).concat(newToc).concat(toc[prop].slice(i + 1, toc[prop].length));
                    toc[prop].length = 0;
                    toc[prop] = toc[prop].concat(mvcToc);
                    return;
                }
                else if (toc[prop][i].children && toc[prop][i].children.length ){
                    mvcNode(toc[prop][i], newToc);                    
                }
             };
        }

        function formatter(topics, parentNode){
            for (var i = 0; i < topics.length; i++) {
                if(!topics[i].$.Url) {
                    var test;
                    topics[i].$.Url = parentNode;
                }
                topics[i].title = topics[i].$.Title;
                var fileName = module.options.urlPrefix + topics[i].$.Url;
                if(module.options.toLowerCase) fileName = fileName.toLowerCase();
                topics[i].fileName = fileName.replace(/\.html$/i, module.options.replaceFileExt) + module.options.buildVersion;

                if(topics[i].HelpTOCNode){
                  topics[i].children = topics[i].HelpTOCNode;
                  formatter(topics[i].HelpTOCNode,topics[i].$.Url);
                }
                else{
                  topics[i].children = null;
                }

                delete topics[i].$;
                delete topics[i].HelpTOCNode;
            };
         }

        var formatFileName = (fileName) => {
            fileName = module.options.urlPrefix + sanitizeFileName(fileName);
            if (module.options.toLowerCase && !isAPITopic(fileName)) {
                fileName = fileName.toLowerCase();
            }
            fileName = fileName + module.options.buildVersion;
            return fileName;
        };

        var formatFileNamesInCollection = (items) => {
            items.forEach((item) => {
                if (item.fileName) {
                    item.fileName = formatFileName(item.fileName);
                }

                if (item.children && item.children.length > 0) {
                    formatFileNamesInCollection(item.children);
                }
            });
        };


        try{

            if(!jsonFileData){
                module.toc = [];
                loadFromDirectory(getAbsolutePath(module.options.src), module.toc);

                arraySorter.sort(module.toc, orderByPropertyName);

                //MVC Api Doc
                MVCtoc();

                writeTocToFiles();
            } else {
                module.toc = jsonFileData;
                formatFileNamesInCollection(module.toc);
                writeTocToFiles();
            }

        } catch(e){
            throw new Error(e);
        }

    };

    return module;

}(module.exports));