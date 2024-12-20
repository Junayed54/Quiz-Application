document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("access_token");
    const examId = window.location.pathname.split('/')[3];
    const socketUrl = `ws://${window.location.host}/ws/exam/${examId}/`;
    let currentQuestionNumber = 0;
    let totalQuestions = 0;
    let timerInterval;
    let remainingTime = 0; // In seconds

    const socket = new WebSocket(socketUrl);

    const prevButton = document.getElementById("prev-question");
    const skipButton = document.getElementById("skip-question");
    const nextButton = document.getElementById("next-question");
    const submitButton = document.getElementById("submit-exam");
    const questionContainer = document.getElementById("question-container");
    const questionText = document.getElementById("question-text");
    const optionsList = document.getElementById("options-list");
    const timerDisplay = document.getElementById("timer-display");
    const activeUsersContainer = document.getElementById("active-users"); // Add this container for active users

    // Handle WebSocket connection
    socket.onopen = function () {
        console.log("WebSocket connection established.");
        socket.send(JSON.stringify({
            action: "authenticate",
            token: token,
        }));
    };

    // Handle incoming messages
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.action === 'initialize_exam') {
            initializeExam(data); // Initialize exam details
        } else if (data.action === 'question') {
            totalQuestions = data.total_questions;
            currentQuestionNumber = data.current_question_number;
            displayQuestion(data); // Display the current question
        } else if (data.action === 'exam_complete') {
            console.log('Exam Completed! Your score:', data.score);
            displayResults(data); // Display results modal
        } else if (data.action === 'active_users') {
            updateActiveUsers(data.users); // Update active users list
        } else if (data.action === 'time_remaining'){
            updateTimerDisplay(data.time); // Update timer
        }
    };

    socket.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    socket.onclose = function (event) {
        console.log("WebSocket connection closed:", event.reason);
    };

    // Initialize exam details
    function initializeExam(data) {
        totalQuestions = data.total_questions;
        remainingTime = data.duration; // Duration comes in seconds from backend
        startTimer();
    }

    // Display a question
    function displayQuestion(data) {
        questionText.textContent = data.question;
        optionsList.innerHTML = ""; // Clear previous options

        data.options.forEach(option => {
            const optionElement = document.createElement("div");
            optionElement.classList.add("form-check");
            optionElement.innerHTML = `
                <input type="radio" name="option" value="${option.id}" id="option${option.id}" class="hidden">
                <label for="option${option.id}" 
                    class="block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100"
                    style="background:#57A6A1; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center;">
                    ${option.text}
                </label>
            `;
            optionsList.appendChild(optionElement);
        });

        currentQuestionNumber = data.current_question_number;
        document.getElementById("question-number").textContent = `${data.current_question_number}/${totalQuestions}: `;
        updateNavigationButtons();
    }

    // Start the timer countdown
    function startTimer() {
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime -= 1; // Decrement time by 1 second
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                socket.send(JSON.stringify({ action: "end_exam" }));
                alert("Time is up! The exam has ended.");
            }
        }, 1000); // Update every second
    }

    // Update the timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Update navigation button states
    function updateNavigationButtons() {
        prevButton.disabled = currentQuestionNumber <= 1;
        skipButton.disabled = currentQuestionNumber >= totalQuestions;
        nextButton.classList.toggle("d-none", currentQuestionNumber === totalQuestions);
        submitButton.classList.toggle("d-none", currentQuestionNumber < totalQuestions);
    }

    // Navigation buttons actions
    prevButton.addEventListener("click", () => {
        if (currentQuestionNumber > 1) {
            socket.send(JSON.stringify({ action: "prev_question" }));
        }
    });

    skipButton.addEventListener("click", () => {
        if (currentQuestionNumber < totalQuestions) {
            socket.send(JSON.stringify({ action: "skip_question" }));
        }
    });

    nextButton.addEventListener("click", () => {
        // Find the selected option
        const selectedOption = document.querySelector('input[name="option"]:checked');
    
        // If no option is selected, alert the user to select an option
        if (!selectedOption) {
            alert("Please select an option before proceeding.");
            return;
        }
    
        // Send the selected option's ID to the server for validation
        const selectedOptionId = selectedOption.value;
    
        socket.send(JSON.stringify({
            action: "next_question",
            selected_option_id: selectedOptionId  // Send the selected option for validation
        }));
    
        // Continue to the next question after sending the answer
        if (currentQuestionNumber < totalQuestions) {
            socket.send(JSON.stringify({ action: "next_question" }));
        } else {
            socket.send(JSON.stringify({ action: "end_exam" }));
        }
    });
    

    submitButton.addEventListener("click", () => {
        socket.send(JSON.stringify({ action: "submit_exam" }));
        alert("Exam submitted successfully.");
    });

    // Display results
    function displayResults(data) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = `
            <h3 class="text-lg font-semibold text-center text-gray-800 mb-4">Exam Results</h3>
            <div class="text-center">
                <p class="text-gray-700"><strong>Score:</strong> ${data.score}</p>
                <p class="text-gray-700"><strong>Correct Answers:</strong> ${data.correct_answers}</p>
                <p class="text-gray-700"><strong>Wrong Answers:</strong> ${data.wrong_answers}</p>
                <p class="text-gray-700"><strong>Total Questions:</strong> ${data.total_questions}</p>
            </div>
        `;
        const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));
        resultsModal.show();
    }

    // Update active users list
    function updateActiveUsers(users) {
        const activeUsersList = document.getElementById('active-users');

        // Clear the current list to update it
        activeUsersList.innerHTML = '';

        // Loop through users and update the scores in your scoreboard
        Object.keys(users).forEach(user => {
            const score = users[user];

            // Check if the user already exists in the list
            let userItem = document.querySelector(`[data-user="${user}"]`);

            // If the user doesn't exist in the list, create a new item
            if (!userItem) {
                userItem = document.createElement('li');
                userItem.classList.add('list-group-item');
                userItem.setAttribute('data-user', user);
                userItem.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                // Create a span for the user name
                const userNameSpan = document.createElement('span');
                userNameSpan.textContent = user;  // User name (could be username or something else)

                // Create a span for the score
                const scoreSpan = document.createElement('span');
                scoreSpan.classList.add('badge', 'bg-primary');
                scoreSpan.textContent = score;  // User's score

                // Append both spans to the list item
                userItem.appendChild(userNameSpan);
                userItem.appendChild(scoreSpan);

                // Append the new list item to the active users list
                activeUsersList.appendChild(userItem);
            } else {
                // If the user is already listed, just update their score
                const scoreSpan = userItem.querySelector('.badge');
                if (scoreSpan) {
                    scoreSpan.textContent = score;
                }
            }
        });
    }
});
