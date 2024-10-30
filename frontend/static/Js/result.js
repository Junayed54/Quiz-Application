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
            <p><strong>Title:</strong> ${data.title}</p>
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
                <td>${new Date(attempt.timestamp).toLocaleDateString()}</td>
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
        leaderboardContainer.innerHTML = ''; // Clear existing rows

        if (data.length === 0) {
            leaderboardContainer.innerHTML = '<tr><td colspan="4" class="text-center">No leaderboard data available.</td></tr>';
            return;
        }

        data.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.user}</td>
                <td>${entry.cumulative_questions}</td>
                <td>${entry.score}</td>
                
            `;
            leaderboardContainer.appendChild(row);
        });
    }

    // Fetch data on page load
    fetchExamDetails();
    fetchUserAttempts();
    fetchLeaderboard();
});