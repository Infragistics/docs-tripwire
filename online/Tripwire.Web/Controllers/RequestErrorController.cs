using Elmah;
using Tripwire;
using System;
using System.Web.Mvc;
using Tripwire.Web.Filters;

namespace Tripwire.Web.Controllers
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }

	[ProxyRequireHttps]
    public class RequestErrorController : Controller
    {
        private string BadUrl
        {
            get
            {
                if (Request.QueryString["aspxerrorpath"] != null)
                {
                    return Request.QueryString["aspxerrorpath"].ToString();
                }

                return string.Empty;
            }
        }
        ApplicationConfig config = new ApplicationConfig();

        public RequestErrorController()
        {
            ViewBag.PublishedVersions = config.PublishedVersions;
        }

        [CanonicalFilter]
        public ActionResult NotFound()
        {
            if (!string.IsNullOrEmpty(this.BadUrl))
            {
                var ex = new NotFoundException(this.BadUrl);

                var signal = ErrorSignal.FromCurrentContext();
                signal.Raise(ex);
            }
            return View();
        }

        [CanonicalFilter]
        public ActionResult ServerError()
        {
            var ex = Server.GetLastError();

            if (ex != null)
            {
                var signal = ErrorSignal.FromCurrentContext();
                signal.Raise(ex);
            }
            return View();
        }
    }
}
