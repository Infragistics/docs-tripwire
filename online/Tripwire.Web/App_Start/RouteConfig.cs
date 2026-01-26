using System.Security.Cryptography.X509Certificates;
using System.Web.Mvc;
using System.Web.Routing;
using Tripwire.Web.Extensions;

namespace Tripwire.Web
{
    public static class RouteNames
    {
        public const string OldRoute = "OldRoute";
        public const string FixVersioned16_2APILinkRoute = "Fix 16.2 Versioned API Link Route";
        public const string FixDroppedPrefixRoute = "FixDroppedPrefixRoute";
        public const string OldRoute_MultiproductLayout = "OldRoute.CustomLayout";
        public const string NewRoute_MultiproductLayout = "NewRoute.CustomLayout";
        public const string Route_Product_SubProduct_Version_PageName = "Product.SubProduct.Version.PageName";
        public const string Product_SubProduct_PageName = "Product.SubProduct.PageName";
        public const string Product_Version_PageName = "Route.Product.Version.PageName";
        public const string FixTopicNames_MultiproductLayout = "FixTopicNames.MultiproductLayout";
        public const string VersionRoute = "VersionRoute";
        public const string Search = "Search";
        public const string Search_MultiproductLayout = "Search.CustomLayout";
        public const string Product_SubProduct_Version_Search = "Product.SubProduct.Version.Search";
        public const string Product_SubProduct_Search = "Product.SubProduct.Search";
        public const string Images = "Images";
        public const string Images_MultiproductLayout = "Images.MultiproductLayout";
        public const string Product_Version_Images_FileName = "Product.Version.Images.FileName";
        public const string Product_SubProduct_Version_Images_FileName = "Product.SubProduct.Version.Images.FileName";
        public const string Images_MultiproductLayout_SubProduct = "Images.MultiproductLayout.SubProduct";
        public const string ImagesVersion = "ImagesVersion";
        public const string Sitemap = "Sitemap";
        public const string SitemapSections = "SitemapSections";
        public const string Robots = "Robots";
        public const string Topics = "Topics";
        public const string Version_Topics = "Version.Topics";
        public const string FixTopicNames = "FixTopicNames";
        public const string Default = "Default";
    }
    public class RouteConfig
    {
        public const string VERSION_PATTERN = @"^[0-9]{1,2}\.[0-9]$";
        public static void RegisterRoutes(RouteCollection routes)
        {
            var config = new ApplicationConfig();
            routes.LowercaseUrls = true;
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.IgnoreRoute("{*favicon}", new { favicon = @"(.*/)?favicon.ico(/.*)?" });

            routes.MapRoute("Error - 404", "NotFound", new { controller = "RequestError", action = "NotFound" });

            routes.MapRoute("Error - 500", "ServerError", new { controller = "RequestError", action = "ServerError" });

            // fallback route for unhandled images (in external root folder)

			if (!string.IsNullOrEmpty(config.SubProductListPattern))
			{
				//D.P. Only register sub-prod routes if there are any, so constraints can be applied
				routes.MapRoute(
					name: RouteNames.Route_Product_SubProduct_Version_PageName,
					url: "{product}/{subProduct}/{v}/{pageName}",
					defaults: new
					{
						controller = "Topics",
						action = "Index",
						pageName = "home-page"
					},
					constraints: new
					{
						product = config.ProductListPattern,
						subProduct = config.SubProductListPattern,
						v = VERSION_PATTERN
					}
				);
			}

            routes.MapRoute(
                name: RouteNames.SitemapSections,
                url: "{product}/sitemap{postfix}.xml",
                defaults: new
                {
                    controller = "Sitemap",
                    action = "Index",
                    postfix = ""
                }
            );

            routes.MapRoute(
                name: RouteNames.Product_SubProduct_Version_Search,
                url: "{product}/{subProduct}/{v}/search",
                defaults: new
                {
                    controller = "Search",
                    action = "Search"
                },
                constraints: new
                {
                    product = config.ProductListPattern,
                    subProduct = config.SubProductListPattern,
                    v = VERSION_PATTERN
                }
            );

            routes.MapRoute(
				name: RouteNames.Search_MultiproductLayout + "Version",
				url: "{product}/{v}/search",
				defaults: new
				{
					controller = "Search",
					action = "Search"
				},
				constraints: new { 
					product = config.ProductListPattern,
					v = VERSION_PATTERN
				}
			);

            routes.MapRoute(
                name: RouteNames.Product_Version_PageName,
                url: "{product}/{v}/{pageName}",
                defaults: new
                {
                    controller = "Topics",
                    action = "Index",
                    pageName = "home-page"
                },
                constraints: new
                {
                    product = config.ProductListPattern,
                    v = VERSION_PATTERN
                }
            );

            routes.Add(RouteNames.Product_Version_Images_FileName, new Route(
                "{product}/{v}/{images}/{fileName}",
                new RouteValueDictionary(),
                new RouteValueDictionary(new
                {
                    images = config.ImagesFolderList,
                    product = config.ProductListPattern,
                    v = VERSION_PATTERN
                }),
                new ImagesRouteHandler())
            );

            routes.Add(RouteNames.Images_MultiproductLayout, new Route(
                "{product}/{images}/{fileName}",
                new RouteValueDictionary(),
                new RouteValueDictionary(new
                {
                    images = config.ImagesFolderList,
                    product = config.ProductListPattern
                }),
                new ImagesRouteHandler())
            );

            routes.Add(RouteNames.Product_SubProduct_Version_Images_FileName, new Route(
                "{product}/{subProduct}/{v}/{images}/{fileName}",
                new RouteValueDictionary(),
                new RouteValueDictionary(new
                {
                    images = config.ImagesFolderList,
                    product = config.ProductListPattern,
                    v = VERSION_PATTERN
                }),
                new ImagesRouteHandler())
            );

            routes.Add(RouteNames.Images_MultiproductLayout_SubProduct, new Route(
                "{product}/{subProduct}/{images}/{fileName}",
                new RouteValueDictionary(),
                new RouteValueDictionary(new
                {
                    images = config.ImagesFolderList,
                    product = config.ProductListPattern
                }),
                new ImagesRouteHandler())
            );

            routes.Add(RouteNames.Images, new Route(
                "{images}/{fileName}",
                new RouteValueDictionary(),
                new RouteValueDictionary(new { images = config.ImagesFolderList }),
                new ImagesRouteHandler())
            );

            routes.MapRoute(
                name: RouteNames.Product_SubProduct_Search,
                url: "{product}/{subProduct}/search",
                defaults: new
                {
                    controller = "Search",
                    action = "Search"
                },
                constraints: new {
                    product = config.ProductListPattern,
                    subProduct = config.SubProductListPattern
                }
            );

            routes.MapRoute(
                name: RouteNames.Search_MultiproductLayout,
                url: "{product}/search",
                defaults: new
                {
                    controller = "Search",
                    action = "Search"                },
                constraints: new { product = config.ProductListPattern }
            );

            routes.MapRoute(
                name: RouteNames.OldRoute_MultiproductLayout,
                url: "{product}/{version}/{clr}",
                defaults: new
                {
                    controller = "Topics",
                    action = "RedirectOldRouteByProduct"
                },
                constraints: new { product = config.ProductListPattern, version = "(\\d{4}[\\.-]\\d)|Beta|Release|Current" }
            );

			// Handle old /help/{product}/topic_name.html links from the deprecated main site help mirror
			routes.MapRoute(
				name: RouteNames.FixTopicNames_MultiproductLayout,
				url: "{product}/{pageName}",
				defaults: new { controller = "Topics", action = "FixRoute" },
				constraints: new { pageName = @"[^~]*[_\s][^~]*", product = config.ProductListPattern }
			);

			if (!string.IsNullOrEmpty(config.SubProductListPattern))
			{
				//D.P. Only register sub-prod routes if there are any, so constraints can be applied
				routes.MapRoute(
					name: RouteNames.Product_SubProduct_PageName,
					url: "{product}/{subProduct}/{pageName}",
					defaults: new
					{
						controller = "Topics",
						action = "Index",
						pageName = "home-page"
					},
					constraints: new
					{
						product = config.ProductListPattern,
						subProduct = config.SubProductListPattern
					}
				);
			}

            routes.MapRoute(
                name: RouteNames.FixVersioned16_2APILinkRoute,
                url: "{product}/{pageName}",
                defaults: new
                {
                    controller = "Topics",
                    action = "FixVersioned16_2APILink"
                },
                constraints: new
                {
                    product = config.ProductListPattern,
                    pageName = @".+4.*\.v16\.2.*"
                }
            );

            routes.MapRoute(
                name: RouteNames.FixDroppedPrefixRoute,
                url:"wpf/{pageName}",
                defaults: new
                {
                    controller = "Topics",
                    action = "FixDroppedPrefixRoute"
                },
                constraints: new
                {
                    pageName = @"(igexcelengine.*)|(xamgeographicmap.*)"
                }
                
            );

            routes.MapRoute(
                name: RouteNames.NewRoute_MultiproductLayout,
                url: "{product}/{pageName}",
                defaults: new
                {
                    controller = "Topics",
                    action = "Index",
                    pageName = "home-page"
                },
                constraints: new { product = config.ProductListPattern }
            );

            routes.MapRoute(
                name: RouteNames.OldRoute,
                url: "doc/jquery/{version}/{clr}",
                defaults: new
                {
                    controller = "Topics",
                    action = "RedirectOldRoute",
                    version = UrlParameter.Optional,
                    clr = UrlParameter.Optional
                }
            );

            routes.MapRoute(
             name: RouteNames.VersionRoute,
             url: "{version}/{clr}",
             defaults: new { controller = "Topics", action = "RedirectOldRoute", clr = UrlParameter.Optional },
             constraints: new { version = "(\\d{4}[\\.-]\\d)|Beta|Release|Current" }
            );

			routes.MapRoute(
				name: RouteNames.Search + "Version",
				url: "{v}/search",
				defaults: new
				{
					controller = "Search",
					action = "Search"
				},
				constraints: new { v = VERSION_PATTERN }
			);

            routes.MapRoute(
                name: RouteNames.Search,
                url: "search",
                defaults: new { controller = "Search", action = "Search" }
            );

            routes.Add(RouteNames.ImagesVersion, new Route(
                "{version}/{images}/{fileName}",
                new RouteValueDictionary(),
                new RouteValueDictionary(new { images = config.ImagesFolderList }),
                new ImagesRouteHandler())
            );

            routes.MapRoute(
                name: RouteNames.Sitemap,
                url: "sitemap.xml",
                defaults: new { controller = "Home", action = "Sitemap" }
            );

            routes.MapRoute(
                name: RouteNames.Robots,
                url: "robots.txt",
                defaults: new { controller = "Home", action = "Robots" }
            );

           routes.MapRoute(
               name: RouteNames.FixTopicNames,
               url: "{pageName}",
               defaults: new { controller = "Topics", action = "FixRoute" },
               constraints: new { pageName = @"[^~]*[_\s][^~]*" }
           );

            routes.MapRoute(
                name: RouteNames.Version_Topics,
                url: "{v}/{pageName}",
                defaults: new {
                    controller = "Topics",
                    action = "Index",
                    pageName = "home-page"
                },
                constraints: new {
                    v = VERSION_PATTERN
                }
            );

            routes.MapRoute(
                name: RouteNames.Topics,
                url: "{pageName}",
                defaults: new { controller = "Topics", action = "Index", pageName = "home-page" }
            );

            routes.MapRoute(
                name: RouteNames.Default,
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}