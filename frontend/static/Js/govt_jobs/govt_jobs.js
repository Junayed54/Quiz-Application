const jobList = document.getElementById('job-list');
const token = localStorage.getItem('access_token');
const apiUrl = '/api/govt-jobs/'; // API endpoint for government jobs

/**
 * Fetches and displays the list of jobs.
 */
async function fetchJobs() {
    // 1. Check for Authentication Token
    if (!token) {
        jobList.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                <h4 class="alert-heading">Login Required</h4>
                <p>You need to be logged in to view job listings.</p>
            </div>
        `;
        return;
    }

    // Show a loading state with Bootstrap spinner
    jobList.innerHTML = `
        <div class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="ms-2 text-muted">Loading jobs...</p>
        </div>
    `;

    // 2. Fetch Jobs from API
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(response.status === 401 ? 'Unauthorized' : 'Server error');
        }

        const jobs = await response.json();

        // 3. Render Jobs
        jobList.innerHTML = ''; // Clear loading state

        if (jobs.length === 0) {
            jobList.innerHTML = '<p class="text-center text-muted p-5">No jobs available right now. Check back soon!</p>';
            return;
        }

        // Use Bootstrap's Grid and Card components for a professional layout
        let jobsHTML = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">';

        jobs.forEach(job => {
            // FIX: Safely access the 'name' property inside the 'department' object
            const departmentName = job.department && typeof job.department === 'object' 
                                   ? job.department.name 
                                   : 'N/A';
            
            jobsHTML += `
                <div class="col" id="job-${job.id}">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-primary mb-3">${job.title}</h5>
                            
                            <ul class="list-unstyled small text-muted mb-4 flex-grow-1">
                                <li>
                                    <i class="bi bi-building me-2 text-info"></i>
                                    <strong>Department:</strong> ${departmentName}
                                </li>
                                <li>
                                    <i class="bi bi-geo-alt-fill me-2 text-danger"></i>
                                    <strong>Location:</strong> ${job.location || 'N/A'}
                                </li>
                                <li>
                                    <i class="bi bi-calendar-x me-2 text-warning"></i>
                                    <strong>Deadline:</strong> ${job.deadline || 'N/A'}
                                </li>
                            </ul>
                            
                            <div class="mb-4">
                                <p class="small mb-2">
                                    <i class="bi bi-link-45deg me-1 text-success"></i>
                                    <strong>Official Link:</strong> 
                                    <a href="${job.official_link}" target="_blank" class="card-link text-decoration-none">Visit Link</a>
                                </p>
                                ${job.pdf ? `
                                    <p class="small mb-0">
                                        <i class="bi bi-file-earmark-pdf-fill me-1 text-danger"></i>
                                        <strong>Official PDF:</strong> 
                                        <a href="${job.pdf}" target="_blank" class="card-link text-decoration-none">Download PDF</a>
                                    </p>` : ''}
                            </div>

                            <div class="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                                <a href="/govt-job-details/${job.id}/" class="btn btn-primary btn-sm flex-grow-1 me-2">
                                    View Details
                                </a>
                                
                                <button onclick="deleteJob(${job.id})" class="btn btn-danger btn-sm">
                                    <i class="bi bi-trash-fill"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        jobsHTML += '</div>'; // End grid container
        jobList.innerHTML = jobsHTML;

    } catch (error) {
        // 4. Handle Errors
        const errorMessage = (error.message === 'Unauthorized')
                            ? 'Your session has expired. Please log in again.'
                            : 'Failed to load jobs. Please check the API status.';

        jobList.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>${errorMessage}</p>
            </div>
        `;
        console.error("Job fetching error:", error);
    }
}

// ------------------------------------------------------------------
// Delete Job Function (Uses SweetAlert2)
// ------------------------------------------------------------------

/**
 * Sends a DELETE request to remove a job using SweetAlert2 for confirmations and feedback.
 * @param {number} id - The ID of the job to delete.
 */
async function deleteJob(id) {
    // Check if Swal (SweetAlert2) is loaded
    if (typeof Swal === 'undefined') {
        alert('Error: SweetAlert2 library not loaded. Cannot proceed with delete.');
        return;
    }

    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'You must be logged in to delete a job.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    // 1. SweetAlert2 Confirmation Dialog
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Red for delete
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
        return; // User cancelled
    }

    try {
        const response = await fetch(`${apiUrl}${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            // Success: Remove the job card from the DOM
            const jobElement = document.getElementById(`job-${id}`);
            if (jobElement) {
                jobElement.remove();
                
                // 2. SweetAlert2 Success Notification
                Swal.fire(
                    'Deleted!',
                    'The job posting has been successfully deleted.',
                    'success'
                );
            }
        } else if (response.status === 403) {
             // 3. SweetAlert2 Permission Denied Alert
             Swal.fire({
                 icon: 'error',
                 title: 'Permission Denied',
                 text: 'You do not have the authorization to delete this job.',
                 confirmButtonColor: '#d33'
             });
        } else {
            // Handle other errors
            throw new Error(`Failed to delete job. Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Delete error:', error);
        
        // 4. SweetAlert2 Failure Alert
        Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: `An error occurred: ${error.message}`,
            confirmButtonColor: '#d33'
        });
    }
}


// Start the process
fetchJobs();