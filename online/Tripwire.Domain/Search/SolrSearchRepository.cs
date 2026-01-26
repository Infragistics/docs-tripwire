//using Microsoft.Practices.ServiceLocation;
using SolrNet;
using SolrNet.Attributes;
using SolrNet.Commands.Parameters;
//using SolrNet.DSL;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CommonServiceLocator;

namespace Tripwire.Domain.Search
{
    public class SolrSearchRepository : ISearchRepository
    {
        private readonly ISolrReadOnlyOperations<SearchItem> _solr;
        private readonly ISolrReadOnlyOperations<SearchAPIItem> _solrAPI;

        private const string FilterProduct = "ig_product";
        private const string FacetControl = "ig_control_friendly";
        private const string FilterCategory = "ig_category";
        private const string FilterHelpGuide = "ig_help_guide";
        private const string FacetKeywords = "keywords";
        private const SearchCategory Category = SearchCategory.HelpTopics;

        public bool Highlight { get; set; }
        public int MaxLength { get; set; }
        /// <summary>
        /// Filter flags for category. Default initalized with Help and API Help Topics.
        /// </summary>
        public SearchCategory CategoryFilter { get; set; }

        public SolrSearchRepository(string solrCollectionAddress)
        {
            try
            {
                if (Startup.Container.GetAllInstances<ISolrReadOnlyOperations<SearchItem>>().Count() <= 0)
                {
                    Startup.Init<SearchItem>(solrCollectionAddress);
                }
                _solr = ServiceLocator.Current.GetInstance<ISolrOperations<SearchItem>>();
            }
            catch (Exception e)
            {
                //TODO: log? move register/Init method in the Global.asax?
                System.Diagnostics.Debug.WriteLine(e.Message);
                throw;
            }
            this.CategoryFilter = Category;
        }

        public SolrSearchRepository(string solrCollectionAddress, string solrAPICollectionAddress)
        {
            try
            {
                if (Startup.Container.GetAllInstances<ISolrReadOnlyOperations<SearchItem>>().Count() <= 0)
                {
                    Startup.Init<SearchItem>(solrCollectionAddress);
                }
                if (Startup.Container.GetAllInstances<ISolrReadOnlyOperations<SearchAPIItem>>().Count() <= 0)
                {
                    Startup.Init<SearchAPIItem>(solrAPICollectionAddress);
                }
                _solr = ServiceLocator.Current.GetInstance<ISolrOperations<SearchItem>>();
                _solrAPI = ServiceLocator.Current.GetInstance<ISolrOperations<SearchAPIItem>>();
            }
            catch (Exception e)
            {
                //TODO: log? move register/Init method in the Global.asax?
                System.Diagnostics.Debug.WriteLine(e.Message);
                throw;
            }
            this.CategoryFilter = Category;
        }

        /// <summary>
        /// Solr search for term filtered by product and with pagination.
        /// </summary>
        /// <param name="query">The search term</param>
        /// <param name="product">Product name (as per Customer Guidance)</param>
        /// <param name="pageIndex">1-based (!) page index</param>
        /// <param name="pageSize">Optional page size. Defaults to 10.</param>
        /// <param name="control">Optional control name filter.</param>
        /// <returns></returns>
        public SearchResults Search(string query, string product, int pageIndex, int pageSize = 10, string control = null, string helpGuide="")
        {
            SearchResults output = new SearchResults
            {
                QueryError = true,
                PageIndex = pageIndex,
                PageSize = pageSize,
                Product = product
            };
            
            if (pageIndex < 1) pageIndex = 1;
            try
            {
                QueryOptions options = new QueryOptions
                {
                    Rows = pageSize,
                    Start = (pageIndex - 1) * pageSize,
                    FilterQueries = GetFilterQueries(product, control,helpGuide),
                    Facet = new FacetParameters
                    {
                        Queries = GetFacetQueries(control)
                    },
                    Highlight = GetHighlightParams()
                };

                //TODO: Refactor this with generic result output?
                if (this.CategoryFilter == SearchCategory.HelpTopics)
                {
                    SolrQueryResults<SearchItem> results = _solr.Query(new SolrQuery(query), options);
                    results.HighlightContent(this.MaxLength);
                    output.QueryError = false;
                    output.Items = results.AsEnumerable();
                    output.TotalCount = results.NumFound;
                    output.Controls = results.FacetFields.ContainsKey(FacetControl) ? results.FacetFields[FacetControl] : null;
                }
                else if (this.CategoryFilter == SearchCategory.HelpApiTopics)
                {
                    SolrQueryResults<SearchAPIItem> results = _solrAPI.Query(new SolrQuery(query), options);
                    results.HighlightContent(this.MaxLength);
                    output.QueryError = false;
                    output.Items = results.AsEnumerable();
                    output.TotalCount = results.NumFound;
                    output.Controls = results.FacetFields.ContainsKey(FacetControl) ? results.FacetFields[FacetControl] : null;
                }

                return output;
            }
            catch (Exception)
            {
                return new SearchResults
                {
                    QueryError = true
                };
            }
        }
        
        private ICollection<ISolrQuery> GetFilterQueries(string product, string control,string helpGuide)
        {
            ICollection<ISolrQuery> solrQueries = new Collection<ISolrQuery>();
            if (!string.IsNullOrEmpty(product))
            {
                //solrQueries.Add(Query.Field(FilterProduct).Is(product));
                solrQueries.Add(new SolrQueryByField(FilterProduct,product));
               
            }
            if (!string.IsNullOrEmpty(control))
            {
                //solrQueries.Add(Query.Field(FacetControl).Is(control));
                solrQueries.Add(new SolrQueryByField(FacetControl, control));
            }

            if (!string.IsNullOrEmpty(helpGuide))
            {
                solrQueries.Add(new SolrQueryByField(FilterHelpGuide, helpGuide));
            }

            //solrQueries.Add(Query.Field(FilterCategory).In(this.CategoryFilter.GetValues()));
            solrQueries.Add(new SolrQueryInList(FilterCategory, this.CategoryFilter.GetValues()));

            return solrQueries;
        }

        private ICollection<ISolrFacetQuery> GetFacetQueries(string control)
        {
            ICollection<ISolrFacetQuery> facetQueries = new Collection<ISolrFacetQuery>();
            if (string.IsNullOrEmpty(control))
            {
                facetQueries.Add(new SolrFacetFieldQuery(FacetControl) { MinCount = 1 });
            }
            //TODO: facetQueries.Add(new SolrFacetFieldQuery(FacetKeywords) { MinCount = 1 });

            return facetQueries;
        }

        private HighlightingParameters GetHighlightParams()
        {
            if (this.Highlight)
            {
                return new HighlightingParameters
                {
                    Fields = new[] { "content" }
                };
            }
            return null;
        }
    }
}
