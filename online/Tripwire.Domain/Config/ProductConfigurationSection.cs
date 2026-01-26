using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain
{
    public class ProductConfigurationSection : ConfigurationSection
    {
        [ConfigurationProperty("multiProductView", DefaultValue = "false", IsRequired = false)]
        public Boolean MultiProductView
        {
            get
            {
                return (Boolean)this["multiProductView"];
            }
            set
            {
                this["multiProductView"] = value;
            }
        }

        [ConfigurationProperty("", IsRequired = true, IsDefaultCollection = true)]
        [ConfigurationCollection(typeof(ProductsCollection), AddItemName = "product")]
        public ProductsCollection Products
        {
            get
            {
                ProductsCollection urlsCollection = (ProductsCollection)base[""];
                return urlsCollection;
            }
            set { this[""] = value; }
        }
        
    }

    public class ProductsCollection : ConfigurationElementCollection
    {

        protected override ConfigurationElement CreateNewElement()
        {
            return new ProductElement();
        }

        protected override object GetElementKey(ConfigurationElement element)
        {
            return ((ProductElement)element).Url;
        }
    }
}
