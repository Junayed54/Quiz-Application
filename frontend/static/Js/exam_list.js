document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/exams/exam_list', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const examsList = document.getElementById('exams-list');
        examsList.innerHTML = data.map(exam => `
            <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-end">
                            <div class="p-1 bg-secondary rounded mt-0 text-white">${exam.status}</div>
                        </div>
                        <h5 class="card-title" style="color:#5ca904;">${exam.title}</h5>
                        <p class="text-muted">${exam.category_name}</p>
                        <div class="d-flex my-4" style="gap:5px;">
                            <div class="p-2 rounded text-white" style="background-color: #808080">${exam.total_questions} Ques.</div>
                            <div class="p-2 rounded text-white" style="background-color: #808080">${exam.total_mark} Marks</div>
                            <div class="p-2 rounded text-white" style="background-color: #808080">${exam.duration} Mins</div>
                        </div>
                        <h6 class="text-muted">Examiner: <span class="text-secondary" style="font-weight:bold;">${exam.creater_name}</span></h6>
                        <h6 class="text-muted">Package: <span class="text-info">${exam.title}</span></h6>
                        
                        <div class="mt-3">
                            <h5>Subjects:</h5>
                            <div class="d-flex flex-wrap" style="gap: 5px;">
                                ${exam.subjects.map(subject => `
                                    <span class="badge text-white" style="background-color: #5ca904; padding: 5px 10px; border-radius: 5px;">
                                        ${subject.subject}: ${subject.question_count}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-start">
                        <button class="btn btn-primary" onclick="viewExamDetail('${exam.exam_id}')">View Details</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        
    })
    .catch(error => console.error('Error:', error));
});

function viewExamDetail(examId) {
    window.location.href = `/quiz/exam_detail/${examId}/`;
}
