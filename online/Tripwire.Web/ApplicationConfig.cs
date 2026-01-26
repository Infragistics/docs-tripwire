using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using Tripwire.Domain;

namespace Tripwire
{
    public class ApplicationConfig
    {
        private HttpContext _httpContext = null;
        private List<string> _products = null;

        private void RequireAppSetting(string key)
        {
            if (ConfigurationManager.AppSettings[key] == null)
            {
                throw new Exception(string.Format("A web.config AppSettings value is required for '{0}'.", key));
            }
        }

        public bool IsMultiProductView
        {
            get
            {
                return ProductConfiguration.MultiProductView;
            }
        }

        public string HelpTopicsFolderPath
        {
            get
            {
                this.RequireAppSetting("HelpTopicsRootFolderPath");

                string path = string.Empty;
                string[] segments = HttpContext.Current.Request.Url.Segments;
                char separator = Path.DirectorySeparatorChar;

                path = ConfigurationManager.AppSettings["HelpTopicsRootFolderPath"].ToString();

                if (ConfigurationManager.AppSettings["HelpTopicsFolderPath"] != null)
                {
                    path = ConfigurationManager.AppSettings["HelpTopicsFolderPath"].ToString();
                    path = path.StartsWith("~") ? HostingEnvironment.MapPath(path) : path;
                }

                if (ProductConfiguration.Products[this.ProductUrl].CombineNamePath)
                {
                    path = Path.Combine(path, this.ProductPath);
                }

                return path;
            }
        }

        public string SearchAddress
        {
            get { return string.Format(Resources.Main.SearchCollection_Format, ConfigurationManager.AppSettings["SearchServiceUrl"]); }
        }

        public bool StripSearchResultUrls
        {
            get 
            {
                if (string.IsNullOrEmpty(ConfigurationManager.AppSettings["StripSearchResultUrls"]))
                {
                    return false;
                }
                else
                {
                    return bool.Parse(ConfigurationManager.AppSettings["StripSearchResultUrls"]);
                }
            }
        }

        public bool APISearchTab
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].APISearchTab;
            }
        }

        public string SearchGuide
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].SearchGuide;
            }
        }

        public string SearchProduct
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].SearchProduct;
            }
        }

        public string SearchAPIAddress
        {
            get { return string.Format(Resources.Main.SearchAPICollection_Format, ConfigurationManager.AppSettings["SearchServiceUrl"]); }
        }

        public string SubProduct
        {
            get
            {
                string subProduct = (string)HttpContext.Current.Request.RequestContext.RouteData.Values["subProduct"];
                return string.IsNullOrEmpty(subProduct) ? string.Empty : subProduct;
            }
        }

        public string ProductUrl
        {
            get
            {
                string product = (string)HttpContext.Current.Request.RequestContext.RouteData.Values["product"];
                string subProduct = (string)HttpContext.Current.Request.RequestContext.RouteData.Values["subProduct"];

                if(!string.IsNullOrEmpty(subProduct))
                {
                    product = string.Format("{0}/{1}", product, subProduct);
                }

                // TODO: realistically these checks are redundant with the current product limits on routes. Especially after the 
                if (!string.IsNullOrEmpty(product) && ProductConfiguration.Products.ContainsKey(product))
                {
                    return product;
                }
                return "";
            }
        }

        public string ProductPath
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].Path;
            }
        }


        public string Latest
        {
            get
            {
                var versions = this.PublishedVersions.Split(',');

                if (!(versions.Length >= 1))
                {
                    throw new Exception("Error while trying to split version number list. Make sure version numbers are a comma delimited list of values.");
                }

                return versions[0].Trim();
            }
        }
        
        public string PublishedVersions
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].PublishedVersions;
            }
        }

        public string ResourceName
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].ResourceName;
            }
        }

        public string ToCFilePathFormat
        {
            get
            {
                this.RequireAppSetting("ToCFilePathFormat");
                return Path.Combine(HelpTopicsFolderPath, ConfigurationManager.AppSettings["ToCFilePathFormat"].ToString());
            }
        }

        public string ToCXmlFilePathFormat
        {
            get
            {
                this.RequireAppSetting("ToCXmlFilePathFormat");
                return Path.Combine(HelpTopicsFolderPath, ConfigurationManager.AppSettings["ToCXmlFilePathFormat"].ToString());
            }
        }

        public string TableClass
        {
            get { return ConfigurationManager.AppSettings["TableClass"].ToString(); }
        }

        public List<string> Products
        {
            get
            {
                if (this._products == null)
                {
                    this._products = ProductConfiguration.Products.Keys.Where(s => !String.IsNullOrEmpty(s) && !s.Contains("/")).ToList();
                }
                return this._products;
            }
        }

        private List<string> _subProducts = null;
        public List<string> SubProducts
        {
            get
            {
                if (this._subProducts == null)
                {
                    this._subProducts = (ProductConfiguration.Products.Keys
                        .Where(s => !String.IsNullOrEmpty(s) && s.Contains("/"))
                        .Select(s => s.Substring(s.IndexOf("/") + 1, s.Length - s.IndexOf("/") - 1)))
                        .Distinct()
                        .ToList();
                }
                return this._subProducts;
            }
        }

        public string ProductListPattern
        {
            get
            {
                return string.Join("|", this.Products.Where(s => !String.IsNullOrEmpty(s)));
            }
        }

        public string SubProductListPattern
        {
            get
            {
                return string.Join("|", this.SubProducts);
            }
        }

        public string ImagesFolderList
        {
            get
            {
                this.RequireAppSetting("ImagesFolderList");
                return ConfigurationManager.AppSettings["ImagesFolderList"].ToString();
            }
        }

        public string Logo
        {
            get
            {
                return ProductConfiguration.Products[this.ProductUrl].Logo;
            }
        }

        public ApplicationConfig()
        {
            this._httpContext = System.Web.HttpContext.Current;
        }
    }
}