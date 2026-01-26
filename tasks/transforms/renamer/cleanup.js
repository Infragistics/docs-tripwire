/*jslint node: true */
/*jshint esversion: 6 */

module.exports = [
    {
        description: 'remove help2 links to .NET framework classes',
        apply: (value) => value.replace(/<a.*?href="#" onclick=.*?>(.*?)<\/a>/gi, '$1')
    },
    {
        description: 'remove &lt;sub&gt; and &lt;/sub&gt; from links',
        apply: (value) => value.replace(/href="?.*?\&lt\;sub\&gt\;.*?"/gi, (match) => match.replace(/&lt;\/?sub&gt;/g, '~'))
    },
    {
        description: 'remove BOM from Japanese files',
        apply: (value, args) => {
            if(args.culture === 'ja') {
                if (value.charCodeAt(0) === 0xFEFF) {
                    value = value.slice(1);
                }
            }
            return value;
        }
    }
];