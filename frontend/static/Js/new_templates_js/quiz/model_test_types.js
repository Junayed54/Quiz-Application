document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("examTypeContainer");

    fetch("/quiz/model/exam-types/")  // Update this if your API URL is different
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch exam types");
            }
            return response.json();
        })
        .then(data => {
            data.forEach(examType => {
                const button = document.createElement("button");
                button.className = "university-link";
                button.setAttribute("data-id", examType.id);
                button.innerHTML = `
                    <div class="university-card">
                        <h6>${examType.name}</h6>
                    </div>
                `;

                // Click handler to redirect with query param
                button.addEventListener("click", function () {
                    const typeId = this.getAttribute("data-id");
                    window.location.href = `/model-tests/${typeId}/`;
                });

                container.appendChild(button);
            });
        })
        .catch(error => {
            console.error("Error fetching exam types:", error);
            container.innerHTML = "<p>Could not load exam types.</p>";
        });
});
