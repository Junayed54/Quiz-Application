document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    
    // Extract exam_id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const examId = window.location.pathname.split('/')[3];  // Make sure the exam_id is passed in the URL

    if (!examId || !accessToken) {
        window.location.href = '/login/';
        return;
    }

    const apiUrl = `/quiz/exams/exam_detail/${examId}/`;
    const leaderboardUrl = `/quiz/leader_board/${examId}`;

    function fetchExamDetails() {
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Populate Exam Details
                document.getElementById('exam-title').textContent = data.title;
                document.getElementById('exam-total-questions').textContent = data.total_questions;
                document.getElementById('exam-total-marks').textContent = data.total_marks;
                document.getElementById('exam-created-by').textContent = data.created_by;
                document.getElementById('exam-last-date').textContent = new Date(data.last_date).toLocaleDateString();

                // Populate Questions Table
                const questionsList = document.getElementById('questions-list');
                questionsList.innerHTML = ''; // Clear previous data
                data.questions.forEach((question, index) => {
                    const optionsHTML = question.options.map(option => `<li>${option.text}</li>`).join('');
                    const rowHTML = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${question.text}</td>
                            <td><ul>${optionsHTML}</ul></td>
                            <td>${question.options.find(option => option.is_correct)?.text || 'N/A'}</td>
                        </tr>
                    `;
                    questionsList.innerHTML += rowHTML;
                });
            }
        })
        .catch(error => console.error('Error fetching exam details:', error));
    }

    // Fetch the exam details on page load
    fetchExamDetails();

    // Redirect to the leaderboard page when the button is clicked
    document.getElementById('leaderboard-btn').addEventListener('click', function () {
        window.location.href = leaderboardUrl;
    });
});
