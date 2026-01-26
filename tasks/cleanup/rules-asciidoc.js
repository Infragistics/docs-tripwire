module.exports.regex = [
	{
		name: 'flatten-images-path',
		pattern: /image::?images\/(.*?)\[/g,
		replacement: function(match){
            var isBlockImage = /image::/.test(match);
            var colons = isBlockImage? '::' : ':';
			return `image${colons}images/${match.substr(match.lastIndexOf('/') + 1, match.length)}`;
		}
	}
];