document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    
    const urlParams = new URLSearchParams(window.location.search);

    const exam_type_id =  window.location.pathname.split('/')[2];
    console.log(exam_type_id);
    const loader = document.getElementById('loader');

    // Fetch both current and past exams
    const fetchExams = () => {
        
        // Fetch past exams
        fetch(`/quiz/exam-type/past-exams/?exam_type=${exam_type_id}`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => renderExams(data, 'all_exams', true))
        .catch(err => console.error('Error loading past exams:', err));

    };

    const renderExams = (data, elementId, isPast) => {
        const container = document.getElementById(elementId);
        loader.classList.add('d-none');
        if (!data.length) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-4">No exams found.</div>';
            return;
        }

        
        
        container.innerHTML = data.map(exam => `
            <div class="card">
                <div class="card-body d-flex justify-content-between align-items-stretch" style="gap: 1rem;">
                    <div style="width: 50%;">
                        <h3 class="card-title">${exam.title}</h3>
                        <div style="
    display: flex;
    gap: 3px;
    margin-bottom: 2px;
    font-size: clamp(10px, 1.5vw, 14px);
    color: #F97316;
    flex-wrap: wrap;">
    
    <div class="p-1 rounded" style="background: #FFEDD5;">
        ${exam.total_questions} প্রশ্ন
    </div>
    
    <div class="p-1 rounded" style="background: #FFEDD5;">
        ${exam.total_questions} নম্বর
    </div>
    
    <div class="p-1 rounded" style="background: #FFEDD5;">
        ${exam.duration} মিনিট
    </div>
</div>

                        <div class="mt-2">
                            <p class="card-text">পদঃ ${exam.position}</p>
                            <p class="card-text">সংস্থাঃ ${exam.organization}</p>
                        </div>
                    </div>
                    <div style="height: 9rem;"><div class="vertical-line"></div></div>
                    
                    <div style="display: flex; flex-direction: column; gap:8px; align-items: center; justify-content: center">
                        <a href="/past_exam_details/${exam.id}" class="btn btn-primary">Details</a>
                        <button class="btn btn-outline-secondary" onclick="shareExam('${exam.title}', '${window.location.origin}/past_exam_details/${exam.id}')">Share</button>
                    </div>
                    
                </div>
            </div>
        `).join('');
    };

    // Initial load
    fetchExams();
});



function viewPastExamDetail(examId) {
    window.location.href = `/quiz/past_exam_details/${examId}`;
}

function shareExam(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this exam: ${title}`,
            url: url
        }).catch(err => {
            console.error('Error sharing:', err);
        });
    } else {
        // Fallback: Copy to clipboard and show toast
        navigator.clipboard.writeText(url).then(() => {
            const toast = document.createElement('div');
            toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
            toast.role = 'alert';
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        Link to "${title}" copied to clipboard!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            document.body.appendChild(toast);
            new bootstrap.Toast(toast).show();
        });
    }
}

