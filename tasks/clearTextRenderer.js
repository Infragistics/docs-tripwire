/*
 * Strips out all HTML and quotes (double & single) from topic text
 */
(function (module) {

    module.cleanText = function (text) {
        text = text.replace(/<[^>]*>/g, '');
        text = text.replace(/"/g, '');
        text = text.replace(/'/g, '');
        return ' ' + text + ' ';
    };

    module.createRenderer = function (marked) {

        var renderer = new marked.Renderer();

        renderer.title = null;

        renderer.blockquote = module.cleanText;
        renderer.html       = module.cleanText;
        renderer.list       = module.cleanText;
        renderer.listitem   = module.cleanText;
        renderer.paragraph  = module.cleanText;
        renderer.tablerow   = module.cleanText;
        renderer.tablecell  = module.cleanText;
        renderer.strong     = module.cleanText;
        renderer.em         = module.cleanText;
        renderer.codespan   = module.cleanText;
        renderer.del        = module.cleanText;

        renderer.br = function () { return ''; };
        renderer.hr = function () { return ''; };
        renderer.code = function () { return ''; };

        renderer.heading = function (text, level) {
            if (level === 1 && renderer.title === null) {
                renderer.title = text
            }
            return module.cleanText(text);
        };

        renderer.table = function (header, body) {
            if (body !== null) {
                header += ' ' + body;
            }
            return module.cleanText(header);
        };

        renderer.image = renderer.link = function (href, title, text) {
            var result = [];
            if(title) result.push(title);
            if(text) result.push(text);
            
            return module.cleanText(result.join(" "));
        };

        return renderer;
    };

}(module.exports));