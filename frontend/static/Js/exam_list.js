document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Fetch Departments
    fetch('/quiz/departments/', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const departmentSelect = document.getElementById('department');
    
        // Clear previous dynamic options but keep the first default one
        departmentSelect.innerHTML = `<option value="" disabled selected>Select Department</option>`;
    
        // Append new options dynamically
        data.forEach(department => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = department.name;
            departmentSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching departments:', error));

    // Fetch Positions
    fetch('/quiz/positions/', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const positionSelect = document.getElementById('position');
        positionSelect.innerHTML = data.map(position => `
            <option value="${position.id}">${position.name}</option>
        `).join('');
    })
    .catch(error => console.error('Error fetching positions:', error));

    // Fetch Organizations
    fetch('/quiz/organizations/', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const organizationSelect = document.getElementById('organization');
        organizationSelect.innerHTML = data.map(organization => `
            <option value="${organization.id}">${organization.name}</option>
        `).join('');
    })
    .catch(error => console.error('Error fetching organizations:', error));

    // Fetch Exams
    const fetchExams = (url) => {
        const departmentId = document.getElementById('department').value;
        const positionId = document.getElementById('position').value;
        const organizationId = document.getElementById('organization').value;

        const body = {
            department: departmentId,
            position: positionId,
            organization: organizationId
        };

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const examsList = document.getElementById('exams-list');
            examsList.innerHTML = ''; // Clear the list before appending new items

            data.forEach(exam => {
                const examCard = document.createElement('div');
                examCard.className = 'col-md-6 mb-4';

                examCard.innerHTML = `
                    <div class="card h-100 shadow-lg border-0 rounded-lg overflow-hidden">
                        <div class="card-body">
                            <div class="d-flex justify-content-end">
                                <span class="badge p-2 rounded-pill" style="background: #A0E418; color: white;">${exam.status}</span>
                            </div>
                            <h4 class="card-title mt-3" style="color: #FFB26F;">${exam.title}</h4>
                            <p class="text-muted">${exam.category_name}</p>
                            <div class="d-flex my-4 gap-2">
                                <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${exam.total_questions} Ques.</span>
                                <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${exam.total_mark} Marks</span>
                                <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${exam.duration} Mins</span>
                            </div>
                            <h6 class="text-muted">Examiner: <span class="text-dark fw-bold">${exam.creater_name}</span></h6>
                            <h6 class="text-muted">Package: <span class="text-dark">${exam.title}</span></h6>
                            <div class="mt-4">
                                <h5 class="text-muted">Subjects:</h5>
                                <div class="d-flex flex-wrap gap-2">
                                    ${exam.subjects.map(subject => `
                                        <span class="badge p-2 rounded-pill text-white" style="background-color: #5C7285;">
                                            ${subject.subject}: <span class="fw-bold" style="color: #D0DDD0;">${subject.question_count}</span>
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                            <button class="btn btn-outline-primary btn-sm d-flex align-items-center" onclick="viewExamDetail('${exam.exam_id}')">
                                <i class="fa-solid fa-circle-info me-2"></i> Details
                            </button>
                            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" onclick="shareExam('${exam.title}', '${window.location.origin}/quiz/exam_detail/${exam.exam_id}/')">
                                <i class="fa-solid fa-share-alt me-2"></i> Share
                            </button>
                        </div>
                    </div>
                `;

                examsList.appendChild(examCard);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            examsList.innerHTML = '<div class="col-12 text-center text-danger py-4">Failed to load exams. Please try again later.</div>';
        });
    };

    // Add event listeners to filter selections
    document.getElementById('department').addEventListener('change', function() {
        fetchExams('/quiz/exams/');
    });
    document.getElementById('position').addEventListener('change', function() {
        fetchExams('/quiz/exams/');
    });
    document.getElementById('organization').addEventListener('change', function() {
        fetchExams('/quiz/exams/');
    });

    // Initial fetch of exams on page load
    fetchExams('/quiz/exams/');

});

// Function to load past exams
document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    const fetchData = (url, elementId) => {
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById(elementId);
            selectElement.innerHTML = data.map(item => `
                <option value="${item.id}">${item.name}</option>
            `).join('');
        })
        .catch(error => console.error(`Error fetching ${elementId}:`, error));
    };

    fetchData('/quiz/departments/', 'department');
    fetchData('/quiz/positions/', 'position');
    fetchData('/quiz/organizations/', 'organization');

    const fetchExams = (url) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const examsList = document.getElementById('past-exams-list');
            examsList.innerHTML = data.map(examData => `
                <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-lg border-0 rounded-lg overflow-hidden">
                    <div class="card-body">
                        <div class="d-flex justify-content-end">
                            <span class="badge p-2 rounded-pill" style="background: #A0E418; color: white;">${examData.is_published ? 'Published' : 'Not Published'}</span>
                        </div>
                        <h4 class="card-title mt-3" style="color: #FFB26F;">${examData.title}</h4>
                        <p class="text-muted">${examData.department_name}</p>
                        <div class="d-flex my-4 gap-2">
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${examData.questions_count} Ques.</span>
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${examData.pass_mark} Marks</span>
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${examData.duration} Mins</span>
                        </div>
                        <h6 class="text-muted">Position: <span class="text-dark fw-bold">${examData.position_name}</span></h6>
                        <h6 class="text-muted">Organization: <span class="text-dark">${examData.organization_name}</span></h6>
                    </div>
                    <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                        <button class="btn btn-outline-primary btn-sm d-flex align-items-center" onclick="viewPastExamDetail(${examData.id})">
                            <i class="fa-solid fa-circle-info me-2"></i> Details
                        </button>
                        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" onclick="shareExam('${examData.title}', '${window.location.origin}/quiz/exam_detail/${examData.id}/')">
                            <i class="fa-solid fa-share-alt me-2"></i> Share
                        </button>
                    </div>
                </div>
            </div>

            `).join('');
        })
        .catch(error => console.error('Error:', error));
    };

    document.getElementById('department').addEventListener('change', () => fetchExams('/quiz/exams/'));
    document.getElementById('position').addEventListener('change', () => fetchExams('/quiz/exams/'));
    document.getElementById('organization').addEventListener('change', () => fetchExams('/quiz/exams/'));

    fetchExams('/quiz/past-exams/');
});


function viewExamDetail(examId) {
    window.location.href = `/quiz/exam_detail/${examId}`;
}


function viewPastExamDetail(examId) {
    window.location.href = `/quiz/past_exam_details/${examId}`;
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
