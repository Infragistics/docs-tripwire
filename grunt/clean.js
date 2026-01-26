module.exports =  function (grunt) {
	if (grunt.option('fileInfo') && !grunt.option('full')) {
		return { offline: [], online: [] }; // cancel the clear
	};

	var file = grunt.option('fileInfo') && grunt.option('fileInfo').cleanFileName || "*",
		paths = {    
			    offline: ['topic-files/' + file + '.md',
			    			'offline/Tripwire.Offline/help/' + file + '.html',
			                'offline/Tripwire.Offline/scripts/app/igviewer.tree.data.js'
			    ],	    
			    online: ['topic-files/' + file + '.md', 
			             'online/Tripwire.Web/help/<%= major %>.<%= minor %>/' + file + '.html',
			             'online/Tripwire.Web/Views/Shared/toc' + (grunt.option('latest') ? "" : '<%= major %>.<%= minor %>') + '.cshtml']
			};

	return paths;
};