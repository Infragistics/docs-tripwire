using System.Collections.Generic;
using System.Web.Http;
using Tripwire.Domain.ToC;
using Tripwire.Web.Models;

namespace Tripwire.Web.Controllers
{
    public class TreeController : ApiController
    {
        IToCRepository tocRepository;
        ApplicationConfig config = new ApplicationConfig();

        public TreeController()
        {
            this.tocRepository = new ToCRepository(config.ProductPath, config.ToCFilePathFormat);
        }

        public TreeController(IToCRepository tocRepository)
        {
            this.tocRepository = tocRepository;
        }

        /// <summary>
        /// initial data and children load on demand
        /// </summary>
        /// <param name="path">Optional path to expand</param>
        /// <returns></returns>
        public List<ToC> GetNodes(string tocPath = "", string v = "")
        {
            v = string.IsNullOrEmpty(v) ? config.Latest : v;
            return tocRepository.Nodes(tocPath, v);
        }

        /// <summary>
        /// Entire hierarchy up to the requested page
        /// </summary>
        /// <param name="id">name (url) of the page</param>
        /// <returns></returns>
        public TocSelection Get(string id, string v = "")
        {
            TocSelection selection = new TocSelection();
            List<int> path = new List<int>();
            if (string.IsNullOrEmpty(v))
            {
                v = config.Latest;
            }

            selection.children =  tocRepository.NavigateToChild(id, v, out path, false);
            if (selection.children == null)
            {
                selection.children = tocRepository.Nodes("", v);
            }
            selection.path = path;

            return selection;
        }
    }
}