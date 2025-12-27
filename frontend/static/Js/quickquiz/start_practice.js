
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectIdFromUrl = urlParams.get('subject');

    // 1. Fetch subjects and build the navigation
    fetch('/api/subjects/')
        .then(res => res.json())
        .then(subjects => {
            if (Array.isArray(subjects) && subjects.length > 0) {
                renderSubjectTabs(subjects);
                
                // If URL has a subject ID, load that. Otherwise, default to the first subject.
                const idToLoad = subjectIdFromUrl || subjects[0].id;
                fetchQuestions(idToLoad);
            } else {
                handleNoSubjects();
            }
        })
        .catch(error => {
            console.error('Error fetching subjects:', error);
            document.getElementById('question-container').innerHTML = '<p class="text-danger text-center">Error loading subjects. Please try again later.</p>';
        });
});

// Helper for empty states
function handleNoSubjects() {
    document.getElementById('subjectTabs').innerHTML = '<li class="nav-item">No subjects found.</li>';
    document.getElementById('question-container').innerHTML = '<p class="text-white text-center">No questions to display.</p>';
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    submitButton.style.display = 'none';
}

// Render subject tabs - FIXED: Using window.location.href properly
function renderSubjectTabs(subjects) {
    const tabContainer = document.getElementById('subjectTabs');
    tabContainer.innerHTML = '';

    const urlParams = new URLSearchParams(window.location.search);
    const selectedSubjectId = urlParams.get('subject');

    subjects.forEach((subject, index) => {
        // Active logic: matches URL ID or is first item if no URL ID exists
        const isActive = selectedSubjectId 
            ? (String(subject.id) === selectedSubjectId ? 'active' : '') 
            : (index === 0 ? 'active' : '');

        // Note: Removed data-bs-toggle to prevent Bootstrap from blocking the reload
        const tab = `
            <li class="nav-item" role="presentation">
                <button
                    class="nav-link ${isActive} border border-2 border-primary"
                    id="subject-tab-${subject.id}"
                    type="button"
                    onclick="window.location.href='?subject=${subject.id}'"
                >${subject.name}</button>
            </li>
        `;
        tabContainer.insertAdjacentHTML('beforeend', tab);
    });
}

// Timer and State Variables
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
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-button');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    stopTimer(); 
    quizStartTime = new Date(); 
    perQuestionStartTime = new Date(); 
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - quizStartTime) / 1000);
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(elapsed);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Fetch questions for specific subject
async function fetchQuestions(subjectId) {
    questions = [];
    currentIndex = 0;
    selectedAnswers = {};
    questionDurations = {};
    total_questions = 0;
    updateProgressBar(0, 0);
    timerDisplay.textContent = '00:00';
    stopTimer();

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
        questions = data.questions;
        total_questions = questions.length;

        if (questions.length > 0) {
            renderQuestion(currentIndex);
            startTimer();
        } else {
            questionContainer.innerHTML = '<p class="text-white text-center">No questions available for this subject.</p>';
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionContainer.innerHTML = `<p class="text-danger text-center">Error: ${error.message}</p>`;
        stopTimer();
    }
}

function updateProgressBar(currentQuestionNumber, totalQuestions) {
    const percentage = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

function renderQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    // console.log(questions[currentIndex]);
    if (questions[currentIndex] && currentIndex !== index) {
        const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
        const prevQuestionId = questions[currentIndex].id;
        questionDurations[prevQuestionId] = (questionDurations[prevQuestionId] || 0) + duration;
    }
    perQuestionStartTime = new Date();

    currentIndex = index;
    const q = questions[currentIndex];
    const questionNumber = currentIndex + 1;

    updateProgressBar(questionNumber, total_questions);


    // --- LIVE SCORE CALCULATION ---
    let liveCorrectCount = 0;
    // Iterate through all answers chosen so far
    Object.entries(selectedAnswers).forEach(([qId, selectedOptId]) => {
        const question = questions.find(question => String(question.id) === String(qId));
        if (question) {
            // Check if the selected option has is_correct: true
            const selectedOption = question.options.find(opt => String(opt.id) === String(selectedOptId));
            if (selectedOption && selectedOption.is_correct === true) {
                liveCorrectCount++;
            }
        }
    });


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

    const questionTextContent = q.text ? `<div style="text-align: center;"><h4 class="question-text">${q.text}</h4></div>` : '';
    const questionImageContent = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

    questionContainer.innerHTML = `
        <div class=" d-flex justify-content-between align-items-center w-100 pb-3">
        <small> score: ${liveCorrectCount} </small>
        <small class="question-meta">Question ${questionNumber} of ${total_questions}</small>
        
        </div>
        ${questionTextContent}
        ${questionImageContent}
        <div id="options-list" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            ${optionsHTML}
        </div>
    `;

    const optionWrappers = questionContainer.querySelectorAll('.option-wrapper');
    optionWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const currentQuestionId = wrapper.dataset.questionId;
            const selectedOptionId = wrapper.dataset.optionId;
            questionContainer.querySelectorAll('.option-wrapper').forEach(w => w.classList.remove('selected'));
            wrapper.classList.add('selected');
            selectedAnswers[currentQuestionId] = selectedOptionId;
        });
    });

    prevButton.style.display = (index > 0) ? 'block' : 'none';
    nextButton.style.display = (index < total_questions - 1) ? 'block' : 'none';
    submitButton.style.display = (index === total_questions - 1) ? 'block' : 'none';

    if (submitButton.style.display === 'block') {
        submitButton.removeEventListener('click', handleSubmit);
        submitButton.addEventListener('click', handleSubmit);
    }

    if (prevButton.style.display === 'block') {
        prevButton.onclick = () => renderQuestion(currentIndex - 1);
    }
    if (nextButton.style.display === 'block') {
        nextButton.onclick = () => renderQuestion(currentIndex + 1);
    }
}

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

async function submitQuizData() {
    stopTimer();
    const token = localStorage.getItem('access_token');
    const phoneNumber = localStorage.getItem('phone_number');
    const username = localStorage.getItem('username');

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
        question_durations: questionDurations,
        phone_number: phoneNumber,
        username: username
    };

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch('/api/submit-practice/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Submission failed');

        const result = await response.json();
        showResult(result.correct_answers, result.wrong_answers);

        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        submitButton.style.display = 'none';
        timerDisplay.textContent = '00:00';
        updateProgressBar(0, total_questions);

    } catch (error) {
        console.error('Submission error:', error);
        questionContainer.innerHTML = `<div class="alert alert-danger mt-3 text-center">❌ Error: ${error.message}</div>`;
    }
}

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

    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('usernameInput').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        
        localStorage.setItem('username', user);
        localStorage.setItem('phone_number', phone);
        document.getElementById('userModal').remove();
        await submitQuizData();
    });
}

function showResult(correct, incorrect) {
    const total = correct + incorrect;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    document.getElementById("correct-count").textContent = correct;
    document.getElementById("incorrect-count").textContent = incorrect;
    document.getElementById("score-percent").textContent = percent + "%";
    document.getElementById('resultModal').classList.remove('hidden');
}

async function continuePractice() { window.location.reload(); }
async function reviewLeaderboard() { window.location.href = '/user/leaderboard/'; }

document.addEventListener('click', function (event) {
    const modal = document.getElementById('resultModal');
    const dialog = document.querySelector('.custom-modal-dialog');
    if (modal && !modal.classList.contains('hidden') && dialog && !dialog.contains(event.target)) {
        modal.classList.add('hidden');
    }
});