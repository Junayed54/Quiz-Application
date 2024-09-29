 document.addEventListener('DOMContentLoaded', function() {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                window.location.href = '/login/';
                return;
            }

            fetch('/quiz/exams/student_exam_list/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                }
            })
            .then(response => response.json())
            .then(data => {
                const examsContainer = document.getElementById('exams-container');
                data.forEach(exam => {
                    const examElement = document.createElement('div');
                    examElement.classList.add('p-4', 'bg-white', 'shadow-md', 'rounded');
                    examElement.innerHTML = `
                        <div class="card mb-3 mw-70" alt="Max-width 70%">
                            <div class="card-body">
                                <h2 class="card-title">${exam.title}</h2>
                                <p class="card-text">Total Questions: ${exam.total_questions}</p>
                                <p class="card-text">Total Marks: ${exam.total_marks}</p>
                                <p class="card-text">Last Date: ${exam.last_date}</p>
                                <div class="d-row justify-content-between">
                                    <div class="p-3 bg-primary rounded mt-2" style="width:130px">
                                        <a href="/quiz/exam_detail/${exam.exam_id}/" class="text-white text-decoration-none">View Exam</a>
                                    </div>
                                    <div class="p-3 bg-secondary rounded mt-2" style="width:130px">
                                        <a href="/api/invite_user/${exam.exam_id}/" class="text-white text-decoration-none">Invite User</a>
                                    </div>
                                    <div class="p-3 bg-secondary rounded mt-2" style="width:130px">
                                        <a href="/quiz/exam_room/${exam.exam_id}/" class="text-white text-decoration-none">Exam room</a>
                                    </div>
                                    <div class="p-2 bg-danger rounded mt-2" style="width:130px">
                                        <button class="btn delete-btn text-white text-decoration-none" data-exam-id="${exam.exam_id}">Delete Exam</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    examsContainer.appendChild(examElement);
                });

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

                // Invite Users
                
            })
            .catch(error => console.error('Error:', error));
        });