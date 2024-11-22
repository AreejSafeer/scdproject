const express = require('express');
const sql = require('mssql/msnodesqlv8');
const path = require('path');
const UserFactory = require('./UserFactory'); // Import UserFactory
const db = require('./db'); // Import the singleton database instance
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files, including index.html in the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Set the default route to load sign_in.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'sign_in.html'));
});

// Connect to the database using Singleton Pattern
db.getConnection().then(connection => {
    if (connection) {
        console.log("Database connection established through Singleton.");
    }
}).catch(err => {
    console.log("Error in establishing database connection through Singleton:", err);
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const request = new sql.Request();

    // Use parameterized queries to prevent SQL injection
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);

    request.query('SELECT * FROM Users WHERE Username = @username AND Password = @password', function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send('Server error');
            return;
        }

        if (result.recordset.length > 0) {
            res.send('success');
        } else {
            res.send('Incorrect username or password.');
        }
    });
});

// Sign-up route
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).send('Email must end with @gmail.com.');
    }
    if (!/^[a-zA-Z]+$/.test(username)) {
        return res.status(400).send('Username must only contain alphabets.');
    }
    if (password.length < 5) {
        return res.status(400).send('Password must be at least 5 characters long.');
    }

    const request = new sql.Request();

    // Parameterized queries to prevent SQL injection
    request.input('username', sql.VarChar, username);
    request.input('email', sql.VarChar, email);
    request.input('password', sql.VarChar, password);

    request.query(`INSERT INTO Users (Username, Email, Password) VALUES (@username, @email, @password)`, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500).send('Server error');
            return;
        }
        res.send('Account created successfully! You can now login.');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
