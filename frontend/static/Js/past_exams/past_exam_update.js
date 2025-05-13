// const token = localStorage.getItem("access_token");
// const urlPath = window.location.pathname;
// const examId = urlPath.split("/")[3];

// document.addEventListener("DOMContentLoaded", () => {
//     fetch(`/quiz/past-exams/${examId}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//     })
//     .then(res => res.json())
//     .then(exam => renderExamDetails(exam));
// });

// function renderExamDetails(exam) {
//     const container = document.getElementById("exam-detail");
//     container.innerHTML = `
//         <div class="p-5 bg-white rounded-lg shadow-md">
//             <h2 class="text-2xl font-semibold mb-4">${exam.title}</h2>
//             <form id="exam-details-form" class="mb-6">
//                 <div class="mb-4">
//                     <label for="exam-title" class="block font-medium mb-1">Title</label>
//                     <input type="text" id="exam-title" class="input input-bordered w-full" value="${exam.title}" />
//                 </div>
//                 <div class="mb-4">
//                     <label for="exam-date" class="block font-medium mb-1">Exam Date</label>
//                     <input type="date" id="exam-date" class="input input-bordered w-full" value="${exam.exam_date}" />
//                 </div>
//                 <button type="button" onclick="updateExamDetails(${exam.id})" class="btn btn-success">Save Exam</button>
//             </form>
//         </div>
//     `;

//     exam.questions.forEach((q, index) => {
//         const qDiv = document.createElement("div");
//         qDiv.className = "bg-gray-50 p-5 my-6 rounded-lg border";

//         qDiv.innerHTML = `
//             <h4 class="text-lg font-semibold mb-2">Q${index + 1}</h4>
//             ${q.question.image ? `
//                 <img src="${q.question.image}" class="w-64 mb-2 rounded" />
//                 <button class="btn btn-sm btn-outline btn-error mb-3" onclick="deleteQuestionImage(${q.question.id})">Delete Question Image</button>
//             ` : ""}

//             <textarea id="q_text_${q.question.id}" class="textarea textarea-bordered w-full mb-3">${q.question.text || ""}</textarea>

//             <div class="drop-area border-dashed border-2 border-gray-300 p-3 text-center rounded mb-4" id="q_drop_${q.id}">
//                 Drag & Drop or Click to Upload Question Image
//                 <input type="file" accept="image/*" class="hidden" id="q_input_${q.id}" />
//                 <img id="q_preview_${q.id}" class="w-32 mx-auto mt-2 rounded" style="display:none;" />
//             </div>

//             <div class="mb-3 flex gap-2">
//                 <button class="btn btn-sm btn-primary" onclick="updateQuestion(${q.question.id})">Update Question</button>
//                 <button class="btn btn-sm btn-error" onclick="deleteQuestion(${q.question.id})">Delete Question</button>
//             </div>
//             <div class="border-t pt-3 mt-3 space-y-3">
//                 ${q.options.map(opt => `
//                     <div class="bg-white border rounded p-3">
//                         ${opt.image ? `
//                             <img src="${opt.image}" class="w-32 mb-2 rounded" />
//                             <button class="btn btn-xs btn-outline btn-error mb-2" onclick="deleteOptionImage(${opt.id})">Delete Option Image</button>
//                         ` : ""}
//                         <input type="text" id="opt_text_${opt.id}" class="input input-bordered w-full mb-2" value="${opt.text || ""}" />

//                         <div class="drop-area border-dashed border-2 border-gray-300 p-2 text-center rounded mb-2" id="opt_drop_${opt.id}">
//                             Drag & Drop or Click to Upload Option Image
//                             <input type="file" accept="image/*" class="hidden" id="opt_input_${opt.id}" />
//                             <img id="opt_preview_${opt.id}" class="w-24 mx-auto mt-1 rounded" style="display:none;" />
//                         </div>

//                         <div class="flex items-center gap-2">
//                             <label class="flex items-center">
//                                 <input type="checkbox" id="opt_correct_${opt.id}" ${opt.is_correct ? "checked" : ""} class="checkbox mr-2" />
//                                 Correct
//                             </label>
//                             <button class="btn btn-sm btn-success ml-auto" onclick="updateOption(${opt.id})">Update Option</button>
//                         </div>
//                     </div>
//                 `).join("")}
//             </div>
//         `;

//         container.appendChild(qDiv);

//         bindDragDropAndSelect(`q_drop_${q.id}`, `q_input_${q.id}`, `q_preview_${q.id}`);
//         q.options.forEach(opt => {
//             bindDragDropAndSelect(`opt_drop_${opt.id}`, `opt_input_${opt.id}`, `opt_preview_${opt.id}`);
//         });
//     });
// }

// function bindDragDropAndSelect(dropId, inputId, previewId) {
//     const dropArea = document.getElementById(dropId);
//     const input = document.getElementById(inputId);
//     const preview = document.getElementById(previewId);

//     dropArea.addEventListener("click", () => input.click());
//     dropArea.addEventListener("dragover", (e) => {
//         e.preventDefault();
//         dropArea.classList.add("bg-gray-200");
//     });
//     dropArea.addEventListener("dragleave", () => {
//         dropArea.classList.remove("bg-gray-200");
//     });
//     dropArea.addEventListener("drop", (e) => {
//         e.preventDefault();
//         dropArea.classList.remove("bg-gray-200");
//         const file = e.dataTransfer.files[0];
//         if (file && file.type.startsWith("image/")) {
//             input.files = createFileList(file);
//             preview.src = URL.createObjectURL(file);
//             preview.style.display = "block";
//         }
//     });

//     input.addEventListener("change", () => {
//         const file = input.files[0];
//         if (file && file.type.startsWith("image/")) {
//             const reader = new FileReader();
//             reader.onload = () => {
//                 preview.src = reader.result;
//                 preview.style.display = "block";
//             };
//             reader.readAsDataURL(file);
//         }
//     });
// }

// function createFileList(file) {
//     const dataTransfer = new DataTransfer();
//     dataTransfer.items.add(file);
//     return dataTransfer.files;
// }

// function updateExamDetails(examId) {
//     const title = document.getElementById("exam-title").value;
//     const date = document.getElementById("exam-date").value;
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("exam_date", date);

//     fetch(`/quiz/past-exams/${examId}/`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//     })
//     .then(res => res.json())
//     .then(() => {
//         alert("✅ Exam details updated successfully!");
//         // location.reload();
//     });
// }

// function updateQuestion(questionId) {
//     console.log(questionId)
//     const text = document.getElementById(`q_text_${questionId}`).value.trim();
    
//     const imgInput = document.getElementById(`q_input_${questionId}`);
//     const formData = new FormData();

//     if (!text && !imgInput) {
//         alert("❌ At least one of text or image input is required.");
//     } else {
//         console.log("✅ Valid input: at least one of text or image is present.");
//     }
    
    

//     if (text) {
//         formData.append("text", text);
//         formData.append("image", ""); // clear image
//     } else if (imgInput.files.length > 0) {
//         formData.append("image", imgInput.files[0]);
//         formData.append("text", ""); // clear text
//     } else {
//         alert("⚠️ Please provide either text or image.");
//         return;
//     }

//     fetch(`/quiz/questions/${questionId}/update/`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//     })
//     .then(res => res.json())
//     .then(() => {
//         alert("✅ Question updated successfully!");
//     })
//     .catch(err => {
//         console.error(err);
//         alert("❌ Failed to update question.");
//     });
// }

// function updateOption(optionId) {
//     const text = document.getElementById(`opt_text_${optionId}`).value.trim();
//     const imgInput = document.getElementById(`opt_input_${optionId}`);
//     const isCorrect = document.getElementById(`opt_correct_${optionId}`).checked;
//     const formData = new FormData();

//     if (text && imgInput.files.length > 0) {
//         alert("⚠️ Please provide either text or image, not both.");
//         return;
//     }

//     if (text) {
//         formData.append("text", text);
//         formData.append("image", "");
//     } else if (imgInput.files.length > 0) {
//         formData.append("image", imgInput.files[0]);
//         formData.append("text", "");
//     } else {
//         alert("⚠️ Please provide either text or image.");
//         return;
//     }

//     formData.append("is_correct", isCorrect);

//     fetch(`/quiz/options/${optionId}/update/`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//     })
//     .then(res => res.json())
//     .then(() => {
//         alert("✅ Option updated successfully!");
//     })
//     .catch(err => {
//         console.error(err);
//         alert("❌ Failed to update option.");
//     });
// }


// function deleteQuestion(questionId) {
//     if (!confirm("Are you sure you want to delete this question?")) return;

//     fetch(`/quiz/api/questions/${questionId}/`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//     })
//     .then(res => {
//         if (res.status === 204) {
//             alert("🗑️ Question deleted successfully!");
//             // location.reload();
//         }
//     });
// }

// function deleteQuestionImage(questionId) {
//     const formData = new FormData();
//     formData.append("image", "");

//     fetch(`/quiz/questions/${questionId}/`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//     })
//     .then(res => res.json())
//     .then(() => {
//         alert("🖼️ Question image deleted!");
//         // location.reload();
//     });
// }

// function deleteOptionImage(optionId) {
//     const formData = new FormData();
//     formData.append("image", "");

//     fetch(`/quiz/options/${optionId}/`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//     })
//     .then(res => res.json())
//     .then(() => {
//         alert("🖼️ Option image deleted!");
//         // location.reload();
//     });
// }




const token = localStorage.getItem("access_token");
const urlPath = window.location.pathname;
const examId = urlPath.split("/")[3];
console.log(examId);
document.addEventListener("DOMContentLoaded", () => {
    fetch(`/quiz/past-exams/${examId}/`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(exam => renderExamDetails(exam));
});

function renderExamDetails(exam) {
    const container = document.getElementById("exam-detail");
    container.innerHTML = `
        <div class="p-5 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">${exam.title}</h2>
            <form id="exam-details-form" class="mb-6">
                <div class="mb-4">
                    <label for="exam-title" class="block font-medium mb-1">Title</label>
                    <input type="text" id="exam-title" class="input input-bordered w-full" value="${exam.title}" />
                </div>
                <div class="mb-4">
                    <label for="exam-date" class="block font-medium mb-1">Exam Date</label>
                    <input type="date" id="exam-date" class="input input-bordered w-full" value="${exam.exam_date}" />
                </div>
                <button type="button" onclick="updateExamDetails(${exam.id})" class="btn btn-success">Save Exam Details</button>
            </form>
            <button type="button" id="add-question-btn" class="btn btn-primary mb-4">Add Question</button>
            <div id="add-question-form" class="p-4 bg-gray-100 rounded-lg mb-4" style="display: none;">
                <h3 class="text-xl font-semibold mb-2">New Question</h3>
                <div class="mb-2">
                    <label class="block font-medium mb-1">Question Text</label>
                    <textarea id="new-question-text" class="textarea textarea-bordered w-full"></textarea>
                </div>
                <div class="mb-2">
                    <label class="block font-medium mb-1">Question Image</label>
                    <input type="file" id="new-question-image" accept="image/*" />
                </div>
                <div id="options-container" class="mb-2">
                    <h4 class="text-lg font-semibold mb-1">Options</h4>
                    <!-- Options will be appended here -->
                </div>
                <button type="button" id="add-option-btn" class="btn btn-secondary mb-2">Add Option</button>
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

    // Render existing questions
    exam.questions.forEach((q, index) => {
        const qDiv = document.createElement("div");
        qDiv.className = "bg-gray-50 p-5 my-6 rounded-lg border";

        qDiv.innerHTML = `
            <h4 class="text-lg font-semibold mb-2">Q${index + 1}</h4>
            ${q.question.image ? `
                <img src="${q.question.image}" class="w-64 mb-2 rounded" />
                <button class="btn btn-sm btn-outline btn-error mb-3" onclick="deleteQuestionImage(${q.question.id})">Delete Question Image</button>
            ` : ""}

            <textarea id="q_text_${q.question.id}" class="textarea textarea-bordered w-full mb-3">${q.question.text || ""}</textarea>

            <div class="drop-area border-dashed border-2 border-gray-300 p-3 text-center rounded mb-4" id="q_drop_${q.id}">
                Drag & Drop or Click to Upload Question Image
                <input type="file" accept="image/*" class="hidden" id="q_input_${q.id}" />
                <img id="q_preview_${q.id}" class="w-32 mx-auto mt-2 rounded" style="display:none;" />
            </div>

            <div class="mb-3 flex gap-2">
                <button class="btn btn-sm btn-primary" onclick="updateQuestion(${q.question.id})">Update Question</button>
                <button class="btn btn-sm btn-error" onclick="deleteQuestion(${q.question.id})">Delete Question</button>
            </div>
            <div class="border-t pt-3 mt-3 space-y-3">
                ${q.options.map(opt => `
                    <div class="bg-white border rounded p-3">
                        ${opt.image ? `
                            <img src="${opt.image}" class="w-32 mb-2 rounded" />
                            <button class="btn btn-xs btn-outline btn-error mb-2" onclick="deleteOptionImage(${opt.id})">Delete Option Image</button>
                        ` : ""}
                        <input type="text" id="opt_text_${opt.id}" class="input input-bordered w-full mb-2" value="${opt.text || ""}" />

                        <div class="drop-area border-dashed border-2 border-gray-300 p-2 text-center rounded mb-2" id="opt_drop_${opt.id}">
                            Drag & Drop or Click to Upload Option Image
                            <input type="file" accept="image/*" class="hidden" id="opt_input_${opt.id}" />
                            <img id="opt_preview_${opt.id}" class="w-24 mx-auto mt-1 rounded" style="display:none;" />
                        </div>

                        <div class="flex items-center gap-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="opt_correct_${opt.id}" ${opt.is_correct ? "checked" : ""} class="checkbox mr-2" />
                                Correct
                            </label>
                            <button class="btn btn-sm btn-success ml-auto" onclick="updateOption(${opt.id})">Update Option</button>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(qDiv);

        bindDragDropAndSelect(`q_drop_${q.id}`, `q_input_${q.id}`, `q_preview_${q.id}`);
        q.options.forEach(opt => {
            bindDragDropAndSelect(`opt_drop_${opt.id}`, `opt_input_${opt.id}`, `opt_preview_${opt.id}`);
        });
    });
}

function addOptionField() {
    const optionsContainer = document.getElementById("options-container");
    const optionIndex = optionsContainer.querySelectorAll(".option-item").length;
    const optionDiv = document.createElement("div");
    optionDiv.className = "option-item mb-2";
    optionDiv.innerHTML = `
        <input type="text" class="input input-bordered w-full mb-1 option-text" placeholder="Option text" />
        <input type="file" class="option-image mb-1" accept="image/*" />
        <label class="flex items-center">
            <input type="checkbox" class="option-correct mr-2" />
            Correct
        </label>
        <hr class="my-2" />
    `;
    optionsContainer.appendChild(optionDiv);
}

function submitNewQuestion() {
    const questionText = document.getElementById("new-question-text").value.trim();
    const questionImageInput = document.getElementById("new-question-image");
    const questionImage = questionImageInput.files[0];
    const optionItems = document.querySelectorAll(".option-item");
    const options = [];

    optionItems.forEach((item, index) => {
        const text = item.querySelector(".option-text").value.trim();
        const imageInput = item.querySelector(".option-image");
        const image = imageInput.files[0];
        const isCorrect = item.querySelector(".option-correct").checked;

        options.push({ text, image, isCorrect, image_key: `option_image_${index}` }); // Assign a unique key for each image
    });

    // Validation (same as before)
    if (!questionText && !questionImage) {
        alert("Please provide question text or image.");
        return;
    }

    if (options.length < 2) {
        alert("Please add at least two options.");
        return;
    }

    const hasCorrect = options.some(opt => opt.isCorrect);
    if (!hasCorrect) {
        alert("Please mark at least one option as correct.");
        return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("question_text", questionText);
    formData.append("past_exam_id", examId);
    if (questionImage) {
        formData.append("question_image", questionImage);
    }
    formData.append("options", JSON.stringify(options));
    

    fetch(`/quiz/past_exam/questions/add/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            alert(data.message); // Or handle success message
            // Optionally, refresh the exam details
            // location.reload();
        } else if (data.error) {
            alert(`Error: ${data.error}`); // Handle error message
        }
    })
    .catch(err => {
        console.error(err);
        alert("An error occurred while adding the question and options.");
    });
}

function bindDragDropAndSelect(dropId, inputId, previewId) {
    const dropArea = document.getElementById(dropId);
    const fileInput = document.getElementById(inputId);
    const previewImage = document.getElementById(previewId);

    dropArea.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("bg-blue-100");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("bg-blue-100");
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("bg-blue-100");

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

// Placeholder functions for image/option updates
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

