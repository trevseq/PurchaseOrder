﻿var pathName = location.pathname.toLowerCase();
var isValidated = false;

pathName = pathName.replace("default", "");
pathName = pathName.replace("home", "");
pathName = pathName.replace("printpreview", "");

pathName += ((pathName.substring(pathName.length - 1) != "/") ? "/" : "");
pathName = location.protocol + "//" + location.host + pathName.replace("//", "/");

$(document).ready(function () {
    // Form page
    if (location.pathname.toLowerCase().indexOf("printpreview") == -1) {

        /*==================== FORM PAGE AJAX CALLS ========================*/

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
        // Payment terms dropdown list
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetPaymentTerms",
            cache: false,
            success: function (data) {
                var options = $.map(data, function (e) {
                    return "<option value=\"" + e.Value + "\">" + e.Name + "</option>";
                }).join("");
                $("#cboPaymentTerms").html("<option value=\"\" selected=\"\">Select...</option>" + options);
            }
        });
        // Product types dropdown list
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
        // Fetch requestor info
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetRequestor",
            cache: false,
            async: false,
            success: function (data) {
                // Populate requestor section:
                $("#txtReqName").data("requestorid", data.EmployeeID);
                $("#txtReqName").val(data.FirstName + " " + data.LastName);
                $("#txtReqTitle").val(data.Title);
                $("#txtReqEmail").val(data.Email);
                $("#txtOffice").val(data.Room);
                $("#txtDepartment").val(data.Department);
                $("#txtReqPhone").val(data.Phone);
                $("#txtReqFax").val(data.Fax);
            }
        });


        /*============== FORM POPULATION ========================*/

        // Populate shipping address field
        var shipAdr = "Kasowitz, Benson, Torres, & Friedman LLP \n" +
            "Attn: " + $("#txtDepartment").val() + "\n" +
            "1633 Broadway \n" +
            "New York, New York, 10019";
        $("#txtShipAddress").val(shipAdr);

        // Populate Invoice 
        $('#lblJustification').text($('#txtJustification').val());
        $("#lblShipAddress").text($('#txtShipAddress').val());
        $('#lblReqName').text($('#txtReqName').val());
        $('#lblReqEmail').text($('#txtReqEmail').val());

        // Datepickers
        $('#txtDateRequested').datepicker().datepicker('setDate', new Date());
        $('#txtDateRequired').datepicker().datepicker('setDate', new Date());

        // Clear form vals in case back button is used on print preview page
        ClearForm();


        /*================ EVENT LISTENERS =========================*/

        // Update invoice ship address based on textarea value
        $("#txtShipAddress").blur(function (evt) {
            var id = evt.target.id.replace("txt", "lbl");
            text = $(evt.target).val()//.replace("\n", "</br>")
            $('#' + id).text(text);
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

        // Div that acts as a textarea box (for invoice comments)
        $('.divTxtArea').click(function () {
            if ($(this).data("commented") != "true") {
                $(this).text('');
            }
        });
        $('.divTxtArea').blur(function () {
            if ($(this).text() == '') {
                $(this).data("commented", "false");
                $(this).text('Comment here...');
            }
            else {
                $(this).data("commented", "true");
            }
        });

        // Vendors dropdown controls
        $('#cboVendors').change(function () {
            $("input[id^='txtVContact'").val("");
            $("div[id^='lblVContact'").text("");

            var address = $("#cboVendors option:selected").data("address");

            $('#txtVContactAddress').val(address);
            $('#txtVContactHyperlink').val($("#cboVendors option:selected").data("site"));
            $('#lblVendors').text($("#cboVendors option:selected").text());
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
                        (data.Title != null) ? $('#lblVContactName').text(data.Name + " (" + data.Title + ")") : $('#lblVContactName').text(data.Name);
                    }
                    (data.Ext != null) ? $('#lblVContactPhone').text(data.Phone + ":" + data.Ext) : $('#lblVContactPhone').text(data.Phone);
                    (data.Fax != null) ? $('#lblVContactFax').text(data.Fax) : "";
                }
            });
        });

        // Invoice comment area (acts like text input with placeholder attribute set)
        $("#lblComment").change(function () {
            $("div[name='comment']").val($("#lblComment").val());
        });
        (function ($) {
            $().on('change keydown keypress input', 'div[data-placeholder]', function () {
                if (this.textContent) {
                    this.dataset.divPlaceholderContent = 'true';
                }
                else {
                    delete this.dataset.divPlaceholderContent;
                }
            });
        })(jQuery);
    }

    // Print preview page
    else if (location.pathname.toLowerCase().indexOf("printpreview") > -1) {
        // Get data from server and populate most fields on page
        var PONumber = GetUrlValue("purchaseNumber");
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetPrintPreviewData?purchaseNumber=" + PONumber,
            cache: false,
            success: function (data) {
                // Order info: (PO#, terms, justification, shipaddr, vend contact info, et cetera)
                var poNum = data.info.PurchaseNumber;
                var priority = data.info.Priority;
                var terms = data.info.Terms;
                var justi = data.info.Justification;
                var shipAddr = data.info.ShippingAddress.replace(/(\\n)/gm, "\n");
                var com = data.info.Comment;
                var orderDate = data.info.OrderDate;
                var addr = data.info.Address1;
                var cName = data.info.Name;
                var cPhone = data.info.Phone;
                var cFax = data.info.Fax;
                var vendor = data.info.VendName;

                orderDate = parseDate(orderDate);

                $("#invoiceOrderDate").text(orderDate);
                $('#lblPaymentTerms').text(terms);
                $('#lblComment').text(com);
                $('#lblPONum').text(poNum);
                $('#lblVendors').text(vendor);
                $('#lblVContactName').text(cName);
                $('#lblVContactPhone').text(cPhone);
                $('#lblVContactFax').text(cFax);
                $('#lblVContactAddress').text(addr);
                $('#lblShipAddress').text(shipAddr);
                $('#lblJustification').text(justi);


                // Purchased items: (for rows in invoice table)
                var p;
                for (p in data.subItems) {
                    var prod = data.subItems[p].Product;
                    var quan = data.subItems[p].Quantity;
                    var price = data.subItems[p].Price;
                    var tax = data.subItems[p].Tax;
                    var ship = data.subItems[p].Shipping;
                    var desc = data.subItems[p].Description;
                    var partNum = data.subItems[p].PartNumber;
                    var rowTotal = parseFloat(price) * parseFloat(quan) + parseFloat(tax) + parseFloat(ship);

                    var row = "<tr name='invRow'>";
                    row += "<td><span name='spProduct'>" + prod + "</span></td>";
                    row += "<td><span name='spPartNo'>" + partNum + "</span></td>";
                    row += "<td><span name='spDescription'>" + desc + "</span></td>";
                    row += "<td><span name='spQuantity'>" + quan + "</span></td>";
                    row += "<td class='text-right'>$<span name='spPrice'>" + price + "</span></td>";
                    row += "<td class='text-right'>$<span name='spShipping'>" + ship + "</span></td>";
                    row += "<td class='text-right'>$<span name='spTax'>" + tax + "</span></td>";
                    row += "<td class='text-right'>$" + rowTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + "</td></tr>";

                    $('#tblItemizedList').find("tbody").append(row);
                }
                UpdateItems();
            }
        });
        // Get requestor info from server and populate requestor fields
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetRequestor",
            cache: false,
            success: function (data) {
                $('#lblReqName').text(data.FirstName + " " + data.LastName);
                $('#lblReqEmail').text(data.Email);
            }
        });
    }
});


/*=============== FUNCTIONS ========================*/

// Add order item to preview invoice when mini form is submitted
function AddItems() {
    var rowTotal = parseFloat($('#txtPrice').val()) * parseFloat($('#txtQuantity').val()) + parseFloat($('#txtTax').val()) + parseFloat($('#txtShipping').val());
    rowTotal = rowTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    var row = "<tr name='invRow'><td><img src='/Images/delete-32x32.png' style='height:20px;width:20px;cursor:pointer' /></td>" +
        "<td><span name='spProduct'>" + $('#txtProduct').val() + "</span></td>" +
        "<td style='display:none'><span name='spPartNo'>" + $('#txtPartNo').val() + "</span></td>" +
        "<td style='display:none'><span name='spDescription'>" + $('#txtDescription').val() + "</span></td>" +
        "<td class='text-center'><span name='spQuantity'>" + $('#txtQuantity').val() + "</span></td>" +
        "<td class='text-right'>$<span name='spPrice'>" + $('#txtPrice').val() + "</span></td>" +
        "<td class='text-right'>$<span name='spShipping'>" + $('#txtShipping').val() + "</span></td>" +
        "<td class='text-right'>$<span name='spTax'>" + $('#txtTax').val() + "</span>" +
        "<td class='text-right'>$" + rowTotal + "</td></tr>";
    $('#tblItemizedList').find("tbody").append(row);

    UpdateItems();

    // clear form vals
    $('#txtProduct').val("");
    $('#txtDescription').val("");
    $('#txtPartNo').val("");
    $('#txtPrice').val("");
    $('#txtQuantity').val("1");
    $('#txtShipping').val("");
    $('#txtTax').val("");
}

// Auto-update preview invoice when values change
function UpdateItems() {
    var totPrice = 0;
    var totShipping = 0;
    var totTax = 0;
    $('#tblItemizedList > tbody tr').each(function (i) {
        totPrice += parseFloat($(this).find("span[name='spPrice']").text()) * parseInt($(this).find("span[name='spQuantity']").text());
        totShipping += parseFloat($(this).find("span[name='spShipping']").text());
        totTax += parseFloat($(this).find("span[name='spTax']").text());
    });
    $("#subTotal").text("$" + totPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    $("#shipTotal").text("$" + totShipping.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    $("#taxTotal").text("$" + totTax.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    $("#grandTotal").text("$" + (totPrice + totShipping + totTax).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
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
    $('#txtTax').val("");
    $('#txtShipping').val("");
    $('#txtPrice').val("");
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

// Unused
function formatAMPM(date) {
    var d = new Date(parseInt(date.match(/\d{13}/), 10));
    var strTime = formatAMPMFromDate(d);
    return strTime;
}

// Unused
function formatAMPMFromDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

// Parse addresses
function ParseAddr(adr) {
    // asdfghjkl;
}

// Validate form input fields before submission
function ValidateInputs() {
    // Validation here if necessary in future...
    Submit();
}

// Form submit and ajax calls
function Submit() {
    var priority = $('#cboPriority').val();
    var terms = $('#cboPaymentTerms').val();
    var dateRequested = $('#txtDateRequested').val();
    var dateRequired = $('#txtDateRequired').val();
    var justification = $('#txtJustification').val();
    var manager = $('#cboManager').val();
    var requestorId = $('#txtReqName').data("requestorid");
    var vendor = $('#cboVendors').val();
    var productType = $('#cboProductType').val();
    var billingAddress = $('#txtBillAddress').val().replace(/(\r\n|\n|\r)/gm, " ");
    var shippingAddress = $('#txtShipAddress').val().replace(/\n/gm, "\\n");
    var comment = ($('#lblComment').data("commented") == true) ? $('#lblComment').text() : "";
    var signedBy = $('#txtSig').val();

    var saveParams = "priority=" + priority
        + "&terms=" + terms
        + "&dateRequested=" + dateRequested
        + "&dateRequired=" + dateRequired
        + "&justification=" + encodeURIComponent(justification)
        + "&manager=" + manager
        + "&requestorId=" + requestorId
        + "&vendor=" + vendor
        + "&productType=" + productType
        + "&billingAddress=" + encodeURIComponent(billingAddress)
        + "&shippingAddress=" + encodeURIComponent(shippingAddress)
        + "&comment=" + encodeURIComponent(comment)
        + "&signedBy=" + signedBy;

    // Save PO form data
    $.ajax({
        type: "GET",
        url: (pathName + "Home/SavePOForm?" + saveParams),
        dataType: "JSON",
        async: false,
        cache: false,
        success: function (data) {
            var purchaseNum = data;
            $("tr[name='invRow']").each(function () {
                var product = $(this).find("span[name='spProduct']").text();
                var partNumber = $(this).find("span[name='spPartNo']").text();
                var description = $(this).find("span[name='spDescription']").text();
                var quantity = $(this).find("span[name='spQuantity']").text();
                var price = $(this).find("span[name='spPrice']").text();
                var shipping = $(this).find("span[name='spShipping']").text();
                var tax = $(this).find("span[name='spTax']").text();

                var itemParams = "purchaseNumber=" + purchaseNum
                    + "&product=" + product
                    + "&partNumber=" + partNumber
                    + "&description=" + encodeURIComponent(description)
                    + "&quantity=" + quantity
                    + "&price=" + price
                    + "&shipping=" + shipping
                    + "&tax=" + tax;
                

                // Save ordered items
                $.ajax({
                    type: "GET",
                    url: (pathName + "Home/SaveOrderedItems?" + itemParams),
                    dataType: "JSON",
                    async: false,
                    cache: false,
                });
            });
            window.location = (pathName + "Home/PrintPreview?purchaseNumber=" + data);
        }
    });
}