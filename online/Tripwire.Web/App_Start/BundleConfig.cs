using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Optimization;

namespace Tripwire.Web
{
    public class BundleVirtualPaths
    {
        // Scripts
        public const string Script_Default = "~/bundles/scripts";
        public const string Script_Modernizr = "~/bundles/modernizr";
        public const string Script_jQuery_Validation = "~/bundles/jqueryval";
        public const string Script_Redirects = "~/bundles/redirect-rules";

        // Styles
        public const string Style_IgniteUI = "~/Content/igniteui";
		public const string Style_Multiproduct = "~/Content/multiplatform";
		public const string Style_MainHeader = "~/Content/mainheader";
    }
    public class BundleConfig
    {
        private static void AddStyleBundle(BundleCollection bundles, string bundleVirtualPath)
        {
            var path = bundleVirtualPath + ".css";

            bundles.Add(new StyleBundle(bundleVirtualPath)
                                .Include("~/content/bootstrap.css")
                                 // ignite ui
								.Include("~/content/themes/infragistics/infragistics.theme.min.css", new CustomCssRewriteUrlTransform())
								.Include("~/content/structure/infragistics.css", new CustomCssRewriteUrlTransform())
                                // site main
                                .Include(path)
                            );
        }
        public static void RegisterBundles(BundleCollection bundles)
        {
			List<string> jsFiles = new List<string> {
				// jquery
                "~/scripts/jquery-{version}.js",
                "~/scripts/jquery-ui-{version}.js",

				//highlightjs
				"~/scripts/highlight.pack.js",

				// embed widget
				"~/scripts/jquery.gh-embed.js",

                // bootstrap
                "~/scripts/bootstrap.js"
			};

			if (CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ja")
			{
				//localizations (combo pne must come before script)
				jsFiles.Add("~/scripts/i18n/infragistics.ui.combo-ja.js");
				jsFiles.Add("~/scripts/i18n/jquery.gh-embed-ja.js");
			}
			
			jsFiles.AddRange(new string[] {
                // ignite ui
                "~/scripts/infragistics.js",

                //fastclick script
                "~/scripts/fastclick.min.js",

                // app scripts 
                "~/scripts/app/igviewer.locale.js",
                "~/scripts/app/igviewer.common.js",
                "~/scripts/app/igviewer.contentService.js",
                "~/scripts/app/igviewer.searchService.js",
                "~/scripts/app/igviewer.searchFeature.js",
                "~/scripts/app/igviewer.feedbackService.js",
                "~/scripts/app/igviewer.renderingService.js",
                "~/scripts/app/igviewer.tree.js",
                "~/scripts/app/igviewer.versionSelector.js"
			});
			bundles.Add(new ScriptBundle(BundleVirtualPaths.Script_Default).Include(jsFiles.ToArray()));

            bundles.Add(new ScriptBundle(BundleVirtualPaths.Script_Redirects).Include("~/scripts/app/igviewer.redirects.js"));

            bundles.Add(new ScriptBundle(BundleVirtualPaths.Script_Modernizr).Include("~/scripts/modernizr-*"));

            BundleConfig.AddStyleBundle(bundles, BundleVirtualPaths.Style_IgniteUI);
            BundleConfig.AddStyleBundle(bundles, BundleVirtualPaths.Style_Multiproduct);
			//string path = System.Configuration.ConfigurationManager.AppSettings["IGRootUrl"];
			//bundles.Add(new StyleBundle(BundleVirtualPaths.Style_MainHeader).Include(
			//	path + "/assets/modern/css/layout.css",
			//	path + "/assets/modern/css/animate-custom.css",
			//	path + "/assets/modern/css/fontello.css",
			//	path + "/css/footer.css",
			//	path + "/css/navigation.css"
			//));

            bundles.Add(new ScriptBundle(BundleVirtualPaths.Script_jQuery_Validation).Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            // BundleTable.EnableOptimizations = true;
        }
    }

	/// <summary>
	/// Custom CSS rules transformer with bug fixes. "Rewrites urls to be absolute so assets will still be found after bundling"
	/// Original source: https://aspnetoptimization.codeplex.com/SourceControl/latest#src/System.Web.Optimization/CssRewriteUrlTransform.cs
	/// Fixes included for:
	/// https://aspnetoptimization.codeplex.com/workitem/83
	/// https://aspnetoptimization.codeplex.com/workitem/88
	/// </summary>
	public class CustomCssRewriteUrlTransform : IItemTransform
	{
		internal static string RebaseUrlToAbsolute(string baseUrl, string url) {
			// Don't do anything to invalid urls or absolute urls
			if (String.IsNullOrWhiteSpace(url) ||
				String.IsNullOrWhiteSpace(baseUrl) ||
				url.StartsWith("/", StringComparison.OrdinalIgnoreCase)) {
				return url;
			}

			// D.P. https://aspnetoptimization.codeplex.com/workitem/88 Don't transform data URI or already absolute urls
			if (url.StartsWith("data:") || url.StartsWith("http"))
			{
				return url;
			}

			// NOTE: now we support for ~ app relative urls here
			if (!baseUrl.EndsWith("/",  StringComparison.OrdinalIgnoreCase)) {
				baseUrl += "/";
			}

			return VirtualPathUtility.ToAbsolute(baseUrl + url);
		}

        internal static string ConvertUrlsToAbsolute(string baseUrl, string content) {
            if (String.IsNullOrWhiteSpace(content)) {
                return content;
            }

            // Replace all urls with absolute urls
            Regex url = new Regex(@"url\(['""]?(?<url>[^)]+?)['""]?\)");
            return url.Replace(content, ((match) => {
                return "url(" + RebaseUrlToAbsolute(baseUrl, match.Groups["url"].Value) + ")";
            }));
        }

        /// <summary>
        /// Converts any urls in the input to absolute using the base directory of the include virtual path.
        /// </summary>
        /// <param name="includedVirtualPath">The virtual path that was included in the bundle for this item that is being transformed</param>
        /// <param name="input"></param>
        /// <example>
        /// bundle.Include("~/content/some.css") will transform url(images/1.jpg) => url(/content/images/1.jpg)
        /// </example>
        public string Process(string includedVirtualPath, string input) {
            if (includedVirtualPath == null) {
                throw new ArgumentNullException("includedVirtualPath");
            }
			//D.P. https://aspnetoptimization.codeplex.com/workitem/83 Fix application root
			includedVirtualPath = "~" + VirtualPathUtility.ToAbsolute(includedVirtualPath);
            // Strip off the ~ that always occurs in app relative virtual paths
            string baseUrl = VirtualPathUtility.GetDirectory(includedVirtualPath.Substring(1));
            return ConvertUrlsToAbsolute(baseUrl, input);
        }
	}
}