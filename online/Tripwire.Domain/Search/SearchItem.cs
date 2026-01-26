using SolrNet.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.Search
{
    public class SearchItem
    {
        [SolrUniqueKey("id")]
        public string Id { get; set; }

        [SolrField("title")]
        public string Title { get; set; }

        [SolrField("url")]
        public string Link { get; set; }

        [SolrField("content")]
        public string Content { get; set; }

        [SolrField("keywords")]
        public ICollection<string> Keywords { get; set; }

        [SolrField("ig_platform")]
        public string Platform { get; set; }

        [SolrField("ig_product")]
        public string ProductName { get; set; }

        [SolrField("ig_control_group")]
        public ICollection<string> Groups { get; set; }

        [SolrField("ig_control_friendly")]
        public ICollection<string> Controls { get; set; }

        [SolrField("ig_category")]
        public string ContentType { get; set; }
    }

    /// <summary>
    /// Making a separate class for API core as:
    /// The built-in container (Startup) is currently limited to access multiple cores/instances with different mapped types.
    /// https://github.com/mausch/SolrNet/blob/master/Documentation/Multi-core-instance.md#with-built-in-container
    /// </summary>
    public class SearchAPIItem : SearchItem
    {
        //[SolrField("ig_api_member")]
        //public ICollection<string> APIMember { get; set; }
    }
}
