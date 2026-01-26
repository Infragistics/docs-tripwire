using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Tripwire.Domain.Search;
using Tripwire.Web.Filters;

namespace Tripwire.Web.Controllers
{
	[ProxyRequireHttps]
    public class SearchController : Controller
    {
        ISearchRepository searchRepository;
        ApplicationConfig config = new ApplicationConfig();

        
        public SearchController()
        {
            if (config.APISearchTab)
            {
                // setup repo for two Solr cores
                this.searchRepository = new SolrSearchRepository(config.SearchAddress, config.SearchAPIAddress);
            }
            else
            {
                this.searchRepository = new SolrSearchRepository(config.SearchAddress);
            }
        }

        public SearchController(ISearchRepository searchRepository)
        {
            this.searchRepository = searchRepository;
        }

        //
        // GET: /Search/

        [HttpGet]
        [CanonicalFilter]
        public ActionResult Search(string query, int page = 1, int pageSize = 10, string v = "", string product = "", bool API = false)
        {
            SearchResults result;
            this.SetProduct(product, config);

            this.searchRepository.Highlight = true;
            this.searchRepository.MaxLength = 300;
            ViewBag.APISearchTab = config.APISearchTab;
            ViewBag.API = API;
            string searchProduct = !String.IsNullOrEmpty(config.SearchProduct)?config.SearchProduct: ViewBag.ProductFamilyName;
            string searchGuide = !String.IsNullOrEmpty(config.SearchGuide) ? config.SearchGuide : String.Empty;

            if (config.APISearchTab)
            {
                if (API)
                {
                    this.searchRepository.CategoryFilter = SearchCategory.HelpApiTopics;
                    result = this.searchRepository.Search(query, searchProduct, page, pageSize, helpGuide: searchGuide);

                    this.searchRepository.CategoryFilter = SearchCategory.HelpTopics;
                }
                else
                {
                    this.searchRepository.CategoryFilter = SearchCategory.HelpTopics;
                    result = this.searchRepository.Search(query, searchProduct, page, pageSize, helpGuide: searchGuide);

                    this.searchRepository.CategoryFilter = SearchCategory.HelpApiTopics;
                }
                //request 0 results, just for the count
                ViewBag.SecondaryTabCount = this.searchRepository.Search(query, searchProduct, 1, 0, helpGuide: searchGuide).TotalCount;
                
            }
            else
            {
                this.searchRepository.CategoryFilter = SearchCategory.HelpTopics;
                result = this.searchRepository.Search(query, searchProduct, page, pageSize, helpGuide: searchGuide);
            }
            ViewBag.PublishedVersions = config.PublishedVersions;
            ViewBag.Query = query;
            ViewBag.Version = v;
            ViewBag.Title = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(Resources.Main.Search);

            #if (DEBUG || BETA)
            // temporary fix the links returned by Solr untill correct links are indexed
            Tripwire.Domain.RouteTransformer transformer = new Tripwire.Domain.RouteTransformer();
            result.Items = result.Items.Select(x => { x.Link = transformer.Transform(x.Link).Replace(' ', '-').Replace("jquery/", ""); return x;} );
            #endif

            if (config.StripSearchResultUrls)
            {
                //for local/dev/staging viewers, assumes current configs where the topics are all in a single location (no hierarchy)
                result.Items = result.Items.Select(x => { x.Link = x.Link.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries).Last(); return x; });
            }

			if (v != "")
			{
				// D.P. Add version to latest path. Similar to StripSearchResultUrls (dev/staging only) but works on absolute production results
				string targetBasePath = Url.Action("index", "topics");
				string latestBasePath = targetBasePath.Replace("/" + v, "");
				result.Items = result.Items.Select(x => { 
					x.Link = x.Link.Replace(latestBasePath, targetBasePath);
					return x;
				});
			}

            return View(result);
        }

    }
}
