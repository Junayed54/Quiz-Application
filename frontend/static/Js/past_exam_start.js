document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3];
    let currentQuestionIndex = 0;
    let questions = [];
    let answers = [];
    let skippedQuestions = [];
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    let timeRemaining;
    const timeDisplay = document.getElementById('time-remaining');
    let timerInterval;

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
            submitExam();
        }
    }

    function fetchExamDetails() {
        fetch(`/quiz/past-exams/${examId}/`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('exam-info').innerHTML = `<h3 class="text-xl font-bold">${data.title}</h3>`;
            
            // Convert the duration (in minutes) to seconds
            timeRemaining = data.duration * 60;  // Multiply by 60 to convert minutes to seconds
            
            timerInterval = setInterval(updateTimer, 1000);
            questions = data.questions;
            answers = new Array(questions.length).fill(null);
            document.getElementById('exam-info').innerHTML += `<p>Total Questions: ${questions.length}</p>`;
            updateSkippedCount();
            if (questions.length > 0) showQuestion(currentQuestionIndex);
        })
        .catch(error => console.error('Error fetching exam details:', error));
    }
    

    // function showQuestion(index) {
    //     const question = questions[index];
    //     document.getElementById('question-text').textContent = `Question ${index + 1}: ${question.text}`;
    //     const usesSection = document.getElementById('uses-section');
        
    //     usesSection.innerHTML = `<strong>Uses:</strong> (${question.question_usage_years})`;
    //     const optionsContainer = document.getElementById('options-container');
    //     optionsContainer.innerHTML = '';
    //     question.options.forEach(option => {
    //         const optionElement = document.createElement('div');
    //         optionElement.classList.add('form-check');
    //         optionElement.innerHTML = `
    //             <input type="radio" name="option" value="${option.id}" id="option${option.id}" class="hidden">
    //             <label for="option${option.id}" 
    //                 class="block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100"
    //                 style="background:#57A6A1; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center;">
    //                 ${option.text}
    //             </label>
    //         `;
            
    //         optionsContainer.appendChild(optionElement);
    //     });

    //     const selectedAnswer = answers[index] && answers[index].option;
    //     if (selectedAnswer) document.querySelector(`input[name="option"][value="${selectedAnswer}"]`).checked = true;
    //     toggleButtonVisibility(index);
    //     document.getElementById('next-question').disabled = !selectedAnswer;
    //     updateSkipButtonVisibility();
    // }


    function showQuestion(index) {
        const question = questions[index];
        // console.log(question.question.text);
        const questionContainer = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const usesSection = document.getElementById('uses-section');
    
        // Clear previous content
        questionContainer.innerHTML = '';
        optionsContainer.innerHTML = '';
    
        // Display question text or image
        if (question.question.image) {
            // If the question has an image
            questionContainer.innerHTML = `
                <p class="text-lg font-semibold">Question ${index + 1}:</p>
                <img src="${question.question.image}" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md">
            `;
        } else {
            // If the question is text-based
            questionContainer.innerHTML = `<p class="text-lg font-semibold">Question ${index + 1}: ${question.question.text}</p>`;
        }
    
        // Display the usage section
        // usesSection.innerHTML = `<strong>Uses:</strong> (${question.question_usage_years})`;
    
        // Display options (either text or image)
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('form-check');
    
            if (option.image) {
                // Option with an image
                optionElement.innerHTML = `
                    <input type="radio" name="option" value="${option.id}" id="option${option.id}" class="hidden">
                    <label for="option${option.id}" class="block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100"
                        style="background: #57A6A1; width: 100%; height: auto; display: flex; align-items: center; justify-content: center;">
                        <img src="${option.image}" alt="Option Image" class="max-w-full h-auto rounded-lg shadow-md">
                    </label>
                `;
            } else {
                // Option with text
                optionElement.innerHTML = `
                    <input type="radio" name="option" value="${option.id}" id="option${option.id}" class="hidden">
                    <label for="option${option.id}" class="block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100"
                        style="background: #57A6A1; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center;">
                        ${option.text}
                    </label>
                `;
            }
    
            optionsContainer.appendChild(optionElement);
        });
    
        // Restore the previously selected answer if available
        const selectedAnswer = answers[index] && answers[index].option;
        if (selectedAnswer) {
            document.querySelector(`input[name="option"][value="${selectedAnswer}"]`).checked = true;
        }
    
        // Manage button visibility
        toggleButtonVisibility(index);
        document.getElementById('next-question').disabled = !selectedAnswer;
        updateSkipButtonVisibility();
    }
    

    function toggleButtonVisibility(index) {
        document.getElementById('prev-question').classList.toggle('d-none', index === 0);
        document.getElementById('next-question').classList.toggle('d-none', index === questions.length - 1);
        document.getElementById('submit-exam').classList.toggle('d-none', index !== questions.length - 1);
        document.getElementById('skip-question').classList.toggle('d-none', index === questions.length - 1);
    }

    function updateSkipButtonVisibility() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        document.getElementById('skip-question').classList.toggle('d-none', !!selectedOption);
    }

    function updateReviewSkippedButton() {
        document.getElementById('review-skipped').classList.toggle('d-none', skippedQuestions.length === 0);
    }

    document.addEventListener('change', function(event) {
        if (event.target.name === 'option') {
            saveAnswer();
            updateSkipButtonVisibility();
            document.getElementById('next-question').disabled = false;

            const index = skippedQuestions.indexOf(currentQuestionIndex);
            if (index > -1) {
                skippedQuestions.splice(index, 1);
                updateSkippedCount();
            }
        }
    });

    document.getElementById('next-question').addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    });

    document.getElementById('skip-question').addEventListener('click', function() {
        if (!skippedQuestions.includes(currentQuestionIndex)) {
            skippedQuestions.push(currentQuestionIndex);
            updateSkippedCount();
        }
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
        updateReviewSkippedButton();
    });

    document.getElementById('prev-question').addEventListener('click', function() {
        if (currentQuestionIndex > 0) currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    });

    document.getElementById('review-skipped').addEventListener('click', function(event) {
        event.preventDefault();
        if (skippedQuestions.length > 0) {
            currentQuestionIndex = skippedQuestions[0];
            updateSkippedCount();
            showQuestion(currentQuestionIndex);
        }
    });

    document.getElementById('submit-exam').addEventListener('click', function() {
        for (let i = 0; i < questions.length; i++) {
            if (!answers[i]) {
                answers[i] = { question_id: questions[i].id, option: 'none' };
            }
        }
        submitExam();
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
        clearInterval(timerInterval);
        
        // Preparing the answers array with correct key names
        const formattedAnswers = answers.map(answer => ({
            question_id: answer.question_id,
            selected_option_id: answer.option // Changed from `option` to `selected_option_id`
        }));
        
    
        fetch(`/quiz/past-exams/${examId}/submit/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ answers: formattedAnswers }) // Sending correctly formatted answers
        })
        .then(response => response.json())
        .then(data => displayResults(data.correct_answers, data.wrong_answers, data.score, data.is_passed, data))
        .catch(error => console.error('Error submitting exam:', error));
    }
    

    function updateSkippedCount() {
        document.getElementById('skipped-questions').textContent = `Skipped Questions: ${skippedQuestions.length}`;
        updateReviewSkippedButton();
    }

    function displayResults(correctAnswers, wrongAnswers, passed, is_passed, data) {
        document.getElementById('resultContainer').innerHTML = `
            <h4 class="text-center">Exam Submitted!</h4>
            <p><strong>Correct Answers:</strong> ${correctAnswers}</p>
            <p><strong>Wrong Answers:</strong> ${wrongAnswers}</p>
            <p><strong>Status:</strong> ${is_passed ? '<span class="text-success">Passed</span>' : '<span class="text-danger">Failed</span>'}</p>
            <p><strong>Skipped Questions:</strong> ${skippedQuestions.length}</p>
        `;
        
        const modalElement = document.getElementById('resultsModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalElement.addEventListener('hidden.bs.modal', function() {
            window.location.href = `/quiz/past_exam_details/${examId}/`;
        });
    }

    fetchExamDetails();
});
