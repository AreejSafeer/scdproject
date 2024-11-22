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
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'success') {
            window.location.href = '/index.html'; // Redirect to homepage
            // Notify the observer (show notification) when the user logs in
            loginNotifier.notifyObservers('You have logged into your account!');
        } else {
            document.getElementById('message').innerText = data;
            document.getElementById('message').style.color = 'red';
        }
    })
    .catch(error => console.error('Error:', error));
}

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
