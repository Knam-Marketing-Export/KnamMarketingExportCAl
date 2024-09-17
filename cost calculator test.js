AWS.config.update({
    region: 'ap-south-1',  // Example: 'us-east-1'
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-south-1:ba6c8d5d-3899-4553-a79e-8c4117eb3542'  // Cognito Identity Pool ID
    })
});
const dynamodb = new AWS.DynamoDB.DocumentClient();


// Master password
document.getElementById('master-section-button').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default button behavior

    // Define the correct password
    const correctPassword = '123456'; // Change this to your desired password

    // Prompt the user for a password
    const userPassword = prompt('Please enter the password to access the Master section:');

    // Check if the password is correct
    if (userPassword === correctPassword) {
        // Redirect to master.html if password is correct
        window.location.href = 'master.html';
    } else {
        alert('Incorrect password. Access denied.');
    }
});


document.getElementById('logout-button').addEventListener('click', function () {
    const logoutConfirmation = confirm("Are you sure you want to Logout?");
    if (logoutConfirmation) {
        window.location.href = 'index.html';  // Redirect to login page
    }
});


document.getElementById('noOfSheetInReam').addEventListener('input', function () {
    if (this.value === '') {
        resetField('weightOfReam');
    } else {
        updateValues('noOfSheetInReam');
    }
});

document.getElementById('weightOfReam').addEventListener('input', function () {
    if (this.value === '') {
        resetField('noOfSheetInReam');
    } else {
        updateValues('weightOfReam');
    }
});

function updateValues(changedField) {
    const noOfSheetInReam = parseFloat(document.getElementById('noOfSheetInReam').value);
    const weightOfReam = parseFloat(document.getElementById('weightOfReam').value);
    const gsmOfPaper = parseFloat(document.getElementById('gsmSelect').value);
    const lengthOfPaper = parseFloat(document.getElementById('length').value);
    const widthOfPaper = parseFloat(document.getElementById('width').value);
    const areaOfSheet = (lengthOfPaper * widthOfPaper) / 10000;
    const weightPerSheet = (areaOfSheet * gsmOfPaper) / 1000;

    if (changedField === 'noOfSheetInReam' && !isNaN(noOfSheetInReam)) {
        document.getElementById('weightOfReam').value = (noOfSheetInReam * weightPerSheet).toFixed(3);
    } else if (changedField === 'weightOfReam' && !isNaN(weightOfReam)) {
        document.getElementById('noOfSheetInReam').value = (weightOfReam / weightPerSheet).toFixed(2);
    }


}





function calculateCost() {

    const exchangeRate = parseFloat(document.getElementById('exchangeRateeditmaster').value);
    const selectedGSM = document.getElementById('gsmSelect').value;


    console.log(exchangeRate);


    const reamsPerCarton = parseFloat(document.getElementById('reamsPerCarton').value);
    const weightOfReam = parseFloat(document.getElementById('weightOfReam').value);
    const noOfSheetInReam = parseFloat(document.getElementById('noOfSheetInReam').value);
    const gsmOfPaper = parseFloat(selectedGSM); // Ensure GSM is a number
    const lengthOfPaper = parseFloat(document.getElementById('length').value);
    const widthOfPaper = parseFloat(document.getElementById('width').value);
    const areaOfSheet = (lengthOfPaper * widthOfPaper) / 10000;
    const weightPerSheet = (areaOfSheet * gsmOfPaper) / 1000;

    // Weight of ream
    const weightOfReamCalc = noOfSheetInReam * weightPerSheet;
    document.getElementById('WeightOfReam').innerText = weightOfReamCalc.toFixed(3) + ' Kg';

    // Weight of Carton
    const weightOfCarton = weightOfReam * reamsPerCarton;
    document.getElementById('weightOfCarton').innerText = weightOfCarton.toFixed(2) + ' Kg';

    // No. of Wrappers per Ton
    const wrappersPerTon = 1000 / weightOfReamCalc;
    document.getElementById('wrappersPerTon').innerText = wrappersPerTon.toFixed(2) + ' NOS';

    // No. of Cartons per Ton
    const cartonsPerTon = 1000 / weightOfCarton;
    document.getElementById('cartonsPerTon').innerText = cartonsPerTon.toFixed(2) + ' NOS';



    const paperPrice = parseFloat(document.getElementById('paperCostEditMaster').value);
    const freightCost = parseFloat(document.getElementById('selectFreightEditMaster').value);
    const sheetingCost = parseFloat(document.getElementById('sheettingPriceEditMaster').value) * 1000 / exchangeRate;
    const boxPrice = parseFloat(document.getElementById('boxPriceEditMaster').value) * cartonsPerTon / exchangeRate;
    const wrappersPrice = parseFloat(document.getElementById('wrapperPriceEditMaster').value) * wrappersPerTon / exchangeRate;
    const localFreight = parseFloat(document.getElementById('localFreightEditMaster').value) / exchangeRate;
    const miscellaneous = parseFloat(document.getElementById('miscellaneousEditMaster').value);
    const margin = parseFloat(document.getElementById('marginEditMaster').value);
    const salesPerson = parseFloat(document.getElementById('salesPersonDropdown').value);
    const customer = parseFloat(document.getElementById('customerName').value);

    // console.log(paperPrice); // Check if paperPrice is retrieved correctly
    // console.log(freightCost); // Check if freightCost is retrieved correctly
    // console.log(sheetingCost); // Check if sheetingCost is retrieved correctly
    // console.log(boxPrice); // Check if boxPrice is retrieved correctly
    // console.log(wrappersPrice); // Check if wrappersPrice is retrieved correctly
    // console.log(localFreight); // Check if localFreight is retrieved correctly
    // console.log(miscellaneous); // Check if miscellaneous is retrieved correctly
    // console.log(margin); // Check if margin is retrieved correctly

    // Get currency values
    const paperCurrency = document.getElementById('paperCostCurrencyEditMaster').value;
    const freightCurrency = document.getElementById('selectFreightCurrencyEditMaster').value;

    console.log(paperCurrency);
    console.log(freightCurrency);

    // Convert paper cost and freight cost to USD if they are in INR
    let paperCostInUSD = paperCurrency === 'INR' ? paperPrice / exchangeRate : paperPrice;
    let freightCostInUSD = freightCurrency === 'INR' ? freightCost / exchangeRate / 23.5 : freightCost;

    console.log(paperCostInUSD);
    console.log(freightCostInUSD);


    // Total Cost
    const totalCost = paperCostInUSD + freightCostInUSD + sheetingCost + boxPrice + wrappersPrice + localFreight + miscellaneous;
    document.getElementById('totalCost').innerText = totalCost.toFixed(2) + ' $ USD';

    // Price per MT
    const pricePerMT = totalCost + margin;
    document.getElementById('pricePerMT').innerText = pricePerMT.toFixed(2) + ' $ USD';

    // Price per Box
    const pricePerBox = pricePerMT / cartonsPerTon;
    document.getElementById('pricePerBox').innerText = pricePerBox.toFixed(2) + ' $ USD';

}
document.getElementById('convert-button').addEventListener('click', calculateCost);

// Edit master hide and visible and section
function editMaster() {
    document.getElementById('quoteForm').style.display = 'block';
};

document.getElementById('closeQuoteFormBtn').addEventListener('click', function () {
    document.getElementById('quoteForm').style.display = 'none';
});

// paper mill and paper code section
document.getElementById('paperMill').addEventListener('change', function () {
    const paperCodeDiv = document.querySelector('.Select-paper-code');

    if (this.value === '880') {
        paperCodeDiv.style.display = 'block';
    } else {
        paperCodeDiv.style.display = 'none';
    }
});

const selectFreight1 = document.getElementById('freightSelection');
const selectFreight2 = document.getElementById('selectPortEditMaster');
selectFreight1.addEventListener('change', function () {
    selectFreight2.value = selectFreight1.value;
});

selectFreight2.addEventListener('change', function () {
    selectFreight1.value = selectFreight2.value;
});

const selectprice1 = document.getElementById('gsmSelect');
const selectprice2 = document.getElementById('selectGsmEditMaster');
selectFreight1.addEventListener('change', function () {
    selectprice2.value = selectprice1.value;
});

selectFreight2.addEventListener('change', function () {
    selectprice1.value = selectprice2.value;
});


// Function to validate numeric values
function validateNumber(value) {
    return isNaN(value) ? 0 : parseFloat(value); // Replace NaN with 0, ensure it's a number
}

// Function to validate string values
function validateString(value) {
    return typeof value === 'string' ? value : ''; // Ensure it's a string, return empty string if not
}

// // Generate a unique entry number
// function generateEntryNumber() {
//     return Date.now().toString(); // Use current timestamp as a unique Sort Key
// }


// Function to get the next sequential number from DynamoDB
function getNextSequentialNumber(callback) {
    const params = {
        TableName: 'SequentialNumber', // Your table name
        Key: {
            "LastNumberID": "currentNumber" // Partition key
        }
    };

    // Fetch the current number
    dynamodb.get(params, function (err, data) {
        if (err) {
            console.error("Unable to get the current sequential number.", err);
            callback(null);
        } else {
            let currentNumber = data.Item ? parseInt(data.Item.Number) : 0;

            // Increment the number for the next ID
            currentNumber++;

            // Update the sequential number in DynamoDB
            const updateParams = {
                TableName: 'SequentialNumber',
                Item: {
                    "LastNumberID": "currentNumber", // Partition key
                    "Number": currentNumber.toString() // New sequential number
                }
            };

            dynamodb.put(updateParams, function (err) {
                if (err) {
                    console.error("Unable to update the sequential number.", err);
                    callback(null);
                } else {
                    callback(currentNumber);
                }
            });
        }
    });
}

// Function to generate the sequential quotation ID
function generateQuotationID(callback) {
    const prefix = "QN-";

    getNextSequentialNumber(function (sequentialNumber) {
        if (sequentialNumber !== null) {
            // Zero-padded number (e.g., 01, 02, etc.)
            const paddedNumber = sequentialNumber.toString().padStart(2, '0');

            // Generate final ID in format: QN-01
            const quotationID = `${prefix}${paddedNumber}`;
            console.log("Generated Quotation ID:", quotationID);

            // Pass the generated ID to the callback
            callback(quotationID);
        } else {
            console.error("Failed to generate Quotation ID.");
            callback(null); // Call callback with null to indicate failure
        }
    });
}

// Function to save result to DynamoDB
function saveResultToDynamoDB(result) {
    generateQuotationID(function (newQuotationID) {
        if (newQuotationID === null) {
            alert("Error generating Quotation ID.");
            return;
        }

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const saveDate = `${day}/${month}/${year}`;

        // Confirm if the user wants to save the quotation
        if (confirm("Do you want to save the Quotation?")) {
            const params = {
                TableName: 'CostCalculatorResults', // Replace with your table name
                Item: {
                    ID: newQuotationID,
                    Date: saveDate,
                    ExchangeRate: validateNumber(result.exchangeRate),
                    GSM: validateNumber(result.selectedGSM),
                    PaperMill: validateNumber(result.paperMill),
                    PaperCode: validateNumber(result.paperCode),
                    SheetingPlace: validateString(result.PaperMillBhal),
                    SheetingLength: validateNumber(result.sheetlength),
                    SheetingWidth: validateNumber(result.sheetWidth),
                    NoOfSheet: validateNumber(result.NoOfSheet),
                    NoOfReam: validateNumber(result.NoOfReam),
                    WeightOfReam: validateNumber(result.weightOfReam),
                    WeightOfCarton: validateNumber(result.weightOfCarton),
                    WrappersPerTon: validateNumber(result.wrappersPerTon),
                    CartonsPerTon: validateNumber(result.cartonsPerTon),
                    PaperCost: validateNumber(result.paperPrice),
                    FreightCost: validateNumber(result.freightCost),
                    FreightPort: validateString(result.freightPort),
                    SheetingCost: validateNumber(result.sheetingCost),
                    BoxPrice: validateNumber(result.boxPrice),
                    WrappersPrice: validateNumber(result.wrappersPrice),
                    LocalFreight: validateNumber(result.localFreight),
                    Miscellaneous: validateNumber(result.miscellaneous),
                    TotalCost: validateNumber(result.totalCost),
                    PricePerMT: validateNumber(result.pricePerMT),
                    PricePerBox: validateNumber(result.pricePerBox),
                    Margin: validateNumber(result.margin),
                    SalesPerson: validateString(result.salesPerson),
                    Customer: validateString(result.customer)
                }
            };

            // Save data to DynamoDB
            dynamodb.put(params, function (err, data) {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    alert("Error saving Quotation."); // Alert on error
                } else {
                    console.log("Item added successfully:", JSON.stringify(data, null, 2));
                    alert("Quotation saved successfully."); // Alert on success
                }
            });
        } else {
            alert("Quotation not saved."); // Alert if user cancels
        }
    });
}

// Example usage: Add this function call where needed
document.getElementById('save-button').addEventListener('click', function () {
    const result = {
        exchangeRate: parseFloat(document.getElementById('exchangeRateeditmaster').value),
        selectedGSM: parseFloat(document.getElementById('gsmSelect').value),
        paperMill: parseFloat(document.getElementById('paperMill').value),
        paperCode: parseFloat(document.getElementById('paperCode').value),
        sheetlength: parseFloat(document.getElementById('length').value),
        sheetWidth: parseFloat(document.getElementById('width').value),
        PaperMillBhal: document.getElementById('PaperMillBhal').value.trim(),
        weightOfReam: parseFloat(document.getElementById('weightOfReam').value),
        NoOfSheet: parseFloat(document.getElementById('noOfSheetInReam').value),
        NoOfReam: parseFloat(document.getElementById('reamsPerCarton').value),
        weightOfCarton: parseFloat(document.getElementById('weightOfCarton').innerText),
        wrappersPerTon: parseFloat(document.getElementById('wrappersPerTon').innerText),
        cartonsPerTon: parseFloat(document.getElementById('cartonsPerTon').innerText),
        paperPrice: parseFloat(document.getElementById('paperCostEditMaster').value),
        freightCost: parseFloat(document.getElementById('selectFreightEditMaster').value),
        freightPort: document.getElementById('freightSelection').value.trim(),
        sheetingCost: parseFloat(document.getElementById('sheettingPriceEditMaster').value),
        boxPrice: parseFloat(document.getElementById('boxPriceEditMaster').value),
        wrappersPrice: parseFloat(document.getElementById('wrapperPriceEditMaster').value),
        localFreight: parseFloat(document.getElementById('localFreightEditMaster').value),
        miscellaneous: parseFloat(document.getElementById('miscellaneousEditMaster').value),
        totalCost: parseFloat(document.getElementById('totalCost').innerText),
        pricePerMT: parseFloat(document.getElementById('pricePerMT').innerText),
        pricePerBox: parseFloat(document.getElementById('pricePerBox').innerText),
        margin: parseFloat(document.getElementById('marginEditMaster').value),
        salesPerson: document.getElementById('salesPersonDropdown').value.trim(), // Get as string
        customer: document.getElementById('customerName').value.trim() // Get as string

    };

    saveResultToDynamoDB(result);
});

// Attach event listeners to the dropdowns and button

document.getElementById('costCalculatorForm').addEventListener('reset', function () {
    document.getElementById('WeightOfReam').innerText = '';
    document.getElementById('weightOfCarton').innerText = '';
    document.getElementById('wrappersPerTon').innerText = '';
    document.getElementById('cartonsPerTon').innerText = '';
    document.getElementById('totalCost').innerText = '';
    document.getElementById('pricePerMT').innerText = '';
    document.getElementById('pricePerBox').innerText = '';
    document.getElementById('sheettingPriceEditMaster').value = 0;
    document.getElementById('wrapperPriceEditMaster').value = 0;
    document.getElementById('boxPriceEditMaster').value = 0;
    document.getElementById('marginEditMaster').value = 0;
    document.getElementById('paperCostEditMaster').value = '';
    document.getElementById('paperCostCurrencyEditMaster').value = INR;
});

// ------------------------------------------------------------------------------------------------------------------

// Function to fetch exchange rate from DynamoDB
function fetchExchangeRate(callback) {
    const params = {
        TableName: 'masterDataExportCal',
        Key: {
            "GSM_PaperMill_PaperCode": "184536088030005000",
            "Date": "03-09-2024" // Use the date format as per your table schema
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            console.log("Error fetching exchange rate:", err);
            callback(1);  // Use default value if there is an error
        } else {
            const exchangeRate = data.Item ? parseFloat(data.Item.ExchangeRate) : 1;
            callback(exchangeRate);  // Pass the exchange rate to the callback function
        }
    });
}

// Function to handle conversion based on GSM, paper cost, and currency
function handleConversion() {
    const paperCostInput = document.getElementById('paperCostEditMaster');
    const currencySelect = document.getElementById('editpaperCostCurrency');
    const usdResult = document.getElementById('USDResultEditMaster');
    const inrResult = document.getElementById('INRResultEditMaster');
    const convertButton = document.getElementById('convert-button'); // Button to trigger conversion

    // Fetch the exchange rate and handle conversion
    fetchExchangeRate(function (exchangeRate) {
        // Function to update results based on input values and currency
        function updateResults() {
            const paperCost = parseFloat(paperCostInput.value);
            const currency = currencySelect.value;

            if (!isNaN(paperCost) && paperCost > 0) {
                if (currency === 'INR') {
                    // Convert INR to USD using the exchange rate
                    const usdValue = ' $ ' + (paperCost / exchangeRate).toFixed(3);
                    usdResult.textContent = `USD Value: ${usdValue}`;
                    usdResult.style.display = 'block';  // Show USD value
                    inrResult.style.display = 'none';   // Hide INR value
                } else if (currency === 'USD') {
                    // Show INR value directly
                    const inrValue = ' ₹ ' + (paperCost * exchangeRate).toFixed(3);
                    inrResult.textContent = `INR Value: ${inrValue}`;
                    inrResult.style.display = 'block';  // Show INR value
                    usdResult.style.display = 'none';   // Hide USD value
                }
            } else {
                // Hide the results if inputs are not valid
                usdResult.style.display = 'none';
                inrResult.style.display = 'none';
            }
        }

        // Event listener for the convert button
        convertButton.addEventListener('click', updateResults);
    });
}

// Initialize the conversion function on window load
window.onload = function () {
    handleConversion();
};




