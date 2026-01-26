using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Tripwire.Web.Controllers
{
    public class SitemapController : Controller
    {
        const string ContentType = "text/xml";
        ApplicationConfig config = new ApplicationConfig();
        //
        // GET: /Sitemap/

        public FileResult Index(string product, string postfix = "")
        {
            string pathFormat = String.Format(config.HelpTopicsFolderPath, config.Latest) + @"\sitemap{0}.xml";
            string location = String.Format(pathFormat, postfix);

            return base.File(location, ContentType);
        }

    }
}
