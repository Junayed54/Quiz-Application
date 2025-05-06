document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    // Populate dropdowns (department, position, organization)
    const fetchDropdown = (url, elementId, placeholder) => {
        fetch(url, { headers })
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById(elementId);
                select.innerHTML = `<option value="">${placeholder}</option>`;
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error(`Error loading ${elementId}:`, error));
    };

    fetchDropdown('/quiz/departments/', 'department', 'Select Department');
    fetchDropdown('/quiz/positions/', 'position', 'Select Position');
    fetchDropdown('/quiz/organizations/', 'organization', 'Select Organization');

    // Fetch both current and past exams
    const fetchExams = () => {
        const department = document.getElementById('department').value;
        const position = document.getElementById('position').value;
        const organization = document.getElementById('organization').value;

        const queryParams = new URLSearchParams({ department, position, organization });

        // Fetch current exams
        fetch(`/quiz/exams/?${queryParams}`, { headers })
            .then(res => res.json())
            .then(data => renderExams(data, 'exams-list', false))
            .catch(err => console.error('Error loading exams:', err));

        // Fetch past exams
        fetch(`/quiz/past-exams/?${queryParams}`, { headers })
            .then(res => res.json())
            .then(data => renderExams(data, 'past-exams-list', true))
            .catch(err => console.error('Error loading past exams:', err));
    };

    const renderExams = (data, elementId, isPast) => {
        const container = document.getElementById(elementId);
        if (!data.length) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-4">No exams found.</div>';
            return;
        }

        container.innerHTML = data.map(exam => `
            <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-lg border-0 rounded-lg overflow-hidden">
                    <div class="card-body">
                        <div class="d-flex justify-content-end">
                            <span class="badge p-2 rounded-pill" style="background: #A0E418; color: white;">
                                ${isPast ? (exam.is_published ? 'Published' : 'Not Published') : exam.status}
                            </span>
                        </div>
                        <h4 class="card-title mt-3" style="color: #FFB26F;">${exam.title}</h4>
                        <p class="text-muted">${isPast ? exam.department_name : exam.category_name}</p>
                        <div class="d-flex my-4 gap-2">
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">
                                ${isPast ? exam.questions_count : exam.total_questions} Ques.
                            </span>
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">
                                ${isPast ? exam.pass_mark : exam.total_mark} Marks
                            </span>
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">
                                ${exam.duration} Mins
                            </span>
                        </div>
                        <h6 class="text-muted">Position: <span class="text-dark fw-bold">${isPast ? exam.position_name : exam.creater_name}</span></h6>
                        <h6 class="text-muted">Organization: <span class="text-dark">${exam.organization_name || '-'}</span></h6>

                        ${!isPast ? `
                            <div class="mt-4">
                                <h5 class="text-muted">Subjects:</h5>
                                <div class="d-flex flex-wrap gap-2">
                                    ${exam.subjects.map(subject => `
                                        <span class="badge p-2 rounded-pill text-white" style="background-color: #5C7285;">
                                            ${subject.subject}: <span class="fw-bold" style="color: #D0DDD0;">${subject.question_count}</span>
                                        </span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                        <button class="btn btn-outline-primary btn-sm d-flex align-items-center" onclick="${isPast ? 'viewPastExamDetail' : 'viewExamDetail'}('${exam.exam_id || exam.id}')">
                            <i class="fa-solid fa-circle-info me-2"></i> Details
                        </button>
                        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" onclick="shareExam('${exam.title}', '${window.location.origin}/quiz/exam_detail/${exam.exam_id || exam.id}/')">
                            <i class="fa-solid fa-share-alt me-2"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Re-fetch exams when filters change
    ['department', 'position', 'organization'].forEach(id => {
        document.getElementById(id).addEventListener('change', fetchExams);
    });

    // Initial load
    fetchExams();
});

// View/Share handlers
function viewExamDetail(examId) {
    window.location.href = `/quiz/exam_detail/${examId}`;
}

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





// document.addEventListener('DOMContentLoaded', function () {
//     const accessToken = localStorage.getItem('access_token');

//     // === Dropdown Elements ===
//     const departmentSelect = document.getElementById('department');
//     const positionSelect = document.getElementById('position');
//     const organizationSelect = document.getElementById('organization');

//     // === Current and Past Exams Containers ===
//     const currentExamsContainer = document.getElementById('current-exams-container');
//     const pastExamsContainer = document.getElementById('past-exams-container');

//     // === Utility: Populate Dropdown with Default Option ===
//     function populateSelect(selectElement, data, placeholderText) {
//         selectElement.innerHTML = `<option value="" disabled selected>${placeholderText}</option>` +
//             data.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
//     }

//     // === Fetch Departments ===
//     fetch('/quiz/departments/', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => populateSelect(departmentSelect, data, 'Select Department'))
//     .catch(error => {
//         console.error('Error fetching departments:', error);
//         departmentSelect.innerHTML = '<option disabled>Error loading departments</option>';
//     });

//     // === Fetch Positions ===
//     fetch('/quiz/positions/', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => populateSelect(positionSelect, data, 'Select Position'))
//     .catch(error => {
//         console.error('Error fetching positions:', error);
//         positionSelect.innerHTML = '<option disabled>Error loading positions</option>';
//     });

//     // === Fetch Organizations ===
//     fetch('/quiz/organizations/', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => populateSelect(organizationSelect, data, 'Select Organization'))
//     .catch(error => {
//         console.error('Error fetching organizations:', error);
//         organizationSelect.innerHTML = '<option disabled>Error loading organizations</option>';
//     });

//     // === Fetch Exams (Reusable for Current & Past) ===
//     function fetchExams(endpoint, container, filters = {}) {
//         const url = new URL(endpoint, window.location.origin);
//         Object.keys(filters).forEach(key => url.searchParams.append(key, filters[key]));

//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         })
//         // .then(response => {
//         //     if (!response.ok) {
//         //         throw new Error('Failed to fetch exams');
//         //     }
//         //     return response.json();
//         // })
//         .then(data => {
//             if (data.length === 0) {
//                 container.innerHTML = '<p class="text-gray-500">No exams found.</p>';
//             } else {
//                 container.innerHTML = data.map(exam => `
//                     <div class="bg-white p-4 shadow-md rounded-lg mb-4">
//                         <h3 class="text-lg font-semibold">${exam.title}</h3>
//                         <p>Total Marks: ${exam.total_marks}</p>
//                         <p>Total Questions: ${exam.total_questions}</p>
//                         <a href="/quiz/start_exam/${exam.exam_id}" class="text-blue-600 hover:underline">Start Exam</a>
//                     </div>
//                 `).join('');
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching exams:', error);
//             container.innerHTML = '<p class="text-red-500">Error loading exams. Please try again.</p>';
//         });
//     }

//     // === Fetch All Exams Initially ===
//     fetchExams('/quiz/exams/', currentExamsContainer);
//     fetchExams('/quiz/past_exams/', pastExamsContainer);

//     // === Event Listeners to Fetch Exams When Filters Change ===
//     [departmentSelect, positionSelect, organizationSelect].forEach(select => {
//         select.addEventListener('change', () => {
//             const filters = {
//                 department: departmentSelect.value,
//                 position: positionSelect.value,
//                 organization: organizationSelect.value
//             };

//             fetchExams('/quiz/exams/', currentExamsContainer, filters);
//             fetchExams('/quiz/past_exams/', pastExamsContainer, filters);
//         });
//     });
// });
