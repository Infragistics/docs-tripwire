using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.Search
{
    [Flags]
    public enum SearchCategory
    {
        [Description("Help Topic")]
        HelpTopics,
        [Description("Help API Topic")]
        HelpApiTopics,
        [Description("jQuery API Topic")]
        JsApiTopics
    }

    public static class SearchCategoryExt {        
        /// <summary>
        /// Get string array of values from enum flags.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public static string[] GetValues(this SearchCategory category) {
            List<string> values = new List<string>();
            Array categories = Enum.GetValues(typeof(SearchCategory));
            
            // TODO: skipping reflecting description for now
            if (category.HasFlag(SearchCategory.HelpTopics))
            {
                values.Add("Help Topic");
            }
            if (category.HasFlag(SearchCategory.HelpApiTopics))
            {
                values.Add("Help API Topic");
            }
            if (category.HasFlag(SearchCategory.JsApiTopics))
            {
                values.Add("jQuery API Topic");
            }

            return values.ToArray();
        }
    }
}
