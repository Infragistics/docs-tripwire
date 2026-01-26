using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace Tripwire.Web
{
    public static class WebApiConfig
    {
        public const string VERSION_PATTERN = @"^[0-9]{1,2}\.[0-9]$";

        public static void Register(HttpConfiguration config)
        {
            ApplicationConfig appConfig = new ApplicationConfig();

            config.Routes.MapHttpRoute(
                name: "TopicApi_TopicFeedback",
                routeTemplate: "apis/topicfeedback/{action}",
                defaults: new { controller = "TopicFeedback", action = "Add" }
            );

			if (!string.IsNullOrEmpty(appConfig.SubProductListPattern))
			{
				//D.P. Only register sub-prod routes if there are any, so constraints can be applied
				config.Routes.MapHttpRoute(
					name: "Product_SubProduct_Version_APIs_Topic_Id",
					routeTemplate: "{product}/{subProduct}/{v}/apis/Topic/{id}",
					defaults: new { controller = "Topic", id = "home-page" },
					constraints: new
					{
						product = appConfig.ProductListPattern,
						subProducts = appConfig.SubProductListPattern,
						v = VERSION_PATTERN
					}
				);

				config.Routes.MapHttpRoute(
					name: "TopicApi_MultiproductLayout_SubProduct",
					routeTemplate: "{product}/{subProduct}/apis/Topic/{id}",
					defaults: new { controller = "Topic", id = "home-page" },
					constraints: new {
						product = appConfig.ProductListPattern,
						subProducts = appConfig.SubProductListPattern
					}
				);
			}


            config.Routes.MapHttpRoute(
                name: "Product_Version_APIs_Topic_Id",
                routeTemplate: "{product}/{v}/apis/Topic/{id}",
                defaults: new { controller = "Topic", id = "home-page" },
                constraints: new {
                    product = appConfig.ProductListPattern,
                    v = VERSION_PATTERN
                }
            );

            config.Routes.MapHttpRoute(
                name: "TopicApi_MultiproductLayout",
                routeTemplate: "{product}/apis/Topic/{id}",
                defaults: new { controller = "Topic", id = "home-page" },
                constraints: new { product = appConfig.ProductListPattern }
            );

            config.Routes.MapHttpRoute(
                name: "TopicApi_version",
                routeTemplate: "{v}/apis/Topic/{id}",
                defaults: new { controller = "Topic", id = "home-page"},
                constraints: new { v = VERSION_PATTERN }
            );

            config.Routes.MapHttpRoute(
                name: "TopicApi",
                routeTemplate: "apis/Topic/{id}",
                defaults: new {controller = "Topic", id = "home-page" }
            );

			if (!string.IsNullOrEmpty(appConfig.SubProductListPattern))
			{
				//D.P. Only register sub-prod routes if there are any, so constraints can be applied
				config.Routes.MapHttpRoute(
					name: "Product_SubProduct_Version_APIs_Controller_Id",
					routeTemplate: "{product}/{subProduct}/{v}/apis/{controller}/{id}",
					defaults: new { id = RouteParameter.Optional },
					constraints: new
					{
						product = appConfig.ProductListPattern,
						subProduct = appConfig.SubProductListPattern,
						v = VERSION_PATTERN
					}
				);

				config.Routes.MapHttpRoute(
					name: "MultiproductAPI_SubProduct",
					routeTemplate: "{product}/{subProduct}/apis/{controller}/{id}",
					defaults: new { id = RouteParameter.Optional },
					constraints: new
					{
						product = appConfig.ProductListPattern,
						subProduct = appConfig.SubProductListPattern
					}
				);
			}

            config.Routes.MapHttpRoute(
                name: "MultiproductAPI",
                routeTemplate: "{product}/apis/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional },
                constraints: new { product = appConfig.ProductListPattern }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "apis/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
