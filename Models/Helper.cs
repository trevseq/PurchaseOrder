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

        public static string GetEmployeeId(HttpContextBase ctx)
        {
          
            string s = null;
            if (!string.IsNullOrEmpty(ctx.User.Identity.Name))
            {
                string usr = ctx.User.Identity.Name.ToLower();
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
    }
}