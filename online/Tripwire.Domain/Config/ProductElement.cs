using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain
{
    public class ProductElement : ConfigurationElement
    {
        [ConfigurationProperty("url", IsKey = true, IsRequired = true)]
        public string Url
        {
            get { return (string)base["url"]; }
            set { base["url"] = value; }
        }

        [ConfigurationProperty("publishedVersions", IsRequired = true)]
        public string PublishedVersions
        {
            get { return (string)base["publishedVersions"]; }
            set { base["publishedVersions"] = value; }
        }

        [ConfigurationProperty("resourceName", IsRequired = true)]
        public string ResourceName
        {
            get { return (string)base["resourceName"]; }
            set { base["resourceName"] = value; }
        }

        [ConfigurationProperty("path", IsRequired = false)]
        public string Path
        {
            get { return (string)base["path"]; }
            set { base["path"] = value; }
        }

        [ConfigurationProperty("combineNamePath", IsRequired = false, DefaultValue = true)]
        public bool CombineNamePath
        {
            get { return (bool)base["combineNamePath"]; }
            set { base["combineNamePath"] = value; }
        }

        [ConfigurationProperty("logo", IsRequired = false)]
        public string Logo
        {
            get { return (string)base["logo"]; }
            set { base["logo"] = value; }
        }

        [ConfigurationProperty("APISearchTab", IsRequired = false, DefaultValue = false)]
        public bool APISearchTab
        {
            get { return (bool)base["APISearchTab"]; }
            set { base["APISearchTab"] = value; }
        }

        /// <summary>
        /// [TODO]Intended for allowing products to opt out of some URL transformations, so the original file name can be matched (no Dash rule). Default is true.
        /// Temporary for consuming entire DocX projects as is.
        /// </summary>
        [ConfigurationProperty("strictUrlTransform", IsRequired = false, DefaultValue = true)]
        public bool StrictUrlTransform
        {
            get { return (bool)base["strictUrlTransform"]; }
            set { base["strictUrlTransform"] = value; }
        }

        /// <summary>
        /// [TODO]Intended for allowing products to specify the type of ToC repository - Either ToCRepository (JSON file) or XmlToCRepository (DocX XML file).
        /// Temporary for consuming entire DocX projects as is.
        /// </summary>
        [ConfigurationProperty("tocRepo", IsRequired = false)]
        public string ToCRepo
        {
            get { return (string)base["tocRepo"]; }
            set { base["tocRepo"] = value; }
        }

        [ConfigurationProperty("searchGuide", IsRequired = false)]
        public string SearchGuide
        {
            get { return (string)base["searchGuide"]; }
            set { base["searchGuide"] = value; }
        }

        [ConfigurationProperty("searchProduct", IsRequired = false)]
        public string SearchProduct
        {
            get { return (string)base["searchProduct"]; }
            set { base["searchProduct"] = value; }
        }
    }
}
