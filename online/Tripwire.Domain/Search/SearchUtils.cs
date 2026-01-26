using SolrNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.Search
{
    public static class SearchUtils
    {
        /// <summary>
        /// Highlight search results and also trims the resulting content to a maximum for display purposes.
        /// </summary>
        /// <typeparam name="T">Must be SearchItem</typeparam>
        /// <param name="results"></param>
        /// <param name="maxLength">The maximum string length for content</param>
        public static void HighlightContent<T>(this SolrQueryResults<T> results, int maxLength) where T : SearchItem
        {
            for (int i = 0; i < results.Count; i++)
            {
                foreach (var h in results.Highlights[results[i].Id])
                {
                    string match = h.Value.First().Replace("<em>", "").Replace("</em>", "");
                    if (results[i].Content.IndexOf(match) + match.Length > maxLength)
                    {
                        results[i].Content = results[i].Content.Substring(0, maxLength - h.Value.First().Length - 7);
                        results[i].Content += "... " + h.Value.First() + "...";
                    }
                    else
                    {
                        results[i].Content = results[i].Content.Replace(match, h.Value.First());
                    }
                }
            }
        }
    }
}
