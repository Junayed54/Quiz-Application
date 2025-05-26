document.addEventListener('DOMContentLoaded', function() {
    let userId = window.location.href.split('/')[4];

    // --- Model Test Summary Logic ---
    const modelApiUrl = `/quiz/user-exam-summary/${userId}`; // Existing API for model tests

    fetch(modelApiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log("Model Test Summary Data:", data);
        document.getElementById('model-username').textContent = data.username || "User";
        document.getElementById('model-total-attempts').textContent = `${data.total_attempts}`;
        document.getElementById('model-total-passed').textContent = `${data.total_passed}`;
        document.getElementById('model-total-failed').textContent = `${data.total_failed}`;
        document.getElementById('model-total-questions').textContent = `${data.total_questions}`;
        document.getElementById('model-total-answered').textContent = data.total_answered;
        document.getElementById('model-total-unanswered').textContent = data.total_unanswered;
        document.getElementById('model-total-correct-answers').textContent = data.total_correct_answers;
        document.getElementById('model-total-wrong-answers').textContent = data.total_wrong_answers;
        document.getElementById('model-total-marks').textContent = data.total_marks || '0';
        document.getElementById('model-obtain-mark').textContent = data.obtained_marks || '0';
        document.getElementById('model-negative-mark').textContent = data.negative_mark || 'N/A';
        document.getElementById('model-position').textContent = data.position || 'N/A';
    })
    .catch(error => console.error('Error fetching model test summary:', error));

    // --- Past Exam Summary Logic (NEW) ---
    const pastExamApiUrl = `/quiz/user-past-exam-summary/${userId}/`; // **UPDATE THIS TO YOUR ACTUAL PAST EXAM SUMMARY API**

    // Initialize with data for the past exam summary tab when it's active
    const pastExamTabButton = document.getElementById('past-exam-summary-tab');
    pastExamTabButton.addEventListener('shown.bs.tab', function (event) {
        fetch(pastExamApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log("Past Exam Summary Data:", data);
            document.getElementById('past-exam-username').textContent = data.username || "User";
            document.getElementById('past-exam-total-attempts').textContent = `${data.total_attempts}`;
            document.getElementById('past-exam-total-passed').textContent = `${data.total_passed}`;
            document.getElementById('past-exam-total-failed').textContent = `${data.total_failed}`;
            document.getElementById('past-exam-total-questions').textContent = `${data.total_questions}`;
            document.getElementById('past-exam-total-answered').textContent = data.total_answered;
            document.getElementById('past-exam-total-unanswered').textContent = data.total_unanswered;
            document.getElementById('past-exam-total-correct-answers').textContent = data.total_correct_answers;
            document.getElementById('past-exam-total-wrong-answers').textContent = data.total_wrong_answers;
            document.getElementById('past-exam-total-marks').textContent = data.total_marks || '0';
            document.getElementById('past-exam-obtain-mark').textContent = data.obtained_marks || '0';
            document.getElementById('past-exam-negative-mark').textContent = data.negative_mark || 'N/A';
            document.getElementById('past-exam-position').textContent = data.position || 'N/A';
        })
        .catch(error => console.error('Error fetching past exam summary:', error));

        // Call the chart and exam list functions for past exams here
        fetchPastExamAttemptsAndCreateChart('all');
        loadPastExams();
    });
});

// ---

// ### Charting and Exam Attempts for Model Tests

// ```javascript
let modelCorrectAnswersChartInstance; // Define globally to manage Chart instances

document.addEventListener('DOMContentLoaded', function () {
    let user_id = window.location.href.split('/')[4];
    const modelAttemptsApiUrl = `/quiz/attempts/all_attempts/${user_id}/`; // Existing API for model test attempts
    

    function fetchModelDataAndCreateChart(timePeriod = 'all') {
        fetch(`${modelAttemptsApiUrl}?time_period=${timePeriod}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ user_id: user_id })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Model Test Attempts API Response:", data);

            const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
            const correctAnswers = data.map(attempt => attempt.correct_answers);
            const examTitles = data.map(attempt => attempt.exam_title);
            const obtainedMarks = data.map(attempt => attempt.obtained_marks);
            const percentages = data.map(attempt => attempt.percentage);
            const totalQuestions = data.map(attempt => attempt.total_questions);
            const wrongAnswers = data.map(attempt => attempt.wrong_answers);

            const reversedLabels = labels.reverse();
            const reversedCorrectAnswers = correctAnswers.reverse();
            const reversedExamTitles = examTitles.reverse();
            const reversedObtainedMarks = obtainedMarks.reverse();
            const reversedPercentages = percentages.reverse();
            const reversedTotalQuestions = totalQuestions.reverse();
            const reversedWrongAnswers = wrongAnswers.reverse();

            if (reversedLabels.length > 0 && reversedCorrectAnswers.length > 0) {
                createModelCorrectAnswersLineChart(
                    reversedLabels,
                    reversedCorrectAnswers,
                    reversedExamTitles,
                    reversedObtainedMarks,
                    reversedPercentages,
                    reversedTotalQuestions,
                    reversedWrongAnswers
                );
            } else {
                console.warn('No model test attempts data available for the selected time period.');
                // Optionally clear the chart if no data
                if (modelCorrectAnswersChartInstance) {
                    modelCorrectAnswersChartInstance.destroy();
                }
            }
        })
        .catch(error => console.error('Error fetching model test attempts:', error));
    }

    function createModelCorrectAnswersLineChart(labels, correctAnswers, examTitles, obtainedMarks, percentages, totalQuestions, wrongAnswers) {
        const ctx = document.getElementById('modelCorrectAnswersChart').getContext('2d');

        if (modelCorrectAnswersChartInstance) {
            modelCorrectAnswersChartInstance.destroy();
        }

        modelCorrectAnswersChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Correct Answers per Attempt',
                    data: correctAnswers,
                    borderColor: ' #faed26',
                    backgroundColor: 'white',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const index = tooltipItem.dataIndex;
                                const title = examTitles[index];
                                const correct = correctAnswers[index];
                                const marks = obtainedMarks[index];
                                const percentage = percentages[index];
                                const total = totalQuestions[index];
                                const wrong = wrongAnswers[index];
                                return [
                                    `Exam: ${title}`,
                                    `Correct: ${correct}`,
                                    `Marks: ${marks}`,
                                    `Percentage: ${percentage}%`,
                                    `Total Questions: ${total}`,
                                    `Wrong Answers: ${wrong}`,
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
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

    // Initial fetch for 'all' time period for Model Tests
    fetchModelDataAndCreateChart('all');

    const modelRadioButtons = document.querySelectorAll('input[name="modelTimePeriod"]');
    modelRadioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            fetchModelDataAndCreateChart(this.value);
        });
    });
});

async function loadModelExams() {
    try {
        let user_id = window.location.href.split('/')[4];
        const response = await fetch('/quiz/attempts/highest_attempts/', { // Existing API for model test highest attempts
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch model exam attempts.');
        }

        const data = await response.json();
        const examList = document.getElementById('modelExamList'); // Use specific ID for model exams
        examList.innerHTML = '';
        console.log("Model Exams and Attempts:", data);

        data.exams.forEach((exam, index) => {
            const examItem = document.createElement('div');
            examItem.className = 'accordion-item';

            examItem.innerHTML = `
                <h2 class="accordion-header" id="modelHeading${index}">
                    <button class="accordion-button collapsed" type="button" style="background:#B7E0FF;" data-bs-toggle="collapse" data-bs-target="#modelCollapse${index}" aria-expanded="false" aria-controls="modelCollapse${index}">
                        Exam title: ${exam.exam_title}
                    </button>
                </h2>
                <div id="modelCollapse${index}" class="accordion-collapse collapse" aria-labelledby="modelHeading${index}" data-bs-parent="#modelExamList">
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
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Participated: ${exam.unique_participants}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Position: ${exam.highest_attempt.position}</li>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <canvas id="modelAttemptChart${index}" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            examList.appendChild(examItem);

            const collapseElement = document.getElementById(`modelCollapse${index}`);
            collapseElement.addEventListener('shown.bs.collapse', function () {
                viewModelUserAttemptsDetails(user_id, exam.exam_id, index);
            });
        });
    } catch (error) {
        console.error(error);
        alert('Error loading model exams. Please try again.');
    }
}

let modelAttemptChartInstance; // Variable to hold the chart instance for model tests

function viewModelUserAttemptsDetails(userId, examId, index) {
    const accessToken = localStorage.getItem('access_token');
    fetch(`/quiz/attempts/user_attempts/?exam_id=${examId}&user_id=${userId}`, { // Existing API for model test user attempts
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Model User Attempts Details:", data);
        showModelUserAttemptsDetails(data, index);
    })
    .catch(error => console.error('Error fetching model user attempts details:', error));
}

function showModelUserAttemptsDetails(data, index) {
    const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
    const correctData = data.map(attempt => attempt.total_correct_answers);
    const wrongData = data.map(attempt => attempt.wrong_answers);

    const ctx = document.getElementById(`modelAttemptChart${index}`);
    if (!ctx) {
        console.error(`Canvas element with ID modelAttemptChart${index} not found.`);
        return;
    }

    if (modelAttemptChartInstance) {
        modelAttemptChartInstance.destroy();
    }

    modelAttemptChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Correct Answers',
                    data: correctData,
                    backgroundColor: 'rgba(0, 128, 0, 0.6)',
                    borderColor: 'green',
                    borderWidth: 1,
                    barThickness: 20
                },
                {
                    label: 'Wrong Answers',
                    data: wrongData,
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',
                    borderColor: 'red',
                    borderWidth: 1,
                    barThickness: 20
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
}

// Load model exams when the page is loaded
document.addEventListener('DOMContentLoaded', loadModelExams);

// ---

// ### Charting and Exam Attempts for Past Exams (NEW)

// ```javascript
let pastExamCorrectAnswersChartInstance; // Define globally for Past Exam Chart instances

// Function to fetch data and create chart for past exams
function fetchPastExamAttemptsAndCreateChart(timePeriod = 'all') {
    const pastExamAttemptsApiUrl = `/quiz/pastExamAttempts/all_attempts/`; // **UPDATE THIS TO YOUR ACTUAL PAST EXAM ATTEMPTS API**
    let user_id = window.location.href.split('/')[4];

    fetch(`${pastExamAttemptsApiUrl}?time_period=${timePeriod}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ user_id: user_id })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Past Exam Attempts API Response:", data);

        const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
        const correctAnswers = data.map(attempt => attempt.correct_answers);
        const examTitles = data.map(attempt => attempt.exam_title);
        const obtainedMarks = data.map(attempt => attempt.obtained_marks);
        const percentages = data.map(attempt => attempt.percentage);
        const totalQuestions = data.map(attempt => attempt.total_questions);
        const wrongAnswers = data.map(attempt => attempt.wrong_answers);

        const reversedLabels = labels.reverse();
        const reversedCorrectAnswers = correctAnswers.reverse();
        const reversedExamTitles = examTitles.reverse();
        const reversedObtainedMarks = obtainedMarks.reverse();
        const reversedPercentages = percentages.reverse();
        const reversedTotalQuestions = totalQuestions.reverse();
        const reversedWrongAnswers = wrongAnswers.reverse();

        if (reversedLabels.length > 0 && reversedCorrectAnswers.length > 0) {
            createPastExamCorrectAnswersLineChart(
                reversedLabels,
                reversedCorrectAnswers,
                reversedExamTitles,
                reversedObtainedMarks,
                reversedPercentages,
                reversedTotalQuestions,
                reversedWrongAnswers
            );
        } else {
            console.warn('No past exam attempts data available for the selected time period.');
            if (pastExamCorrectAnswersChartInstance) {
                pastExamCorrectAnswersChartInstance.destroy();
            }
        }
    })
    .catch(error => console.error('Error fetching past exam attempts:', error));
}

function createPastExamCorrectAnswersLineChart(labels, correctAnswers, examTitles, obtainedMarks, percentages, totalQuestions, wrongAnswers) {
    const ctx = document.getElementById('pastExamCorrectAnswersChart').getContext('2d');

    if (pastExamCorrectAnswersChartInstance) {
        pastExamCorrectAnswersChartInstance.destroy();
    }

    pastExamCorrectAnswersChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Correct Answers per Attempt',
                data: correctAnswers,
                borderColor: ' #faed26',
                backgroundColor: 'white',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const title = examTitles[index];
                            const correct = correctAnswers[index];
                            const marks = obtainedMarks[index];
                            const percentage = percentages[index];
                            const total = totalQuestions[index];
                            const wrong = wrongAnswers[index];
                            return [
                                `Exam: ${title}`,
                                `Correct: ${correct}`,
                                `Marks: ${marks}`,
                                `Percentage: ${percentage}%`,
                                `Total Questions: ${total}`,
                                `Wrong Answers: ${wrong}`,
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
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

const pastExamRadioButtons = document.querySelectorAll('input[name="pastExamTimePeriod"]');
pastExamRadioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
        fetchPastExamAttemptsAndCreateChart(this.value);
    });
});

async function loadPastExams() {
    try {
        let user_id = window.location.href.split('/')[5];
        const response = await fetch('/quiz/pastExamAttempts/highest_attempts/', { // **UPDATE THIS TO YOUR ACTUAL PAST EXAM HIGHEST ATTEMPTS API**
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user_id })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch past exam attempts.');
        }

        const data = await response.json();
        const examList = document.getElementById('pastExamList'); // Use specific ID for past exams
        examList.innerHTML = '';
        console.log("Past Exams and Attempts:", data);

        data.exams.forEach((exam, index) => {
            const examItem = document.createElement('div');
            examItem.className = 'accordion-item';
            
            examItem.innerHTML = `
                <h2 class="accordion-header" id="pastExamHeading${index}">
                    <button class="accordion-button collapsed" type="button" style="background:#B7E0FF;" data-bs-toggle="collapse" data-bs-target="#pastExamCollapse${index}" aria-expanded="false" aria-controls="pastExamCollapse${index}">
                        Exam title: ${exam.exam_title}
                    </button>
                </h2>
                <div id="pastExamCollapse${index}" class="accordion-collapse collapse" aria-labelledby="pastExamHeading${index}" data-bs-parent="#pastExamList">
                    <div class="accordion-body">
                        <div class="row">
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Total questions: ${exam.total_questions}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Answered: ${exam.highest_attempt.answered_questions}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Total Correct Answers: ${exam.highest_attempt.correct_answers}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Wrong Answers: ${exam.highest_attempt.wrong_answers}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Passed Mark:  N/A</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Attempt Time: ${new Date(exam.highest_attempt.attempt_time).toLocaleString()}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Participated: ${exam.unique_participants}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Position: ${exam.highest_attempt.position}</li>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <canvas id="pastExamAttemptChart${index}" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            examList.appendChild(examItem);

            const collapseElement = document.getElementById(`pastExamCollapse${index}`);
            collapseElement.addEventListener('shown.bs.collapse', function () {
                console.log("hello", user_id, exam.id);
                viewPastExamUserAttemptsDetails(user_id, exam.past_exam_id, index);
            });
        });
    } catch (error) {
        console.error(error);
        alert('Error loading past exams. Please try again.');
    }
}

let pastExamAttemptChartInstance; // Variable to hold the chart instance for past exams

function viewPastExamUserAttemptsDetails(userId, examId, index) {
    const accessToken = localStorage.getItem('access_token');
    fetch(`/quiz/pastExamAttempts/user_attempts/?past_exam_id=${examId}&user_id=${userId}`, { // **UPDATE THIS TO YOUR ACTUAL PAST EXAM USER ATTEMPTS API**
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Past Exam User Attempts Details:", data);
        showPastExamUserAttemptsDetails(data, index);
    })
    .catch(error => console.error('Error fetching past exam user attempts details:', error));
}

function showPastExamUserAttemptsDetails(data, index) {
    const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
    const correctData = data.map(attempt => attempt.correct_answers);
    const wrongData = data.map(attempt => attempt.wrong_answers);

    const ctx = document.getElementById(`pastExamAttemptChart${index}`);
    if (!ctx) {
        console.error(`Canvas element with ID pastExamAttemptChart${index} not found.`);
        return;
    }

    if (pastExamAttemptChartInstance) {
        pastExamAttemptChartInstance.destroy();
    }

    pastExamAttemptChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Correct Answers',
                    data: correctData,
                    backgroundColor: 'rgba(0, 128, 0, 0.6)',
                    borderColor: 'green',
                    borderWidth: 1,
                    barThickness: 20
                },
                {
                    label: 'Wrong Answers',
                    data: wrongData,
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',
                    borderColor: 'red',
                    borderWidth: 1,
                    barThickness: 20
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
}


// Quistions (Consider if this should be separate for each tab or combined)
document.addEventListener("DOMContentLoaded", function () {
    // Only fetch for Model Test initially. You'll need to decide if past exam questions are separate.
    fetchSubmittedQuestions('model');
});

// Fetch submitted questions and update UI
function fetchSubmittedQuestions(typeOfExam) { // Add typeOfExam parameter
    let user_id = window.location.href.split('/')[5];
    let apiEndpoint = '';

    // Determine the API endpoint based on the type of exam (model or past exam)
    if (typeOfExam === 'model') {
        apiEndpoint = '/quiz/user-answers/all-submitted-questions/'; // Existing API for model tests
    } else if (typeOfExam === 'past-exam') {
        apiEndpoint = '/quiz/past-exam-user-answers/all-submitted-questions/'; // **UPDATE THIS TO YOUR ACTUAL PAST EXAM QUESTIONS API**
    } else {
        console.error("Invalid exam type for fetching questions.");
        return;
    }

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({ user_id: user_id })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log(`Workspaceed ${typeOfExam} questions data:`, data);
        updateQuestionCounts(data, typeOfExam);
        setupClickListeners(data, typeOfExam);
    })
    .catch(error => console.error(`Error fetching ${typeOfExam} questions:`, error));
}

// Update counts of questions
function updateQuestionCounts(data, typeOfExam) {
    const prefix = typeOfExam === 'model' ? 'model-' : 'past-exam-';

    document.getElementById(`${prefix}total-questions`).innerText = data.submitted_questions.length;
    document.getElementById(`${prefix}total-answered`).innerText = data.submitted_questions.length;
    document.getElementById(`${prefix}total-correct-answers`).innerText = data.correct_answers.length;
    document.getElementById(`${prefix}total-wrong-answers`).innerText = data.wrong_answers.length;
    // Assuming 'total-unanswered' might also be present in your HTML, add it here if needed
    // document.getElementById(`${prefix}total-unanswered`).innerText = data.total_unanswered;
}

// Set up click listeners for question rows
function setupClickListeners(data, typeOfExam) {
    // Remove existing listeners to prevent duplicates
    document.querySelectorAll('.clickable-row').forEach(row => {
        row.replaceWith(row.cloneNode(true)); // Clones the node and replaces it, effectively removing old event listeners
    });

    document.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            let questionsToDisplay = [];

            switch (type) {
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
            displayQuestions(questionsToDisplay, type, typeOfExam); // Pass typeOfExam
        });
    });
}

const itemsPerPage = 5;
let modelCurrentPage = 1;
let modelGlobalQuestions = [];
let modelGlobalType = '';

let pastExamCurrentPage = 1;
let pastExamGlobalQuestions = [];
let pastExamGlobalType = '';

function displayQuestions(questions = [], type, typeOfExam) {
    let currentPageVar, globalQuestionsVar, globalTypeVar;

    if (typeOfExam === 'model') {
        currentPageVar = modelCurrentPage;
        globalQuestionsVar = questions; // Always update globalQuestionsVar for the specific tab
        modelGlobalQuestions = questions;
        modelGlobalType = type;
        globalTypeVar = modelGlobalType;
    } else if (typeOfExam === 'past-exam') {
        currentPageVar = pastExamCurrentPage;
        globalQuestionsVar = questions;
        pastExamGlobalQuestions = questions;
        pastExamGlobalType = type;
        globalTypeVar = pastExamGlobalType;
    } else {
        console.error("Invalid exam type for displaying questions.");
        return;
    }

    const questionListContainer = document.getElementById(typeOfExam === 'model' ? "modelQuestionListContainer" : "pastExamQuestionListContainer"); // Assuming separate containers
    const chart = document.getElementById(typeOfExam === 'model' ? 'modelChart' : 'pastExamChart'); // Assuming separate charts
    const questions_show = document.getElementById(typeOfExam === 'model' ? 'modelQuestions' : 'pastExamQuestions'); // Assuming separate question display areas

    if (chart) chart.classList.add('d-none');
    if (questions_show) questions_show.classList.remove('d-none');
    if (questionListContainer) questionListContainer.innerHTML = '';

    if (globalQuestionsVar.length === 0) {
        if (questionListContainer) questionListContainer.innerHTML = '<p>No questions to display.</p>';
        return;
    }

    const startIndex = (currentPageVar - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuestions = globalQuestionsVar.slice(startIndex, endIndex);

    paginatedQuestions.forEach((item, index) => {
        const { question, selected_option, is_correct } = item;
        const options = question.options.map(opt => {
            let className = 'option-item';
            let bgColor = 'bg-light';

            if (globalTypeVar === 'wrong' && selected_option && opt.id === selected_option.id) {
                className += ' text-danger';
                bgColor = 'bg-warning';
            }
            if (opt.is_correct) {
                className += ' text-white';
                bgColor = 'bg-success';
            }
            return `
                <li class="list-group-item ${className} ${bgColor}">
                    ${opt.text}
                </li>
            `;
        }).join('');

        const questionCard = `
            <div class="card mb-2">
                <div class="card-header">
                    <h5>Question ${startIndex + index + 1}: ${question.text}</h5>
                </div>
                <div class="card-body">
                    <p><strong>Your Answer:</strong> ${selected_option ? selected_option.text : "Not answered"}</p>
                    <p><strong>Status:</strong> <span class="${is_correct ? 'text-success' : 'text-danger'}">
                        ${is_correct ? 'Correct' : 'Wrong'}
                    </span></p>
                    <p><strong>Options:</strong></p>
                    <ul class="list-group list-group-horizontal row-options">
                        ${options}
                    </ul>
                </div>
            </div>
        `;
        if (questionListContainer) questionListContainer.insertAdjacentHTML('beforeend', questionCard);
    });

    updatePaginationControls(globalQuestionsVar.length, typeOfExam);
}

function updatePaginationControls(totalItems, typeOfExam) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const prefix = typeOfExam === 'model' ? 'model-' : 'past-exam-';

    const prevButton = document.getElementById(`${prefix}prevPage`);
    const nextButton = document.getElementById(`${prefix}nextPage`);
    const pageInfo = document.getElementById(`${prefix}pageInfo`);

    let currentPageVar = (typeOfExam === 'model' ? modelCurrentPage : pastExamCurrentPage);

    if (prevButton) prevButton.disabled = currentPageVar === 1;
    if (nextButton) nextButton.disabled = currentPageVar === totalPages;
    if (pageInfo) pageInfo.innerText = `Page ${currentPageVar} of ${totalPages}`;
}

function changePage(direction, typeOfExam) {
    if (typeOfExam === 'model') {
        modelCurrentPage += direction;
        displayQuestions(modelGlobalQuestions, modelGlobalType, 'model');
    } else if (typeOfExam === 'past-exam') {
        pastExamCurrentPage += direction;
        displayQuestions(pastExamGlobalQuestions, pastExamGlobalType, 'past-exam');
    }
}

// Add pagination controls to the respective sections in HTML and add data-type to rows
// You'll need to manually add these to your HTML, or dynamically inject them from JS as you did previously.
// Example for Model tab:
/*
<div id="modelQuestions" class="d-none">
    <div id="modelQuestionListContainer"></div>
    <div class="pagination-container mt-4">
        <button id="model-prevPage" class="btn btn-secondary" onclick="changePage(-1, 'model')" disabled>Previous</button>
        <span id="model-pageInfo" class="mx-2">Page 1</span>
        <button id="model-nextPage" class="btn btn-secondary" onclick="changePage(1, 'model')">Next</button>
    </div>
</div>
*/

// Example for Past Exam tab:
/*
<div id="pastExamQuestions" class="d-none">
    <div id="pastExamQuestionListContainer"></div>
    <div class="pagination-container mt-4">
        <button id="past-exam-prevPage" class="btn btn-secondary" onclick="changePage(-1, 'past-exam')" disabled>Previous</button>
        <span id="past-exam-pageInfo" class="mx-2">Page 1</span>
        <button id="past-exam-nextPage" class="btn btn-secondary" onclick="changePage(1, 'past-exam')">Next</button>
    </div>
</div>
*/

// Ensure your clickable rows have `data-type` attributes for the question filtering
// For model summary:
/*
<tr class="clickable-row" data-type="answered"><th>Answers</th><td id="model-total-answered">0</td></tr>
<tr class="clickable-row" data-type="correct"><th>Right Ans</th><td id="model-total-correct-answers">0</td></tr>
<tr class="clickable-row" data-type="wrong"><th>Wrong Ans</th><td id="model-total-wrong-answers">0</td></tr>
*/

// For past exam summary:
/*
<tr class="clickable-row" data-type="answered"><th>Answers</th><td id="past-exam-total-answered">0</td></tr>
<tr class="clickable-row" data-type="correct"><th>Right Ans</th><td id="past-exam-total-correct-answers">0</td></tr>
<tr class="clickable-row" data-type="wrong"><th>Wrong Ans</th><td id="past-exam-total-wrong-answers">0</td></tr>
*/