using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.Search
{
    public class SearchResults
    {
        public string Product { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public IEnumerable<SearchItem> Items { get; set; }
        public int TotalCount { get; set; }
        public bool QueryError { get; set; }
        public IEnumerable<KeyValuePair<string, int>> Controls { get; set; }
        //public IEnumerable<KeyValuePair<string, int>> Keywords { get; set; }
    }
}
