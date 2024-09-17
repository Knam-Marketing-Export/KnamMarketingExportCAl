
AWS.config.update({
    region: 'ap-south-1',  // Example: 'us-east-1'
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-south-1:ba6c8d5d-3899-4553-a79e-8c4117eb3542'  // Cognito Identity Pool ID
    })
});



const dynamoDB = new AWS.DynamoDB();

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Fetch credentials from DynamoDB
    const params = {
        TableName: "UserCredentials", // Replace with your DynamoDB table name
        Key: {
            'UserID': { S: 'KnamUserID' }, // Ensure this matches the key schema
            'UserDate': { S: '13-09-2024' } // Replace with the actual UserDate if dynamic
        }
    };
    dynamoDB.getItem(params, function (err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // Check if Item exists
            if (!data.Item) {
                console.error("No item found with the provided key.");
                document.getElementById('error-message').style.display = 'block';
                return;
            }

            const credentials = data.Item.Credentials.M;
            let userFound = false;
            let userRole = '';

            // Loop through the credentials to find a match
            for (const role in credentials) {
                const user = credentials[role].M;
                if (user.Username.S === email && user.Password.S === password) {
                    userFound = true;
                    userRole = role;
                    break;
                }
            }

            if (userFound) {
                // Store user role in local storage
                               localStorage.setItem('user', JSON.stringify({
                    email, 
                    role: userRole,
                    isAdmin: userRole === 'Admin',   // 'Admin' has admin privileges
                    isHarish: userRole === 'Harish'  // 'Harish' has a separate flag
                }));
                
                // Redirect based on role
                switch (userRole) {
                    case 'Admin':
                        window.location.href = 'Knam-Export-cost-calculator.html';
                        break;
                    case 'Harish':
                        window.location.href = 'Knam-Export-cost-calculator.html';
                        break;
                    case 'Mansi':
                        window.location.href = 'saveDataPage.html';
                        break;
                    default:
                        window.location.href = 'index.html'; // Default redirection
                }
            } else {
                document.getElementById('error-message').style.display = 'block';
            }
        }
    });
});

