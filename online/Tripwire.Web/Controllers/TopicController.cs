using System;
using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using Tripwire.Domain;
using Tripwire.Domain.ToC;
using Tripwire.Web.Models;

namespace Tripwire.Web.Controllers
{
    public class TopicController : ApiController
    {
        IToCRepository tocRepository;
        ApplicationConfig config = new ApplicationConfig();

        public TopicController()
        {
            this.tocRepository = new ToCRepository(config.ProductPath, config.ToCFilePathFormat);
        }

        public TopicController(IToCRepository tocRepository)
        {
            this.tocRepository = tocRepository;
        }

        public TopicNode Get(string id, string v = "", string product = "")
        {
            Topic topic;
            string path = config.HelpTopicsFolderPath, topicPath = id;

            if (v == "")
            {
                v = config.Latest;
            }
			//else
			//{
			//	topicPath += "?v=" + v;
			//}

            try
            {
                topic = TopicsReader.Read(path, v, id, config.TableClass, v == config.Latest);
            }
            catch (ArgumentException)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }          

            // TODO: Serialize the entire thing instead and/or prepend/append tags if needed on the site (version tags if present?)

            TopicNode selection = new TopicNode();
            List<int> tocPath = new List<int>();

            selection.children = tocRepository.NavigateToChild(topicPath, v, out tocPath, false);
            selection.path = tocPath;
            selection.topicContent = "<div id='document-content'>" + topic.Content + "</div>";

            return selection;
        }
    }
}
