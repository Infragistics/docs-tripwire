/* marked Renderer config */
var marked = require('marked')
var _ = require('lodash');
var renderer = new marked.Renderer();

var renderTable = function(header, body){
  return '<div class="document-table-container">\n<table class="table table-striped">\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n</div>\n';
};

var renderHeading = function(text, level, raw, options) {
  return '<h'
    + level
    //+ ' id="'
    // + options.headerPrefix
    // + raw.toLowerCase().replace(/[^\w]+/g, '-')
    //+ '">'
    + '>'
    + text
    + '</h'
    + level
    + '>\n';
};

var renderLink = function(href, title, text){
    title = title || text.replace(/<\/{0,1}(.|\n)*?>/g, "");
    var o = this.options,
            target = "", leftover = "";

    if (/”$/.test(href)) {
        // patch ending curly quote (auto-link gfm parsing bug)
        leftover = href.substring(href.length - 1);
        href = title = text = href.substring(0, href.length - 1);
    }

    if (o.links && o.links.replaceFileExt !== undefined) {
        if (/^[^\\\/:~`]+.html(#[^\/]+)?$/.test(href)) {
           href = href.replace('.html', o.links.replaceFileExt);
           if(o.links.toLower)  {
            parts = href.split("#");
            parts[0] = parts[0].toLowerCase();
            href = parts.join("#");
          }
        }       
        o._fileName = o._fileName.replace('.html', o.links.replaceFileExt);

        // if (o.buildVersion && /^[^#\\\/:]+$/.test(href)) {
        //     //only use on local links (MVC included though)
        //     href += "?v=" + o.buildVersion;
        // }
    }

    if(href[0] === '#'){
        if (o.links && o.links.toLower)  o._fileName = o._fileName.toLowerCase();
        // if (o.buildVersion) href = "?v=" + o.buildVersion + href;
        href = o._fileName + href;
    }  
    if (/^https?:/.test(href)) {
        target = ' target="_blank"';
    }

    return '<a href="' + href + '" title="' + title + '"' + target + '>' + text + '</a>' + leftover;
};

var renderImage = function(href, title, text) {
  //detect images ending in images/<file> pattern
  var match;
  if (match = /^(?!\s*http)[^"']+images\/([^"'\/]+\.(?:png|gif|jpg))\s*$/i.exec(href)) {
    // normalize relative path
    href = "images/" + match[1];
  }
  // if (this.options.buildVersion){
  //   href = href.replace(/^images\//, this.options.buildVersion + "/" + "images/");
  // }

  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += ' class="img-responsive" ';
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

var renderCode = function(code, lang, escaped) {

  /* override native escape!, this one is marked ver */
  function escape(html, encode) {
    return html
      .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out.value != null && out.value !== code) {
      escaped = true;
      code = out.value;
    }
    lang = lang || out.language;
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

renderer.heading = renderHeading;
renderer.table = renderTable;
renderer.link = renderLink;
//TODO: Take into export and make it conditional based on target after Grunt version is updated
renderer.image = renderImage;
renderer.code = renderCode;

renderer.html = function(html){
    if(/^\s*\<table[\s\S]+\<\/table\>\s*$/.test(html)){
      html = '<div class="document-table-container">\n' + html + '</div>\n';
    }
    // normalize relative path, markdown images come as html with verison prefix at this point, skip them!
    html = html.replace(/(\<img.*?src=["'](?!http|\d\d\.\d))[^"']+(images\/[^"'\/]+\.(?:png|gif|jpg)["'])/gi, "$1$2");

    if (this.options.buildVersion){
      html = html.replace(/(\<img.*?src=["'])(?!\s*http)(images\/[^"'\/]+["'])/gi, "$1" + this.options.buildVersion + "/$2");
    }
    return html;
}

module.exports =  function (grunt) {
  var file = grunt.option('fileInfo') && grunt.option('fileInfo').cleanFileName || "*";
  return {    
    offline: {
        files: [
            {
              expand: true,
              src: 'topic-files/' + file + '.md',
              dest: 'offline/Tripwire.Offline/help/',
              ext: '.html',
              flatten: true,
              extDot: 'last'
            }
          ],
        options: { 
          template: 'offline/templates/multiproduct/template/topic-' + grunt.option('lang') + '.html',
          encoding: "<%= encoding %>",
          encodeSpecialChars: {
            "™" :  "&trade;",
            "®" :  "&reg;",
            "©" :  "&copy;",
            "•​" : "&#8226;",
            "–" : "-",
            "^\\uFEFF" : "" // Strip UTF-8 BOM
          },
          markdownOptions : {
            renderer: renderer,
            links: {
              toLower: false
            },
            highlight: 'auto'
          }
        }
    },
    
    online: {
        files: [
            {
              expand: true,
              cwd: 'topic-files/',
              src: file + '.md',
              dest: 'online/Tripwire.Web/help/<%= major %>.<%= minor %>/',
              ext: '.html',
              extDot: 'last'
            }
          ],
        options: { 
          template: 'online/templates/content-template.html',
          markdownOptions : {
            renderer: renderer,
            links: {
              replaceFileExt: "",
              toLower: true
            },
            highlight: 'auto',
            //buildVersion: grunt.option('latest') ? "" : '<%= major %>.<%= minor %>'
            buildVersion:""
          }
        }
    }
  };
};