document.addEventListener("DOMContentLoaded", function() {
    const packageForm = document.getElementById('packageForm');

    packageForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting

        // Collect form data
        const data = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            duration_in_days: parseInt(document.getElementById('duration').value),
            max_exams: parseInt(document.getElementById('maxExams').value),
            very_easy_percentage: parseInt(document.getElementById('veryEasy').value),
            easy_percentage: parseInt(document.getElementById('easy').value),
            medium_percentage: parseInt(document.getElementById('medium').value),
            hard_percentage: parseInt(document.getElementById('hard').value),
            very_hard_percentage: parseInt(document.getElementById('veryHard').value),
            expert_percentage: parseInt(document.getElementById('expert').value)
        };

        // Validate percentages
        const totalPercentage = data.very_easy_percentage + data.easy_percentage + data.medium_percentage + data.hard_percentage + data.very_hard_percentage + data.expert_percentage;
        if (totalPercentage !== 100) {
            document.getElementById('responseMessage').innerHTML = '<div class="alert alert-danger">Total percentage must equal 100%.</div>';
            return;
        }

        // Access Token (You should obtain this token via your authentication method)
        const accessToken = localStorage.getItem('access_token'); // Replace with actual token retrieval method
        console.log(accessToken);
        // Use fetch() to send the request
        fetch('/packages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // If the response is ok, parse JSON
            }
            return response.json().then(errData => {
                throw new Error(errData.detail || 'Something went wrong!');
            });
        })
        .then(responseData => {
            document.getElementById('responseMessage').innerHTML = '<div class="alert alert-success">Package created successfully!</div>';
            packageForm.reset(); // Reset form
        })
        .catch(error => {
            document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
    });
});
