// Get JWT access token from localStorage
const accessToken = localStorage.getItem('access_token');
const examId = window.location.href.split('/')[5];
// Initialize WebSocket connection with the access token
const socket = new WebSocket(`ws://127.0.0.1:8000/ws/exam/${examId}/?token=${accessToken}`);

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);

    switch (data.action) {
        case 'exam_started':
            console.log(data.message);
            // Optionally, handle the first question here
            break;
        case 'update_scores':
            updateAttemptsDisplay(data);
            break;
        default:
            console.error('Unknown action:', data.action);
    }
};

socket.onopen = function(event) {
    console.log('WebSocket connection established.');
};

socket.onclose = function(event) {
    console.log('WebSocket connection closed.');
};

socket.onerror = function(error) {
    console.error('WebSocket error occurred:', error);
};

// Start Exam Function
document.getElementById('start-exam').addEventListener('click', function() {
    startExam();
});

function startExam() {
    const accessToken = localStorage.getItem('access_token');
    const examId = window.location.href.split('/')[5];  // Ensure this retrieves the correct exam ID
    
    // Check if examId is valid
    if (!examId) {
        console.error('Exam ID is not defined.');
        return;
    }

    // Send start_exam action to the server
    socket.send(JSON.stringify({
        action: 'start_exam',
        exam_id: examId  // Ensure this is a string representing a UUID
    }));
}
