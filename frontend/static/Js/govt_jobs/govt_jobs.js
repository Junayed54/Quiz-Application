const jobList = document.getElementById('job-list');
const token = localStorage.getItem('access_token');

async function fetchJobs() {
  if (!token) {
    jobList.innerHTML = `<div class="alert alert-warning text-center">You need to be logged in to view jobs.</div>`;
    return;
  }

  try {
    const response = await fetch('/api/govt-jobs/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Unauthorized or server error');
    }

    const jobs = await response.json();
    jobList.innerHTML = '';

    if (jobs.length === 0) {
      jobList.innerHTML = '<p class="text-center">No jobs available right now.</p>';
      return;
    }

    jobList.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">';  // Start grid container

    jobs.forEach(job => {
      const jobHTML = `
        <div class="card bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <h5 class="text-lg font-semibold mb-2">${job.title}</h5>
          <p class="text-sm text-gray-500 mb-2"><strong>Department:</strong> ${job.department || 'N/A'}</p>
          <p class="text-sm text-gray-500 mb-2"><strong>Location:</strong> ${job.location || 'N/A'}</p>
          <p class="text-sm text-gray-500 mb-2"><strong>Deadline:</strong> ${job.deadline || 'N/A'}</p>
          <p class="text-sm text-gray-500 mb-2"><strong>Official Link:</strong> 
            <a href="${job.official_link}" target="_blank" class="text-blue-500 hover:underline">Visit</a>
          </p>
          ${job.pdf ? `<p class="text-sm text-gray-500 mb-2"><strong>PDF:</strong> 
            <a href="${job.pdf}" target="_blank" class="text-blue-500 hover:underline">Download</a></p>` : ''}
          <p class="text-sm text-gray-500 mb-3">${job.description || 'No description provided.'}</p>
          <div class="d-flex justify-content-between">
            <a href="/govt-job-details/${job.id}/" class="btn btn-primary btn-sm text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded-md">View Details</a>
            <button class="btn btn-outline-secondary btn-sm text-gray-700 border-gray-300 hover:bg-gray-100 py-2 px-4 rounded-md" onclick="shareJob(${job.id})">Share</button>
          </div>
        </div>
      `;

      jobList.insertAdjacentHTML('beforeend', jobHTML);
    });

    jobList.innerHTML += '</div>';  // End grid container

  } catch (error) {
    jobList.innerHTML = '<div class="alert alert-danger text-center">Failed to load jobs. Please check your token or try again later.</div>';
  }
}

// Function to share the job (copy URL to clipboard)
function shareJob(id) {
  const jobUrl = `${window.location.origin}/govt-job-details/${id}/`;
  navigator.clipboard.writeText(jobUrl).then(() => {
    alert("Job link copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy:", err);
    alert("Failed to copy job link.");
  });
}

fetchJobs();
