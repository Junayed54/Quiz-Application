document.addEventListener('DOMContentLoaded', function () {
  const accessToken = localStorage.getItem('access_token');
  const username = localStorage.getItem('username');
  const phoneNumber = localStorage.getItem('phone_number');

  if (accessToken) {
    fetchSubjects();
  } else if (!username || !phoneNumber) {
    showUserModal(); // Prompt for user details
  } else {
    fetchSubjects(); // Continue if user data is stored
  }
});

// Show user modal
function showUserModal() {
  const modalHTML = `
    <div id="userModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
         background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="background: white; padding: 30px; border-radius: 8px; max-width: 400px; width: 90%;">
        <h4>Enter Your Details</h4>
        <form id="userForm">
          <input type="text" id="usernameInput" placeholder="Enter your name" class="form-control my-2" required />
          <input type="text" id="phoneInput" placeholder="Enter your phone number" class="form-control my-2" required />
          <button type="submit" class="btn btn-primary w-100 mt-2">Continue</button>
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
    console.log(username, phone);
    if (!username || !phone) {
      alert("Please fill in all fields.");
      return;
    }

    localStorage.setItem('username', username);
    localStorage.setItem('phone_number', phone);
    document.getElementById('userModal').remove();
    fetchSubjects();
  });
}

// Fetch subjects
function fetchSubjects() {
  fetch('/api/subjects/')
    .then(res => res.json())
    .then(subjects => {
      if (Array.isArray(subjects) && subjects.length > 0) {
        renderSubjectTabs(subjects);
        fetchQuestions(subjects[0].id);
      } else {
        document.getElementById('subjectTabs').innerHTML = '<li class="nav-item">No subjects found.</li>';
        document.getElementById('questionList').innerHTML = '<li class="list-group-item">No questions to display.</li>';
      }
    })
    .catch(error => console.error('Error fetching subjects:', error));
}

// Render subject tabs
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

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((new Date() - quizStartTime) / 1000);
    if (timerDisplay) {
      timerDisplay.textContent = `⏱️ Time Spent: ${formatTime(elapsed)}`;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Fetch questions with authorization
async function fetchQuestions(subjectId) {
  try {
    const response = await fetch('/api/start-practice/', {
      method: 'POST',
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subject_id: subjectId })
    });

    if (!response.ok) throw new Error('Failed to fetch questions');

    const data = await response.json();
    questions = data.questions;
    currentIndex = 0;
    quizStartTime = new Date();
    perQuestionStartTime = new Date();

    renderQuestion(currentIndex);
    startTimer();
  } catch (error) {
    questionContainer.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
}

// Progress bar
function updateProgressBar(currentIndex, totalQuestions) {
  const percentage = (currentIndex / totalQuestions) * 100;
  const progressBar = document.getElementById('quiz-progress-bar');
  if (progressBar) {
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
  }
}

function loadQuestion(index) {
  if (index >= 0 && index < total_questions) {
    updateProgressBar(index + 1, total_questions);
  }
}

// Render a question
function renderQuestion(index) {
  const q = questions[index];
  const questionNumber = index + 1;
  const total = questions.length;
  total_questions = total;

  loadQuestion(currentIndex);

  // Time tracking
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
    const bgColor = isSelected
      ? 'box-shadow: 0px 0px 10px 0px #6C4DF633; border: 1px solid #6C4DF6'
      : 'background: #14141C;';

    optionsHTML += `
      <div class="form-check my-2 option-wrapper border border-1 border-secondary rounded p-2" data-option-id="${opt.id}" style="${bgColor}">
        <input class="form-check-input d-none" type="radio" name="answer" id="${optionId}" value="${opt.id}" ${isSelected ? 'checked' : ''}>
        <label class="form-check-label w-100 px-2" for="${optionId}">${label}</label>
      </div>
    `;
  });

  const questionText = q.text ? `<p class="card-text" style="font-size:20px; font-weight: 500;">${q.text}</p>` : '';
  const questionImage = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

  questionContainer.innerHTML = `
    <div class="card text-light rounded shadow p-3" style="width: 100%; background: #070710;">
      <div class="card-body">
        <p class="card-title mb-2" style="color: #B3B3B3;">Question ${questionNumber} of ${total}</p>
        ${questionText}
        ${questionImage}
        <form id="answer-form">
          ${optionsHTML}
          <div class="d-flex flex-column flex-sm-row justify-content-between gap-2 mt-4">
            ${index > 0
              ? `<button type="button" id="prev-btn" class="btn rounded btn-md" style="background: #6C4DF61A; border-color: #6C4DF6;">Previous</button>`
              : '<div></div>'}
            ${index < total - 1
              ? `<button type="button" id="next-btn" class="btn btn-outline-light rounded btn-md" style="background: #6C4DF61A; border-color: #6C4DF6;">Next</button>`
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

    wrapper.addEventListener('click', () => {
      optionWrappers.forEach(w => {
        w.style.backgroundColor = '#14141C';
        w.querySelector('input').checked = false;
      });
      input.checked = true;
      wrapper.style.backgroundColor = '#6C4DF6';
      selectedAnswers[q.id] = input.value;
    });
  });

  // Navigation
  document.getElementById('answer-form').addEventListener('submit', async function (e) {
    updateProgressBar(index + 1, total_questions);
    e.preventDefault();
    stopTimer();

    const token = localStorage.getItem('access_token');
    const phoneNumber = localStorage.getItem('phone_number');
    const username = localStorage.getItem('username');

    // Build answers array
    const answersArray = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
      question_id: parseInt(questionId),
      selected_option_id: parseInt(answerId)
    }));

    // Base payload
    const payload = {
      answers: answersArray,
      question_durations: questionDurations
    };

    // If no token, add phone number and username to payload
    if (!token) {
      if (phoneNumber && username) {
        payload.phone_number = phoneNumber;
        payload.username = username;
      } else {
        alert('Missing login credentials. Please log in again.');
        return;
      }
    }

    // Headers setup
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
        throw new Error('Submission failed');
      }

      const result = await response.json();

      questionContainer.innerHTML = `
      <div class="card text-white text-center p-4 rounded-4 shadow-lg mt-5" style="background: #0F0F1A; border: 1px solid #261C55; max-width: 500px; margin: auto;">
        <h2 class="mb-4 fw-bold" style="background: linear-gradient(to right, #a855f7, #2dd4bf); -webkit-background-clip: text; color: transparent;">
          Practice Results
        </h2>
        <div class="d-flex justify-content-around mb-4">
          <div class="bg-secondary bg-opacity-10 rounded-3 px-4 py-3">
            <div class="fs-3 fw-bold text-success">${result.correct_answers}</div>
            <div class="small">Correct</div>
          </div>
          <div class="bg-secondary bg-opacity-10 rounded-3 px-4 py-3">
            <div class="fs-3 fw-bold text-danger">${result.wrong_answers}</div>
            <div class="small">Incorrect</div>
          </div>
          <div class="bg-secondary bg-opacity-10 rounded-3 px-4 py-3">
            <div class="fs-3 fw-bold text-warning">${result.score}%</div>
            <div class="small">Score</div>
          </div>
        </div>
        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-outline-light px-4" onclick="window.location.href='/user/leaderboard/'">Leaderboard</button>
          <button class="btn btn-primary px-4" style="background: linear-gradient(to right, #6366f1, #8b5cf6); border: none;" onclick="window.location.href='/questions/'">
            Continue Practice
          </button>
        </div>
      </div>
    `;

    timerDisplay.textContent = '';


    } catch (error) {
      console.error('Submission error:', error);
      questionContainer.innerHTML = `
        <div class="alert alert-danger mt-3" role="alert">
          ❌ Error submitting answers: ${error.message}
        </div>
      `;
    }
  });


  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.addEventListener('click', () => renderQuestion(currentIndex + 1));

  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => renderQuestion(currentIndex - 1));
}






// document.addEventListener('DOMContentLoaded', function () {
//   if(localStorage.getItem('access_token')){
//     fetchSubjects();
//   }
//   else if (
//     !localStorage.getItem('username') &&
//     !localStorage.getItem('phone_number')
//   ) {
//     showUserModal(); // Show popup if user not identified
//   } else {
//     fetchSubjects();
//   }
// });

// // Show user modal
// function showUserModal() {
//   const modalHTML = `
//     <div id="userModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
//          background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
//       <div style="background: white; padding: 30px; border-radius: 8px; max-width: 400px; width: 90%;">
//         <h4>Enter Your Details</h4>
//         <form id="userForm">
//           <input type="text" id="usernameInput" placeholder="Enter your name" class="form-control my-2" required />
//           <input type="text" id="phoneInput" placeholder="Enter your phone number" class="form-control my-2" required />
//           <button type="submit" class="btn btn-primary w-100 mt-2">Continue</button>
//         </form>
//       </div>
//     </div>
//   `;
//   document.body.insertAdjacentHTML('beforeend', modalHTML);

//   const userForm = document.getElementById('userForm');
//   userForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const username = document.getElementById('usernameInput').value;
//     const phone = document.getElementById('phoneInput').value;
//     localStorage.setItem('username', username);
//     localStorage.setItem('phone_number', phone);
//     document.getElementById('userModal').remove();
//     fetchSubjects();
//   });
// }

// // Fetch subjects
// function fetchSubjects() {
//   fetch('/api/subjects/')
//     .then(res => res.json())
//     .then(subjects => {
//       if (Array.isArray(subjects) && subjects.length > 0) {
//         renderSubjectTabs(subjects);
//         fetchQuestions(subjects[0].id);
//       } else {
//         document.getElementById('subjectTabs').innerHTML = '<li class="nav-item">No subjects found.</li>';
//         document.getElementById('questionList').innerHTML = '<li class="list-group-item">No questions to display.</li>';
//       }
//     })
//     .catch(error => console.error('Error fetching subjects:', error));
// }

// // Render subject tabs
// function renderSubjectTabs(subjects) {
//   const tabContainer = document.getElementById('subjectTabs');
//   tabContainer.innerHTML = '';

//   subjects.forEach((subject, index) => {
//     const isActive = index === 0 ? 'active' : '';
//     const isSelected = index === 0 ? 'true' : 'false';

//     const tab = `
//       <li class="nav-item" role="presentation">
//         <button
//           class="nav-link ${isActive}"
//           id="subject-tab-${subject.id}"
//           data-bs-toggle="tab"
//           type="button"
//           role="tab"
//           aria-selected="${isSelected}"
//           onclick="fetchQuestions(${subject.id})"
//         >${subject.name}</button>
//       </li>
//     `;
//     tabContainer.insertAdjacentHTML('beforeend', tab);
//   });
// }

// // Question logic
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

// function formatTime(seconds) {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
// }

// function startTimer() {
//   timerInterval = setInterval(() => {
//     const elapsed = Math.floor((new Date() - quizStartTime) / 1000);
//     if (timerDisplay) {
//       timerDisplay.textContent = `⏱️ Time Spent: ${formatTime(elapsed)}`;
//     }
//   }, 1000);
// }

// function stopTimer() {
//   clearInterval(timerInterval);
// }

// async function fetchQuestions(subjectId) {
//   console.log(localStorage.getItem('access_token'));
//   try {
//     const response = await fetch('/api/start-practice/', {
//       method: 'POST',
//       headers: {
//         // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ subject_id: subjectId })
//     });

//     if (!response.ok) throw new Error('Failed to fetch questions');

//     const data = await response.json();
//     questions = data.questions;
//     currentIndex = 0;
//     quizStartTime = new Date();
//     perQuestionStartTime = new Date();

//     renderQuestion(currentIndex);
//     startTimer();
//   } catch (error) {
//     questionContainer.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
//   }
// }

// function updateProgressBar(currentIndex, totalQuestions) {
//   const percentage = (currentIndex / totalQuestions) * 100;
//   const progressBar = document.getElementById('quiz-progress-bar');
//   progressBar.style.width = percentage + '%';
//   progressBar.setAttribute('aria-valuenow', percentage);
// }

// function loadQuestion(index) {
//   if (index >= 0 && index < total_questions) {
//     updateProgressBar(index + 1, total_questions);
//   }
// }

// function renderQuestion(index) {
//   const q = questions[index];
//   const questionNumber = index + 1;
//   const total = questions.length;
//   total_questions = total;

//   loadQuestion(currentIndex);

//   // Save time for previous question
//   if (questions[currentIndex]) {
//     const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
//     const prevQuestionId = questions[currentIndex].id;
//     questionDurations[prevQuestionId] = (questionDurations[prevQuestionId] || 0) + duration;
//     perQuestionStartTime = new Date();
//   }

//   currentIndex = index;
//   let optionsHTML = '';
//   const optionLetters = ['A', 'B', 'C', 'D'];

//   q.options.forEach((opt, i) => {
//     const optionId = `option${i}`;
//     const label = opt.text
//       ? `${optionLetters[i]}) ${opt.text}`
//       : `${optionLetters[i]}) <img src="${opt.image}" alt="Option Image" class="img-fluid" style="max-height: 80px;">`;

//     const isSelected = String(selectedAnswers[q.id]) === String(opt.id);
//     const bgColor = isSelected
//       ? 'box-shadow: 0px 0px 10px 0px #6C4DF633; border: 1px solid #6C4DF6'
//       : 'background: #14141C;';

//     optionsHTML += `
//       <div class="form-check my-2 option-wrapper border border-1 border-secondary rounded p-2" data-option-id="${opt.id}" style="${bgColor}">
//         <input class="form-check-input d-none" type="radio" name="answer" id="${optionId}" value="${opt.id}" ${isSelected ? 'checked' : ''}>
//         <label class="form-check-label w-100 px-2" for="${optionId}">${label}</label>
//       </div>
//     `;
//   });

//   const questionText = q.text ? `<p class="card-text" style="font-size:20px; font-weight: 500;">${q.text}</p>` : '';
//   const questionImage = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

//   questionContainer.innerHTML = `
//     <div class="card text-light rounded shadow p-3" style="width: 100%; background: #070710;">
//       <div class="card-body">
//         <p class="card-title mb-2" style="color: #B3B3B3;">Question ${questionNumber} of ${total}</p>
//         ${questionText}
//         ${questionImage}
//         <form id="answer-form">
//           ${optionsHTML}
//           <div class="d-flex justify-content-between mt-4">
//             ${index > 0
//               ? `<button type="button" id="prev-btn" class="btn rounded btn-md" style="background: #6C4DF61A; border-color: #6C4DF6;">Previous</button>`
//               : '<div></div>'}
//             ${index < total - 1
//               ? `<button type="button" id="next-btn" class="btn btn-outline-light rounded btn-md" style="background: #6C4DF61A; border-color: #6C4DF6;">Next</button>`
//               : `<button type="submit" class="btn btn-primary rounded btn-md" style="background: linear-gradient(90deg, #6C4DF6 0%, #8A6EFF 100%);">Submit Answer</button>`}
//           </div>
//         </form>
//       </div>
//     </div>
//   `;

//   // Handle option selection
//   const optionWrappers = document.querySelectorAll('.option-wrapper');
//   optionWrappers.forEach(wrapper => {
//     const input = wrapper.querySelector('input');

//     if (input.checked) {
//       wrapper.style.backgroundColor = '#6C4DF6';
//     }

//     wrapper.addEventListener('click', () => {
//       optionWrappers.forEach(w => {
//         w.style.backgroundColor = '';
//         w.querySelector('input').checked = false;
//       });
//       input.checked = true;
//       wrapper.style.backgroundColor = '#6C4DF6';
//       selectedAnswers[q.id] = input.value;
//     });
//   });

//   // Next/Previous navigation
//   document.getElementById('answer-form').addEventListener('submit', function (e) {
//     e.preventDefault();
//     stopTimer();
//     alert('Submit logic here');
//   });

//   const nextBtn = document.getElementById('next-btn');
//   if (nextBtn) nextBtn.addEventListener('click', () => renderQuestion(currentIndex + 1));

//   const prevBtn = document.getElementById('prev-btn');
//   if (prevBtn) prevBtn.addEventListener('click', () => renderQuestion(currentIndex - 1));
// }

