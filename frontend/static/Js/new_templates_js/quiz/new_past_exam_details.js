document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    
    // Extract past_exam_id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const pastExamId = window.location.pathname.split('/')[2]; 
    console.log(pastExamId);
    

    const pastExamDetailsUrl = `/quiz/past_exams/?exam_id=${pastExamId}`;
    
    // Function to convert Western numerals to Bengali numerals
    const convertToBengaliNumerals = (number) => {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(number).split('').map(digit => {
            if (digit === '.') {
                return '.'; // Keep decimal point as is
            }
            return bengaliDigits[parseInt(digit)];
        }).join('');
    };

    // Function to format a date string into a readable Bengali format
    const formatBengaliDate = (dateString) => {
        if (!dateString) return 'প্রযোজ্য নয়';
        
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        // Format the date using Bengali locale and options
        const formattedDate = date.toLocaleDateString('bn-BD', options);
        return formattedDate;
    };


    function fetchPastExamDetails() {
        fetch(pastExamDetailsUrl, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                console.log("data", data);
                const title_text = `${data.title}`;
                
                // Populate Past Exam Details
                const titleElement = document.getElementById('past-exam-title')
                titleElement.textContent = title_text;
                titleElement.setAttribute('title', title_text); 
                
                // Update text to Bengali numerals and strings
                document.getElementById('past-exam-total-questions').textContent = convertToBengaliNumerals(data.total_questions);
                document.getElementById('past-exam-total-marks').textContent = convertToBengaliNumerals(data.total_questions);
                document.getElementById('past-exam-negative-marks').textContent = data.negative_marks ? convertToBengaliNumerals(data.negative_marks) : 'প্রযোজ্য নয়';
                document.getElementById('past-exam-duration').textContent = convertToBengaliNumerals(data.duration);
                document.getElementById('past-exam-organization').textContent = data.organization;
                document.getElementById('past-exam-department').textContent = data.department || 'প্রযোজ্য নয়';
                document.getElementById('past-exam-position').textContent = data.position;
                document.getElementById('past-exam-date').textContent = formatBengaliDate(data.exam_date); // Use new formatting function
                document.getElementById('past-exam-duration').textContent = data.duration ? convertToBengaliNumerals(data.duration) : 'প্রযোজ্য নয়';
                document.getElementById('exam-created-by').textContent = data.created_by || 'প্রযোজ্য নয়';
                
                const createdAtElement = document.getElementById('exam-created-at');
                if (data.created_at) {
                    createdAtElement.textContent = formatBengaliDate(data.created_at); // Use new formatting function
                } else {
                    createdAtElement.textContent = 'প্রযোজ্য নয়';
                }
            }
        })
        .catch(error => console.error('Error fetching past exam details:', error));
    }


    // Fetch past exam details and questions on page load
    fetchPastExamDetails();

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

    const read = document.getElementById('read');
    read.addEventListener('click', function() {
        window.location.href = `/past_exam/read/${pastExamId}/`;
    });
});