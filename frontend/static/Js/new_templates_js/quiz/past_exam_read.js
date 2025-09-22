document.addEventListener('DOMContentLoaded', function(){
    const examId = window.location.pathname.split('/')[3];
    let questions = [];
    let answers = []; // Keep this if you plan to re-introduce submission later, otherwise it can be removed
    const accessToken = localStorage.getItem('access_token');
    const questionsContainer = document.getElementById('questions-container');
    // submitButton and subscriptionDiv are likely not directly used for this feedback logic
    // const submitButton = document.getElementById('submit-exam');
    // const subscriptionDiv = document.getElementById('subscription-section');
    let questionsShownCount = 0;

    function fetchExamDetails(isLimitedAccess) {
        fetch(`/quiz/past-exams/${examId}/`, {
            method: 'GET',
            // headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const loader = document.getElementById("loader");
            loader.classList.add('d-none');
            
            document.getElementById('exam-info').innerHTML = `<h3 class="text-bold" style="color: #534268; font-size: 36px; font-weight: 800;">${data.title}</h3>`;
            const full_mark = document.getElementById('full-mark');

            questions = data.questions;
            full_mark.innerText = questions.length;
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
            questionWrapper.classList.add('col-md-6', 'mb-4', 'p-3');
            questionWrapper.setAttribute('data-question-index', index);

            if (index >= 10 && !isLimitedAccess) {
                questionWrapper.classList.add('blurred-question');
                questionWrapper.style.pointerEvents = 'none';
            }

            // Main container for the question number and its content (text/image)
            const questionHeaderContainer = document.createElement('div');
            questionHeaderContainer.classList.add('d-flex', 'gap-2', 'mb-2','align-items-center'); 
            
            const questionNumber = document.createElement('span'); 
            questionNumber.classList.add('fw-semibold', 'flex-shrink-0');
            questionNumber.textContent = `${index + 1}.`;

            const questionContent = document.createElement('div');
            questionContent.classList.add('flex-grow-1'); 
            

            if (question.question.image) {
                questionContent.innerHTML = `
                    <div class="image-wrapper" style="max-width: 100%; overflow: hidden;">
                        <img src="${question.question.image}" alt="Question Image" class="img-fluid rounded-lg shadow-md" style="max-height: 250px; object-fit: contain;">
                    </div>
                `;
            } else if (question.question.text) {
                questionContent.innerHTML = `
                    <p class="fw-semibold mb-0">${question.question.text}</p>
                `;
            }

            questionHeaderContainer.appendChild(questionNumber);
            questionHeaderContainer.appendChild(questionContent); 
            questionWrapper.appendChild(questionHeaderContainer); 


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
                toggleButton.classList.add('btn', 'btn-sm', 'mb-2', 'bg-info', 'text-white', 'text-sm', 'p-1');
                toggleButton.type = 'button';
                toggleButton.style.marginLeft = '30px';

                const usageOverlay = document.createElement('div');
                usageOverlay.classList.add('position-absolute', 'bg-white', 'border', 'rounded', 'shadow', 'px-1', 'text-muted');
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

            question.options.forEach((option, optIndex) => {
                const inputId = `q${index}_opt${optIndex}`;
                const labelChar = optionLabels[optIndex] || '';
                const optionText = option.text || `<img src="${option.image}" alt="Option Image" class="img-fluid" style="max-height: 100px; object-fit: contain;">`;

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
            // console.log(question);
            if (question.explanation || question.explanation_image) {
                const explanationDetails = document.createElement('details');
                explanationDetails.classList.add('mt-3', 'ms-4', 'p-2', 'border', 'rounded', 'bg-light');

                const explanationSummary = document.createElement('summary');
                explanationSummary.textContent = 'Show Explanation';
                explanationSummary.style.cursor = 'pointer';
                explanationSummary.classList.add('fw-bold', 'text-primary');
                explanationDetails.appendChild(explanationSummary);

                const explanationContent = document.createElement('div');
                explanationContent.classList.add('mt-2'); // Add margin top for spacing

                if (question.explanation_image) {
                    explanationContent.innerHTML += `
                        <div class="explanation-image-wrapper text-center mb-2" style="overflow: hidden;">
                            <img src="${question.explanation_image}" alt="Explanation Image"
                                class="rounded-md shadow-sm"
                                style="width: 100%; max-height: 250px; object-fit: cover; display: block;">
                        </div>


                    `;
                }

                if (question.explanation) {
                    explanationContent.innerHTML += `<p>${question.explanation}</p>`;
                }
                
                explanationDetails.appendChild(explanationContent);
                questionWrapper.appendChild(explanationDetails);
            }


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
            const selectedRadio = event.target;
            const questionIndex = parseInt(selectedRadio.name.replace('question', ''));
            const questionElement = selectedRadio.closest('.col-md-6.mb-4.p-3');
            const optionsLabels = questionElement.querySelectorAll('.custom-label');

            // Clear previous feedback
            optionsLabels.forEach(label => {
                label.classList.remove('correct-answer', 'wrong-answer');
            });

            const selectedOptionId = selectedRadio.value;
            const currentQuestion = questions[questionIndex];
            
            // Find the correct option using the is_correct flag
            const correctOption = currentQuestion.options.find(opt => opt.is_correct === true);
            const correctOptionId = correctOption ? correctOption.id : null; // Get its ID

            // Apply feedback
            optionsLabels.forEach(label => {
                const input = label.previousElementSibling; 
                if (correctOptionId && input.value == correctOptionId) {
                    label.classList.add('correct-answer'); // Green for correct
                } else if (input.value == selectedOptionId) { // Only highlight the selected option if it's wrong
                    label.classList.add('wrong-answer'); // Red for selected wrong
                }
            });
        }
    });

    // Removed or commented out submission-related functions as per previous instructions
    // submitButton.addEventListener('click', function(event) { /* ... */ });
    // function saveAnswer(questionName) { /* ... */ }
    // function submitExam() { /* ... */ }
    // function displayResults() { /* ... */ }

    fetchExamDetails(true); // Treat as having full access for this instant feedback mode
});