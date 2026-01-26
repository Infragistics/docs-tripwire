module.exports = function generateSiteMaps(physicalDir, hostDir, version, callback) {
	var fs = require('fs');
	var walk = require('walk');

	var defaultPriority = 0.8;
	var defaultFrequency = "monthly";
	var modDate = getModDateString();

	var stream;
	var encoding = "utf8";
	var xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
	var xmlFooter = '</urlset>\n';
	var urlCount = 0;
	var fileNum = 0;
	var sitemapUrlLimit = 50000;
	var sitemapList = [];

	function formatUrlEntry(freq, mod, loc, prio) {
		loc = loc.replace(/.html$/, ""); // remove .html extension
		return	"  <url>\n" +
				"    <loc>" + loc + "</loc>\n" +
				"    <lastmod>" + mod + "</lastmod>\n" +
				"    <changefreq>" + freq + "</changefreq>\n" +
				"    <priority>" + prio + "</priority>\n" +
				"  </url>\n";
	}

	function formatIndexEntry(loc) {
		return	"  <sitemap>\n" +
				"    <loc>"+loc+"</loc>\n" +
				"    <lastmod>"+modDate+"</lastmod>\n" +
				"  </sitemap>\n";
	}

	// Returns current build date to use as modified date.
	function getModDateString() {
		return new Date().toISOString().substr(0, "YYYY-MM-DD".length);
	}

	function shouldFileBeMapped(fileStats) {
		if (fileStats.isDirectory()) {
			return false;
		}
		if (false === fileStats.name.endsWith(".html")) {
			//console.log("%s is not an HTML file; skipping.", fileStats.name);
			return false;
		}

		return true;
	}

	function createNewFileStream() {
		++fileNum;
		var siteMapFileName = "/sitemap"+fileNum+".xml";
		sitemapList.push(siteMapFileName);

		try {
			stream = fs.createWriteStream(physicalDir + siteMapFileName)
			stream.write(xmlHeader, encoding);
		}
		catch(e) {
			console.error(e);
			stream = null;
		}
	}

	function closeAndWriteSiteMapFile() {
		try {
			if (stream) {
				stream.end(xmlFooter, encoding);
			}
		}
		catch(e) {
			console.error(e);
		}
	};

	function writeFileToMap(fileStats) {
		try {
			if (stream) {
				stream.write(formatUrlEntry(defaultFrequency, modDate, hostDir + fileStats.name, defaultPriority), encoding);
			}
		}
		catch(e) {
			console.error(e);
		}
	}

	function fileHandler(root, fileStats, next) {
		if (shouldFileBeMapped(fileStats)) {
			writeFileToMap(fileStats);

			if (++urlCount >= sitemapUrlLimit) {
				urlCount = 0;

				closeAndWriteSiteMapFile();
				createNewFileStream();
			}
		}

		next();
	}

	function completeSiteMapGeneration(root, fileStats, next) {
		closeAndWriteSiteMapFile();
		//console.log("URLs mapped: %d", sitemapUrlLimit * fileNum + urlCount);
		//console.log("SiteMaps created: %d", fileNum);

		generateSiteMapIndexEntries();
		callback();
	}

	function generateSiteMapIndexEntries() {
		try {
			var stream = fs.createWriteStream(physicalDir + "/indexFile.part")
			var size = sitemapList.length;
			
			for (var i = 0; i < size; ++i) {
				stream.write(formatIndexEntry(hostDir + version + sitemapList[i]), encoding);
			}

			stream.end();
		}
		catch(e) {
			console.error(e);
			stream = null;
		}
	}

	var walkOptions = {
		followLinks: false
	};

	createNewFileStream();

	try {
		walker = walk.walk(physicalDir, walkOptions);
		walker.on("file", fileHandler);
		walker.on("end", completeSiteMapGeneration);
	}
	catch(e) {
		console.error(e);
	}
}