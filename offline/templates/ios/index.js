module = module.exports;

var _gulp, _config;

module.init = (gulp, config) => {
    _gulp = gulp;
    _config = config;
};

module.execute = (done) => {

    const fsExtra = require('fs-extra');
    const notify = require('gulp-notify');
    const wrap = require('gulp-wrap');
    const path = require('path');
    const fs = require('fs');
    const _ = require('lodash');
    const productConfigurationReader = require(path.resolve(__dirname, '../../../tasks/productConfigurationReader.js'));
    const templates = {
        home: {
            en: fs.readFileSync(path.resolve(__dirname, './template/index-en.html'), 'utf8'),
            ja: fs.readFileSync(path.resolve(__dirname, './template/index-ja.html'), 'utf8')
        },
        topic: {
            en: fs.readFileSync(path.resolve(__dirname, './template/topic-en.html'), 'utf8'),
            ja: fs.readFileSync(path.resolve(__dirname, './template/topic-ja.html'), 'utf8'),
        },
    };
    const paths = {
        destination: _config.output,
        template: path.resolve(__dirname, './template'),
        imagesSrc: path.join(_config.htmlSrc, 'images')
    };

    paths.imagesDest = path.join(paths.destination, 'images');
    paths.homeFile = path.join(paths.destination, 'index.html');

    const data = {
        toc: JSON.parse(fs.readFileSync(_config.jsonFilePath, 'utf8'))
    };

    const templateFilesToDelete = [
        'index-en.html',
        'index-ja.html',
        'topic-en.html',
        'topic-ja.html'
    ]

    productConfigurationReader.getConfiguration(_config.docsConfigFilePath).then((productConfiguration, error) => {
        if(error) {
            console.error(error);
            done();
        } else {

            var buildVariables = productConfiguration.variables.ios;
            var templateText = templates.topic[_config.culture];

            fsExtra.copy(paths.imagesSrc, paths.imagesDest, (imagesCopyError) => {

                if (imagesCopyError) {
                    console.log('Error: ' + imagesCopyError);
                    done();
                    return;
                }

                fsExtra.copy(paths.template, paths.destination, (templateCopyError) => {

                    if (templateCopyError) {
                        console.log('Error: ' + templateCopyError);
                        done();
                        return;
                    }

                    _.listTemplateFn = _.template('<ul><% _.each(toc, function(item) {%>' +
                                                '<li role="treeitem"><span></span><span class="sectionName"><a href="<%= item.fileName %>" target="topiccontent"><%= item.title %></a></span>' + 
                                                '<% if(item.children && item.children.length > 0) {%>' +
                                                '<% _.each(item.children, function(item) {%>' + 
                                                '<%= _.listTemplateFn({ toc: [item], templateFn: _.listTemplateFn} )%>' +
                                                '<% }); %>' +
                                                '<% } %>' +
                                                '</li>' +
                                                '<%});%></ul>');

                    var tocMarkup = _.listTemplateFn( {toc: data.toc, templateFn: _.listTemplateFn} );

                    // strip root UL
                    tocMarkup = tocMarkup.replace('<ul>', ''); // first match
                    tocMarkup = tocMarkup.substr(0, tocMarkup.lastIndexOf('</ul>'));

                    var homeTemplateValues = {
                        defaultTopicName: 'home-page.html',
                        productVersionCondensed: buildVariables.ProductVersion,
                        productVersionFull: '20' + buildVariables.ProductVersion,
                        title: buildVariables.PlatformName,
                        toc: tocMarkup
                    };

                    var homeTemplate = _.template(templates.home[_config.culture]);
                    var homeText = homeTemplate(homeTemplateValues);
                    var homeFilePath = paths.homeFile;

                    fs.writeFileSync(homeFilePath, homeText, 'utf8');

                    _gulp.src(_config.htmlSrc + '\\*.html')
                        .pipe(wrap(templates.topic[_config.culture], {}, { parse: false }))
                        .pipe(notify({
                            message: `Finished generating iOS offline help at: ${paths.destination}`,
                            onLast: true
                        }))
                        .pipe(_gulp.dest(paths.destination));

                    templateFilesToDelete.forEach((fileName) => {
                        fs.unlink(path.join(paths.destination, fileName), (deleteFileError) => {
                            if(deleteFileError){
                                console.log('Error: ' + deleteFileError);
                            }
                        });
                    });
                    
                    done();
                });
            });
        }
    });    
};