document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/status/draft_exams/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        const examsContainer = document.getElementById('exams-container');
        console.log(data);
        data.forEach(exam => {
            const examElement = document.createElement('div');
            examElement.classList.add( 'bg-white', 'shadow-md', 'rounded');
            examElement.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h2 class="card-title text-muted">${exam.exam_details['title']}</h2>
                        <p class="card-text">Total Questions: ${exam.exam_details['total_questions']}</p>
                        <p class="card-text">Total Marks: ${exam.exam_details['total_marks']}</p>
                        <p class="card-text">Last Date: ${exam.exam_details['last_date']}</p>
                        <div class="d-flex text-center justify-content-between">
                            <button class="btn btn-sm border border-2 border-primary w-auto" onclick="location.href='/quiz/teacher_exam_details/${exam.exam}/'">
                                View Exam
                            </button>
                            
                            <button class="btn send-btn btn-sm border border-2 border-secondary w-auto" status-id="${exam.id}">Send Admin</button>
                            
                           
                            <button class="btn delete-btn btn-sm border border-2 border-danger  w-auto" data-exam-id="${exam.exam}">Delete Exam</button>
                            
                        </div>
                    </div>
                </div>
            `;
            examsContainer.appendChild(examElement);
        });

        // Handle "Send to Admin" button click
        document.querySelectorAll('.send-btn').forEach(button => {
            button.addEventListener('click', function() {
                const statusId = this.getAttribute('status-id');
                if (confirm('Are you sure you want to send this exam to admin?')) {
                    fetch(`/quiz/status/${statusId}/submit_to_admin/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Exam sent to Admin successfully.');
                            window.location.reload();
                        } else {
                            response.json().then(data => {
                                alert('Error sending exam: ' + data.error);
                            });
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        });

        // Handle "Delete Exam" button click
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
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
                            response.json().then(data => {
                                alert('Error deleting exam: ' + data.error);
                            });
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        });
    })
    .catch(error => console.error('Error:', error));
});
