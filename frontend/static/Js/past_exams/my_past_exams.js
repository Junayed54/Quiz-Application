document.addEventListener("DOMContentLoaded", function () {
    const examContainer = document.getElementById("exam-container");
    const noExams = document.getElementById("no-exams");

    const token = localStorage.getItem("access_token");

    if (!token) {
        noExams.textContent = "You're not logged in.";
        noExams.style.display = "block";
        return;
    }

    fetch("/quiz/user-past-exams/", {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch exams.");
            return response.json();
        })
        .then((data) => {
            if (data.length === 0) {
                noExams.style.display = "block";
                return;
            }

            data.forEach((exam) => {
                const card = document.createElement("div");
                card.className = "col";

                card.innerHTML = `
                <div class="card shadow-sm h-100" id="exam-${exam.id}">
                    <div class="card-body">
                        <h5 class="card-title">${exam.title}</h5>
                        <p class="card-text">
                            <strong>Organization:</strong> ${exam.organization_name}<br>
                            ${exam.department_name ? `<strong>Department:</strong> ${exam.department_name}<br>` : ""}
                            <strong>Position:</strong> ${exam.position_name}<br>
                            <strong>Date:</strong> ${exam.exam_date}<br>
                            <strong>Duration:</strong> ${exam.duration || "N/A"} mins<br>
                            <strong>Pass Mark:</strong> ${exam.pass_mark}%<br>
                            <strong>Negative Mark:</strong> ${exam.negative_mark}
                        </p>
                        <span class="badge bg-${exam.is_published ? "success" : "danger"}">
                            ${exam.is_published ? "Published" : "Unpublished"}
                        </span>
                        <div class="mt-3 d-flex gap-2">
                            <button class="btn btn-primary" onclick="window.location.href = '/quiz/past_exam_update/${exam.id}/'">Update Exam</button>
                            <button class="btn btn-danger" onclick="deleteExam(${exam.id})">Delete Exam</button>
                        </div>
                    </div>
                </div>
            `;

                examContainer.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error fetching exams:", error);
            noExams.textContent = "Unable to load exams. Please try again.";
            noExams.style.display = "block";
        });
});

// 🔴 Delete function using Fetch API
function deleteExam(examId) {
    const token = localStorage.getItem("access_token");
    if (!confirm("Are you sure you want to delete this exam?")) return;

    fetch(`/quiz/past-exam/${examId}/delete/`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            if (response.status === 204) {
                // Remove the exam card from DOM
                const examCard = document.getElementById(`exam-${examId}`);
                if (examCard) examCard.remove();
            } else {
                return response.json().then(err => {
                    throw new Error(err.detail || "Failed to delete exam.");
                });
            }
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}
