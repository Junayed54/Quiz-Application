const jobList = document.getElementById('job-list');
const token = localStorage.getItem('access_token');
const apiUrl = '/api/govt-jobs/'; // API endpoint for government jobs

/**
 * Fetches and displays the list of jobs.
 */
async function fetchJobs() {
    if (!token) {
        jobList.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                <h4 class="alert-heading">Login Required</h4>
                <p>You need to be logged in to view job listings.</p>
            </div>`;
        return;
    }

    jobList.innerHTML = `
        <div class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="ms-2 text-muted">Loading jobs...</p>
        </div>`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(response.status === 401 ? 'Unauthorized' : 'Server error');
        const jobs = await response.json();
        jobList.innerHTML = '';

        if (jobs.length === 0) {
            jobList.innerHTML = '<p class="text-center text-muted p-5">No jobs available right now. Check back soon!</p>';
            return;
        }

        let jobsHTML = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">';
        jobs.forEach(job => {
            const departmentName = job.department && typeof job.department === 'object' ? job.department.name : 'N/A';
            
            jobsHTML += `
                <div class="col" id="job-${job.id}">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-primary mb-3">${job.title}</h5>
                            <ul class="list-unstyled small text-muted mb-4 flex-grow-1">
                                <li><i class="bi bi-building me-2 text-info"></i><strong>Department:</strong> ${departmentName}</li>
                                <li><i class="bi bi-geo-alt-fill me-2 text-danger"></i><strong>Location:</strong> ${job.location || 'N/A'}</li>
                                <li><i class="bi bi-calendar-x me-2 text-warning"></i><strong>Deadline:</strong> ${job.deadline || 'N/A'}</li>
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
                                    View
                                </a>
                                <a href="/govt-jobs/${job.id}/update/" class="btn btn-warning btn-sm me-2">
                                    <i class="bi bi-pencil-square"></i> Edit
                                </a>
                                <button onclick="deleteJob(${job.id})" class="btn btn-danger btn-sm">
                                    <i class="bi bi-trash-fill"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        jobsHTML += '</div>';
        jobList.innerHTML = jobsHTML;
    } catch (error) {
        const errorMessage = (error.message === 'Unauthorized')
            ? 'Your session has expired. Please log in again.'
            : 'Failed to load jobs. Please check the API status.';
        jobList.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error</h4>
                <p>${errorMessage}</p>
            </div>`;
        console.error("Job fetching error:", error);
    }
}

// -----------------------------------------------------
// Edit Job — opens modal and updates via PUT
// -----------------------------------------------------
async function openEditModal(jobId) {
    const response = await fetch(`${apiUrl}${jobId}/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const job = await response.json();

    document.getElementById('editJobId').value = job.id;
    document.getElementById('editTitle').value = job.title;
    document.getElementById('editLocation').value = job.location || '';
    document.getElementById('editDeadline').value = job.deadline || '';
    document.getElementById('editOfficialLink').value = job.official_link || '';

    const modal = new bootstrap.Modal(document.getElementById('editJobModal'));
    modal.show();
}

async function updateJob() {
    const id = document.getElementById('editJobId').value;
    const updatedData = {
        title: document.getElementById('editTitle').value,
        location: document.getElementById('editLocation').value,
        deadline: document.getElementById('editDeadline').value,
        official_link: document.getElementById('editOfficialLink').value,
    };

    const response = await fetch(`${apiUrl}${id}/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        Swal.fire({
            icon: 'success',
            title: 'Job Updated',
            text: 'The job has been updated successfully.',
            timer: 2000,
            showConfirmButton: false
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById('editJobModal'));
        modal.hide();
        fetchJobs();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Could not update the job. Please try again.'
        });
    }
}

// -----------------------------------------------------
// Delete Job Function (SweetAlert2 confirmation)
// -----------------------------------------------------
async function deleteJob(id) {
    if (typeof Swal === 'undefined') {
        alert('Error: SweetAlert2 library not loaded.');
        return;
    }

    if (!token) {
        Swal.fire({ icon: 'warning', title: 'Login Required', text: 'You must be logged in to delete a job.' });
        return;
    }

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`${apiUrl}${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 204) {
            document.getElementById(`job-${id}`).remove();
            Swal.fire('Deleted!', 'The job has been deleted.', 'success');
        } else {
            throw new Error('Failed to delete.');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

fetchJobs();
