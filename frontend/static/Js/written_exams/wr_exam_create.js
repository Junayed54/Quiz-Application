
// // static/Js/written_exams/wr_exam_create.js

// const API_ENDPOINTS = {
//     EXAM_TYPES: '/quiz/exam-types/',
//     SUBJECTS: '/api/subjects/',
//     ORGANIZATIONS: '/quiz/organizations/',
//     DEPARTMENTS: '/quiz/departments/',
//     POSITIONS: '/quiz/positions/',
//     CREATE_WRITTEN_EXAM: '/api/wr-exam/create-exam/', // Endpoint for RootExam + Written Questions
//     CREATE_PAST_EXAM_MCQ: '/quiz/past-exams/', // NEW: Endpoint for creating PastExam with Excel
// };

// let mainQuestionIndex = 0; // For written questions
// let subQuestionIndices = {}; // For sub-questions of written questions

// /**
//  * Fetches data from an API and populates a dropdown (select) element.
//  * @param {HTMLSelectElement} selectElement - The <select> element to populate.
//  * @param {string} apiUrl - The URL of the API endpoint.
//  * @param {string} valueField - The field name to use for the option's value.
//  * @param {string} textField - The field name to use for the option's text content.
//  * @param {boolean} isMultiple - True if the select element allows multiple selections.
//  */
// async function populateDropdown(selectElement, apiUrl, valueField, textField, isMultiple = false) {
//     try {
//         const response = await fetch(apiUrl);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
        
//         selectElement.innerHTML = ''; // Clear existing options

//         if (!isMultiple) {
//             const defaultOption = document.createElement('option');
//             defaultOption.value = '';
//             defaultOption.textContent = `Select an ${textField.toLowerCase()}`; // More generic
//             selectElement.appendChild(defaultOption);
//         }
        
//         data.forEach(item => {
//             const option = document.createElement('option');
//             option.value = item[valueField];
//             option.textContent = item[textField];
//             selectElement.appendChild(option);
//         });
//     } catch (error) {
//         console.error(`Error fetching data from ${apiUrl}:`, error);
//         selectElement.innerHTML = '<option value="">Error loading data</option>';
//     }
// }

// // --- Dynamic Section Visibility Logic ---

// /**
//  * Shows/hides sections based on the selected exam mode.
//  * @param {string} mode - The selected exam mode ('mcq', 'written', 'both').
//  */
// function updateSectionVisibility(mode) {
//     const mcqExcelUploadSection = document.getElementById('mcq-excel-upload-section');
//     const writtenQuestionSection = document.getElementById('written-question-section');

//     // Reset all sections to hidden first
//     mcqExcelUploadSection.style.display = 'none';
//     writtenQuestionSection.style.display = 'none';

//     // Reset required attributes for inputs in hidden sections
//     mcqExcelUploadSection.querySelectorAll('input, select').forEach(input => input.required = false);
//     writtenQuestionSection.querySelectorAll('input, textarea, select').forEach(input => input.required = false);

//     // Show sections based on mode
//     if (mode === 'mcq') {
//         mcqExcelUploadSection.style.display = 'block';
//         // Make essential MCQ Excel upload fields required
//         document.getElementById('excel_file').required = true;

//         // Clear existing written questions when switching to MCQ
//         document.getElementById('main-question-forms').innerHTML = `<div class="alert alert-info" role="alert">
//             No Written questions added yet. Click "Add Main Question" below.
//         </div>`;
//         mainQuestionIndex = 0;
//         subQuestionIndices = {};
//     } else if (mode === 'written') {
//         writtenQuestionSection.style.display = 'block';
//         // Ensure at least one written question block exists and its fields are required
//         if (mainQuestionIndex === 0) {
//             addMainQuestion();
//         }
//         // Clear MCQ Excel upload fields if switching from MCQ
//         document.getElementById('excel_file').value = ''; // Clear file input
//         document.getElementById('mcq_exam_duration').value = '';
//         document.getElementById('mcq_exam_pass_mark').value = '';
//         document.getElementById('mcq_exam_negative_mark').value = '';
//     } else if (mode === 'both') {
//         mcqExcelUploadSection.style.display = 'block';
//         writtenQuestionSection.style.display = 'block';
//         // Make essential MCQ Excel upload fields required
//         document.getElementById('excel_file').required = true;
//         // Ensure at least one written question block exists
//         if (mainQuestionIndex === 0) {
//             addMainQuestion();
//         }
//     }
// }


// // --- Existing Written Question HTML and Functions (mostly copied from previous) ---
// /**
//  * Generates the HTML string for a single main question block.
//  * @param {number} index - The index of the main question.
//  * @returns {string} The HTML string for the main question block.
//  */
// function getMainQuestionHtml(index) {
//     return `
//     <div class="form-section main-question-block" id="main-question-block-${index}">
//         <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeMainQuestion(this, ${index})">Remove</button>
//         <h5 class="section-title">Written Question ${index + 1}</h5>
//         <div class="row g-3">
//             <div class="col-md-12">
//                 <label class="form-label">Question Text</label>
//                 <textarea class="form-control" name="main_questions[${index}][question_text]" rows="3" required></textarea>
//             </div>
//             <div class="col-md-6">
//                 <label class="form-label">Question Image (optional)</label>
//                 <input type="file" class="form-control" name="main_questions[${index}][question_image]">
//             </div>
//             <div class="col-md-3">
//                 <label class="form-label">Question Number</label>
//                 <input type="number" class="form-control"
//                         name="main_questions[${index}][question_number]"
//                         value="${index + 1}" required>
//             </div>
//             <div class="col-md-3">
//                 <label class="form-label">Marks</label>
//                 <input type="number" step="0.01" class="form-control" name="main_questions[${index}][question_marks]" required>
//             </div>
//             <div class="col-md-6">
//                 <label class="form-label">Answer Text (optional)</label>
//                 <textarea class="form-control" name="main_questions[${index}][answer_text]" rows="2"></textarea>
//             </div>
//             <div class="col-md-6">
//                 <label class="form-label">Answer Image (optional)</label>
//                 <input type="file" class="form-control" name="main_questions[${index}][answer_image]">
//             </div>
//         </div>

//         <div class="passage-section-toggle form-check form-switch mt-4">
//             <input class="form-check-input" type="checkbox" id="addPassageToggle-${index}" onclick="togglePassageFields(this, ${index})">
//             <label class="form-check-label" for="addPassageToggle-${index}">Add Passage for this Question</label>
//         </div>
//         <div class="passage-fields" id="passage-fields-${index}" style="display:none;">
//             <h6 class="section-title">Passage Details (optional)</h6>
//             <div class="row g-3">
//                 <div class="col-md-6">
//                     <label class="form-label">Passage Title</label>
//                     <input type="text" class="form-control" name="main_questions[${index}][passage][title]">
//                 </div>
//                 <div class="col-md-6">
//                     <label class="form-label">Subject</label>
//                     <select class="form-select passage-subject-select" name="main_questions[${index}][passage][subject]">
//                         <option value="">Select Subject</option>
//                     </select>
//                 </div>
//                 <div class="col-md-12">
//                     <label class="form-label">Passage Text</label>
//                     <textarea class="form-control" name="main_questions[${index}][passage][text]" rows="4"></textarea>
//                 </div>
//                 <div class="col-md-6">
//                     <label class="form-label">Passage Image (optional)</label>
//                     <input type="file" class="form-control" name="main_questions[${index}][passage][image]">
//                 </div>
//             </div>
//         </div>

//         <div class="mt-4">
//             <h6 class="section-title">Add Sub Questions (optional) for this Main Question</h6>
//             <div id="sub-question-container-${index}"></div>
//             <button type="button" class="btn btn-outline-primary" onclick="addSubQuestion(${index})">➕ Add Sub Question</button>
//         </div>
//     </div>
//     `;
// }

// /**
//  * Adds a new main question block to the form.
//  */
// function addMainQuestion() {
//     const container = document.getElementById('main-question-forms');
//     const infoAlert = container.querySelector('.alert-info');
//     if (infoAlert) {
//         infoAlert.remove();
//     }

//     const newMainQuestionHtml = getMainQuestionHtml(mainQuestionIndex);
//     container.insertAdjacentHTML('beforeend', newMainQuestionHtml);
    
//     subQuestionIndices[mainQuestionIndex] = 0;

//     const newPassageSubjectSelect = document.querySelector(`#main-question-block-${mainQuestionIndex} .passage-subject-select`);
//     if (newPassageSubjectSelect) {
//         populateDropdown(newPassageSubjectSelect, API_ENDPOINTS.SUBJECTS, 'id', 'name');
//     }
    
//     mainQuestionIndex++;
// }

// /**
//  * Removes a main question block from the form.
//  * @param {HTMLElement} buttonElement - The remove button element clicked.
//  * @param {number} index - The index of the main question to remove.
//  */
// function removeMainQuestion(buttonElement, index) {
//     if (confirm("Are you sure you want to remove this written question?")) {
//         buttonElement.closest('.main-question-block').remove();
//         delete subQuestionIndices[index];

//         const container = document.getElementById('main-question-forms');
//         if (container.children.length === 0) {
//             container.innerHTML = `<div class="alert alert-info" role="alert">
//                 No Written questions added yet. Click "Add Main Question" below.
//             </div>`;
//         }
//     }
// }

// /**
//  * Toggles the visibility of passage-related fields for a main question.
//  * @param {HTMLInputElement} checkbox - The checkbox that triggers the toggle.
//  * @param {number} index - The index of the main question.
//  */
// function togglePassageFields(checkbox, index) {
//     const passageFields = document.getElementById(`passage-fields-${index}`);
//     const inputs = passageFields.querySelectorAll('input, textarea, select');

//     if (checkbox.checked) {
//         passageFields.style.display = 'block';
//         inputs.forEach(field => {
//             if (field.name.includes('[passage]')) {
//                 if (field.name.includes('[title]') || field.name.includes('[text]')) {
//                     field.required = true; 
//                 }
//             }
//         });
//     } else {
//         passageFields.style.display = 'none';
//         inputs.forEach(field => {
//             if (field.name.includes('[passage]')) {
//                 field.value = '';
//                 field.required = false;
//             }
//         });
//     }
// }

// /**
//  * Adds a new sub-question block to a specific main question.
//  * @param {number} mainQuestionIdx - The index of the parent main question.
//  */
// function addSubQuestion(mainQuestionIdx) {
//     const container = document.getElementById(`sub-question-container-${mainQuestionIdx}`);
//     const currentSubQuestionIndex = subQuestionIndices[mainQuestionIdx];

//     const html = `
//     <div class="border p-3 mb-3 rounded bg-light sub-question-block">
//         <button type="button" class="btn btn-sm btn-danger float-end" onclick="this.closest('.sub-question-block').remove()">Remove</button>
//         <h6>Sub Question ${currentSubQuestionIndex + 1} for Written Question ${mainQuestionIdx + 1}</h6>
//         <div class="row g-3">
//             <div class="col-md-12">
//                 <label>Sub Question Text</label>
//                 <textarea class="form-control" name="main_questions[${mainQuestionIdx}][sub_questions][${currentSubQuestionIndex}][text]" rows="2" required></textarea>
//             </div>
//             <div class="col-md-6">
//                 <label>Sub Image (optional)</label>
//                 <input type="file" class="form-control" name="main_questions[${mainQuestionIdx}][sub_questions][${currentSubQuestionIndex}][image]">
//             </div>
//             <div class="col-md-3">
//                 <label>Sub Number</label>
//                 <input type="number" class="form-control"
//                         name="main_questions[${mainQuestionIdx}][sub_questions][${currentSubQuestionIndex}][number]"
//                         value="${currentSubQuestionIndex + 1}" required>
//             </div>
//             <div class="col-md-3">
//                 <label>Marks</label>
//                 <input type="number" step="0.01" class="form-control" name="main_questions[${mainQuestionIdx}][sub_questions][${currentSubQuestionIndex}][marks]" required>
//             </div>
//             <div class="col-md-6">
//                 <label>Answer Text (optional)</label>
//                 <textarea class="form-control" name="main_questions[${mainQuestionIdx}][sub_questions][${currentSubQuestionIndex}][answer_text]" rows="2"></textarea>
//             </div>
//             <div class="col-md-6">
//                 <label>Answer Image (optional)</label>
//                 <input type="file" class="form-control" name="main_questions[${mainQuestionIdx}][sub_questions][${currentSubQuestionIndex}][answer_image]">
//             </div>
//         </div>
//     </div>
//     `;
//     container.insertAdjacentHTML('beforeend', html);
//     subQuestionIndices[mainQuestionIdx]++;
// }


// /**
//  * Handles the form submission to send data to the Django API.
//  * This function now conditionally sends data based on exam mode.
//  * @param {Event} event - The form submission event.
//  */
// async function handleSubmit(event) {
//     event.preventDefault(); // Prevent default form submission

//     const form = document.getElementById('examForm');
//     const examMode = document.getElementById('exam_mode_select').value;
//     const accessToken = localStorage.getItem('access_token'); 
//     const headers = {
//         'Authorization': `Bearer ${accessToken}`
//     };

//     let urlToFetch = '';
//     let bodyToSend; // Will be FormData or JSON

//     if (examMode === 'mcq') {
//         // Validation for MCQ Excel upload fields
//         const excelFile = document.getElementById('excel_file').files[0];
//         if (!excelFile) {
//             Swal.fire('Error', 'Please upload an Excel file for MCQ questions.', 'error');
//             return;
//         }

//         // Prepare FormData for PastExam creation
//         const pastExamFormData = new FormData();
//         pastExamFormData.append("title", document.getElementById("root_exam_title").value);
//         pastExamFormData.append("organization", document.getElementById("organization_select").value);
//         pastExamFormData.append("department", document.getElementById("department_select").value);
//         pastExamFormData.append("position", document.getElementById("position_select").value);
//         pastExamFormData.append("exam_type", document.getElementById("exam_type_select").value);
//         pastExamFormData.append("exam_date", document.getElementById("root_exam_date").value);
        
//         // Optional fields from the new section
//         const duration = document.getElementById("mcq_exam_duration").value;
//         if (duration) pastExamFormData.append("duration", duration);
        
//         const passMark = document.getElementById("mcq_exam_pass_mark").value;
//         if (passMark) pastExamFormData.append("pass_mark", passMark);
        
//         const negativeMark = document.getElementById("mcq_exam_negative_mark").value;
//         if (negativeMark) pastExamFormData.append("negative_mark", negativeMark);

//         pastExamFormData.append("file", excelFile); // The Excel file

//         urlToFetch = API_ENDPOINTS.CREATE_PAST_EXAM_MCQ;
//         bodyToSend = pastExamFormData;
//         // No 'Content-Type' header needed for FormData
        
//     } else { // 'written' or 'both'
//         const formData = new FormData(form); // Get all fields from examForm
        
//         // Remove MCQ specific fields that shouldn't be processed by CreateWrittenExamAPIView
//         formData.delete('excel_file');
//         formData.delete('mcq_exam_duration');
//         formData.delete('mcq_exam_pass_mark');
//         formData.delete('mcq_exam_negative_mark');

//         // Logic to remove empty file inputs from main_questions if needed (or backend handles it)
//         // This is generally not needed as empty file inputs are just ignored by Django.

//         urlToFetch = API_ENDPOINTS.CREATE_WRITTEN_EXAM;
//         bodyToSend = formData;
//     }

//     try {
//         const response = await fetch(urlToFetch, {
//             method: 'POST',
//             headers: headers,
//             body: bodyToSend,
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             console.error('Error creating exam:', errorData);

//             Swal.fire({
//                 title: 'Failed to Create Exam',
//                 text: errorData.error || JSON.stringify(errorData),
//                 icon: 'error',
//                 confirmButtonText: 'OK'
//             });

//             return;
//         }

//         const successData = await response.json();
//         console.log('Exam created successfully:', successData);

//         Swal.fire({
//             title: 'Success!',
//             text: 'Exam created successfully! ID: ' + (successData.exam_id || successData.id), // Use exam_id for RootExam, id for PastExam
//             icon: 'success',
//             confirmButtonText: 'OK'
//         });

//         // Reset the entire form and dynamic sections
//         form.reset();
//         document.getElementById('main-question-forms').innerHTML = `<div class="alert alert-info" role="alert">
//             No Written questions added yet. Click "Add Main Question" below.
//         </div>`;
//         mainQuestionIndex = 0;
//         subQuestionIndices = {};
        
//         // Re-initialize visibility based on the default selected exam mode
//         const initialExamMode = document.getElementById('exam_mode_select').value;
//         updateSectionVisibility(initialExamMode);
        
//     } catch (error) {
//         console.error('Network or submission error:', error);

//         Swal.fire({
//             title: 'Error!',
//             text: 'An error occurred during submission. Please check your network connection.',
//             icon: 'error',
//             confirmButtonText: 'OK'
//         });
//     }
// }

// // ... (getCookie function - keep if needed for CSRF, though Bearer token often suffices for API) ...


// // --- Event Listeners and Initialization ---
// document.addEventListener('DOMContentLoaded', function() {
//     const examTypeSelect = document.getElementById('exam_type_select');
//     const subjectsSelect = document.getElementById('subjects_select');
//     const organizationSelect = document.getElementById('organization_select');
//     const departmentSelect = document.getElementById('department_select');
//     const positionSelect = document.getElementById('position_select');
//     const examModeSelect = document.getElementById('exam_mode_select');
//     const examForm = document.getElementById('examForm');

//     // Populate top-level dropdowns on page load
//     populateDropdown(examTypeSelect, API_ENDPOINTS.EXAM_TYPES, 'id', 'name'); 
//     populateDropdown(subjectsSelect, API_ENDPOINTS.SUBJECTS, 'id', 'name', true); 
//     populateDropdown(organizationSelect, API_ENDPOINTS.ORGANIZATIONS, 'id', 'name'); 
//     populateDropdown(departmentSelect, API_ENDPOINTS.DEPARTMENTS, 'id', 'name'); 
//     populateDropdown(positionSelect, API_ENDPOINTS.POSITIONS, 'id', 'name');
    
//     // Attach event listener to exam mode select
//     examModeSelect.addEventListener('change', (event) => {
//         updateSectionVisibility(event.target.value);
//     });

//     // Initialize visibility based on default selected mode
//     updateSectionVisibility(examModeSelect.value);

//     // Add event listener for form submission
//     examForm.addEventListener('submit', handleSubmit);
// });






document.addEventListener('DOMContentLoaded', () => {
    const examForm = document.getElementById('examForm'); // The main form for submitting all data
    const examModeSelect = document.getElementById('exam_mode_select'); // Corrected ID
    const mcqExcelUploadSection = document.getElementById('mcq-excel-upload-section');
    const writtenQuestionSection = document.getElementById('written-question-section');
    const mainQuestionFormsContainer = document.getElementById('main-question-forms'); // Container for written questions

    // Select the MCQ-specific input fields for dynamically setting 'required'
    const mcqDurationInput = document.getElementById('mcq_exam_duration');
    const mcqPassMarkInput = document.getElementById('mcq_exam_pass_mark');
    const mcqNegativeMarkInput = document.getElementById('mcq_exam_negative_mark');
    const mcqFileInput = document.getElementById('mcq_file'); // Changed ID from excel_file

    let mainQuestionIndex = 0; // Global index for naming main questions

    // --- Utility Functions for Fetching Data (keep as they are from your common JS or API fetching logic) ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Could not fetch data from ${url}:`, error);
            return []; // Return empty array on error to prevent breaking
        }
    }

    async function populateSelect(selectElementId, apiUrl, valueKey, textKey) {
        const selectElement = document.getElementById(selectElementId);
        if (!selectElement) {
            console.warn(`Select element with ID ${selectElementId} not found.`);
            return;
        }
        const data = await fetchData(apiUrl);
        selectElement.innerHTML = `<option value="">Select ${selectElement.previousElementSibling.textContent.trim()}</option>`;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            selectElement.appendChild(option);
        });
    }

    // --- Populate dropdowns on page load ---
    populateSelect('exam_type_select', '/quiz/exam-types/', 'id', 'name'); // Adjust API path
    populateSelect('subjects_select', '/api/subjects/', 'id', 'name'); // Adjust API path
    populateSelect('organization_select', '/quiz/organizations/', 'id', 'name'); // Adjust API path
    populateSelect('department_select', '/quiz/departments/', 'id', 'name'); // Adjust API path
    populateSelect('position_select', '/quiz/positions/', 'id', 'name'); // Adjust API path


    // --- Event Listener for Exam Mode Change ---
    const handleExamModeChange = () => {
        const selectedMode = examModeSelect.value;

        // Hide both sections initially
        mcqExcelUploadSection.style.display = 'none';
        writtenQuestionSection.style.display = 'none';

        // Remove required attributes from MCQ fields
        mcqDurationInput.removeAttribute('required');
        mcqPassMarkInput.removeAttribute('required');
        mcqNegativeMarkInput.removeAttribute('required');
        mcqFileInput.removeAttribute('required');


        if (selectedMode === 'mcq') {
            mcqExcelUploadSection.style.display = 'block';
            mcqDurationInput.setAttribute('required', true);
            mcqPassMarkInput.setAttribute('required', true);
            mcqNegativeMarkInput.setAttribute('required', true);
            mcqFileInput.setAttribute('required', true);
        } else if (selectedMode === 'written') {
            writtenQuestionSection.style.display = 'block';
        } else if (selectedMode === 'both') {
            mcqExcelUploadSection.style.display = 'block';
            writtenQuestionSection.style.display = 'block';
            
            // Make MCQ fields required for 'both' mode
            mcqDurationInput.setAttribute('required', true);
            mcqPassMarkInput.setAttribute('required', true);
            mcqNegativeMarkInput.setAttribute('required', true);
            mcqFileInput.setAttribute('required', true);
        }
    };

    // Attach event listener
    examModeSelect.addEventListener('change', handleExamModeChange);

    // Initial call to set visibility based on default selected option
    handleExamModeChange();

    // --- Function to add a new main question block ---
    window.addMainQuestion = () => { // Made global for onclick in HTML
        const mqDiv = document.createElement('div');
        mqDiv.className = 'main-question-block form-section'; // Added form-section for consistent styling
        mqDiv.innerHTML = `
            <button type="button" class="btn btn-sm btn-danger remove-btn" onclick="removeMainQuestion(this)">✖</button>
            <h5 class="section-title">Main Question #${mainQuestionIndex + 1}</h5>
            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Question Number:</label>
                    <input type="text" class="form-control" name="main_questions[${mainQuestionIndex}][question_number]" value="${mainQuestionIndex + 1}" required>
                </div>
                <div class="col-md-9">
                    <label class="form-label">Question Text:</label>
                    <textarea class="form-control" name="main_questions[${mainQuestionIndex}][question_text]" rows="4"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Question Image:</label>
                    <input type="file" class="form-control" name="main_questions[${mainQuestionIndex}][question_image]" accept="image/*">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Marks:</label>
                    <input type="number" step="0.1" class="form-control" name="main_questions[${mainQuestionIndex}][question_marks]" required>
                </div>
                <div class="col-md-12">
                    <label class="form-label">Answer Text:</label>
                    <textarea class="form-control" name="main_questions[${mainQuestionIndex}][answer_text]" rows="4"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Answer Image:</label>
                    <input type="file" class="form-control" name="main_questions[${mainQuestionIndex}][answer_image]" accept="image/*">
                </div>
            </div>

            <h6 class="section-title mt-4">Explanation (Optional)</h6>
            <div class="row g-3">
                <div class="col-md-12">
                    <label class="form-label">Explanation Text:</label>
                    <textarea class="form-control" name="main_questions[${mainQuestionIndex}][explanation_text]" rows="3"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Explanation Image:</label>
                    <input type="file" class="form-control" name="main_questions[${mainQuestionIndex}][explanation_image]" accept="image/*">
                </div>
            </div>

            <div class="form-check form-switch passage-section-toggle">
                <input class="form-check-input" type="checkbox" role="switch" id="togglePassage${mainQuestionIndex}" onchange="togglePassageSection(this)">
                <label class="form-check-label" for="togglePassage${mainQuestionIndex}">Add Passage?</label>
            </div>
            <div id="passage-fields-${mainQuestionIndex}" class="passage-fields" style="display:none;">
                <h6 class="section-title">Passage Details</h6>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Passage Title:</label>
                        <input type="text" class="form-control" name="main_questions[${mainQuestionIndex}][passage][title]">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Passage Subject (ID):</label>
                        <input type="number" class="form-control" name="main_questions[${mainQuestionIndex}][passage][subject]">
                        <div class="form-text">Optional, only if different from exam subjects.</div>
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Passage Text:</label>
                        <textarea class="form-control" name="main_questions[${mainQuestionIndex}][passage][text]" rows="3"></textarea>
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Passage Image:</label>
                        <input type="file" class="form-control" name="main_questions[${mainQuestionIndex}][passage][image]" accept="image/*">
                    </div>
                </div>
            </div>

            <h6 class="section-title mt-4">Sub-Questions</h6>
            <div id="sub-question-forms-${mainQuestionIndex}">
                </div>
            <div class="text-start mt-3">
                <button type="button" class="btn btn-outline-info btn-sm" onclick="addSubQuestion(${mainQuestionIndex})">➕ Add Sub-Question</button>
            </div>
        `;
        mainQuestionFormsContainer.appendChild(mqDiv);
        mainQuestionIndex++; // Increment for the next main question
        removeAlertIfQuestionsExist(); // Call to remove the "No questions yet" alert
    };

    window.removeMainQuestion = (buttonElement) => {
        buttonElement.closest('.main-question-block').remove();
        // Potentially re-index main questions here if you rely on strict sequential numbering
        // For now, backend parses by key presence, so it's less critical immediately.
        if (mainQuestionFormsContainer.children.length === 0) {
            addNoQuestionsAlert();
        }
    };

    window.togglePassageSection = (checkbox) => {
        const mqIndex = checkbox.id.replace('togglePassage', '');
        const passageFields = document.getElementById(`passage-fields-${mqIndex}`);
        if (checkbox.checked) {
            passageFields.style.display = 'block';
        } else {
            passageFields.style.display = 'none';
            // Clear fields if passage is hidden
            passageFields.querySelectorAll('input, textarea').forEach(input => input.value = '');
        }
    };

    // --- Function to add a new sub-question block ---
    window.addSubQuestion = (parentMainQuestionIndex) => { // Made global for onclick in HTML
        const subQuestionsContainer = document.getElementById(`sub-question-forms-${parentMainQuestionIndex}`);
        let subQuestionLocalIndex = subQuestionsContainer.querySelectorAll('.sub-question-block').length;

        const subQDiv = document.createElement('div');
        subQDiv.className = 'sub-question-block border p-3 mb-3 bg-light rounded position-relative';
        subQDiv.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-danger remove-btn" onclick="removeSubQuestion(this)">✖</button>
            <h6>Sub-Question #${subQuestionLocalIndex + 1}</h6>
            <div class="row g-3">
                <div class="col-md-3">
                    <label class="form-label">Sub-Question Number:</label>
                    <input type="text" class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][number]" value="${subQuestionLocalIndex + 1}" required>
                </div>
                <div class="col-md-9">
                    <label class="form-label">Sub-Question Text:</label>
                    <textarea class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][text]" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Image:</label>
                    <input type="file" class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][image]" accept="image/*">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Marks:</label>
                    <input type="number" step="0.1" class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][marks]" required>
                </div>
                <div class="col-md-12">
                    <label class="form-label">Answer Text:</label>
                    <textarea class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][answer_text]" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Answer Image:</label>
                    <input type="file" class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][answer_image]" accept="image/*">
                </div>
            </div>

            <h6 class="section-title mt-4">Explanation (Optional)</h6>
            <div class="row g-3">
                <div class="col-md-12">
                    <label class="form-label">Explanation Text:</label>
                    <textarea class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][explanation_text]" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Explanation Image:</label>
                    <input type="file" class="form-control" name="main_questions[${parentMainQuestionIndex}][sub_questions][${subQuestionLocalIndex}][explanation_image]" accept="image/*">
                </div>
            </div>
        `;
        subQuestionsContainer.appendChild(subQDiv);
    };

    window.removeSubQuestion = (buttonElement) => {
        buttonElement.closest('.sub-question-block').remove();
    };

    const removeAlertIfQuestionsExist = () => {
        const alert = mainQuestionFormsContainer.querySelector('.alert-info');
        if (alert && mainQuestionFormsContainer.children.length > 1) { // >1 because the alert itself is a child
            alert.remove();
        }
    };

    const addNoQuestionsAlert = () => {
        if (mainQuestionFormsContainer.querySelector('.alert-info')) return; // Avoid duplicate alerts
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-info';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.textContent = 'No Written questions added yet. Click "Add Main Question" below.';
        mainQuestionFormsContainer.prepend(alertDiv); // Add back at the beginning
    };


    // --- Form Submission ---
    examForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(examForm); // Collects all named inputs from the form

        // For subjects multi-select, FormData needs manual appending for multiple values
        const subjectsSelect = document.getElementById('subjects_select');
        if (subjectsSelect) {
            // Remove existing 'subjects' entry if any, then append selected ones
            formData.delete('subjects'); // Remove existing entry from initial FormData creation
            Array.from(subjectsSelect.options).forEach(option => {
                if (option.selected) {
                    formData.append('subjects', option.value);
                }
            });
        }
        
        // IMPORTANT: Clean up empty file inputs
        // FormData includes empty file inputs (name="", size=0, type="").
        // Your Django view expects actual files for the image fields.
        // Remove these empty file entries to avoid errors.
        for (const [key, value] of Array.from(formData.entries())) { // Convert to array to iterate
            if (value instanceof File && value.name === '' && value.size === 0 && value.type === '') {
                formData.delete(key);
            }
        }

        // Log FormData contents for debugging (optional)
        // for (let pair of formData.entries()) {
        //  console.log(pair[0]+ ': ' + pair[1]);
        // }


        try {
            // You need to ensure you have a JWT token or session cookie for authentication
            // Example for JWT (replace with your actual token retrieval logic):
            const authToken = localStorage.getItem('access_token'); // Or wherever you store it

            const response = await fetch('/api/wr-exams/create/', { // Your API endpoint URL
                method: 'POST',
                body: formData,
                headers: {
                    // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
                    'Authorization': `Bearer ${authToken}` // Include your authentication token
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error creating exam: ${errorData.error || response.statusText}`);
                console.error('API Error:', errorData);
                return;
            }

            const successData = await response.json();
            alert(`Exam created successfully! Root Exam ID: ${successData.root_exam_id}${successData.past_exam_id ? `, Past Exam ID: ${successData.past_exam_id}` : ''}`);
            console.log('Success:', successData);
            examForm.reset(); // Clear the form
            // Re-initialize dynamic sections/alerts after reset if needed
            mainQuestionFormsContainer.innerHTML = ''; // Clear written questions
            mainQuestionIndex = 0; // Reset index
            addNoQuestionsAlert(); // Add the "No questions yet" alert back
            handleExamModeChange(); // Reset visibility based on default mode

        } catch (error) {
            console.error('Network or other error:', error);
            alert('Failed to connect to the server or an unexpected error occurred.');
        }
    });
});