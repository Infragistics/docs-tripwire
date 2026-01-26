using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Tripwire.Web.Filters;

namespace Tripwire.Web.Controllers
{
	[ProxyRequireHttps]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        ApplicationConfig config = new ApplicationConfig();
        public ActionResult Sitemap()
        {

            string filePath = config.HelpTopicsFolderPath;
            filePath = Path.Combine(filePath, config.Latest, "sitemap.xml");
            return File(filePath, "text/xml");
        }

        public ActionResult Robots()
        {
            string fileName = Server.MapPath("~/robots._txt");
            using (StreamReader reader = new StreamReader(fileName, true))
            {
                string fileContent = reader.ReadToEnd();

                fileContent += "\r\nSitemap: " + Url.Action("Sitemap", "Home", null, Request.Url.Scheme);
                
                return Content(fileContent, "text/plain");
            }

            
        }

    }
}
