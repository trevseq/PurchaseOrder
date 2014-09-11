using PurchaseOrder.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PurchaseOrder.Controllers
{
    public class OrderController : Controller
    {
        // GET: Order
        public ActionResult Default()
        {
            // TODO: user validation to return appropriate page
            var temp = true;
            if (temp)
                return View("Default");
            else if (temp)
                return View("Admin");
            else
                return View("Error");
        }
    }
}