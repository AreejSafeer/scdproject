// Observer class to show notification when user logs in
class NotificationObserver {
    update(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.innerText = message;

        // Add notification to the page
        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Subject class to handle login notifications
class LoginNotifier {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(message) {
        this.observers.forEach(observer => observer.update(message));
    }
}

// Global instance of the LoginNotifier
const loginNotifier = new LoginNotifier();

// Create a notification observer instance
const notificationObserver = new NotificationObserver();

// Add the notification observer to the login notifier
loginNotifier.addObserver(notificationObserver);

// Updated sign-in function to use observer pattern
function signIn(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.text())
        .then((data) => {
            if (data === 'success') {
                // Save notification message in local storage
                localStorage.setItem('notification', 'You have logged into your account!');
                // Redirect to homepage
                window.location.href = '/index.html';
            } else {
                document.getElementById('message').innerText = data;
                document.getElementById('message').style.color = 'red';
            }
        })
        .catch((error) => console.error('Error:', error));
}

// Listen for when the DOM is loaded on the homepage
window.addEventListener('DOMContentLoaded', () => {
    const message = localStorage.getItem('notification');
    if (message) {
        // Display the notification
        loginNotifier.notifyObservers(message);
        // Clear the notification from local storage
        localStorage.removeItem('notification');
    }
});


// Sign-up function
function signUp(event) {
    event.preventDefault(); // Prevent form submission

    // Retrieve user inputs
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Post data to the server
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    })
        .then((response) => response.text())
        .then((data) => {
            const messageElement = document.getElementById('message');
            if (data === 'Account made successfully! You can now login.') {
                // If success, show the success message in green
                messageElement.innerText = data;
                messageElement.style.color = 'green';
                // Optional: Reset form inputs
                document.getElementById('signupForm').reset();
            } else {
                // Handle any error message from the server
                messageElement.innerText = data;
                messageElement.style.color = 'red';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            const messageElement = document.getElementById('message');
            messageElement.innerText = 'Server error. Please try again later.';
            messageElement.style.color = 'red';
        });
}


document.addEventListener('DOMContentLoaded', function () {
    // Handle the doctor form
    const doctorForm = document.getElementById('doctorForm');
    if (doctorForm) {
        doctorForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission

            // Collect form data
            const data = {
                username: document.getElementById('username').value,
                hospital_name: document.getElementById('hospital_name').value,
                cnic: document.getElementById('cnic').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('/addDoctor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.text();
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = result;
                messageDiv.style.color = response.ok ? 'green' : 'red';

                if (response.ok) {
                    doctorForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = 'Error adding doctor. Please try again later.';
                messageDiv.style.color = 'red';
            }
        });
    }

    // Handle the patient form
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission

            // Collect form data
            const data = {
                full_name: document.getElementById('full-name').value,
                hospital_name: document.getElementById('hospital-name').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('/addPatient', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.text();
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = result;
                messageDiv.style.color = response.ok ? 'green' : 'red';

                if (response.ok) {
                    patientForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = 'Error adding patient. Please try again later.';
                messageDiv.style.color = 'red';
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('report-form');
    const submitButton = document.querySelector('.submit-button');

    // Form submission event
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const patientId = document.getElementById('patient_id').value;
        const fullName = document.getElementById('full_name').value;
        const hospitalName = document.getElementById('hospital_name').value;
        const reportFile = document.getElementById('report_file').files[0];

        // Validate form fields
        if (!patientId || !fullName || !hospitalName || !reportFile) {
            alert('All fields are required!');
            return;
        }

        // Validate file size (e.g., limit to 5 MB)
        const maxFileSize = 5 * 1024 * 1024; // 5 MB
        if (reportFile.size > maxFileSize) {
            alert('File size exceeds 5 MB!');
            return;
        }

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('patient_id', patientId);
        formData.append('full_name', fullName);
        formData.append('hospital_name', hospitalName);
        formData.append('report_file', reportFile);

        // Disable submit button to prevent duplicate submissions
        submitButton.disabled = true;

        try {
            // Submit form data to the backend
            const response = await fetch('/addReport', {
                method: 'POST',
                body: formData,
            });

            const result = await response.text();

            // Handle response
            if (response.ok) {
                alert('Report added successfully!');
                form.reset(); // Reset the form
            } else {
                alert(`Error: ${result}`);
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
            alert('An error occurred while adding the report. Please try again.');
        } finally {
            submitButton.disabled = false; // Re-enable the submit button
        }
    });
});
// script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.sign-in-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form from submitting normally

        // Get form values
        const patientId = document.getElementById('patient-id').value;
        const fullName = document.getElementById('full-name').value;
        const hospitalName = document.getElementById('hospital-name').value;
        const dob = document.getElementById('dob').value;
        const password = document.getElementById('password').value;

        // Simple client-side validation
        if (!patientId || !fullName || !hospitalName || !dob || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // Send the form data to the server
        try {
            const response = await fetch('/patient-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    patient_id: patientId,
                    full_name: fullName,
                    hospital_name: hospitalName,
                    dob: dob,
                    password: password
                })
            });

            // Handle response
            if (response.ok) {
                window.location.href = '/patientReport/' + patientId; // Redirect to report page
            } else {
                alert('Invalid credentials.');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('An error occurred. Please try again later.');
        }
    });
});
