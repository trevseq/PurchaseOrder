using PurchaseOrder.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PurchaseOrder.Controllers
{
    public class EditController : Controller
    {
        // GET: Edit
        public ActionResult Default()
        {
            string u = Helper.GetEmployeeId(this.User.Identity.Name);
            if (string.IsNullOrEmpty(u))
                return View();

            var isAdmin = Helper.AdminCheck(int.Parse(u));
            if (isAdmin == true)
            {
                // user is admin
                return View();
            }
            else
            {
                // user is not admin
                return View("Error");
            }
        }
        public ActionResult GetVend(int id)
        {
            var db = new PurchaseOrdersEntities();
            dynamic vendor = null;
            dynamic contact = null;

            vendor = (from v in db.Vendors
                      where v.Id == id
                      select new
                      {
                          v.Id,
                          v.Name,
                          v.Address1,
                          v.Comments,
                          v.Website
                      }).FirstOrDefault();

            contact = (from c in db.Vendors_Contact
                       join v in db.Vendors on c.VendorId equals v.Id
                       where c.VendorId == id
                       select new
                       {
                           c.Name,
                           c.Title,
                           c.Phone,
                           c.Ext,
                           c.Fax,
                           c.Email
                       }).FirstOrDefault();

            return new JsonResult()
            {
                Data = new { vendor, contact },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        public ActionResult GetProd(int id)
        {
            var db = new PurchaseOrdersEntities();
            var p = db.Products;

            var prod = p.Where(e => e.Id == id).FirstOrDefault();

            return new JsonResult()
            {
                Data = prod,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult GetTerm(int id)
        {
            var db = new PurchaseOrdersEntities();
            var term = (from t in db.PaymentTerms
                        where t.Id == id
                        select new
                        {
                            t.Name,
                            t.Value
                        }).FirstOrDefault();

            return new JsonResult()
            {
                Data = new { term },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult RemoveEntry(int id, string table)
        {
            bool success = false;

            if (table == "vendors")
            {
                var db = new PurchaseOrdersEntities();
                var t = db.Vendors;
                var t2 = db.Vendors_Contact;
                var vendor = t.Where(e => e.Id == id).FirstOrDefault();
                var contact = t2.Where(e => e.VendorId == id).FirstOrDefault();

                // delete the vendor row and contact row
                t.Remove(vendor);
                t2.Remove(contact);

                success = true;
            }
            else if (table == "products")
            {
                var db = new PurchaseOrdersEntities();
                var t = db.Products;
                var product = t.Where(e => e.Id == id).FirstOrDefault();

                // delete the product row
                t.Remove(product);
                success = true;
            }
            else if (table == "terms")
            {
                var db = new PurchaseOrdersEntities();
                var t = db.PaymentTerms;
                var term = t.Where(e => e.Id == id).FirstOrDefault();

                // delete the payment term row
                t.Remove(term);
                success = true;
            }

            return new JsonResult()
            {
                Data = success,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public ActionResult SaveTerm(int? id, string name, string value)
        {
            bool success = false;
            try
            {
                var db = new PurchaseOrdersEntities();

                if (id == null)
                {
                    var newTerm = new PaymentTerm() { Name = name, Value = value };
                    db.PaymentTerms.Add(newTerm);
                    db.SaveChanges();
                }
                else if (id != null)
                {
                    var t = db.PaymentTerms;
                    var term = t.Where(e => e.Id == id).FirstOrDefault();
                    term.Name = name;
                    term.Value = value;
                    db.SaveChanges();
                }
                success = true;
            }
            catch { }
            return new JsonResult()
            {
                Data = success,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        public ActionResult SaveProds(int? id, string name)
        {
            bool success = false;
            try
            {
                var db = new PurchaseOrdersEntities();

                if (id == null)
                {
                    var newProd = new Product() { Name = name };
                    db.Products.Add(newProd);
                    db.SaveChanges();
                }
                else if (id != null)
                {
                    var t = db.Products;
                    var prod = t.Where(e => e.Id == id).FirstOrDefault();
                    prod.Name = name;
                    db.SaveChanges();
                }
                success = true;
            }
            catch { }
            return new JsonResult()
            {
                Data = success,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        public ActionResult SaveVend(int? id,
            string name,
            string website,
            string address,
            string comments,
            string vendName,
            string vendTitle,
            string vendEmail,
            string vendPhone,
            string vendExt,
            string vendFax)
        {
            bool success = false;
            try
            {
                var db = new PurchaseOrdersEntities();
                if (id == null)
                {
                    var newVend = new Vendor()
                    {
                        Name = name,
                        Website = website,
                        Address1 = address,
                        Comments = comments
                    };
                    db.Vendors.Add(newVend);
                    db.SaveChanges();
                    if (vendName != null || vendTitle != null || vendEmail != null || vendPhone != null || vendExt != null || vendFax != null)
                    {
                        var newVContact = new Vendors_Contact()
                        {
                            Name = vendName,
                            Title = vendTitle,
                            Email = vendEmail,
                            Phone = vendPhone,
                            Ext = vendExt,
                            Fax = vendFax
                        };
                        db.Vendors_Contact.Add(newVContact);
                        db.SaveChanges();
                    }

                }
                else if (id != null)
                {
                    var t = db.Vendors;
                    var t2 = db.Vendors_Contact;
                    var vend = t.Where(e => e.Id == id).FirstOrDefault();
                    var cont = t2.Where(e => e.VendorId == id).FirstOrDefault();

                    vend.Name = name;
                    vend.Website = website;
                    vend.Address1 = address;
                    vend.Comments = comments;

                    cont.Name = vendName;
                    cont.Title = vendTitle;
                    cont.Email = vendEmail;
                    cont.Phone = vendPhone;
                    cont.Ext = vendExt;
                    cont.Fax = vendFax;

                    db.SaveChanges();
                }
                success = true;
            }
            catch { }
            return new JsonResult()
            {
                Data = success,
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}