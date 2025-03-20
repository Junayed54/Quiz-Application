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
    // .then(data => {
    //     console.log(data);
    //     const examsList = document.getElementById('exams-list');
    //     examsList.innerHTML = data.map(exam => `
    //         <div class="col-md-6 mb-4">
    //             <div class="card h-100 shadow-sm">
    //                 <div class="card-body">
    //                     <div class="d-flex justify-content-end">
    //                         <div class="p-1  rounded mt-0" style="background:#A0E418; color:white;">${exam.status}</div>
    //                     </div>
    //                     <h4 class="card-title" style="color: #FFB26F;">${exam.title}</h4>
    //                     <p class="" style="color:#D8D3CD;">${exam.category_name}</p>
    //                     <div class="d-flex my-4" style="gap:5px;">
    //                         <div class="p-2 rounded text-white" style="background-color: #66D2CE;">${exam.total_questions} Ques.</div>
    //                         <div class="p-2 rounded text-white" style="background-color: #66D2CE">${exam.total_mark} Marks</div>
    //                         <div class="p-2 rounded text-white" style="background-color: #66D2CE">${exam.duration} Mins</div>
    //                     </div>
    //                     <h6 class="" style="color: #727D73;">Examiner: <span class="" style="font-weight:bold; color:#D8D3CD;">${exam.creater_name}</span></h6>
    //                     <h6 class="" style="color: #727D73;">Package: <span class="" style="color: #797A7E;">${exam.title}</span></h6>
                        
    //                     <div class="mt-3">
    //                         <h5 style="color: #727D73;">Subjects:</h5>
    //                         <div class="d-flex flex-wrap" style="gap: 5px;">
    //                             ${exam.subjects.map(subject => `
    //                                 <span class="badge text-white" style="background-color: #5C7285; padding: 5px 10px; border-radius: 5px;">
    //                                     ${subject.subject}: <span class="lead" style="color:#D0DDD0;">${subject.question_count}</span>
    //                                 </span>
    //                             `).join('')}
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div class="card-footer text-start d-flex justify-content-between">
    //                     <button class="btn btn-light btn-sm border font-weight-bold" style="font-weight:bold;" onclick="viewExamDetail('${exam.exam_id}')">
    //                         <i class="fa-solid fa-circle-info center" style="font-size:14px"></i>  Details
    //                     </button>
    //                     <button class="btn btn-light btn-sm border font-weight-bold" style="font-weight:bold;"  onclick="shareExam('${exam.title}', '${window.location.origin}/quiz/exam_detail/${exam.exam_id}/')">
    //                         <i class="fa-solid fa-share"></i> Share
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //     `).join('');
    // })
    // .catch(error => console.error('Error:', error));
    .then(data => {
        console.log(data);
        const examsList = document.getElementById('exams-list');
        examsList.innerHTML = ''; // Clear the list before appending new items
    
        data.forEach(exam => {
            const examCard = document.createElement('div');
            examCard.className = 'col-md-6 mb-4';
    
            examCard.innerHTML = `
                <div class="card h-100 shadow-lg border-0 rounded-lg overflow-hidden">
                    <div class="card-body">
                        <!-- Status Badge -->
                        <div class="d-flex justify-content-end">
                            <span class="badge p-2 rounded-pill" style="background: #A0E418; color: white;">${exam.status}</span>
                        </div>
    
                        <!-- Exam Title and Category -->
                        <h4 class="card-title mt-3" style="color: #FFB26F;">${exam.title}</h4>
                        <p class="text-muted">${exam.category_name}</p>
    
                        <!-- Exam Details (Questions, Marks, Duration) -->
                        <div class="d-flex my-4 gap-2">
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${exam.total_questions} Ques.</span>
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${exam.total_mark} Marks</span>
                            <span class="badge p-2 rounded-pill text-white" style="background-color: #66D2CE;">${exam.duration} Mins</span>
                        </div>
    
                        <!-- Examiner and Package -->
                        <h6 class="text-muted">Examiner: <span class="text-dark fw-bold">${exam.creater_name}</span></h6>
                        <h6 class="text-muted">Package: <span class="text-dark">${exam.title}</span></h6>
    
                        <!-- Subjects -->
                        <div class="mt-4">
                            <h5 class="text-muted">Subjects:</h5>
                            <div class="d-flex flex-wrap gap-2">
                                ${exam.subjects.map(subject => `
                                    <span class="badge p-2 rounded-pill text-white" style="background-color: #5C7285;">
                                        ${subject.subject}: <span class="fw-bold" style="color: #D0DDD0;">${subject.question_count}</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
    
                    <!-- Card Footer (Buttons) -->
                    <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                        <button class="btn btn-outline-primary btn-sm d-flex align-items-center" onclick="viewExamDetail('${exam.exam_id}')">
                            <i class="fa-solid fa-circle-info me-2"></i> Details
                        </button>
                        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" onclick="shareExam('${exam.title}', '${window.location.origin}/quiz/exam_detail/${exam.exam_id}/')">
                            <i class="fa-solid fa-share-alt me-2"></i> Share
                        </button>
                    </div>
                </div>
            `;
    
            examsList.appendChild(examCard);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        examsList.innerHTML = '<div class="col-12 text-center text-danger py-4">Failed to load exams. Please try again later.</div>';
    });
});

function viewExamDetail(examId) {
    window.location.href = `/quiz/exam_detail/${examId}/`;
}

function shareExam(title, url) {
    const shareData = {
        title: title,
        text: `Check out this exam: ${title}`,
        url: url
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch(err => console.error('Error sharing:', err));
    } else {
        alert('Sharing is not supported on this device. Copy this link to share: ' + url);
    }
}



document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/past-exams/', {  // Ensure this endpoint matches your Django view
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const examsList = document.getElementById('past-exams-list');
        examsList.innerHTML = ''; // Clear the list before appending new items
    
        data.forEach(exam => {
            const examCard = document.createElement('div');
            examCard.className = 'col-md-6 mb-4';
    
            examCard.innerHTML = `
                <div class="card h-100 shadow-lg border-0 rounded-lg overflow-hidden">
                    <div class="card-header bg-gradient-primary" style="color: #FFB26F;">
                        <h4 class="card-title mb-0">${exam.title}</h4>
                        <small class="text-muted">Conducted on: ${exam.exam_date}</small>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-column gap-2">
                            <p class="mb-1"><i class="fas fa-building me-2"></i>Organization: <strong>${exam.organization_name}</strong></p>
                            ${exam.department_name ? `<p class="mb-1"><i class="fas fa-sitemap me-2"></i>Department: <strong>${exam.department_name}</strong></p>` : ''}
                            <p class="mb-1"><i class="fas fa-briefcase me-2"></i>Position: <strong>${exam.position_name}</strong></p>
                            <p class="mb-0"><i class="fas fa-question-circle me-2"></i>Questions: <strong>${exam.questions_count}</strong></p>
                        </div>
                    </div>
                    <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                        <button class="btn btn-primary btn-sm d-flex align-items-center" onclick="viewPastExamDetail('${exam.id}')">
                            <i class="fas fa-play-circle me-2"></i> Start Exam
                        </button>
                        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center" onclick="shareExam('${exam.title}', '${window.location.origin}/quiz/past_exam_detail/${exam.id}/')">
                            <i class="fas fa-share-alt me-2"></i> Share
                        </button>
                    </div>
                </div>
            `;
    
            examsList.appendChild(examCard);
        });
    })
    // .catch(error => {
    //     console.error('Error fetching past exams:', error);
    //     examsList.innerHTML = '<div class="col-12 text-center text-danger py-4">Failed to load past exams. Please try again later.</div>';
    // });
    .catch(error => console.error('Error:', error));
});

function viewPastExamDetail(examId) {
    window.location.href = `/quiz/past_exam_start/${examId}/`;
}

