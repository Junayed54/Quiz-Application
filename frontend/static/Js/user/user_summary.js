document.addEventListener('DOMContentLoaded', function() {
    // URL to the API endpoint
    const apiUrl = '/quiz/user-exam-summary/';
    
    // Fetch data from API
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Use the JWT token if required
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        // Populate data into HTML using Vanilla JavaScript
        document.getElementById('username').textContent = data.username || "User";
        document.getElementById('total-attempts').textContent = `${data.total_attempts}`;
        document.getElementById('total-passed').textContent = `${data.total_passed}`;
        document.getElementById('total-failed').textContent = `${data.total_failed}`;
        const elements = document.getElementsByClassName('total-question');
        for (let element of elements) {
            element.textContent = `${data.total_questions}`;
        }
        //.textContent = `${data.total_questions}`;
        document.getElementById('total-answered').textContent = data.total_answered;
        document.getElementById('total-unanswered').textContent = data.total_unanswered;
        document.getElementById('total-correct-answers').textContent = data.total_correct_answers;
        document.getElementById('total-wrong-answers').textContent = data.total_wrong_answers;
    })
    .catch(error => console.error('Error fetching exam summary:', error));


    
});


// document.addEventListener('DOMContentLoaded', function() {
//     const apiUrl = '/quiz/user-exam-summary/';

//     fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         const examTitles = [];
//         const correctAnswers = [];

//         data.forEach(attempt => {
//             examTitles.push(attempt.exam.title); // Adjust based on your data structure
//             correctAnswers.push(attempt.total_correct_answers);
//         });

//         console.log('Exam Titles:', examTitles);
//         console.log('Correct Answers:', correctAnswers);

//         if (examTitles.length > 0 && correctAnswers.length > 0) {
//             createCorrectAnswersLineChart(examTitles, correctAnswers);
//         } else {
//             console.error('No exam attempts data available for chart.');
//         }
//     })
//     .catch(error => console.error('Error fetching exam attempts:', error));
// });

// function createCorrectAnswersLineChart(examTitles, correctAnswers) {
//     const ctx = document.getElementById('correctAnswersChart').getContext('2d');
//     new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: examTitles,
//             datasets: [{
//                 label: 'Total Correct Answers per Exam',
//                 data: correctAnswers,
//                 backgroundColor: 'rgba(0, 123, 255, 0.2)',
//                 borderColor: 'rgba(0, 123, 255, 1)',
//                 borderWidth: 2,
//                 tension: 0.4
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     title: {
//                         display: true,
//                         text: 'Total Correct Answers'
//                     }
//                 },
//                 x: {
//                     title: {
//                         display: true,
//                         text: 'Exams'
//                     }
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: true,
//                     position: 'top',
//                 }
//             }
//         }
//     });
// }



// Function to create the line chart for correct answers
document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = '/quiz/attempts/all_attempts/';

    // Fetch data and update chart based on the selected time period
    function fetchDataAndCreateChart(timePeriod = 'all') {
        fetch(`${apiUrl}?time_period=${timePeriod}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);

            // Extracting labels, correct answers, and titles for tooltips
            const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
            const correctAnswers = data.map(attempt => attempt.total_correct_answers);
            const examTitles = data.map(attempt => attempt.exam__title);

            if (labels.length > 0 && correctAnswers.length > 0) {
                createCorrectAnswersLineChart(labels, correctAnswers, examTitles);
            } else {
                console.error('No exam attempts data available for the selected time period.');
            }
        })
        .catch(error => console.error('Error fetching exam attempts:', error));
    }

    // Initialize the line chart with tooltips showing exam titles
    function createCorrectAnswersLineChart(labels, data, examTitles) {
        const ctx = document.getElementById('correctAnswersChart').getContext('2d');

        // Destroy previous chart instance if it exists
        if (window.correctAnswersChart instanceof Chart) {
            window.correctAnswersChart.destroy();
        }

        window.correctAnswersChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Correct Answers per Attempt',
                    data: data,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Customize tooltip to include the exam title
                            label: function(tooltipItem) {
                                const index = tooltipItem.dataIndex;
                                const title = examTitles[index];
                                const correctAnswers = tooltipItem.raw;
                                return `Exam: ${title}, Correct Answers: ${correctAnswers}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Attempt Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Correct Answers'
                        }
                    }
                },
                responsive: true
            }
        });
    }

    // Initial fetch for 'all' time period
    fetchDataAndCreateChart('all');

    // Add event listeners for the time period radio buttons
    const radioButtons = document.getElementsByName('timePeriod');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            fetchDataAndCreateChart(this.value);
        });
    });
});







// Fetch the data from the API endpoint
