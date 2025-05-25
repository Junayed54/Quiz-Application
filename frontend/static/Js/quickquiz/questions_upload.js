const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const fileNameDisplay = document.getElementById('fileName');
  const uploadForm = document.getElementById('uploadForm');
  const uploadStatus = document.getElementById('uploadStatus');

  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    updateFileName();
  });

  fileInput.addEventListener('change', updateFileName);

  function updateFileName() {
    const file = fileInput.files[0];
    if (file) {
      fileNameDisplay.textContent = file.name;
    } else {
      fileNameDisplay.textContent = '';
    }
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadStatus.innerHTML = '<div class="text-muted">Uploading...</div>';

    const formData = new FormData(uploadForm);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('/api/questions/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        uploadStatus.innerHTML = `
          <div class="alert alert-success">
            ✅ Upload successful! <br>
            Questions created: <strong>${data.questions_created}</strong><br>
            Questions skipped: <strong>${data.questions_skipped}</strong>
          </div>`;
      } else {
        uploadStatus.innerHTML = `
          <div class="alert alert-danger">
            ❌ Error: ${data.error || 'Something went wrong.'}
          </div>`;
      }

    } catch (err) {
      uploadStatus.innerHTML = `
        <div class="alert alert-danger">
          ❌ Unexpected error occurred.
        </div>`;
    }
  });
