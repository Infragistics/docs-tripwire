/*
 * grunt-markdown
 * https://github.com/treasonx/grunt-markdown
 *
 * Copyright (c) 2012 James Morrin
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';
  var noop = function(){};

  var path = require('path'),
      fs = require('fs'),
      iconv = require('iconv-lite');
        
  // After this call all Node basic primitives will understand iconv-lite encodings.
  //iconv.extendNodeEncodings();

  // Internal lib.
  var markdown = require('./lib/markdown').init(grunt);

  grunt.registerMultiTask('markdown', 'Compiles markdown files into html.', function(n) {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      htmlExtension: 'html',
      markdownExtension: 'md',
      markdownOptions: {},
      preCompile: noop,
      postCompile: noop,
      templateContext: {},
      template: path.join(__dirname, 'template.html')
    });

    var template = grunt.file.read(options.template);

    // Iterate over all specified file groups.
    grunt.util.async.forEachLimit(this.files, 25, function (file, next) {
        // added by Craig
        options.markdownOptions._fileName = path.basename(file.dest);
        // /added by craig
        convert(file.src, file.dest, next);
    }.bind(this), this.async());

    function convert(src, dest, next){
      var text = grunt.file.read(src);
      if (options.encoding != "utf-8") {
        //strip BOM or it will be encoded as '?'
        text = text.replace(/^\uFEFF/, '');
      }
      var content = markdown.markdown(
        text,
        options,
        template
      );

      if (options.encodeSpecialChars) {
        for (var key in options.encodeSpecialChars) {
          content = content.replace(new RegExp(key, "gi"), options.encodeSpecialChars[key]);
        }
      }

      if (options.encoding) {
        content = iconv.encode(content, options.encoding);
      };

      fs.writeFileSync(dest, content);
      grunt.log.writeln('File "' + dest + '" created.');
      process.nextTick(next);
    }
  });

};
