/* 
    builds metadata and plain-text topics for 
    Solr search engine indexing
*/

module.exports = function (grunt) {
    var lang = grunt.option('lang'),
        solrCollectionUrl = '/solr/collection1/update?commit=true&optimize=true',
        solrAPICollectionUrl = '/solr/apiCollectionEn/update?commit=true&optimize=true';

    if (lang == 'ja') {
        solrCollectionUrl = '/solr/collectionJa/update?commit=true&optimize=true';
        solrAPICollectionUrl = '/solr/apiCollectionJa/update?commit=true&optimize=true';
    }

    return {    
        solrIndex: {
            //src: '../<%= markdown.online.files[0].dest %>',
            // also index files from folders APIHelpEN and APIHelpJP (based on build type), one level above repo folder:
            src: ["../online/Tripwire.Web/help/<%= major %>.<%= minor %>/" ],
            version: "<%= major %>.<%= minor %>",
            dest: '../solr/solr-index-' + lang + '.txt',
            destAPI: '../solr/solr-index-API-' + lang + '.txt',
            errorLogPath: '../solr/errors/',
            helpRootUrl: '<%= HelpRootUrl %>',
            productId: '<%= ProductFamilyID %>',
            productFamilyName: '<%= ProductFamilyName %>',
            platformName: '<%= PlatformName %>',
            culture: lang == 'ja' ? 'JP' : lang,
            tagsFile: '../Tags.xml',
            tagProperty: "JP_NAME",
            connectionString: 'data source=db2.staging.infragistics.local;initial catalog=CustomerGuidance.Database;user id=WebStagingUser;password=bl@uel@bel;multipleactiveresultsets=True;',
            postOptions: {
                hostname: '10.20.9.199',
                port: 8080,
                path: solrCollectionUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/json; charset=utf-8'
                }
            },
            solrAPICollectionUrl: solrAPICollectionUrl
        }
    };
};