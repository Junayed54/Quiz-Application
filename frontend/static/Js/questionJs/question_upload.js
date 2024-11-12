// Select elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file');
const fileNameDisplay = document.getElementById('file-name');
const loader = document.getElementById('loader');
const uploadForm = document.getElementById('upload-form');
const examNameInput = document.getElementById('exam_name');
const examYearInput = document.getElementById('exam_year');

// Show file dialog when drop zone is clicked
dropZone.addEventListener('click', () => fileInput.click());

// Highlight drop zone on drag enter/over, reset on leave
['dragenter', 'dragover'].forEach(eventType => {
    dropZone.addEventListener(eventType, (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007bff'; // Highlight
    });
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc'; // Reset border
});

// Handle file drop in drop zone
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc'; // Reset border
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files; // Assign dropped file to input
        fileNameDisplay.textContent = files[0].name; // Show file name
    }
});

// Update file name display when a file is selected manually
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
    }
});

// Handle form submission with loader and validation
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    // Show loader
    loader.style.display = 'flex';
    loader.classList.remove('d-none');
    loader.classList.add('d-flex');

    // Basic form validation
    if (!examNameInput.value.trim()) {
        alert("Please enter the exam name.");
        loader.style.display = 'none';
        return;
    }
    if (!examYearInput.value || isNaN(examYearInput.value) || examYearInput.value.length !== 4) {
        alert("Please enter a valid 4-digit year.");
        loader.style.display = 'none';
        return;
    }

    // Prepare form data and authorization header
    const formData = new FormData(uploadForm);
    const accessToken = localStorage.getItem('access_token');

    // Send form data via fetch with loader indication
    fetch('/quiz/questions/upload_questions/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loader.style.display = 'none'; // Hide loader on response
        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            loader.classList.remove('d-flex');
            loader.classList.add('d-none');
            alert('Questions uploaded successfully.');
            window.location.href = '/quiz/user_questions/';

        }
    })
    .catch(error => {
        loader.style.display = 'none'; // Hide loader on error
        alert('An error occurred while uploading questions.');
        console.error(error);
    });
});
