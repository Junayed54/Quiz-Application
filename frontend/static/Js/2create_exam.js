// Function to show toast messages
function showToast(message, isError = false) {
    const toastElement = document.getElementById('dynamic-toast');
    const toastBody = document.getElementById('toast-body');

    // Update the message
    toastBody.textContent = message;

    // Add success or error class based on the message type
    if (isError) {
        toastElement.classList.add('bg-danger', 'text-white');
        toastElement.classList.remove('bg-success');
    } else {
        toastElement.classList.add('bg-success', 'text-white');
        toastElement.classList.remove('bg-danger');
    }

    // Show the toast
    const bootstrapToast = new bootstrap.Toast(toastElement);
    bootstrapToast.show();
}

const accessToken = localStorage.getItem('access_token');
let userRole = '';

// Fetch User Role
async function fetchUserRole() {
    try {
        const response = await fetch('/auth/user-role/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
        });
        const data = await response.json();

        if (response.ok) {
            userRole = data.role; // Assume 'role' is returned in the response
        } else {
            showToast('Failed to fetch user role.', true);
        }
    } catch (error) {
        showToast('Error fetching user role.', true);
        console.error('Error fetching user role:', error);
    }
}

// Initialize user role before form submission
fetchUserRole();

// Toggle display based on exam type selection
document.getElementById('exam_method').addEventListener('change', function () {
    const examType = this.value;
    const difficultySection = document.getElementById('difficulty-section');
    const fileUploadSection = document.getElementById('file-upload-section');

    if (examType === 'file') {
        difficultySection.style.display = 'none';
        fileUploadSection.style.display = 'block';
    } else {
        difficultySection.style.display = 'block';
        fileUploadSection.style.display = 'none';
    }
});

// Fetch and display categories
async function loadCategories() {
    try {
        const response = await fetch('/quiz/exam_categories/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
        });
        const categories = await response.json();

        if (response.ok) {
            const categorySelect = document.getElementById('category');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });

            // Add 'Add New Category' option
            const addNewCategoryOption = document.createElement('option');
            addNewCategoryOption.value = 'new';
            addNewCategoryOption.textContent = 'Add New Category';
            categorySelect.appendChild(addNewCategoryOption);
        } else {
            showToast('Failed to load categories.', true);
        }
    } catch (error) {
        showToast('Error fetching categories.', true);
        console.error('Error fetching categories:', error);
    }
}

loadCategories();

// Handle category selection
document.getElementById('category').addEventListener('change', function () {
    const newCategoryInput = document.getElementById('new-category-input');
    if (this.value === 'new') {
        newCategoryInput.style.display = 'block';
    } else {
        newCategoryInput.style.display = 'none';
    }
});

// Form submission
document.getElementById('examForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const loaderContainer = document.getElementById('loader-container');
    loaderContainer.classList.remove('d-none');
    loaderContainer.classList.add('d-flex');
    

    const formData = new FormData(this);
    const examMethod = document.getElementById('exam_method').value;

    
    if (examMethod === 'question_bank') {
        const examTypeSelect = document.getElementById('exam_type'); // Make sure your <select> has id="exam_type"
        const examTypeId = examTypeSelect.value;
        formData.append('exam_type_id', examTypeId);
    }
    // If the exam type is 'question_bank', validate and collect difficulty levels
    if (document.getElementById('exam_method').value === 'question_bank') {
        let totalPercentage = 0;
        const difficultyLevels = {};
        const use_difficulty = document.getElementById('use_difficulty');
        const isChecked = use_difficulty.checked;

        if (isChecked){
            // Collect difficulty level data from the form inputs
            document.querySelectorAll('[name^="difficulty_levels"]').forEach(input => {
                const level = input.name.split('difficulty_levels[')[1].split(']')[0];
                const value = parseInt(input.value || 0);
                totalPercentage += value;
                difficultyLevels[level] = value;
            });

            // Validate the total percentage
            if (totalPercentage !== 100) {
                loaderContainer.classList.remove('d-flex');
                loaderContainer.classList.add('d-none');
                showToast('The total percentage of difficulty levels must be 100.', true);
                return;
            }

            // Append difficulty levels as JSON string
            formData.append('difficulty_levels', JSON.stringify(difficultyLevels));
        }
        

        
        
        
    }

    try {
        const response = await fetch('/quiz/create-exam/', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
        });

        const data = await response.json();

        loaderContainer.classList.remove('d-flex');
        loaderContainer.classList.add('d-none');

        if (response.ok) {
            showToast(data.message, false);
            const redirectUrl = userRole === 'teacher' ? '/quiz/draft_exams/' : '/quiz/user_exams/';
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000); // Redirect after 2 seconds
        } else {
            showToast(data.error || 'Failed to create exam.', true);
        }
    } catch (error) {
        loaderContainer.classList.remove('d-flex');
        loaderContainer.classList.add('d-none');
        showToast('Error: Failed to create exam.', true);
        console.error('Error:', error);
    }
});
