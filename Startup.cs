using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(PurchaseOrder.Startup))]

namespace PurchaseOrder
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}