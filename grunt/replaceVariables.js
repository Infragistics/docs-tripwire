/*
* Replaces variables in the content based on the global Grunt configuration for platform
*/

module.exports = {
    replaceVariables: {
        src: '<%= contentCopier.contentCopier.dest %>',
        options: {
        	jQueryApiUrl : '<%= jQueryApiUrl %>',
        	SamplesUrl : '<%= SamplesUrl %>',
        	NewSamplesUrl : '<%= SamplesUrl %>',
        	SamplesEmbedUrl : '<%= SamplesEmbedUrl %>',
        	DesignerUrl: '<%= DesignerUrl %>',
			PlatformName : '<%= PlatformName %>',
			ProductFamilyName : '<%= ProductFamilyName %>',
			ProductName : '<%= ProductName %>',
			ProductNameMVC: "<%= ProductNameMVC %>",
			ProductNameASPNETCore: "<%= ProductNameASPNETCore %>",
			ProductVersion : '<%= ProductVersion %>',
			ProductVersionCondensed : '<%= ProductVersionCondensed %>',
			ProductVersionShort : '<%= ProductVersionShort %>',
			ProductVersionFull : '<%= ProductVersionFull %>',
			InstallPath : '<%= InstallPath %>',
			FeedbackEmail : '<%= FeedbackEmail %>'
        }
    }
};