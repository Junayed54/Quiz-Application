// document.addEventListener('DOMContentLoaded', function() {
//     const examCardsContainer = document.getElementById('examCardsContainer');

//     const token = localStorage.getItem('access_token');  // Get token from localStorage
//      const examTypeId = window.location.pathname.split('/')[2];
//      console.log(examTypeId);
//     fetch(`/quiz/model-exams/?exam_type=${examTypeId}`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
            
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok.');
//         }
//         return response.json();
//     })
//     .then(examData => {
//         console.log(examData);
//         examData.forEach(exam => {
//             const colDiv = document.createElement('div');
//             colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'exam-card-container');

//             const cardDiv = document.createElement('div');
//             cardDiv.classList.add('card', 'h-100', 'shadow-sm');

//             const cardBody = document.createElement('div');
//             cardBody.classList.add('card-body');

//             const typeDiv = document.createElement('div');
//             typeDiv.classList.add('p-2', 'mb-3', 'rounded', 'fw-bold');
//             typeDiv.style.backgroundColor = '#e0ffe0';
//             typeDiv.style.color = '#336633';
//             typeDiv.textContent = exam.exam_type_name || 'পরীক্ষা';

//             const titleH5 = document.createElement('h5');
//             titleH5.classList.add('card-title', 'mb-2');
//             titleH5.textContent = exam.title || 'শিরোনাম নেই';

//             const detailsP = document.createElement('p');
//             detailsP.classList.add('card-text', 'text-muted', 'small');
//             detailsP.textContent = `${exam.total_mark || 0} নম্বর • ${exam.total_questions || 0} প্রশ্ন • ${exam.duration || 0} মিনিট`;

//             const categoryP = document.createElement('p');
//             categoryP.classList.add('card-text', 'mb-1');
//             categoryP.innerHTML = `<strong>পদ:</strong> ${exam.position_name || 'উল্লেখ নেই'}`;

//             const sourceP = document.createElement('p');
//             sourceP.classList.add('card-text', 'mb-3');
//             sourceP.innerHTML = `<strong>সংস্থা:</strong> ${exam.organization_name || 'উল্লেখ নেই'}`;

//             const buttonDiv = document.createElement('div');
//             buttonDiv.classList.add('d-flex', 'justify-content-start', 'gap-2');

//             const detailsButton = document.createElement('a');
//             detailsButton.href = `/model-tests/${exam.exam_id}/`;  // change if needed
//             detailsButton.classList.add('btn', 'btn-success', 'btn-sm');
//             detailsButton.textContent = 'বিস্তারিত';

//             const shareButton = document.createElement('a');
//             shareButton.href = '#';
//             shareButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
//             shareButton.textContent = 'শেয়ার';
//             const shareUrl = `${window.location.origin}/model-tests/${exam.exam_id}/`;
//             shareButton.addEventListener('click', async () => {
//                 if (navigator.share) {
//                     try {
//                         await navigator.share({
//                             title: exam.title || 'পরীক্ষা',
//                             text: 'এই পরীক্ষাটি দেখুন:',
//                             url: shareUrl,
//                         });
//                     } catch (err) {
//                         console.error('Sharing failed:', err);
//                     }
//                 } else {
//                     // Fallback: copy to clipboard
//                     try {
//                         await navigator.clipboard.writeText(shareUrl);
//                         alert('লিংক কপি হয়েছে!');
//                     } catch (err) {
//                         alert('শেয়ার করতে ব্যর্থ হয়েছে।');
//                     }
//                 }
//             });

            

//             buttonDiv.appendChild(detailsButton);
//             buttonDiv.appendChild(shareButton);

//             cardBody.appendChild(typeDiv);
//             cardBody.appendChild(titleH5);
//             cardBody.appendChild(detailsP);
//             cardBody.appendChild(categoryP);
//             cardBody.appendChild(sourceP);
//             cardBody.appendChild(buttonDiv);

//             cardDiv.appendChild(cardBody);
//             colDiv.appendChild(cardDiv);
//             examCardsContainer.appendChild(colDiv);
//         });
//     })
//     .catch(error => {
//         console.error('Error fetching exams:', error);
//         examCardsContainer.innerHTML = '<p class="text-danger text-center">পরীক্ষাগুলো লোড করতে ব্যর্থ হয়েছে।</p>';
//     });
// });



document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('access_token');
    const examTypeId = window.location.pathname.split('/')[2];

    fetch(`/quiz/model-exams/?exam_type=${examTypeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        const examsWithSubject = data.filter(e => e.subject_name);
        const examsWithoutSubject = data.filter(e => !e.subject_name);

        renderExamCards(examsWithSubject, 'examCardsContainerWithSubject');
        renderExamCards(examsWithoutSubject, 'examCardsContainerWithoutSubject', true);
    })
    .catch(err => {
        console.error('Error loading exams:', err);
    });

    // Tab switching
    document.querySelectorAll('#examTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedTab = this.getAttribute('data-tab');

            // Update active tab UI
            document.querySelectorAll('#examTabs .nav-link').forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            // Show/hide tab content
            document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
            document.getElementById(selectedTab).style.display = 'block';
        });
    });
});

function renderExamCards(exams, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (exams.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">কোনো পরীক্ষা পাওয়া যায়নি।</p>';
        return;
    }

    exams.forEach(exam => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4 mb-4';

        const card = document.createElement('div');
        card.className = 'card shadow-sm h-100 position-relative';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Subject badge top-left (if exists)
        if (exam.subject_name) {
            // Gradient label with emoji fallback
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'position-absolute top-0 end-0 px-3 py-1 rounded text-white fw-bold';
            subjectDiv.style.backdropFilter = 'blur(8px)';
            subjectDiv.style.background = 'rgba(0, 0, 0, 0.3)';
            subjectDiv.textContent = exam.subject_name;
            card.appendChild(subjectDiv);


        }

        // Exam type styled div (like your example)
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('p-2', 'mb-3', 'rounded', 'fw-bold');
        typeDiv.style.backgroundColor = '#e0ffe0';
        typeDiv.style.color = '#336633';
        typeDiv.textContent = exam.exam_type_name || 'পরীক্ষা';
        cardBody.appendChild(typeDiv);

        // Title
        const title = document.createElement('h5');
        title.className = 'card-title mt-0'; // no margin top as we have typeDiv margin bottom
        title.textContent = exam.title || 'শিরোনাম নেই';

        // Details line
        const details = document.createElement('p');
        details.className = 'card-text small text-muted';
        details.textContent = `${exam.total_mark || 0} নম্বর • ${exam.total_questions || 0} প্রশ্ন • ${exam.duration || 0} মিনিট`;

        // Position
        const position = document.createElement('p');
        position.className = 'card-text';
        position.innerHTML = `<strong>পদ:</strong> ${exam.position_name || 'উল্লেখ নেই'}`;

        // Organization
        const org = document.createElement('p');
        org.className = 'card-text';
        org.innerHTML = `<strong>সংস্থা:</strong> ${exam.organization_name || 'উল্লেখ নেই'}`;

        // Buttons container
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'd-flex gap-2';

        // Details button
        const detailsBtn = document.createElement('a');
        detailsBtn.href = `/model-tests/${exam.exam_id}/`;
        detailsBtn.className = 'btn btn-success btn-sm';
        detailsBtn.textContent = 'বিস্তারিত';

        // Share button
        const shareBtn = document.createElement('a');
        shareBtn.href = '#';
        shareBtn.className = 'btn btn-outline-secondary btn-sm';
        shareBtn.textContent = 'শেয়ার';

        const shareUrl = `${window.location.origin}/model-tests/${exam.exam_id}/`;
        shareBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: exam.title || 'পরীক্ষা',
                        text: 'এই পরীক্ষাটি দেখুন:',
                        url: shareUrl,
                    });
                } catch (err) {
                    console.error('Sharing failed:', err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('লিংক কপি হয়েছে!');
                } catch (err) {
                    alert('লিংক কপি ব্যর্থ হয়েছে!');
                }
            }
        });

        buttonWrapper.appendChild(detailsBtn);
        buttonWrapper.appendChild(shareBtn);

        // Append all to cardBody
        cardBody.appendChild(title);
        cardBody.appendChild(details);
        cardBody.appendChild(position);
        cardBody.appendChild(org);
        cardBody.appendChild(buttonWrapper);

        // Append cardBody to card, and card to col
        card.appendChild(cardBody);
        col.appendChild(card);

        // Append col to container
        container.appendChild(col);
    });
}



