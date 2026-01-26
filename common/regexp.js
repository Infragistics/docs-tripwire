/*jslint node: true */
/*jshint esversion: 6 */

RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

RegExp.isJapanese = function(content) {
    return /[ぁ-ゔゞァ-・ヽヾ゛゜ー]/g.test(content);
};