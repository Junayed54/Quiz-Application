document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    
    // Extract past_exam_id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const pastExamId = window.location.pathname.split('/')[3];  // Ensure the past_exam_id is passed in the URL
    console.log(pastExamId);
    if (!pastExamId || !accessToken) {
        window.location.href = '/login/';
        return;
    }

    const pastExamDetailsUrl = `/quiz/past-exams/${pastExamId}/`;
    
    
    function fetchPastExamDetails() {
        fetch(pastExamDetailsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                console.log(data);
                
                // Populate Past Exam Details
                document.getElementById('past-exam-title').textContent = data.title;
                document.getElementById('past-exam-total-questions').textContent = data.questions_count;
                document.getElementById('past-exam-total-marks').textContent = data.questions_count;
                document.getElementById('past-exam-negative-marks').textContent = data.negative_marks || 'N/A';
                document.getElementById('past-exam-duration').textContent = data.duration;
                document.getElementById('past-exam-organization').textContent = data.organization_name;
                document.getElementById('past-exam-department').textContent = data.department_name || 'N/A';
                document.getElementById('past-exam-position').textContent = data.position_name;
                document.getElementById('past-exam-date').textContent = new Date(data.exam_date).toLocaleDateString();
                document.getElementById('past-exam-duration').textContent = data.duration || 'N/A';
                document.getElementById('past-exam-status').textContent = data.is_published ? 'Published' : 'Unpublished';
            }
        })
        .catch(error => console.error('Error fetching past exam details:', error));
    }

    // function fetchPastExamQuestions() {
    //     fetch(pastExamQuestionsUrl, {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${accessToken}`,
    //         },
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data) {
    //             console.log(data);
    //             const questionList = document.getElementById('past-exam-questions');
    //             questionList.innerHTML = ''; // Clear previous data
    //             data.forEach((question, index) => {
    //                 const optionsHTML = question.options.map(option => `<li>${option.text}</li>`).join('');
    //                 const rowHTML = `
    //                     <tr>
    //                         <td>${index + 1}</td>
    //                         <td>${question.text}</td>
    //                         <td><ul>${optionsHTML}</ul></td>
    //                         <td>${question.options.find(option => option.is_correct)?.text || 'N/A'}</td>
    //                     </tr>
    //                 `;
    //                 questionList.innerHTML += rowHTML;
    //             });
    //         }
    //     })
    //     .catch(error => console.error('Error fetching past exam questions:', error));
    // }

    // Fetch past exam details and questions on page load
    fetchPastExamDetails();
    // fetchPastExamQuestions();

    const startExam = document.getElementById('start-exam-btn');
    startExam.addEventListener('click', function() {
        window.location.href = `/quiz/past_exam_start/${pastExamId}/`;
    });

    const result = document.getElementById('past_result');
    result.addEventListener('click', function() {
        console.log("hello world");
        window.location.href = `/quiz/result/${pastExamId}/`;
    });
});
