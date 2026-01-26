using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Tripwire.Domain
{
    public class RouteTransformer
    {
        private List<ITransformRule> _rules = new List<ITransformRule>();

        public static string GetShortVersionNumber(string version)
        {
            return version.Substring(2, version.Length - 2).Replace("-", ".");
        }

        public RouteTransformer() 
        {
            this._rules.Add(new LowerCaseRule());
            this._rules.Add(new ReplaceUnderscoresWithDashesRule());
            this._rules.Add(new RemoveFileExtensionRule());
            this._rules.Add(new ResetDirectoriesRule());
            this._rules.Add(new RemoveQueryStringRule());
            this._rules.Add(new RemoveSpacesRule());
        }

        public string Transform(string route)
        {
            if (!DocumentXFileInfo.IsDocumentXFileName(route))
            {
                foreach (var rule in this._rules)
                {
                    route = rule.Apply(route);
                }
            }

            return route;
        }
    }

    public interface ITransformRule
    {
        string Apply(string original);
    }

    public class LowerCaseRule : ITransformRule
    {
        public string Apply(string original)
        {
            return original.ToLower();
        }
    }

    public class ReplaceUnderscoresWithDashesRule : ITransformRule
    {
        public string Apply(string original)
        {
            return original.Replace("_", "-");
        }
    }

    public class RemoveSpacesRule : ITransformRule
    {
        public string Apply(string original)
        {
            return original.Replace(" ", "-");
        }
    }

    public class RemoveFileExtensionRule : ITransformRule
    {
        public string Apply(string original)
        {
            return original.Replace(".html", "").Replace(".htm", "");
        }
    }

    public class ResetDirectoriesRule : ITransformRule
    {
        public string Apply(string original)
        {
            Match m = Regex.Match(original, "doc/(\\w+)/(?:20(\\d\\d\\.\\d)/)?(?:clr\\d\\.\\d/)?(?:\\?page=([^/]+\\.html?))?", RegexOptions.IgnoreCase);
            if(m.Success){
                //m.Groups[1].Value // platform
                //m.Groups[2].Value // version 
                //m.Groups[3].Value // page
                original = m.Groups[3].Value + ( String.IsNullOrEmpty(m.Groups[2].Value) ? "?v=" + m.Groups[0].Value : "" );
            }

            return original;
        }
    }

    public class RemoveQueryStringRule : ITransformRule
    {
        public string Apply(string original)
        {
            return original.Replace("?page=", "");
        }
    }
}
