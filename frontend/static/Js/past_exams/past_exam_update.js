const token = localStorage.getItem("access_token");
const urlPath = window.location.pathname;
const examId = urlPath.split("/")[3];
console.log(examId);

// Global map to store all Quill instances, so they can be accessed later (e.g., for data retrieval)
const quillInstances = {};

// Toolbar configuration including the 'formula' button for MathQuill
const toolbarOptions = [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['image', 'link', 'formula'] // 'formula' requires a MathQuill module
];

/**
 * Initializes Quill editor instances on all elements with the class 'quill-target'.
 * This must be called AFTER the dynamic HTML is injected into the DOM.
 */
function initializeQuillEditors() {
    const targets = document.querySelectorAll('.quill-target');

    targets.forEach(editorElement => {
        const editorId = editorElement.id;
        
        // Prevent re-initialization if the page doesn't fully reload
        if (quillInstances[editorId]) return;

        const quill = new Quill(`#${editorId}`, {
            modules: {
                toolbar: toolbarOptions,
                // Ensure your custom MathQuill module is active here, e.g.,
                // formula: true 
            },
            theme: 'snow',
            placeholder: 'Enter explanation or paste content here...'
        });

        // Store the instance globally
        quillInstances[editorId] = quill;

        // Get initial HTML content from the editor after initialization
        const initialContent = quill.root.innerHTML;

        // Get the associated hidden input field
        const hiddenInput = document.getElementById(`${editorId}_hidden`);

        // Set the initial value of the hidden input
        if (hiddenInput) {
            hiddenInput.value = initialContent;
        }

        // Update the hidden input field on content change
        quill.on('text-change', function() {
            if (hiddenInput) {
                // Store the raw HTML content (includes MathQuill HTML)
                hiddenInput.value = quill.root.innerHTML; 
            }
        });
    });
}
// ----------------------------------------------------------------------


document.addEventListener("DOMContentLoaded", () => {
    fetch(`/quiz/past-exams/${examId}/`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(exam => {
        renderExamDetails(exam);
        // CRITICAL: Initialize Quill editors after content is rendered
        initializeQuillEditors(); 
    })
    .catch(error => console.error("Error fetching exam details:", error));
});

function renderExamDetails(exam) {
    console.log(exam);
    const container = document.getElementById("exam-detail");
    container.innerHTML = `
        <div class="p-4 bg-light border rounded shadow-sm">
            <h2 class="h4 mb-4">${exam.title}</h2>
            <form id="exam-details-form" class="mb-4">
                <div class="mb-3">
                    <label for="exam-title" class="form-label">Title</label>
                    <input type="text" id="exam-title" class="form-control" value="${exam.title}" />
                </div>
                <div class="mb-3">
                    <label for="exam-date" class="form-label">Exam Date</label>
                    <input type="date" id="exam-date" class="form-control" value="${exam.exam_date}" />
                </div>
                <button type="button" onclick="updateExamDetails(${exam.id})" class="btn btn-success">Save Exam Details</button>
            </form>
            <button type="button" id="add-question-btn" class="btn btn-primary my-3">Add Question</button>
            <div id="add-question-form" class="p-3 bg-light border rounded mb-4" style="display: none;">
                <h3 class="h5 mb-3">New Question</h3>
                <div class="mb-3">
                    <label class="form-label">Question Text</label>
                    <textarea id="new-question-text" class="form-control"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Question Image</label>
                    <input type="file" id="new-question-image" accept="image/*" class="form-control" />
                </div>
                <div id="options-container" class="mb-3">
                    <h4 class="h6 mb-2">Options</h4>
                    </div>
                <button type="button" id="add-option-btn" class="btn btn-secondary btn-sm mb-2">Add Option</button>
                <br/>
                <button type="button" id="submit-question-btn" class="btn btn-success">Submit Question</button>
            </div>
        </div>
    `;

    document.getElementById("add-question-btn").addEventListener("click", () => {
        document.getElementById("add-question-form").style.display = "block";
    });

    document.getElementById("add-option-btn").addEventListener("click", addOptionField);

    document.getElementById("submit-question-btn").addEventListener("click", submitNewQuestion);

    const bindCalls = [];

    // Render existing questions
    exam.questions.forEach((q, index) => {
        const qDiv = document.createElement("div");
        qDiv.className = "card p-4 my-3 border shadow-sm";

        qDiv.innerHTML = `
            <h4 class="h5 card-title mb-3">Q${index + 1}</h4>
            ${q.question.image ? `
                <img src="${q.question.image}" class="img-fluid mb-2 rounded" style="max-width: 200px;" />
                <button class="btn btn-sm btn-outline-danger mb-3" onclick="deleteQuestionImage(${q.question.id})">Delete Question Image</button>
            ` : ""}

            <textarea id="q_text_${q.question.id}" class="form-control text-primary mb-3">${q.question.text || ""}</textarea>

            <div class="border border-dashed p-3 text-center rounded mb-4" id="q_drop_${q.question.id}">
                Drag & Drop or Click to Upload Question Image
                <input type="file" accept="image/*" class="d-none" id="q_input_${q.question.id}" />
                <img id="q_preview_${q.question.id}" class="img-thumbnail mx-auto mt-2" style="display:none; max-width: 100px;" />
            </div>

            <div class="mb-3 d-flex gap-2">
                <button class="btn btn-sm btn-primary" onclick="updateQuestion(${q.question.id})">Update Question</button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.question.id})">Delete Question</button>
            </div>

            <div class="border-top pt-4 mt-4">
                <h5 class="h6 mb-2">Explanation</h5>

                                <div id="explanation_editor_${q.id}" class="form-control mb-3 quill-target" style="min-height: 150px;">
                    ${q.explanation || ""}
                </div>
                                <input type="hidden" name="explanation_${q.id}_data" id="explanation_editor_${q.id}_hidden">

                <div class="border border-dashed p-3 text-center rounded mb-2" id="exp_drop_${q.id}">
                    Drag & Drop or Click to Upload Explanation Image
                    <input type="file" accept="image/*" class="d-none" id="exp_input_${q.id}" />
                    <img id="exp_preview_${q.id}" class="img-thumbnail mx-auto mt-2" style="display:${q.explanation_image ? 'block' : 'none'}; max-width: 100px;" src="${q.explanation_image || ''}" />
                </div>

                <button class="btn btn-sm btn-success" onclick="updateExplanation(${q.id})">
                    Save Explanation
                </button>
            </div>

            <div class="border-top pt-3 mt-3 space-y-3">
                ${q.options.map(opt => `
                    <div class="card p-3 mb-2">
                        ${opt.image ? `
                            <img src="${opt.image}" class="img-fluid mb-2 rounded" style="max-width: 100px;" />
                            <button class="btn btn-xs btn-outline-danger mb-2" onclick="deleteOptionImage(${opt.id})">Delete Option Image</button>
                        ` : ""}
                        
                        <input type="text" id="opt_text_${opt.id}" class="form-control mb-2 ${opt.is_correct ? 'text-success' : 'text-secondary'}" value="${opt.text || ""}" />

                        <div class="border border-dashed p-2 text-center rounded mb-2" id="opt_drop_${opt.id}">
                            Drag & Drop or Click to Upload Option Image
                            <input type="file" accept="image/*" class="d-none" id="opt_input_${opt.id}" />
                            <img id="opt_preview_${opt.id}" class="img-thumbnail mx-auto mt-1" style="display:none; max-width: 80px;" />
                        </div>

                        <div class="form-check d-flex align-items-center justify-content-between pt-2">
                            <label class="form-check-label">
                                <input type="checkbox" id="opt_correct_${opt.id}" ${opt.is_correct ? "checked" : ""} class="form-check-input me-2" />
                                Correct
                            </label>
                            <button class="btn btn-sm btn-success" onclick="updateOption(${opt.id})">Update Option</button>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
        
        document.getElementById("exam-detail").appendChild(qDiv);
        
        bindCalls.push(() => {
            // Bind all drag and drop handlers
            bindDragDropAndSelect(
                `q_drop_${q.question.id}`,
                `q_input_${q.question.id}`,
                `q_preview_${q.question.id}`
            );
            bindDragDropAndSelect(
                `exp_drop_${q.id}`,
                `exp_input_${q.id}`,
                `exp_preview_${q.id}`
            );
            q.options.forEach(opt => {
                bindDragDropAndSelect(
                    `opt_drop_${opt.id}`,
                    `opt_input_${opt.id}`,
                    `opt_preview_${opt.id}`
                );
            });
        });
    });

    bindCalls.forEach(fn => fn());
}

function addOptionField() {
    const optionsContainer = document.getElementById("options-container");
    const optionDiv = document.createElement("div");
    optionDiv.className = "mb-3 p-3 border rounded"; // Bootstrap styling
    optionDiv.innerHTML = `
        <input type="text" class="form-control mb-2 option-text text-secondary" placeholder="Option text" />
        <input type="file" class="form-control option-image mb-2" accept="image/*" />
        <div class="form-check">
            <input type="checkbox" class="form-check-input option-correct" />
            <label class="form-check-label">Correct</label>
        </div>
    `;
    optionsContainer.appendChild(optionDiv);
}

function submitNewQuestion() {
    const questionText = document.getElementById("new-question-text").value.trim();
    const questionImageInput = document.getElementById("new-question-image");
    const questionImage = questionImageInput.files[0];
    const optionItems = document.querySelectorAll(".option-item");
    const optionsPayload = []; 
    const formData = new FormData();

    // 1. Process Options and their images
    optionItems.forEach((item, index) => {
        const text = item.querySelector(".option-text").value.trim();
        const imageInput = item.querySelector(".option-image");
        const image = imageInput.files[0];
        const isCorrect = item.querySelector(".option-correct").checked;

        const imageKey = `option_image_${index}`;

        // Add the image file to FormData under a unique key
        if (image) {
            formData.append(imageKey, image);
        }

        // Add the option data to the payload (excluding the File object)
        optionsPayload.push({ 
            text, 
            isCorrect, 
            image_key: image ? imageKey : null 
        });
    });

    // 2. Validation
    if (!questionText && !questionImage) {
        alert("Please provide question text or image.");
        return;
    }
    if (optionsPayload.length < 2) {
        alert("Please add at least two options.");
        return;
    }
    const hasCorrect = optionsPayload.some(opt => opt.isCorrect);
    if (!hasCorrect) {
        alert("Please mark at least one option as correct.");
        return;
    }

    // 3. Prepare FormData (Question details)
    formData.append("question_text", questionText);
    formData.append("past_exam_id", examId);
    if (questionImage) {
        formData.append("question_image", questionImage);
    }
    // Append the options payload as a JSON string
    formData.append("options", JSON.stringify(optionsPayload));
    
    // 4. Send Request
    fetch(`/quiz/past_exam/questions/add/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            alert(data.message); 
            location.reload(); 
        } else if (data.error) {
            alert(`Error: ${data.error}`); 
        }
    })
    .catch(err => {
        console.error(err);
        alert("An error occurred while adding the question and options.");
    });
}

/**
 * Updates the question explanation, fetching the HTML content from the Quill editor.
 */
function updateExplanation(pastExamQuestionId) {
    // CRITICAL: Read the HTML content from the hidden input field 
    // which is constantly updated by the Quill editor.
    const explanationText = document.getElementById(`explanation_editor_${pastExamQuestionId}_hidden`).value;
    
    const input = document.getElementById(`exp_input_${pastExamQuestionId}`);
    const image = input.files[0];

    const formData = new FormData();
    // Append the HTML content (which includes MathQuill formulas as HTML elements)
    formData.append("explanation", explanationText); 
    if (image) formData.append("explanation_image", image);

    fetch(`/quiz/past-question/explanation/${pastExamQuestionId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    .then(res => res.json())
    .then(() => alert("Explanation updated successfully!"))
    .catch(err => alert("Error updating explanation"));
}

function bindDragDropAndSelect(dropId, inputId, previewId) {
    const dropArea = document.getElementById(dropId);
    const fileInput = document.getElementById(inputId);
    const previewImage = document.getElementById(previewId);

    if (!dropArea || !fileInput || !previewImage) return;

    dropArea.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.style.backgroundColor = '#e9f2ff'; // Light blue hover effect
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.backgroundColor = ''; // Remove hover effect
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.style.backgroundColor = ''; // Remove hover effect

        const file = e.dataTransfer.files[0];
        fileInput.files = e.dataTransfer.files;
        showPreviewImage(file, previewImage);
    });

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) showPreviewImage(file, previewImage);
    });
}

function showPreviewImage(file, previewImage) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
    };
    reader.readAsDataURL(file);
}

// Update exam details
function updateExamDetails(examId) {
    const title = document.getElementById("exam-title").value;
    const exam_date = document.getElementById("exam-date").value;

    fetch(`/quiz/past-exams/${examId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, exam_date }),
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update exam");
        return res.json();
    })
    .then(data => {
        alert("Exam updated successfully!");
        location.reload();
    })
    .catch(err => {
        console.error(err);
        alert("Failed to update exam.");
    });
}

function deleteQuestionImage(questionId) {
    fetch(`/quiz/questions/${questionId}/delete-image/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
        alert("Image deleted");
        location.reload();
    });
}

function deleteOptionImage(optionId) {
    fetch(`/quiz/options/${optionId}/delete-image/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
        alert("Option image deleted");
        location.reload();
    });
}

function deleteQuestion(questionId) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    fetch(`/quiz/questions/${questionId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
        alert("Question deleted");
        location.reload();
    });
}

function updateQuestion(questionId) {
    const text = document.getElementById(`q_text_${questionId}`).value;
    const input = document.getElementById(`q_input_${questionId}`);
    const image = input.files[0];
    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);

    fetch(`/quiz/questions/${questionId}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    .then(res => {
        if (!res.ok) throw new Error("Update failed");
        alert("Question updated!");
        location.reload();
    })
    .catch(() => alert("Failed to update question"));
}

function updateOption(optionId) {
    const text = document.getElementById(`opt_text_${optionId}`).value;
    const is_correct = document.getElementById(`opt_correct_${optionId}`).checked;
    const imageInput = document.getElementById(`opt_input_${optionId}`);
    const image = imageInput.files[0];

    const formData = new FormData();
    formData.append("text", text);
    formData.append("is_correct", is_correct);
    if (image) formData.append("image", image);

    fetch(`/quiz/options/${optionId}/update/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update option");
        alert("Option updated");
        location.reload();
    })
    .catch(err => {
        console.error(err);
        alert("Error updating option");
    });
}