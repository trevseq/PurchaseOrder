using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
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

        public static string GetEmployeeId(string username)
        {
          
            string s = null;
            if (!string.IsNullOrEmpty(username))
            {
                string usr = username.ToLower();
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

        public static object[] GetRequestorForView(string username)
        {
            bool isAdmin=false;
            object reqeuestor = null;
            // Get requestor ID aka(EmployeeID)
            string u = Helper.GetEmployeeId(username);
            if (!string.IsNullOrEmpty(u))
            {
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
                reqeuestor = (from r in tb.AsEnumerable()
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

                isAdmin = Helper.AdminCheck(int.Parse(u));
            }

            return new object[]{reqeuestor,isAdmin};

        }

        public static bool AdminCheck(int empID)
        {
            // check if admin
            var db = new PurchaseOrdersEntities();
            var a = db.POAppAccesses;
            var user = a.Where(e => e.EmployeeID == empID).FirstOrDefault();

            if (user.IsAdmin == true) { return true; }
            else { return false; }
        }
    }
}