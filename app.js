const express = require('express');
const sql = require('mssql/msnodesqlv8');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files, including index.html in the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Set the default route to load sign_in.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign_in.html'));
});

// Database configuration
const config = {
    server: "DESKTOP-SBGDJ25\\SQLEXPRESS",
    database: "medicaltestreports",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
};

// Connect to the database
sql.connect(config, function(err) {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Connected to the database successfully!");
    }
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const request = new sql.Request();
    
    // Query to check if username and password match
    request.query(`SELECT * FROM Users WHERE Username = '${username}' AND Password = '${password}'`, function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send('Server error');
            return;
        }

        if (result.recordset.length > 0) {
            // Send 'success' if login is valid
            res.send('success');
        } else {
            // Send error message if login is invalid
            res.send('Incorrect username or password.');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
