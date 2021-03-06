﻿using PurchaseOrder.Models;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Mvc;

namespace PurchaseOrder.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Default()
        {
            return View();
        }

        /// <summary>
        /// Gets requests for info about the user from Active Directory and the POAppAccess db table
        /// </summary>
        /// <returns>JsonResult with the user's identity, as well as whether or not they are a purchase order administrator.</returns>
        public ActionResult GetRequestor()
        {
            object[] o = Helper.GetRequestorForView(this.User.Identity.Name);
            return new JsonResult()
            {
                Data = new { requestor = o[0], isAdmin = o[1] },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        /// <summary>
        /// Gets requests for list of vendors
        /// </summary>
        /// <returns>JsonResult with vendor data</returns>
        public ActionResult GetVendors()
        {
            var db = new PurchaseOrdersEntities();
            var o = db.Vendors;

            return new JsonResult()
            {
                Data = o,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        /// <summary>
        /// Gets requests for a specific vendor's contact rep
        /// </summary>
        /// <param name="VId">Vendor ID</param>
        /// <returns>JsonResult with vendor contact data</returns>
        public ActionResult GetVendorContact(int? VId)
        {
            var db = new PurchaseOrdersEntities();
            var o = db.Vendors_Contact;
            var contact = o.Where(e => e.VendorId == VId).FirstOrDefault();

            return new JsonResult()
            {
                Data = contact,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        /// <summary>
        /// Gets requests for list of product types
        /// </summary>
        /// <returns>JsonResult with product types data</returns>
        public ActionResult GetProductType()
        {
            var db = new PurchaseOrdersEntities();
            var o = db.ProductCategories;

            return new JsonResult()
            {
                Data = o,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult GetProducts(int Category)
        {
            var db = new PurchaseOrdersEntities();
            var p = db.Products;
            var data = p.Where(e => e.ProductCategoryId == Category);

            return new JsonResult()
            {
                Data = new { data },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult GetOffices()
        {
            dynamic data = null;
            string query =
                "SELECT [OfficeID]" +
                ",[Office]" +
                "FROM [Offices]";

            SqlDataAdapter adp = new SqlDataAdapter(query, new SqlConnection(ConfigurationManager.ConnectionStrings["PurchaseOrder.Properties.Settings.ADPFeed"].ConnectionString));
            DataTable tb = new DataTable();
            adp.Fill(tb);
            data = (from r in tb.AsEnumerable()
                    select new
                    {
                        OfficeID = r["OfficeID"],
                        Office = r["Office"]
                    });

            return new JsonResult()
            {
                Data = data,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        /// <summary>
        /// Handles the saving of the form
        /// </summary>
        /// <param name="requestorId"></param>
        /// <param name="vendor"></param>
        /// <param name="priority"></param>
        /// <param name="terms"></param>
        /// <param name="dateRequested"></param>
        /// <param name="dateRequired"></param>
        /// <param name="justification"></param>
        /// <param name="manager"></param>
        /// <param name="productType"></param>
        /// <param name="billingAddress"></param>
        /// <param name="shippingAddress"></param>
        /// <param name="comment"></param>
        /// <param name="signedBy"></param>
        /// <returns>JsonResult with purchase order number</returns>
        public ActionResult SavePOForm(
            int? requestorId,
            int? vendor,
            //string priority = null,
            string terms = null,
            string dateRequested = null,
            //string dateRequired = null,
            string justification = null,
            //string manager = null,
            string productType = null,
            string billingAddress = null,
            string shippingAddress = null,
            decimal tax = decimal.MinValue,
            decimal shipping = decimal.MinValue,
            //string comment = null,

            string signedBy = null)
        {
            var db = new PurchaseOrdersEntities();
            var po = db.PurchaseOrders.Add(new Models.PurchaseOrder());
            var pNumber = (from n in db.PurchaseOrders
                           orderby n.PurchaseNumber descending
                           select n.PurchaseNumber).FirstOrDefault();
            if (pNumber == null)
            {
                pNumber = 0;
            }

            po.PurchaseNumber = (pNumber += 1);
            //po.Priority = priority;
            po.Terms = terms;
            po.DateRequested = DateTime.Parse(dateRequested);
            //po.DateRequired = DateTime.Parse(dateRequired);
            po.Justification = justification;
            //po.Manager = manager;
            po.RequestorId = requestorId;
            po.Vendor = vendor;
            po.ProductType = productType;
            po.BillingAddress = billingAddress;
            po.ShippingAddress = shippingAddress;
            po.Tax = tax;
            po.Shipping = shipping;
            //po.Comment = comment;
            po.SignedBy = signedBy;
            po.OrderDate = DateTime.Now;

            db.SaveChanges();

            return new JsonResult()
            {
                Data = po.PurchaseNumber,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        /// <summary>
        /// Handles the saving of ordered items after the main form is saved.
        /// </summary>
        /// <param name="purchaseNumber"></param>
        /// <param name="product"></param>
        /// <param name="partNumber"></param>
        /// <param name="description"></param>
        /// <param name="quantity"></param>
        /// <param name="price"></param>
        /// <returns>JsonResult success boolean.</returns>
        public ActionResult SaveOrderedItems(
            int purchaseNumber,
            string product,
            string partNumber,
            string description,
            string quantity,
            string price)
        {
            bool _success = false;
            try
            {
                var db = new PurchaseOrdersEntities();
                var poi = db.PurchaseOrderItems.Add(new Models.PurchaseOrderItem());

                poi.PurchaseNumber = purchaseNumber;
                poi.Product = product;
                poi.PartNumber = partNumber;
                poi.Description = description;
                poi.Quantity = quantity;
                poi.Price = price;

                db.SaveChanges();
                _success = true;
            }
            catch { }
            return new JsonResult()
            {
                Data = _success,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}