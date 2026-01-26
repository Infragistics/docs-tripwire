using System.Web.Mvc;

namespace Tripwire.Web.Controllers
{
    public static class ControllerExtensions
    {
        public static void SetProduct(this Controller controller, string product, ApplicationConfig config)
        {
            controller.ViewBag.Product = product;
            controller.ViewBag.SubProduct = config.SubProduct;

            controller.ViewBag.ProductURL = string.IsNullOrEmpty(config.SubProduct) ? product : string.Format("{0}/{1}", product, config.SubProduct);

            controller.ViewBag.ProductList = config.ProductListPattern;
            controller.ViewBag.SubProductList = config.SubProductListPattern;
            controller.ViewBag.Logo = config.Logo;
            controller.SetResources(config.ResourceName);
        }

        public static void SetResources(this ControllerBase controller, string resource)
        {
            // aspnet|lightswitch|reporting|sharepoint|silverlight|windowsphone|windowsui|winforms|wpf|reportplus-desktop
			controller.ViewBag.APISearchTabName = Resources.Main.Search_APITabName;

            switch (resource.ToLower())
            {
                case "android":
                    controller.ViewBag.GitHub_Link = Resources.Android.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Android.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Android.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Android.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.Android.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.Android.MainSite_ProductPath;
                    break;
                case "aspnet":
                    controller.ViewBag.GitHub_Link = Resources.ASPNET.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.ASPNET.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.ASPNET.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.ASPNET.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.ASPNET.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.ASPNET.MainSite_ProductPath;
                    break;
                case "igniteui":
                    controller.ViewBag.GitHub_Link = Resources.IgniteUI.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.IgniteUI.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.IgniteUI.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.IgniteUI.ProductFamilyName;
                    controller.ViewBag.APISearchTabName = Resources.IgniteUI.Search_APITabName;
					controller.ViewBag.MainSite_DownloadPath = Resources.IgniteUI.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.IgniteUI.MainSite_ProductPath;
                    break;
                case "ios":
                    controller.ViewBag.GitHub_Link = Resources.iOS.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.iOS.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.iOS.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.iOS.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.iOS.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.iOS.MainSite_ProductPath;
                    break;
                case "reporting":
                    controller.ViewBag.GitHub_Link = Resources.Reporting.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Reporting.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Reporting.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Reporting.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.Reporting.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.Reporting.MainSite_ProductPath;
                    break;
                case "reportplusandroid":
                    controller.ViewBag.GitHub_Link = Resources.ReportPlusAndroid.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.ReportPlusAndroid.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.ReportPlusAndroid.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.ReportPlusAndroid.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.ReportPlusAndroid.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.ReportPlusAndroid.MainSite_ProductPath;
                    break;
                case "reportplusdesktop":
                    controller.ViewBag.GitHub_Link = Resources.ReportPlusDesktop.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.ReportPlusDesktop.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.ReportPlusDesktop.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.ReportPlusDesktop.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.ReportPlusDesktop.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.ReportPlusDesktop.MainSite_ProductPath;
                    break;
                case "reportplusios":
                    controller.ViewBag.GitHub_Link = Resources.ReportPlusIOS.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.ReportPlusIOS.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.ReportPlusIOS.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.ReportPlusIOS.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.ReportPlusIOS.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.ReportPlusIOS.MainSite_ProductPath;
                    break;
                case "reportplusweb":
                    controller.ViewBag.GitHub_Link = Resources.ReportPlusWeb.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.ReportPlusWeb.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.ReportPlusWeb.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.ReportPlusWeb.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.ReportPlusWeb.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.ReportPlusWeb.MainSite_ProductPath;
                    break;
                case "winforms":
                    controller.ViewBag.GitHub_Link = Resources.WinForms.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WinForms.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WinForms.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WinForms.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.WinForms.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.WinForms.MainSite_ProductPath;
                    break;
                case "winuniversal":
                    controller.ViewBag.GitHub_Link = Resources.WinUniversal.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WinUniversal.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WinUniversal.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WinUniversal.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.WinUniversal.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.WinUniversal.MainSite_ProductPath;
                    break;
                case "winformstahp":
                    controller.ViewBag.GitHub_Link = Resources.WinFormsTAHP.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WinFormsTAHP.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WinFormsTAHP.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WinFormsTAHP.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.WinFormsTAHP.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.WinFormsTAHP.MainSite_ProductPath;
                    break;
                case "winformstaibm":
                    controller.ViewBag.GitHub_Link = Resources.WinFormsTAIBM.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WinFormsTAIBM.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WinFormsTAIBM.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WinFormsTAIBM.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.WinFormsTAIBM.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.WinFormsTAIBM.MainSite_ProductPath;
                    break;
                case "wpftahp":
                    controller.ViewBag.GitHub_Link = Resources.WPFTAHP.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WPFTAHP.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WPFTAHP.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WPFTAHP.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.WPFTAHP.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.WPFTAHP.MainSite_ProductPath;
                    break;
                case "wpf":
                    controller.ViewBag.GitHub_Link = Resources.WPF.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WPF.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WPF.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WPF.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.WPF.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.WPF.MainSite_ProductPath;
                    break;
                case "xamarin":
                    controller.ViewBag.GitHub_Link = Resources.Xamarin.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Xamarin.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Xamarin.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Xamarin.ProductFamilyName;
					controller.ViewBag.MainSite_DownloadPath = Resources.Xamarin.MainSite_DownloadPath;
					controller.ViewBag.MainSite_ProductPath = Resources.Xamarin.MainSite_ProductPath;
                    break;
                case "shareplusandroid":
                    controller.ViewBag.GitHub_Link = Resources.SharePlusAndroid.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.SharePlusAndroid.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.SharePlusAndroid.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.SharePlusAndroid.ProductFamilyName;
                    controller.ViewBag.MainSite_DownloadPath = Resources.SharePlusAndroid.MainSite_DownloadPath;
                    controller.ViewBag.MainSite_ProductPath = Resources.SharePlusAndroid.MainSite_ProductPath;
                    break;
                case "shareplusios":
                    controller.ViewBag.GitHub_Link = Resources.SharePlusIOS.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.SharePlusIOS.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.SharePlusIOS.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.SharePlusIOS.ProductFamilyName;
                    controller.ViewBag.MainSite_DownloadPath = Resources.SharePlusIOS.MainSite_DownloadPath;
                    controller.ViewBag.MainSite_ProductPath = Resources.SharePlusIOS.MainSite_ProductPath;
                    break;
                case "reveal":
                    controller.ViewBag.GitHub_Link = Resources.Reveal.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Reveal.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Reveal.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Reveal.ProductFamilyName;
                    controller.ViewBag.MainSite_DownloadPath = Resources.Reveal.MainSite_DownloadPath;
                    controller.ViewBag.MainSite_ProductPath = Resources.Reveal.MainSite_ProductPath;
                    break;
                case "slingshot":
                    controller.ViewBag.GitHub_Link = Resources.Slingshot.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Slingshot.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Slingshot.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Slingshot.ProductFamilyName;
                    controller.ViewBag.MainSite_DownloadPath = Resources.Slingshot.MainSite_DownloadPath;
                    controller.ViewBag.MainSite_ProductPath = Resources.Slingshot.MainSite_ProductPath;
                    break;

                /*
                 * *** retired products ***
                 * 
                case "lightswitch":
                    controller.ViewBag.GitHub_Link = Resources.Lightswitch.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Lightswitch.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Lightswitch.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Lightswitch.ProductFamilyName;
                    break; 
                case "sharepoint":
                    controller.ViewBag.GitHub_Link = Resources.Sharepoint.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Sharepoint.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Sharepoint.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Sharepoint.ProductFamilyName;
                    break;
                case "silverlight":
                    controller.ViewBag.GitHub_Link = Resources.Silverlight.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.Silverlight.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.Silverlight.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.Silverlight.ProductFamilyName;
                    break;
                case "windowsphone":
                    controller.ViewBag.GitHub_Link = Resources.WindowsPhone.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WindowsPhone.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WindowsPhone.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WindowsPhone.ProductFamilyName;
                    break;
                case "windowsui":
                    controller.ViewBag.GitHub_Link = Resources.WindowsUI.GitHub_link;
                    controller.ViewBag.Home_Link = Resources.WindowsUI.Home_Link;
                    controller.ViewBag.PageTitle_Format = Resources.WindowsUI.PageTitle_Format;
                    controller.ViewBag.ProductFamilyName = Resources.WindowsUI.ProductFamilyName;
                    break;
                */

                default:
                    break;
            }
        }
    }
}