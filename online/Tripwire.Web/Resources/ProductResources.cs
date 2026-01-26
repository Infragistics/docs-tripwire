using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace Tripwire.Web
{
    public static class ProductResources
    {
        // TODO: Use mapping or dynamic getter to automate the switch in Controller extensions or just delete the class.
        public static string GitHub_Link { get; set; }
        public static string Home_Link { get; set; }
        public static string PageTitle_Format { get; set; }
        public static string ProductFamilyName { get; set; }

        /// <summary>
        /// Internal resource value getter with reflection, after DataAnnotations' localizable attriburtes 
        /// </summary>
        /// <param name="resourceName">Name of the property to get, e.g. "PageTitle_Format"</param>
        /// <param name="resourceClass">Class in the Resources namepsace, e.g. "IgniteUI"</param>
        /// <returns></returns>
        public static string GetValue(string resourceName, string resourceClass = null) 
        {
            if (resourceClass != null && HttpContext.Current != null && HttpContext.Current.Request.RequestContext.RouteData.Values.ContainsKey("product"))
            {
                string platUrl = HttpContext.Current.Request.RequestContext.RouteData.Values["product"].ToString();
                mapping.TryGetValue(platUrl, out resourceClass);
            }
            string value = string.Empty;
            Type resourceType = Type.GetType("Resources." + resourceClass);
            if (resourceType != null && !string.IsNullOrEmpty(resourceName))
            {
                var property = resourceType.GetProperty(resourceName, BindingFlags.Public | BindingFlags.Static);
                if (property != null) {
                    MethodInfo propertyGetter = property.GetGetMethod(true /*nonPublic*/);
                    // Only support internal and public properties
                    if (propertyGetter == null || (!propertyGetter.IsAssembly && !propertyGetter.IsPublic)) {
                        property = null;
                    }
                }

                if (property != null && property.PropertyType == typeof(string)) {
                    value = (string)property.GetValue(null, null);
                }
            }

            return value;
        }

        internal static Dictionary<string, string> mapping = new Dictionary<string, string> 
        { 
            { "", "IgniteUI" },
            { "android", "Android" },
            { "aspnet", "ASPNET" },
            { "ios", "iOS" },
            { "reporting", "Reporting" },
            { "reportplus-desktop", "ReportPlusDesktop" },
            { "winforms", "WinForms" },
            { "winuniversal", "WinUniversal" },
            { "testautomationhpwinforms", "WinFormsTAHP" },
            { "wpf", "WPF" },
            { "reveal", "Reveal" },
            { "slingshot", "Slingshot" },
            { "shareplusios", "SharePlusIOS" },
            { "shareplusandroid", "SharePlusAndroid" },
            { "xamarin", "Xamarin" }

            // *** retired products ***
            //{ "lightswitch", "Lightswitch" },
            //{ "sharepoint", "Sharepoint" },
            //{ "silverlight", "Silverlight" },
            //{ "windowsphone", "WindowsPhone" },
            //{ "windowsui", "WindowsUI" },
        };

        public static void Read(string product)
        {
            switch (product.ToLower())
            {
                case "":
                    ProductResources.GitHub_Link = Resources.IgniteUI.GitHub_link;
                    ProductResources.Home_Link = Resources.IgniteUI.Home_Link;
                    ProductResources.PageTitle_Format = Resources.IgniteUI.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.IgniteUI.ProductFamilyName;
                    break;
                case "android":
                    ProductResources.GitHub_Link = Resources.Android.GitHub_link;
                    ProductResources.Home_Link = Resources.Android.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Android.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Android.ProductFamilyName;
                    break;
                case "aspnet":
                    ProductResources.GitHub_Link = Resources.ASPNET.GitHub_link;
                    ProductResources.Home_Link = Resources.ASPNET.Home_Link;
                    ProductResources.PageTitle_Format = Resources.ASPNET.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.ASPNET.ProductFamilyName;
                    break;
                case "ios":
                    ProductResources.GitHub_Link = Resources.iOS.GitHub_link;
                    ProductResources.Home_Link = Resources.iOS.Home_Link;
                    ProductResources.PageTitle_Format = Resources.iOS.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.iOS.ProductFamilyName;
                    break;

                case "reporting":
                    ProductResources.GitHub_Link = Resources.Reporting.GitHub_link;
                    ProductResources.Home_Link = Resources.Reporting.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Reporting.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Reporting.ProductFamilyName;
                    break;
                case "reportplus-desktop":
                    ProductResources.GitHub_Link = Resources.ReportPlusDesktop.GitHub_link;
                    ProductResources.Home_Link = Resources.ReportPlusDesktop.Home_Link;
                    ProductResources.PageTitle_Format = Resources.ReportPlusDesktop.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.ReportPlusDesktop.ProductFamilyName;
                    break;
                case "winforms":
                    ProductResources.GitHub_Link = Resources.WinForms.GitHub_link;
                    ProductResources.Home_Link = Resources.WinForms.Home_Link;
                    ProductResources.PageTitle_Format = Resources.WinForms.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.WinForms.ProductFamilyName;
                    break;
                case "winuniversal":
                    ProductResources.GitHub_Link = Resources.WinUniversal.GitHub_link;
                    ProductResources.Home_Link = Resources.WinUniversal.Home_Link;
                    ProductResources.PageTitle_Format = Resources.WinUniversal.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.WinUniversal.ProductFamilyName;
                    break;
                case "testautomationhpwinforms":
                    ProductResources.GitHub_Link = Resources.WinFormsTAHP.GitHub_link;
                    ProductResources.Home_Link = Resources.WinFormsTAHP.Home_Link;
                    ProductResources.PageTitle_Format = Resources.WinFormsTAHP.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.WinFormsTAHP.ProductFamilyName;
                    break;
                case "wpf":
                    ProductResources.GitHub_Link = Resources.WPF.GitHub_link;
                    ProductResources.Home_Link = Resources.WPF.Home_Link;
                    ProductResources.PageTitle_Format = Resources.WPF.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.WPF.ProductFamilyName;
                    break;
                case "xamarin":
                    ProductResources.GitHub_Link = Resources.Xamarin.GitHub_link;
                    ProductResources.Home_Link = Resources.Xamarin.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Xamarin.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Xamarin.ProductFamilyName;
                    break;
                case "shareplusios":
                    ProductResources.GitHub_Link = Resources.SharePlusIOS.GitHub_link;
                    ProductResources.Home_Link = Resources.SharePlusIOS.Home_Link;
                    ProductResources.PageTitle_Format = Resources.SharePlusIOS.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.SharePlusIOS.ProductFamilyName;
                    break;
                case "shareplusandroid":
                    ProductResources.GitHub_Link = Resources.SharePlusAndroid.GitHub_link;
                    ProductResources.Home_Link = Resources.SharePlusAndroid.Home_Link;
                    ProductResources.PageTitle_Format = Resources.SharePlusAndroid.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.SharePlusAndroid.ProductFamilyName;
                    break;
                case "reveal":
                    ProductResources.GitHub_Link = Resources.Reveal.GitHub_link;
                    ProductResources.Home_Link = Resources.Reveal.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Reveal.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Reveal.ProductFamilyName;
                    break;
                case "slingshot":
                    ProductResources.GitHub_Link = Resources.Slingshot.GitHub_link;
                    ProductResources.Home_Link = Resources.Slingshot.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Slingshot.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Slingshot.ProductFamilyName;
                    break;

                /*  
                 *  **** retired products ****
                 *  
                case "lightswitch":
                    ProductResources.GitHub_Link = Resources.Lightswitch.GitHub_link;
                    ProductResources.Home_Link = Resources.Lightswitch.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Lightswitch.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Lightswitch.ProductFamilyName;
                    break;
                case "sharepoint":
                    ProductResources.GitHub_Link = Resources.Sharepoint.GitHub_link;
                    ProductResources.Home_Link = Resources.Sharepoint.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Sharepoint.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Sharepoint.ProductFamilyName;
                    break;
                case "silverlight":
                    ProductResources.GitHub_Link = Resources.Silverlight.GitHub_link;
                    ProductResources.Home_Link = Resources.Silverlight.Home_Link;
                    ProductResources.PageTitle_Format = Resources.Silverlight.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.Silverlight.ProductFamilyName;
                    break;
                case "windowsphone":
                    ProductResources.GitHub_Link = Resources.WindowsPhone.GitHub_link;
                    ProductResources.Home_Link = Resources.WindowsPhone.Home_Link;
                    ProductResources.PageTitle_Format = Resources.WindowsPhone.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.WindowsPhone.ProductFamilyName;
                    break;
                case "windowsui":
                    ProductResources.GitHub_Link = Resources.WindowsUI.GitHub_link;
                    ProductResources.Home_Link = Resources.WindowsUI.Home_Link;
                    ProductResources.PageTitle_Format = Resources.WindowsUI.PageTitle_Format;
                    ProductResources.ProductFamilyName = Resources.WindowsUI.ProductFamilyName;
                    break;
                 */

                default:
                    break;
            }
        }
    }
}