sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Text",
    "sap/m/ColumnListItem",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Text, ColumnListItem, Button, Dialog, JSONModel) {
        "use strict";

        let selectedVendorId;
        // get the freight vendor details
        return Controller.extend("sap.btp.freightvendorui.controller.View1", {
            onInit: function () {
                // Show the BusyIndicator while data is being loaded
                sap.ui.core.BusyIndicator.show();

                let oModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oModel);

                // Load data asynchronously
                this.getFreightVendorsDetails()
                    .then(() => {
                        // Hide the BusyIndicator once data is loaded
                        sap.ui.core.BusyIndicator.hide();
                    })
                    .catch((error) => {
                        // Handle errors if necessary
                        console.error("Error loading data:", error);
                        // Hide the BusyIndicator in case of an error
                        sap.ui.core.BusyIndicator.hide();
                    });
            },

            // Get all the available freight vendor details
            getFreightVendorsDetails: async function () {
                try {
                    // Fetch data asynchronously
                    const response = await fetch('https://freightVendorInfo-surprised-otter-nk.cfapps.us10-001.hana.ondemand.com/getData');
                    const data = await response.json();

                    // Set data to the model
                    this.getView().getModel().setProperty("/freightVendorDetails", data);

                    // Hide the BusyIndicator once data is loaded
                    sap.ui.core.BusyIndicator.hide();
                } catch (error) {
                    // Handle errors if necessary
                    console.error("Error loading data:", error);

                    // Hide the BusyIndicator in case of an error
                    sap.ui.core.BusyIndicator.hide();

                    // Propagate the error to allow handling at a higher level
                    throw error;
                }
            },

            // Add the new freight vendor details.
            addNewFreightVendor: function () {
                const buttonId = this.getView().byId('add').getText();
                console.log(buttonId, 'Add Freight Vendors');
                const freightVendorName = this.getView().byId('freightVendorName').getValue();
                const destinationLocation = this.getView().byId('destinationLocation').getValue();
                const pickUpLocation = this.getView().byId('pickUpLocation').getValue();
                const price = this.getView().byId('price').getValue();
                const contact = this.getView().byId('contact').getValue();
                const deliveryInDays = this.getView().byId('deliveryInDays').getValue();

                fetch('https://freightVendorInfo-surprised-otter-nk.cfapps.us10-001.hana.ondemand.com/addData', {
                    'method': 'POST',
                    'body': JSON.stringify({ freightVendorName, destinationLocation, pickUpLocation, deliveryInDays, price, contact }),
                    'headers': { 'content-type': 'application/json' }
                })
                    .then((res) => res.json())
                    .then(data => {
                        console.log(data.message);
                        this.showToastMessage(data.message, "success");
                        this.getView().byId("freightVendorName").setValue();
                        this.getView().byId("price").setValue();
                        this.getView().byId("deliveryInDays").setValue();
                        this.getView().byId("destinationLocation").setValue();
                        this.getView().byId("pickUpLocation").setValue();
                        this.getView().byId("contact").setValue();

                        this.getFreightVendorsDetails()
                    })
            },

            // Fetch the details of the selected freight vendor id to update
            handleSelectCustomer: function (e) {
                const selectedItem = e.getParameter("selectedItem");
                selectedVendorId = selectedItem.getText();

                const fvData = this.getView().getModel().getProperty("/freightVendorDetails");

                const selectedFreight = fvData.find(el => el.FREIGHTVENDORID === +selectedVendorId);
                this.getView().getModel().setProperty("/updateFreightData", selectedFreight);
            },

            // Update the particular freight vendor details
            updateCustomer: function () {
                const freightVendorName = this.getView().byId("updateName").getValue();
                const deliveryInDays = this.getView().byId("updateDeliveryDays").getValue();
                const pickUpLocation = this.getView().byId("updatePickUpLocation").getValue();
                const destinationLocation = this.getView().byId("updateDestination").getValue();
                const price = this.getView().byId("updatePrice").getValue();
                const contact = this.getView().byId("updateContact").getValue();

                console.log(freightVendorName);
                fetch('https://freightVendorInfo-surprised-otter-nk.cfapps.us10-001.hana.ondemand.com/updateData', {
                    method: 'PUT',
                    body: JSON.stringify({ freightVendorId: selectedVendorId, freightVendorName: freightVendorName, pickUpLocation: pickUpLocation, destinationLocation: destinationLocation, deliveryInDays: deliveryInDays, price: price, contact: contact }),
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(res => res.json())
                    .then(data => {
                        this.showToastMessage(data.message, "update");
                        // After successful update, clear the input fields
                        this.getFreightVendorsDetails(),
                            this.clearInputFields()
                    })
            },

            // Delete the particular freight vendor details
            deleteCustomer: function (event) {
                const freightvendorid = event.getSource().getParent().getBindingContext().getProperty("FREIGHTVENDORID/");

                fetch(`https://freightVendorInfo-surprised-otter-nk.cfapps.us10-001.hana.ondemand.com/deleteData/${freightvendorid}`, {
                    method: 'DELETE'
                })
                    .then(res => res.json())
                    .then(data => {
                        this.showToastMessage(data.message, "delete")
                        this.getFreightVendorsDetails()
                    })
            },

            // Clear the fields after clicking the update button
            clearInputFields: function () {
                // Clear the input fields by setting their values to an empty string
                this.getView().byId("updateName").setValue("");
                this.getView().byId("updateDeliveryDays").setValue("");
                this.getView().byId("updatePickUpLocation").setValue("");
                this.getView().byId("updateDestination").setValue("");
                this.getView().byId("updatePrice").setValue("");
                this.getView().byId("updateContact").setValue("");
            },

            // Handle the response message
            showToastMessage: function (message, messageType) {
                let icon, title, styleClass;

                switch (messageType) {
                    case 'success':
                        icon = sap.m.MessageBox.Icon.SUCCESS;
                        title = 'Success';
                        styleClass = 'sapUiSizeCompact sapUiMessageToastSuccess';
                        break;
                    case 'delete':
                        icon = sap.m.MessageBox.Icon.SUCCESS; // or use any appropriate icon for delete
                        title = 'Delete';
                        styleClass = 'sapUiSizeCompact sapUiMessageToastDelete';
                        break;
                    case 'update':
                        icon = sap.m.MessageBox.Icon.SUCCESS; // or use any appropriate icon for delete
                        title = 'Update';
                        styleClass = 'sapUiSizeCompact sapUiMessageToastUpdate';
                        break;
                    case 'error':
                        icon = sap.m.MessageBox.Icon.ERROR;
                        title = 'Error';
                        styleClass = 'sapUiSizeCompact sapUiMessageToastError';
                        break;
                    default:
                        icon = sap.m.MessageBox.Icon.NONE;
                        title = 'Message';
                        styleClass = 'sapUiSizeCompact';
                }

                sap.m.MessageBox.show(
                    message, {
                    icon: icon,
                    title: title,
                    actions: [sap.m.MessageBox.Action.OK],
                    styleClass: styleClass
                }
                );
            }
        });
    });