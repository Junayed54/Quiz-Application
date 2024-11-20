document.addEventListener("DOMContentLoaded", function() {
    const packagesContainer = document.getElementById('packagesContainer');

    // Fetch access token
    const accessToken = localStorage.getItem('access_token'); // Replace with actual token retrieval

    // Function to capitalize the first letter of each word
    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Function to fetch all packages and display in the card layout
    function fetchPackages() {
        fetch('/packages/', {  // Use the appropriate API URL for your package list
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            packagesContainer.innerHTML = ''; // Clear the container
            data.forEach(pkg => {
                const capitalizedName = capitalizeWords(pkg.name); // Capitalize the package name
                const card = `
                    <div class="col-md-4 mb-4">
                        <div class="card border-primary">
                            <div class="card-body">
                                <h2 class="card-title text-center">${capitalizedName}</h2>
                                <p class="card-text"><strong>Price:</strong> $${pkg.price}</p>
                                <p class="card-text"><strong>Duration:</strong> ${pkg.duration_in_days} days</p>
                                <p class="card-text"><strong>Max Exams:</strong> ${pkg.max_exams}</p>
                                <p class="card-text"><strong>Difficulty Distribution:</strong></p>
                                <ul>
                                    <li>Very Easy: ${pkg.very_easy_percentage}%</li>
                                    <li>Easy: ${pkg.easy_percentage}%</li>
                                    <li>Medium: ${pkg.medium_percentage}%</li>
                                    <li>Hard: ${pkg.hard_percentage}%</li>
                                    <li>Very Hard: ${pkg.very_hard_percentage}%</li>
                                    <li>Expert: ${pkg.expert_percentage}%</li>
                                </ul>
                                <div class="d-flex justify-content-between">
                                    <button class="btn btn-primary" onclick="buyPackage(${pkg.id})">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                packagesContainer.innerHTML += card;
            });
        })
        .catch(error => console.error('Error fetching packages:', error));
    }

    // Function to handle buying a package
    window.buyPackage = function(packageId) {
        fetch('/buy-package/', {  // Assuming this is the API endpoint for purchasing
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ package_id: packageId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                fetchPackages(); // Refresh the package list after purchase
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Error buying package:', error);
            alert('There was an error with your purchase.');
        });
    };

    // Optional: Function to handle package deletion
    window.deletePackage = function(id) {
        if (confirm('Are you sure you want to delete this package?')) {
            fetch(`/packages/${id}/`, {  // Adjust the endpoint for package deletion
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('Package deleted successfully.');
                    fetchPackages(); // Refresh the package list after deletion
                } else {
                    console.error('Error deleting package:', response.statusText);
                }
            })
            .catch(error => console.error('Error deleting package:', error));
        }
    };

    // Fetch packages on page load
    fetchPackages();
});
