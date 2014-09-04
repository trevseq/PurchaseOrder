using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace PurchaseOrder
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            // Home page
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Default", id = UrlParameter.Optional }
            );
            // Edit Page
            routes.MapRoute(
                name: "Edit",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Edit", action = "Default", id = UrlParameter.Optional }
            );
            // Print Preview Page
            routes.MapRoute(
                name: "PrintPreview",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "PrintPreview", action = "Default", id = UrlParameter.Optional }
            );
        }
    }
}
