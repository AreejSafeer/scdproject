const express = require('express');
const sql = require('mssql/msnodesqlv8');
const path = require('path');
const multer = require('multer');
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Folder to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filenames
    }
});
const upload = multer({ storage: storage });

// Add Report Route
app.post('/addReport', upload.single('report_file'), async (req, res) => {
    console.log('Request received:', req.body, req.file);
    const { patient_id, full_name, hospital_name } = req.body;
    const report_name = req.file.originalname;
    const file_path = path.join('uploads', req.file.filename);

    // Validate inputs
    if (!patient_id || !full_name || !hospital_name || !req.file) {
        return res.status(400).send('All fields are required, including the report file.');
    }

    try {
        const request = new sql.Request();
        request.input('patient_id', sql.Int, patient_id);
        request.input('full_name', sql.NVarChar, full_name);
        request.input('hospital_name', sql.NVarChar, hospital_name);
        request.input('report_name', sql.NVarChar, report_name);
        request.input('file_path', sql.NVarChar, file_path);

        // Insert the report into the database
        await request.query(`
            INSERT INTO reports (patient_id, full_name, hospital_name, report_name, file_path)
            VALUES (@patient_id, @full_name, @hospital_name, @report_name, @file_path)
        `);

        res.send('Report added successfully!');
    } catch (err) {
        console.error('Error adding report:', err);
        res.status(500).send('Failed to add report. Please try again later.');
    }
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


app.post('/addPatient', async (req, res) => {
    console.log('Request body:', req.body);  // Add this line to log the request body
    const { full_name, hospital_name, password } = req.body;
    
    // Validate inputs
    if (!full_name || !hospital_name || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const request = new sql.Request();
        request.input('full_name', sql.NVarChar, full_name);
        request.input('hospital_name', sql.NVarChar, hospital_name);
        request.input('password', sql.NVarChar, password);

        const result = await request.query(`
            INSERT INTO patients (full_name, hospital_name, password) 
            VALUES (@full_name, @hospital_name, @password)
        `);

        res.send('Patient added successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding patient');
    }
});

app.post('/addDoctor', async (req, res) => {
    console.log('Request body:', req.body);
    const { username, hospital_name, cnic, password } = req.body;

    // Check if the data is provided
    if (!username || !hospital_name || !cnic || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Create a request object from mssql
        const request = new sql.Request();

        // Use parameterized queries to prevent SQL injection
        request.input('username', sql.VarChar, username);
        request.input('hospital_name', sql.VarChar, hospital_name);
        request.input('cnic', sql.VarChar, cnic);
        request.input('password', sql.VarChar, password);

        // Insert the doctor into the database
        await request.query(`
            INSERT INTO doctor (username, hospital_name, cnic, password)
            VALUES (@username, @hospital_name, @cnic, @password)
        `);

        // Send success message
        res.send('Doctor added successfully!');
    } catch (err) {
        console.error('Error inserting doctor:', err);
        res.status(500).send('Failed to add doctor. Please try again later.');
    }
});
app.post('/patient-portal', async (req, res) => {
    const { patient_id, full_name, hospital_name, password } = req.body;

    try {
        // Validate and authenticate the patient (exclude DOB as it's not in the database)
        const request = new sql.Request();
        request.input('patient_id', sql.Int, patient_id);
        request.input('full_name', sql.NVarChar, full_name);
        request.input('hospital_name', sql.NVarChar, hospital_name);
        request.input('password', sql.NVarChar, password);

        // Check if patient exists and matches the provided data
        const result = await request.query(`
            SELECT * FROM patients WHERE patient_id = @patient_id AND full_name = @full_name AND hospital_name = @hospital_name AND password = @password
        `);

        if (result.recordset.length > 0) {
            // If the patient is authenticated, redirect them to the patient report page
            const patient = result.recordset[0];
            res.redirect(`/patientReport/${patient.patient_id}`);
        } else {
            // If authentication fails, show an error message
            res.status(401).send('Invalid credentials.');
        }
    } catch (err) {
        console.error('Error during patient authentication:', err);
        res.status(500).send('Internal server error.');
    }
});

// Route to handle patient portal sign-in form submission
app.post('/patient-portal', async (req, res) => {
    const { patient_id, full_name, hospital_name, password } = req.body;

    try {
        // Validate and authenticate the patient (exclude DOB as it's not in the database)
        const request = new sql.Request();
        request.input('patient_id', sql.Int, patient_id);
        request.input('full_name', sql.NVarChar, full_name);
        request.input('hospital_name', sql.NVarChar, hospital_name);
        request.input('password', sql.NVarChar, password);

        // Check if patient exists and matches the provided data
        const result = await request.query(`
            SELECT * FROM patients WHERE patient_id = @patient_id AND full_name = @full_name AND hospital_name = @hospital_name AND password = @password
        `);

        if (result.recordset.length > 0) {
            // If the patient is authenticated, redirect them to the patient report page
            const patient = result.recordset[0];
            res.redirect(`/patientReport/${patient.patient_id}`);
        } else {
            // If authentication fails, show an error message
            res.status(401).send('Invalid credentials.');
        }
    } catch (err) {
        console.error('Error during patient authentication:', err);
        res.status(500).send('Internal server error.');
    }
});

// Route to show the patient's report page
app.get('/patientReport/:patient_id', async (req, res) => {
    const patient_id = req.params.patient_id;

    try {
        const request = new sql.Request();
        request.input('patient_id', sql.Int, patient_id);

        // Fetch the patient's report (adjust the query according to your database structure)
        const result = await request.query(`
            SELECT * FROM reports WHERE patient_id = @patient_id
        `);

        if (result.recordset.length > 0) {
            const report = result.recordset[0];
            res.render('patientReport', { report }); // Render the patient's report page
        } else {
            res.status(404).send('Report not found.');
        }
    } catch (err) {
        console.error('Error fetching report:', err);
        res.status(500).send('Failed to fetch report.');
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
