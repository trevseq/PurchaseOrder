var pathName = location.pathname.toLowerCase();

//pathName = pathName.replace("secure", "");
pathName = pathName.replace("default", "");
pathName = pathName.replace("home", "");
pathName = pathName.replace("printpreview", "");
//pathName = pathName.replace("profiles", "");

pathName += ((pathName.substring(pathName.length - 1) != "/") ? "/" : "");
pathName = location.protocol + "//" + location.host + pathName.replace("//", "/");

var isValidated = false;


$(document).ready(function () {
    if (location.pathname.toLowerCase().indexOf("printpreview") == -1) {
        var ajxVend = $.ajax({ type: "GET", dataType: "JSON", url: pathName + "Home/GetVendors", cache: false });
        ajxVend.done(function (args) {
            var options = $.map(args, function (e) {
                return "<option value=\"" + e.Id + "\" data-address=\"" + e.Address1 + "\"  data-site=\"" + e.Website + "\">" + e.Name + "</option>";
            }).join("");

            $("#cboVendors").html("<option value=\"\" selected=\"\">Select...</option>" + options);
        });

        var ajxPayTerms = $.ajax({ type: "GET", dataType: "JSON", url: pathName + "Home/GetPaymentTerms", cache: false });
        ajxPayTerms.done(function (args) {
            var options = $.map(args, function (e) {
                return "<option value=\"" + e.Value + "\">" + e.Name + "</option>";
            }).join("");

            $("#cboPaymentTerms").html("<option value=\"\" selected=\"\">Select...</option>" + options);

        });

        var ajxProdType = $.ajax({ type: "GET", dataType: "JSON", url: pathName + "Home/GetProductType", cache: false });
        ajxProdType.done(function (args) {
            var options = $.map(args, function (e) {
                return "<option value=\"" + e.Id + "\">" + e.Name + "</option>";
            }).join("");

            $("#cboProductType").html("<option value=\"\" selected=\"\">Select...</option>" + options);

        });
        
        var ajxRequestor = $.ajax({ type: "GET", dataType: "JSON", url: pathName + "Home/GetRequestor", cache: false, async: false });
        ajxRequestor.done(function (args) {
            // Populate requestor section:
            $("#txtReqName").data("requestorid", args.EmployeeID);
            $("#txtReqName").val(args.FirstName + " " + args.LastName);
            $("#txtReqTitle").val(args.Title);
            $("#txtReqEmail").val(args.Email);
            $("#txtOffice").val(args.Room);
            $("#txtDepartment").val(args.Department);
            $("#txtReqPhone").val(args.Phone);
            $("#txtReqFax").val(args.Fax);
        });


        // Populate shipping address field
        var shipAdr = "Kasowitz, Benson, Torres, & Friedman LLP" + "\n" + "Attn: " + $("#txtDepartment").val() + "\n" + "1633 Broadway" + "\n" + "New York, New York, 10019";
        $("#txtShipAddress").val(shipAdr);
        

        // Populate Invoice 
        $('#lblPONum').text($('#txtPONum').val());
        $('#lblJustification').text($('#txtJustification').val());
        $("#lblShipAddress").text($("#txtShipAddress").val().replace("&#10;", "\n"));


        // Datepickers
        $('#txtDateRequested').datepicker();
        $('#txtDateRequired').datepicker();


        // Wire click events to re-validate controls.
        $("[type='text'],[type='date'],[type='number'],[type='email'],[type='textarea']").blur(function () {
            var txt = $(this);
            if (txt.val().length > 0) {
                // close the validation
                txt.validationEngine('hide');
            }
            else {
                if (isValidated)
                    txt.validationEngine('validate');
            }
        });


        // Update Invoice
        $("#txtShipAddress").blur(function (evt) {
            var id = evt.target.id.replace("txt", "lbl");
            $('#' + id).text($(evt.target).val());
        });
        $("select").change(function (evt) {
            var id = evt.target.id.replace("cbo", "lbl");
            $('#' + id).html($(evt.target).val());
        });
        $('#addItem').click(function (e) {
            AddItems();
            e.preventDefault();
        });
        $("#btnSubmit").click(function (e) {
            Submit();
            e.preventDefault();
        });
        // Delete Row button
        $(document).delegate("img[src$='delete-32x32.png']", "click", function (e) {
            $(this).closest("tr").remove();
            UpdateItems();
        });
        $('#cboVendors').change(function () {
            $('#txtVContactName').val("");
            $('#txtVContactTitle').val("");
            $('#txtVContactAddress').text("");
            $('#txtVContactPhone').val("");
            $('#txtVContactExtension').val("");
            $('#txtVContactFax').val("");
            $('#txtVContactHyperlink').val("");

            $('#lblVContactName').text("");
            $('#lblVContactTitle').text("");
            $('#lblVContactAddress').text("");
            $('#lblVContactPhone').text("");
            $('#lblVContactExtension').text("");
            $('#lblVContactFax').text("");


            var address = $("#cboVendors option:selected").data("address");
            var site = $("#cboVendors option:selected").data("site");

            $('#txtVContactAddress').val(address);
            $('#txtVContactHyperlink').val(site);
            $('#lblVendors').text($("#cboVendors option:selected").text());
            (address.length > 0) ? $('#lblVContactAddress').text(address) : "";

            var vendId = $('#cboVendors').val();
            var ajxContact = $.ajax({ type: "GET", dataType: "JSON", url: pathName + "Home/GetVendorContact?VId=" + vendId, cache: false });
            ajxContact.done(function (args) {
                $('#txtVContactName').val(args.Name);
                $('#txtVContactTitle').val(args.Title);
                $('#txtVContactPhone').val(args.Phone);
                $('#txtVContactExtension').val(args.Ext);
                $('#txtVContactFax').val(args.Fax);

                if (args.Name != null) {
                    (args.Title != null) ? $('#lblVContactName').text(args.Name + " (" + args.Title + ")") : $('#lblVContactName').text(args.Name);
                }
                (args.Ext != null) ? $('#lblVContactPhone').text(args.Phone + ":" + args.Ext) : $('#lblVContactPhone').text(args.Phone);
                (args.Fax != null) ? $('#lblVContactFax').text(args.Fax) : "";
                //$('#lblVContactFax').text(args.Fax);
            });
        });
        $("#lblComment").change(function () {
            $("div[name='comment']").val($("#lblComment").val());
        });
        // Div that acts like text input with placeholder (for comments)
        (function ($) {
            $(document).on('change keydown keypress input', 'div[data-placeholder]', function () {
                if (this.textContent) {
                    this.dataset.divPlaceholderContent = 'true';
                }
                else {
                    delete (this.dataset.divPlaceholderContent);
                }
            });
        })(jQuery);
    }
    else if (location.pathname.toLowerCase().indexOf("printpreview") > -1) {
        // Print preview
        var ajxVend = $.ajax({ type: "GET", dataType: "JSON", url: (pathName + "Home/GetPrintPreviewData?purchaseNumber=1"), cache: false });
        ajxVend.done(function (args) {

            var rowTotal = parseFloat($('#txtPrice').val()) * parseFloat($('#txtQuantity').val());
            var row = "<tr name='invRow'><td><span name='spProduct'>" +
                "product here" + "</span></td><td><span name='spPartNo'>" +
                "part no here" + "</span></td><td><span name='spDescription'>" +
                "desc here" + "</span></td><td>" + "<span name='spQuantity'>" +
                "quan here" + "</span>" + "</td><td class='text-right'>" +
                "$" + "<span name='spPrice'>" + "price here" + "</span>" + "</td><td class='text-right'>" +
                "$" + "<span name='spShipping'>" + "ship here" + "</span>" + "</td><td class='text-right'>" +
                "$" + "<span name='spTax'>" + "tax here" + "</span>" + "<td class='text-right'>" +
                "$" + rowTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + "</td></tr>";
            $('#tblItemizedList').find("tbody").append(row);
            UpdateItems();

            //$("#invoiceOrderDate").text(args.data.OrderDate);
        });
        var ajxRequestor = $.ajax({ type: "GET", dataType: "JSON", url: pathName + "Home/GetRequestor", cache: false });
        ajxRequestor.done(function (args) {
            // Populate fields
            $("#lblReqName").text(args.FirstName + " " + args.LastName);
        });
    }
});


function AddItems() {
    //Validate form inputs
    var formValid = $('#form2').validationEngine('validate', { autoPositionUpdate: true });
    isValidated = true;

    if (formValid != false) {
        var rowTotal = parseFloat($('#txtPrice').val()) * parseFloat($('#txtQuantity').val());
        var row = "<tr name='invRow'><td><img src='/Images/delete-32x32.png' style='height:20px;width:20px;cursor:pointer' /></td><td><span name='spProduct'>" +
            $('#txtProduct').val() + "</span></td><td style='display:none'><span name='spPartNo'>" +
            $('#txtPartNo').val() + "</span></td><td style='display:none'><span name='spDescription'>" +
            $('#txtDescription').val() + "</span></td><td class='text-center'>" + "<span name='spQuantity'>" +
            $('#txtQuantity').val() + "</span>" + "</td><td class='text-right'>" + "$" + "<span name='spPrice'>" +
            $('#txtPrice').val() + "</span>" + "</td><td class='text-right'>" + "$" + "<span name='spShipping'>" +
            $('#txtShipping').val() + "</span>" + "</td><td class='text-right'>" + "$" + "<span name='spTax'>" +
            $('#txtTax').val() + "</span>" + "<td class='text-right'>" + "$" + rowTotal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + "</td></tr>";
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
}

function UpdateItems() {
    var price = 0;
    var shipping = 0;
    var tax = 0;
    $('#tblItemizedList > tbody tr').each(function (i) {
        price += parseFloat($(this).find("span[name='spPrice']").text()) * parseInt($(this).find("span[name='spQuantity']").text());
        shipping += parseFloat($(this).find("span[name='spShipping']").text());
        tax += parseFloat($(this).find("span[name='spTax']").text());
    });
    $("#subTotal").text("$" + price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    $("#shipTotal").text("$" + shipping.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    $("#taxTotal").text("$" + tax.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
    $("#grandTotal").text("$" + (price + shipping + tax).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
}

function Submit() {
    //var mainParams = $("#mainForm").serialize();
    // Validate form inputs
    var form1Valid = $('#form1').validationEngine('validate', { autoPositionUpdate: true });
    var form3Valid = $('#form3').validationEngine('validate', { autoPositionUpdate: true });
    isValidated = true;
    var formValid = form1Valid && form3Valid;
    var purchaseNumber = 0;
    if (formValid != false) {
        var priority = $('#cboPriority').val();
        var terms = $('#cboPaymentTerms').val();
        var dateRequested = $('#txtDateRequested').val();
        var dateRequired = $('#txtDateRequired').val();
        var justification = $('#txtJustification').val();
        var manager = ($('#cboManager').val().length > 0) ? $('#cboManager').val() : "";
        var requestorId = $('#txtReqName').data("requestorid");
        var vendor = $('#cboVendors').val();
        var productType = $('#cboProductType').val();
        var billingAddress = $('#txtBillAddress').val();
        var shippingAddress = $('#txtShipAddress').val();
        var comment = $('#lblComment').text();
        var signedBy = $('#txtSig').val();

        var mainParams = "priority=" + priority +
            "&terms=" + terms +
            "&dateRequested=" + dateRequested +
            "&dateRequired=" + dateRequired +
            "&justification=" + justification +
            "&manager=" + manager +
            "&requestorId=" + requestorId +
            "&vendor=" + vendor +
            "&productType=" + productType +
            "&billingAddress=" + billingAddress +
            "&shippingAddress=" + shippingAddress +
            "&comment=" + comment +
            "&signedBy=" + signedBy;

        // Save PO form data.
        var x = $.ajax({ type: "GET", url: pathName + "home/SavePOForm?" + mainParams, datatype: "JSON", async: false, cache: false });
        x.done(function (args) {
            purchaseNumber = args;
        });


        // Loop over collection and save each row to database with an ajax call
        $("tr[name='invRow']").each(function () {
            var product = $(this).find("span[name='spProduct']").text();
            var partNumber = $(this).find("span[name='spPartNo']").text();
            var description = $(this).find("span[name='spDescription']").text();
            var quantity = $(this).find("span[name='spQuantity']").text();
            var price = $(this).find("span[name='spPrice']").text();
            var shipping = $(this).find("span[name='spShipping']").text();
            var tax = $(this).find("span[name='spTax']").text();

            var params = "&product=" + product +
                "&partNumber=" + partNumber +
                "&description=" + description +
                "&quantity=" + quantity +
                "&price=" + price +
                "&shipping=" + shipping +
                "&tax=" + tax;

            x = $.ajax({ type: "GET", url: pathName + "home/SaveOrderedItems?purchaseNumber=" + purchaseNumber + params, datatype: "JSON", async: false, cache: false });
            x.done(function (args) {

            });
        });


        window.location = pathName + "Home/PrintPreview?purchaseNumber=" + purchaseNumber;
    }
}