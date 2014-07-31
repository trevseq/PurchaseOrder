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
    // Form page
    if (location.pathname.toLowerCase().indexOf("printpreview") == -1) {
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

        // Populate shipping address field
        var shipAdr = "Kasowitz, Benson, Torres, & Friedman LLP" +
            "\n" +
            "Attn: " + $("#txtDepartment").val() +
            "\n" +
            "1633 Broadway" +
            "\n" +
            "New York, New York, 10019";
        $("#txtShipAddress").val(shipAdr);

        // Populate Invoice 
        $('#lblPONum').text($('#txtPONum').val());
        $('#lblJustification').text($('#txtJustification').val());
        $("#lblShipAddress").text($('#txtShipAddress').val().replace("&#10;", "\n"));
        $('#lblReqName').text($('#txtReqName').val());
        $('#lblReqEmail').text($('#txtReqEmail').val());

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

        // Update invoice ship address based on textarea value
        $("#txtShipAddress").blur(function (evt) {
            var id = evt.target.id.replace("txt", "lbl");
            text = $(evt.target).val().replace("\n", "</br>")
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

            $('#txtVContactAddress').val(address);
            $('#txtVContactHyperlink').val($("#cboVendors option:selected").data("site"));
            $('#lblVendors').text($("#cboVendors option:selected").text());
            (address.length > 0) ? $('#lblVContactAddress').text(address) : "";

            // Fetch vendor contact info
            $.ajax({
                type: "GET",
                dataType: "JSON",
                url: pathName + "Home/GetVendorContact?VId" + $('#cboVendors').val(),
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

    // Print preview page
    else if (location.pathname.toLowerCase().indexOf("printpreview") > -1) {
        // Get data from server and populate most fields on page
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetPrintPreviewData?purchaseNumber=1",
            cache: false,
            success: function (data) {
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
            }
        });
        // Get requestor info from server and populate requestor fields
        $.ajax({
            type: "GET",
            dataType: "JSON",
            url: pathName + "Home/GetRequestor",
            cache: false,
            success: function (data) {
                $('#lblReqName').text(data.FirstName + " " + data.LastName)
            }
        });
    }
});

// Add order item to preview invoice when mini form is submitted
function AddItems() {
    // Validate form inputs
    $('#form2').validationEngine('validate', {
        autoPositionUpdate: true,
        onSuccess: function () {
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
    });
}

// Auto-update preview invoice when values change
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

// Main form submission control
function Submit() {
    // Validate form inputs
    var form1Valid = $('#form1').validationEngine('validate', { autoPositionUpdate: true });
    var form3Valid = $('#form3').validationEngine('validate', { autoPositionUpdate: true });
    var formValid = form1Valid && form3Valid;
    var purchaseNumber = 0; // <-- for debug purposes!
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

        var saveParams = "priority=" + priority +
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

        // Save PO form data
        $.ajax({
            type: "GET",
            url: pathName + "Home/SavePOForm?" + saveParams,
            dataType: "JSON",
            async: false,
            cache: false,
            success: function (data) {
                alert(data); // <-- Debug
            }
        });

        $("tr[name='invRow']").each(function () {
            var product = $(this).find("span[name='spProduct']").text();
            var partNumber = $(this).find("span[name='spPartNo']").text();
            var description = $(this).find("span[name='spDescription']").text();
            var quantity = $(this).find("span[name='spQuantity']").text();
            var price = $(this).find("span[name='spPrice']").text();
            var shipping = $(this).find("span[name='spShipping']").text();
            var tax = $(this).find("span[name='spTax']").text();

            var itemParams = "&product=" + product +
                "&partNumber=" + partNumber +
                "&description=" + description +
                "&quantity=" + quantity +
                "&price=" + price +
                "&shipping=" + shipping +
                "&tax=" + tax;
            // Save ordered items
            $.ajax({
                type: "GET",
                url: pathName + "Home/SaveOrderedItems?purchaseNumber=" + purchaseNumber + itemParams,
                dataType: "JSON",
                async: false,
                cache: false
            });
        });


        window.location = pathName + "Home/PrintPreview?purchaseNumber=" + purchaseNumber;
    }
}