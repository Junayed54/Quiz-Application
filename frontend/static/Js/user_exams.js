document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/user_exams_list/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const examsContainer = document.getElementById('exams-container');
        examsContainer.classList.add("row", "gy-4");

        // Dynamically load exams
        data.forEach((exam) => {
            const examElement = document.createElement('div');
            examElement.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');

            examElement.innerHTML = `
                <div class="card h-100 shadow-sm border-0 bg-light">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark">${exam.title}</h5>
                        <p class="card-text mb-1"><strong>Total Questions:</strong> ${exam.total_questions ?? 'N/A'}</p>
                        <p class="card-text mb-1"><strong>Total Marks:</strong> ${exam.total_mark ?? 'N/A'}</p>
                        <p class="card-text mb-3"><strong>Last Date:</strong> ${exam.last_date ?? 'N/A'}</p>
                        <div class="mt-auto d-flex justify-content-between gap-2">
                            <a href="/quiz/teacher_exam_details/${exam.exam_id}/" 
                               class="btn btn-dark btn-sm">
                               <i class="fa-solid fa-info"></i> 
                               Details
                            </a>
                            <button class="btn btn-danger btn-sm delete-btn" 
                                    data-exam-id="${exam.exam_id}">
                               Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;

            examsContainer.appendChild(examElement);
        });

        // Attach event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const examId = this.getAttribute('data-exam-id');
                if (confirm('Are you sure you want to delete this exam?')) {
                    fetch(`/quiz/exams/${examId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Exam deleted successfully.');
                            window.location.reload();
                        } else {
                            alert('Failed to delete the exam.');
                        }
                    });
                }
            });
        });
    })
    .catch(error => console.error('Error fetching exams:', error));
});
