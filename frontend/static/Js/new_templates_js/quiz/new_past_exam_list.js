document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    const exam_type_id = window.location.pathname.split('/')[2];
    const loader = document.getElementById('loader');
    const allExamsContainer = document.getElementById('all_exams');
    const allWrExamsContainer = document.getElementById('all_wr_exams');
    const examTypeTitle = document.getElementById('exam-type-title'); // Assuming a new ID is set for the heading

    // Function to convert Western numerals to Bengali numerals
    const convertToBengaliNumerals = (number) => {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(number).split('').map(digit => bengaliDigits[digit]).join('');
    };

    // New function to fetch exam type name
    const fetchExamTypeName = async () => {
        try {
            const response = await fetch(`/quiz/exam-types/${exam_type_id}/`);
            if (!response.ok) {
                throw new Error('Exam type not found.');
            }
            const examType = await response.json();
            if (examType && examType.name) {
                examTypeTitle.textContent = examType.name;
            } else {
                examTypeTitle.textContent = 'পূর্ববর্তী পরীক্ষাগুলো';
            }
        } catch (error) {
            console.error('Error fetching exam type name:', error);
            examTypeTitle.textContent = 'পূর্ববর্তী পরীক্ষাগুলো';
        }
    };

    const fetchAllExams = () => {
        const pastExamsPromise = fetch(`/quiz/exam-type/past-exams/?exam_type=${exam_type_id}`)
            .then(res => res.json())
            .catch(err => {
                console.error('Error loading past exams:', err);
                return []; 
            });

        const writtenExamsPromise = fetch(`/api/wr-exams/?exam_type=${exam_type_id}`)
            .then(res => res.json())
            .catch(err => {
                console.error('Error loading written exams:', err);
                return []; 
            });

        Promise.all([pastExamsPromise, writtenExamsPromise])
            .then(([pastExams, writtenExams]) => {
                loader.classList.add('d-none');
                
                if (pastExams.length === 0 && writtenExams.length === 0) {
                    allExamsContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">কোনো পরীক্ষা পাওয়া যায়নি।</div>';
                    allWrExamsContainer.innerHTML = '';
                } else {
                    renderExams(pastExams, writtenExams);
                }
            });
    };

    const renderExams = (pastExams, writtenExams) => {
        const pastExamsContainer = document.getElementById('all_exams');
        const writtenExamsContainer = document.getElementById('all_wr_exams');
        
        // Render Past Exams (MCQ)
        if (pastExams.length > 0) {
            console.log(pastExams);
            pastExamsContainer.innerHTML = pastExams.map(exam => {
                const totalQuestionsBn = convertToBengaliNumerals(exam.total_questions);
                const durationBn = convertToBengaliNumerals(exam.duration);
                return `
                    <div class="card my-3">
                        <div class="card-body d-flex justify-content-between align-items-stretch" style="gap: 1rem;">
                            <div style="width: 50%;">
                                <h3 class="card-title">${exam.title}</h3>
                                <div style="display: flex; gap: 3px; margin-bottom: 2px; font-size: clamp(10px, 1.5vw, 14px); color: #F97316; flex-wrap: wrap;">
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        বহুনির্বাচনি: ${totalQuestionsBn}
                                    </div>
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        নম্বর: ${totalQuestionsBn}
                                    </div>
                                    <div class="p-1 rounded" style="background: #FFEDD5;">
                                        সময়: ${durationBn} মিনিট
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <p class="card-text">পদঃ ${exam.position}</p>
                                    <p class="card-text">সংস্থাঃ ${exam.organization}</p>
                                </div>
                            </div>
                            <div style="height: 9rem;"><div class="vertical-line"></div></div>
                            <div style="display: flex; flex-direction: column; gap:8px; align-items: center; justify-content: center">
                                <a href="/past_exam_details/${exam.id}" class="btn btn-primary">বিস্তারিত</a>
                                <button class="btn btn-outline-secondary" onclick="shareExam('${exam.title}', '${window.location.origin}/past_exam_details/${exam.id}')">শেয়ার</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render Written Exams
        if (writtenExams.length > 0) {
            writtenExamsContainer.innerHTML = writtenExams.map(exam => {
                let mcqSection = '';
                let writtenSection = '';

                if (exam.past_exam) {
                    const totalQuestionsBn = convertToBengaliNumerals(exam.past_exam.total_questions);
                    const durationBn = convertToBengaliNumerals(exam.past_exam.duration);
                    mcqSection = `
                        <div style="display: flex; gap: 3px; font-size: clamp(10px, 1.5vw, 14px); color: #F97316; flex-wrap: wrap;">
                            <div class="p-1 rounded" style="background: #FFEDD5;">
                                বহুনির্বাচনি: ${totalQuestionsBn}
                            </div>
                            <div class="p-1 rounded" style="background: #FFEDD5;">
                                নম্বর: ${totalQuestionsBn}
                            </div>
                            <div class="p-1 rounded" style="background: #FFEDD5;">
                                সময়: ${durationBn} মিনিট
                            </div>
                        </div>
                    `;
                }

                if (exam.written_exams && exam.written_exams.length > 0) {
                    const totalQuestionsBn = convertToBengaliNumerals(exam.written_exams[0].total_questions);
                    const totalMarksBn = convertToBengaliNumerals(exam.written_exams[0].total_marks);
                    writtenSection = `
                        <div class="mt-2">
                            <div style="display: flex; gap: 3px; font-size: clamp(10px, 1.5vw, 14px); color: #F97316; flex-wrap: wrap;">
                                <div class="p-1 rounded" style="background: #FFEDD5;">
                                    লিখিত প্রশ্ন: ${totalQuestionsBn}
                                </div>
                                <div class="p-1 rounded" style="background: #FFEDD5;">
                                    নম্বর: ${totalMarksBn}
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                return `
                    <div class="card my-3">
                        <div class="card-body d-flex justify-content-between align-items-stretch" style="gap: 1rem;">
                            <div style="width: 50%;">
                                <h3 class="card-title">${exam.title}</h3>
                                ${mcqSection}
                                ${writtenSection}
                                <div class="mt-2">
                                    <p class="card-text">পদঃ ${exam.position.name}</p>
                                    <p class="card-text">সংস্থাঃ ${exam.organization.name}</p>
                                </div>
                            </div>
                            <div style="height: 9rem;"><div class="vertical-line"></div></div>
                            <div style="display: flex; flex-direction: column; gap:8px; align-items: center; justify-content: center">
                                <a href="/exams/wr_exams/${exam.id}/" class="btn btn-primary">বিস্তারিত</a>
                                <button class="btn btn-outline-secondary" onclick="shareExam('${exam.title}', '${window.location.origin}/exams/wr_exams/${exam.id}/')">শেয়ার</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };

    fetchExamTypeName(); // Call this function to fetch and set the title
    fetchAllExams();
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