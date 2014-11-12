using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.DirectoryServices;
using System.Linq;

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
                DirectoryEntry ent = new DirectoryEntry("LDAP://DC=kasowitz,DC=com");
                DirectorySearcher search = new DirectorySearcher(ent);
                search.Filter = "(&(objectCategory=user)(samAccountName=" + usr + "))";
                search.PropertiesToLoad.Add("extensionattribute1");

                search.SearchScope = SearchScope.Subtree;
                SearchResult result = search.FindOne();

                s = result.Properties["extensionattribute1"][0].ToString();
            }

            return s;
        }

        public static object GetUsernameFromID(int id)
        {
            object s = null;
            string query = string.Format(
                "SELECT e.[EmployeeID]" +
                ",e.[LastName]" +
                ",e.[FirstName] " +
                ",e.[WorkEmail]" +
                "FROM [ADP_Feed].[dbo].[Employees] e where EmployeeID={0} ", id);

            SqlDataAdapter adp = new SqlDataAdapter(query, new SqlConnection(ConfigurationManager.ConnectionStrings["PurchaseOrder.Properties.Settings.ADPFeed"].ConnectionString));
            DataTable tb = new DataTable();
            adp.Fill(tb);
            s = (from r in tb.AsEnumerable()
                 select new
                 {
                     EmployeeID = r["EmployeeID"],
                     FirstName = r["FirstName"],
                     LastName = r["LastName"],
                     Email = r["WorkEmail"],
                 }).SingleOrDefault();
            return s;
        }

        public static object[] GetRequestorForView(string username)
        {
            bool isAdmin = false;
            object requestor = null;
            // Get requestor ID aka(EmployeeID)
            string u = Helper.GetEmployeeId(username);
            if (!string.IsNullOrEmpty(u))
            {
                // Get information based on employee id
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
                    "FROM [Employees] e " +
                    "join Departments d on e.Department = d.DepartmentID " +
                    "join Titles t on e.JobTitle = t.TitleID where EmployeeID={0}", u);

                SqlDataAdapter adp = new SqlDataAdapter(query, new SqlConnection(ConfigurationManager.ConnectionStrings["PurchaseOrder.Properties.Settings.ADPFeed"].ConnectionString));
                DataTable tb = new DataTable();
                adp.Fill(tb);
                requestor = (from r in tb.AsEnumerable()
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

            return new object[] { requestor, isAdmin };
        }

        public static bool AdminCheck(int empID)
        {
            // check if admin
            var db = new PurchaseOrdersEntities();
            var a = db.POAppAccesses;
            var user = a.Where(e => e.EmployeeID == empID).FirstOrDefault();

            if (user.IsAdmin == true)
                return true;
            else if (AdminFromADGroup(empID))
                return true;
            else
                return false;
        }

        public static bool AdminFromADGroup(int empID)
        {
            bool isAdmin = false;
            var o = GroupHierarchy("IT Managers");
            foreach (object[] manager in o)
            {
                if (manager[0].Equals(empID))
                    isAdmin = true;
                else
                    isAdmin = false;
            }
            return isAdmin;
        }

        private static object[][] hash;

        public static object[][] GroupHierarchy(string group)
        {
            DirectorySearcher srch = new DirectorySearcher(string.Format("(CN={0})", group));
            srch.PropertiesToLoad.Add("member");
            SearchResult coll = srch.FindOne();

            if (coll != null)
            {
                ResultPropertyValueCollection results = coll.Properties["member"];
                string[] lstSorted = new string[results.Count];
                results.CopyTo(lstSorted, 0);
                List<string> lt = new List<string>(lstSorted);
                lt.Sort();
                hash = new object[lt.Count][];
                for (int i = 0; i < lt.Count; i++)
                {
                    DirectoryEntry gpMemberEntry = new DirectoryEntry("LDAP://" + lt[i]);
                    string groupName = gpMemberEntry.Name.Replace("CN=", "");
                    try
                    {
                        if (gpMemberEntry.Properties["extensionattribute1"].Count > 0)
                        {
                            hash[i] = new object[] { gpMemberEntry.Properties["extensionattribute1"][0], gpMemberEntry.Properties["displayname"][0] };
                        }
                    }
                    catch
                    {
                    }
                }
            }
            return hash;
        }
    }
}