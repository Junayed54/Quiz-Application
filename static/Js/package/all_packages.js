document.addEventListener("DOMContentLoaded", function() {
    const packagesTable = document.getElementById('packagesTable');

    // Fetch access token
    const accessToken = localStorage.getItem('access_token'); // Replace with actual token retrieval

    // Function to fetch all packages and display in the table
    function fetchPackages() {
        fetch('/packages/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            packagesTable.innerHTML = ''; // Clear the table
            data.forEach(pkg => {
                const row = `
                    <tr>
                        <td>${pkg.name}</td>
                        <td>${pkg.price}</td>
                        <td>${pkg.duration_in_days}</td>
                        <td>${pkg.max_exams}</td>
                        <td>
                            Very Easy: ${pkg.very_easy_percentage}%, Easy: ${pkg.easy_percentage}%, 
                            Medium: ${pkg.medium_percentage}%, Hard: ${pkg.hard_percentage}%, 
                            Very Hard: ${pkg.very_hard_percentage}%, Expert: ${pkg.expert_percentage}%
                        </td>
                        <td><button class="btn btn-danger">Delete</button></td>
                    </tr>
                `;
                packagesTable.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching packages:', error));
    }

    // Fetch packages on page load
    fetchPackages();
});