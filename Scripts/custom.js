﻿var pathName = location.pathname.toLowerCase();
var isValidated = false;
var urlLower = pathName.toLowerCase();

// clean the page views from the url to be able to use the base url for hyperlinking
pathName = pathName.replace("default", "");
pathName = pathName.replace("home", "");
pathName = pathName.replace("printpreview", "");
pathName = pathName.replace("edit", "");

pathName += ((pathName.substring(pathName.length - 1) != "/") ? "/" : "");
pathName = location.protocol + "//" + location.host + pathName.replace("//", "/");

$(document).ready(function () {
    // Form page
    if (!(urlLower.indexOf("printpreview") > -1) && !(urlLower.indexOf("edit") > -1) && !(urlLower.indexOf("error") > -1)) {
        // Vendors dropdown list
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetVendors",
            cache: false,
            success: function (data) {
                var options = $.map(data, function (e) {
                    return "<option value=\"" + e.Id + "\" data-address=\"" + e.Address1 + "\"  data-site=\"" + e.Website + "\">" + e.Name + "</option>";
                }).join("");
                $("#cboVendors").html("<option value=\"\" selected=\"\">Select...</option>" + options);
            }
        });
        // Products dropdown list
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetProductType",
            cache: false,
            success: function (data) {
                var options = $.map(data, function (e) {
                    return "<option value=\"" + e.Id + "\">" + e.Name + "</option>";
                }).join("");
                $("#cboProductType").html("<option value=\"\" selected=\"\">Select...</option>" + options);
            }
        });
        // Fetch Office info
        $.ajax({
            type: "GET",
            url: (pathName + "Home/GetOffices"),
            dataType: "JSON",
            cache: false,
            success: function (data) {
                var options = $.map(data, function (e) {
                    return "<option data-officeid='" + e.OfficeID + "'>" + e.Office + "</option>";
                });
                options = options.join("");
                $('#cboOffice').html(options);
            }
        });
        // Fetch requestor info
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetRequestor",
            cache: false,
            success: function (data) {
                if (data.requestor != null) {
                    // Populate requestor section:
                    $("#txtReqName").data("requestorid", data.requestor.EmployeeID);
                    $("#txtReqName").val(data.requestor.FirstName + " " + data.requestor.LastName);
                    $("#lblReqName").text(data.requestor.FirstName + " " + data.requestor.LastName); // mini invoice

                    $("#txtReqTitle").val(data.requestor.Title);
                    $("#txtReqEmail").val(data.requestor.Email);
                    $("#lblReqEmail").text(data.requestor.Email); // mini invoice

                    $("#txtOffice").val(data.requestor.Room);
                    $("#txtDepartment").val(data.requestor.Department);
                    $("#txtReqPhone").val(data.requestor.Phone);
                    $("#txtReqFax").val(data.requestor.Fax);

                    $("#cboOffice").val(data.requestor.Office);

                    if (data.isAdmin !== true)
                        $('#admin').remove();
                }
                else {
                    $('#admin').remove();
                }
            },
            error: function (data) {
                $('#admin').remove();
                alert("Oops! Something went wrong when trying to retrieve your information.");
            }
        });

        // Populate the form after retrieving the requestor info
        PopForm();
        ClearForm();

        /*----------- EVENT HANDLERS ------------------------*/

        // Update invoice ship address based on textarea value
        $("#txtShipAddress").blur(function (evt) {
            var id = evt.target.id.replace("txt", "lbl");
            var text = $(evt.target).val()//.replace("\n", "</br>")
            $('#' + id).text(text);
        });

        // Updates the shipping info when office is changed
        $("#cboOffice").change(function (e) {
            PopShipAddr();
            console.log("test")
        });

        // Update justification in mini invoice
        $("#txtJustification").blur(function (evt) {
            var id = evt.target.id.replace("txt", "lbl");
            var text = $(evt.target).val().replace(/\n/g, "<br />");
            $('#' + id).html(text);
        });

        // Update invoice labels based on dropdown values
        $("select").change(function (evt) {
            var id = evt.target.id.replace("cbo", "lbl");
            $('#' + id).html($(evt.target).val());
        });

        // Add order item button
        $('#addItem').click(function (e) {
            AddItems();
            e.preventDefault();
        });

        // Update the totals when the mini invoice is changed
        $(document).delegate("span[name='spPrice']", "blur", function (e) {
            UpdateItems();
        });
        $(document).delegate("span[name='spQuantity']", "blur", function (e) {
            UpdateItems();
        });

        $("#taxTotal").blur(function (e) {
            UpdateItems();
        });
        $("#shipTotal").blur(function (e) {
            UpdateItems();
        });

        // Submit form button
        $("#btnSubmit").click(function (e) {
            ValidateInputs();
            e.preventDefault();
        });

        // Delete Row button
        $(document).delegate("img[src$='delete-32x32.png']", "click", function (e) {
            $(this).closest("tr").remove();
            UpdateItems();
        });

        // Admin buttons
        $('#editLink').click(function (e) {
            location.assign(pathName + "/Edit");
        });
        $('#viewRecordLink').click(function (e) {
            var orderPrompt = prompt("Please enter an order number");
            if (orderPrompt !== null) {
                orderPrompt = orderPrompt.replace(/\D/gi, "");
                location.assign(pathName + "/PrintPreview?purchaseNumber=" + orderPrompt);
            }
        });

        // Product Category Selection
        $('#cboProductType').change(function () {
            var ProdCatId = $('#cboProductType').val();
            if (ProdCatId > 0) {
                $("#cboProduct").html("");
                $.ajax({
                    type: "GET",
                    dataType: "JSON",
                    url: pathName + "Home/GetProducts?Category=" + ProdCatId,
                    cache: false,
                    success: function (data) {
                        var options = $.map(data.data, function (e, i) {
                            return "<option data-productid=\"" + e.Id + "\">" + e.Name + "</option>";
                        }).join("");
                        $("#cboProduct").html("<option value=\"\" selected=\"\">Select...</option>" + options);
                    }
                });
            }
        });

        // Vendors dropdown controls
        $('#cboVendors').change(function () {
            $("input[id^='txtVContact'").val("");
            $("div[id^='lblVContact'").text("");

            var address = $("#cboVendors option:selected").data("address");

            $('#txtVContactAddress').val(address);
            $('#txtVContactHyperlink').html("<a href='" + $("#cboVendors option:selected").data("site") + "' title='" + $("#cboVendors option:selected").data("site") + "' >" + $("#cboVendors option:selected").text() + "</a>");
            $('#lblVendors').text($("#cboVendors option:selected").text());
            if (address !== null)
                (address.length > 0) ? $('#lblVContactAddress').text(address) : "";

            // Fetch vendor contact info
            $.ajax({
                type: "GET",
                dataType: "JSON",
                url: pathName + "Home/GetVendorContact?VId=" + $('#cboVendors').val(),
                cache: false,
                success: function (data) {
                    $('#txtVContactName').val(data.Name);
                    $('#txtVContactTitle').val(data.Title);
                    $('#txtVContactPhone').val(data.Phone);
                    $('#txtVContactExtension').val(data.Ext);
                    $('#txtVcontactFax').val(data.Fax);

                    if (data.Name != null) {
                        $('#lblVContactName').text(data.Name);
                        //(data.Title != null) ? $('#lblVContactName').text(data.Name + " (" + data.Title + ")") : $('#lblVContactName').text(data.Name);
                    }
                    (data.Ext != null) ? $('#lblVContactPhone').text(data.Phone + ":" + data.Ext) : $('#lblVContactPhone').text(data.Phone);
                    (data.Fax != null) ? $('#lblVContactFax').text(data.Fax) : "";
                }
            });
        });
        UpdateItems();
    }

        /*=============== Print Page ========================*/
    else if (urlLower.indexOf("printpreview") > -1) {
        // Get data from server and populate fields on page
        var PONumber = GetUrlValue("purchaseNumber");
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "PrintPreview/GetPrintPreviewData?purchaseNumber=" + PONumber,
            cache: false,
            success: function (data) {
                // Order info: (PO#, terms, justification, shipaddr, vend contact info, et cetera)
                var poNum = data.info.PurchaseNumber;
                var terms = data.info.Terms;
                var justi = data.info.Justification;
                var shipAddr = data.info.ShippingAddress.replace(/(\\n)/gm, "\n");
                var orderDate = data.info.OrderDate;
                var addr = data.info.Address1;
                var cName = data.info.Name;
                var cPhone = data.info.Phone;
                var cFax = data.info.Fax;
                var vendor = data.info.VendName;
                var reqId = data.info.requestorId;
                var tax = (data.info.Tax === 0 || data.info.Tax === null) ? tax = "0.00" : tax = tax;
                var shipping = (data.info.Shipping === 0 || data.info.Shipping === null) ? shipping = "0.00" : shipping = shipping;

                orderDate = parseDate(orderDate);

                $("#invoiceOrderDate").text(orderDate);
                $('#lblPaymentTerms').text(terms);
                $('#lblPONum').text(poNum);
                $('#lblVendors').text(vendor);
                $('#lblVContactName').text(cName);
                $('#lblVContactPhone').text(cPhone);
                $('#lblVContactFax').text(cFax);
                $('#lblVContactAddress').text(addr);
                $('#lblShipAddress').text(shipAddr);
                $('#lblJustification').text(justi);
                $('#taxTotal').text(tax);
                $('#shipTotal').text(shipping);

                $('#lblReqName').text(data.req.FirstName + " " + data.req.LastName);
                $('#lblReqEmail').text(data.req.Email);
                // Purchased items: (for rows in invoice table)
                var p;
                for (p in data.subItems) {
                    var prod = data.subItems[p].Product;
                    var quan = data.subItems[p].Quantity;
                    var price = data.subItems[p].Price;
                    var desc = data.subItems[p].Description;
                    var partNum = data.subItems[p].PartNumber;
                    var rowTotal = parseFloat(price) * parseFloat(quan);

                    var row = "<tr name='invRow'>";
                    row += "<td><span name='spProduct'>" + prod + "</span></td>";
                    row += "<td><span name='spPartNo'>" + partNum + "</span></td>";
                    row += "<td><span name='spDescription'>" + desc + "</span></td>";
                    row += "<td><span name='spQuantity'>" + quan + "</span></td>";
                    row += "<td class='text-right'>$<span name='spPrice'>" + parseFloat(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + "</span></td>";
                    row += "<td class='text-right'>$" + rowTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + "</td></tr>";

                    $('#tblItemizedList').find("tbody").append(row);
                }
                UpdateItems();
            }
        });

        // Button-like link to return to main form page
        $('#backToForm').attr("href", pathName);
    }

        /*=============== Edit Page ========================*/
    else if (urlLower.indexOf("edit") > -1) {
        $('#outerContainer').append("<a id='backToForm' title='Return to form page' href='" + pathName + "' class='btn btn-default pull-right'>Back</a>");
        $('#outerContainer').append("<button id='tab0AddItem' class='btn btn-primary tabSpecific'>Add Vendor</button>");
        // Nav tabs (vendors, products)
        $('#dbTableTabs').tabs({
            activate: function (event, ui) {
                $('.tabSpecific').remove();

                var activeTab = $("#dbTableTabs").tabs("option", "active");
                if (activeTab == 0) {
                    $('#outerContainer').append("<button id='tab0AddItem' name='tabAdd' class='btn btn-primary tabSpecific'>Add Vendor</button>");
                }
                else if (activeTab == 1) {
                    $('#outerContainer').append("<button id='tab1AddItem' name='tabAdd' class='btn btn-primary tabSpecific'>Add Item</button>");
                }
            }
        });
        // Fetch Vendor tab content
        $.ajax({
            type: "GET",
            url: (pathName + "Home/GetVendors"),
            dataType: "JSON",
            cache: false,
            success: function (data) {
                var options = $.map(data, function (e) {
                    vName = e.Name;
                    return "<li>" + "<a id='vendLink" + e.Id + "' style='cursor: pointer;'  data-id='" + e.Id + "' class='vendLink'>" + vName + "</a></li>";
                });
                options = options.join("");
                $('#dbTableTabs-1').html("<ol>" + options + "</ol>");
            }
        });
        // Fetch Product tab content
        $.ajax({
            type: "GET",
            url: (pathName + "Home/GetProductType"),
            dataType: "JSON",
            cache: false,
            success: function (data) {
                var options = $.map(data, function (e) {
                    pName = e.Name;
                    return "<li>" + "<a id='prodLink" + e.Id + "' style='cursor: pointer;'  data-id='" + e.Id + "' class='prodLink'>" + pName + "</a></li>";
                });
                options = options.join("");
                $('#dbTableTabs-2').html("<ol>" + options + "</ol>");
            }
        });

        /*----------- EVENT HANDLERS ------------------------*/

        // Opens the vendor that was clicked (for editing/removal)
        $(document).delegate("a[id^='vendLink']", "click", function (e) {
            VendDialog($(e.target).data("id"));
        });
        // Opens the product that was clicked (for editing/removal)
        $(document).delegate("a[id^='prodLink']", "click", function (e) {
            ProdDialog($(e.target).data("id"));
        });
        $(document).delegate("button[name='tabAdd']", "click", function (e) {
            if (e.target.id == 'tab0AddItem') {
                VendDialog(null);
            }
            else if (e.target.id == 'tab1AddItem') {
                ProdDialog(null);
            }
        });
    }
});

/*================== FUNCTIONS =====================*/
/*==================================================*/

function PopShipAddr() {
    // Clear old shipping value
    $("#txtShipAddress").val("");
    // TODO: FIX ADP FEED DB LOCATIONS TABLE SO I DON'T NEED TO HARD CODE THIS!
    // Get the office address
    var offAddr;
    if ($("#cboOffice>option:selected").data("officeid") === 2)
        offAddr = "700 Louisiana Street, \n" +
            "Suite 2200 \n" +
            "Houston, Texas, 77002";
    else if ($("#cboOffice>option:selected").data("officeid") === 3)
        offAddr = "1349 West Peachtree Street, N.W., \n" +
            "Suite 1500 \n" +
            "Atlanta, Georgia, 30309";
    else if ($("#cboOffice>option:selected").data("officeid") === 4)
        offAddr = "101 California Street, \n" +
            "Suite 2300 \n" +
            "San Francisco, California, 94111";
    else if ($("#cboOffice>option:selected").data("officeid") === 5)
        offAddr = "333 Twin Dolphin Drive, \n" +
            "Suite 200 \n" +
            "Redwood Shores, California, 94065";
    else if ($("#cboOffice>option:selected").data("officeid") === 6)
        offAddr = "1441 Brickell Avenue, \n" +
            "Suite 1420 \n" +
            "Miami, Florida, 33131";
    else if ($("#cboOffice>option:selected").data("officeid") === 7)
        offAddr = "2029 Century Park East, \n" +
            "Suite 750 \n" +
            "Los Angeles, CA 90067";
    else if ($("#cboOffice>option:selected").data("officeid") === 8)
        offAddr = "2200 Pennsylvania Avenue NW, \n" +
            "Suite 680 West \n" +
            "Washington, DC 20037";
    else if ($("#cboOffice>option:selected").data("officeid") === 9)
        offAddr = "One Gateway Center, \n" +
            "Suite 2600 \n" +
            "Newark, NJ 07102";
    else
        offAddr = "1633 Broadway \n" +
            "New York, New York, 10019";

    // Populate shipping address field
    var shipAdr = "Kasowitz, Benson, Torres, & Friedman LLP \n" +
        "Attn: " + $("#txtReqName").val() + "\n" + offAddr

    $("#txtShipAddress").val(shipAdr);
    $("#lblShipAddress").text($('#txtShipAddress').val());
}

// Form Page populator
function PopForm() {
    // Populate Invoice
    $('#lblJustification').text($('#txtJustification').val());
    // Datepicker
    $('#txtDateRequested').datepicker().datepicker('setDate', new Date());

    PopShipAddr();
}

// Edit page vendor dialog
function VendDialog(i) {
    // Clear vals
    $("#vName").val("");
    $("#vWebsite").val("");
    $("#vAddress").val("");
    $("#vComment").val("");

    $("#cName").val("");
    $("#cTitle").val("");
    $("#cPhone").val("");
    $("#cExt").val("");
    $("#cFax").val("");
    $("#cEmail").val("");

    if (i !== null) {
        $.ajax({
            type: "GET",
            url: (pathName + "Edit/GetVend?id=" + i),
            dataType: "JSON",
            cache: false,
            success: function (data) {
                // Vendor info
                $("#vName").val(data.vendor.Name);
                $("#vWebsite").val(data.vendor.Website);
                $("#vAddress").val(data.vendor.Address1);
                $("#vComment").val(data.vendor.Comments);

                if (data.contact !== null) {
                    // Vendor contact info
                    $("#cName").val(data.contact.Name);
                    $("#cTitle").val(data.contact.Title);
                    $("#cPhone").val(data.contact.Phone);
                    $("#cExt").val(data.contact.Ext);
                    $("#cFax").val(data.contact.Fax);
                    $("#cEmail").val(data.contact.Email);
                }
            }
        });
    }

    var dialog = null;
    dialog = $('#tab1Form').dialog({
        height: 650,
        width: 430,
        modal: true,
        buttons: {
            "Save Edits": function () {
                var params =
                    "&name=" + $('#vName').val() +
                    "&website=" + $('#vWebsite').val() +
                    "&address=" + $('#vAddress').val() +
                    "&comments=" + $('#vComment').val() +
                    "&vendName=" + $('#cName').val() +
                    "&vendTitle=" + $('#cTitle').val() +
                    "&vendEmail=" + $('#cEmail').val() +
                    "&vendPhone=" + $('#cPhone').val() +
                    "&vendExt=" + $('#cExt').val() +
                    "&vendFax=" + $('#cFax').val();

                $.ajax({
                    type: "GET",
                    url: (pathName + "Edit/SaveEdits?id=" + i + params),
                    dataType: "JSON",
                    cache: false,
                    success: function (data) {
                        alert("The entry was saved successfully.")
                        $('#tab1Form').dialog("close");
                    }
                });
            },
            "Delete Entry": function () {
                var c = confirm("Are you sure you want to delete this vendor and its contact if it has one?");
                if (c === true) {
                    $.ajax({
                        type: "GET",
                        url: (pathName + "Edit/RemoveEntry?id=" + i + "&table=vendors"),
                        dataType: "JSON",
                        cache: false,
                        success: function (data) {
                            alert("The entry was deleted successfully.")
                            $('#tab1Form').dialog("close");
                        }
                    });
                }
            },
        },
        close: function () {
            //TODO: do something here...
        }
    });
    dialog.dialog("open");
}

// Edit page product dialog
function ProdDialog(i) {
    // Clear vals
    $("#pName").val("");

    if (i !== null) {
        $.ajax({
            type: "GET",
            url: (pathName + "Edit/GetProd?id=" + i),
            dataType: "JSON",
            cache: false,
            success: function (data) {
                $("#pName").val(data.Name);
            }
        });
    }
    var dialog = null;
    dialog = $('#tab2Form').dialog({
        height: 500,
        width: 500,
        modal: true,
        buttons: {
            "Save Edits": function () {
                var params = "&name=" + $('pName').val();
                $.ajax({
                    type: "GET",
                    url: (pathName + "Edit/SaveProds?id=" + i + params),
                    dataType: "JSON",
                    cache: false,
                    success: function (data) {
                        alert("The entry was saved successfully.")
                        $('#tab2Form').dialog("close");
                    }
                });
            },
            "Delete Entry": function () {
                var c = confirm("Are you sure you want to delete this product?");
                if (c === true) {
                    $.ajax({
                        type: "GET",
                        url: (pathName + "Edit/RemoveEntry?id=" + i + "&table=products"),
                        dataType: "JSON",
                        cache: false,
                        success: function (data) {
                            alert("The entry was deleted successfully.")
                            $('#tab2Form').dialog("close");
                        }
                    });
                }
            },
            close: function () {
                //TODO: do something here...
            }
        },
    });
    dialog.dialog("open");
}

// Add order item to preview invoice when mini form is submitted
function AddItems() {
    var rowTotal = parseFloat($('#txtPrice').val().replace("$", "")) * parseFloat($('#txtQuantity').val());
    rowTotal = rowTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    var row = "<tr name='invRow'><td><img src='" + pathName + "/Images/delete-32x32.png'" + "title='Delete this item.' style='height:20px;width:20px;cursor:pointer' /></td>" +
        "<td><span name='spProduct' class='editBorder' contenteditable='true'>" + $('#txtProduct').val() + "</span></td>" +
        "<td style='display:none'><span name='spPartNo' class='editBorder' contenteditable='true'>" + $('#txtPartNo').val() + "</span></td>" +
        "<td style='display:none'><span name='spDescription' class='editBorder' contenteditable='true'>" + $('#txtDescription').val() + "</span></td>" +
        "<td class='text-center'><span name='spQuantity' class='editBorder' contenteditable='true'>" + $('#txtQuantity').val() + "</span></td>" +
        "<td class='text-right'>$<span name='spPrice' class='editBorder' contenteditable='true'>" + $('#txtPrice').val().replace("$", "") + "</span></td>" +
        "<td class='text-right'>$<span name='spRowTotal'>" + rowTotal + "</span></td></tr>";
    $('#tblItemizedList').find("tbody").append(row);

    UpdateItems();

    // clear form vals
    $('#txtProduct').val("");
    $('#txtDescription').val("");
    $('#txtPartNo').val("");
    $('#txtPrice').val("$");
    $('#txtQuantity').val("1");
}

// Auto-update preview invoice when values change *also used to update the subtotals & totals of print page invoice*
function UpdateItems() {
    if ($('#tblItemizedList > tbody tr').length > 0) {
        var totPrice = 0;
        var totShipping = 0;
        var totTax = 0;
        $('#tblItemizedList > tbody tr').each(function (i) {
            totPrice += parseFloat($(this).find("span[name='spPrice']").text()) * parseInt($(this).find("span[name='spQuantity']").text());
            $(this).find("span[name='spRowTotal']").text(parseFloat($(this).find("span[name='spPrice']").text()) * parseInt($(this).find("span[name='spQuantity']").text()));
        });
        $("#subTotal").text("$" + totPrice.toFixed(2));
        totShipping = parseFloat($("#shipTotal").text().replace((/\d(?=(\d{3})+\.)/g, '$&,')));
        totTax = parseFloat($("#taxTotal").text().replace((/\d(?=(\d{3})+\.)/g, '$&,')));
        $("#grandTotal").text("$" + (totPrice + totShipping + totTax).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    }
    else {
        $("#subTotal").text("$0.00")
        $("#shipTotal").text("0.00")
        $("#taxTotal").text("0.00")
        $("#grandTotal").text("$0.00")
    }
}

// Clear form vals
function ClearForm() {
    // Empty the form vals in case of browser back button usage from print preview page

    // Vendors section
    $('#txtVContactName').val("");
    $('#txtVContactTitle').val("");
    $('#txtVContactAddress').val("");
    $('#txtVContactPhone').val("");
    $('#txtVContactExtension').val("");
    $('#txtVContactFax').val("");
    $('#txtVContactHyperlink').val("");

    // Product section
    $('#txtPrice').val("$");
    $('#txtDescription').val("");
    $('#txtPartNo').val("");
    $('#txtProduct').val("");
    $('#txtJustification').val("");
}

// Get key values in url
function GetUrlValue(VarSearch) {
    var SearchString = window.location.search.substring(1);
    var VariableArray = SearchString.split('&');
    for (var i = 0; i < VariableArray.length; i++) {
        var KeyValuePair = VariableArray[i].split('=');
        if (KeyValuePair[0] == VarSearch) {
            return KeyValuePair[1];
        }
    }
}

// Date formatting from sql return
function parseDate(strdate) {
    var d = null;
    if (strdate != null && strdate != "") {
        var s = new Date(parseInt(strdate.match(/\d{13}/), 10));
        d = (s.getMonth() + 1) + "/" + s.getDate() + "/" + s.getFullYear();
    }
    return d;
}

// Validate form input fields before submission
function ValidateInputs() {
    // Validation here if necessary in future...
    Submit();
}

// Form submit and ajax calls
function Submit() {
    //TODO: finish me!
    var terms = $('#lblPaymentTerms').text();
    var dateRequested = $('#txtDateRequested').val();
    var justification = $('#txtJustification').val();
    var requestorId = $('#txtReqName').data("requestorid");
    var vendor = $('#cboVendors').val();
    var productType = $('#cboProductType').val();
    var billingAddress = $('#txtBillAddress').val().replace(/(\r\n|\n|\r)/gm, " ");
    var shippingAddress = $('#txtShipAddress').val().replace(/\n/gm, "\\n");
    var signedBy = $('#txtSig').val();
    var tax = $("#taxTotal").text();
    var shipping = $("#shipTotal").text();

    var saveParams = "terms=" + terms
        + "&dateRequested=" + dateRequested
        + "&justification=" + encodeURIComponent(justification)
        + "&requestorId=" + requestorId
        + "&vendor=" + vendor
        + "&productType=" + productType
        + "&billingAddress=" + encodeURIComponent(billingAddress)
        + "&shippingAddress=" + encodeURIComponent(shippingAddress)
        + "&tax=" + tax
        + "&shipping=" + shipping
        + "&signedBy=" + signedBy;

    // Save PO form data
    $.ajax({
        type: "GET",
        url: (pathName + "Home/SavePOForm?" + saveParams),
        dataType: "JSON",
        cache: false,
        success: function (data) {
            var purchaseNum = data;
            $("tr[name='invRow']").each(function () {
                var product = $(this).find("span[name='spProduct']").text();
                var partNumber = $(this).find("span[name='spPartNo']").text();
                var description = $(this).find("span[name='spDescription']").text();
                var quantity = $(this).find("span[name='spQuantity']").text();
                var price = $(this).find("span[name='spPrice']").text();

                var itemParams = "purchaseNumber=" + purchaseNum
                    + "&product=" + product
                    + "&partNumber=" + partNumber
                    + "&description=" + encodeURIComponent(description)
                    + "&quantity=" + quantity
                    + "&price=" + price

                // Save ordered items
                $.ajax({
                    type: "GET",
                    url: (pathName + "Home/SaveOrderedItems?" + itemParams),
                    dataType: "JSON",
                    cache: false,
                });
            });
            window.location = (pathName + "PrintPreview?purchaseNumber=" + data);
        }
    });
}