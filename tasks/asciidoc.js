module = module.exports;

const asciidoctor = require('asciidoctor.js')();
const opal = asciidoctor.Opal;
const cheerio = require('cheerio');
const include = require('./transforms/include');
const pickInlineMacro = require('./transforms/pickInlineMacro');
const processor = asciidoctor.Asciidoctor(true);

require('../common/regexp.js');

var options = opal.hash2(
    ['attributes'],
    {
        attributes: ['showtitle']
    });

var getMetadata = function (asciiDocContent) {
    var delimiter, startIndex, endIndex, metadata, result = '';

    delimiter = '|metadata|';
    startIndex = asciiDocContent.indexOf(delimiter);
    
    if(startIndex >= 0){
        startIndex += delimiter.length;
        endIndex = asciiDocContent.lastIndexOf(delimiter);
        metadata = asciiDocContent.substring(startIndex, endIndex);
    }

    if (metadata && metadata.length > 0) {
        result = '<!---\n' + delimiter + metadata + delimiter + '\n--->\n\n';
    }

    return result;
};

var adocRules = [
    {
        // TODO!!!!!!!!!!!!!
        description: 'Quick fix to normalize image paths from nested folders',
        apply: (content) => {
            return content.replace(/image::images\/(.+\/)+([^\/]+)\.(png|jpg|gif)\[/g, "image::images/$2.png[");
        }
    },
    {
        description: 'add toc option if macro exists in content',
        apply: (content) => {
            if(/toc::\[/g.test(content)){
                content = ':toc: macro\n\n' + content;
            }
            return content;
        }
    },
    {
        description: 'makes external links open in a new tab',
        apply: (content, args) => {
            var externalLinks = content.match(/link:https?:(.+?)\[(.+?)\]/gi);
            var regex;
            if (externalLinks) {
                externalLinks.forEach((link) => {
                    regex = new RegExp(RegExp.escape(link), 'gi');
                    content = content.replace(regex, link.replace(']', '^]'));
                });
            }

            return content;
        }
    },
    {
        description: 'include contents from via include macro',
        apply: (content, args) => {
            return include.apply(content, args.sourceFolder);
        }
    },
    {
        description: 'evaluate pick inline macro',
        apply: (content, args) => {
            return pickInlineMacro.apply(content, args.buildFlags);
        }
    },
    {
        description: 'reposition title to top of content and add build flags',
        apply: (content, args) => {
            const titlePattern = /(=.+)\n/;
            var title = '';
            var titleMatches = content.match(titlePattern);
            var buildFlagString = '';

            if(args.buildFlags && args.buildFlags.length > 0){
                buildFlagString = `:${args.buildFlags.join(':\n:')}:`;
            }

            if(titleMatches && titleMatches.length >= 1) {
                title = titleMatches[1];
                content = content.replace(titlePattern, '');
            }

            content = title + '\n' + buildFlagString  + '\n' + content;

            return content;
        }
    },
    {
        description: 'trim content',
        apply: (content) => {
            return content.trim();
        }
    }];

var htmlRules = [
    {
        description: 're-label AsciiDoc table of contents message',
        apply: ($) => {
            // make toc title H2 element
            $('#toctitle').html(`<h2>${$('#toctitle').text()}</h2>`);
            return $;
        }
    },
    {
        description: 'add table and table striped class to tables',
        apply: ($) => {
            $('table').addClass('table').addClass('table-striped');

            // don't add to AciiDoc "Note" tables
            $('.admonitionblock table').removeClass('table').removeClass('table-striped');
            return $;
        }
    },
    {
        description: 'customize anchor targets for non-relative links',
        apply: ($, args) => {

            $('a[href^=http]').each((index, anchor) => {
                var $a = $(anchor)
                  , href = $a.attr('href')
                ;

                if (/^https?:/.test(href)) {
                    $a.attr("target", "_blank");
                }
            });

            return $;
        }
    },
    {
        description: 'add styles to support horiz scrolling for large tables',
        apply: ($, args) => {
            $('table').each((idx, elem) => {
                $(elem).css('overflow-y', 'hidden');
                //  Contain tables in a proper container so they have full width.
                $("<div class='document-table-container'></div>").insertBefore(elem).html(elem);
            });
            return $;
        }
    }
];

module.convert = function (asciiDocContent, buildFlagList, version, sourceFolder) {
    var returnValue = '', metadata, html, $, args = {};

    var isFilePathPattern = /(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+/i;
    var isVersionNumberPattern = /[1-9]+\.?[0-9]?/;

    if(!isFilePathPattern.test(sourceFolder)) {
        throw new Error('Error: "sourceFolder" is not a valid file path. A file path is required to convert AsciiDoc to HTML.')
    }

    if(!isVersionNumberPattern.test(version)) {
        throw new Error('Error: "version" is not a valid version number. A version is required to convert AsciiDoc to HTML.')
    }

    if(asciiDocContent.length > 0) {

        if(typeof buildFlagList === 'undefined' || !buildFlagList) {
            buildFlagList = [];
        }

        metadata = getMetadata(asciiDocContent);

        args.sourceFolder = sourceFolder;
        args.buildFlags = buildFlagList;

        adocRules.forEach((rule) => {
            asciiDocContent = rule.apply(asciiDocContent, args);
        });

        html = opal.Asciidoctor.$convert(asciiDocContent, options);

        args = {};
        args.version = version;
        $ = cheerio.load(html);
        
        htmlRules.forEach((rule) => {
            $ = rule.apply($, args);
        });

        returnValue = metadata + $.html();

        // resolves issue where Cheerio replaces ~ with <sub>
        returnValue = returnValue.replace(/href="(.+)?"/gi, (match) => {
            return match.replace(/&lt;\/?sub&gt;/gi, '~');
        });
    }

    return returnValue;
};