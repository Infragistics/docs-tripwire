using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Caching;

namespace Tripwire.Web.Extensions
{
    public class ImagesHttpHandler : IHttpHandler
    {
        public bool IsReusable
        {
            // making process independant of sharing context with route handler
            get { return true; }
        }

        ApplicationConfig config = new ApplicationConfig();

        public void ProcessRequest(HttpContext context)
        {
            string fileName = Path.GetFileName(context.Request.Path);

            // [version]/{images}/file
            string[] pathParts = context.Request.Path.Split(Path.AltDirectorySeparatorChar);
            string imagesFolder = pathParts.First(x => x.ToLower().Contains("images"));
            int index = Array.IndexOf(pathParts, imagesFolder);
            string version = index > 0 ? pathParts[index - 1] : null;

            //helproot path
            string filePath = config.HelpTopicsFolderPath;

            if (config.PublishedVersions.Contains(version))
            {
                filePath = string.Format(filePath, version);
            }
            else
            {
                filePath = string.Format(filePath, config.Latest);
            }
            filePath = Path.Combine(filePath, imagesFolder, fileName);

            if (File.Exists(filePath))
            {
                context.Response.WriteFile(filePath);

                // cache:
                context.Response.Cache.SetCacheability(HttpCacheability.Public);
                context.Response.Cache.SetExpires(Cache.NoAbsoluteExpiration);

                context.Response.ContentType = MimeMapping.GetMimeMapping(context.Request.CurrentExecutionFilePathExtension);
            }
            else
            {
                context.Response.ClearHeaders();
                context.Response.Clear();

                context.Response.StatusCode = 404;
                context.Response.SuppressContent = true;
            }

            //Match matches = Regex.Match(context.Request.Path, "((?:\\d\\d.\\d\\/)?(images|webimages|dotnetimages)\\/.+)$");
            //if (matches.Success) {  }
        }
    }

    /// <summary>
    /// Poor man's MimeMapping for .NET4.0 ...
    /// </summary>
    public static class MimeMapping
    {
        private static Dictionary<string, string> mimeMap = new Dictionary<string, string>
        {
            {".bmp", "image/bmp"},
            {".gif", "image/gif"},
            {".jpg", "image/jpeg"},
            {".png", "image/png"}
        };

        public static string GetMimeMapping(string filename)
        {
            string pathExt = Path.GetExtension(filename);
            return mimeMap[pathExt];
        }
    }
}