
describe('AsciiDoc conversion', function(){
	
	var path = require('path');
	var asciiDoc = require(path.resolve('./tasks/asciidoc.js')); 
	
	describe('convert', function(){

		var wrapSource = function(source, prefixes){
			var value = '';
			
			if(prefixes){
				if(prefixes.forEach){
					prefixes.forEach(function(prefix){
						value += prefix + '\n';
					});
				} else {
					value += prefixes + '\n';
				}
			}
			
			value += '////\n|metadata|\n|metadata|\n////\n\n' + source;
			
			return value;
		};
		
		var wrapExpected = function(expected){
			return '<!---\n|metadata|\n|metadata|\n--->\n\n' + expected;
		};

		it('throws an error when folderPath is not valid', () => {
			expect(() => {
				asciiDoc.convert('= Test', [], '16.2', true, null);
			}).toThrow(new Error('Error: "sourceFolder" is not a valid file path. A file path is required to convert AsciiDoc to HTML.'));
		});

		it('throws an error when version is not valid', () => {
			expect(() => {
				asciiDoc.convert('= Test', null, null, 'c:\\TestPath');
			}).toThrow(new Error('Error: "version" is not a valid version number. A version is required to convert AsciiDoc to HTML.'));
		});
		
		it('supports build flags (multiword)', function(){
			var source, expected, result;
	
			source = wrapSource('pick:[wpf,sl="this is DataContext"]pick:[jquery="that was dataSource"]');
			expected = wrapExpected('<div class="paragraph">\n<p>that was dataSource</p>\n</div>');
			result = asciiDoc.convert(source, ['jquery'], '16.2', 'c:\\TestPath');
			expect(result).toEqual(expected);
			
			source = wrapSource('pick:[wpf,sl="this is DataContext"]pick:[jquery="that was dataSource"]');
			expected = wrapExpected('<div class="paragraph">\n<p>this is DataContext</p>\n</div>');
			result = asciiDoc.convert(source, ['wpf'], '16.2', 'c:\\TestPath');
			expect(result).toEqual(expected);
		});
		
		it('produces HTML h1 heading', function(){
			var source = wrapSource('= Heading');
			var expected = wrapExpected('<h1>Heading</h1>\n');
			var result = asciiDoc.convert(source, null, '16.2', 'c:\\TestPath');		
			expect(result).toEqual(expected);
		});
		
		it('produces HTML paragraphs', function(){
			var source = wrapSource('this is a test');
			var expected = wrapExpected('<div class="paragraph">\n<p>this is a test</p>\n</div>');
			var result = asciiDoc.convert(source, null, '16.2', 'c:\\TestPath');		
			expect(result).toEqual(expected);
		});
		
		it('supports build flags as a parameter', function(){
			var source, expected, result;
			
			source = wrapSource('pick:[wpf,sl="DataContext"]pick:[jquery="dataSource"]');
			expected = wrapExpected('<div class="paragraph">\n<p>DataContext</p>\n</div>');
			result = asciiDoc.convert(source, ['wpf'], '16.2', 'c:\\TestPath');
			expect(result).toEqual(expected);

			source = wrapSource('pick:[wpf,sl="DataContext"]pick:[jquery="dataSource"]');
			expected = wrapExpected('<div class="paragraph">\n<p>dataSource</p>\n</div>');
			result = asciiDoc.convert(source, ['jquery'], '16.2', 'c:\\TestPath');
			expect(result).toEqual(expected);

			source = wrapSource('pick:[wpf,sl="DataContext"]pick:[jquery="dataSource"]');
			expected = wrapExpected('<div class="paragraph">\n<p>DataContext</p>\n</div>');
			result = asciiDoc.convert(source, ['sl'], '16.2', 'c:\\TestPath');
			expect(result).toEqual(expected);
		});
	});
});