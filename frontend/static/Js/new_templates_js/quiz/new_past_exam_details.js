document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    
    // Extract past_exam_id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const pastExamId = window.location.pathname.split('/')[2];  // Ensure the past_exam_id is passed in the URL
    console.log(pastExamId);
    

    const pastExamDetailsUrl = `/quiz/past_exams/?exam_id=${pastExamId}`;
    
    
    function fetchPastExamDetails() {
        fetch(pastExamDetailsUrl, {
            method: 'GET',
            
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                console.log(data);
               const title_text = `${data.title}`;
                // Populate Past Exam Details
                const titleElement = document.getElementById('past-exam-title')
                titleElement.textContent = title_text;

                titleElement.setAttribute('title', title_text); 
                document.getElementById('past-exam-total-questions').textContent = data.total_questions;
                document.getElementById('past-exam-total-marks').textContent = data.total_questions;
                document.getElementById('past-exam-negative-marks').textContent = data.negative_marks || 'N/A';
                document.getElementById('past-exam-duration').textContent = data.duration;
                document.getElementById('past-exam-organization').textContent = data.organization;
                document.getElementById('past-exam-department').textContent = data.department || 'N/A';
                document.getElementById('past-exam-position').textContent = data.position;
                document.getElementById('past-exam-date').textContent = new Date(data.exam_date).toLocaleDateString();
                document.getElementById('past-exam-duration').textContent = data.duration || 'N/A';
                document.getElementById('past-exam-status').textContent = data.is_published ? 'Published' : 'Unpublished';
            }
        })
        .catch(error => console.error('Error fetching past exam details:', error));
    }


    // Fetch past exam details and questions on page load
    fetchPastExamDetails();
    // fetchPastExamQuestions();

    const startExam = document.getElementById('start-exam-btn');
    startExam.addEventListener('click', function() {
        window.location.href = `/quiz/past_exam_start/${pastExamId}/`;
    });

    const result = document.getElementById('past_result');
    result.addEventListener('click', function() {
        window.location.href = `/prev_result/${pastExamId}/`;
    });

    const leaderboard = document.getElementById('leaderboard');
    leaderboard.addEventListener('click', function() {
        window.location.href = `/past-exam/leaderboard/${pastExamId}/`;
    });
});
