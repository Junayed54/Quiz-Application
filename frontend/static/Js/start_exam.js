document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3];
    let currentQuestionIndex = 0;
    let questions = [];
    let answers = []; // Holds selected answers for each question
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    let timeRemaining;
    const timeDisplay = document.getElementById('time-remaining');
    let timerInterval;

    // Initialize timer
    function updateTimer() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timeRemaining > 0) {
            timeRemaining--;
        } else {
            clearInterval(timerInterval);
            document.getElementById('submit-exam').disabled = true;
            document.getElementById('submit-exam').textContent = 'Time’s up';
            submitExam(); // Auto-submit when time is up
        }
    }

    // Fetch exam details, including dynamic duration
    function fetchExamDetails() {
        fetch(`/quiz/exams/${examId}/start/`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(response => response.json())
        .then(data => {
            const examInfo = document.getElementById('exam-info');
            examInfo.innerHTML = `<h3 class="text-xl font-bold">${data.title}</h3>`;
            timeRemaining = data.duration; // Duration in seconds
            timerInterval = setInterval(updateTimer, 1000);
            fetchQuestions();
        })
        .catch(error => console.error('Error fetching exam details:', error));
    }

    // Fetch questions and handle display
    function fetchQuestions() {
        fetch(`/quiz/exams/${examId}/questions/`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(response => response.json())
        .then(data => {
            questions = data.questions;
            answers = new Array(questions.length).fill(null); // Initialize answers array
            document.getElementById('exam-info').innerHTML += `<p>Total Questions: ${questions.length}</p>`;
            if (questions.length > 0) showQuestion(currentQuestionIndex);
        })
        .catch(error => console.error('Error fetching questions:', error));
    }

    // Display question based on the index
    function showQuestion(index) {
        const questionText = document.getElementById('question-text');
        const question = questions[index];
        questionText.textContent = `Question ${index + 1}: ${question.text}`;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('form-check');
            optionElement.innerHTML = `
                <input type="radio" name="option" value="${option.id}" class="form-check-input" id="option${option.id}">
                <label class="form-check-label" for="option${option.id}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        // Load previously selected answer if exists
        const selectedAnswer = answers[index] && answers[index].option;
        if (selectedAnswer) document.querySelector(`input[name="option"][value="${selectedAnswer}"]`).checked = true;

        // Update button visibility
        document.getElementById('prev-question').classList.toggle('d-none', index === 0);
        document.getElementById('next-question').classList.toggle('d-none', index === questions.length - 1);
        document.getElementById('submit-exam').classList.toggle('d-none', index !== questions.length - 1);
        document.getElementById('skip-question').classList.toggle('d-none', index === questions.length - 1);
        document.getElementById('next-question').disabled = true;

        // Check if any option is selected and enable Next button accordingly
        checkNextButton();
    }

    function checkNextButton() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        document.getElementById('next-question').disabled = !selectedOption;
    }

    document.addEventListener('change', function(event) {
        if (event.target.name === 'option') {
            saveAnswer(); // Save selected answer
            checkNextButton();
        }
    });

    document.getElementById('next-question').addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    });

    document.getElementById('skip-question').addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    });

    document.getElementById('prev-question').addEventListener('click', function() {
        if (currentQuestionIndex > 0) currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    });

    // Submit exam function
    document.getElementById('submit-exam').addEventListener('click', function() {
        if (saveAnswer()) {
            // Check all answers for unanswered questions before submission
            for (let i = 0; i < questions.length; i++) {
                if (!answers[i]) {
                    answers[i] = {
                        question_id: questions[i].id,
                        option: 'none'
                    };
                }
            }
            submitExam();
        } else {
            alert("Please select an option before submitting the exam.");
        }
    });

    function saveAnswer() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption) {
            answers[currentQuestionIndex] = {
                question_id: questions[currentQuestionIndex].id,
                option: selectedOption.value
            };
            return true;
        } else {
            return false;
        }
    }

    function submitExam() {
        fetch(`/quiz/exams/${examId}/submit/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ answers: answers })
        })
        .then(response => response.json())
        .then(data => displayResults(data.correct_answers, data.wrong_answers, data.passed))
        .catch(error => console.error('Error submitting exam:', error));
    }

    function displayResults(correctAnswers, wrongAnswers, passed) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = `
            <h3>Exam Submitted!</h3>
            <p>Correct Answers: ${correctAnswers}</p>
            <p>Wrong Answers: ${wrongAnswers}</p>
            <p>Status: ${passed ? 'Passed' : 'Failed'}</p>
        `;
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    fetchExamDetails();
});
