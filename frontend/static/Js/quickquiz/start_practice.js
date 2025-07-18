// document.addEventListener('DOMContentLoaded', function () {
//     const accessToken = localStorage.getItem('access_token');
//     const username = localStorage.getItem('username');
//     const phoneNumber = localStorage.getItem('phone_number');
//     // showResult(10, 6);
//     if (accessToken) {
//         fetchSubjects();
//     } else if (!username || !phoneNumber) {
//         showUserModal(); // Prompt for user details
//         // fetchSubjects();
//     } else {
//         fetchSubjects(); // Continue if user data is stored
//     }
// });

// // Show user modal (no changes needed here for UI, but keeping it for completeness)
// function showUserModal() {
//     const modalHTML = `
//         <div id="userModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//              background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
//             <div style="background: white; padding: 30px; border-radius: 8px; max-width: 400px; width: 90%;">
//                 <h4>Enter Your Details</h4>
//                 <form id="userForm">
//                     <input type="text" id="usernameInput" placeholder="Enter your name" class="form-control my-2" required />
//                     <input type="text" id="phoneInput" placeholder="Enter your phone number" class="form-control my-2" required />
//                     <button type="submit" class="btn btn-primary w-100 mt-2">Continue</button>
//                 </form>
//             </div>
//         </div>
//     `;
//     document.body.insertAdjacentHTML('beforeend', modalHTML);

//     const userForm = document.getElementById('userForm');
//     userForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const username = document.getElementById('usernameInput').value.trim();
//         const phone = document.getElementById('phoneInput').value.trim();
//         if (!username || !phone) {
//             alert("Please fill in all fields.");
//             return;
//         }

//         localStorage.setItem('username', username);
//         localStorage.setItem('phone_number', phone);
//         document.getElementById('userModal').remove();
//         fetchSubjects();
//     });
// }

// // Fetch subjects (no changes needed here for UI)
// function fetchSubjects() {
//     fetch('/api/subjects/')
//         .then(res => res.json())
//         .then(subjects => {
//             if (Array.isArray(subjects) && subjects.length > 0) {
//                 renderSubjectTabs(subjects);
//                 fetchQuestions(subjects[0].id); // Fetch questions for the first subject
//             } else {
//                 document.getElementById('subjectTabs').innerHTML = '<li class="nav-item">No subjects found.</li>';
//                 document.getElementById('question-container').innerHTML = '<p class="text-white text-center">No questions to display for this subject.</p>';
//                 // Hide navigation buttons if no questions
//                 document.getElementById('prev-btn').style.display = 'none';
//                 document.getElementById('next-btn').style.display = 'none';
//                 document.getElementById('submit-button').style.display = 'none';
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching subjects:', error);
//             document.getElementById('question-container').innerHTML = '<p class="text-danger text-center">Error loading subjects. Please try again later.</p>';
//             document.getElementById('prev-btn').style.display = 'none';
//             document.getElementById('next-btn').style.display = 'none';
//             document.getElementById('submit-button').style.display = 'none';
//         });
// }

// // Render subject tabs (dynamically creates buttons)
// function renderSubjectTabs(subjects) {
//     const tabContainer = document.getElementById('subjectTabs');
//     tabContainer.innerHTML = '';

//     subjects.forEach((subject, index) => {
//         const isActive = index === 0 ? 'active' : '';
//         const isSelected = index === 0 ? 'true' : 'false';

//         const tab = `
//             <li class="nav-item" role="presentation">
//                 <button
//                     class="nav-link ${isActive}"
//                     id="subject-tab-${subject.id}"
//                     data-bs-toggle="tab"
//                     type="button"
//                     role="tab"
//                     aria-selected="${isSelected}"
//                     onclick="fetchQuestions(${subject.id})"
//                 >${subject.name}</button>
//             </li>
//         `;
//         tabContainer.insertAdjacentHTML('beforeend', tab);
//     });
// }

// // Timer utilities
// let questions = [];
// let currentIndex = 0;
// let selectedAnswers = {};
// let questionDurations = {};
// let quizStartTime;
// let perQuestionStartTime;
// let timerInterval = null;
// let total_questions = null;

// const questionContainer = document.getElementById('question-container');
// const timerDisplay = document.getElementById('quiz-timer');
// const prevButton = document.getElementById('prev-btn');
// const quizButtons = document.getElementById('quiz-buttons');
// const nextButton = document.getElementById('next-btn');
// const submitButton = document.getElementById('submit-button');

// function formatTime(seconds) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
// }

// function startTimer() {
//     stopTimer(); // Clear any existing timer before starting a new one
//     quizStartTime = new Date(); // Reset quiz start time on new quiz/subject
//     perQuestionStartTime = new Date(); // Reset per question timer
//     timerInterval = setInterval(() => {
//         const elapsed = Math.floor((new Date() - quizStartTime) / 1000);
//         if (timerDisplay) {
//             timerDisplay.textContent = formatTime(elapsed); // Removed "⏱️ Time Spent: "
//         }
//     }, 1000);
// }

// function stopTimer() {
//     clearInterval(timerInterval);
// }

// // Fetch questions with authorization
// async function fetchQuestions(subjectId) {
//     // Reset state when fetching new questions for a subject
//     questions = [];
//     currentIndex = 0;
//     selectedAnswers = {};
//     questionDurations = {};
//     total_questions = 0; // Reset total questions
//     updateProgressBar(0, 0); // Reset progress bar
//     timerDisplay.textContent = '00:00'; // Reset timer display
//     stopTimer(); // Stop any active timer

//     questionContainer.innerHTML = '<p class="text-white text-center">Loading questions...</p>'; // Show loading message
//     prevButton.style.display = 'none';
//     nextButton.style.display = 'none';
//     submitButton.style.display = 'none';

//     try {
//         const response = await fetch('/api/start-practice/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ subject_id: subjectId })
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to fetch questions');
//         }

//         const data = await response.json();
//         questions = data.questions;
//         total_questions = questions.length;

//         if (questions.length > 0) {
//             renderQuestion(currentIndex);
//             startTimer();
//         } else {
//             questionContainer.innerHTML = '<p class="text-white text-center">No questions available for this subject.</p>';
//             prevButton.style.display = 'none';
//             nextButton.style.display = 'none';
//             submitButton.style.display = 'none';
//         }
//     } catch (error) {
//         console.error('Error fetching questions:', error);
//         questionContainer.innerHTML = `<p class="text-danger text-center">Error: ${error.message}</p>`;
//         stopTimer();
//         prevButton.style.display = 'none';
//         nextButton.style.display = 'none';
//         submitButton.style.display = 'none';
//     }
// }

// // Progress bar
// function updateProgressBar(currentQuestionNumber, totalQuestions) {
//     const percentage = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
//     const progressBar = document.getElementById('quiz-progress-bar');
//     if (progressBar) {
//         progressBar.style.width = percentage + '%';
//         progressBar.setAttribute('aria-valuenow', percentage);
//     }
// }

// // Render a question - DYNAMICALLY CREATES QUESTION AND OPTIONS
// function renderQuestion(index) {
//     if (index < 0 || index >= questions.length) {
//         return; // Invalid index
//     }

//     // Time tracking for previous question
//     if (questions[currentIndex] && currentIndex !== index) { // Only track if moving from a valid question
//         const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
//         const prevQuestionId = questions[currentIndex].id;
//         questionDurations[prevQuestionId] = (questionDurations[prevQuestionId] || 0) + duration;
//     }
//     perQuestionStartTime = new Date(); // Reset for current question

//     currentIndex = index;
//     const q = questions[currentIndex];
//     const questionNumber = currentIndex + 1;

//     updateProgressBar(questionNumber, total_questions);

//     let optionsHTML = '';
//     const optionLetters = ['A', 'B', 'C', 'D'];

//     q.options.forEach((opt, i) => {
//         const isSelected = String(selectedAnswers[q.id]) === String(opt.id);

//         optionsHTML += `
//             <div class="option-wrapper ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}" data-question-id="${q.id}">
//                 <span class="option-letter">${optionLetters[i]}</span>
//                 <span class="option-text">
//                     ${opt.text ? opt.text : `<img src="${opt.image}" alt="Option Image" class="img-fluid" style="max-height: 80px;">`}
//                 </span>
//             </div>
//         `;
//     });

//     const questionTextContent = q.text ? `<div style="text-align: center;"><h2 class="question-text">${q.text}</h2></div>` : '';
//     const questionImageContent = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

//     // Inject only the question and options into #question-container
//     questionContainer.innerHTML = `
//         <small class="question-meta">Question ${questionNumber} of ${total_questions}</small>
//         ${questionTextContent}
//         ${questionImageContent}
//         <div id="options-list" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
//             ${optionsHTML}
//         </div>
//     `;

//     // Option selection logic
//     const optionWrappers = questionContainer.querySelectorAll('.option-wrapper'); // Query within questionContainer
//     optionWrappers.forEach(wrapper => {
//         wrapper.addEventListener('click', () => {
//             const currentQuestionId = wrapper.dataset.questionId;
//             const selectedOptionId = wrapper.dataset.optionId;

//             // Remove 'selected' class from all options for the current question
//             questionContainer.querySelectorAll('.option-wrapper').forEach(w => {
//                 w.classList.remove('selected');
//             });

//             // Add 'selected' class to the clicked option
//             wrapper.classList.add('selected');
//             selectedAnswers[currentQuestionId] = selectedOptionId;
//         });
//     });

//     // Update navigation buttons' visibility and click handlers
//     prevButton.style.display = (index > 0) ? 'block' : 'none';
//     // quizButtons.style.flexDirection = (index > 0 && quizButtons.style.flexDirection !=='column') ? 'row' : 'row-reverse';
    
//     nextButton.style.display = (index < total_questions - 1) ? 'block' : 'none';
//     submitButton.style.display = (index === total_questions - 1) ? 'block' : 'none';

//     // Ensure only one click listener for submit button
//     if (submitButton.style.display === 'block') {
//         submitButton.removeEventListener('click', handleSubmit); // Remove previous listener
//         submitButton.addEventListener('click', handleSubmit); // Add submit handler
//     }

//     // Assign navigation click handlers
//     if (prevButton.style.display === 'block') {
//         prevButton.onclick = () => renderQuestion(currentIndex - 1);
//     }
//     if (nextButton.style.display === 'block') {
//         nextButton.onclick = () => renderQuestion(currentIndex + 1);
//     }
// }


// // Handle Submit logic
// async function handleSubmit() {
//     stopTimer();

//     const token = localStorage.getItem('access_token');
//     const phoneNumber = localStorage.getItem('phone_number');
//     const username = localStorage.getItem('username');

//     // Add current question's duration before submitting
//     if (questions[currentIndex]) {
//         const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
//         const currentQuestionId = questions[currentIndex].id;
//         questionDurations[currentQuestionId] = (questionDurations[currentQuestionId] || 0) + duration;
//     }

//     const answersArray = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
//         question_id: parseInt(questionId),
//         selected_option_id: parseInt(answerId)
//     }));

//     const payload = {
//         answers: answersArray,
//         question_durations: questionDurations
//     };

//     if (!token) {
//         if (phoneNumber && username) {
//             payload.phone_number = phoneNumber;
//             payload.username = username;
//         } else {
//             alert('Missing login credentials. Please log in again.');
//             return;
//         }
//     }

//     const headers = {
//         'Content-Type': 'application/json'
//     };

//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//     }

//     try {
//         const response = await fetch('/api/submit-practice/', {
//             method: 'POST',
//             headers: headers,
//             body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Submission failed');
//         }

//         const result = await response.json();

//         // Call the showResult function which will trigger the Bootstrap modal
//         showResult(result.correct_answers, result.wrong_answers);

//         // Hide main content (card and navigation buttons) after submission
//         document.querySelector('.container-fluid .card').style.display = 'none';
//         prevButton.style.display = 'none';
//         nextButton.style.display = 'none';
//         submitButton.style.display = 'none';

//         timerDisplay.textContent = '00:00'; // Reset timer display
//         updateProgressBar(0, total_questions); // Reset progress bar


//     } catch (error) {
//         console.error('Submission error:', error);
//         questionContainer.innerHTML = `
//             <div class="alert alert-danger mt-3 text-center" role="alert">
//                 ❌ Error submitting answers: ${error.message}
//             </div>
//         `;
//     }
// }



document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const phoneNumber = localStorage.getItem('phone_number');

    if (accessToken) {
        fetchSubjects();
    } else {
        // We will no longer show the user modal directly on DOMContentLoaded
        // It will be triggered by the submit button if credentials are missing
        fetchSubjects(); // Continue to fetch subjects, the submit logic will handle the modal
    }
});

// Show user modal (no changes needed here for UI, but keeping it for completeness)
function showUserModal() {
    const modalHTML = `
        <div id="userModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
             background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; padding: 30px; border-radius: 8px; max-width: 400px; width: 90%;">
                <h4 class="text-center mb-3">যদি আপনি আপনার রেজাল্ট লিডারবোর্ডে দেখতে চান, তাহলে আপনার তথ্য দিন</h4>
                <form id="userForm">
                    <input type="text" id="usernameInput" placeholder="আপনার নাম লিখুন" class="form-control my-2" required />
                    <input type="text" id="phoneInput" placeholder="আপনার ফোন নম্বর লিখুন" class="form-control my-2" required />
                    <button type="submit" class="btn btn-primary w-100 mt-2">চালিয়ে যান</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const userForm = document.getElementById('userForm');
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('usernameInput').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        if (!username || !phone) {
            alert("Please fill in all fields.");
            return;
        }

        localStorage.setItem('username', username);
        localStorage.setItem('phone_number', phone);
        document.getElementById('userModal').remove();
        // After successfully getting user details, re-attempt submission
        handleSubmitLogicAfterModal();
    });
}

// Fetch subjects (no changes needed here for UI)
function fetchSubjects() {
    fetch('/api/subjects/')
        .then(res => res.json())
        .then(subjects => {
            if (Array.isArray(subjects) && subjects.length > 0) {
                renderSubjectTabs(subjects);
                fetchQuestions(subjects[0].id); // Fetch questions for the first subject
            } else {
                document.getElementById('subjectTabs').innerHTML = '<li class="nav-item">No subjects found.</li>';
                document.getElementById('question-container').innerHTML = '<p class="text-white text-center">No questions to display for this subject.</p>';
                // Hide navigation buttons if no questions
                document.getElementById('prev-btn').style.display = 'none';
                document.getElementById('next-btn').style.display = 'none';
                document.getElementById('submit-button').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching subjects:', error);
            document.getElementById('question-container').innerHTML = '<p class="text-danger text-center">Error loading subjects. Please try again later.</p>';
            document.getElementById('prev-btn').style.display = 'none';
            document.getElementById('next-btn').style.display = 'none';
            document.getElementById('submit-button').style.display = 'none';
        });
}

// Render subject tabs (dynamically creates buttons)
function renderSubjectTabs(subjects) {
    const tabContainer = document.getElementById('subjectTabs');
    tabContainer.innerHTML = '';

    subjects.forEach((subject, index) => {
        const isActive = index === 0 ? 'active' : '';
        const isSelected = index === 0 ? 'true' : 'false';

        const tab = `
            <li class="nav-item" role="presentation">
                <button
                    class="nav-link ${isActive}"
                    id="subject-tab-${subject.id}"
                    data-bs-toggle="tab"
                    type="button"
                    role="tab"
                    aria-selected="${isSelected}"
                    onclick="fetchQuestions(${subject.id})"
                >${subject.name}</button>
            </li>
        `;
        tabContainer.insertAdjacentHTML('beforeend', tab);
    });
}

// Timer utilities
let questions = [];
let currentIndex = 0;
let selectedAnswers = {};
let questionDurations = {};
let quizStartTime;
let perQuestionStartTime;
let timerInterval = null;
let total_questions = null;

const questionContainer = document.getElementById('question-container');
const timerDisplay = document.getElementById('quiz-timer');
const prevButton = document.getElementById('prev-btn');
const quizButtons = document.getElementById('quiz-buttons');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-button');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    stopTimer(); // Clear any existing timer before starting a new one
    quizStartTime = new Date(); // Reset quiz start time on new quiz/subject
    perQuestionStartTime = new Date(); // Reset per question timer
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - quizStartTime) / 1000);
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsed); // Removed "⏱️ Time Spent: "
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Fetch questions with authorization
async function fetchQuestions(subjectId) {
    // Reset state when fetching new questions for a subject
    questions = [];
    currentIndex = 0;
    selectedAnswers = {};
    questionDurations = {};
    total_questions = 0; // Reset total questions
    updateProgressBar(0, 0); // Reset progress bar
    timerDisplay.textContent = '00:00'; // Reset timer display
    stopTimer(); // Stop any active timer

    questionContainer.innerHTML = '<p class="text-white text-center">Loading questions...</p>'; // Show loading message
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    submitButton.style.display = 'none';

    try {
        const response = await fetch('/api/start-practice/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject_id: subjectId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch questions');
        }

        const data = await response.json();
        questions = data.questions;
        total_questions = questions.length;

        if (questions.length > 0) {
            renderQuestion(currentIndex);
            startTimer();
        } else {
            questionContainer.innerHTML = '<p class="text-white text-center">No questions available for this subject.</p>';
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            submitButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionContainer.innerHTML = `<p class="text-danger text-center">Error: ${error.message}</p>`;
        stopTimer();
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        submitButton.style.display = 'none';
    }
}

// Progress bar
function updateProgressBar(currentQuestionNumber, totalQuestions) {
    const percentage = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

// Render a question - DYNAMICALLY CREATES QUESTION AND OPTIONS
function renderQuestion(index) {
    if (index < 0 || index >= questions.length) {
        return; // Invalid index
    }

    // Time tracking for previous question
    if (questions[currentIndex] && currentIndex !== index) { // Only track if moving from a valid question
        const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
        const prevQuestionId = questions[currentIndex].id;
        questionDurations[prevQuestionId] = (questionDurations[prevQuestionId] || 0) + duration;
    }
    perQuestionStartTime = new Date(); // Reset for current question

    currentIndex = index;
    const q = questions[currentIndex];
    const questionNumber = currentIndex + 1;

    updateProgressBar(questionNumber, total_questions);

    let optionsHTML = '';
    const optionLetters = ['A', 'B', 'C', 'D'];

    q.options.forEach((opt, i) => {
        const isSelected = String(selectedAnswers[q.id]) === String(opt.id);

        optionsHTML += `
            <div class="option-wrapper ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}" data-question-id="${q.id}">
                <span class="option-letter">${optionLetters[i]}</span>
                <span class="option-text">
                    ${opt.text ? opt.text : `<img src="${opt.image}" alt="Option Image" class="img-fluid" style="max-height: 80px;">`}
                </span>
            </div>
        `;
    });

    const questionTextContent = q.text ? `<div style="text-align: center;"><h2 class="question-text">${q.text}</h2></div>` : '';
    const questionImageContent = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

    // Inject only the question and options into #question-container
    questionContainer.innerHTML = `
        <small class="question-meta">Question ${questionNumber} of ${total_questions}</small>
        ${questionTextContent}
        ${questionImageContent}
        <div id="options-list" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            ${optionsHTML}
        </div>
    `;

    // Option selection logic
    const optionWrappers = questionContainer.querySelectorAll('.option-wrapper'); // Query within questionContainer
    optionWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const currentQuestionId = wrapper.dataset.questionId;
            const selectedOptionId = wrapper.dataset.optionId;

            // Remove 'selected' class from all options for the current question
            questionContainer.querySelectorAll('.option-wrapper').forEach(w => {
                w.classList.remove('selected');
            });

            // Add 'selected' class to the clicked option
            wrapper.classList.add('selected');
            selectedAnswers[currentQuestionId] = selectedOptionId;
        });
    });

    // Update navigation buttons' visibility and click handlers
    prevButton.style.display = (index > 0) ? 'block' : 'none';
    // quizButtons.style.flexDirection = (index > 0 && quizButtons.style.flexDirection !=='column') ? 'row' : 'row-reverse';

    nextButton.style.display = (index < total_questions - 1) ? 'block' : 'none';
    submitButton.style.display = (index === total_questions - 1) ? 'block' : 'none';

    // Ensure only one click listener for submit button
    if (submitButton.style.display === 'block') {
        submitButton.removeEventListener('click', handleSubmit); // Remove previous listener
        submitButton.addEventListener('click', handleSubmit); // Add submit handler
    }

    // Assign navigation click handlers
    if (prevButton.style.display === 'block') {
        prevButton.onclick = () => renderQuestion(currentIndex - 1);
    }
    if (nextButton.style.display === 'block') {
        nextButton.onclick = () => renderQuestion(currentIndex + 1);
    }
}

// New function to handle submission after the modal is closed
async function handleSubmitLogicAfterModal() {
    await submitQuizData();
}

// The core submission logic, extracted for reusability
async function submitQuizData() {
    stopTimer();

    const token = localStorage.getItem('access_token');
    const phoneNumber = localStorage.getItem('phone_number');
    const username = localStorage.getItem('username');

    // Add current question's duration before submitting
    if (questions[currentIndex]) {
        const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
        const currentQuestionId = questions[currentIndex].id;
        questionDurations[currentQuestionId] = (questionDurations[currentQuestionId] || 0) + duration;
    }

    const answersArray = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        selected_option_id: parseInt(answerId)
    }));

    const payload = {
        answers: answersArray,
        question_durations: questionDurations
    };

    // Add phone_number and username to payload if they exist in localStorage
    if (phoneNumber) {
        payload.phone_number = phoneNumber;
    }
    if (username) {
        payload.username = username;
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch('/api/submit-practice/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Submission failed');
        }

        const result = await response.json();

        // Call the showResult function which will trigger the Bootstrap modal
        showResult(result.correct_answers, result.wrong_answers);

        // Hide main content (card and navigation buttons) after submission
        document.querySelector('.container-fluid .card').style.display = 'none';
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        submitButton.style.display = 'none';

        timerDisplay.textContent = '00:00'; // Reset timer display
        updateProgressBar(0, total_questions); // Reset progress bar


    } catch (error) {
        console.error('Submission error:', error);
        questionContainer.innerHTML = `
            <div class="alert alert-danger mt-3 text-center" role="alert">
                ❌ Error submitting answers: ${error.message}
            </div>
        `;
    }
}


// Handle Submit logic (now checks for credentials before submitting)
async function handleSubmit() {
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const phoneNumber = localStorage.getItem('phone_number');

    if (!accessToken && (!username || !phoneNumber)) {
        // If no access token and user details are missing, show the modal
        showUserModal();
    } else {
        // Otherwise, proceed with submission
        await submitQuizData();
    }
}