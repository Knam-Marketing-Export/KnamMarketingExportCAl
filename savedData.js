document.getElementById('logout-button').addEventListener('click', function () {
    const logoutConfirmation = confirm("Are you sure you want to Logout?");
    if (logoutConfirmation) {
        window.location.href = 'index.html';  // Redirect to login page
    }
});


AWS.config.update({
    region: 'ap-south-1',  // Example: 'us-east-1'
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-south-1:ba6c8d5d-3899-4553-a79e-8c4117eb3542'  // Cognito Identity Pool ID
    })
});

// Create a new DynamoDB document client
const dynamodb = new AWS.DynamoDB.DocumentClient();

document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('savedDataTable');
    const columnToggleSection = document.getElementById('columnToggleSection');
    const toggleButton = document.querySelector('.toggle-button');
    const checkboxes = columnToggleSection ? columnToggleSection.querySelectorAll('input[type="checkbox"]') : [];

    if (!table || !columnToggleSection || !toggleButton) {
        console.error('Required elements are missing.');
        return;
    }

    // Show/Hide column toggles
    toggleButton.addEventListener('click', function () {
        columnToggleSection.classList.toggle('hidden');
    });

    // Column visibility toggle
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const columnIndex = parseInt(this.dataset.column, 10);
            const isChecked = this.checked;
            toggleColumnVisibility(columnIndex, isChecked);
            saveColumnVisibilitySettings();
        });
    });

    // Toggle column visibility
    function toggleColumnVisibility(columnIndex, isVisible) {
        if (columnIndex < 1) return;

        // Select both header and data cells for the column
        const headers = table.querySelectorAll(`th:nth-child(${columnIndex})`);
        const cells = table.querySelectorAll(`td:nth-child(${columnIndex})`);

        headers.forEach(header => {
            header.style.display = isVisible ? '' : 'none';
        });

        cells.forEach(cell => {
            cell.style.display = isVisible ? '' : 'none';
        });
    }

    // Save column visibility settings
    function saveColumnVisibilitySettings() {
        const settings = {};
        checkboxes.forEach(checkbox => {
            settings[checkbox.dataset.column] = checkbox.checked;
        });

        const params = {
            TableName: 'UserSettings', // Replace with your settings table name
            Item: {
                'UserId': 'User123', // Replace with actual user ID or relevant key
                'VisibilitySettings': settings
            }
        };

        dynamodb.put(params, function (err) {
            if (err) {
                console.error("Unable to save settings:", err);
            } else {
                console.log("Settings saved successfully.");
            }
        });
    }

    // Load column visibility settings
    function loadColumnVisibilitySettings() {
        const params = {
            TableName: 'UserSettings',
            Key: {
                'UserId': 'User123' // Replace with actual user ID or relevant key
            }
        };

        dynamodb.get(params, function (err, data) {
            if (err) {
                console.error("Unable to load settings:", err);
            } else {
                if (data && data.Item && data.Item.VisibilitySettings) {
                    applyColumnVisibilitySettings(data.Item.VisibilitySettings);
                } else {
                    console.log("No visibility settings found. Defaulting to all columns visible.");
                }
            }
        });
    }

    // Apply column visibility settings
    function applyColumnVisibilitySettings(settings) {
        checkboxes.forEach(checkbox => {
            const columnIndex = parseInt(checkbox.dataset.column, 10);
            const isVisible = settings[columnIndex] !== false; // Default to true if not specified
            checkbox.checked = isVisible;
            toggleColumnVisibility(columnIndex, isVisible);
        });
    }

    // Initial load of column visibility settings
    loadColumnVisibilitySettings();

    // Initialize table with data
    function loadTableData() {
        const params = {
            TableName: 'CostCalculatorResults' // Replace with your DynamoDB table name
        };

        dynamodb.scan(params, function (err, data) {
            if (err) {
                console.error("Unable to load data from DynamoDB:", err);
            } else {
                populateTable(data.Items);
            }
        });
    }

    function populateTable(items) {
        const tableBody = document.getElementById('tableBody');
        const user = JSON.parse(localStorage.getItem('user')); // Retrieve user data from localStorage
        tableBody.innerHTML = '';

        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `        <td>${item.Date}</td>
            <td>${item.ID}</td>
            <td>${item.SalesPerson}</td>
            <td>${' ₹ ' + item.ExchangeRate}</td>
            <td>${item.GSM}</td>
            <td>${item.PaperMill}</td>
            <td>${item.PaperCode}</td>
            <td>${item.SheetingLength}</td>
            <td>${item.SheetingWidth}</td>
            <td>${item.NoOfSheet}</td>
            <td>${item.NoOfReam}</td>
            <td>${item.WeightOfReam}</td>
            <td>${' ₹ ' + item.PaperCost}</td>
            <td>${item.FreightPort}</td>
            <td>${' ₹ ' + item.FreightCost}</td>
            <td>${item.WeightOfCarton}</td>
            <td>${item.WrappersPerTon}</td>
            <td>${item.CartonsPerTon}</td>
            <td>${item.TotalCost + ' $ USD'}</td>
            <td>${item.PricePerMT + ' $ USD'}</td>
            <td>${item.PricePerBox + ' $ USD'}</td>
            <td>${item.SheetingPlace}</td>
            <td>${item.SheetingCost}</td>
            <td>${item.WrappersPrice}</td>
            <td>${item.BoxPrice}</td>
            <td>${item.LocalFreight}</td>
            <td>${item.Miscellaneous}</td>
            <td>${item.Margin}</td>
            <td>${item.Customer}</td>
            `;

            // Conditionally render both Edit and Delete buttons for admins only
            let actions = '<td class="actions">';
            if (user && user.isAdmin) {
                actions += `
                <button onclick="editRow('${item.ID}')">Edit</button>
                <button onclick="deleteRow('${item.ID}')">Delete</button>
            `;
            }
            actions += `</td>`;

            // Append actions to the row
            row.innerHTML += actions;

            tableBody.appendChild(row);
        });
    }


    window.editRow = function (id) {
        const params = {
            TableName: 'CostCalculatorResults',
            Key: { 'ID': id }
        };

        dynamodb.get(params, function (err, data) {
            if (err) {
                console.error("Unable to retrieve item:", err);
            } else {
                const item = data.Item;

                if (item) {
                    // Populate the form with the retrieved data
                    document.getElementById('editQuatationNumber').innerText = item.ID || '';
                    document.getElementById('salesPersonDropdown').value = item.SalesPerson || '';
                    document.getElementById('editExchangeRate').value = item.ExchangeRate || '';
                    document.getElementById('editGsmSelect').value = item.GSM || '';
                    document.getElementById('editPaperMillSelect').value = item.PaperMill || '';
                    document.getElementById('editPapercodeSelect').value = item.PaperCode || '';
                    document.getElementById('editPaperMillBhal').value = item.SheetingPlace || '';
                    document.getElementById('editSheetsizelength').value = item.SheetingLength || '';
                    document.getElementById('editSheetsizewidth').value = item.SheetingWidth || '';
                    document.getElementById('editSheetInReam').value = item.NoOfSheet || '';
                    document.getElementById('editReamPerCarton').value = item.NoOfReam || '';
                    document.getElementById('editReamWeight').value = item.WeightOfReam || '';
                    document.getElementById('editPaperCost').value = item.PaperCost || '';
                    document.getElementById('editfreightSelect').value = item.FreightPort || '';
                    document.getElementById('editFreightCost').value = item.FreightCost || '';
                    document.getElementById('editWeightOfReam').innerText = item.WeightOfReam.toFixed(3) + ' Kg' || '';
                    document.getElementById('editWeightOfCarton').innerText = item.WeightOfCarton.toFixed(3) + ' Kg' || '';
                    document.getElementById('editwrappersPerTon').innerText = item.WrappersPerTon.toFixed(1) + ' Nos ' || '';
                    document.getElementById('editCartonsPerTon').innerText = item.CartonsPerTon.toFixed(1) + ' Nos ' || '';
                    document.getElementById('editTotalCost').innerText = item.TotalCost.toFixed(2) + ' $ USD' || '';
                    document.getElementById('editPricePerMT').innerText = item.PricePerMT.toFixed(2) + ' $ USD' || '';
                    document.getElementById('editPricePerBox').innerText = item.PricePerBox.toFixed(2) + ' $ USD' || '';
                    document.getElementById('editEditMastersheettingPrice').value = item.SheetingCost || '';
                    document.getElementById('editEditMasterwrapperPrice').value = item.WrappersPrice || '';
                    document.getElementById('editEditMasterboxPrice').value = item.BoxPrice || '';
                    document.getElementById('editEditMasterLocalFreight').value = item.LocalFreight || '';
                    document.getElementById('editEditMasterMiscellaneous').value = item.Miscellaneous || '';
                    document.getElementById('editEditMastermarginPrice').value = item.Margin || '';
                    document.getElementById('editCustomerName').value = item.Customer || '';

                    // Show the form
                    document.getElementById('quoteForm').style.display = 'block';
                } else {
                    console.error("Item not found.");
                }
            }
        });
    };

    // Close the modal
    window.closeModal = function () {
        document.getElementById('quoteForm').style.display = 'none';
    };

    // Save the edited data back to DynamoDB
    function saveEdits() {
        const id = document.getElementById('editQuatationNumber').innerText; // Read from innerText
        const salesPerson = document.getElementById('salesPersonDropdown').value;
        const exchangeRate = document.getElementById('editExchangeRate').value;
        const gsm = document.getElementById('editGsmSelect').value;
        const paperMill = document.getElementById('editPaperMillSelect').value;
        const paperCode = document.getElementById('editPapercodeSelect').value;
        const sheetingPlace = document.getElementById('editPaperMillBhal').value;
        const sheetingLength = document.getElementById('editSheetsizelength').value;
        const sheetingWidth = document.getElementById('editSheetsizewidth').value;
        const noOfSheet = document.getElementById('editSheetInReam').value;
        const noOfReam = document.getElementById('editReamPerCarton').value;
        const weightOfReam = document.getElementById('editReamWeight').value;
        const paperCost = document.getElementById('editPaperCost').value;
        const freightPort = document.getElementById('editfreightSelect').value;
        const freightCost = document.getElementById('editFreightCost').value;
        const sheetingCost = document.getElementById('editEditMastersheettingPrice').value;
        const wrappersPrice = document.getElementById('editEditMasterwrapperPrice').value;
        const boxPrice = document.getElementById('editEditMasterboxPrice').value;
        const localFreight = document.getElementById('editEditMasterLocalFreight').value;
        const miscellaneous = document.getElementById('editEditMasterMiscellaneous').value;
        const margin = document.getElementById('editEditMastermarginPrice').value;
        const customer = document.getElementById('editCustomerName').value;

        // Validate and parse numeric values
        const validatedExchangeRate = parseFloat(exchangeRate) || 0;
        const validatedGSM = parseFloat(gsm) || 0;
        const validatedNoOfSheet = parseInt(noOfSheet) || 0;
        const validatedNoOfReam = parseInt(noOfReam) || 0;
        const validatedWeightOfReam = parseFloat(weightOfReam) || 0;
        const validatedPaperCost = parseFloat(paperCost) || 0;
        const validatedFreightCost = parseFloat(freightCost) || 0;
        const validatedSheetingCost = parseFloat(sheetingCost) || 0;
        const validatedWrappersPrice = parseFloat(wrappersPrice) || 0;
        const validatedBoxPrice = parseFloat(boxPrice) || 0;
        const validatedLocalFreight = parseFloat(localFreight) || 0;
        const validatedMiscellaneous = parseFloat(miscellaneous) || 0;
        const validatedMargin = parseFloat(margin) || 0;

        // Prepare DynamoDB update parameters
        const params = {
            TableName: 'CostCalculatorResults',
            Key: {
                'ID': id  // Assuming ID is a string attribute
            },
            UpdateExpression: `SET SalesPerson = :salesPerson, ExchangeRate = :exchangeRate, GSM = :gsm,
                           PaperMill = :paperMill, PaperCode = :paperCode, SheetingPlace = :sheetingPlace,
                           SheetingLength = :sheetingLength, SheetingWidth = :sheetingWidth, NoOfSheet = :noOfSheet,
                           NoOfReam = :noOfReam, WeightOfReam = :weightOfReam, PaperCost = :paperCost,
                           FreightPort = :freightPort, FreightCost = :freightCost, SheetingCost = :sheetingCost,
                           WrappersPrice = :wrappersPrice, BoxPrice = :boxPrice, LocalFreight = :localFreight,
                           Miscellaneous = :miscellaneous, Margin = :margin, Customer = :customer`,
            ExpressionAttributeValues: {
                ':salesPerson': salesPerson,
                ':exchangeRate': validatedExchangeRate,
                ':gsm': validatedGSM,
                ':paperMill': paperMill,
                ':paperCode': paperCode,
                ':sheetingPlace': sheetingPlace,
                ':sheetingLength': sheetingLength,
                ':sheetingWidth': sheetingWidth,
                ':noOfSheet': validatedNoOfSheet,
                ':noOfReam': validatedNoOfReam,
                ':weightOfReam': validatedWeightOfReam,
                ':paperCost': validatedPaperCost,
                ':freightPort': freightPort,
                ':freightCost': validatedFreightCost,
                ':sheetingCost': validatedSheetingCost,
                ':wrappersPrice': validatedWrappersPrice,
                ':boxPrice': validatedBoxPrice,
                ':localFreight': validatedLocalFreight,
                ':miscellaneous': validatedMiscellaneous,
                ':margin': validatedMargin,
                ':customer': customer
            },
            ReturnValues: 'UPDATED_NEW'
        };

        // Call DynamoDB to update the item
        dynamodb.update(params, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error:", JSON.stringify(err, null, 2));
                alert("Error updating item. Please try again.");
            } else {
                console.log("Update succeeded:", JSON.stringify(data, null, 2));
                alert("Quotation updated successfully!");
                closeModal();  // Close the modal or form
                loadTableData();  // Reload the table to reflect the changes
            }
        });
    }

    document.getElementById('edit-save-button').addEventListener('click', function () {
        saveEdits();
    });



    // Delete row
    window.deleteRow = function (id) {
        if (confirm('Are you sure you want to delete this item?')) {
            const params = {
                TableName: 'CostCalculatorResults',
                Key: { 'ID': id }
            };

            dynamodb.delete(params, function (err) {
                if (err) {
                    console.error("Unable to delete item:", err);
                } else {
                    console.log("Item deleted successfully.");
                    loadTableData(); // Reload table data after deletion
                }
            });
        }
    };

    // ----------------------------------------------------------------

    const tableBody = document.getElementById('tableBody');
    const exchangeRateInput = document.getElementById('editExchangeRate');

    // Function to retrieve exchange rate from the input field
    function getExchangeRate() {
        const exchangeRate = parseFloat(exchangeRateInput.value);
        return isNaN(exchangeRate) ? 1 : exchangeRate; // Default to 1 if NaN
    }

    // Debugging: log the current value of the exchange rate input
    exchangeRateInput.addEventListener('input', function () {
        console.log('Updated Exchange Rate Value:', getExchangeRate());
    });

    tableBody.addEventListener('mouseover', function (event) {
        if (event.target.tagName === 'TD') {
            const columnIndex = event.target.cellIndex;
            const originalValue = parseFloat(event.target.textContent.replace(/[^0-9.]/g, ''));

            // Log column index and original value for debugging
            console.log('Column Index:', columnIndex);
            console.log('Original Value:', originalValue);

            const exchangeRate = getExchangeRate();
            console.log('Current Exchange Rate:', exchangeRate);

            if (!isNaN(originalValue)) {
                let convertedValue = '';

                // Determine which column we are dealing with and calculate accordingly
                switch (columnIndex) {
                    case 12: // Paper Cost column
                        convertedValue = (originalValue / exchangeRate).toFixed(2);
                        event.target.setAttribute('title', `Paper Cost in USD: $${convertedValue}`);
                        break;
                    case 14: // Freight Cost column
                        convertedValue = (originalValue / exchangeRate / 23.5).toFixed(2);
                        event.target.setAttribute('title', `Freight Cost in USD: $${convertedValue}`);
                        break;
                    case 22: // Sheeting Cost column
                        convertedValue = (originalValue * 1000 / exchangeRate).toFixed(2);
                        event.target.setAttribute('title', `Sheeting Cost in USD: $${convertedValue}`);
                        break;
                    case 23: // Wrapper Cost column
                        convertedValue = (originalValue / exchangeRate).toFixed(2);
                        event.target.setAttribute('title', `Wrapper Cost in USD: $${convertedValue}`);
                        break;
                    case 25: // Local Freight Cost column
                        convertedValue = (originalValue / exchangeRate).toFixed(2);
                        event.target.setAttribute('title', `Local Freight in USD: $${convertedValue}`);
                        break;
                    default:
                        event.target.removeAttribute('title');
                        break;
                }
            }
        }
    });

    tableBody.addEventListener('mouseout', function (event) {
        if (event.target.tagName === 'TD') {
            event.target.removeAttribute('title');
        }
    });

    tableBody.addEventListener('mouseover', function (event) {
        if (event.target.tagName === 'TD') {
            const columnIndex = event.target.cellIndex;
            const columnIndexCode = event.target.cellIndex;

            // Assuming these are the correct column indices:
            const QNIndex = 1;  // Quotation No index
            const SPIndex = 2;  // Paper Cost column index
            const GsmIndex = 4;  // GSM column index
            const paperCodeIndex = 6;  // GSM column index
            const paperCostIndex = 12;  // Paper Cost column index
            const freightCostIndex = 14;  // Freight Cost column index
            const pricePerBoxIndex = 20;  // Price Per Box column index
            const sheetingCostIndex = 22;  // Sheeting Cost column index
            const wrapperCostIndex = 23;  // Wrapper Cost column index
            const boxCostIndex = 24;  // Box Cost column index
            const localFreightCostIndex = 25;  // Local Freight Cost column index
            const miscellaneousCostIndex = 26;  // Miscellaneous Cost column index
            const marginCostIndex = 27;  // Margin column index

            if (columnIndex === pricePerBoxIndex) {
                const row = event.target.parentElement;
                const QNOne = parseFloat(row.cells[QNIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const paperCost = parseFloat(row.cells[paperCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const freightCost = parseFloat(row.cells[freightCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const sheetingCost = parseFloat(row.cells[sheetingCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const wrapperCost = parseFloat(row.cells[wrapperCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const boxCost = parseFloat(row.cells[boxCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const localFreightCost = parseFloat(row.cells[localFreightCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const miscellaneousCost = parseFloat(row.cells[miscellaneousCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;
                const marginCost = parseFloat(row.cells[marginCostIndex].textContent.replace(/[^0-9.]/g, '')) || 0;

                // Fetch exchange rate from input field
                const exchangeRate = getExchangeRate();

                const paperCostUSD = (paperCost / exchangeRate).toFixed(2);
                const freightCostUSD = (freightCost / exchangeRate / 23.5).toFixed(2);
                const sheetingCostUSD = (sheetingCost * 1000 / exchangeRate).toFixed(2);
                const wrapperCostUSD = (wrapperCost * 1000 / exchangeRate).toFixed(2);

                const tooltipText = `
                    BreakUp of Total Cost\n
                    Quotation No : ${QNOne}\n
                    Paper Cost (USD): $${paperCostUSD}
                    Paper Cost (INR): ₹${paperCost}\n
                    Freight Cost (USD): $${freightCostUSD}
                    Freight Cost (INR): ₹${freightCost}\n
                    Sheeting Cost / MT (USD): $${sheetingCostUSD}
                    Sheeting Cost / Kg (INR): ₹${sheetingCost}\n
                    Wrapper Cost / MT (USD): $${wrapperCostUSD}
                    Wrapper Cost / Kg (INR): ₹${wrapperCost}\n
                    Box Cost / Box (INR): ₹${boxCost}\n
                    Local Freight (INR): ₹${localFreightCost}\n
                    Miscellaneous (INR): ₹${miscellaneousCost}\n
                    Margin: ₹${marginCost}\n
                `;
                event.target.setAttribute('title', tooltipText.trim());
            }

            if (columnIndexCode === GsmIndex) {
                const row = event.target.parentElement;
                const paperCodeValue = parseFloat(row.cells[paperCodeIndex].textContent.replace(/[^0-9.]/g, '')) || 0;

                const tooltipText = `
                    Paper Code\n
                    Paper Code : ${paperCodeValue}\n
                `;
                event.target.setAttribute('title', tooltipText.trim());
            }
        }
    });

    tableBody.addEventListener('mouseout', function (event) {
        if (event.target.tagName === 'TD') {
            event.target.removeAttribute('title');
        }
    });

    // Load table data initially
    loadTableData();
    loadColumnVisibilitySettings();
});



document.addEventListener('DOMContentLoaded', function () {
    const editExchangeRate = document.getElementById('editExchangeRate');
    const editPaperCost = document.getElementById('editPaperCost');
    const editFreightCost = document.getElementById('editFreightCost');
    const editReamPerCarton = document.getElementById('editReamPerCarton');
    const editWeightOfReam = document.getElementById('editReamWeight');
    const editSheettingPrice = document.getElementById('editEditMastersheettingPrice');
    const editWrapperPrice = document.getElementById('editEditMasterwrapperPrice');
    const editBoxPrice = document.getElementById('editEditMasterboxPrice');
    const editMarginPrice = document.getElementById('editEditMastermarginPrice');
    const editLocalFreight = document.getElementById('editEditMasterLocalFreight');
    const editMiscellaneous = document.getElementById('editEditMasterMiscellaneous');

    // Example calculation formula
    function EditcalculateResults() {
        const exRate = parseFloat(editExchangeRate.value) || 0;
        const paperCost = parseFloat(editPaperCost.value) || 0;
        const freightCost = parseFloat(editFreightCost.value) || 0;
        const EditRpc = parseFloat(editReamPerCarton.value) || 0;
        const EditRw = parseFloat(editWeightOfReam.value) || 0;

        console.log(exRate);
        console.log(freightCost);

        const weightOfCartonEdit = EditRw * EditRpc;
        const onOfwrapperPerTonEdit = 1000 / EditRw;
        const onOfCartonPerTonEdit = 1000 / weightOfCartonEdit;

        const sheetingPrice = (parseFloat(editSheettingPrice.value) * 1000) / exRate || 0;
        const wrapperPrice = (parseFloat(editWrapperPrice.value) * onOfwrapperPerTonEdit) / exRate || 0;
        const boxPrice = (parseFloat(editBoxPrice.value) * onOfCartonPerTonEdit) / exRate || 0;
        const marginPrice = parseFloat(editMarginPrice.value) || 0;
        const localFreight = parseFloat(editLocalFreight.value) / exRate || 0;
        const miscellaneous = parseFloat(editMiscellaneous.value) || 0;

        // Get currency values
        const editPaperCurrency = document.getElementById('editpaperCostCurrency').value;
        const editFreightCurrency = document.getElementById('editfreightCostCurrency').value;

        // Convert paper cost and freight cost to USD if they are in INR
        const editPaperCostInUSD = editPaperCurrency === 'INR' ? paperCost / exRate : paperCost;
        const editFreightCostInUSD = editFreightCurrency === 'INR' ? freightCost / exRate / 23.5 : freightCost;

        // console.log(editPaperCostInUSD);
        // console.log(editFreightCostInUSD);


        // Calculate the result based on your formula
        const totalCost = editPaperCostInUSD + editFreightCostInUSD + sheetingPrice + wrapperPrice + boxPrice + localFreight + miscellaneous;
        const pricePerMtEdit = totalCost + marginPrice;
        const pricePerBoxEdit = pricePerMtEdit / onOfCartonPerTonEdit;

        console.log(editPaperCostInUSD);
        console.log(editFreightCostInUSD);
        console.log(sheetingPrice);
        console.log(wrapperPrice);
        console.log(boxPrice);
        console.log(marginPrice);
        console.log(localFreight);
        console.log(miscellaneous);


        // Update the results in the DOM
        document.getElementById('editTotalCost').innerText = totalCost.toFixed(2) + ' $ USD';
        // Add more calculations and updates as needed
        document.getElementById('editPricePerMT').innerText = pricePerMtEdit.toFixed(2) + ' $ USD';
        document.getElementById('editPricePerBox').innerText = pricePerBoxEdit.toFixed(2) + ' $ USD';
    }

    // Add event listeners to trigger the calculation when any input changes
    [editExchangeRate, editPaperCost, editFreightCost, editReamPerCarton, editWeightOfReam, editSheettingPrice, editWrapperPrice, editBoxPrice, editMarginPrice, editLocalFreight, editMiscellaneous].forEach(input => {
        input.addEventListener('input', EditcalculateResults);
    });

    // Initial calculation
    EditcalculateResults();

});

function updatePriceBasedOnSelections() {
    // Get the selected values
    const selectedGSM = document.getElementById('editGsmSelect').value;
    const selectedPaperCode = document.getElementById('editPaperMillSelect').value;
    const selectedPaperMill = document.getElementById('editPapercodeSelect').value;
    const selectedPaperMillBhal = document.getElementById('editPaperMillBhal').value;

    // Check if a valid PaperMill is selected when PaperCode is 880
    if (selectedPaperCode === '880' && selectedPaperMill === 'select') {
        alert('Please select a valid PaperMill.');
        return;
    }

    // Construct the key to query DynamoDB
    const params = {
        TableName: 'masterDataExportCal',
        Key: {
            "GSM_PaperMill_PaperCode": "184536088030005000",
            "Date": "03-09-2024" // Use the date format as per your table schema
        }
    };

    // Query DynamoDB
    dynamodb.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // Log the full response to inspect its structure
            // console.log('Data retrieved:', JSON.stringify(data, null, 2));

            const item = data.Item;
            const costSheet = item && item.CostSheets;
            let paperCostKey = '';

            if (costSheet) {
                if (selectedPaperCode === '360') {
                    // If 360 is selected, use paperCost360
                    paperCostKey = `PaperCostSheets360`;
                } else if (selectedPaperCode === '880') {
                    // If 880 is selected, map to PaperMill and PaperMillBhal
                    if (selectedPaperMillBhal === 'bahl') {
                        // If Bahl is selected, append 30 or 50 to PaperMill
                        if (selectedPaperMill === '3000') {
                            paperCostKey = 'PaperCostSheets880300030';
                        } else if (selectedPaperMill === '5000') {
                            paperCostKey = 'PaperCostSheets880300050';
                        }
                    } else {
                        // If Other is selected, use regular mapping
                        if (selectedPaperMill === '3000') {
                            paperCostKey = 'PaperCostSheets8803000';
                        } else if (selectedPaperMill === '5000') {
                            paperCostKey = 'PaperCostSheets8805000';
                        }
                    }
                }

                // Now check if the correct key exists in the data
                if (paperCostKey && costSheet[paperCostKey] && costSheet[paperCostKey][`${selectedGSM}GSM`]) {
                    const paperCostData = costSheet[paperCostKey][`${selectedGSM}GSM`];

                    console.log(paperCostData);


                    // Populate the input fields with the retrieved data
                    document.getElementById('editPaperCost').value = paperCostData.Cost || '';
                    document.getElementById('editpaperCostCurrency').value = paperCostData.Currency || 'INR'; // Default to INR if no currency is found
                } else {
                    // Clear the fields if no data is found
                    document.getElementById('editPaperCost').value = '';
                    document.getElementById('editpaperCostCurrency').value = 'INR'; // Default to INR
                }
            }
        }
    });
}

// Add event listeners to update price based on any change in selections
document.getElementById('editGsmSelect').addEventListener('change', updatePriceBasedOnSelections);
document.getElementById('editPaperMillSelect').addEventListener('change', updatePriceBasedOnSelections);
document.getElementById('editPapercodeSelect').addEventListener('change', updatePriceBasedOnSelections);
document.getElementById('editPaperMillBhal').addEventListener('change', updatePriceBasedOnSelections);

document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('savedDataTable');
    const headers = table.querySelectorAll('thead input[type="text"]');
    const tbody = document.getElementById('tableBody');

    function applyFilters() {
        const rows = tbody.getElementsByTagName('tr');

        for (let row of rows) {
            let isVisible = true;

            headers.forEach((header, i) => {
                const filter = header.value.toLowerCase();
                const cell = row.getElementsByTagName('td')[i];

                if (cell) {
                    const textValue = cell.textContent || cell.innerText;
                    if (filter && textValue.toLowerCase().indexOf(filter) === -1) {
                        isVisible = false;
                    }
                }
            });

            row.style.display = isVisible ? '' : 'none';
        }
    }

    headers.forEach(header => {
        header.addEventListener('input', applyFilters);
    });
});

// --------------------------------------------------------------------------------------------













