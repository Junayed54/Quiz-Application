// document.addEventListener('DOMContentLoaded', function() {
//     const examId = window.location.pathname.split('/')[3];
//     let questions = [];
//     let answers = [];
//     const accessToken = localStorage.getItem('access_token');
    
//     if (!accessToken) {
//         window.location.href = '/login/';
//         return;
//     }


    


//     let timeRemaining;
//     const timeDisplay = document.getElementById('time-remaining');
//     let timerInterval;

//     function updateTimer() {
//         const minutes = Math.floor(timeRemaining / 60);
//         const seconds = timeRemaining % 60;
//         timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//         if (timeRemaining > 0) {
//             timeRemaining--;
//         } else {
//             clearInterval(timerInterval);
//             document.getElementById('submit-exam').disabled = true;
//             document.getElementById('submit-exam').textContent = 'Time’s up';
//             submitExam();
//         }
//     }

//     function fetchExamDetails(isLimitedAccess) {
//         fetch(`/quiz/past-exams/${examId}/`, {
//             method: 'GET',
//             headers: { 'Authorization': `Bearer ${accessToken}` }
//         })
//         .then(response => response.json())
//         .then(data => {
//             const container = document.getElementById("loader");
//             loader.classList.add('d-none');
//             console.log(data);
//             document.getElementById('exam-info').innerHTML = `<h3 class="text-bold" style="color: #534268; font-size: 36px; font-weight: 800;">${data.title}</h3>`;
            
//             // Convert the duration (in minutes) to seconds
//             timeRemaining = data.duration * 60;  // Multiply by 60 to convert minutes to seconds
//             timerInterval = setInterval(updateTimer, 1000);
//             questions = data.questions;
//             // answers = new Array(questions.length).fill(null);

//             // Populate user information
//             document.getElementById('user-name').textContent = data.user_name || "Your Name";
//             document.getElementById('user-profession').textContent = data.user_profession || "Profession";
//             document.getElementById('organization_name').textContent = `---${data.organization_name}---` || "---University of Dhaka---";
//             // document.getElementById('exam-info').innerHTML += `<p>Total Questions: ${questions.length}</p>`;
//             // if (questions.length > 0) showAllQuestions(isLimitedAccess);
//              if (!isLimitedAccess) {
//                 // Restrict to first 10 questions
//                 questions = data.questions.slice(0, 10);
//                 answers = new Array(questions.length).fill(null);

//                 // Disable scroll
//                 document.body.style.overflow = 'hidden';

//                 // Disable interaction
//                 document.getElementById('submit-exam').disabled = true;

//                 // Add message overlay
//                 const blocker = document.createElement('div');
//                 blocker.style.position = 'fixed';
//                 blocker.style.top = '0';
//                 blocker.style.left = '0';
//                 blocker.style.width = '100%';
//                 blocker.style.height = '100%';
//                 blocker.style.background = 'rgba(0, 0, 0, 0.7)';
//                 blocker.style.zIndex = '9999';
//                 blocker.style.display = 'flex';
//                 blocker.style.alignItems = 'center';
//                 blocker.style.justifyContent = 'center';
//                 blocker.innerHTML = `
//                     <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center; max-width: 400px;">
//                         <h2 class="mb-3" style="color: #dc2626;">Subscription Required</h2>
//                         <p class="mb-4">Buy a subscription to access full features.</p>
//                         <a href="/subscription/" class="btn btn-primary">Buy Subscription</a>
//                     </div>
//                 `;
//                 document.body.appendChild(blocker);
//             } else {
//                 // Full access
//                 questions = data.questions;
//                 answers = new Array(questions.length).fill(null);
//             }

//             if (questions.length > 0) showAllQuestions(isLimitedAccess);
//         })
//         .catch(error => console.error('Error fetching exam details:', error));
//     }





//     // checck permission
    

//     function showAllQuestions(isLimitedAccess) {
//         const questionsContainer = document.getElementById('questions-container');
//         questionsContainer.innerHTML = '';

//         const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

//         questions.forEach((question, index) => {
//             const questionWrapper = document.createElement('div');
//             questionWrapper.classList.add('col-md-6', 'mb-4', 'border', 'rounded', 'p-3');
//             questionWrapper.setAttribute('data-question-index', index);

//             if (index >= 10 && !isLimitedAccess) {
//                 questionWrapper.classList.add('restricted-question');
//             }
//             let questionHTML = `<p class="fw-semibold d-flex align-items-start gap-2 mb-2 ">${index + 1}. ${question.question.text}</p>`;
//             if (question.question.image) {
//                 questionHTML = `
//                     <p class="fw-semibold">${index + 1}.</p>
//                     <img src="${question.question.image}" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md mb-2">
//                 `;
//             }

//             questionWrapper.innerHTML += questionHTML;

//             // Question Usages Info (under the question, multiple lines)
//             const usagesInfoContainer = document.createElement('div');
//             usagesInfoContainer.classList.add('mt-2', 'small', 'text-muted');
//             usagesInfoContainer.style.marginLeft = '2rem';

//             if (question.question_usages && question.question_usages.length > 0) {
//             const details = document.createElement('details');
//             const summary = document.createElement('summary');
//             summary.textContent = `Used in ${question.question_usages.length} exam${question.question_usages.length > 1 ? 's' : ''}`;
//             summary.style.cursor = 'pointer';
//             details.appendChild(summary);

//             question.question_usages.forEach(usage => {
//                 const usageParagraph = document.createElement('p');
//                 usageParagraph.classList.add('mb-1');
//                 let usageText = '';
//                 if (usage.exam_title) {
//                     usageText += `${usage.exam_title}`;
//                 }
//                 if (usage.year) {
//                     usageText += ` (${usage.year})`;
//                 }
//                 usageParagraph.textContent = usageText;
//                 usageParagraph.style.marginLeft = '1rem';
//                 details.appendChild(usageParagraph);
//             });

//             usagesInfoContainer.appendChild(details);

//             } else {
//                 const noUsageParagraph = document.createElement('p');
//                 noUsageParagraph.textContent = 'No usage information available';
//                 usagesInfoContainer.appendChild(noUsageParagraph);
//             }

//             // Create usage details section (above options)
//             if (question.question_usages && question.question_usages.length > 0) {
//                 // Create relative container for positioning
//                 const usageWrapper = document.createElement('div');
//                 usageWrapper.classList.add('position-relative');

//                 // Create toggle button
//                 const toggleButton = document.createElement('button');
//                 toggleButton.textContent = `Show Usage Info`;
//                 toggleButton.classList.add('btn', 'btn-sm', 'mb-2', 'bg-info','text-white');
//                 toggleButton.type = 'button';
//                 toggleButton.style.marginLeft = '30px';
//                 // Create usage overlay box
//                 const usageOverlay = document.createElement('div');
//                 usageOverlay.classList.add('position-absolute', 'bg-white', 'border', 'rounded', 'shadow', 'px-2');
//                 usageOverlay.style.top = '2.2rem'; // Adjust based on your layout
//                 usageOverlay.style.left = '30px';
//                 usageOverlay.style.right = '0';
//                 usageOverlay.style.zIndex = '10';
//                 usageOverlay.style.display = 'none';
//                 usageOverlay.style.maxHeight = '200px';
//                 usageOverlay.style.overflowY = 'auto';

//                 if (question.question_usages && question.question_usages.length > 0) {
//                     question.question_usages.forEach(usage => {
//                         const usageParagraph = document.createElement('p');
//                         usageParagraph.classList.add('mb-1', 'text-sm');
//                         let usageText = '';
//                         if (usage.exam_title) usageText += `${usage.exam_title}`;
//                         if (usage.year) usageText += ` (${usage.year})`;
//                         usageParagraph.textContent = usageText;
//                         usageOverlay.appendChild(usageParagraph);
//                     });
//                 } else {
//                     const noUsage = document.createElement('p');
//                     noUsage.textContent = 'No usage information available';
//                     usageOverlay.appendChild(noUsage);
//                 }

//                 // Toggle logic
//                 toggleButton.addEventListener('click', () => {
//                     const isVisible = usageOverlay.style.display === 'block';
//                     usageOverlay.style.display = isVisible ? 'none' : 'block';
//                     toggleButton.textContent = isVisible ? 'Show Usage Info' : 'Hide Usage Info';
//                 });

//                 // Append elements
//                 usageWrapper.appendChild(toggleButton);
//                 usageWrapper.appendChild(usageOverlay);
//                 questionWrapper.appendChild(usageWrapper);

//             }


//             // Options container (remains the same)
//             const optionsContainer = document.createElement('div');
//             optionsContainer.classList.add('d-grid', 'gap-2');
//             optionsContainer.style.marginLeft = '2rem';

//             question.options.forEach((option, optIndex) => {
//                 const inputId = `q${index}_opt${optIndex}`;
//                 const labelChar = optionLabels[optIndex] || '';
//                 const optionText = option.text || `<img src="${option.image}" alt="Option Image" class="img-fluid">`;

//                 const wrapper = document.createElement('div');
//                 wrapper.classList.add('custom-option');

//                 wrapper.innerHTML = `
//                     <input type="radio" name="question${index}" id="${inputId}" value="${option.id}" class="d-none">
//                     <label for="${inputId}" class="custom-label">
//                         <span class="bengali-label" data-char="${labelChar}">${labelChar}</span>
//                         <span>${optionText}</span>
//                     </label>
//                 `;

//                 optionsContainer.appendChild(wrapper);
//             });

//             questionWrapper.appendChild(optionsContainer);
//             questionsContainer.appendChild(questionWrapper);
//         });
//         if (!isLimitedAccess) {
//             window.addEventListener('scroll', showBuySubscriptionOnScroll);
//         }
//     }


//     document.addEventListener('change', function(event) {
//         if (event.target.name.startsWith('question')) {
//             saveAnswer(event.target.name);
//         }
//     });

//     document.getElementById('submit-exam').addEventListener('click', function(event) {
//         event.preventDefault();  // Prevent form submission to handle it through JavaScript
//         for (let i = 0; i < questions.length; i++) {
//             if (!answers[i]) {
//                 answers[i] = { question_id: questions[i].id, option: 'none' };
//             }
//         }
//         submitExam();
//     });




    

//     function saveAnswer(questionName) {
//         const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
//         if (selectedOption) {
//             const questionIndex = parseInt(questionName.replace('question', '')); // removed `- 1`
//             answers[questionIndex] = {
//                 question_id: questions[questionIndex].id,
//                 option: selectedOption.value
//             };
//             return true;
//         } else {
//             return false;
//         }
//     }

//     function submitExam() {
//         clearInterval(timerInterval);
        
//         // Preparing the answers array with correct key names
//         const formattedAnswers = answers.map(answer => ({
//             question_id: answer.question_id,
//             selected_option_id: answer.option // Changed from `option` to `selected_option_id`
//         }));

//         fetch(`/quiz/past-exams/${examId}/submit/`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`
//             },
//             body: JSON.stringify({ answers: formattedAnswers })
//         })
//         .then(response => response.json())
//         .then(data => displayResults(data.correct_answers, data.wrong_answers, data.score, data.is_passed, data))
//         .catch(error => console.error('Error submitting exam:', error));
//     }

//     function displayResults(correctAnswers, wrongAnswers, score, is_passed, data) {
//         const totalQuestions = data.total_questions || correctAnswers + wrongAnswers;
//         const attempted = correctAnswers + wrongAnswers;
//         const notAttempted = totalQuestions - attempted;
//         const percentage = ((score / totalQuestions) * 100).toFixed(0);
//         const grade = percentage >= 80 ? "A+" : percentage >= 70 ? "A" : percentage >= 60 ? "B" : "F";

//         document.getElementById('resultContainer').innerHTML = `
//             <div class="answer-sheet-container">
//                 <div class="answer-sheet-title">Answer Sheet</div>

//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label">You Got</div>
//                     <div>${grade}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label">Total Questions</div>
//                     <div>${totalQuestions}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label">Attempted Answer</div>
//                     <div>${attempted}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label right-answer">Right Answer</div>
//                     <div class="right-answer">${correctAnswers}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label wrong-answer">Wrong Answer</div>
//                     <div class="wrong-answer">${wrongAnswers}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label">Not Attempted</div>
//                     <div>${notAttempted}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label">Your Mark</div>
//                     <div>${score}/${totalQuestions}</div>
//                 </div>
//                 <div class="answer-sheet-row">
//                     <div class="answer-sheet-label total-result">Total Result</div>
//                     <div class="total-result">${percentage}%</div>
//                 </div>
//                 <div class="flex justify-content-between align-items-center">
//                     <button class="btn again-try-button" onclick="location.reload()">Again try</button>
//                     <button class="btn back-button ruounded text-white" onclick="window.history.back()">Back</button>
//                 </div>
                
//             </div>
//         `;

//         const modalElement = document.getElementById('resultsModal');
//         const modal = new bootstrap.Modal(modalElement);
//         modal.show();

//         // Optional: redirect on close
//         modalElement.addEventListener('hidden.bs.modal', function () {
//             window.location.href = `/new_past_exam_details/${examId}/`;
//         });
//     }


//     function checkUserPermission() {
//         fetch(`/api/check-permission/${examId}/`, {
//             method: 'GET',
//             headers: { 'Authorization': `Bearer ${accessToken}` }
//         })
//         .then(response => response.json())
//         .then(data => {
           
//             if (data.has_access===true) {
//                 console.log("hello");
//                 fetchExamDetails(true);
//             } else {
//                 console.log("hello world");
//                 fetchExamDetails(false); // Pass a flag indicating limited access
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching user permissions:', error);
//             // Optionally, handle errors by redirecting to an error page or showing a message
//         });
//     }

   
//     checkUserPermission();

// });



document.addEventListener('DOMContentLoaded', function(){
    const examId = window.location.pathname.split('/')[3];
    let questions = [];
    let answers = [];
    const accessToken = localStorage.getItem('access_token');
    const questionsContainer = document.getElementById('questions-container');
    const submitButton = document.getElementById('submit-exam');
    const subscriptionDiv = document.getElementById('subscription-section'); // Assuming you have a div with this ID
    let questionsShownCount = 0;

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
            submitButton.disabled = true;
            submitButton.textContent = 'Time’s up';
            submitExam();
        }
    }

    function fetchExamDetails(isLimitedAccess) {
        fetch(`/quiz/exams/${examId}/`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(response => response.json())
        .then(data => {
            const loader = document.getElementById("loader");
            loader.classList.add('d-none');
            console.log(data);
            document.getElementById('exam-info').innerHTML = `<h3 class="text-bold" style="color: #534268; font-size: 36px; font-weight: 800;">${data.title}</h3>`;

            // --- Start of new logic for duration ---
            const durationParts = data.duration.split(':'); // Splits "00:10:00" into ["00", "10", "00"]
            const hours = parseInt(durationParts[0] || '0');
            const minutes = parseInt(durationParts[1] || '0');
            const seconds = parseInt(durationParts[2] || '0');

            // Calculate total seconds
            timeRemaining = (hours * 3600) + (minutes * 60) + seconds;
            // --- End of new logic for duration ---

            timerInterval = setInterval(updateTimer, 1000);
            questions = data.questions;

            // Populate user information
            document.getElementById('user-name').textContent = data.user_name || "Your Name";
            document.getElementById('user-profession').textContent = data.user_profession || "Profession";
            document.getElementById('organization_name').textContent = `---${data.organization_name}---` || "---University of Dhaka---";

            if (questions.length > 0) showAllQuestions(isLimitedAccess);
        })
        .catch(error => console.error('Error fetching exam details:', error));
    }


    function showAllQuestions(isLimitedAccess) {
        const questionsContainer = document.getElementById('questions-container');
        questionsContainer.innerHTML = '';

        const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

        questions.forEach((question, index) => {
            const questionWrapper = document.createElement('div');
            questionWrapper.classList.add('col-md-6', 'mb-4', 'border', 'rounded', 'p-3');
            questionWrapper.setAttribute('data-question-index', index);
            
            if (index >= 10 && !isLimitedAccess) {
                questionWrapper.classList.add('blurred-question');
                questionWrapper.style.pointerEvents = 'none';
            }



            let questionHTML = `<p class="fw-semibold d-flex align-items-start gap-2 mb-2 ">${index + 1}. ${question.question.text}</p>`;
            if (question.question.image) {
                questionHTML = `
                    <p class="fw-semibold">${index + 1}.</p>
                    <img src="${question.question.image}" alt="Question Image" class="max-w-full h-auto rounded-lg shadow-md mb-2">
                `;
            }

            questionWrapper.innerHTML += questionHTML;

            const usagesInfoContainer = document.createElement('div');
            usagesInfoContainer.classList.add('mt-2', 'small', 'text-muted');
            usagesInfoContainer.style.marginLeft = '2rem';

            if (question.question_usages && question.question_usages.length > 0) {
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = `Used in ${question.question_usages.length} exam${question.question_usages.length > 1 ? 's' : ''}`;
                summary.style.cursor = 'pointer';
                details.appendChild(summary);

                question.question_usages.forEach(usage => {
                    const usageParagraph = document.createElement('p');
                    usageParagraph.classList.add('mb-1');
                    let usageText = '';
                    if (usage.exam_title) {
                        usageText += `${usage.exam_title}`;
                    }
                    if (usage.year) {
                        usageText += ` (${usage.year})`;
                    }
                    usageParagraph.textContent = usageText;
                    usageParagraph.style.marginLeft = '1rem';
                    details.appendChild(usageParagraph);
                });

                usagesInfoContainer.appendChild(details);

            } else {
                const noUsageParagraph = document.createElement('p');
                noUsageParagraph.textContent = 'No usage information available';
                usagesInfoContainer.appendChild(noUsageParagraph);
            }

            if (question.question_usages && question.question_usages.length > 0) {
                const usageWrapper = document.createElement('div');
                usageWrapper.classList.add('position-relative');

                const toggleButton = document.createElement('button');
                toggleButton.textContent = `Show Usage Info`;
                toggleButton.classList.add('btn', 'btn-sm', 'mb-2', 'bg-info','text-white');
                toggleButton.type = 'button';
                toggleButton.style.marginLeft = '30px';

                const usageOverlay = document.createElement('div');
                usageOverlay.classList.add('position-absolute', 'bg-white', 'border', 'rounded', 'shadow', 'px-2');
                usageOverlay.style.top = '2.2rem';
                usageOverlay.style.left = '30px';
                usageOverlay.style.right = '0';
                usageOverlay.style.zIndex = '10';
                usageOverlay.style.display = 'none';
                usageOverlay.style.maxHeight = '200px';
                usageOverlay.style.overflowY = 'auto';

                if (question.question_usages && question.question_usages.length > 0) {
                    question.question_usages.forEach(usage => {
                        const usageParagraph = document.createElement('p');
                        usageParagraph.classList.add('mb-1', 'text-sm');
                        let usageText = '';
                        if (usage.exam_title) usageText += `${usage.exam_title}`;
                        if (usage.year) usageText += ` (${usage.year})`;
                        usageParagraph.textContent = usageText;
                        usageOverlay.appendChild(usageParagraph);
                    });
                } else {
                    const noUsage = document.createElement('p');
                    noUsage.textContent = 'No usage information available';
                    usageOverlay.appendChild(noUsage);
                }

                toggleButton.addEventListener('click', () => {
                    const isVisible = usageOverlay.style.display === 'block';
                    usageOverlay.style.display = isVisible ? 'none' : 'block';
                    toggleButton.textContent = isVisible ? 'Show Usage Info' : 'Hide Usage Info';
                });

                usageWrapper.appendChild(toggleButton);
                usageWrapper.appendChild(usageOverlay);
                questionWrapper.appendChild(usageWrapper);
            }

            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('d-grid', 'gap-2');
            optionsContainer.style.marginLeft = '2rem';

            question.question.options.forEach((option, optIndex) => {
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
            
            if (!isLimitedAccess) {
                window.addEventListener('scroll', showBuySubscriptionOnScroll);

            }
            
        });
    }

let subscriptionPromptShown = false;

function showBuySubscriptionOnScroll() {
    if (subscriptionPromptShown) return;

    const eleventhQuestion = document.querySelector('[data-question-index="10"]');
    if (!eleventhQuestion) return;

    const rect = eleventhQuestion.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight;

    if (isInView) {
        subscriptionPromptShown = true;
        showSubscriptionModal();
    }
}

    function showSubscriptionModal() {
        const blocker = document.createElement('div');
        blocker.style.position = 'fixed';
        blocker.style.top = '0';
        blocker.style.left = '0';
        blocker.style.width = '100%';
        blocker.style.height = '100%';
        blocker.style.background = 'rgba(0, 0, 0, 0.7)';
        blocker.style.zIndex = '9999';
        blocker.style.display = 'flex';
        blocker.style.alignItems = 'center';
        blocker.style.justifyContent = 'center';
        blocker.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center; max-width: 400px;">
                <h2 class="mb-3" style="color: #dc2626;">Subscription Required</h2>
                <p class="mb-4">Buy a subscription to access all questions and submit your answers.</p>
                <a href="/subscription/" class="btn btn-primary">Buy Subscription</a>
            </div>
        `;
        document.body.appendChild(blocker);
    }

    document.addEventListener('change', function(event) {
        if (event.target.name.startsWith('question')) {
            saveAnswer(event.target.name);
        }
    });

    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
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
            const questionIndex = parseInt(questionName.replace('question', ''));
            answers[questionIndex] = {
                question_id: questions[questionIndex].question.id,
                option: selectedOption.value
            };
            return true;
        } else {
            return false;
        }
    }

    function submitExam() {
        clearInterval(timerInterval);

        const formattedAnswers = answers.map(answer => ({
            question_id: answer.question_id,
            selected_option_id: answer.option
        }));

        fetch(`/quiz/exams/${examId}/submit/`, {
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

        modalElement.addEventListener('hidden.bs.modal', function () {
            window.location.href = `/new_past_exam_details/${examId}/`;
        });
    }

    function checkUserPermission() {
        fetch(`/api/check-permission/${examId}/`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            fetchExamDetails(data.has_access === true);
        })
        .catch(error => {
            console.error('Error fetching user permissions:', error);
            // Optionally handle errors
            fetchExamDetails(false); // Assume no permission on error to be safe
        });
    }

    checkUserPermission();
});