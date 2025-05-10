document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');

    // DOM elements
    const logout = document.getElementById('logout_btn');
    const login = document.getElementById('login_btn');
    const signup = document.getElementById('signup_btn'); // FIXED here
    const user_name = document.getElementById('username');
    const role = document.getElementById('role');

    // Function to fetch and handle user role
    function fetchUserRole() {
        fetch('/auth/user-role/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Unauthorized or invalid token');
                }
                return response.json();
            })
            .then(data => {
                // Role-based visibility logic
                if (data.role !== 'student') {
                    window.location.href = '/home/'; // FIXED here
                }

                // Show/hide buttons based on login
                if (logout) logout.classList.remove('d-none');
                if (login) login.classList.add('d-none');
                if (signup) signup.classList.add('d-none');

                if (user_name) user_name.innerText = data.username;
                if (role) role.innerText = data.role;
            })
            .catch(error => {
                console.error('Error fetching user role:', error);
                // Optionally redirect to login or show error
            });
    }

    // Call only if token exists
    if (accessToken) {
        fetchUserRole();
    }

    // Logout functionality
    if (logout) {
        logout.addEventListener('click', () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/';
        });
    }
});
