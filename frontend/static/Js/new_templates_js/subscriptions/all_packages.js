document.addEventListener('DOMContentLoaded', () => {
  const plansContainer = document.getElementById('plans-container');
  const token = localStorage.getItem('access_token');
  const plansApiUrl = '/api/subscription-plans/';
  const userSubscriptionApiUrl = '/api/user-subscriptions/';

  let userSubscriptions = [];

  // Step 1: Fetch user's current subscriptions (to mark already bought)
  fetch(userSubscriptionApiUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      userSubscriptions = data.map(sub => sub.plan);
      loadPlans();
    })
    .catch(error => {
      console.error('Failed to fetch user subscriptions:', error);
      loadPlans(); // fallback: show plans even if user not logged in
    });

  // Step 2: Load all plans and render
  function loadPlans() {
    fetch(plansApiUrl)
      .then(response => response.json())
      .then(data => {
        plansContainer.innerHTML = ''; // Clear container

        data.forEach(plan => {
          const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';

            const isSubscribed = userSubscriptions.includes(plan.id);

            const priceOptions = plan.prices.map(price => `
            <option value="${price.id}">${price.duration} - ৳${price.price}</option>
            `).join('');

            card.innerHTML = `
            <div class="card h-100 border-${isSubscribed ? 'success' : 'primary'} shadow-sm">
                <div class="card-body">
                <h5 class="card-title text-capitalize d-flex justify-content-between align-items-center">
                    ${plan.name} Plan
                    ${isSubscribed ? '<span class="badge bg-success">✔ Subscribed</span>' : ''}
                </h5>
                <ul class="list-group list-group-flush mb-3">
                    <li class="list-group-item">Ad Free: ${plan.ad_free ? '✅' : '❌'}</li>
                    <li class="list-group-item">Free Model Test: ${plan.free_model_test ? '✅' : '❌'}</li>
                    <li class="list-group-item">Paid Model Test: ${plan.paid_model_test ? '✅' : '❌'}</li>
                    <li class="list-group-item">Daily PYQs: ${plan.daily_previous_year_questions}</li>
                    <li class="list-group-item">Special Tests: ${plan.upcoming_special_model_tests}</li>
                    <li class="list-group-item">Prize Exams: ${plan.prize_winning_special_exam ? '✅' : '❌'}</li>
                    <li class="list-group-item">Live Exam Access/Day: ${plan.daily_live_exam_room_access}</li>
                </ul>

                <div class="mb-2">
                    <label for="price-select-${plan.id}" class="form-label">Choose Duration:</label>
                    <select class="form-select price-select" id="price-select-${plan.id}" ${isSubscribed ? 'disabled' : ''}>
                    ${priceOptions}
                    </select>
                </div>

                <button class="btn btn-${isSubscribed ? 'success' : 'primary'} w-100 buy-now-btn" 
                        data-plan-id="${plan.id}" 
                        data-plan-name="${plan.name}"
                        ${isSubscribed ? 'disabled' : ''}>
                    ${isSubscribed ? 'Subscribed' : 'Buy Now'}
                </button>
                </div>
            </div>
            `;

            plansContainer.appendChild(card);

        });

        // Attach event listeners to Buy Now buttons
        document.querySelectorAll('.buy-now-btn').forEach(button => {
          button.addEventListener('click', function () {
            const planId = this.dataset.planId;
            const planName = this.dataset.planName;
            const select = document.getElementById(`price-select-${planId}`);
            const selectedPriceId = select.value;

            // Create subscription request
            fetch(userSubscriptionApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                price: selectedPriceId
              })
            })
              .then(res => {
                if (!res.ok) throw new Error("Subscription failed");
                return res.json();
              })
              .then(data => {
                alert(`Successfully subscribed to ${planName}!`);
                location.reload(); // Refresh to update badge
              })
              .catch(err => {
                console.error(err);
                alert('Subscription failed. Please try again.');
              });
          });
        });
      })
      .catch(error => {
        console.error('Error loading subscription plans:', error);
        plansContainer.innerHTML = '<p class="text-danger">Failed to load plans. Please try again later.</p>';
      });
  }
});
