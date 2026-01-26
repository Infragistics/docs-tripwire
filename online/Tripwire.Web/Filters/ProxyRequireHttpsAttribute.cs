using System;
using System.Web.Mvc;

namespace Tripwire.Web.Filters
{
    /// <summary>
    /// Filter out proxy requests and don't redirect
    /// https://forums.asp.net/t/2018010.aspx?RequireHttps+redirection+error+
    /// https://forums.asp.net/t/1989414.aspx?MVC+redirect+loop+with+RequireHttps+and+load+balancer
    /// https://github.com/aspnet/Mvc/blob/master/src/Microsoft.AspNetCore.Mvc.Core/RequireHttpsAttribute.cs
    /// </summary>
    public class ProxyRequireHttpsAttribute: RequireHttpsAttribute
    {
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext == null)
            {
                throw new ArgumentException("filterContext");
            }

            var headers = filterContext.HttpContext.Request.Headers;
            if (string.Equals(headers["X-Forwarded-Proto"], "https", StringComparison.InvariantCultureIgnoreCase))
            {
                // proxy https
                return;
            }

            base.OnAuthorization(filterContext);
        }
    }
}