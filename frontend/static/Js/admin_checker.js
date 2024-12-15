document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    const teacherExamsContainer = document.getElementById('teacher-exams-container');
    const reviewedExamsContainer = document.getElementById('reviewed-exams-container');

    if (!teacherExamsContainer || !reviewedExamsContainer) {
        console.error('Error: Required containers not found.');
        return;
    }

    // Fetch and populate exams
    fetchExams('/quiz/status/submitted_to_admin/', teacherExamsContainer);
    fetchExams('/quiz/status/reviewed_exams/', reviewedExamsContainer);

    function fetchExams(apiUrl, container) {
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    container.innerHTML = `<p class="text-center text-muted">No exams available.</p>`;
                    return;
                }

                data.forEach(exam => {
                    const examCard = createExamCard(exam);
                    container.appendChild(examCard);
                });

                attachEventListeners();
            })
            .catch(error => console.error('Error fetching exams:', error));
    }

    function createExamCard(exam) {
        const examElement = document.createElement('div');
        examElement.classList.add('col');

        const checkExamUrl = exam.status === 'reviewed'
            ? `/quiz/admin_reviewer/${exam.exam}/`
            : `/quiz/teacher_exam_details/${exam.exam}/`;

            examElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${exam.exam_details['title']}</h5>
                        <p class="card-text">Teacher: ${exam.exam_details['created_by']}</p>
                        <p class="card-text">Total Marks: ${exam.exam_details['total_marks']}</p>
                        <p class="card-text">Last Date: ${exam.exam_details['last_date']}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <a href="${checkExamUrl}" class="btn btn-primary btn-sm w-auto">Check Exam</a>
                        ${
                            exam.status === 'reviewed'
                                ? ``
                                : `<button class="btn btn-success btn-sm w-auto assign-teacher-btn" pk-id="${exam.id}" created-by-id="${exam.user}">Assign Teacher</button>`
                        }
                        <button class="btn btn-danger btn-sm w-auto delete-btn" data-exam-id="${exam.exam}">Delete Exam</button>
                    </div>
                </div>

        `;
        
        return examElement;
    }

    function attachEventListeners() {
        document.querySelectorAll('.assign-teacher-btn').forEach(button => {
            button.addEventListener('click', function () {
                const pk = this.getAttribute('pk-id');
                const createdById = this.getAttribute('created-by-id');
                fetchTeachers(pk, createdById);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const examId = this.getAttribute('data-exam-id');
                if (confirm('Are you sure you want to delete this exam?')) {
                    deleteExam(examId);
                }
            });
        });
    }

    function fetchTeachers(pk, createdById) {
        fetch('/quiz/teachers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then(response => response.json())
            .then(teachers => {
                showTeacherModal(teachers, pk, createdById);
            })
            .catch(error => console.error('Error fetching teachers:', error));
    }

    function showTeacherModal(teachers, pk, createdById) {
        const modal = new bootstrap.Modal(document.getElementById('teacherModal'), {});
        const modalBody = document.querySelector('#teacherModal .modal-body');

        const filteredTeachers = teachers.filter(teacher => teacher.id !== parseInt(createdById));
        modalBody.innerHTML = `
            <label for="teacher-select">Select Teacher</label>
            <select id="teacher-select" class="form-control">
                ${filteredTeachers.map(teacher => `<option value="${teacher.id}">${teacher.username}</option>`).join('')}
            </select>
            <button class="btn btn-primary mt-3" id="assign-teacher-btn" pk-id="${pk}">Assign</button>
        `;

        document.getElementById('assign-teacher-btn').addEventListener('click', function () {
            const selectedTeacherId = document.getElementById('teacher-select').value;
            assignTeacherToExam(pk, selectedTeacherId);
            modal.hide();
        });

        modal.show();
    }

    function assignTeacherToExam(pk, teacherId) {
        fetch(`/quiz/status/${pk}/assign_reviewer/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ reviewer_id: teacherId })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.detail);
                window.location.reload();
            })
            .catch(error => console.error('Error assigning teacher:', error));
    }

    function deleteExam(examId) {
        fetch(`/quiz/exams/${examId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-CSRFToken': getCookie('csrftoken'),
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
            .catch(error => console.error('Error deleting exam:', error));
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
