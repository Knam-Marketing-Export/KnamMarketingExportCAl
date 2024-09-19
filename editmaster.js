
AWS.config.update({
    region: 'ap-south-1',  // Example: 'us-east-1'
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'ap-south-1:ba6c8d5d-3899-4553-a79e-8c4117eb3542'  // Cognito Identity Pool ID
    })
  });
// Create DynamoDB service object
const docClient = new AWS.DynamoDB.DocumentClient();

function updatePriceBasedOnSelections() {
    // Get the selected values
    const selectedGSM = document.getElementById('gsmSelect').value;
    const selectedPaperCode = document.getElementById('paperMill').value;
    const selectedPaperMill = document.getElementById('paperCode').value;
    const selectedPaperMillBhal = document.getElementById('PaperMillBhal').value;

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
    docClient.get(params, (err, data) => {
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
                    document.getElementById('paperCostEditMaster').value = paperCostData.Cost || '';
                    document.getElementById('paperCostCurrencyEditMaster').value = paperCostData.Currency || 'INR'; // Default to INR if no currency is found
                } else {
                    // Clear the fields if no data is found
                    document.getElementById('paperCostEditMaster').value = '';
                    document.getElementById('paperCostCurrencyEditMaster').value = 'INR'; // Default to INR
                }
            }
        }
    });
}

// Add event listeners to update price based on any change in selections
document.getElementById('gsmSelect').addEventListener('change', updatePriceBasedOnSelections);
document.getElementById('paperMill').addEventListener('change', updatePriceBasedOnSelections);
document.getElementById('paperCode').addEventListener('change', updatePriceBasedOnSelections);
document.getElementById('PaperMillBhal').addEventListener('change', updatePriceBasedOnSelections);


function updateFreightBasedOnPort() {
    // Get the selected port value (you will need a dropdown or input for this)
    const selectedPort = document.getElementById('freightSelection').value;

    // Construct the key to query DynamoDB (based on your table structure)
    // Construct the key to query DynamoDB
    const params = {
        TableName: 'masterDataExportCal',
        Key: {
            "GSM_PaperMill_PaperCode": "184536088030005000",
            "Date": "03-09-2024" // Use the date format as per your table schema
        }
    };
    // Query DynamoDB
    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log('Data retrieved:', JSON.stringify(data, null, 2));

            const item = data.Item;
            const freightCosts = item && item.CostSheets && item.CostSheets.FreightCosts;

            if (freightCosts && freightCosts[selectedPort]) {
                const freightData = freightCosts[selectedPort];

                console.log(freightData);


                // Populate the freight cost and currency fields
                document.getElementById('selectFreightEditMaster').value = freightData.Freight || '';
                document.getElementById('selectFreightCurrencyEditMaster').value = freightData.Currency || 'INR'; // Default to INR if no currency is found
            } else {
                // Clear the fields if no data is found
                document.getElementById('selectFreightEditMaster').value = '';
                document.getElementById('selectFreightCurrencyEditMaster').value = 'INR'; // Default to INR
            }
        }
    });
}

// Add event listener to update freight based on port selection
document.getElementById('freightSelection').addEventListener('change', updateFreightBasedOnPort);


function updateAdditionalCosts() {
    // Construct the key to query DynamoDB
    const params = {
        TableName: 'masterDataExportCal',
        Key: {
            "GSM_PaperMill_PaperCode": "184536088030005000",
            "Date": "03-09-2024" // Use the date format as per your table schema
        }
    };

    // Query DynamoDB
    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log('Data retrieved:', JSON.stringify(data, null, 2));

            const item = data.Item;

            const paperMillBahl = document.getElementById('PaperMillBhal').value;

            // Update each of the following fields with the corresponding values from JSON
            if (item) {

                // Update each of the following fields with the corresponding values from JSON
                // If "Bahl" is selected, set Sheeting Cost and Local Freight to zero
                if (paperMillBahl === 'bahl') {
                    document.getElementById('sheettingPriceEditMaster').value = 0;
                    document.getElementById('localFreightEditMaster').value = 0;
                } else {
                    // Otherwise, populate with the values from JSON
                    document.getElementById('sheettingPriceEditMaster').value = item.SheetingCost || '';
                    document.getElementById('localFreightEditMaster').value = item.LocalFreight || '';
                }

                // Update Exchange Rate
                document.getElementById('exchangeRateeditmaster').value = item.ExchangeRate || '';

                // Update Sheeting Cost
                // document.getElementById('sheettingPriceEditMaster').value = item.SheetingCost || '';

                // Update Box Price
                document.getElementById('boxPriceEditMaster').value = item.BoxPrice || '';

                // Update Wrapper Cost
                document.getElementById('wrapperPriceEditMaster').value = item.WrapperCost || '';

                // Update Local Freight
                // document.getElementById('localFreightEditMaster').value = item.LocalFreight || '';

                // Update Miscellaneous
                document.getElementById('miscellaneousEditMaster').value = item.Miscellaneous || '';

                // Update Margin
                document.getElementById('marginEditMaster').value = item.Margin || '';
            }
        }
    });
}

// Add an event listener to the PaperMillBhal select element to detect changes
document.getElementById('PaperMillBhal').addEventListener('change', function () {
    updateAdditionalCosts();
});

// Call this function to fetch and update all the additional costs
updateAdditionalCosts();
