using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Tripwire.Web.Filters
{
    // http://blog.muonlab.com/2011/11/27/simplistic-canonical-linking-in-asp-net-mvc/

    [AttributeUsage(AttributeTargets.Method, AllowMultiple=false, Inherited=false)]
    public class CanonicalFilterAttribute : ActionFilterAttribute
    {
        public CanonicalFilterAttribute(){}

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            //Uri uri = filterContext.RequestContext.HttpContext.Request.Url;
            UriBuilder uri = new UriBuilder(filterContext.RequestContext.HttpContext.Request.Url);
            Route route = (Route)(filterContext.RouteData.Route);
            string pageName = (string)filterContext.RouteData.Values["pageName"];
            string product = (string)filterContext.RouteData.Values["product"];
			string decodedPath = HttpUtility.UrlDecode(uri.Path);

			// Trailing slash:
            if (!string.IsNullOrEmpty(pageName))
            {
                // D.P. 2022-04-06 HttpUtility.UrlDecode replaces `+` with space, RouteData doesn't. Compare both decoded:
                if (decodedPath.Contains(HttpUtility.UrlDecode(pageName)))
				{
					//topic url pages
					if (uri.Path.EndsWith("/"))
					{
						// /help/home-page/
						uri.Path = uri.Path.ToString().Remove(uri.Path.Length - 1);
						filterContext.HttpContext.Response.Redirect(uri.Uri.ToString(), true);
					}

				}
				else if (!uri.Path.EndsWith("/"))
				{
					//product/version ending:
					filterContext.HttpContext.Response.Redirect(uri.Path + "/", true);
				}
            }
            //search and error pages
            else {
                if ((filterContext.RouteData.Route == RouteTable.Routes[RouteNames.Search] || filterContext.RouteData.Route == RouteTable.Routes[RouteNames.Search_MultiproductLayout] || uri.Path.ToString().Contains("notfound")) && (uri.Path.ToString().EndsWith("/")))
                {
                    filterContext.HttpContext.Response.Redirect(uri.Path.ToString().Remove(uri.Path.ToString().Length - 1) + uri.Uri.Query);
                }
                else { return; }
            }
            base.OnActionExecuting(filterContext);
        }

        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            Uri uri;
            Route route;
            string urlPattern = string.Empty;
            string url = string.Empty;
            string canonicalUrl = string.Empty;
            string defaultPage = string.Empty;
            string keyLowerCase = string.Empty;

            if (filterContext.HttpContext.Response.StatusCode != 301)
            {
                uri = filterContext.RequestContext.HttpContext.Request.Url;
                route = (Route)filterContext.RouteData.Route;
                
                url = route.Url.ToLowerInvariant();

                foreach (var key in filterContext.RouteData.Values.Keys)
                {
                    keyLowerCase = key.ToLowerInvariant();

                    if (keyLowerCase == "v" || keyLowerCase == "version")
                    {
                        url = url.Replace("{" + keyLowerCase + "}", "");
                    }
                    else
                    {
                        url = url.Replace("{" + keyLowerCase + "}", filterContext.RouteData.Values[key].ToString());
                    }
                }

                if (route.Defaults["pageName"] != null)
                {
                    defaultPage = route.Defaults["pageName"].ToString();
                    url = url.Replace(defaultPage,"");
                }

                if (url == "/") {
                    url = string.Empty;
                }

                url = string.Format("{0}/help/{1}", uri.Host, url).Replace("//", "/");
                canonicalUrl = string.Format("{0}://{1}", uri.Scheme,url);

                filterContext.Controller.ViewData["CanonicalUrl"] = canonicalUrl;
                filterContext.HttpContext.Response.Headers.Add("Link", "<" + canonicalUrl + ">; rel=\"canonical\"");
            }
            base.OnResultExecuting(filterContext);
        }
    }
}