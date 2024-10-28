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
            // Redirect to index.html if login is successful
            window.location.href = '/index.html';
        } else {
            // Show error message if login fails
            document.getElementById('message').innerText = data;
            document.getElementById('message').style.color = 'red';
        }
    })
    .catch(error => console.error('Error:', error));
}



