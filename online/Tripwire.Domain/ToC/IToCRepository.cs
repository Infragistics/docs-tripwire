using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tripwire.Domain.ToC
{
    public interface IToCRepository
    {
        List<ToC> Nodes(string path, string version);
        List<ToC> NavigateToChild(string page, string version, out List<int> path, bool returnTopLevel);
    }
}
