using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Optimization;

namespace PurchaseOrder
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/javascript").Include(
                "~/Scripts/custom.js",
                "~/Scripts/bootstrap.js",
                "~/Scripts/respond.js",
                "~/Scripts/modernizr-2.8.3.js"));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                "~/Scripts/sammy-{version}.js",
                "~/Scripts/app/common.js",
                "~/Scripts/app/app.datamodel.js",
                "~/Scripts/app/app.viewmodel.js",
                "~/Scripts/app/home.viewmodel.js",
                "~/Scripts/app/_run.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.css",
                "~/Content/formpage.css"));

            bundles.Add(new StyleBundle("~/bundles/editstyles").Include(
                "~/Content/bootstrap.css",
                "~/Content/editpage.css"));

            // Set EnableOptimizations to false for debugging. For more information,
            // visit http://go.microsoft.com/fwlink/?LinkId=301862
            BundleTable.EnableOptimizations = false;
        }
    }
}
