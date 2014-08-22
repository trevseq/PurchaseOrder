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
            // CDN support!
            bundles.UseCdn = true;
            var jqueryJsCdnPath = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";
            
            bundles.Add(new ScriptBundle("~/bundles/jquery", jqueryJsCdnPath).Include(
                "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/javascript").Include(
                "~/Scripts/custom.js"));

            //bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
            //    "~/Scripts/knockout-{version}.js",
            //    "~/Scripts/knockout.validation.js"));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                "~/Scripts/sammy-{version}.js",
                "~/Scripts/app/common.js",
                "~/Scripts/app/app.datamodel.js",
                "~/Scripts/app/app.viewmodel.js",
                "~/Scripts/app/home.viewmodel.js",
                "~/Scripts/app/_run.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js",
                "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/jquery-ui.css",
                "~/Content/bootstrap.css",
                "~/Content/formpage.css"));

            bundles.Add(new StyleBundle("~/bundles/editstyles").Include(
                "~/Content/bootstrap.css",
                "~/Content/editpage.css"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                "~/Scripts/jquery-ui.js"
                ));


            // Set EnableOptimizations to false for debugging. For more information,
            // visit http://go.microsoft.com/fwlink/?LinkId=301862
            BundleTable.EnableOptimizations = false;
        }
    }
}
