document.addEventListener('DOMContentLoaded', function() {
    // URL to the API endpoint
    const apiUrl = '/quiz/user-exam-summary/';
    
    // Fetch data from API
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Use the JWT token if required
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        // Populate data into HTML using Vanilla JavaScript
        document.getElementById('username').textContent = data.username || "User";
        document.getElementById('total-attempts').textContent = `${data.total_attempts}`;
        document.getElementById('total-passed').textContent = `${data.total_passed}`;
        document.getElementById('total-failed').textContent = `${data.total_failed}`;
        const elements = document.getElementsByClassName('total-question');
        for (let element of elements) {
            element.textContent = `${data.total_questions}`;
        }
        //.textContent = `${data.total_questions}`;
        document.getElementById('total-answered').textContent = data.total_answered;
        document.getElementById('total-unanswered').textContent = data.total_unanswered;
        document.getElementById('total-correct-answers').textContent = data.total_correct_answers;
        document.getElementById('total-wrong-answers').textContent = data.total_wrong_answers;
    })
    .catch(error => console.error('Error fetching exam summary:', error));


    
});


// document.addEventListener('DOMContentLoaded', function() {
//     const apiUrl = '/quiz/user-exam-summary/';

//     fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         const examTitles = [];
//         const correctAnswers = [];

//         data.forEach(attempt => {
//             examTitles.push(attempt.exam.title); // Adjust based on your data structure
//             correctAnswers.push(attempt.total_correct_answers);
//         });

//         console.log('Exam Titles:', examTitles);
//         console.log('Correct Answers:', correctAnswers);

//         if (examTitles.length > 0 && correctAnswers.length > 0) {
//             createCorrectAnswersLineChart(examTitles, correctAnswers);
//         } else {
//             console.error('No exam attempts data available for chart.');
//         }
//     })
//     .catch(error => console.error('Error fetching exam attempts:', error));
// });

// function createCorrectAnswersLineChart(examTitles, correctAnswers) {
//     const ctx = document.getElementById('correctAnswersChart').getContext('2d');
//     new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: examTitles,
//             datasets: [{
//                 label: 'Total Correct Answers per Exam',
//                 data: correctAnswers,
//                 backgroundColor: 'rgba(0, 123, 255, 0.2)',
//                 borderColor: 'rgba(0, 123, 255, 1)',
//                 borderWidth: 2,
//                 tension: 0.4
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     title: {
//                         display: true,
//                         text: 'Total Correct Answers'
//                     }
//                 },
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Exams'
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: true,
//                     position: 'top',
//                 }
//             }
//         }
//     });
// }



// Function to create the line chart for correct answers
document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = '/quiz/attempts/all_attempts/';

    // Fetch data and update chart based on the selected time period
    function fetchDataAndCreateChart(timePeriod = 'all') {
        fetch(`${apiUrl}?time_period=${timePeriod}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);

            // Extracting labels, correct answers, and titles for tooltips
            const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
            const correctAnswers = data.map(attempt => attempt.total_correct_answers);
            const examTitles = data.map(attempt => attempt.exam__title);

            if (labels.length > 0 && correctAnswers.length > 0) {
                createCorrectAnswersLineChart(labels, correctAnswers, examTitles);
            } else {
                console.error('No exam attempts data available for the selected time period.');
            }
        })
        .catch(error => console.error('Error fetching exam attempts:', error));
    }

    // Initialize the line chart with tooltips showing exam titles
    function createCorrectAnswersLineChart(labels, data, examTitles) {
        const ctx = document.getElementById('correctAnswersChart').getContext('2d');

        // Destroy previous chart instance if it exists
        if (window.correctAnswersChart instanceof Chart) {
            window.correctAnswersChart.destroy();
        }

        window.correctAnswersChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Correct Answers per Attempt',
                    data: data,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Customize tooltip to include the exam title
                            label: function(tooltipItem) {
                                const index = tooltipItem.dataIndex;
                                const title = examTitles[index];
                                const correctAnswers = tooltipItem.raw;
                                return `Exam: ${title}, Correct Answers: ${correctAnswers}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Attempt Date'
                        },
                        
                        reverse: true
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Correct Answers'
                        }
                    }
                },
                responsive: true
            }
        });
    }

    // Initial fetch for 'all' time period
    fetchDataAndCreateChart('all');

    // Add event listeners for the time period radio buttons
    const radioButtons = document.getElementsByName('timePeriod');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            fetchDataAndCreateChart(this.value);
        });
    });
});





async function loadExams() {
    try {
        const response = await fetch('/quiz/attempts/highest_attempts/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,  // Add authentication token if needed
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch exam attempts.');
        }

        const data = await response.json();
        const examList = document.getElementById('examList');
        examList.innerHTML = ''; // Clear previous content
        console.log(data);
        data.exams.forEach((exam, index) => {
            const examItem = document.createElement('div');
            examItem.className = 'accordion-item';

            // Exam Header with Toggle Button
            examItem.innerHTML = `
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button collapsed bg-secondary text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        Exam title: ${exam.exam_title}
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#examList">
                    <div class="accordion-body">
                        <div class="row">
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Total questions: ${exam.total_questions}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Answered: ${exam.highest_attempt.answered}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Total Correct Answers: ${exam.highest_attempt.total_correct_answers}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Wrong Answers: ${exam.highest_attempt.wrong_answers}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Passed Mark: ${exam.passed_marks}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Attempt Time: ${new Date(exam.highest_attempt.attempt_time).toLocaleString()}</li>
                            </div>
                        </div>
                    </div>


                </div>
            `;

            // Append the exam item to the exam list
            examList.appendChild(examItem);
        });
    } catch (error) {
        console.error(error);
        alert('Error loading exams. Please try again.');
    }
}

// Load exams when the page is loaded
document.addEventListener('DOMContentLoaded', loadExams);


//Quistions
document.addEventListener("DOMContentLoaded", function () {
    fetchSubmittedQuestions();
});

// Fetch submitted questions and update UI
function fetchSubmittedQuestions() {
    fetch('/quiz/user-answers/all-submitted-questions/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log("Fetched data:", data);
        
        updateQuestionCounts(data);
        setupClickListeners(data);
    })
    .catch(error => console.error('Error fetching questions:', error));
}

// Update counts of questions
function updateQuestionCounts(data) {
    document.getElementById('total-questions').innerText = data.submitted_questions.length;
    document.getElementById('total-answered').innerText = data.submitted_questions.length;
    document.getElementById('total-correct-answers').innerText = data.correct_answers.length;
    document.getElementById('total-wrong-answers').innerText = data.wrong_answers.length;
}

// Set up click listeners for question rows
function setupClickListeners(data) {
    document.querySelectorAll('.question-row').forEach(row => {
        row.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            let questionsToDisplay = [];

            // Determine which questions to display
            switch (type) {
                case 'all':
                case 'answered':
                    questionsToDisplay = data.submitted_questions;
                    break;
                case 'correct':
                    questionsToDisplay = data.correct_answers;
                    break;
                case 'wrong':
                    questionsToDisplay = data.wrong_answers;
                    break;
                default:
                    console.error("Unknown question type:", type);
                    return;
            }

            displayQuestions(questionsToDisplay, type);
        });
    });
}

// Display questions in the container with options
function displayQuestions(questions, type) {
    const questionListContainer = document.getElementById("questionListContainer");
    const chart = document.getElementById('chart');
    chart.classList.add('d-none');
    const questions_show = document.getElementById('questions');
    questions_show.classList.remove('d-none');
    questionListContainer.innerHTML = '';

    if (questions.length === 0) {
        questionListContainer.innerHTML = '<p>No questions to display.</p>';
        return;
    }

    questions.forEach(item => {
        const { question, selected_option, is_correct } = item;
        const options = question.options.map(opt => {
            let className = '';
            // Highlight selected option in red if wrong
            if (type === 'wrong' && opt.id === selected_option.id) {
                className = 'text-danger'; // User's wrong answer
            }
            // Highlight correct answer in green
            if (opt.is_correct) {
                className = 'text-success'; // Correct answer
            }
            return `
                <li class="list-group-item ${className}">
                    ${opt.text}
                </li>
            `;
        }).join('');

        const questionCard = `
            <div class="card mb-2">
                <div class="card-header">
                    <h5>${question.text}</h5>
                </div>
                <div class="card-body">
                    <p><strong>Your Answer:</strong> ${selected_option.text || "Not answered"}</p>
                    <p><strong>Status:</strong> <span class="${is_correct ? 'text-success' : 'text-danger'}">
                        ${is_correct ? 'Correct' : 'Wrong'}
                    </span></p>
                    <p><strong>Options:</strong></p>
                    <ul class="list-group">
                        ${options}
                    </ul>
                </div>
            </div>
        `;

        questionListContainer.insertAdjacentHTML('beforeend', questionCard);
    });
}
