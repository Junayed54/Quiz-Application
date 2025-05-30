

// document.addEventListener("DOMContentLoaded", function () {
//     // Function to handle the form submission
//     const examUploadForm = document.getElementById("examUploadForm");
//     const responseMessage = document.getElementById("responseMessage");
//     const token = localStorage.getItem("access_token");

//     // Fetch the existing organizations, departments, and positions on page load
//     function fetchOptions() {
//         // Fetch organizations
//         fetch('/quiz/organizations/', {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             const organizationSelect = document.getElementById("organization");
//             data.forEach(org => {
//                 const option = document.createElement("option");
//                 option.value = org.id;  // Assuming `org.id` is the unique identifier
//                 option.textContent = `${org.name} - ${org.address}`;
//                 organizationSelect.appendChild(option);
//             });
//         })
//         .catch(error => console.error("Error fetching organizations:", error));

//         // Fetch departments
//         fetch('/quiz/departments/', {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             const departmentSelect = document.getElementById("department");
//             data.forEach(department => {
//                 const option = document.createElement("option");
//                 option.value = department.id;  // Assuming `department.id` is the unique identifier
//                 option.textContent = department.name;
//                 departmentSelect.appendChild(option);
//             });
//         })
//         .catch(error => console.error("Error fetching departments:", error));

//         // Fetch positions
//         fetch('/quiz/positions/', {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             const positionSelect = document.getElementById("position");
//             data.forEach(position => {
//                 const option = document.createElement("option");
//                 option.value = position.id;  // Assuming `position.id` is the unique identifier
//                 option.textContent = position.name;
//                 positionSelect.appendChild(option);
//             });
//         })
//         .catch(error => console.error("Error fetching positions:", error));
//     }

//     // Call fetchOptions to populate the select fields on page load
//     fetchOptions();

//     examUploadForm.addEventListener("submit", function (e) {
//         e.preventDefault();
    
//         // Clear previous response message
//         responseMessage.classList.add("d-none");
    
//         // Prepare FormData
//         const formData = new FormData();
//         formData.append("title", document.getElementById("title").value);
//         formData.append("organization_id", document.getElementById("organization").value);
//         formData.append("department_id", document.getElementById("department").value);
//         formData.append("position_id", document.getElementById("position").value);
//         formData.append("exam_date", document.getElementById("exam_date").value);
//         formData.append("file", document.getElementById("excel_file").files[0]);
//         console.log(formData);
//         // Submit the form via AJAX
//         fetch('/quiz/past-exams/', {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${token}`  // Only include the Authorization header
//                 // Remove "Content-Type": "application/json"
//             },
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 responseMessage.classList.remove("d-none");
//                 responseMessage.textContent = `Error: ${data.error}`;
//             } else {
//                 responseMessage.classList.remove("d-none");
//                 responseMessage.textContent = `Success: ${data.message}`;
//             }
//         })
//         .catch(error => {
//             responseMessage.classList.remove("d-none");
//             responseMessage.textContent = `Error: ${error.message}`;
//         });
//     });
    

//     // Organization, Department, and Position Modals
//     document.getElementById("saveOrganization").addEventListener("click", function () {
//         const newOrganization = document.getElementById("newOrganization").value;
//         const newOrganizationAddress = document.getElementById("newOrganizationAddress").value;
    
//         if (newOrganization && newOrganizationAddress) {
//             // Create a new option for the organization dropdown
//             const organizationSelect = document.getElementById("organization");
//             const option = document.createElement("option");
//             option.value = newOrganization;
//             option.textContent = `${newOrganization} - ${newOrganizationAddress}`;  // Include address in the dropdown
//             organizationSelect.appendChild(option);
//             organizationSelect.value = newOrganization;
    
//             // Optional: Send the new organization with address to the backend via AJAX
//             fetch('/quiz/organizations/', {
//                 method: "POST",
//                 body: JSON.stringify({ "name": newOrganization, "address": newOrganizationAddress }),
//                 headers: {
//                     "Authorization": `Bearer ${token}`,  // Include the token in the Authorization header
//                     "Content-Type": "application/json"   // Set content type if sending JSON
//                 },
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log('New organization added:', data);
//             });
    
//             $('#addOrganizationModal').modal('hide');
//         }
//     });
    
//     // Updated department saving method
//     document.getElementById("saveDepartment").addEventListener("click", function () {
//         const newDepartment = document.getElementById("newDepartment").value;
//         const organizationSelect = document.getElementById("organization");
//         const selectedOrganizationId = organizationSelect.value;  // Get the selected organization ID

//         if (newDepartment && selectedOrganizationId) {
//             // Create a new option for the department dropdown
//             const departmentSelect = document.getElementById("department");
//             const option = document.createElement("option");
//             option.value = newDepartment;
//             option.textContent = newDepartment;
//             departmentSelect.appendChild(option);
//             departmentSelect.value = newDepartment;
//             console.log(selectedOrganizationId);
//             // Optional: Send the new department with the selected organization to the backend via AJAX
//             fetch('/quiz/departments/', {
//                 method: "POST",
//                 body: JSON.stringify({ 
//                     "name": newDepartment,
//                     "organization": selectedOrganizationId  // Include the selected organization ID
//                 }),
//                 headers: {
//                     "Authorization": `Bearer ${token}`,  // Include the token in the Authorization header
//                     "Content-Type": "application/json"   // Set content type if sending JSON
//                 },
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log("Department added:", data);

//                 // Close the modal after successful save
//                 $('#addDepartmentModal').modal('hide');
//             })
//             .catch(error => {
//                 console.error('Error saving department:', error);
//             });
//         } else {
//             alert("Please enter a department name and select an organization");
//         }
//     });

//     document.getElementById("savePosition").addEventListener("click", function () {
//         const newPosition = document.getElementById("newPosition").value;
//         if (newPosition) {
//             // Create a new option for the position dropdown
//             const positionSelect = document.getElementById("position");
//             const option = document.createElement("option");
//             option.value = newPosition;
//             option.textContent = newPosition;
//             positionSelect.appendChild(option);
//             positionSelect.value = newPosition;

//             // Optional: Send the new position to the backend via AJAX (uncomment if needed)
//             fetch('/quiz/positions/', {
//                 method: "POST",
//                 body: JSON.stringify({ "title": newPosition }),
//                 headers: {
//                     "Authorization": `Bearer ${token}`,  // Include the token in the Authorization header
//                     "Content-Type": "application/json"   // Set content type if sending JSON
//                 },
//             })
//             .then(response => response.json())
//             .then(data => console.log(data));

//             $('#addPositionModal').modal('hide');
//         }
//     });
// });



// New test 

document.addEventListener("DOMContentLoaded", function () {
    const examUploadForm = document.getElementById("examUploadForm");
    const responseMessage = document.getElementById("responseMessage");
    const token = localStorage.getItem("access_token");


    const loader = document.getElementById("uploadLoader");
    // Function to fetch and populate the select fields on page load
    function fetchOptions() {
        // Fetch organizations
        fetch('/quiz/organizations/', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const organizationSelect = document.getElementById("organization");
            data.forEach(org => {
                const option = document.createElement("option");
                option.value = org.id;  // Use organization id
                option.textContent = `${org.name} - ${org.address}`;
                organizationSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching organizations:", error));

        // Fetch departments
        fetch('/quiz/departments/', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const departmentSelect = document.getElementById("department");
            data.forEach(dept => {
                const option = document.createElement("option");
                option.value = dept.id;  // Use department id
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching departments:", error));

        // Fetch positions
        fetch('/quiz/positions/', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const positionSelect = document.getElementById("position");
            data.forEach(pos => {
                const option = document.createElement("option");
                option.value = pos.id;  // Use position id
                option.textContent = pos.name;
                positionSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching positions:", error));


        // Fetch exam types
        fetch('/quiz/exam-types/', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const examTypeSelect = document.getElementById("exam_type");
            data.forEach(type => {
                const option = document.createElement("option");
                option.value = type.id;
                option.textContent = type.name;
                examTypeSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching exam types:", error));
    }

    // Populate the selects on page load
    fetchOptions();



    


    // Handle exam form submission
    examUploadForm.addEventListener("submit", function (e) {
        e.preventDefault();
        responseMessage.classList.add("d-none");

        // Show loader
        loader.classList.remove("d-none");
        // Prepare FormData with the proper keys
        const formData = new FormData();
        formData.append("title", document.getElementById("title").value);
        formData.append("organization", document.getElementById("organization").value);
        formData.append("department", document.getElementById("department").value);
        formData.append("position", document.getElementById("position").value);
        formData.append("exam_type", document.getElementById("exam_type").value);
        formData.append("exam_date", document.getElementById("exam_date").value);
        
        formData.append("duration", document.getElementById("duration").value);
        formData.append("pass_mark", document.getElementById("pass_mark").value);
        formData.append("negative_mark", document.getElementById("negative_mark").value);
        formData.append("file", document.getElementById("excel_file").files[0]);

        // POST the FormData; do not manually set Content-Type header for FormData.
        fetch('/quiz/past-exams/', {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loader.classList.add("d-none");
            if (data.error) {
                responseMessage.classList.remove("d-none");
                responseMessage.textContent = `Error: ${data.error}`;

            } else if (data.title) {
                responseMessage.classList.remove("d-none");
                responseMessage.textContent = `Error: ${data.title.join(', ')}`;
            } else {
                responseMessage.classList.remove("d-none");
                responseMessage.textContent = `Success: ${data.message}`;
            }
        })
        .catch(error => {
            loader.classList.add("d-none"); // Hide loader
            responseMessage.classList.remove("d-none");
            responseMessage.textContent = `Error: ${error.message}`;
        });
    });

    // Modal: Save Organization
    document.getElementById("saveOrganization").addEventListener("click", function () {
        const newOrganization = document.getElementById("newOrganization").value;
        const newOrganizationAddress = document.getElementById("newOrganizationAddress").value;
    
        if (newOrganization) {
            const organizationSelect = document.getElementById("organization");
            const option = document.createElement("option");
            // Temporary value set as newOrganization; backend response will provide correct id.
            option.value = newOrganization;  
            option.textContent = newOrganizationAddress
                ? `${newOrganization} - ${newOrganizationAddress}`
                : `${newOrganization}`;
            organizationSelect.appendChild(option);
            organizationSelect.value = newOrganization;
    
            // Send the new organization to the backend
            fetch('/quiz/organizations/', {
                method: "POST",
                body: JSON.stringify({ "name": newOrganization, "address": newOrganizationAddress }),
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log('New organization added:', data);
                // Update the option value with the returned id if provided
                if (data.id) {
                    option.value = data.id;
                    organizationSelect.value = data.id;
                }
            })
            .catch(error => console.error("Error saving organization:", error));
    
            $('#addOrganizationModal').modal('hide');
        }
    });
    
    // Modal: Save Department
    document.getElementById("saveDepartment").addEventListener("click", function () {
        const newDepartment = document.getElementById("newDepartment").value;
        const organizationSelect = document.getElementById("organization");
        const selectedOrganizationId = organizationSelect.value;
    
        if (newDepartment && selectedOrganizationId) {
            const departmentSelect = document.getElementById("department");
            const option = document.createElement("option");
            // Temporary value; backend will return the correct department id.
            option.value = newDepartment;
            option.textContent = newDepartment;
            departmentSelect.appendChild(option);
            departmentSelect.value = newDepartment;
    
            // Send the new department along with the selected organization id
            fetch('/quiz/departments/', {
                method: "POST",
                body: JSON.stringify({ 
                    "name": newDepartment,
                    "organization": selectedOrganizationId
                }),
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log("Department added:", data);
                if (data.id) {
                    option.value = data.id;
                    departmentSelect.value = data.id;
                }
            })
            .catch(error => console.error("Error saving department:", error));
    
            $('#addDepartmentModal').modal('hide');
        } else {
            alert("Please enter a department name and select an organization");
        }
    });
    
    // Modal: Save Position
    document.getElementById("savePosition").addEventListener("click", function () {
        const newPosition = document.getElementById("newPosition").value;
        if (newPosition) {
            const positionSelect = document.getElementById("position");
            const option = document.createElement("option");
            // Temporary value; backend should return an id.
            option.value = newPosition;
            option.textContent = newPosition;
            positionSelect.appendChild(option);
            positionSelect.value = newPosition;
    
            fetch('/quiz/positions/', {
                method: "POST",
                body: JSON.stringify({ "name": newPosition }),
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log("Position added:", data);
                if (data.id) {
                    option.value = data.id;
                    positionSelect.value = data.id;
                }
            })
            .catch(error => console.error("Error saving position:", error));
    
            $('#addPositionModal').modal('hide');
        }
    });


    document.getElementById("saveExamType").addEventListener("click", function () {
        const newExamType = document.getElementById("newExamType").value;
        if (newExamType) {
            const examTypeSelect = document.getElementById("exam_type");
            const option = document.createElement("option");
            option.value = newExamType;  // Temporary
            option.textContent = newExamType;
            examTypeSelect.appendChild(option);
            examTypeSelect.value = newExamType;

            fetch('/quiz/exam-types/', {
                method: "POST",
                body: JSON.stringify({ "name": newExamType }),
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log("Exam type added:", data);
                if (data.id) {
                    option.value = data.id;
                    examTypeSelect.value = data.id;
                }
            })
            .catch(error => console.error("Error saving exam type:", error));

            $('#addExamTypeModal').modal('hide');
        }
    });


});
