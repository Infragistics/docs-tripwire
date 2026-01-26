using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Tripwire.Domain.ToC;

namespace Tripwire.Web.Models
{
    public class TocSelection
    {
        public List<ToC> children { get; set; }
        public List<int> path { get; set; }
    }

    public class TopicNode : TocSelection
    {
        public string topicContent { get; set; }
    }
}