using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.ToC
{
    public class ToC
    {
        public string title { get; set; }
        public string fileName { get; set; }
        public string orderBy { get; set; }
        public List<ToC> children { get; set; }
    }
}
