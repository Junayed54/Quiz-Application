document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3];
    let currentQuestionIndex = 0;
    let questions = [];
    let answers = [];
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    function fetchExamDetails() {
        fetch(`/quiz/exams/${examId}/start/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("The data:", data)
            document.getElementById('exam-info').innerHTML = `
                <h3 class="text-xl font-bold">${data.title}</h3>
            `;
            fetchQuestions();
        })
        .catch(error => {
            console.error('Error fetching exam details:', error);
        });
    }

    function fetchQuestions() {
        fetch(`/quiz/exams/${examId}/questions/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            questions = data;
            document.getElementById('exam-info').innerHTML += `
                <p>Total Questions: ${questions.length}</p>
            `;
            
            if (questions.length > 0) {
                showQuestion(0);
            } else {
                console.error('No questions available.');
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
        });
    }

    function submitExam() {
        console.log(answers);
        fetch(`/quiz/exams/${examId}/submit/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ answers: answers })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result-container').classList.remove('d-none');
            document.getElementById('question-container').classList.add('d-none');
            document.getElementById('result-text').textContent = `Correct Answers: ${data.correct_answers}, Wrong Answers: ${data.wrong_answers}`;
        })
        .catch(error => {
            console.error('Error submitting exam:', error);
        });
    }

    document.getElementById('next-question').addEventListener('click', function() {
        if (saveAnswer()) {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            }
        } else {
            alert("Please select an option before proceeding to the next question.");
        }
    });

    document.getElementById('prev-question').addEventListener('click', function() {
        saveAnswer();
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    document.getElementById('submit-exam').addEventListener('click', function() {
        if (saveAnswer()) {
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

    function showQuestion(index) {
        const question = questions[index];
        
        // Display question number and text
        document.getElementById('question-text').textContent = `Question ${index + 1}: ${question.text}`;
        
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
    
        // Make sure question container is visible
        document.getElementById('question-container').classList.remove('d-none');
    
        // Show or hide Previous button based on question index
        document.getElementById('prev-question').classList.toggle('d-none', index === 0);
        
        // Hide Next button on last question, show otherwise
        document.getElementById('next-question').classList.toggle('d-none', index === questions.length - 1);
        
        // Show Submit button on last question, hide otherwise
        document.getElementById('submit-exam').classList.toggle('d-none', index !== questions.length - 1);
    }
    

    fetchExamDetails();
});
