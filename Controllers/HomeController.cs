﻿using PurchaseOrder.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;

namespace PurchaseOrder.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Default()
        {
            return View();
        }
        public ActionResult PrintPreview()
        {
            return View("PrintPreview");
        }
        public ActionResult Edit()
        {
            return View("Edit");
        }
        public ActionResult GetRequestor()
        {
            // Get requestor ID aka(EmployeeID)
            string u = Helper.GetEmployeeId(System.Environment.UserName);
            // GEt Requestor information based on employee id
            string query = string.Format(
                "SELECT e.[EmployeeID]" +
                ",e.[LastName]" +
                ",e.[FirstName] " +
                ",t.[Title]" +
                ",d.[Department]" +
                ",e.[Location]" +
                ",e.[WorkPhone]" +
                ",e.[WorkFax]" +
                ",e.[WorkEmail]" +
                ",e.[RoomNumber]  " +
                "FROM [ADP_Feed].[dbo].[Employees] e " +
                "join Departments d on e.Department = d.DepartmentID " +
                "join Titles t on e.JobTitle = t.TitleID where EmployeeID={0}", u);

            SqlDataAdapter adp = new SqlDataAdapter(query, new SqlConnection(ConfigurationManager.ConnectionStrings["PurchaseOrder.Properties.Settings.ADPFeed"].ConnectionString));
            DataTable tb = new DataTable();
            adp.Fill(tb);
            var requestor = (from r in tb.AsEnumerable()
                            select new
                            {
                                EmployeeID = r["EmployeeID"],
                                FirstName = r["FirstName"],
                                LastName = r["LastName"],
                                Title = r["Title"],
                                Department = r["Department"],
                                Office = r["Location"],
                                Phone = r["WorkPhone"],
                                Fax = r["WorkFax"],
                                Email = r["WorkEmail"],
                                Room = r["RoomNumber"]
                            }).FirstOrDefault();
            return new JsonResult()
            {
                Data = requestor,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        
        /// <summary>
        /// Handles ajax requests for list of vendors
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
        /// Handles ajax requests for a specific vendor's contact rep
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
        /// Handles ajax requests for list of payment term types
        /// </summary>
        /// <returns>JsonResult with payment terms data</returns>
        public ActionResult GetPaymentTerms()
        {
            var db = new PurchaseOrdersEntities();
            var o = db.PaymentTerms;

            return new JsonResult()
            {
                Data = o,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        /// <summary>
        /// Handles ajax requests for list of product types
        /// </summary>
        /// <returns>JsonResult with product types data</returns>
        public ActionResult GetProductType()
        {
            var db = new PurchaseOrdersEntities();
            var o = db.Products;

            return new JsonResult()
            {
                Data = o,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        
        public ActionResult SavePOForm(
            int? requestorId,
            int? vendor,
            string priority = null,
            string terms = null,
            string dateRequested = null,
            string dateRequired = null,
            string justification = null,
            string manager = null,
            string productType = null,
            string billingAddress = null,
            string shippingAddress = null,
            string comment = null,
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
            po.Priority = priority;
            po.Terms = terms;
            po.DateRequested = DateTime.Parse(dateRequested);
            po.DateRequired = DateTime.Parse(dateRequired);
            po.Justification = justification;
            po.Manager = manager;
            po.RequestorId = requestorId;
            po.Vendor = vendor;
            po.ProductType = productType;
            po.BillingAddress = billingAddress;
            po.ShippingAddress = shippingAddress;
            po.Comment = comment;
            po.SignedBy = signedBy;
            po.OrderDate = DateTime.Now;

            db.SaveChanges();

            return new JsonResult()
            {
                Data = po.PurchaseNumber,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult SaveOrderedItems(
            int purchaseNumber, 
            string product, 
            string partNumber, 
            string description, 
            int quantity, 
            string price, 
            string shipping, 
            string tax)
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
                poi.Shipping = shipping;
                poi.Tax = tax;

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

        public ActionResult GetPrintPreviewData(int purchaseNumber)
        {
            dynamic info = null;
            dynamic subItems = null;
            //dynamic vendorInformation = null;
            //dynamic vendorContact = null;

            if (Request["purchaseNumber"] != null)
            {
                int poNumber = int.Parse(Request.QueryString["purchaseNumber"]);
                var db = new PurchaseOrdersEntities();

                info = (from p in db.PurchaseOrders
                        join v in db.Vendors on p.Vendor equals v.Id
                        join c in db.Vendors_Contact on p.Vendor equals c.VendorId
                        where p.PurchaseNumber == poNumber
                        select new
                        {
                            p.PurchaseNumber,
                            p.Priority,
                            p.Terms,
                            p.Justification,
                            p.ShippingAddress,
                            p.Comment,
                            p.OrderDate,
                            v.Address1,
                            VendName = v.Name,
                            c.Name,
                            c.Phone,
                            c.Fax
                        }).FirstOrDefault();

                subItems = (from i in db.PurchaseOrderItems
                            where i.PurchaseNumber == poNumber
                            select new
                            {
                                //i.PurchaseNumber,
                                i.Product,
                                i.Quantity,
                                i.Price,
                                i.Tax,
                                i.Shipping,
                                i.Description,
                                i.PartNumber
                            });
            }

            return new JsonResult()
            {
                Data = new { info, subItems },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

    }
}
