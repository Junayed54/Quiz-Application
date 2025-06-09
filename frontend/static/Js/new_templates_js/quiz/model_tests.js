// document.addEventListener('DOMContentLoaded', function() {
//     const examData = [
//         {
//             type: "বিসিএস", // BCS
//             title: "৪১ তম বিসিএস পরীক্ষা", // 41st BCS Exam
//             marks: 200,
//             questions: 80,
//             minutes: 60,
//             category: "প্রশাসনিক কর্মকর্তা", // Administrative Officer
//             source: "বাংলাদেশ সরকার" // Government of Bangladesh
//         },
//         {
//             type: "বিসিএস",
//             title: "৪২ তম বিসিএস পরীক্ষা",
//             marks: 200,
//             questions: 80,
//             minutes: 60,
//             category: "প্রশাসনিক কর্মকর্তা",
//             source: "বাংলাদেশ সরকার"
//         },
//         {
//             type: "বিসিএস",
//             title: "৪৩ তম বিসিএস পরীক্ষা",
//             marks: 200,
//             questions: 80,
//             minutes: 60,
//             category: "প্রশাসনিক কর্মকর্তা",
//             source: "বাংলাদেশ সরকার"
//         },
//         {
//             type: "বিসিএস",
//             title: "৪৪ তম বিসিএস পরীক্ষা",
//             marks: 200,
//             questions: 80,
//             minutes: 60,
//             category: "প্রশাসনিক কর্মকর্তা",
//             source: "বাংলাদেশ সরকার"
//         },
//         {
//             type: "বিসিএস",
//             title: "৪৫ তম বিসিএস পরীক্ষা",
//             marks: 200,
//             questions: 80,
//             minutes: 60,
//             category: "প্রশাসনিক কর্মকর্তা",
//             source: "বাংলাদেশ সরকার"
//         },
//         {
//             type: "বিসিএস",
//             title: "৪৬ তম বিসিএস পরীক্ষা",
//             marks: 200,
//             questions: 80,
//             minutes: 60,
//             category: "প্রশাসনিক কর্মকর্তা",
//             source: "বাংলাদেশ সরকার"
//         }
//         // Add more exam data objects here as needed
//     ];

//     const examCardsContainer = document.getElementById('examCardsContainer');

//     examData.forEach(exam => {
//         // Create the column div (col-md-6, col-lg-4, etc.)
//         const colDiv = document.createElement('div');
//         colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'exam-card-container'); // Adjust col classes as per your desired layout

//         // Create the card div
//         const cardDiv = document.createElement('div');
//         cardDiv.classList.add('card', 'h-100', 'shadow-sm'); // h-100 for equal height, shadow-sm for subtle shadow

//         // Create the card body
//         const cardBody = document.createElement('div');
//         cardBody.classList.add('card-body');

//         // Add the top green banner (similar to the image)
//         const typeDiv = document.createElement('div');
//         typeDiv.classList.add('p-2', 'mb-3', 'rounded', 'fw-bold');
//         typeDiv.style.backgroundColor = '#e0ffe0'; // Light green background
//         typeDiv.style.color = '#336633'; // Darker green text color
//         typeDiv.textContent = exam.type;

//         // Add the exam title
//         const titleH5 = document.createElement('h5');
//         titleH5.classList.add('card-title', 'mb-2');
//         titleH5.textContent = exam.title;

//         // Add marks, questions, minutes
//         const detailsP = document.createElement('p');
//         detailsP.classList.add('card-text', 'text-muted', 'small');
//         detailsP.textContent = `${exam.marks} প্রশ্ন • ${exam.questions} নম্বর • ${exam.minutes} মিনিট`;

//         // Add category and source
//         const categoryP = document.createElement('p');
//         categoryP.classList.add('card-text', 'mb-1');
//         categoryP.innerHTML = `<strong>পদ:</strong> ${exam.category}`;

//         const sourceP = document.createElement('p');
//         sourceP.classList.add('card-text', 'mb-3');
//         sourceP.innerHTML = `<strong>সংস্থা:</strong> ${exam.source}`;

//         // Create button container
//         const buttonDiv = document.createElement('div');
//         buttonDiv.classList.add('d-flex', 'justify-content-start', 'gap-2'); // gap-2 for spacing between buttons

//         // Create "বিস্তারিত" (Details) button
//         const detailsButton = document.createElement('a');
//         detailsButton.href = '#'; // Replace with actual link
//         detailsButton.classList.add('btn', 'btn-success', 'btn-sm');
//         detailsButton.textContent = 'বিস্তারিত';

//         // Create "শেয়ার" (Share) button
//         const shareButton = document.createElement('a');
//         shareButton.href = '#'; // Replace with actual link
//         shareButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
//         shareButton.textContent = 'শেয়ার';

//         // Append elements to their parents
//         buttonDiv.appendChild(detailsButton);
//         buttonDiv.appendChild(shareButton);

//         cardBody.appendChild(typeDiv);
//         cardBody.appendChild(titleH5);
//         cardBody.appendChild(detailsP);
//         cardBody.appendChild(categoryP);
//         cardBody.appendChild(sourceP);
//         cardBody.appendChild(buttonDiv);

//         cardDiv.appendChild(cardBody);
//         colDiv.appendChild(cardDiv);
//         examCardsContainer.appendChild(colDiv);
//     });
// });




document.addEventListener('DOMContentLoaded', function() {
    const examCardsContainer = document.getElementById('examCardsContainer');

    const token = localStorage.getItem('access_token');  // Get token from localStorage
     const examTypeId = window.location.pathname.split('/')[2];
     console.log(examTypeId);
    fetch(`/quiz/model-exams/?exam_type=${examTypeId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(examData => {
        console.log(examData);
        examData.forEach(exam => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col-12', 'col-md-6', 'col-lg-4', 'exam-card-container');

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', 'h-100', 'shadow-sm');

            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            const typeDiv = document.createElement('div');
            typeDiv.classList.add('p-2', 'mb-3', 'rounded', 'fw-bold');
            typeDiv.style.backgroundColor = '#e0ffe0';
            typeDiv.style.color = '#336633';
            typeDiv.textContent = exam.exam_type_name || 'পরীক্ষা';

            const titleH5 = document.createElement('h5');
            titleH5.classList.add('card-title', 'mb-2');
            titleH5.textContent = exam.title || 'শিরোনাম নেই';

            const detailsP = document.createElement('p');
            detailsP.classList.add('card-text', 'text-muted', 'small');
            detailsP.textContent = `${exam.total_mark || 0} নম্বর • ${exam.total_questions || 0} প্রশ্ন • ${exam.duration || 0} মিনিট`;

            const categoryP = document.createElement('p');
            categoryP.classList.add('card-text', 'mb-1');
            categoryP.innerHTML = `<strong>পদ:</strong> ${exam.position_name || 'উল্লেখ নেই'}`;

            const sourceP = document.createElement('p');
            sourceP.classList.add('card-text', 'mb-3');
            sourceP.innerHTML = `<strong>সংস্থা:</strong> ${exam.organization_name || 'উল্লেখ নেই'}`;

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('d-flex', 'justify-content-start', 'gap-2');

            const detailsButton = document.createElement('a');
            detailsButton.href = `/model-tests/${exam.exam_id}/`;  // change if needed
            detailsButton.classList.add('btn', 'btn-success', 'btn-sm');
            detailsButton.textContent = 'বিস্তারিত';

            const shareButton = document.createElement('a');
            shareButton.href = '#';
            shareButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
            shareButton.textContent = 'শেয়ার';
            const shareUrl = `${window.location.origin}/model-tests/${exam.exam_id}/`;
            shareButton.addEventListener('click', async () => {
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
                    // Fallback: copy to clipboard
                    try {
                        await navigator.clipboard.writeText(shareUrl);
                        alert('লিংক কপি হয়েছে!');
                    } catch (err) {
                        alert('শেয়ার করতে ব্যর্থ হয়েছে।');
                    }
                }
            });

            

            buttonDiv.appendChild(detailsButton);
            buttonDiv.appendChild(shareButton);

            cardBody.appendChild(typeDiv);
            cardBody.appendChild(titleH5);
            cardBody.appendChild(detailsP);
            cardBody.appendChild(categoryP);
            cardBody.appendChild(sourceP);
            cardBody.appendChild(buttonDiv);

            cardDiv.appendChild(cardBody);
            colDiv.appendChild(cardDiv);
            examCardsContainer.appendChild(colDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching exams:', error);
        examCardsContainer.innerHTML = '<p class="text-danger text-center">পরীক্ষাগুলো লোড করতে ব্যর্থ হয়েছে।</p>';
    });
});