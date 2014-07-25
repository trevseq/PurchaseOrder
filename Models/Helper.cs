using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.Linq;
using System.Web;

namespace PurchaseOrder.Models
{
    public class Helper
    {
        public static string getDate()
        {
            string date = DateTime.Now.Month.ToString();
            date += "/" + DateTime.Now.Day + "/" + DateTime.Now.Year;
            return date;
        }




        public static string GetEmployeeId(string userName)
        {
            string s = null;
            if (!string.IsNullOrEmpty(userName))
            {
                string usr = userName.ToLower();
                usr = usr.Replace("kasowitz\\", "");
                DirectoryEntry ent = new DirectoryEntry("LDAP://DC=kasowitz,DC=com");//, ConfigurationManager.AppSettings["ADUser"], ConfigurationManager.AppSettings["ADPwd"]);
                DirectorySearcher search = new DirectorySearcher(ent);
                search.Filter = "(&(objectCategory=user)(samAccountName=" + usr + "))";
                search.PropertiesToLoad.Add("extensionattribute1");

                search.SearchScope = SearchScope.Subtree;
                SearchResult result = search.FindOne();

                s = result.Properties["extensionattribute1"][0].ToString();
            }

            return s;
        }


        //public static bool IsAdmin(HttpContextBase ctx)
        //{
        //    bool hasAccess = false;

        //        var db = new PurchaseOrdersEntities();

        //    ctx.User.Identity.Name=
        //        var o = db.POAppAccesses;

        //        return hasAccess;
        //}
    }
}