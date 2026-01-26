using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;


namespace Tripwire.Domain
{
    public class Topic
    {
        private string _filePathAndName = string.Empty;
        
        public string Title { get; set; }
        public string Content { get; set; }
        public List<string> Tags { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }
        public string TableClass { get; set; }
        public string Version { get; set; }

        public Topic(string filePathAndName)
        {
            this._filePathAndName = filePathAndName;
            this.Tags = new List<string>();
        }

        private string GetTextFromFirstElement(HtmlDocument doc, string element)
        {
            var matches = doc.DocumentNode.Descendants(element).ToList();
            string returnValue = string.Empty;

            if (matches.Count > 0)
            {
                returnValue = matches[0].InnerText;
            }

            return returnValue;
        }

        private string GetMetaDescriptionText(string documentText)
        {
            string key = "|metadata|";

            string description = documentText.Replace("-->", "").Replace("\n", " ");
            description = Regex.Replace(description, @"\s{2,}", " ");
            int start = (description.LastIndexOf(key) + key.Length);
            description = description.Substring(start, Math.Min(description.Length - start, 157)).Trim() + "...";

            description = description.TrimStart(" - ".ToCharArray());

            return description.TrimStart();
        }

        private string GetMetaKeywordsText(string documentText)
        {
            // todo: this will match any string of 'key'
            // make to match only inside metadata
            string key = "tags";
            string tags = string.Empty;

            if (documentText.IndexOf(key) > 0)
            {
                tags = documentText.Substring(documentText.IndexOf(key) + key.Length + 1);
                tags = tags.Substring(tags.IndexOf('[') + 1);
                tags = tags.Substring(0, tags.IndexOf(']'));
                tags = tags.Replace("\"", "");
            }
            return tags;
        }

        public void Read()
        {
            var doc = new HtmlDocument();
            HtmlNode node = null;
            string content;

            doc.Load(this._filePathAndName, true);

            if (DocumentXFileInfo.IsDocumentXContent(doc))
            {
                this.Title = this.GetTextFromFirstElement(doc, "title");

                node = doc.GetElementbyId("BodyContent");

                content = node.InnerHtml;

                this.MetaDescription = this.GetMetaDescriptionText(node.InnerText);

                // TODO: Move class to replace to config file
                content = content.Replace("<table class=\"" + this.TableClass, "<div class=\"document-table-container\"><table class=\"table table-striped\"");
                content = content.Replace("</table>", "</table></div>");

                // TODO: strip out anchor tags for elements like:
                //      <a href="#" onclick="javascript:{DOCUMENTX-SPECIFIC-JAVASCRIPT-FUNCTION}">{DISPLAY-TEXT}</a>
                //content = Regex.Replace(content, @"onclick=""javascript:.*""", @"onclick=""javascript:return false;""");

                content = Regex.Replace(content, @"href=""#""", string.Empty);
                content = content.Replace("<a name=\"seealsobookmark\"></a>", "");
                content = content.Replace("<a href=\"#top\">Top</a>", "");

                this.Content = string.Format("<h1>{0}</h1>{1}{2}",
                    this.Title,
                    Environment.NewLine,
                    content);
            }
            else
            {
                this.Title = this.GetTextFromFirstElement(doc, "h1");

                this.MetaKeywords = this.GetMetaKeywordsText(doc.DocumentNode.InnerText);
                this.MetaDescription = this.GetMetaDescriptionText(doc.DocumentNode.InnerText);

                //strip metadata comment:
                HtmlNode metadataComment = doc.DocumentNode.ChildNodes.FindFirst("comment");
                if (metadataComment != null)
                {
                    if (metadataComment.ParentNode != doc.DocumentNode)
                    {
                        metadataComment = metadataComment.ParentNode;
                    }
                    doc.DocumentNode.RemoveChild(metadataComment);
                }

                content = doc.DocumentNode.InnerHtml;

                // TODO - remove
                // CS:  Added for backwards compatibility for older help sets that
                //      have not yet been re-generated to version from image path
                content = Regex.Replace(content, @"src=""[0-9]{1,2}\.[0-9]\/", @"src=""", RegexOptions.IgnoreCase);

                this.Content = content;
            }

        }
    }
}
