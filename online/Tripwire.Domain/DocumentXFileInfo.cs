using HtmlAgilityPack;

namespace Tripwire.Domain
{
    public class DocumentXFileInfo
    {
        public static bool IsDocumentXFileName(string fileName)
        {
            return fileName.Contains("~");
        }

        public static bool IsDocumentXContent(HtmlDocument doc)
        {
            return doc.DocumentNode.InnerHtml.Contains(@"id=""BodyContent""");
        }
    }
}
