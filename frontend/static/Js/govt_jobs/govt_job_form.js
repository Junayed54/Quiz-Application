document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');

    const jobForm = document.getElementById('jobForm');
    const messageDiv = document.getElementById('message');
    const organizationSelect = document.getElementById('organizationSelect');
    const departmentSelect = document.getElementById('departmentSelect');
    const positionSelect = document.getElementById('positionSelect');

    const createOrganizationBtn = document.getElementById('createOrganizationBtn');
    const createDepartmentBtn = document.getElementById('createDepartmentBtn');
    const createPositionBtn = document.getElementById('createPositionBtn');

    // Disable create position until organization is selected
    createPositionBtn.disabled = true;

    organizationSelect.addEventListener('change', () => {
        createPositionBtn.disabled = !organizationSelect.value;
    });

    // Populate select dropdowns
    async function populateSelect(url, selectElement, placeholder) {
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            selectElement.innerHTML = `<option value="">${placeholder}</option>`;
            data.forEach(item => {
                selectElement.innerHTML += `<option value="${item.id}">${item.name || item.title}</option>`;
            });
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    }

    populateSelect('/quiz/organizations/', organizationSelect, 'Select an Organization (optional)');
    populateSelect('/quiz/departments/', departmentSelect, 'Select a Department (optional)');
    populateSelect('/quiz/positions/', positionSelect, 'Select a Position (optional)');

    // Handle form submission
    jobForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(jobForm);
        const orgVal = organizationSelect.value;
        const deptVal = departmentSelect.value;
        const posVal = positionSelect.value;

        if (orgVal) formData.append('organization_id', orgVal);
        if (deptVal) formData.append('department_id', deptVal);
        if (posVal) formData.append('position_id', posVal);

        try {
            const response = await fetch('/api/govt-jobs/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `<div class="alert alert-success">Job posted successfully!</div>`;
                jobForm.reset();
                organizationSelect.selectedIndex = 0;
                departmentSelect.selectedIndex = 0;
                positionSelect.selectedIndex = 0;
            } else {
                let errorMsg = '';
                for (const key in data) {
                    errorMsg += `<strong>${key}</strong>: ${data[key]}<br>`;
                }
                messageDiv.innerHTML = `<div class="alert alert-danger">${errorMsg}</div>`;
            }
        } catch (error) {
            console.error(error);
            messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
        }
    });

    // Create Organization
    createOrganizationBtn.addEventListener('click', async () => {
        const name = prompt('Enter organization name:');
        if (!name) return;

        try {
            const res = await fetch('/quiz/organizations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Organization created');
                populateSelect('/quiz/organizations/', organizationSelect, 'Select an Organization (optional)');
            } else {
                alert('Error: ' + JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Create Department
    createDepartmentBtn.addEventListener('click', async () => {
        const name = prompt('Enter department name:');
        if (!name) return;

        try {
            const res = await fetch('/quiz/departments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Department created');
                populateSelect('/quiz/departments/', departmentSelect, 'Select a Department (optional)');
            } else {
                alert('Error: ' + JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Create Position (requires selected org)
    createPositionBtn.addEventListener('click', async () => {
        const name = prompt('Enter position title:');
        const orgId = organizationSelect.value;
        if (!name || !orgId) return;

        try {
            const res = await fetch('/quiz/positions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: name, organization: orgId })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Position created');
                populateSelect('/quiz/positions/', positionSelect, 'Select a Position (optional)');
            } else {
                alert('Error: ' + JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
        }
    });

});
