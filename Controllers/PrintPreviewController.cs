using PurchaseOrder.Models;
using System.Linq;
using System.Web.Mvc;

namespace PurchaseOrder.Controllers
{
    public class PrintPreviewController : Controller
    {
        // GET: PrintPreview
        public ActionResult Default()
        {
            return View();
        }

        public ActionResult GetPrintPreviewData(int purchaseNumber)
        {
            dynamic info = null;
            dynamic subItems = null;
            object req = null;

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
                            p.RequestorId,
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
                req = Helper.GetUsernameFromID(info.RequestorId);
            }

            return new JsonResult()
            {
                Data = new { info, subItems, req },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}