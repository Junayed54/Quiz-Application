// Select elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file');
const fileNameDisplay = document.getElementById('file-name');
const examNameInput = document.getElementById('exam_name');
const examYearInput = document.getElementById('exam_year');

// Event listener for drop zone click to trigger file input
dropZone.addEventListener('click', function() {
    fileInput.click();
});

// Highlight drop zone on drag enter and drag over
dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007bff'; // Highlight on drag
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007bff'; // Highlight on drag
});

// Reset drop zone on drag leave
dropZone.addEventListener('dragleave', (e) => {
    dropZone.style.borderColor = '#ccc'; // Reset border color
});

// Handle drop event
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc'; // Reset border color

    // Get the dropped file
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files; // Assign the file to the input element
        fileNameDisplay.textContent = files[0].name; // Display the file name
    }
});

// Update file name when file input changes (e.g., file selected via click)
fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
    }
});

// Handle form submission
document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Basic validation for the exam name and year
    if (!examNameInput.value) {
        alert("Please enter the exam name.");
        return;
    }
    if (!examYearInput.value || isNaN(examYearInput.value) || examYearInput.value.length !== 4) {
        alert("Please enter a valid 4-digit year.");
        return;
    }
    
    const formData = new FormData(this); // Gather form data
    const accessToken = localStorage.getItem('access_token'); // Retrieve access token

    // Fetch request to upload the questions
    fetch('/quiz/questions/upload_questions/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}` // Add Authorization header
        },
        body: formData // Pass the form data (including the file)
    })
    .then(response => response.json())
    .then(data => {
        // Check if the server returns an error
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            alert('Questions uploaded successfully.');
            window.location.href = '/quiz/user_questions/'; // Redirect on success
        }
    })
    .catch(error => {
        alert('An error occurred while uploading questions.');
        console.error(error); // Log the error to the console
    });
});
