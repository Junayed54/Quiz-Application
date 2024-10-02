// Get JWT access token from localStorage
const accessToken = localStorage.getItem('access_token');
const examId = window.location.href.split('/')[5];

// Check if the token or exam ID is missing
if (!accessToken || !examId) {
    console.error('Access token or Exam ID is missing.');
}

// Initialize WebSocket connection with the access token
let socket = createWebSocket(examId, accessToken);

// Function to create WebSocket connection
function createWebSocket(examId, token) {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/exam/${examId}/?token=${token}`);

    // Handle incoming messages from the server
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);

        switch (data.action) {
            case 'exam_started':
                console.log(data.message);
                break;
            case 'question':
                displayQuestion(data.question, data.options);  // Display the question
                break;
            case 'exam_complete':
                alert('The exam is complete!');
                break;
            case 'update_scores':
                updateAttemptsDisplay(data);
                break;
            default:
                console.error('Unknown action:', data.action);
        }
    };

    // Handle WebSocket connection open
    socket.onopen = function(event) {
        console.log('WebSocket connection established.');
    };

    // Handle WebSocket closure
    socket.onclose = function(event) {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        // Attempt to reconnect after a delay
        setTimeout(function() {
            socket = createWebSocket(examId, accessToken);
        }, 1000);
    };

    // Handle WebSocket errors
    socket.onerror = function(error) {
        console.error('WebSocket error occurred:', error);
    };

    return socket;
}

// Start Exam Function - Triggered by button click
document.getElementById('start-exam').addEventListener('click', function() {
    startExam();
});

function startExam() {
    // Check if WebSocket is ready before sending
    if (socket.readyState === WebSocket.OPEN) {
        // Send start_exam action to the server
        socket.send(JSON.stringify({
            action: 'start_exam',
            exam_id: examId  // Ensure this is a string representing a UUID
        }));
    } else {
        console.error('WebSocket connection is not open.');
    }
}

// Function to display the question and its options
function displayQuestion(questionText, options) {
    // Update the DOM with the question and its options
    const questionElement = document.getElementById('question');
    questionElement.innerText = questionText;

    const optionsElement = document.getElementById('options');
    optionsElement.innerHTML = '';  // Clear previous options

    options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.innerText = option.text;
        optionButton.className = 'option-button';  // Add CSS class for styling
        optionButton.addEventListener('click', function() {
            submitAnswer(option.id);  // Submit answer when option is clicked
        });
        optionsElement.appendChild(optionButton);
    });
}

// Submit answer function
function submitAnswer(selectedOptionId) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            action: 'submit_answer',
            question_id: currentQuestionId,  // Assuming this is stored globally
            selected_option_id: selectedOptionId
        }));
    } else {
        console.error('WebSocket connection is not open. Unable to submit answer.');
    }
}

// Update attempts display (optional, for scores or stats)
function updateAttemptsDisplay(data) {
    const attemptsElement = document.getElementById('attempts');
    attemptsElement.innerText = `User: ${data.user}, Correct: ${data.correct}`;
}
