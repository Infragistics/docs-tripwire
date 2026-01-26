using System;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Tripwire.Domain;
using System.Net;
using Elmah;

namespace Tripwire.Web.Controllers
{
    public class TopicFeedbackController : ApiController
    {
        TopicFeedbackRepository _repository;

        public TopicFeedbackController()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["TopicFeedback"].ConnectionString;
            this._repository = new TopicFeedbackRepository(connectionString);
        }

        [HttpGet]
        public HttpResponseMessage AddRating(bool isPositiveFeedback, string product, string platform, string version, string culture, string url)
        {
            try
            {
                string userName = HttpContext.Current.Request.LogonUserIdentity.Name;
                int id = this._repository.AddRating(isPositiveFeedback, userName, product, platform, version, culture, url);
                return Request.CreateResponse(HttpStatusCode.OK, id);
            }
            catch (Exception ex)
            {
                var signal = ErrorSignal.FromCurrentContext();
                signal.Raise(ex);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, "Server error. Check ELMAH publishers for details.");
            }
        }

        [HttpGet]
        public HttpResponseMessage AddFeedback(int id, string comments)
        {
            try
            {
                this._repository.AddFeedback(id, comments);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                var signal = ErrorSignal.FromCurrentContext();
                signal.Raise(ex);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, "Server error. Check ELMAH publishers for details.");
            }
        }
    }
}
