﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace PurchaseOrder.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class PurchaseOrdersEntities : DbContext
    {
        public PurchaseOrdersEntities()
            : base("name=PurchaseOrdersEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<PaymentTerm> PaymentTerms { get; set; }
        public virtual DbSet<POAppAccess> POAppAccesses { get; set; }
        public virtual DbSet<ProductCategory> ProductCategories { get; set; }
        public virtual DbSet<Product> Products { get; set; }
        public virtual DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public virtual DbSet<Vendor> Vendors { get; set; }
        public virtual DbSet<Vendors_Contact> Vendors_Contact { get; set; }
        public virtual DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    }
}
