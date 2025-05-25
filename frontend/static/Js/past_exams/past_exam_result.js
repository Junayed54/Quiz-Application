document.addEventListener('DOMContentLoaded', function () {
    const examId = window.location.pathname.split('/')[2];
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        alert('You must be logged in to view this page.');
        window.location.href = '/login/';
        return;
    }

    // Fetch Exam Details
    function fetchExamDetails() {
        fetch(`/quiz/past-exams/${examId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => renderExamDetails(data))
        .catch(error => console.error('Error fetching exam details:', error));
    }

    function renderExamDetails(data) {
        const examDetails = document.getElementById('exam-details');
        examDetails.innerHTML = `<h3>${data.title}</h3>`;
    }

    // Fetch Best Attempts
    function fetchBestAttempts() {
        fetch(`/quiz/past_exam/best_attempts/?past_exam_id=${examId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => renderBestAttempts(data))
        .catch(error => console.error('Error fetching best attempts:', error));
    }

    function renderBestAttempts(data) {
        
        
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
                <td>${attempt.answered_questions || 'N/A'}</td>
                <td>${attempt.correct_answers || 'N/A'}</td>
                <td>${attempt.wrong_answers || 'N/A'}</td>
                <td>${attempt.pass_mark || 'N/A'}</td>
                <td>
                    <button class="btn btn-light details-btn h3" data-user-id="${attempt.user}">
                        <i class="fa fa-list-alt" aria-hidden="true"></i>
                    </button>
                </td>
            `;
            attemptsContainer.appendChild(row);
        });

        addDetailsButtonListeners();
    }

    function addDetailsButtonListeners() {
        const buttons = document.querySelectorAll('.details-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const userId = button.getAttribute('data-user-id');
                viewUserAttemptsDetails(userId);
            });
        });
    }

    function viewUserAttemptsDetails(userId) {
        fetch(`/quiz/past_exam/user_attempts/?past_exam_id=${examId}&user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => showUserAttemptsDetails(data))
        .catch(error => console.error('Error fetching user attempts details:', error));
    }

    let attemptChart = null;

    function showUserAttemptsDetails(data) {
        const attemptsDetailsContainer = document.getElementById('user-attempts-details');
        attemptsDetailsContainer.innerHTML = '';

        if (data.length === 0) {
            attemptsDetailsContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">No detailed attempts found.</td>
                </tr>`;
            return;
        }
        console.log("table", data);

        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${new Date(attempt.attempt_time).toLocaleTimeString()}</td>
                <td>${attempt.total_questions}</td>
                <td>${attempt.answered_questions}</td>
                <td>${attempt.correct_answers}</td>
                <td>${attempt.wrong_answers}</td>
                <td>${attempt.pass_mark}</td>
            `;
            attemptsDetailsContainer.appendChild(row);
        });

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
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        const modal = new bootstrap.Modal(document.getElementById('attempt-details-modal'));
        modal.show();
    }

    // Fetch Leaderboard
    function fetchLeaderboard() {
        fetch(`/quiz/past_exam/leaderboard/${examId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => renderLeaderboard(data))
        .catch(error => console.error('Error fetching leaderboard:', error));
    }

    function renderLeaderboard(data) {
        const leaderboardContainer = document.getElementById('leaderboard');
        leaderboardContainer.innerHTML = '';

        if (data.length === 0) {
            leaderboardContainer.classList.add('my-2', 'text-center');
            leaderboardContainer.innerHTML = '<p class="text-center" style="margin: 4px auto;">No leaderboard data available.</p>';
            return;
        }

        data.forEach((entry, index) => {
            const percentage = entry.total_questions > 0 ? ((entry.score / entry.total_questions) * 100).toFixed(2) : 0;
            const position = index + 1;
            leaderboardContainer.innerHTML += `
                <div class="col">
                    <div style="background-color: #51829B;" class="border border-secondary rounded d-flex align-items-center gap-3 p-3 shadow-sm h-100 clickable-div" data-user-id="${entry.user_id}">
                        <div class="flex-shrink-0">
                            <img src="../../../static/images/user_9071610.png" alt="User Icon" class="rounded-circle border border-primary" width="50" height="50">
                        </div>
                        <div class="flex-grow-1 overflow-hidden text-white">
                            <h5 class="m-0 text-truncate" style="color: #FFB200;">${entry.user}</h5>
                            <small class="d-block">Position: <span class="" style="color: #FE4F2D;">${position}</span></small>
                            <small class="d-block fw-bold" style="color: #F6995C;">Top Level</small>
                            <small class="d-block">Total Questions: <span class="" style="color: #FE4F2D;">${entry.total_questions}</span></small>
                            <small class="d-block">Total Score: <span class="" style="color: #FE4F2D">${entry.score}</span></small>
                            <small class="d-block">Percentage: <span class="" style="color: #FE4F2D">${percentage}%</span></small>
                        </div>
                    </div>
                </div>
            `;
        });

        document.querySelectorAll('.clickable-div').forEach(div => {
            div.addEventListener('click', function () {
                const userId = this.getAttribute('data-user-id');
                window.location.href = `/user-summary/${userId}/`;
            });
        });
    }

    // Initialize
    fetchExamDetails();
    fetchBestAttempts();
    fetchLeaderboard();
});
