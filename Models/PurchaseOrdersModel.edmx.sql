
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 07/24/2014 13:55:31
-- Generated from EDMX file: C:\Projects\PurchaseOrder\PurchaseOrder\Models\PurchaseOrdersModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [PurchaseOrders];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------


-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[PaymentTerms]', 'U') IS NOT NULL
    DROP TABLE [dbo].[PaymentTerms];
GO
IF OBJECT_ID(N'[dbo].[POAppAccesses]', 'U') IS NOT NULL
    DROP TABLE [dbo].[POAppAccesses];
GO
IF OBJECT_ID(N'[dbo].[Products]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Products];
GO
IF OBJECT_ID(N'[dbo].[PurchaseOrderItems]', 'U') IS NOT NULL
    DROP TABLE [dbo].[PurchaseOrderItems];
GO
IF OBJECT_ID(N'[dbo].[PurchaseOrders]', 'U') IS NOT NULL
    DROP TABLE [dbo].[PurchaseOrders];
GO
IF OBJECT_ID(N'[dbo].[Vendors]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Vendors];
GO
IF OBJECT_ID(N'[dbo].[Vendors_Contact]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Vendors_Contact];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'PaymentTerms'
CREATE TABLE [dbo].[PaymentTerms] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL,
    [Value] nvarchar(max)  NULL,
    [Created] datetime  NULL,
    [CreatedBy] nvarchar(max)  NULL,
    [LastModified] datetime  NULL,
    [LastModifiedBy] nvarchar(max)  NULL
);
GO

-- Creating table 'Products'
CREATE TABLE [dbo].[Products] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL,
    [Created] datetime  NULL,
    [CreatedBy] nvarchar(max)  NULL,
    [LastModified] datetime  NULL,
    [LastModifiedBy] nvarchar(max)  NULL
);
GO

-- Creating table 'Vendors'
CREATE TABLE [dbo].[Vendors] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL,
    [Website] nvarchar(max)  NULL,
    [Address1] nvarchar(max)  NULL,
    [Comments] nvarchar(max)  NULL,
    [Created] datetime  NULL,
    [CreatedBy] nvarchar(max)  NULL,
    [LastModified] datetime  NULL,
    [LastModifiedBy] nvarchar(max)  NULL
);
GO

-- Creating table 'Vendors_Contact'
CREATE TABLE [dbo].[Vendors_Contact] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [VendorId] int  NULL,
    [Name] nvarchar(max)  NULL,
    [Email] nvarchar(max)  NULL,
    [Title] nvarchar(max)  NULL,
    [Phone] nvarchar(max)  NULL,
    [Ext] nvarchar(max)  NULL,
    [Fax] nvarchar(max)  NULL,
    [Created] datetime  NULL,
    [CreatedBy] nvarchar(max)  NULL,
    [LastModified] datetime  NULL,
    [LastModifiedBy] nvarchar(max)  NULL
);
GO

-- Creating table 'POAppAccesses'
CREATE TABLE [dbo].[POAppAccesses] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [EmployeeID] int  NOT NULL,
    [IsAdmin] bit  NOT NULL,
    [Created] nvarchar(max)  NOT NULL,
    [LastModified] datetime  NULL
);
GO

-- Creating table 'PurchaseOrderItems'
CREATE TABLE [dbo].[PurchaseOrderItems] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [PurchaseNumber] int  NOT NULL,
    [Product] varchar(max)  NULL,
    [PartNumber] varchar(max)  NULL,
    [Description] varchar(max)  NULL,
    [Quantity] int  NOT NULL,
    [Price] varchar(max)  NOT NULL,
    [Shipping] varchar(max)  NULL,
    [Tax] varchar(max)  NULL
);
GO

-- Creating table 'PurchaseOrders'
CREATE TABLE [dbo].[PurchaseOrders] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [PurchaseNumber] int  NOT NULL,
    [Priority] varchar(max)  NULL,
    [Terms] varchar(max)  NULL,
    [DateRequested] datetime  NOT NULL,
    [DateRequired] datetime  NULL,
    [Justification] varchar(max)  NULL,
    [Manager] varchar(max)  NULL,
    [RequestorId] int  NULL,
    [Vendor] int  NULL,
    [ProductType] varchar(max)  NULL,
    [BillingAddress] varchar(max)  NULL,
    [ShippingAddress] varchar(max)  NULL,
    [Comment] varchar(max)  NULL,
    [SignedBy] varchar(max)  NULL,
    [OrderDate] datetime  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'PaymentTerms'
ALTER TABLE [dbo].[PaymentTerms]
ADD CONSTRAINT [PK_PaymentTerms]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Products'
ALTER TABLE [dbo].[Products]
ADD CONSTRAINT [PK_Products]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Vendors'
ALTER TABLE [dbo].[Vendors]
ADD CONSTRAINT [PK_Vendors]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Vendors_Contact'
ALTER TABLE [dbo].[Vendors_Contact]
ADD CONSTRAINT [PK_Vendors_Contact]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'POAppAccesses'
ALTER TABLE [dbo].[POAppAccesses]
ADD CONSTRAINT [PK_POAppAccesses]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'PurchaseOrderItems'
ALTER TABLE [dbo].[PurchaseOrderItems]
ADD CONSTRAINT [PK_PurchaseOrderItems]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'PurchaseOrders'
ALTER TABLE [dbo].[PurchaseOrders]
ADD CONSTRAINT [PK_PurchaseOrders]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------