// ==============================================================================
// GLOBAL STATE MANAGEMENT AND LOCAL STORAGE KEYS
// ==============================================================================

let currentState = {
    subjectId: null,
    questions: [],
    currentIndex: 0, // This holds the index of the question to be displayed
    selectedAnswers: {},
    questionDurations: {},
    quizStartTime: null,
    perQuestionStartTime: null,
    total_questions: 0
};

const LS_STATE_KEY = 'quizState';
const LS_CURRENT_SUBJECT_ID = 'currentSubjectId'; 
const LS_QUIZ_ACTIVE_FLAG = 'quizActiveFlag';

// DOM Element references
const questionContainer = document.getElementById('question-container');
const timerDisplay = document.getElementById('quiz-timer');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-button');


// ==============================================================================
// LOCAL STORAGE UTILITIES
// ==============================================================================

function saveState() {
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(currentState));
    localStorage.setItem(LS_CURRENT_SUBJECT_ID, currentState.subjectId);
    localStorage.setItem(LS_QUIZ_ACTIVE_FLAG, 'true');
}

function loadState(subjectId) {
    const storedState = localStorage.getItem(LS_STATE_KEY);
    const storedSubjectId = localStorage.getItem(LS_CURRENT_SUBJECT_ID);

    // Only load if a state exists AND the subject ID matches
    if (storedState && storedSubjectId && parseInt(storedSubjectId) === subjectId) {
        try {
            const state = JSON.parse(storedState);
            currentState = state;
            currentState.total_questions = currentState.questions.length;
            
            // Critical: Reset perQuestionStartTime on page load to accurately track time on the currently loaded question
            currentState.perQuestionStartTime = new Date().getTime(); 
            saveState(); // Update the perQuestionStartTime in storage (for timer sync)
            return true; // State loaded
        } catch (e) {
            console.error("Error parsing stored state:", e);
            clearState(); // Clear bad state
        }
    }
    return false; // No valid state found or subject ID mismatch
}

function clearState() {
    localStorage.removeItem(LS_STATE_KEY);
    // localStorage.removeItem(LS_CURRENT_SUBJECT_ID);
    localStorage.removeItem(LS_QUIZ_ACTIVE_FLAG);
    
    // Also reset the in-memory state
    currentState = {
        // subjectId: null,
        questions: [],
        currentIndex: 0,
        selectedAnswers: {},
        questionDurations: {},
        quizStartTime: null,
        perQuestionStartTime: null,
        total_questions: 0
    };
}


// ==============================================================================
// INITIALIZATION AND SUBJECTS
// ==============================================================================

document.addEventListener('DOMContentLoaded', function () {
    // 1. Fetch subjects, which will also handle rendering the tabs
    fetchSubjects(); 
    
    // 2. CHECK FOR ACTIVE QUIZ: This section ensures the correct question is loaded after reload
    const activeSubjectId = localStorage.getItem(LS_CURRENT_SUBJECT_ID);

    if (activeSubjectId && localStorage.getItem(LS_QUIZ_ACTIVE_FLAG) === 'true') {
        const subjectIdInt = parseInt(activeSubjectId);
        
        // Load the state and render the question immediately
        if (loadState(subjectIdInt)) {
            // Ensure the tab looks active
            const subjectTab = document.getElementById(`subject-tab-${activeSubjectId}`);
            if (subjectTab) {
                 document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
                 subjectTab.classList.add('active');
            }
            renderQuestion(currentState.currentIndex);
            // startTimer();
        } else {
            // State flag was set but data was corrupted/missing
            clearState();
        }
    }
    // If no active quiz flag, the flow falls through to fetchSubjects and loads the default subject/question 1
});

function fetchSubjects() {
    fetch('/api/subjects/')
        .then(res => res.json())
        .then(subjects => {
            if (Array.isArray(subjects) && subjects.length > 0) {
                renderSubjectTabs(subjects);
                
                // Only start the quiz for the first subject IF no quiz is currently flagged as active
                if (!localStorage.getItem(LS_QUIZ_ACTIVE_FLAG)) {
                    fetchQuestions(subjects[0].id);
                }
            } else {
                // Handle no subjects case
                document.getElementById('subjectTabs').innerHTML = '<li class="nav-item">No subjects found.</li>';
                document.getElementById('question-container').innerHTML = '<p class="text-white text-center">No questions to display.</p>';
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

function renderSubjectTabs(subjects) {
    const tabContainer = document.getElementById('subjectTabs');
    tabContainer.innerHTML = '';
    
    const activeSubjectId = parseInt(localStorage.getItem(LS_CURRENT_SUBJECT_ID));

    subjects.forEach((subject, index) => {
        // Tab is active if it's the first one AND no quiz is active, OR if it matches the stored subject ID
        const isDefaultActive = index === 0 && !localStorage.getItem(LS_QUIZ_ACTIVE_FLAG);
        const isStateActive = activeSubjectId && subject.id === activeSubjectId;
        const isActive = isDefaultActive || isStateActive ? 'active' : '';
        const isSelected = isActive ? 'true' : 'false';

        const tab = `
            <li class="nav-item" role="presentation">
                <button
                    class="nav-link ${isActive} border border-2 border-primary"
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


// ==============================================================================
// QUESTION FETCHING
// ==============================================================================

async function fetchQuestions(subjectId) {
    // 1. Attempt to load existing state (Only necessary if a user manually clicks a tab)
    // For page reloads, this should have been handled by DOMContentLoaded
    if (loadState(subjectId)) {
        renderQuestion(currentState.currentIndex);
        // startTimer();
        return;
    }
    
    // 2. No existing state found for this subject, fetch new questions

    // Check if the user is trying to switch subjects while a quiz is active
    if (localStorage.getItem(LS_QUIZ_ACTIVE_FLAG) === 'true') {
        if (confirm("বিষয় পরিবর্তন করলে আপনার বর্তমান প্র্যাকটিস সেশনটি মুছে যাবে। আপনি কি চালিয়ে যেতে চান?")) {
            clearState(); // Clear old quiz state
        } else {
            // User cancelled, do nothing (keep the old quiz running or reload to current question)
            return;
        }
    }
    
    // Reset state for a new subject and initialize
    currentState = {
        subjectId: subjectId,
        questions: [],
        currentIndex: 0,
        selectedAnswers: {},
        questionDurations: {},
        quizStartTime: new Date().getTime(), 
        perQuestionStartTime: new Date().getTime(),
        total_questions: 0
    };
    
    // UI feedback for fetching
    questionContainer.innerHTML = '<p class="text-white text-center">Loading questions...</p>'; 
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    submitButton.style.display = 'none';

    try {
        const response = await fetch('/api/start-practice/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject_id: subjectId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch questions');
        }

        const data = await response.json();
        currentState.questions = data.questions;
        currentState.total_questions = data.questions.length;
        saveState(); // Save the initial state and set flags

        if (currentState.questions.length > 0) {
            renderQuestion(currentState.currentIndex); // Will be 0
            // startTimer();
        } else {
            // Handle no questions case
            questionContainer.innerHTML = '<p class="text-white text-center">No questions available for this subject.</p>';
            clearState(); 
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionContainer.innerHTML = `<p class="text-danger text-center">Error: ${error.message}</p>`;
        stopTimer();
    }
}


// ==============================================================================
// QUIZ NAVIGATION AND RENDERING
// ==============================================================================

function handleNavigation(newIndex) {
    // 1. Calculate and save duration for the question the user is leaving
    const duration = Math.floor((new Date().getTime() - currentState.perQuestionStartTime) / 1000);
    const prevQuestionId = currentState.questions[currentState.currentIndex].id;
    
    currentState.questionDurations[prevQuestionId] = (currentState.questionDurations[prevQuestionId] || 0) + duration;
    
    // 2. Update the currentIndex to the target index (THIS IS CRITICAL)
    currentState.currentIndex = newIndex;

    // 3. Save the *new* state to localStorage
    saveState(); 
    
    // 4. Trigger a full page reload to show the next question
    window.location.reload(); 
}

function renderQuestion(index) {
    if (index < 0 || index >= currentState.questions.length) {
        return; // Invalid index
    }

    const q = currentState.questions[index];
    const questionNumber = index + 1;

    updateProgressBar(questionNumber, currentState.total_questions);

    let optionsHTML = '';
    const optionLetters = ['A', 'B', 'C', 'D'];
    const selectedOptionIdForQ = String(currentState.selectedAnswers[q.id]);

    q.options.forEach((opt, i) => {
        const isSelected = selectedOptionIdForQ === String(opt.id);

        optionsHTML += `
            <div class="option-wrapper ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}" data-question-id="${q.id}">
                <span class="option-letter">${optionLetters[i]}</span>
                <span class="option-text">
                    ${opt.text ? opt.text : `<img src="${opt.image}" alt="Option Image" class="img-fluid" style="max-height: 80px;">`}
                </span>
            </div>
        `;
    });

    const questionTextContent = q.text ? `<div style="text-align: center;"><h4 class="question-text">${q.text}</h4></div>` : '';
    const questionImageContent = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

    questionContainer.innerHTML = `
        <small class="question-meta">Question ${questionNumber} of ${currentState.total_questions}</small>
        ${questionTextContent}
        ${questionImageContent}
        <div id="options-list" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            ${optionsHTML}
        </div>
    `;

    // Option selection logic: Update state and save immediately
    const optionWrappers = questionContainer.querySelectorAll('.option-wrapper');
    optionWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const currentQuestionId = wrapper.dataset.questionId;
            const selectedOptionId = wrapper.dataset.optionId;

            // UI feedback
            questionContainer.querySelectorAll('.option-wrapper').forEach(w => {
                w.classList.remove('selected');
            });
            wrapper.classList.add('selected');

            // Save the selection to state and local storage
            currentState.selectedAnswers[currentQuestionId] = selectedOptionId;
            saveState();
        });
    });

    // Update navigation buttons' visibility and click handlers
    prevButton.style.display = (index > 0) ? 'block' : 'none';
    nextButton.style.display = (index < currentState.total_questions - 1) ? 'block' : 'none';
    submitButton.style.display = (index === currentState.total_questions - 1) ? 'block' : 'none';

    // Assign reload-triggering handlers
    if (prevButton.style.display === 'block') {
        prevButton.onclick = () => handleNavigation(index - 1);
    }
    if (nextButton.style.display === 'block') {
        nextButton.onclick = () => handleNavigation(index + 1);
    }
    
    // Ensure only one click listener for submit button
    if (submitButton.style.display === 'block') {
        submitButton.removeEventListener('click', handleSubmit); 
        submitButton.addEventListener('click', handleSubmit); 
    }
}


// ==============================================================================
// TIMER AND PROGRESS (Existing Logic)
// ==============================================================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

let timerInterval = null;

function startTimer() {
    stopTimer(); 
    
    const startTimestamp = currentState.quizStartTime; 
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTimestamp) / 1000);
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsed);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateProgressBar(currentQuestionNumber, totalQuestions) {
    const percentage = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}


// ==============================================================================
// SUBMISSION LOGIC (Existing Logic)
// ==============================================================================

async function handleSubmit() {
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const phoneNumber = localStorage.getItem('phone_number');

    if (!accessToken && (!username || !phoneNumber)) {
        showUserModal();
    } else {
        await submitQuizData();
    }
}

async function handleSubmitLogicAfterModal() {
    await submitQuizData();
}

async function submitQuizData() {
    stopTimer();

    // 1. Final duration calculation for the last question before submitting
    if (currentState.questions[currentState.currentIndex]) {
        const duration = Math.floor((new Date().getTime() - currentState.perQuestionStartTime) / 1000);
        const currentQuestionId = currentState.questions[currentState.currentIndex].id;
        currentState.questionDurations[currentQuestionId] = (currentState.questionDurations[currentQuestionId] || 0) + duration;
    }
    
    // 2. Prepare payload before clearing state
    const answersArray = Object.entries(currentState.selectedAnswers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        selected_option_id: parseInt(answerId)
    }));

    const payload = {
        answers: answersArray,
        question_durations: currentState.questionDurations
    };
    
    // 3. Clear state and flags immediately before API call
    clearState(); 

    const token = localStorage.getItem('access_token');
    const phoneNumber = localStorage.getItem('phone_number');
    const username = localStorage.getItem('username');

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

        showResult(result.correct_answers, result.wrong_answers);

        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        submitButton.style.display = 'none';
        timerDisplay.textContent = '00:00'; 
        updateProgressBar(0, 0); 

    } catch (error) {
        console.error('Submission error:', error);
        questionContainer.innerHTML = `
            <div class="alert alert-danger mt-3 text-center" role="alert">
                ❌ Error submitting answers: ${error.message}
            </div>
        `;
    }
}


// ==============================================================================
// MODALS AND RESULTS (Existing Logic)
// ==============================================================================

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
        handleSubmitLogicAfterModal();
    });
}

function showResult(correct, incorrect) {
    const total = correct + incorrect;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    document.getElementById("correct-count").textContent = correct;
    document.getElementById("incorrect-count").textContent = incorrect;
    document.getElementById("score-percent").textContent = percent + "%";

    const modal = document.getElementById('resultModal');
    modal.classList.remove('hidden');
}


async function continuePractice() {
    window.location.reload(); 
}

async function reviewLeaderboard() {
    window.location.href = '/user/leaderboard/';
}

document.addEventListener('click', function (event) {
    const modal = document.getElementById('resultModal');
    const dialog = document.querySelector('.custom-modal-dialog'); 
    if (modal && dialog && !modal.classList.contains('hidden') && !dialog.contains(event.target)) {
        modal.classList.add('hidden');
    }
});






// document.addEventListener('DOMContentLoaded', function () {
//     const accessToken = localStorage.getItem('access_token');
//     const username = localStorage.getItem('username');
//     const phoneNumber = localStorage.getItem('phone_number');

//     if (accessToken) {
//         fetchSubjects();
//     } else {
//         // We will no longer show the user modal directly on DOMContentLoaded
//         // It will be triggered by the submit button if credentials are missing
//         fetchSubjects(); // Continue to fetch subjects, the submit logic will handle the modal
//     }
// });

// // Show user modal (no changes needed here for UI, but keeping it for completeness)
// function showUserModal() {
//     const modalHTML = `
//         <div id="userModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//              background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
//             <div style="background: white; padding: 30px; border-radius: 8px; max-width: 400px; width: 90%;">
//                 <h4 class="text-center mb-3">যদি আপনি আপনার রেজাল্ট লিডারবোর্ডে দেখতে চান, তাহলে আপনার তথ্য দিন</h4>
//                 <form id="userForm">
//                     <input type="text" id="usernameInput" placeholder="আপনার নাম লিখুন" class="form-control my-2" required />
//                     <input type="text" id="phoneInput" placeholder="আপনার ফোন নম্বর লিখুন" class="form-control my-2" required />
//                     <button type="submit" class="btn btn-primary w-100 mt-2">চালিয়ে যান</button>
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
//         // After successfully getting user details, re-attempt submission
//         handleSubmitLogicAfterModal();
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
//                     class="nav-link ${isActive} border border-2 border-primary"
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

//     const questionTextContent = q.text ? `<div style="text-align: center;"><h4 class="question-text">${q.text}</h4></div>` : '';
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

// // New function to handle submission after the modal is closed
// async function handleSubmitLogicAfterModal() {
//     await submitQuizData();
// }

// // The core submission logic, extracted for reusability
// async function submitQuizData() {
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

//     // Add phone_number and username to payload if they exist in localStorage
//     if (phoneNumber) {
//         payload.phone_number = phoneNumber;
//     }
//     if (username) {
//         payload.username = username;
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
//         // document.querySelector('.container-fluid .card').style.display = 'none';
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


// // Handle Submit logic (now checks for credentials before submitting)
// async function handleSubmit() {
//     const accessToken = localStorage.getItem('access_token');
//     const username = localStorage.getItem('username');
//     const phoneNumber = localStorage.getItem('phone_number');

//     if (!accessToken && (!username || !phoneNumber)) {
//         // If no access token and user details are missing, show the modal
//         showUserModal();
//     } else {
//         // Otherwise, proceed with submission
//         await submitQuizData();
//     }
// }



//   function showResult(correct, incorrect) {
//         const total = correct + incorrect;
//         const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

//         document.getElementById("correct-count").textContent = correct;
//         document.getElementById("incorrect-count").textContent = incorrect;
//         document.getElementById("score-percent").textContent = percent + "%";

//         const modal = document.getElementById('resultModal');
//         modal.classList.remove('hidden');
//     }


// async function continuePractice() {
//         window.location.reload(); // Simple reload for fresh practice session
//     }

// async function reviewLeaderboard() {
//         window.location.href = '/user/leaderboard/';
//     }


// document.addEventListener('click', function (event) {
//         const modal = document.getElementById('resultModal');
//         const dialog = document.querySelector('.custom-modal-dialog');
//         if (!modal.classList.contains('hidden') && !dialog.contains(event.target)) {
//             modal.classList.add('hidden');
//         }
//     });










