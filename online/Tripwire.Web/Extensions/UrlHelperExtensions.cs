using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Tripwire.Web.Extensions
{
    public static class UrlHelperExtensions
    {
        /// <summary>
        /// Generates a fully qualified URL (with the current version) to an action method by using the specified action name.
        /// </summary>
        /// <param name="actionName">The name of the action method.</param>
        /// <returns>The fully qualified URL to an action method.</returns>
		[Obsolete("This helper using version in query string should not be used anymore")]
		public static string VersionedAction(this UrlHelper helper, string actionName)
        {
            return helper.VersionedAction(actionName, null, null);
        }

        /// <summary>
        /// Generates a fully qualified URL (with the current version) to an action method by using the specified action and route values.
        /// </summary>
        /// <param name="actionName">The name of the action method.</param>
        /// <param name="routeValues">An object that contains the parameters for a route.</param>
		/// <returns>The fully qualified URL to an action method.</returns>
		[Obsolete("This helper using version in query string should not be used anymore")]
        public static string VersionedAction(this UrlHelper helper, string actionName, object routeValues)
        {
            return helper.VersionedAction(actionName,null, routeValues);
        }

        /// <summary>
        /// Generates a fully qualified URL (with the current version) to an action method by using the specified action, controller, and route values.
        /// </summary>
        /// <param name="actionName">The name of the action method.</param>
        /// <param name="controllerName">The name of the controller.</param>
        /// <param name="routeValues">An object that contains the parameters for a route.</param>
		/// <returns>The fully qualified URL to an action method.</returns>
		[Obsolete("This helper using version in query string should not be used anymore")]
        public static string VersionedAction(this UrlHelper helper, string actionName, string controllerName, object routeValues)
        {
            string version = helper.RequestContext.HttpContext.Request.QueryString["v"];
            if (!string.IsNullOrEmpty(version))
            {
                RouteValueDictionary dictionary = new RouteValueDictionary();
                dictionary.Add("v", version);
                if (routeValues != null)
                {
                    foreach (PropertyDescriptor prop in TypeDescriptor.GetProperties(routeValues))
                    {
                        dictionary.Add(prop.Name, prop.GetValue(routeValues));
                    }
                }
                return helper.Action(actionName, controllerName, dictionary);
            }
            return helper.Action(actionName, controllerName, routeValues);
        }
    }
}