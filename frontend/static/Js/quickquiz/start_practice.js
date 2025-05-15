
// let questions = [];
// let currentIndex = 0;
// let selectedAnswers = {};       // {question_id: option_id}
// let questionDurations = {};     // {question_id: seconds}
// let quizStartTime;
// let perQuestionStartTime;
// let sessionId = null;

// const questionContainer = document.getElementById('question-container');

// // Fetch questions from API
// async function fetchQuestions() {
//   try {
//     const response = await fetch('/api/start-practice/', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) throw new Error('Failed to fetch questions');

//     const data = await response.json();
    
//     questions = data.questions;
//     sessionId = data.session.id;
//     currentIndex = 0;
//     quizStartTime = new Date();
//     perQuestionStartTime = new Date();
//     renderQuestion(currentIndex);
//   } catch (error) {
//     questionContainer.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
//   }
// }

// // Render a question
// function renderQuestion(index) {
//   const q = questions[index];
//   const questionNumber = index + 1;
//   const total = questions.length;

//   // Save previous question duration
//   if (questions[currentIndex]) {
//     const duration = Math.floor((new Date() - perQuestionStartTime) / 1000);
//     const prevQuestionId = questions[currentIndex].id;
//     questionDurations[prevQuestionId] = (questionDurations[prevQuestionId] || 0) + duration;
//     perQuestionStartTime = new Date(); // reset timer
//   }

//   currentIndex = index;

//   let optionsHTML = '';
//   q.options.forEach((opt, i) => {
//     const optionId = `option${i}`;
//     const label = opt.text
//       ? opt.text
//       : `<img src="${opt.image}" alt="Option Image" class="img-fluid" style="max-height: 80px;">`;

//     const isSelected = String(selectedAnswers[q.id]) === String(opt.id);
//     const bgColor = isSelected ? 'background-color: #6C4DF6;' : '';

//     optionsHTML += `
//       <div class="form-check my-2 option-wrapper border border-1 border-secondary rounded p-2" data-option-id="${opt.id}" style="${bgColor}">
//         <input class="form-check-input d-none" type="radio" name="answer" id="${optionId}" value="${opt.id}" ${isSelected ? 'checked' : ''}>
//         <label class="form-check-label w-100" for="${optionId}">${label}</label>
//       </div>
//     `;
//   });

//   const questionText = q.text ? `<p class="card-text">${q.text}</p>` : '';
//   const questionImage = q.image ? `<img src="${q.image}" alt="Question Image" class="img-fluid mb-2">` : '';

//   questionContainer.innerHTML = `
//     <div class="card text-light rounded shadow p-3" style="width: 100%; background: #070710;">
//       <div class="card-body">
//         <h5 class="card-title mb-2">Question ${questionNumber} of ${total}</h5>
//         ${questionText}
//         ${questionImage}

//         <form id="answer-form">
//           ${optionsHTML}

//           <div class="d-flex justify-content-between mt-4">
//             ${index > 0 ? `<button type="button" id="prev-btn" class="btn btn-outline-light rounded-pill btn-sm">Previous</button>` : `<div></div>`}
//             ${index < total - 1
//               ? `<button type="button" id="next-btn" class="btn btn-outline-light rounded-pill btn-sm">Next</button>`
//               : `<button type="submit" class="btn btn-primary rounded-pill btn-sm">Submit</button>`}
//           </div>
//         </form>
//       </div>
//     </div>
//   `;

//   // Option highlight and save on click
//   const optionWrappers = document.querySelectorAll('.option-wrapper');
//   optionWrappers.forEach(wrapper => {
//     const input = wrapper.querySelector('input');

//     // Highlight if selected
//     if (input.checked) {
//       wrapper.style.backgroundColor = '#6C4DF6';
//     }

//     // Handle selection + immediate save
//     wrapper.addEventListener('click', () => {
//       optionWrappers.forEach(w => {
//         w.style.backgroundColor = '';
//         w.querySelector('input').checked = false;
//       });
//       input.checked = true;
//       wrapper.style.backgroundColor = '#6C4DF6';

//       selectedAnswers[q.id] = parseInt(input.value); // Save immediately
//     });
//   });

//   // Button: Previous
//   const prevBtn = document.getElementById('prev-btn');
//   if (prevBtn) {
//     prevBtn.onclick = () => {
//       if (currentIndex > 0) {
//         currentIndex--;
//         renderQuestion(currentIndex);
//       }
//     };
//   }

//   // Button: Next
//   const nextBtn = document.getElementById('next-btn');
//   if (nextBtn) {
//     nextBtn.onclick = () => {
//       if (currentIndex < questions.length - 1) {
//         currentIndex++;
//         renderQuestion(currentIndex);
//       }
//     };
//   }

//   // Final submit
//   const answerForm = document.getElementById('answer-form');
//   answerForm.onsubmit = (e) => {
//     e.preventDefault();

//     // Optional: alert if last question has no answer
//     const selected = document.querySelector('input[name="answer"]:checked');
//     if (selected) {
//       selectedAnswers[q.id] = parseInt(selected.value);
//     }

//     submitAllAnswers();
//   };
// }

// // Final submission
// async function submitAllAnswers() {
//   const lastDuration = Math.floor((new Date() - perQuestionStartTime) / 1000);
//   const lastQuestionId = questions[currentIndex].id;
//   questionDurations[lastQuestionId] = (questionDurations[lastQuestionId] || 0) + lastDuration;

//   const totalDuration = Math.floor((new Date() - quizStartTime) / 1000);

//   const answersList = Object.entries(selectedAnswers).map(([question_id, option_id]) => ({
//     question_id: parseInt(question_id),
//     option_id: option_id
//   }));

//   const payload = {
//     session_id: sessionId,
//     answers: answersList,
//     duration: Math.round(totalDuration / 60)
//   };

//   try {
//     const response = await fetch('/api/submit-practice/', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(payload)
//     });

//     if (!response.ok) throw new Error('Submission failed');

//     const data = await response.json();
//     alert("Submitted successfully!");
//     // TODO: Show results or redirect
//   } catch (err) {
//     alert("Error submitting answers: " + err.message);
//   }
// }

// // Start the quiz
// fetchQuestions();




let questions = [];
let currentIndex = 0;
let selectedAnswers = {};
let questionDurations = {};
let quizStartTime;
let perQuestionStartTime;
let sessionId = null;
let timerInterval = null;

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

// Render a question
function renderQuestion(index) {
  const q = questions[index];
  const questionNumber = index + 1;
  const total = questions.length;

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

    const data = await response.json();
    alert("Submitted successfully!");
    // Optional: redirect or show results
  } catch (err) {
    alert("Error submitting answers: " + err.message);
  }
}

// Start quiz
fetchQuestions();
