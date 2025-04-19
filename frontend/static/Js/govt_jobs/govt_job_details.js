// const pathParts = window.location.pathname.split('/');
// const jobId = pathParts[pathParts.length - 2];  // Assuming the URL ends with a slash
// const token = localStorage.getItem('access_token');
// const apiUrl = `/api/govt-jobs/${jobId}/`;

// fetch(apiUrl, {
//     headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//     }
// })
// .then(response => response.json())
// .then(data => {
//     document.getElementById("job-title").textContent = data.title;
//     document.getElementById("job-organization").textContent = `Organization: ${data.organization?.name || 'N/A'}`;
//     document.getElementById("job-department").textContent = `Department: ${data.department?.name || 'N/A'}`;
//     document.getElementById("job-position").textContent = `Position: ${data.position?.title || 'N/A'}`;
//     document.getElementById("job-location").textContent = `Location: ${data.location || 'N/A'}`;
//     document.getElementById("job-description").textContent = data.description || 'No description provided.';
//     document.getElementById("job-deadline").textContent = data.deadline || 'N/A';
//     document.getElementById("job-posted").textContent = new Date(data.posted_on).toLocaleString();

//     const link = document.getElementById("job-link");
//     if (data.official_link) {
//         link.href = data.official_link;
//         link.style.display = '';
//     } else {
//         link.style.display = 'none';
//     }

//     const pdf = document.getElementById("job-pdf");
//     if (data.pdf) {
//         pdf.href = data.pdf;
//         pdf.style.display = '';
//     } else {
//         pdf.style.display = 'none';
//     }
// })
// .catch(error => {
//     console.error("Error fetching job details:", error);
//     document.getElementById("job-detail").innerHTML = `
//         <div class="alert alert-danger">
//             Failed to load job details. Please try again later.
//         </div>`;
// });




const pathParts = window.location.pathname.split('/');
const jobId = pathParts[pathParts.length - 2];  // Assuming the URL ends with a slash
const token = localStorage.getItem('access_token');
const apiUrl = `/api/govt-jobs/${jobId}/`;

fetch(apiUrl, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    // Display job details
    document.getElementById("job-title").textContent = data.title;
    document.getElementById("job-organization").textContent = `Organization: ${data.organization?.name || 'N/A'}`;
    document.getElementById("job-department").textContent = `Department: ${data.department?.name || 'N/A'}`;
    document.getElementById("job-position").textContent = `Position: ${data.position?.title || 'N/A'}`;
    document.getElementById("job-location").textContent = `Location: ${data.location || 'N/A'}`;
    document.getElementById("job-description").textContent = data.description || 'No description provided.';
    document.getElementById("job-deadline").textContent = data.deadline || 'N/A';
    document.getElementById("job-posted").textContent = new Date(data.posted_on).toLocaleString();

    const link = document.getElementById("job-link");
    if (data.official_link) {
        link.href = data.official_link;
        link.style.display = '';
    } else {
        link.style.display = 'none';
    }

    const pdf = document.getElementById("job-pdf");
    if (data.pdf) {
        pdf.href = data.pdf;
        pdf.style.display = '';
    } else {
        pdf.style.display = 'none';
    }

    // Check for previous exams for position, department, or organization
    checkPastExams(data.position?.id, data.department?.id, data.organization?.id);

})
.catch(error => {
    console.error("Error fetching job details:", error);
    document.getElementById("job-detail").innerHTML = `
        <div class="alert alert-danger">
            Failed to load job details. Please try again later.
        </div>`;
});

// Function to check past exams for position, department, or organization
// Function to check past exams for position, department, or organization
function checkPastExams(positionId, departmentId, organizationId) {
    const token = localStorage.getItem('access_token');
    
    // Start with the base URL
    let examApiUrl = '/quiz/past-exams-check/?';

    // Dynamically add query parameters only if they are available
    if (positionId) {
        examApiUrl += `position_id=${positionId}&`;
    }
    if (departmentId) {
        examApiUrl += `department_id=${departmentId}&`;
    }
    if (organizationId) {
        examApiUrl += `organization_id=${organizationId}&`;
    }

    // Remove trailing '&' if it exists
    examApiUrl = examApiUrl.endsWith('&') ? examApiUrl.slice(0, -1) : examApiUrl;

    fetch(examApiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(exams => {
        if (exams.length > 0) {
            // Show a message with links to practice exams in card layout
            let examLinksHtml = '<h4 class="text-xl font-bold mb-4">Recommended Practice Exams:</h4><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">';
    
            exams.forEach(exam => {
                examLinksHtml += `
                    <div class="card bg-white shadow-lg rounded-lg p-4 border border-gray-200">
                        <h5 class="text-lg font-semibold mb-2">${exam.title}</h5>
                        <p class="text-sm text-gray-500 mb-3">Organization: ${exam.organization?.name || 'N/A'}</p>
                        <p class="text-sm text-gray-500 mb-3">Position: ${exam.position?.title || 'N/A'}</p>
                        <p class="text-sm text-gray-500 mb-3">Exam Date: ${new Date(exam.exam_date).toLocaleDateString()}</p>
                        <a href="/quiz/past_exam_details/${exam.id}" class="btn btn-outline-primary btn-sm mt-2 text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded-md text-center">Practice Exam</a>
                    </div>
                `;
            });
    
            examLinksHtml += '</div>';
    
            document.getElementById('message').innerHTML = examLinksHtml;
        } else {
            document.getElementById('message').innerHTML = '<div class="alert alert-info">No past exams found for this position, department, or organization. Try again later.</div>';
        }
    })
    
    .catch(error => {
        console.error("Error fetching past exams:", error);
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Failed to load past exams. Please try again later.</div>';
    });
}

