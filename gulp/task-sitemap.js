var generateSiteMaps = require("../common/sitemap")

module.exports.registerTask = function(gulp, config){
	const dependencies = [
		'asciidoc',
		'sync-file-system-to-toc',
		'copy-api-files'
	];

	gulp.task('sitemap', dependencies, function (done) {

		var args = require('yargs')
			.usage('\n== Error ==\n\nUsage: gulp sitemap --name wpf --folder wpf-docs-en --version 1.0')
			.demand(['name', 'version', 'folder'])
			.argv;

		var host = config.culture === "en" ? "www" : config.culture;
		var domain = `https://${host}.infragistics.com`;
		var regex = new RegExp("(.*)(help.*)" + args.version);
		var onlineHelpDir = config.topics.dest.replace(regex, domain+"\\$2").replace(/\\/g, "/");

		generateSiteMaps(config.topics.dest, onlineHelpDir, args.version, done);
	});
};