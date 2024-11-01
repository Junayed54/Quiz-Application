document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3]; // Replace with the actual exam ID
    const accessToken = localStorage.getItem('access_token'); // Assumes the token is stored in local storage
    
    if (!accessToken) {
        alert('You must be logged in to view this page.');
        window.location.href = '/login/';
        return;
    }

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
        console.log(data);
        const examDetails = document.getElementById('exam-details');
        examDetails.innerHTML = `
            <h3>${data.title}</h3>
        `;
    }

    function fetchUserAttempts() {
        fetch(`/quiz/attempts/user_attempts/?exam_id=${examId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => renderUserAttempts(data))
        .catch(error => console.error('Error fetching user attempts:', error));
    }

    function renderUserAttempts(data) {
        console.log(data);
        const attemptsContainer = document.getElementById('user-attempts');
        attemptsContainer.innerHTML = ''; // Clear existing rows

        if (data.length === 0) {
            attemptsContainer.innerHTML = '<tr><td colspan="3" class="text-center">No attempts yet.</td></tr>';
            return;
        }

        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${attempt.user_name ?? 'N/A'}</td>
                <td>${attempt.total_questions ?? 'N/A'}</td>
                <td>${attempt.answered ?? 'N/A'}</td>
                <td>${attempt.total_correct_answers ?? 'N/A'}</td>
                <td>${attempt.wrong_answers ?? 'N/A'}</td>
                <td>${attempt.pass_mark ?? 'N/A'}</td>

            `;
            attemptsContainer.appendChild(row);
        });
    }

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
        console.log("data", data);
        const leaderboardContainer = document.getElementById('leaderboard');
        leaderboardContainer.addEventListener("click", function() {
            window.location.href = "/quiz/user_summary/";
        });
        leaderboardContainer.innerHTML = ''; // Clear existing rows

        if (data.length === 0) {
            leaderboardContainer.innerHTML = '<tr><td colspan="4" class="text-center">No leaderboard data available.</td></tr>';
            return;
        }

        data.forEach((entry, index) => {
            // Create the card structure
            // const card = document.createElement('div');
            // card.className = 'list-group-item d-flex align-items-center border-0';
            const percentage = entry.total_questions > 0 ? ((entry.score / entry.total_questions) * 100).toFixed(2) : 0;
            const position = index + 1;
            // Define the inner HTML with icon and user data
            leaderboardContainer.innerHTML = `
                <div class="">
                    <img src="../../../static/images/user_9071610.png" alt="User Icon" class="rounded-circle" width="40" height="40">
                </div>
                <div>
                    <h4 class="m-0">${entry.user}</h4>
                    <small>Position: <span class="text-muted">${position}</span></small><br>
                    <small><span>Top Level</span><br></small>
                    <small>Total Questions: <span class="text-muted">${entry.total_questions}</span></small><br>
                    <small>Total Score: <span class="text-muted">${entry.score}</span></small>
                    <small>Percentage: <span class="text-muted">${percentage}%</span></small>
                </div>
            `;
        
            // Append the card to the leaderboard container
            // leaderboardContainer.appendChild(card);
        });
    }

    // Fetch data on page load
    fetchExamDetails();
    fetchUserAttempts();
    fetchLeaderboard();
});