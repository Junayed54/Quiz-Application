document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }
    const loader = document.getElementById('loader');
    // const headers = {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    // };

    // // Populate dropdowns (department, position, organization)
    // const fetchDropdown = (url, elementId, placeholder) => {
    //     fetch(url, { headers })
    //         .then(response => response.json())
    //         .then(data => {
    //             const select = document.getElementById(elementId);
    //             select.innerHTML = `<option value="">${placeholder}</option>`;
    //             data.forEach(item => {
    //                 const option = document.createElement('option');
    //                 option.value = item.id;
    //                 option.textContent = item.name;
    //                 select.appendChild(option);
    //             });
    //         })
    //         .catch(error => console.error(`Error loading ${elementId}:`, error));
    // };

    // fetchDropdown('/quiz/departments/', 'department', 'Select Department');
    // fetchDropdown('/quiz/positions/', 'position', 'Select Position');
    // fetchDropdown('/quiz/organizations/', 'organization', 'Select Organization');

    // Fetch both current and past exams
    const fetchExams = () => {
        // const department = document.getElementById('department').value;
        // const position = document.getElementById('position').value;
        // const organization = document.getElementById('organization').value;

        // const queryParams = new URLSearchParams({ department, position, organization });

        // Fetch current exams
        // fetch(`/quiz/exams/?${queryParams}`, { headers })
        //     .then(res => res.json())
        //     .then(data => renderExams(data, 'exams-list', false))
        //     .catch(err => console.error('Error loading exams:', err));

        // Fetch past exams
        fetch(`/quiz/past-exams/`)
            .then(res => res.json())
            .then(data => renderExams(data, 'all_exams', true))
            .catch(err => console.error('Error loading past exams:', err));
    };

    const renderExams = (data, elementId, isPast) => {
        const container = document.getElementById(elementId);
        loader.classList.add('d-none');
        if (!data.length) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-4">No exams found.</div>';
            return;
        }

        
        
        container.innerHTML = data.map(exam => `
            <div class="card">
                <div class="card-body d-flex justify-content-between align-items-stretch" style="gap: 1rem; height: 9rem">
                    <div style="width: 50%;">
                        <h3 class="card-title">${exam.title}</h3>
                        <div style="display: flex; gap: 3px; margin-bottom: 2px; font-size: 14px; color: #F97316;">
                            <div class="p-1 rounded" style="background: #D5C7A3">${exam.total_questions} প্রশ্ন</div>
                            <div class="p-1 rounded" style="background: #D5C7A3">${exam.total_questions} নম্বর</div>
                            <div class="p-1 rounded" style="background: #D5C7A3">${exam.duration} মিনিট</div>
                        </div>
                        <div class="mt-2">
                            <p class="card-text">পদঃ ${exam.position}</p>
                            <p class="card-text">সংস্থাঃ ${exam.organization}</p>
                        </div>
                    </div>
                    <div class="vertical-line"></div>
                    <div style="display: flex; flex-direction: column; gap:8px; align-items: center; justify-content: center">
                        <a href="/new_past_exam_details/${exam.id}" class="btn btn-primary">Details</a>
                        <a href="#" class="btn btn-outline-secondary">Share</a>
                    </div>
                    
                </div>
            </div>
        `).join('');
    };

    // Initial load
    fetchExams();
});



function viewPastExamDetail(examId) {
    window.location.href = `/quiz/past_exam_details/${examId}`;
}

function shareExam(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this exam: ${title}`,
            url: url
        }).catch(err => {
            console.error('Error sharing:', err);
        });
    } else {
        // Fallback: Copy to clipboard and show toast
        navigator.clipboard.writeText(url).then(() => {
            const toast = document.createElement('div');
            toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
            toast.role = 'alert';
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        Link to "${title}" copied to clipboard!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            document.body.appendChild(toast);
            new bootstrap.Toast(toast).show();
        });
    }
}

