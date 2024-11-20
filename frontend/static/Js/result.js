document.addEventListener('DOMContentLoaded', function () {
    const examId = window.location.pathname.split('/')[3]; // Replace with the actual exam ID
    const accessToken = localStorage.getItem('access_token'); // Assumes the token is stored in local storage

    if (!accessToken) {
        alert('You must be logged in to view this page.');
        window.location.href = '/login/';
        return;
    }

    // Fetch Exam Details
    function fetchExamDetails() {
        fetch(`/quiz/exams/exam_detail/${examId}/`, {
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
        examDetails.innerHTML = `
            <h3>${data.title}</h3>
        `;
    }

    // Fetch Best Attempts
    function fetchBestAttempts() {
        fetch(`/quiz/attempts/user_best_attempts/?exam_id=${examId}`, {
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
        console.log(data);
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
                    <button class="btn btn-info" data-user-id="${attempt.user_id}">All attampts</button>
                </td>
            `;
            attemptsContainer.appendChild(row);
        });

        // Add event listeners to "Details" buttons after rendering
        addDetailsButtonListeners();
    }

    // Event listener for "Details" buttons
    function addDetailsButtonListeners() {
        const buttons = document.querySelectorAll('.btn-info');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const userId = button.getAttribute('data-user-id');
                viewUserAttemptsDetails(userId);
            });
        });
    }

    // View User Attempts Details (ensure the function is defined globally)
    function viewUserAttemptsDetails(userId) {
        fetch(`/quiz/attempts/user_attempts/?exam_id=${examId}&user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => showUserAttemptsDetails(data))
            .catch(error => console.error('Error fetching user attempts details:', error));
    }

    function showUserAttemptsDetails(data) {
        const attemptsDetailsContainer = document.getElementById('user-attempts-details');
        attemptsDetailsContainer.innerHTML = '';
    
        if (data.length === 0) {
            attemptsDetailsContainer.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No detailed attempts found.</td>
                </tr>`;
            return;
        }
    
        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${attempt.total_questions}</td>
                <td>${attempt.answered}</td>
                <td>${attempt.total_correct_answers}</td>
                <td>${attempt.wrong_answers}</td>
                <td>${attempt.pass_mark}</td>
            `;
            attemptsDetailsContainer.appendChild(row);
        });
    
        // Open the modal using Bootstrap's JavaScript API
        const modal = new bootstrap.Modal(document.getElementById('attempt-details-modal'));
        modal.show();
    }
    

    // Fetch Leaderboard
    function fetchLeaderboard() {
        fetch(`/quiz/leaderboard/${examId}/`, {
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
        leaderboardContainer.innerHTML = ''; // Clear existing rows

        if (data.length === 0) {
            leaderboardContainer.innerHTML = '<tr><td colspan="4" class="text-center">No leaderboard data available.</td></tr>';
            return;
        }

        
        data.forEach((entry, index) => {
            const percentage = entry.total_questions > 0 ? ((entry.score / entry.total_questions) * 100).toFixed(2) : 0;
            const position = index + 1;
            leaderboardContainer.innerHTML += `
                <div class="">
                    <img src="../../../static/images/user_9071610.png" alt="User Icon" class="rounded-circle" width="40" height="40">
                </div>
                <div>
                    <h4 class="m-0">${entry.user}</h4>
                    <small>Position: <span class="text-muted">${position}</span></small><br>
                    <small><span>Top Level</span><br></small>
                    <small>Total Questions: <span class="text-muted">${entry.total_questions}</span></small><br>
                    <small>Total Score: <span class="text-muted">${entry.score}</span></small><br>
                    <small>Percentage: <span class="text-muted">${percentage}%</span></small>
                </div>
            `;
        });
    }

    // Initialize the page
    fetchExamDetails();
    fetchBestAttempts();
    fetchLeaderboard();
});
