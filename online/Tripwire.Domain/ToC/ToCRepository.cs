using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Web.Caching;
using System.Web;

namespace Tripwire.Domain.ToC
{
    public class ToCRepository : IToCRepository
    {
        string filePattern;
        string _productName = string.Empty;

        public ToCRepository(string productName, string tocFilePattern)
        {
            this._productName = productName;
            this.filePattern = tocFilePattern;
        }

        List<ToC> LoadToCFile(string productName, string version)
        {
            //using System.Web.Caching because of a bug in 4.0 runtime(shared) caching:
            //http://stackoverflow.com/questions/7422859/memorycache-empty-returns-null-after-being-set

            List<ToC> toc = (List<ToC>)HttpRuntime.Cache[_productName + "-" + version];
            if (toc == null )
            {
                string filePath = string.Format(this.filePattern, version);
                // load from file 
				CacheDependency dependency = new CacheDependency(filePath);
                toc = this.ParseTocFile(filePath);
				HttpRuntime.Cache.Insert(_productName + "-" + version, toc, dependency);
            }
            return toc;
        }

        protected virtual List<ToC> ParseTocFile(string filePath)
        {
            using (StreamReader read = new StreamReader(filePath))
            {
                string json = read.ReadToEnd();

                // TODO - remove
                // CS:  Added for backwards compatibility for older help sets that
                //      have not yet been re-generated to remove querystring param
                json = Regex.Replace(json, @"\?v=[0-9]{1,2}\.[0-9]{1,1}", "");

                return JsonConvert.DeserializeObject<List<ToC>>(json);
            }
        }

        public List<ToC> Nodes(string path, string version)
        {

            List<ToC> toc = LoadToCFile(_productName, version);
            List<ToC> children = new List<ToC>();
            if (path == "")
            {
                return NodesSelector(toc).ToList();
            }

            var indices = path.Split('_').Select(x => int.Parse(x)).ToArray();

            if (indices.Count() > 0)
            {
                children = toc[indices.First()].children;

                for (int i = 1; i < indices.Length; i++)
                {
                    children = children[indices[i]].children;
                }
                
                return NodesSelector(children).ToList();
            }
            return children;
        }

        public List<ToC> NavigateToChild(string page, string version, out List<int> path, bool returnTopLevel = false)
        {
            List<ToC> toc = LoadToCFile(_productName, version);
            return _navigateToChild(page, toc, out path, returnTopLevel);
        }

        private List<ToC> _navigateToChild(string page, List<ToC> items, out List<int> path, bool returnTopLevel = false)
        {
            path = new List<int>();
            for (var i = 0; i < items.Count; i++)
            {
                if (items.ElementAt(i).fileName.ToLower() == page.ToLower())
                {
                    var selectedChild = from item in items
                                        select new ToC
                                        {
                                            title = item.title,
                                            fileName = item.fileName,
                                            orderBy = item.orderBy,
                                            children = (item.children != null && item.children.Count > 0) ? new List<ToC>() : null
                                        };
                    List<ToC> nodes = selectedChild.ToList();
                    path.Add(i);
                    return nodes;
                }
                if (items[i].children != null && items[i].children.Count > 0)
                {
                    List<ToC> selection = _navigateToChild(page, items.ElementAt(i).children, out path, returnTopLevel);

                    if (selection != null)
                    {
                        var children = (from item in items
                                        select new ToC
                                        {
                                            title = item.title,
                                            fileName = item.fileName,
                                            orderBy = item.orderBy,
                                            children = (item.children != null && item.children.Count > 0) ? new List<ToC>() : null
                                        }).ToList();

                        if (returnTopLevel == false)
                        {
                            children.ElementAt(i).children = selection;
                            selection = children;
                            path.Add(i);
                        }

                        return selection;
                    }
                }
            }

            return null;
        }

        private static IEnumerable<ToC> NodesSelector(List<ToC> items)
        {
            return from i in items
                   select new ToC
                   {
                       title = i.title,
                       fileName = i.fileName,
                       orderBy = i.orderBy,
                       children = (i.children != null && i.children.Count > 0) ? new List<ToC>() : null
                   };
        }
    }
}
