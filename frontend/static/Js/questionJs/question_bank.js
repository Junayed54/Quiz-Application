document.addEventListener('DOMContentLoaded', function () {
    const accessToken = window.localStorage.getItem('access_token');
    const apiUrl = `/quiz/questions/question_bank/`;

    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Show loader while fetching data
    const loader = document.getElementById('loading');
    loader.style.display = 'block';  // Show the loader

    // Fetch approved questions
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Ensure data is available and is an array
        if (!Array.isArray(data) || data.length === 0) {
            console.error('No questions found in the data');
            document.getElementById('question-list').innerHTML = '<tr><td colspan="9">No questions available</td></tr>';
            loader.style.display = 'none'; // Hide loader
            return;
        }

        // Hide the loader since the data has been fetched
        loader.style.display = 'none'; 
        
        // Select the table body element
        const questionList = document.getElementById('question-list');

        // Clear previous content
        questionList.innerHTML = '';

        // Iterate over the questions
        data.forEach((question, index) => {
            const rowHTML = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${question.text}</td>
                    <td>${question.options[0]?.text || ''}</td>
                    <td>${question.options[1]?.text || ''}</td>
                    <td>${question.options[2]?.text || ''}</td>
                    <td>${question.options[3]?.text || ''}</td>
                    <td>${question.options.find(option => option.is_correct)?.text || ''}</td>
                    <td>${question.options.length}</td>
                    <td>${question.category_name}</td>
                    <td>${question.difficulty_level}</td>
                </tr>
            `;
            questionList.innerHTML += rowHTML;
        });

        // Show the review container if there are any questions
        // document.getElementById('review-container').classList.remove('d-none');
    })
    .catch(error => {
        console.error('Error fetching approved questions:', error);
        loader.style.display = 'none';  // Hide loader in case of an error
    });

    // Add event listener for the download button
    document.getElementById('download-btn').addEventListener('click', function() {
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                alert('No questions available for download.');
                return;
            }

            // Prepare the data for Excel
            const worksheetData = [['Question', 'Option1', 'Option2', 'Option3', 'Option4', 'Answer', 'Options_num', 'Category', 'Difficulty']];
            data.forEach((question, index) => {
                const options = question.options.map(option => option.text);
                const correctAnswer = question.options.find(option => option.is_correct)?.text || '';
                const optionsCount = question.options.length;

                worksheetData.push([
                    question.text,
                    options[0] || '',
                    options[1] || '',
                    options[2] || '',
                    options[3] || '',
                    correctAnswer,
                    optionsCount,
                    question.category,
                    question.difficulty
                ]);
            });

            // Create Excel file using SheetJS (XLSX)
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

            // Generate and download the Excel file
            XLSX.writeFile(workbook, 'questions.xlsx');
        })
        .catch(error => {
            console.error('Error downloading questions:', error);
        });
    });
});
