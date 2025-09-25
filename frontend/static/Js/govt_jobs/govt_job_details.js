document.addEventListener('DOMContentLoaded', () => {
    const jobDetailsContainer = document.getElementById('job-details-content');
    const noticesContainer = document.getElementById('notices-list');
    const addNoticeBtn = document.getElementById('add-notice-btn');
    const noticeModal = document.getElementById('notice-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addNoticeForm = document.getElementById('add-notice-form');

    const pathSegments = window.location.pathname.split('/');
    const jobId = pathSegments[pathSegments.length - 2];

    if (jobId && !isNaN(jobId)) {
        fetchJobDetails(jobId);
    } else {
        jobDetailsContainer.innerHTML = `<div class="error"><p>প্রদত্ত চাকরির আইডি অবৈধ।</p></div>`;
        document.getElementById('notices-sidebar').style.display = 'none';
    }

    // Modal functionality
    if (addNoticeBtn && noticeModal && closeModalBtn) {
        addNoticeBtn.addEventListener('click', () => {
            noticeModal.showModal();
        });

        closeModalBtn.addEventListener('click', () => {
            noticeModal.close();
            addNoticeForm.reset();
        });

        noticeModal.addEventListener('click', (event) => {
            if (event.target === noticeModal) {
                noticeModal.close();
                addNoticeForm.reset();
            }
        });
    }

    // Form submission handler
    addNoticeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const accessToken = localStorage.getItem('access_token');
        const formData = new FormData(addNoticeForm);
        formData.append('government_job', jobId);

        try {
            const response = await fetch('/api/notices/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': '{{ csrf_token }}',
                    'Authorization': `Bearer ${accessToken}` 
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to add notice:', errorData);
                throw new Error('বিজ্ঞপ্তি যোগ করা সম্ভব হয়নি।');
            }

            const newNotice = await response.json();
            console.log('New notice added:', newNotice);

            fetchJobDetails(jobId);
            
            noticeModal.close();
            addNoticeForm.reset();
        } catch (error) {
            console.error('Failed to add notice:', error);
            alert('বিজ্ঞপ্তি যোগ করার সময় একটি ত্রুটি হয়েছে।');
        }
    });

    // Fetches job and notice data
    async function fetchJobDetails(id) {
        jobDetailsContainer.innerHTML = `<div class="loading"><div class="spinner"></div><p>চাকরির বিবরণ লোড হচ্ছে...</p></div>`;
        noticesContainer.innerHTML = `<p class="loading-text">বিজ্ঞপ্তি লোড হচ্ছে...</p>`;

        try {
            const response = await fetch(`/api/govt-jobs/${id}/`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                const message = response.status === 404 ? 'চাকরিটি খুঁজে পাওয়া যায়নি।' : 'চাকরির বিস্তারিত লোড করা সম্ভব হয়নি।';
                jobDetailsContainer.innerHTML = `<div class="error"><p>${message}</p></div>`;
                noticesContainer.innerHTML = `<p class="error-text">বিজ্ঞপ্তি লোড করা যায়নি।</p>`;
                return;
            }

            const job = await response.json();
            renderJobDetails(job);
            renderNotices(job.notices);
        } catch (error) {
            console.error('API fetch error:', error);
            jobDetailsContainer.innerHTML = `<div class="error"><p>একটি অপ্রত্যাশিত ত্রুটি হয়েছে।</p></div>`;
            noticesContainer.innerHTML = `<p class="error-text">বিজ্ঞপ্তি লোড করা যায়নি।</p>`;
        }
    }

    // Renders the main job details
    function renderJobDetails(job) {
        const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString('bn-BD') : 'উল্লেখ করা হয়নি';
        const postedOn = job.posted_on ? new Date(job.posted_on).toLocaleDateString('bn-BD') : 'উল্লেখ করা হয়নি';
        const positions = job.positions && job.positions.length > 0
            ? job.positions.map(p => sanitizeHTML(p.name)).join(', ') : 'উল্লেখ করা হয়নি';

        jobDetailsContainer.innerHTML = `
            <div class="job-header">
                <h1 class="job-title">${sanitizeHTML(job.title)}</h1>
                <div class="job-meta-info">
                    <span class="job-meta-item"><strong>প্রতিষ্ঠানের নাম:</strong> ${sanitizeHTML(job.organization?.name || 'উল্লেখ করা হয়নি')}</span>
                    <span class="job-meta-item"><strong>বিভাগের নাম:</strong> ${sanitizeHTML(job.department?.name || 'উল্লেখ করা হয়নি')}</span>
                    <span class="job-meta-item"><strong>পদের নাম:</strong> ${positions}</span>
                    <span class="job-meta-item"><strong>অবস্থান:</strong> ${sanitizeHTML(job.location || 'উল্লেখ করা হয়নি')}</span>
                    <span class="job-meta-item"><strong>প্রকাশের তারিখ:</strong> ${postedOn}</span>
                    <span class="job-meta-item"><strong>আবেদনের শেষ তারিখ:</strong> ${deadline}</span>
                </div>
            </div>

            <div class="job-description">
                <h2 class="section-title">চাকরির বিবরণ</h2>
                ${job.description || '<p>কোনো বিবরণ দেওয়া হয়নি।</p>'}
            </div>

            <div class="job-buttons">
                <a href="${job.official_link || '#'}" target="_blank" class="job-btn primary">অফিসিয়াল লিংক</a>
                ${job.pdf ? `<a href="${job.pdf}" target="_blank" class="job-btn secondary">পিডিএফ ডাউনলোড করুন</a>` : ''}
            </div>
        `;
    }

    // Renders the notices
    function renderNotices(notices) {
        noticesContainer.innerHTML = '';
        if (!notices || notices.length === 0) {
            noticesContainer.innerHTML = '<p class="no-notices">কোনো বিজ্ঞপ্তি নেই।</p>';
            return;
        }

        notices.forEach(notice => {
            const noticeElement = document.createElement('div');
            noticeElement.className = 'notice-item';
            const noticeLink = notice.link || notice.pdf || '#';
            noticeElement.innerHTML = `
                <a href="${sanitizeHTML(noticeLink)}" target="_blank">${sanitizeHTML(notice.title)}</a>
                ${notice.description ? `<p>${sanitizeHTML(notice.description)}</p>` : ''}
                <p>প্রকাশের তারিখ: ${new Date(notice.created_at).toLocaleDateString('bn-BD')}</p>
            `;
            noticesContainer.appendChild(noticeElement);
        });
    }

    function sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});