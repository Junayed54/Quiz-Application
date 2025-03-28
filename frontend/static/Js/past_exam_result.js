document.addEventListener('DOMContentLoaded', function () {
    const pastExamId = window.location.pathname.split('/')[3]; // Extract past exam ID from URL
    const accessToken = localStorage.getItem('access_token'); // Get JWT token from localStorage

    if (!accessToken) {
        alert('You must be logged in to view this page.');
        window.location.href = '/login/';
        return;
    }

    // Fetch Past Exam Details
    function fetchPastExamDetails() {
        fetch(`/quiz/past-exams/${pastExamId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => renderPastExamDetails(data))
            .catch(error => console.error('Error fetching past exam details:', error));
    }

    function renderPastExamDetails(data) {
        const examDetails = document.getElementById('exam-details');
        examDetails.innerHTML = `<h3>${data.title}</h3>`;
    }

    // Fetch User's Past Attempts
    function fetchUserPastAttempts() {
        fetch(`/quiz/pastExamAttempts/user_attempts/?past_exam_id=${pastExamId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => renderUserPastAttempts(data))
            .catch(error => console.error('Error fetching user past attempts:', error));
    }

    function renderUserPastAttempts(data) {
        const attemptsContainer = document.getElementById('user-attempts');
        attemptsContainer.innerHTML = '';

        if (data.length === 0) {
            attemptsContainer.innerHTML = '<tr><td colspan="8" class="text-center">No attempts found.</td></tr>';
            return;
        }

        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${attempt.user_name}</td>
                <td>${attempt.total_questions || 'N/A'}</td>
                <td>${attempt.answered || 'N/A'}</td>
                <td>${attempt.total_correct_answers || 'N/A'}</td>
                <td>${attempt.wrong_answers || 'N/A'}</td>
                <td>${attempt.pass_mark || 'N/A'}</td>
                <td>
                    <button class="btn btn-light details-btn" data-user-id="${attempt.user}">
                        <i class="fa fa-list-alt"></i>
                    </button>
                </td>
            `;
            attemptsContainer.appendChild(row);
        });

        addDetailsButtonListeners();
    }

    // Add event listener for "Details" buttons
    function addDetailsButtonListeners() {
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function () {
                const userId = button.getAttribute('data-user-id');
                viewUserPastAttemptsDetails(userId);
            });
        });
    }

    // Fetch Past Exam Attempt Details
    function viewUserPastAttemptsDetails(userId) {
        fetch(`/quiz/pastExamAttempts/user_attempts/?past_exam_id=${pastExamId}&user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => showUserPastAttemptsDetails(data))
            .catch(error => console.error('Error fetching past attempt details:', error));
    }

    let attemptChart = null;

    function showUserPastAttemptsDetails(data) {
        const attemptsDetailsContainer = document.getElementById('user-attempts-details');
        attemptsDetailsContainer.innerHTML = '';

        if (data.length === 0) {
            attemptsDetailsContainer.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No detailed attempts found.</td></tr>`;
            return;
        }

        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${new Date(attempt.attempt_time).toLocaleTimeString()}</td>
                <td>${attempt.total_questions}</td>
                <td>${attempt.answered}</td>
                <td>${attempt.total_correct_answers}</td>
                <td>${attempt.wrong_answers}</td>
                <td>${attempt.pass_mark}</td>
            `;
            attemptsDetailsContainer.appendChild(row);
        });

        // Chart Data
        const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
        const correctData = data.map(attempt => attempt.total_correct_answers);
        const wrongData = data.map(attempt => attempt.wrong_answers);

        if (attemptChart) {
            attemptChart.destroy();
        }

        const ctx = document.getElementById('attemptChart').getContext('2d');
        attemptChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Correct Answers',
                        data: correctData,
                        backgroundColor: 'rgba(0, 128, 0, 0.6)',
                        borderColor: '#A1DD70',
                        borderWidth: 1
                    },
                    {
                        label: 'Wrong Answers',
                        data: wrongData,
                        backgroundColor: 'rgba(250, 112, 112, 1)',
                        borderColor: '#FA7070',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });

        const modal = new bootstrap.Modal(document.getElementById('attempt-details-modal'));
        modal.show();
    }

    // Fetch Highest Past Exam Attempts
    function fetchHighestPastAttempts() {
        fetch(`/quiz/pastExamAttempts/highest_attempts/?past_exam_id=${pastExamId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => renderHighestPastAttempts(data))
            .catch(error => console.error('Error fetching highest past attempts:', error));
    }

    function renderHighestPastAttempts(data) {
        const leaderboardContainer = document.getElementById('leaderboard');
        leaderboardContainer.innerHTML = '';

        if (data.length === 0) {
            leaderboardContainer.innerHTML = '<p class="text-center">No leaderboard data available.</p>';
            return;
        }

        data.forEach((entry, index) => {
            const percentage = entry.total_questions > 0 ? ((entry.score / entry.total_questions) * 100).toFixed(2) : 0;
            const position = index + 1;

            leaderboardContainer.innerHTML += `
                <div class="col">
                    <div class="border rounded p-3 shadow-sm h-100 clickable-div" data-user-id="${entry.user_id}">
                        <div class="flex-grow-1 overflow-hidden text-white">
                            <h5 class="m-0">${entry.user}</h5>
                            <small>Position: <span>${position}</span></small>
                            <small>Total Questions: <span>${entry.total_questions}</span></small>
                            <small>Total Score: <span>${entry.score}</span></small>
                            <small>Percentage: <span>${percentage}%</span></small>
                        </div>
                    </div>
                </div>
            `;
        });

        document.querySelectorAll('.clickable-div').forEach(div => {
            div.addEventListener('click', function () {
                const userId = this.getAttribute('data-user-id');
                window.location.href = `/quiz/user_summary/${userId}/`;
            });
        });
    }

    // Initialize Page
    fetchPastExamDetails();
    fetchUserPastAttempts();
    fetchHighestPastAttempts();
});
