// document.addEventListener("DOMContentLoaded", function () {
//     const token = localStorage.getItem("access_token");
//     const examId = window.location.pathname.split('/')[3];
//     const socketUrl = `ws://${window.location.host}/ws/exam/${examId}/`;

//     let currentQuestionNumber = 0;
//     let totalQuestions = 0;
//     let timerInterval;
//     let remainingTime = 0; // In seconds

//     const socket = new WebSocket(socketUrl);

//     // DOM Elements
//     const prevButton = document.getElementById("prev-question");
//     const skipButton = document.getElementById("skip-question");
//     const nextButton = document.getElementById("next-question");
//     const submitButton = document.getElementById("submit-exam");
//     const questionContainer = document.getElementById("question-container");
//     const questionText = document.getElementById("question-text");
//     const optionsList = document.getElementById("options-list");
//     const timerDisplay = document.getElementById("timer-display");
//     // const activeUsersContainer = document.getElementById("active-users");
//     const userScoresList = document.getElementById('active-users-table-body');

//     // WebSocket Handlers
//     socket.onopen = () => {
//         console.log("WebSocket connection established.");
//         authenticateUser();
//     };

//     socket.onmessage = (event) => handleSocketMessage(JSON.parse(event.data));
//     socket.onerror = (error) => console.error("WebSocket error:", error);
//     socket.onclose = (event) => console.log("WebSocket connection closed:", event.reason);

//     // Authenticate User
//     function authenticateUser() {
//         socket.send(JSON.stringify({ action: "authenticate", token }));
//     }

//     // Handle incoming WebSocket messages
//     function handleSocketMessage(data) {
//         switch (data.action) {
//             case "initialize_exam":
//                 initializeExam(data);
//                 break;
//             case "question":
//                 totalQuestions = data.total_questions;
//                 displayQuestion(data);
//                 break;
//             case "exam_complete":
//                 displayResults(data);
//                 break;
//             case "score_update":
//                 updateScore(data);
//             // case "user_scores":
//             //     updateUserScores(data);
//             case "active_users":
//                 updateActiveUsers(data.users);
//                 break;
//             case "time_remaining":
//                 updateTimerDisplay(data.time);
//                 break;
//             default:
//                 console.warn("Unhandled action:", data.action);
//         }
//     }

//     // Initialize exam details
//     function initializeExam(data) {
//         totalQuestions = data.total_questions;
//         remainingTime = data.duration;
//         startTimer();
//     }


//     function submitAnswer(questionId, optionId) {
//         if (socket && socket.readyState === WebSocket.OPEN) {
//             socket.send(JSON.stringify({
//                 action: 'submit_answer',
//                 exam_id: examId,
//                 question_id: questionId,
//                 selected_option_id: optionId
//             }));

//             const buttons = optionsList.querySelectorAll('button');
//             buttons.forEach(button => button.disabled = true);
//         } else {
//             console.error('WebSocket is not open. Cannot send message.');
//         }
//     }

//     // Display a question
//     // function displayQuestion(data) {
//     //     questionText.textContent = data.question;
//     //     optionsList.innerHTML = data.options
//     //         .map(
//     //             (option) => `
//     //             <div class="form-check" onclick="${submitAnswer(data.question_id, option.id)}">
//     //                 <input type="radio" name="option" value="${option.id}" id="option${option.id}" class="hidden">
//     //                 <label for="option${option.id}" class="block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100" 
//     //                        style="background:#57A6A1; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center;">
//     //                     ${option.text}
//     //                 </label>
//     //             </div>
//     //         `
//     //         )
//     //         .join("");
//     //     currentQuestionNumber = data.current_question_number;
        
//     //     document.getElementById("question-number").textContent = `${currentQuestionNumber}/${totalQuestions}: `;
//     //     updateNavigationButtons();
//     // }



//     function displayQuestion(data) {
//         questionText.innerText = data.question;
//         optionsList.innerHTML = '';  // Clear old options

//         // Display options
//         data.options.forEach((option, index) => {
//             const optionItem = document.createElement('button');
//             optionItem.className = 'block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100';
//             optionItem.style="background:#57A6A1; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center;"
//             // Add option number (index + 1) before the option text
//             optionItem.innerText = `${index + 1}. ${option.text}`;
            
//             optionItem.onclick = () => submitAnswer(data.question_id, option.id);
            
//             optionsList.appendChild(optionItem);
//             currentQuestionNumber = data.current_question_number;
//             document.getElementById("question-number").textContent = `${currentQuestionNumber}/${totalQuestions}: `;
//             updateNavigationButtons();
//         });
        

//         // Update the question number, total number of questions, and score
//         // questionNumberElement.innerText = `${data.current_question_number}. Question`;  // Example: "1. Question"
//         // totalQuestionsElement.innerText = `Total Questions: ${data.total_questions}`;
//         // scoreElement.innerText = `Score: ${data.score}`;

//         // startExamBtn.classList.add('d-none');  // Hide start button after starting exam
//         // nextQuestionBtn.classList.remove('d-none');  // Show next question button
//     }


    

//     // Timer management
//     function startTimer() {
//         updateTimerDisplay();
//         timerInterval = setInterval(() => {
//             if (remainingTime > 0) {
//                 remainingTime -= 1;
//                 updateTimerDisplay();
//             } else {
//                 clearInterval(timerInterval);
//                 socket.send(JSON.stringify({ action: "end_exam" }));
//                 alert("Time is up! The exam has ended.");
//             }
//         }, 1000);
//     }

//     function updateTimerDisplay() {
//         const minutes = Math.floor(remainingTime / 60);
//         const seconds = remainingTime % 60;
//         timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
//     }

//     // Navigation buttons
//     prevButton.addEventListener("click", () => {
//         if (currentQuestionNumber > 1) {
//             socket.send(JSON.stringify({ action: "prev_question" }));
//         }
//     });

//     skipButton.addEventListener("click", () => {
//         if (currentQuestionNumber < totalQuestions) {
//             socket.send(JSON.stringify({ action: "skip_question" }));
//         }
//     });

//     // nextButton.addEventListener("click", () => handleNextQuestion());
//     nextButton.addEventListener('click', () => {
//         if (socket && socket.readyState === WebSocket.OPEN) {
//             socket.send(JSON.stringify({
//                 action: 'next_question',
//                 exam_id: examId
//             }));

//             questionText.innerHTML = 'Loading next question...';
//             optionsList.innerHTML = '';
//             nextButton.classList.add('d-none');
//         } else {
//             console.error('WebSocket is not open. Cannot send message.');
//         }
//     });
//     submitButton.addEventListener("click", () => submitExam());

//     // function handleNextQuestion() {
//     //     const selectedOption = document.querySelector('input[name="option"]:checked');
//     //     if (!selectedOption) {
//     //         alert("Please select an option before proceeding.");
//     //         return;
//     //     }
//     //     const selectedOptionId = selectedOption.value;
//     //     socket.send(
//     //         JSON.stringify({
//     //             action: "next_question",
//     //             selected_option_id: selectedOptionId,
//     //         })
//     //     );
//     // }

//     function submitExam() {
//         socket.send(JSON.stringify({ action: "submit_exam" }));
//         alert("Exam submitted successfully.");
//     }
    
//     // function submitAnswer(questionId, optionId) {
//     //     if (socket && socket.readyState === WebSocket.OPEN) {
//     //         socket.send(JSON.stringify({
//     //             action: 'submit_answer',
//     //             exam_id: examId,
//     //             question_id: questionId,
//     //             selected_option_id: optionId
//     //         }));

//     //         const buttons = optionsList.querySelectorAll('button');
//     //         buttons.forEach(button => button.disabled = true);
//     //     } else {
//     //         console.error('WebSocket is not open. Cannot send message.');
//     //     }
//     // }

//     // Update the score list with each question
//     function updateScore(data) {
//         // const scoreItem = document.createElement('li');
//         // scoreItem.className = 'list-group-item';
//         // scoreItem.innerText = `${data.correct ? 'Correct' : 'Wrong'}`;
//         // scoreList.appendChild(scoreItem);

//         // // Update displayed score
//         // scoreElement.innerText = `Score: ${data.score}`;
//     }


//     // Update the user scores list
//     // function updateUserScores(data) {
//     //     console.log(data);
//     //     userScoresList.innerHTML = ''; // Clear existing scores
//     //     data.scores.forEach(user => {
//     //         const scoreItem = document.createElement('li');
//     //         scoreItem.className = 'list-group-item';
//     //         scoreItem.innerText = `${user.username}: ${user.score}`; // Adjust property names as necessary
//     //         userScoresList.appendChild(scoreItem);
//     //     });
//     // }

//     // Results display
//     function displayResults(data) {
//         const resultContainer = document.getElementById("resultContainer");
//         resultContainer.innerHTML = `
//             <h3 class="text-lg font-semibold text-center text-gray-800 mb-4">Exam Results</h3>
//             <div class="text-center">
//                 <p class="text-gray-700"><strong>Score:</strong> ${data.score}</p>
//                 <p class="text-gray-700"><strong>Correct Answers:</strong> ${data.correct_answers}</p>
//                 <p class="text-gray-700"><strong>Wrong Answers:</strong> ${data.wrong_answers}</p>
//                 <p class="text-gray-700"><strong>Total Questions:</strong> ${data.total_questions}</p>
//             </div>
//         `;
//         const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));
//         resultsModal.show();
//     }

//     // Active users update
//     function updateActiveUsers(users) {
//         const activeUsersTableBody = document.getElementById('active-users-table-body');
//         activeUsersTableBody.innerHTML = '';  // Clear the current table body
    
//         // Convert the users object into an array of entries (username, score)
//         Object.entries(users).forEach(([username, score]) => {
//             // Create a new row for each active user
//             const row = document.createElement('tr');
            
//             // Create a cell for the username
//             const usernameCell = document.createElement('td');
//             const span = document.createElement('span');
//             span.className = "badge bg-success-transparent"
//             span.innerText = username;
//             usernameCell.appendChild(span);
//             row.appendChild(usernameCell);
    
//             // Create a cell for the score
//             const scoreCell = document.createElement('td');
//             scoreCell.innerText = score;
//             row.appendChild(scoreCell);
    
//             // Append the row to the table body
//             activeUsersTableBody.appendChild(row);
//         });
//     }
//     // Update navigation buttons
//     function updateNavigationButtons() {
//         prevButton.disabled = currentQuestionNumber <= 1;
//         skipButton.disabled = currentQuestionNumber >= totalQuestions;
//         nextButton.classList.toggle("d-none", currentQuestionNumber === totalQuestions);
//         submitButton.classList.toggle("d-none", currentQuestionNumber < totalQuestions);
//     }
// });




document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("access_token");
    const examId = window.location.pathname.split('/')[3];
    const socketUrl = `ws://${window.location.host}/ws/exam/${examId}/`;

    let currentQuestionNumber = 0;
    let totalQuestions = 0;
    let remainingTime = 0; // In seconds

    const socket = new WebSocket(socketUrl);

    // DOM Elements
    const prevButton = document.getElementById("prev-question");
    const skipButton = document.getElementById("skip-question");
    const nextButton = document.getElementById("next-question");
    const submitButton = document.getElementById("submit-exam");
    const questionContainer = document.getElementById("question-container");
    const questionText = document.getElementById("question-text");
    const optionsList = document.getElementById("options-list");
    const timer = document.getElementById("time-remaining");
    const userScoresList = document.getElementById('active-users-table-body');

    // WebSocket Handlers
    socket.onopen = () => {
        console.log("WebSocket connection established.");
        authenticateUser();
    };

    socket.onmessage = (event) => handleSocketMessage(JSON.parse(event.data));
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = (event) => {
        console.log("WebSocket connection closed:", event.reason);
        // Implement reconnection logic here if needed
    };

    // Authenticate User
    function authenticateUser() {
        socket.send(JSON.stringify({ action: "authenticate", token }));
    }

    // Handle incoming WebSocket messages
    function handleSocketMessage(data) {
        switch (data.action) {
            case "initialize_exam":
                initializeExam(data);
                break;
            case "question":
                totalQuestions = data.total_questions;
                const duration = data.duration;
                displayQuestion(data);
                if (duration) {
                    startCountdown(duration); // Start the countdown with the received duration
                }
                break;
            case "exam_complete":
                console.log("Exam complete received");
                displayResults(data); // Show results when the exam is complete
                break;
            case "score_update":
                updateScore(data);
                break;
            case "active_users":
                updateActiveUsers(data.users);
                break;
            default:
                console.warn("Unhandled action:", data.action);
        }
    }

    // Initialize exam details
    function initializeExam(data) {
        totalQuestions = data.total_questions;
        remainingTime = data.duration;
        startTimer();
    }

    function submitAnswer(questionId, optionId) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: 'submit_answer',
                exam_id: examId,
                question_id: questionId,
                selected_option_id: optionId
            }));

            const buttons = optionsList.querySelectorAll('button');
            buttons.forEach(button => button.disabled = true);
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }

    function displayQuestion(data) {
        questionText.innerText = data.question;
        optionsList.innerHTML = '';  // Clear old options

        // Display options
        data.options.forEach((option, index) => {
            const optionItem = document.createElement('button');
            optionItem.className = 'block cursor-pointer p-3 text-center rounded border border-gray-300 hover:bg-blue-100';
            optionItem.style="background:#57A6A1; width: 100%; height: 60px; display: flex; align-items: center; justify-content: center;"
            // Add option number (index + 1) before the option text
            optionItem.innerText = `${index + 1}. ${option.text}`;
            
            optionItem.onclick = () => submitAnswer(data.question_id, option.id);
            
            optionsList.appendChild(optionItem);
            currentQuestionNumber = data.current_question_number;
            document.getElementById("question-number").textContent = `${currentQuestionNumber}/${totalQuestions}: `;
            updateNavigationButtons();
        });
    }

    // Navigation buttons
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

    nextButton.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: 'next_question',
                exam_id: examId
            }));

            questionText.innerHTML = 'Loading next question...';
            optionsList.innerHTML = '';
            nextButton.classList.add('d-none');
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    });

    submitButton.addEventListener("click", () => submitExam());

    function submitExam() {
        questionContainer.classList.add('d-none');
        submitButton.disabled = true;
        socket.send(JSON.stringify({ action: "submit_exam" }));
        alert("Exam submitted successfully.");
        
        // Trigger the exam complete action from the server side
    }

    // Update the score list with each question
    function updateScore(data) {
        // Update score logic
    }

    // Function to format time as HH:MM:SS
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Initialize the timer
    function startCountdown(durationSeconds) {
        remainingTime = durationSeconds;
        // const interval = setInterval(() => {
        //     if (remainingTime <= 0) {
        //         clearInterval(interval);
        //         timer.textContent = 'Time is up!';
        //         socket.send(JSON.stringify({ action: "end_exam" })); // Send end_exam action
        //         submitExam();
        //         return;
        //     }
        //     const formattime = formatTime(remainingTime);
        //     // timer.innerText = `${formattime}`;
        //     remainingTime -= 1; // Decrease the remaining time
        // }, 1000); // Update every second
    }

    function displayResults(data) {
        console.log("Displaying results:", data);  // Check if results are received
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = `...`; // The result display code goes here
        const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));
        resultsModal.show();
    }
    

    // Active users update
    function updateActiveUsers(users) {
        const activeUsersTableBody = document.getElementById('active-users-table-body');
        activeUsersTableBody.innerHTML = '';  // Clear the current table body
    
        Object.entries(users).forEach(([username, score]) => {
            const row = document.createElement('tr');
            const usernameCell = document.createElement('td');
            const span = document.createElement('span');
            span.className = "badge bg-success-transparent";
            span.innerText = username;
            usernameCell.appendChild(span);
            row.appendChild(usernameCell);
    
            const scoreCell = document.createElement('td');
            scoreCell.innerText = score;
            row.appendChild(scoreCell);
    
            activeUsersTableBody.appendChild(row);
        });
    }

    // Update navigation buttons
    function updateNavigationButtons() {
        prevButton.disabled = currentQuestionNumber <= 1;
        skipButton.disabled = currentQuestionNumber >= totalQuestions;
        nextButton.classList.toggle("d-none", currentQuestionNumber === totalQuestions);
        submitButton.classList.toggle("d-none", currentQuestionNumber < totalQuestions);
    }
});


