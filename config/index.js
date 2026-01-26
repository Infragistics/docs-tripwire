/*jslint node: true */
/*jshint esversion: 6 */

var config = {
	cultures: {
		ja: {
			defaultTOCLabel: 'このトピックの内容',
			test: (source) => /[ぁ-ゔゞァ-・ヽヾ゛゜ー]/g.test(source)
		},
		en: {
			defaultTOCLabel: 'In This Topic',
			test: (source) => !config.cultures.ja.test(source)
		},
		detect: (source) => config.cultures.ja.test(source) ? 'ja' : 'en'
	}
};

module.exports = config;