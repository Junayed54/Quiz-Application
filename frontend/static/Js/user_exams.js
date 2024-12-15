document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/user_exams_list/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        const examsContainer = document.getElementById('exams-container');
        // Assuming `data` is the array of exam objects fetched from an API or backend
        // Dynamically load exams with fade-in animation
        data.forEach((exam, index) => {
            const examElement = document.createElement('div');
            examElement.classList.add(
                'bg-white', 
                'rounded-lg', 
                'shadow-lg', 
                'p-6', 
                'transition', 
                'transform', 
                'hover:scale-105', 
                'hover:shadow-2xl', 
                'hover:bg-gray-50', 
                'opacity-0', 
                'translate-y-6'
            );
            examElement.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s`;
        
            examElement.innerHTML = `
                <h5 class="text-lg font-semibold text-gray-800 mb-2">${exam.title}</h5>
                <p class="text-sm text-gray-600"><strong>Total Questions:</strong> ${exam.total_questions}</p>
                <p class="text-sm text-gray-600"><strong>Total Marks:</strong> ${exam.total_marks}</p>
                <p class="text-sm text-gray-600 mb-4"><strong>Last Date:</strong> ${exam.last_date}</p>
                <div class="flex gap-4">
                    <!-- View Exam Button -->
                    <a href="/quiz/teacher_exam_details/${exam.exam_id}/" class="btn btn-sm bg-blue-500 text-white rounded-full py-2 px-4 hover:bg-blue-600 transition">Details</a>
                    <!-- Delete Exam Button -->
                    <button class="btn btn-sm bg-red-500 text-white rounded-full py-2 px-4 hover:bg-red-600 transition" data-exam-id="${exam.exam_id}">Delete</button>
                </div>
            `;
        
            // Add exam element to the container with animation
            setTimeout(() => {
                examElement.classList.remove('opacity-0', 'translate-y-6');
                examElement.classList.add('opacity-100', 'translate-y-0');
            }, 50);
        
            examsContainer.appendChild(examElement);
        });
        
        



        // Attach event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const examId = this.getAttribute('data-exam-id');
                if (confirm('Are you sure you want to delete this exam?')) {
                    fetch(`/quiz/exams/${examId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Exam deleted successfully.');
                            window.location.reload();
                        } else {
                            response.json().then(data => {
                                alert('Error deleting exam: ' + data.error);
                            });
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        });
    })
    .catch(error => console.error('Error:', error));
});
