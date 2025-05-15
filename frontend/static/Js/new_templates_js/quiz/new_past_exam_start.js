document.addEventListener('DOMContentLoaded', function() {
    const examId = window.location.pathname.split('/')[3];
    let questions = [];
    let answers = [];
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
            const container = document.getElementById("loader");
            loader.classList.add('d-none');
            console.log(data);
            document.getElementById('exam-info').innerHTML = `<h3 class="text-bold" style="color: #534268; font-size: 36px; font-weight: 800;">${data.title}</h3>`;
            
            // Convert the duration (in minutes) to seconds
            timeRemaining = data.duration * 60;  // Multiply by 60 to convert minutes to seconds
            timerInterval = setInterval(updateTimer, 1000);
            questions = data.questions;
            answers = new Array(questions.length).fill(null);

            // Populate user information
            document.getElementById('user-name').textContent = data.user_name || "Your Name";
            document.getElementById('user-profession').textContent = data.user_profession || "Profession";
            document.getElementById('organization_name').textContent = `---${data.organization_name}---` || "---University of Dhaka---";
            // document.getElementById('exam-info').innerHTML += `<p>Total Questions: ${questions.length}</p>`;
            if (questions.length > 0) showAllQuestions();
        })
        .catch(error => console.error('Error fetching exam details:', error));
    }

    // function showAllQuestions() {
    //     const questionsContainer = document.getElementById('questions-container');
    //     questionsContainer.innerHTML = '';

    //     const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

    //     questions.forEach((question, index) => {
    //         const questionWrapper = document.createElement('div');
    //         questionWrapper.classList.add('col-md-6'); // 2 columns

    //         // Question text
    //         let questionHTML = `<p class="fw-semibold d-flex align-items-start gap-2 mb-2 ">${index + 1}. ${question.question.text}</p>`;
    //         if (question.question.image) {
    //             questionHTML = `
    //                 <p class="fw-semibold">${index + 1}.</p>
    //                 <img src="${question.question.image}" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md">
    //             `;
    //         }

    //         questionWrapper.innerHTML = questionHTML;

    //         // Options container
    //         const optionsContainer = document.createElement('div');
    //         optionsContainer.classList.add('d-grid', 'gap-2');
    //         optionsContainer.style.marginLeft = '2rem';

    //         question.options.forEach((option, optIndex) => {
    //             const inputId = `q${index}_opt${optIndex}`;
    //             const labelChar = optionLabels[optIndex] || '';
    //             const optionText = option.text || `<img src="${option.image}" alt="Option Image" class="img-fluid">`;

    //             const wrapper = document.createElement('div');
    //             wrapper.classList.add('custom-option');

    //             wrapper.innerHTML = `
    //                 <input type="radio" name="question${index}" id="${inputId}" value="${option.id}" class="d-none">
    //                 <label for="${inputId}" class="custom-label">
    //                     <span class="bengali-label" data-char="${labelChar}">${labelChar}</span>
    //                     <span>${optionText}</span>
    //                 </label>
    //             `;

    //             optionsContainer.appendChild(wrapper);
    //         });

    //         questionWrapper.appendChild(optionsContainer);
    //         questionsContainer.appendChild(questionWrapper);
    //     });
    // }


    function showAllQuestions() {
        const questionsContainer = document.getElementById('questions-container');
        questionsContainer.innerHTML = '';

        const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

        questions.forEach((question, index) => {
            const questionWrapper = document.createElement('div');
            questionWrapper.classList.add('col-md-6', 'mb-4', 'border', 'rounded', 'p-3');

            let questionHTML = `<p class="fw-semibold d-flex align-items-start gap-2 mb-2 ">${index + 1}. ${question.question.text}</p>`;
            if (question.question.image) {
                questionHTML = `
                    <p class="fw-semibold">${index + 1}.</p>
                    <img src="${question.question.image}" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md mb-2">
                `;
            }

            questionWrapper.innerHTML += questionHTML;

            // Question Usages Info (under the question, multiple lines)
            const usagesInfoContainer = document.createElement('div');
            usagesInfoContainer.classList.add('mt-2', 'small', 'text-muted');
            usagesInfoContainer.style.marginLeft = '2rem';

            if (question.question_usages && question.question_usages.length > 0) {
                question.question_usages.forEach(usage => {
                    const usageParagraph = document.createElement('p');
                    let usageText = 'Used in: ';
                    if (usage.exam_title) {
                        usageText += `${usage.exam_title}`;
                    }
                    if (usage.year) {
                        usageText += ` (${usage.year})`;
                    }
                    usageParagraph.textContent = usageText;
                    usagesInfoContainer.appendChild(usageParagraph);
                });
            } else {
                const noUsageParagraph = document.createElement('p');
                noUsageParagraph.textContent = 'No usage information available';
                usagesInfoContainer.appendChild(noUsageParagraph);
            }

            questionWrapper.appendChild(usagesInfoContainer);

            // Options container (remains the same)
            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('d-grid', 'gap-2');
            optionsContainer.style.marginLeft = '2rem';

            question.options.forEach((option, optIndex) => {
                const inputId = `q${index}_opt${optIndex}`;
                const labelChar = optionLabels[optIndex] || '';
                const optionText = option.text || `<img src="${option.image}" alt="Option Image" class="img-fluid">`;

                const wrapper = document.createElement('div');
                wrapper.classList.add('custom-option');

                wrapper.innerHTML = `
                    <input type="radio" name="question${index}" id="${inputId}" value="${option.id}" class="d-none">
                    <label for="${inputId}" class="custom-label">
                        <span class="bengali-label" data-char="${labelChar}">${labelChar}</span>
                        <span>${optionText}</span>
                    </label>
                `;

                optionsContainer.appendChild(wrapper);
            });

            questionWrapper.appendChild(optionsContainer);
            questionsContainer.appendChild(questionWrapper);
        });
    }


    document.addEventListener('change', function(event) {
        if (event.target.name.startsWith('question')) {
            saveAnswer(event.target.name);
        }
    });

    document.getElementById('submit-exam').addEventListener('click', function(event) {
        event.preventDefault();  // Prevent form submission to handle it through JavaScript
        for (let i = 0; i < questions.length; i++) {
            if (!answers[i]) {
                answers[i] = { question_id: questions[i].id, option: 'none' };
            }
        }
        submitExam();
    });

    function saveAnswer(questionName) {
        const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
        if (selectedOption) {
            const questionIndex = parseInt(questionName.replace('question', '')); // removed `- 1`
            answers[questionIndex] = {
                question_id: questions[questionIndex].id,
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
            body: JSON.stringify({ answers: formattedAnswers })
        })
        .then(response => response.json())
        .then(data => displayResults(data.correct_answers, data.wrong_answers, data.score, data.is_passed, data))
        .catch(error => console.error('Error submitting exam:', error));
    }

    function displayResults(correctAnswers, wrongAnswers, score, is_passed, data) {
        const totalQuestions = data.total_questions || correctAnswers + wrongAnswers;
        const attempted = correctAnswers + wrongAnswers;
        const notAttempted = totalQuestions - attempted;
        const percentage = ((score / totalQuestions) * 100).toFixed(0);
        const grade = percentage >= 80 ? "A+" : percentage >= 70 ? "A" : percentage >= 60 ? "B" : "F";

        document.getElementById('resultContainer').innerHTML = `
            <div class="answer-sheet-container">
                <div class="answer-sheet-title">Answer Sheet</div>

                <div class="answer-sheet-row">
                    <div class="answer-sheet-label">You Got</div>
                    <div>${grade}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label">Total Questions</div>
                    <div>${totalQuestions}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label">Attempted Answer</div>
                    <div>${attempted}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label right-answer">Right Answer</div>
                    <div class="right-answer">${correctAnswers}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label wrong-answer">Wrong Answer</div>
                    <div class="wrong-answer">${wrongAnswers}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label">Not Attempted</div>
                    <div>${notAttempted}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label">Your Mark</div>
                    <div>${score}/${totalQuestions}</div>
                </div>
                <div class="answer-sheet-row">
                    <div class="answer-sheet-label total-result">Total Result</div>
                    <div class="total-result">${percentage}%</div>
                </div>
                <div class="flex justify-content-between align-items-center">
                    <button class="btn again-try-button" onclick="location.reload()">Again try</button>
                    <button class="btn back-button ruounded text-white" onclick="window.history.back()">Back</button>
                </div>
                
            </div>
        `;

        const modalElement = document.getElementById('resultsModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Optional: redirect on close
        modalElement.addEventListener('hidden.bs.modal', function () {
            window.location.href = `/new_past_exam_details/${examId}/`;
        });
    }


    fetchExamDetails();
});
