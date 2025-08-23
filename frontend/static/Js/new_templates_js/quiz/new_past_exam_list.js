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
        // container.innerHTML += '<h3 class="my-5" style="color: #ff6600;">বহুনির্বাচনি পরীক্ষা</h3>';
        loader.classList.add('d-none');
        if (!data.length) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-4">No exams found.</div>';
            return;
        }

        
        
        container.innerHTML += data.map(exam => `
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
                                ${exam.total_questions} MCQ
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



document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    const exam_type_id = window.location.pathname.split('/')[2];
    // const loader = document.getElementById('loader');

    const fetchExams = () => {
        // Fetch exams from the new API endpoint
        const url = `/api/wr-exams/?exam_type=${exam_type_id}`;
        const options = {};

        // Check if an access token exists and add the Authorization header if it does
        if (accessToken) {
            options.headers = {
                'Authorization': `Bearer ${accessToken}`
            };
        }

        fetch(url, options)
            .then(res => {
                if (!res.ok) {
                    // If the response is not ok, provide more specific error messages
                    if (res.status === 401 || res.status === 403) {
                        throw new Error('Authentication failed or not authorized.');
                    }
                    throw new Error('Network response was not ok.');
                }
                return res.json();
            })
            .then(data => renderExams(data, 'all_wr_exams'))
            .catch(err => console.error('Error loading exams:', err));
    };

    const renderExams = (data, elementId) => {
        // console.log(data);
        const container = document.getElementById(elementId);
        // loader.classList.add('d-none');
        container.innerHTML = ''; // Clear container first

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-4">কোনো পরীক্ষা পাওয়া যায়নি।</div>';
            return;
        }
        // console.log("data", data);
        // Separate and render quizzes and written exams
        // const quizzes = data.filter(exam => exam.exam_mode === 'quiz');
        // const writtenExams = data.filter(exam => exam.exam_mode === 'written_exam');

        // Render quizzes
        // if (quizzes.length > 0) {
        //     console.log("2", data);
        //     container.innerHTML += '<h3 class="mt-4" style="color: #ff6600;">কুইজ পরীক্ষা</h3>';
        //     container.innerHTML += quizzes.map(exam => `
        //         <div class="card my-3">
        //             <div class="card-body d-flex justify-content-between align-items-stretch" style="gap: 1rem;">
        //                 <div style="width: 50%;">
        //                     <h3 class="card-title">${exam.title}</h3>
        //                     <div style="
        //                         display: flex;
        //                         gap: 3px;
        //                         margin-bottom: 2px;
        //                         font-size: clamp(10px, 1.5vw, 14px);
        //                         color: #F97316;
        //                         flex-wrap: wrap;">
        //                         <div class="p-1 rounded" style="background: #FFEDD5;">
        //                             ${exam.total_questions} প্রশ্ন
        //                         </div>
        //                         <div class="p-1 rounded" style="background: #FFEDD5;">
        //                             ${exam.total_questions} নম্বর
        //                         </div>
        //                         <div class="p-1 rounded" style="background: #FFEDD5;">
        //                             ${exam.duration} মিনিট
        //                         </div>
        //                     </div>
        //                     <div class="mt-2">
        //                         <p class="card-text">পদঃ ${exam.position.title}</p>
        //                         <p class="card-text">সংস্থাঃ ${exam.organization.title}</p>
        //                     </div>
        //                 </div>
        //                 <div style="height: 9rem;"><div class="vertical-line"></div></div>
        //                 <div style="display: flex; flex-direction: column; gap:8px; align-items: center; justify-content: center">
        //                     <a href="/past_exam_details/${exam.id}" class="btn btn-primary">ফলাফল দেখুন</a>
        //                     <button class="btn btn-outline-secondary" onclick="shareExam('${exam.title}', '${window.location.origin}/past_exam_details/${exam.id}')">Share</button>
        //                 </div>
        //             </div>
        //         </div>
        //     `).join('');
        // }

        // Render written exams
        if (data.length > 0) {
            console.log(data);
            // container.innerHTML += '<h3 class="mt-5" style="color: #ff6600;">লিখিত পরীক্ষা</h3>';
            container.innerHTML += data.map((exam, index) => `
                <div class="card my-3">
                    <div class="card-body d-flex justify-content-between align-items-stretch" style="gap: 1rem;">
                    
                        <div style="width: 50%;">
                            <h3 class="card-title">${exam.title}</h3>

                                            ${
                            exam.past_exam 
                            ? `
                                <div style="
                                    display: flex;
                                    gap: 3px;
                                    margin-bottom: 2px;
                                    font-size: clamp(10px, 1.5vw, 14px);
                                    color: #F97316;
                                    flex-wrap: wrap;">
                                    
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        ${exam.past_exam.total_questions} MCQ
                                    </div>
                                    
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        ${exam.past_exam.total_questions} নম্বর
                                    </div>
                                    
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        ${exam.past_exam.duration} মিনিট
                                    </div>
                                </div>
                            `
                            : ''
                        }
                            <div style="
                                    display: flex;
                                    gap: 3px;
                                    margin-bottom: 2px;
                                    font-size: clamp(10px, 1.5vw, 14px);
                                    color: #F97316;
                                    flex-wrap: wrap;">
                                    
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        ${exam.written_exams[0].total_questions} Questions
                                    </div>
                                    
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        ${exam.written_exams[0].total_marks} নম্বর
                                    </div>
                                    <!--
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        ${exam.written_exams[0].duration} মিনিট
                                    </div>
                                    -->
                                </div>
                            <div class="mt-2">
                                <p class="card-text">পদঃ ${exam.position.name}</p>
                                <p class="card-text">সংস্থাঃ ${exam.organization.name}</p>
                            </div>
                        </div>
                        <div style="height: 9rem;"><div class="vertical-line"></div></div>
                        <div style="display: flex; flex-direction: column; gap:8px; align-items: center; justify-content: center">
                            <a href="/exams/wr_exams/${exam.id}/" class="btn btn-primary">Details</a>
                            <button class="btn btn-outline-secondary" onclick="shareExam('${exam.title}', '${window.location.origin}/exams/wr_exams/${exam.id}/')">Share</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    };

    // Initial load
    fetchExams();
});

// The viewPastExamDetail and shareExam functions remain unchanged
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