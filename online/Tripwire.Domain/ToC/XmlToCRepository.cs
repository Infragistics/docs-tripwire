using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Tripwire.Domain.ToC
{
    public class XmlToCRepository : ToCRepository
    {
        public XmlToCRepository(string productName, string tocFilePattern) : base(productName, tocFilePattern) { }

        protected override List<ToC> ParseTocFile(string filePath)
        {
            XDocument doc = XDocument.Load(filePath);
            return GetXMLChildren(doc.Element("HelpTOC").Elements("HelpTOCNode"));

        }

        private static List<ToC> GetXMLChildren(IEnumerable<XElement> doc)
        {
            var query = from child in doc
                        select new ToC
                        {
                            title = (string)child.Attribute("Title"),
                            fileName = (string)child.Attribute("Url"),
                            children = child.HasElements ? GetXMLChildren(child.Elements("HelpTOCNode")) : null

                        };
            return query.ToList();
        }
    }
}
