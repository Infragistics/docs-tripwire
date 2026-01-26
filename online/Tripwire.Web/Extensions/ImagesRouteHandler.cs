using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Routing;

namespace Tripwire.Web.Extensions
{
    public class ImagesRouteHandler : IRouteHandler
    {
        public IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            // Although this handler can be literaly used to return the image and dump the response,
            // it feels very gimmicky so taking miniscule more overhead to use proper IhttpHandler too
            return new ImagesHttpHandler();
        }
    }
}