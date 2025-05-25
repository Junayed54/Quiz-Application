
let questions = [];
let currentIndex = 0;
let selectedAnswers = {};
let questionDurations = {};
let quizStartTime;
let perQuestionStartTime;
let sessionId = null;
let timerInterval = null;
let total_questions = null;

const questionContainer = document.getElementById('question-container');
const timerDisplay = document.getElementById('quiz-timer'); // Add this in HTML

// Format seconds to mm:ss
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Start Timer
function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((new Date() - quizStartTime) / 1000);
    if (timerDisplay) {
      timerDisplay.textContent = `⏱️ Time Spent: ${formatTime(elapsed)}`;
    }
  }, 1000);
}

// Stop Timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Fetch questions
async function fetchQuestions() {
  try {
    const response = await fetch('/api/start-practice/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch questions');

    const data = await response.json();

    questions = data.questions;
    sessionId = data.session.id;
    currentIndex = 0;
    quizStartTime = new Date();
    perQuestionStartTime = new Date();

    renderQuestion(currentIndex);
    startTimer();
  } catch (error) {
    questionContainer.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
}

function updateProgressBar(currentIndex, totalQuestions) {
  const percentage = (currentIndex / totalQuestions) * 100;
  const progressBar = document.getElementById('quiz-progress-bar');
  progressBar.style.width = percentage + '%';
  progressBar.setAttribute('aria-valuenow', percentage);
}

function loadQuestion(index) {
  if (index >= 0 && index < total_questions) {
    // Your logic to show the question from questions[index]
    updateProgressBar(index + 1, total_questions); // Add 1 because progress is 1-based
  }
}
// Render a question
function renderQuestion(index) {
  const q = questions[index];
  const questionNumber = index + 1;
  const total = questions.length;
  total_questions = total;
  loadQuestion(currentIndex);
  // Save previous question duration
  if (questions[currentIndex]) {
    const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
    const prevQuestionId = questions[currentIndex].id;
    questionDurations[prevQuestionId] = (questionDurations[prevQuestionId] || 0) + duration;
    perQuestionStartTime = new Date();
  }

  currentIndex = index;

  let optionsHTML = '';
  const optionLetters = ['A', 'B', 'C', 'D']; 
  q.options.forEach((opt, i) => {
    const optionId = `option${i}`;
    const label = opt.text
      ? `${optionLetters[i]}) ${opt.text}`
      : `${optionLetters[i]}) <img src="${opt.image}" alt="Option Image" class="img-fluid" style="max-height: 80px;">`;

    const isSelected = String(selectedAnswers[q.id]) === String(opt.id);
    const bgColor = isSelected ? 'box-shadow: 0px 0px 10px 0px #6C4DF633; border: 1px solid #6C4DF6' : 'background: #14141C;';

    optionsHTML += `
      <div class="form-check my-2 option-wrapper border border-1 border-secondary rounded p-2" data-option-id="${opt.id}" style="${bgColor}">
        <input class="form-check-input d-none" type="radio" name="answer" id="${optionId}" value="${opt.id}" ${isSelected ? 'checked' : ''}>
        <label class="form-check-label w-100 px-2" for="${optionId}">${label}</label>
      </div>
    `;
  });

  const questionText = q.text ? `<p class="card-text"   style="font-size:20px; font-weight: 500;">${q.text}</p>` : '';
  const questionImage = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

  questionContainer.innerHTML = `
    <div class="card text-light rounded shadow p-3" style="width: 100%; background: #070710;">
      <div class="card-body">
        <p class="card-title mb-2" style="color: #B3B3B3;">Question ${questionNumber} of ${total}</p>
        ${questionText}
        ${questionImage}
        <form id="answer-form">
          ${optionsHTML}
          <div class="d-flex justify-content-between mt-4">
            ${index > 0
              ? `<button type="button" id="prev-btn" class="btn rounded btn-md" style="background: #6C4DF61A; border-color: #6C4DF6;">Previous</button>`
              : `<div></div>`}
            ${index < total - 1
              ? `<button type="button" id="next-btn" class="btn btn-outline-light rounded btn-md"  style="background: #6C4DF61A; border-color: #6C4DF6;">Next</button>`
              : `<button type="submit" class="btn btn-primary rounded btn-md" style="background: linear-gradient(90deg, #6C4DF6 0%, #8A6EFF 100%);">Submit Answer</button>`}
          </div>
        </form>
      </div>
    </div>
  `;

  // Option selection
  const optionWrappers = document.querySelectorAll('.option-wrapper');
  optionWrappers.forEach(wrapper => {
    const input = wrapper.querySelector('input');

    if (input.checked) {
      wrapper.style.backgroundColor = '#6C4DF6';
    }

    wrapper.addEventListener('click', () => {
      optionWrappers.forEach(w => {
        w.style.backgroundColor = '';
        w.querySelector('input').checked = false;
      });
      input.checked = true;
      wrapper.style.backgroundColor = '#6C4DF6';

      selectedAnswers[q.id] = parseInt(input.value);
    });
  });

  // Previous
  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        loadQuestion(currentIndex);
        renderQuestion(currentIndex);
      }
    };
  }

  // Next
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        loadQuestion(currentIndex);
        renderQuestion(currentIndex);
      }
    };
  }

  // Submit
  const answerForm = document.getElementById('answer-form');
  answerForm.onsubmit = (e) => {
    e.preventDefault();

    const selected = document.querySelector('input[name="answer"]:checked');
    if (selected) {
      selectedAnswers[q.id] = parseInt(selected.value);
    }

    submitAllAnswers();
  };
}

// Submit answers
async function submitAllAnswers() {
  const lastDuration = Math.floor((new Date() - perQuestionStartTime) / 1000);
  const lastQuestionId = questions[currentIndex].id;
  questionDurations[lastQuestionId] = (questionDurations[lastQuestionId] || 0) + lastDuration;

  const totalDuration = Math.floor((new Date() - quizStartTime) / 1000);
  const durationInMinutes = Math.round(totalDuration / 60);

  stopTimer();

  const answersList = Object.entries(selectedAnswers).map(([question_id, option_id]) => ({
    question_id: parseInt(question_id),
    option_id: option_id
  }));

  const payload = {
    session_id: sessionId,
    answers: answersList,
    duration: durationInMinutes
  };

  try {
    const response = await fetch('/api/submit-practice/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Submission failed');

    const data = await response.json(); // Assuming response has correct, incorrect, score

    // Update modal values
    document.getElementById('correct-count').textContent = data.correct_answers;
    document.getElementById('incorrect-count').textContent = data.wrong_answers;
    document.getElementById('score-percent').textContent = `${data.score}%`;

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('resultModal'));
    modal.show();

  } catch (err) {
    alert("Error submitting answers: " + err.message);
  }
}

function reviewLeaderboard() {
  window.location.href = '/user/leaderboard/'; // update URL as needed
}

function continuePractice() {
  window.location.reload(); // or redirect to start a new quiz
}

// Start quiz
fetchQuestions();
