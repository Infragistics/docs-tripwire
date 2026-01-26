using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain
{
    public static class ProductConfiguration
    {
        private static ProductConfigurationSection section = (ProductConfigurationSection)System.Configuration.ConfigurationManager.GetSection("productConfiguration");
        private static Dictionary<string, ProductElement> _products;

        public static bool MultiProductView
        {
            get
            {
                return section.MultiProductView;
            }
        }

        public static Dictionary<string, ProductElement> Products
        { 
            get 
            {
                if (_products == null)
                {
                    _products = new Dictionary<string, ProductElement>();
                    foreach (ProductElement product in section.Products)
	                {
                        _products.Add(product.Url, product);
	                }
                    
                }
                return _products;
            } 
        }
    }
}
