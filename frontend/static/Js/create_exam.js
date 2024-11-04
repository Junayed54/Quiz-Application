document.addEventListener('DOMContentLoaded', async function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    let newCategoryId = null;

    // Category-related elements
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('new-category-input');
    const addNewCategoryOption = document.createElement('option');
    addNewCategoryOption.value = 'new';
    addNewCategoryOption.textContent = 'Add New Category';
    categorySelect.appendChild(addNewCategoryOption);

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
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            } else {
                console.error('Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    loadCategories();

    // Show input for new category if "Add New Category" is selected
    categorySelect.addEventListener('change', function() {
        if (categorySelect.value === 'new') {
            newCategoryInput.style.display = 'block';
        } else {
            newCategoryInput.style.display = 'none';
        }
    });

    // Creating a new category and updating the dropdown
    async function createNewCategory(categoryName) {
        try {
            const response = await fetch('/quiz/exam_categories/create/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: categoryName })
            });

            const result = await response.json();
            if (response.ok) {
                const newOption = document.createElement('option');
                newOption.value = result.id; 
                newCategoryId = result.id; // Set new category ID
                newOption.textContent = result.name;

                categorySelect.appendChild(newOption);
                categorySelect.value = newCategoryId; // Set new category as selected
                
                newCategoryInput.style.display = 'none'; // Hide input after creating the category
            } else {
                console.error('Failed to create new category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    }

    const createExamBtn = document.getElementById('create-exam-btn');
    const exelForm = document.getElementById('exel-form');
    const uploadExcelBtn = document.getElementById("upload-excel-btn");
    const fileInput = document.getElementById("file-input");

    createExamBtn.addEventListener('click', async function() {
        const form = document.getElementById('create-exam-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Set duration in seconds
        const duration = document.getElementById('duration').value;
        data.duration = duration * 60;
    
        // Set starting_time and last_date to null if not provided
        data.starting_time = data.starting_time || null;
        data.last_date = data.last_date || null;
    
        const difficultyInputs = document.querySelectorAll('input[id^="difficulty"]');
        const totalPercentage = validateDifficultyPercentage(difficultyInputs);
    
        if (totalPercentage !== 100) {
            alert(`The total percentage of all difficulty levels must be 100%. Currently, it is ${totalPercentage}%. Please adjust the values.`);
            return;
        }
    
        const selectedCategory = categorySelect.value;
    
        // Handle new category creation
        if (selectedCategory === 'new') {
            const newCategoryName = newCategoryInput.value;
            await createNewCategory(newCategoryName);
            data.category = newCategoryId; // Assign new category ID
        } else {
            data.category = selectedCategory; // Use selected category ID
        }
        console.log(data);
        try {
            const response = await fetch('/quiz/exams/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
            if (response.ok) {
                form.dataset.examId = result.exam_id;
    
                const examId = result.exam_id;
                const difficultyData = collectDifficultyData(examId, difficultyInputs);
    
                await sendDifficultyData(examId, difficultyData);
    
                exelForm.classList.remove('d-none');
                alert('Exam created successfully!');
            } else {
                alert('Failed to create exam.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    

    async function sendDifficultyData(examId, difficultyData) {
        try {
            const response = await fetch('/quiz/add-exam-difficulty/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(difficultyData),
            });

            if (!response.ok) {
                console.error('Failed to update difficulty percentages:', await response.json());
            } else {
                console.log('Difficulty percentages updated successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function validateDifficultyPercentage(difficultyInputs) {
        let totalPercentage = 0;
        difficultyInputs.forEach(input => {
            totalPercentage += parseInt(input.value) || 0;
        });
        return totalPercentage;
    }

    function collectDifficultyData(examId, difficultyInputs) {
        const difficultyData = { exam: examId };
        difficultyInputs.forEach(input => {
            difficultyData[input.name] = input.value;
        });
        return difficultyData;
    }

    uploadExcelBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        const examId = document.getElementById('create-exam-form').dataset.examId;

        if (!file || !examId) {
            alert('Please select an Excel file and create an exam first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('exam_id', examId);
        
        try {
            const response = await fetch('/quiz/upload-excel/', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + accessToken },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                alert('Excel file processed successfully!');
                window.location.href = '/quiz/user_exams/';
            } else {
                console.error('Error processing Excel file:', result);
                alert('Failed to process Excel file.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the Excel file.');
        }
    });

    const generateQuestionsBtn = document.getElementById('generate-questions-btn');
    generateQuestionsBtn.addEventListener('click', async function() {
        const examId = document.getElementById('create-exam-form').dataset.examId;
        const totalQuestions = document.getElementById('total_questions').value;
        const difficultyData = collectDifficultyData(examId, document.querySelectorAll('input[id^="difficulty"]'));

        if (!examId || !totalQuestions) {
            alert('Please provide the exam ID and the number of questions to generate.');
            return;
        }

        try {
            const response = await fetch(`/quiz/exams/${examId}/generate_exam/`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    total_questions: totalQuestions,
                    difficulty: difficultyData
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Exam generated successfully!');
                window.location.href = '/quiz/user_exams/';
                console.log(result.questions);
            } else {
                console.error('Error generating exam:', result);
                alert(result);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the exam.');
        }
    });

    const difficultyInputs = document.querySelectorAll('[id^="difficulty"]');
    const lastDifficultyInput = document.getElementById('difficulty6_percentage');
    const difficulty6Hint = document.getElementById('difficulty6_hint');

    difficultyInputs.forEach(input => {
        input.addEventListener('input', updateLastDifficulty);
    });

    function updateLastDifficulty() {
        let totalPercentage = Array.from(difficultyInputs).reduce((acc, input) => {
            return input !== lastDifficultyInput ? acc + (parseInt(input.value) || 0) : acc;
        }, 0);

        if (!lastDifficultyInput.value) {
            lastDifficultyInput.value = Math.max(0, 100 - totalPercentage);
            difficulty6Hint.textContent = 'This field is calculated automatically based on other difficulties.';
        } else {
            difficulty6Hint.textContent = 'You have manually set this value.';
        }
    }

    updateLastDifficulty();
});
