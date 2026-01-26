using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.Search
{
    public interface ISearchRepository
    {
        bool Highlight { get; set; }
        int MaxLength { get; set; }
        SearchCategory CategoryFilter { get; set; }

        SearchResults Search(string query, string product, int pageIndex, int pageSize, string control = null, string helpGuide = "");
    }
}
