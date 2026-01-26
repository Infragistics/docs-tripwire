/*
* Cleans badly formatted links in the *source* topics
* Encodes parentheses [and sanitizes underscores and spaces]
*/

module.exports = function(grunt) {
   
    'use strict';
    
    grunt.config.merge({"fixContent": {
        sourceFolder: "../topics"
    }});

    grunt.registerMultiTask('fixContent', 'Fixes links and image sources pointing to file names with parenthesis.', function() {
        //fenceCodeSnippets(this.data);
        //cleanExtraNewLines(this.data);
		    //changeHeadingFormat(this.data);
        //updateMetadata(this.data);
        //moveImages(this.data);
        //duplicateImages(this.data);
        countSnippets(this.data);
    });

    /* 
     * Goes through all files using marked.js lexer to find code blocks and put them in fences
     * Warning: Do not run on files with fenced code already, will wrap them again
     * TODO: Add check to regex matcher to attempt and avoid already good snippets
     */
    var fenceCodeSnippets  = function(sourceFolder){

      var marked = require('marked'),
            path = require('path'),
            matches = 0;
        
        marked.setOptions({gfm: false}); // to ignore already fenced codes
       
        var rootPath = path.resolve(__dirname, sourceFolder);

        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        grunt.file.recurse(rootPath, callback);

        function callback(abspath, rootdir, subdir, filename) {
            // Skip images
          if (!/^.*\.md$/.test(filename)) return;
          var tempSrc = "",
              lastPos = 0;
          var src = grunt.file.read(abspath);
          // take block level code snippets (before inline parsing):
          var tokens = marked.lexer(src);

          for (var i = 0; i < tokens.length; i++) {
              if(tokens[i].type == "code")
              {
              
                var lines  = tokens[i].text.match(/\n/g) ? tokens[i].text.match(/\n/g).length : 0;
                var firstLine = tokens[i].text.split("\n")[0].trim();

                var matcher = new RegExp("([\\t ]*)(?:\\t|    )(\\s{0,3}" + escapeRegExp(firstLine) + ")" );
                var start = src.search(matcher);
                tempSrc += src.substring(0, start);
                if (lines) matcher = new RegExp(matcher.source.substring(0, matcher.source.length - 1) + "(?:[\\t ]*\\r\\n[^\\r\\n]*){" + lines + "})");

                var match = matcher.exec(src);
                var extraWhiteSpace = match[1] || "";
                // add new lines and ```, take one tab back 
                var resulting = extraWhiteSpace + "```\r\n" + extraWhiteSpace + match[2].replace(/\r\n(?:\t|    )/g, "\r\n") + "\r\n" + extraWhiteSpace + "```";

                src = src.replace(match[0], resulting);
                // transfer proccessed parts to temp holding:
                tempSrc += src.substring(start, start + resulting.length);
                src = src.substring(start + resulting.length, src.length);
              }
          };
          if(matches > 0) 
            { 
                src = tempSrc + src;
                grunt.file.write(abspath, src);
                if (src.match(/```[^\r\n]*\r\n/g).length != matches*2) {
                  grunt.log.writeln(('Error in: ' + abspath).cyan);
                  grunt.log.writeln(('Presumed matches: ' + matches).cyan);
                }                
            }
          matches = 0;
        }
    }

    /*
     * Goes through all files using marked.js lexer to text that has extra new lines and removes them.
     */
    var cleanExtraNewLines  = function(sourceFolder){
      debugger;
      var marked = require('marked'),
            path = require('path'), 
            matches = 0
        ;
               
        var rootPath = path.resolve(__dirname, sourceFolder);

        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        marked.setOptions({gfm: true});   
        grunt.file.recurse(rootPath, callback);

        function callback(abspath, rootdir, subdir, filename) {
          //skip images
          if (!/^.*\.md$/.test(filename)) return;

          var src = grunt.file.read(abspath);
          var tokens = marked.lexer(src);

          for (var i = 0; i < tokens.length; i++) {
              if(tokens[i].type == "paragraph" || tokens[i].type == 'text')
              {
                if (/\n/.test(tokens[i].text) && !/<!--[\s\S]*?-->/.test(tokens[i].text)) {
                  // find the paragraph and replace new lines
                  var matcher = new RegExp(escapeRegExp(tokens[i].text.trim()).split("\n").join("\\s*?"), "g");
                  var match = matcher.exec(src);
                  if (match) {
                    match = match[0];
                    src = src.replace(match, tokens[i].text.trim().split("\n").join(" "));
                    matches++;
                  }
                }
              }
              if(tokens[i].type == "list_item_start" || tokens[i].type == "loose_item_start")
              {
                //merge text nodes until "list_item_end"
                var textBlock = [];
                while ((tokens[i].type != "list_item_end" && tokens[i].type != "list_end" && tokens[i].type != "list_start")){
                  if(tokens[i].type == 'text' && (tokens[i - 1].type == 'text' || (tokens[i + 1] && tokens[i + 1].type == 'text')))
                  {
                    // line break!
                    textBlock.push(escapeRegExp(tokens[i].text.trim()));
                  }
                  else{
                    if (textBlock.length) {
                      // find original text with line breaks and replace 
                      var matcher = new RegExp(textBlock.join("\\s*?"), "g");
                      var match = matcher.exec(src);
                      if (match) {
                        match = match[0];
                        src = src.replace(matcher, match.replace(/\r\n\s*/g, " "));
                        matches++;
                      }
                    }
                  }
                  i++;
                }
                if (textBlock.length) {
                  // find original text with line breaks and replace 
                  var matcher = new RegExp(textBlock.join("\\s*?"), "g");
                  var match = matcher.exec(src);
                  if (match) {
                    match = match[0];
                    src = src.replace(matcher, match.replace(/\r\n\s*/g, " "));
                    matches++;
                  }
                }
              }
              
          };
          if(matches > 0) 
            { 
                grunt.file.write(abspath, src);           
            }
          matches = 0;    
        }
    }

    /*
     * Goes through all files using marked.js lexer, looks for images and moves them ina local images folder next to each file.
     */
    var moveImages  = function(sourceFolder){
      var aliases = {
        "positive.png" : [
          "04_igRatingKnownIssues_1.png",
          "09_igRatingKnownIssues_1.png",
          "igDataChart_Known_Issues_and_Limitaions_1.png",
          "igDataChart_Overview_10.png",
          "igFunnelChart_Overview_%28Control_Overview%29_6.png",
          "igGrid_CellMerging_Event_Reference_1.png",
          "igGrid_ColumnFixing_Overview_2.png",
          "igGrid_ColumnMoving_Overview_2.png",
          "igGrid_Feature_compatibility_matrix_1.png",
          "igGrid_Moving_Columns_Programmatically_1.png",
          "igListView_Known_issues_and_limitations_1.png",
          "igPieChart_Overview_11.png",
          "igSplitter_Overview_10.png",
          "igTree_Drag-and-Drop_Events_API_Reference_1.png",
          "igZoombar_Known_issues_and_limitations_1.png",
          "igZoombar_Overview_3.png",
          "Known_Issues_and_Limitations_Solution.png",
          "Row_Selector_Events_2.png",
          "UnboundColumns_Known_Issues_1.png"

        ],
        "negative.png": [
          "04_igRatingKnownIssues_2.png",
          "09_igRatingKnownIssues_2.png",
          "igGrid_CellMerging_Event_Reference_2.png",
          "igGrid_ColumnMoving_Overview_1.png",
          "igGrid_Feature_compatibility_matrix_61.png",
          "igDataChart_Known_Issues_and_Limitaions_2.png",
          "igGrid_Moving_Columns_Programmatically_3.png",
          "igListView_Known_issues_and_limitations_2.png",
          "igTree_Drag-and-Drop_Events_API_Reference_2.png",
          "igZoombar_Known_issues_and_limitations_2.png",
          "igZoombar_Overview_4.png",
          "Known_Issues_and_Limitations_NoSolution.png",
          "Row_Selector_Events_1.png",
          "UnboundColumns_Known_Issues_2.png"
        ],
        "plannedfix.png": [
          "04_igRatingKnownIssues_3.png",
          "09_igRatingKnownIssues_3.png",
          "igGrid_Feature_compatibility_matrix_16.png",
          "igDataChart_Known_Issues_and_Limitaions_3.png",
          "igListView_Known_issues_and_limitations_3.png",
          "igZoombar_Known_issues_and_limitations_3.png",
          "Known_Issues_and_Limitations_FixPlanned.png",
          "UnboundColumns_Known_Issues_3.png",
          "tobeUpdated.png"
        ]
      };
      var commonImages = [
        // CSS folders structure:
        "jquery_grid_styling_and_theming_2011.2_1.png",
        // Used in known issues, tables with cancellable/configurable API:
        "positive.png",
        // Used in known issues, tables with cancellable/configurable API:
        "negative.png",
        // Used in known issues:
        "plannedfix.png",
        // Used in Accessibility Compliance topics:
        "greencheck.png",
        // Used in Accessibility Compliance topics":
        "redx.png" ,
        "landing-api-docs.png",
        "landing-start.png"
      ];
      var path = require('path'), 
          rootPath = path.resolve(__dirname, sourceFolder);

        var imagesRootPath =  path.join(rootPath, "images/images");
        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        var counter = 0, fileCounter = 0; 
        var images = { error: [] }, repeats = {};

        grunt.file.recurse(rootPath, callback);
        function callback(abspath, rootdir, subdir, filename) {
          //skip images
          if (!/^.*\.md$/.test(filename)) return;
          fileCounter++;

          var src = grunt.file.read(abspath);
          var image = /\!\[[^\]]*\]\(\s*images\/([^"'\)]+)\s*(?:["][^"\)]+["])?\s*\)/gi;
          var mdMatch, htmlMatch, folderPath = path.join(rootdir, subdir || "");
          while (mdMatch =  image.exec(src)) {
              // for images with %28 brackets
            var imageFile = decodeURIComponent(mdMatch[1]).trim().toLowerCase();
            var currPath = path.join(imagesRootPath, imageFile);
            if (!grunt.file.exists(currPath)) {
            //if (false) {
              console.log("amg not existing: ", currPath);
              images.error.push({missingImage: currPath, file: abspath});
            }
            else{
              if (commonImages.indexOf(imageFile) != -1) {
                var relativePath = path.relative( folderPath, currPath);
                // ensure URI style
                relativePath = relativePath.replace(/\\/g, "\/");

                if (!images.hasOwnProperty(imageFile)) {
                  images[imageFile] = {};
                }

                if (!images[imageFile].hasOwnProperty(abspath)) {

                    // Single replace only:
                    var matcher = new RegExp("images\/" + imageFile , "gi");
                    //keep path with original image name
                    relativePath = relativePath.replace(matcher, "images/" + decodeURIComponent(mdMatch[1]).trim());
                    src = src.replace(matcher, relativePath);
                    //grunt.file.write(abspath, src);
                    images[imageFile][abspath] = 1;
                }
                else {
                    images[imageFile][abspath]++;
                }
              }
              else {
                var target = path.join(folderPath, 'images', imageFile );
                if (!grunt.file.exists(target)) {
                  grunt.file.copy(currPath, target);
                  counter++;
                }
              }
            }
          }

          var image2 = /\<img.*?src="images\/([^"']+)/ig;
            
          while (htmlMatch =  image2.exec(src)) {
            var imageFile = decodeURIComponent(htmlMatch[1]).trim().toLowerCase();
            var currPath = path.join(imagesRootPath, imageFile);
            if (!grunt.file.exists(currPath)) {
            //if (false) {
              console.log("amg not existing: ", currPath);
              images.error.push({missingImage: currPath, file: abspath});
            }
            else{

              if (commonImages.indexOf(imageFile) != -1) {
                var relativePath = path.relative( folderPath, currPath);
                // ensure URI style
                relativePath = relativePath.replace(/\\/g, "\/");

                if (!images.hasOwnProperty(imageFile)) {
                  images[imageFile] = {};
                }

                if (!images[imageFile].hasOwnProperty(abspath)) {

                    // Single replace only:
                    var matcher = new RegExp("images\/" + imageFile , "gi");
                    relativePath = relativePath.replace(matcher, "images/" + decodeURIComponent(htmlMatch[1]).trim());
                    src = src.replace(matcher, relativePath);
                    //grunt.file.write(abspath, src);
                    images[imageFile][abspath] = 1;
                }
                else {
                    images[imageFile][abspath]++;
                }
              }
              else {
                var target = path.join(folderPath, 'images', imageFile );
                if (!grunt.file.exists(target)) {
                  grunt.file.copy(currPath, target);
                  counter++;
                }
              }
            }
          }
          grunt.file.write(abspath, src);
        }

        console.log(counter);
        console.log("-------");
        console.log(fileCounter);
        grunt.file.write("C:\\temp\\imageslog.txt", JSON.stringify(images));
    }

    /* Looks for duplicate images */
    var duplicateImages  = function(sourceFolder){
      var aliases = {
        "positive.png" : [
          "04_igRatingKnownIssues_1.png",
          "09_igRatingKnownIssues_1.png",
          "igDataChart_Known_Issues_and_Limitaions_1.png",
          "igDataChart_Overview_10.png",
          "igFunnelChart_Overview_%28Control_Overview%29_6.png",
          "igGrid_CellMerging_Event_Reference_1.png",
          "igGrid_ColumnFixing_Overview_2.png",
          "igGrid_ColumnMoving_Overview_2.png",
          "igGrid_Feature_compatibility_matrix_1.png",
          "igGrid_Moving_Columns_Programmatically_1.png",
          "igListView_Known_issues_and_limitations_1.png",
          "igPieChart_Overview_11.png",
          "igSplitter_Overview_10.png",
          "igTree_Drag-and-Drop_Events_API_Reference_1.png",
          "igZoombar_Known_issues_and_limitations_1.png",
          "igZoombar_Overview_3.png",
          "Known_Issues_and_Limitations_Solution.png",
          "Row_Selector_Events_2.png",
          "UnboundColumns_Known_Issues_1.png"

        ],
        "negative.png": [
          "04_igRatingKnownIssues_2.png",
          "09_igRatingKnownIssues_2.png",
          "igGrid_CellMerging_Event_Reference_2.png",
          "igGrid_ColumnMoving_Overview_1.png",
          "igGrid_Feature_compatibility_matrix_61.png",
          "igDataChart_Known_Issues_and_Limitaions_2.png",
          "igGrid_Moving_Columns_Programmatically_3.png",
          "igListView_Known_issues_and_limitations_2.png",
          "igTree_Drag-and-Drop_Events_API_Reference_2.png",
          "igZoombar_Known_issues_and_limitations_2.png",
          "igZoombar_Overview_4.png",
          "Known_Issues_and_Limitations_NoSolution.png",
          "Row_Selector_Events_1.png",
          "UnboundColumns_Known_Issues_2.png"
        ],
        "plannedfix.png": [
          "04_igRatingKnownIssues_3.png",
          "09_igRatingKnownIssues_3.png",
          "igGrid_Feature_compatibility_matrix_16.png",
          "igDataChart_Known_Issues_and_Limitaions_3.png",
          "igListView_Known_issues_and_limitations_3.png",
          "igZoombar_Known_issues_and_limitations_3.png",
          "Known_Issues_and_Limitations_FixPlanned.png",
          "UnboundColumns_Known_Issues_3.png",
          "tobeUpdated.png"
        ]
      };
      var commonImages = [
        // CSS folders structure:
        "jQuery_Grid_Styling_and_Theming_2011.2_1.png",
        // Used in known issues, tables with cancellable/configurable API:
        "positive.png",
        // Used in known issues, tables with cancellable/configurable API:
        "negative.png",
        // Used in known issues:
        "plannedFix.png",
        // Used in Accessibility Compliance topics:
        "greenCheck.png",
        // Used in Accessibility Compliance topics":
        "redX.png" 
      ];
      var path = require('path'),
          rootPath = path.resolve(__dirname, sourceFolder);

        var imagesRootPath =  path.join(rootPath, "images/images");
        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        var counter = 0, fileCounter = 0;  
        var images = { error: [] }, repeats = {};

        grunt.file.recurse(rootPath, callback);
        function callback(abspath, rootdir, subdir, filename) {
          //skip images
          if (!/^.*\.md$/.test(filename)) return;
          fileCounter++;

          var src = grunt.file.read(abspath);
          var image = /\!\[[^\]]*\]\(\s*images\/([^"'\)]+)\s*(?:["][^"\)]+["])?\s*\)/g;
          var mdMatch, htmlMatch, folderPath = path.join(rootdir, subdir || "");
          while (mdMatch =  image.exec(src)) {
              if (commonImages.indexOf(mdMatch[1]) != -1) {
                continue;
              }
              counter++;
              if (images.hasOwnProperty(mdMatch[1]) && images[mdMatch[1]] != folderPath) {
                  if (repeats.hasOwnProperty(mdMatch[1])) {
                     if (!repeats[mdMatch[1]].hasOwnProperty(abspath)) {
                          repeats[mdMatch[1]][abspath] = 1;
                      }
                      repeats[mdMatch[1]][abspath]++;
                  }
                  else {
                      repeats[mdMatch[1]] = {};
                      repeats[mdMatch[1]][abspath] = 1;
                  }
              }
              else {
                images[mdMatch[1]] = folderPath;
              }
          }

          var image2 = /\<img.*?src="images\/([^"']+)/ig;
            
           while (htmlMatch =  image2.exec(src)) {
              if (commonImages.indexOf(htmlMatch[1]) != -1) {
                continue;
              }
              counter++;
               if (images.hasOwnProperty(htmlMatch[1]) && images[htmlMatch[1]] != folderPath) {
                  if (repeats.hasOwnProperty(htmlMatch[1])) {
                     if (!repeats[htmlMatch[1]].hasOwnProperty(abspath)) {
                          repeats[htmlMatch[1]][abspath] = 1;
                      }
                      repeats[htmlMatch[1]][abspath]++;
                  }
                  else {
                      repeats[htmlMatch[1]] = {};
                      repeats[htmlMatch[1]][abspath] = 1;
                  }
              }
              else {
                images[htmlMatch[1]] = folderPath;
              }
          }
        }

        console.log(counter);
        console.log("-------");
        console.log(fileCounter);
        grunt.file.write("C:\\temp\\imageslog.txt", JSON.stringify(repeats));
    }

    /* Counts snippets and the number of each type (like ** In C#: **) */
    var countSnippets  = function(sourceFolder){
      debugger;
      var marked = require('marked'),
            path = require('path'), 
            matches = 0
        ;
               
        var rootPath = path.resolve(__dirname, sourceFolder);

        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        var counter = 0, fileCounter = 0;
        marked.setOptions({gfm: true});   
        var repeats = {};
        
        grunt.file.recurse(rootPath, callback);
        function callback(abspath, rootdir, subdir, filename) {
          //skip images
          if (!/^.*\.md$/.test(filename)) return;
          fileCounter++;

          var src = grunt.file.read(abspath);
         
          var image = /\*\*\s*([^\:\*]*\:\s*)\*\*[\r\n\s]*```/g;
          var match;
          while (match =  image.exec(src)) {
              counter++;
              if (repeats.hasOwnProperty(match[1])) {
                      repeats[match[1]]++;
              }
              else {
                  repeats[match[1]] = 1;
              }
          }
        }

        console.log(counter);
        console.log("-------");
        console.log(fileCounter);
        grunt.file.write("C:\\temp\\sniplog.txt", JSON.stringify(repeats));
    }

    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
	
	var changeHeadingFormat  = function(sourceFolder){
		debugger;
      var marked = require('marked'),
            path = require('path'), 
            matches = 0
        ;
         marked.setOptions({gfm: true});     
        var rootPath = path.resolve(__dirname, sourceFolder);

        if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
        grunt.file.defaultEncoding = 'utf8';
        grunt.file.preserveBOM = true;

        grunt.file.recurse(rootPath, callback);
		
		  function callback(abspath, rootdir, subdir, filename) {
        //skip images
        if (!/^.*\.md$/.test(filename)) return;

        var src = grunt.file.read(abspath);
        var tokens = marked.lexer(src);

        for (var i = 0; i < tokens.length; i++) {
            if(tokens[i].type == "heading") {
              var matcher = new RegExp(escapeRegExp(tokens[i].text.trim()) + "\r\n[-=]{2,}\s*?\r\n" , "g");
			       var match = matcher.exec(src);
                if (match) {
                  match = match[0];
				var sharps = "##";
                  src = src.replace(match, sharps + " " + tokens[i].text.replace(/\{\#.*?\}/,""));
				matches++;
                }
  			if(/\{\#.*?\}/.test(tokens[i].text)){
  				src = src.replace(tokens[i].text, tokens[i].text.replace(/\{\#.*?\}/,""));
  				matches++;
  			}
            }			           
        };
        if(matches > 0) 
          { 
              grunt.file.write(abspath, src);           
          }
        matches = 0;    
      }
	};

  var updateMetadata = function(sourceFolder){
    var path = require('path'), 
        productMetadata = require('./productMetadata.js');
          
    var rootPath = path.resolve(__dirname, sourceFolder);

    if (!grunt.file.isDir(rootPath)) throw new Error('The source location does not exist: ' + rootPath);
    grunt.file.defaultEncoding = 'utf8';
    grunt.file.preserveBOM = true;
    
    grunt.file.recurse(rootPath, callback);

    function callback(abspath, rootdir, subdir, filename) {
      //skip images
      if (!/^.*\.md$/.test(filename)) return;

      var src = grunt.file.read(abspath);
      var parts = src.split('|metadata|');
      var metadata = parts[1] && JSON.parse(parts[1]);

      /*if(metadata && metadata.tags) 
      {
        for (var i in metadata.tags){
            var match = module.tags.filter(function (elem) {
                return elem.EN_NAME == metadata.tags[i];
            });
            if (match.length === 0 ) {
              console.log("NOES, tag not found: " + metadata.tags[i], abspath);
            };
        }
        var newFileName = metadata.fileName.toLowerCase().trim();
        newFileName = grunt.stripOrderingNumbers(newFileName);
        newFileName = grunt.replaceUnderscoreWithDash(newFileName);
        newFileName = grunt.replaceSpaceWithDash(newFileName);

        parts[1] = parts[1].replace(metadata.fileName, newFileName); // "\r\n" + JSON.stringify(metadata, null, 4).replace("\n", "\r\n") + "\r\n";
        src = parts.join('|metadata|');
        grunt.file.write(abspath, src);          
      }*/
    }
  }
};