document.addEventListener("DOMContentLoaded", function() {
    const packagesContainer = document.getElementById('packagesContainer');

    // Fetch access token
    const accessToken = localStorage.getItem('access_token'); // Replace with actual token retrieval
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    let update_package_btn = 0;

    fetchPackages();
    if (accessToken) {
        // Fetch the user role
        fetch('/auth/user-role/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.role === 'admin') {
                update_package_btn = 1;
            }
        })
        .catch(error => console.error('Error:', error));
    }

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
                const isPurchased = pkg.is_purchased; // Assuming `is_purchased` is a boolean field indicating if the package is purchased
                const card = `
                    <div class="col-md-4 mb-4 position-relative">
                        ${isPurchased ? '<div class="ribbon">Purchased</div>' : ''}
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
                                <div id="student" class="d-flex justify-content-between">
                                    ${update_package_btn === 1 ? '' : `
                                    <button class="btn btn-light" onclick="buyPackage(${pkg.id})">
                                        <img src="${subscription}" alt="share" style="width: 26px; height: 26px; margin-right: 5px;"> Buy Now
                                    </button>
                                    `}
                                </div>
                                <div id="admin" class="d-flex justify-content-between mt-2">
                                    ${update_package_btn === 1 ? `
                                    <button class="btn btn-light" onclick="updatePackage(${pkg.id})">Update package</button>
                                    ` : ''}
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

    window.updatePackage = function(packageId) {
        window.location.href = `/update_package/${packageId}/`;  // Redirect to update page
    };
});