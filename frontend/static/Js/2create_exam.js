const accessToken = localStorage.getItem('access_token');

// Toggle display based on exam type selection
document.getElementById('exam_type').addEventListener('change', function() {
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
            }
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
            console.error('Failed to load categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

loadCategories();

// Handle category selection
document.getElementById('category').addEventListener('change', function() {
    const newCategoryInput = document.getElementById('new-category-input');
    if (this.value === 'new') {
        newCategoryInput.style.display = 'block';
    } else {
        newCategoryInput.style.display = 'none';
    }
});

// Form submission
document.getElementById('examForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect form data as an object
    const formData = new FormData(this);
    const formObject = {};

    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Validate and collect difficulty levels
    if (document.getElementById('exam_type').value === 'question_bank') {
        let totalPercentage = 0;
        const difficultyLevels = {};

        // Collect difficulty level data from the form inputs
        document.querySelectorAll('[name^="difficulty_levels"]').forEach(input => {
            const level = input.name.split('difficulty_levels[')[1].split(']')[0];
            const value = parseInt(input.value || 0);
            totalPercentage += value;
            difficultyLevels[level] = value;
        });

        // Validate the total percentage
        if (totalPercentage !== 100) {
            alert('The total percentage of difficulty levels must be 100.');
            return;
        }

        // Add difficulty_levels to form data object
        formObject.difficulty_levels = difficultyLevels;
    }

    // Send form data as JSON
    fetch('/quiz/create-exam/', {
        method: 'POST',
        body: JSON.stringify(formObject),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('Success: ' + data.message);
        } else {
            alert('Error: ' + (data.error || 'Failed to create exam.'));
        }
    })
    .catch(error => {
        alert('Error: Failed to create exam.');
        console.error('Error:', error);
    });
});
