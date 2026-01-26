module.exports =  function (grunt) {
    return {
        offline: {
            src: '../topics',
            dests: [],
            templates: [
                {
                    output: 'xml-toc',
                    src: '../offline/templates/toc.xml',
                    dests: ['../offline/Tripwire.Offline/help/toc.xml'],
                    token: '||content||'
                },
                {
                    output: 'json',
                    src: '../offline/templates/igviewer.tree.data.js',
                    dests: ['../offline/Tripwire.Offline/scripts/app/igviewer.tree.data.js'],
                    token: '||content||'
                }
            ],
            mvcToc: '../../API_TOC.xml',

            // reuse replaceVariables 
            replaceVariables: '<%= replaceVariables.replaceVariables.options %>',
            toLowerCase: false,
            buildVersion: "",
            stripTitleBrackets: true
        },
        
        online: {
            src: '../topics',
            dests: ['../online/Tripwire.Web/help/<%= major %>.<%= minor %>/toc.json'],
            mvcToc: '../../API_TOC.xml',
            templates: [
                /*{
                    output: 'json',
                    src: '../offline/templates/igviewer.tree.data.js',
                    dests: ['../online/Tripwire.Web/App_Data/toc' + (grunt.option('latest') ? "" : '<%= major %>.<%= minor %>') + '.json'],
                    token: '||content||'
                },*/
                {
                    // pre-compile the navigation list into the home page tempalte:
                    // TODO: find a better template/file combo for this or add 
                    // cleanup task to revert the changes after all tasks
                    output: 'html',
                    src: '../online/templates/toc.cshtml',
                    dests: ['../online/Tripwire.Web/Views/Shared/toc' + (grunt.option('latest') ? "" : '<%= major %>.<%= minor %>') + '.cshtml'],
                    token: '||content||'
                },
    			{
                    output: 'xml',
                    src: '../online/templates/sitemap.xml',
                    dests: ['../online/Tripwire.Web/help/<%= major %>.<%= minor %>/sitemap.xml'],
                    token: '||content||'
                }
            ],
            replaceFileExt: "",

            // reuse replaceVariables 
            replaceVariables: '<%= replaceVariables.replaceVariables.options %>',
            toLowerCase: true,
            //buildVersion: grunt.option('latest') ? "" : '?v=<%= major %>.<%= minor %>',
            buildVersion: "",
            helpRootUrl: '<%= HelpRootUrl %>',
            stripTitleBrackets: true
        }
    }
};