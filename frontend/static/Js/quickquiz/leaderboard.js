document.addEventListener("DOMContentLoaded", function () {


    function getInitialsRegex(fullName) {
        const matches = fullName.match(/\b\w/g) || []; // Find the first letter of each word
        return matches.map(char => char.toUpperCase()).join('');
    }


    
    
    const token = localStorage.getItem("access_token");
    const phoneNumber = localStorage.getItem("phone_number");

    // Prepare the URL
    let leaderboardUrl = "/api/practice/leaderboard/";

    // If no token, add phone number to query params
    if (!token && phoneNumber) {
        leaderboardUrl += `?phone_number=${encodeURIComponent(phoneNumber)}`;
    }

    // Prepare headers
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(leaderboardUrl, {
        method: "GET",
        headers: headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();  // Ensure it's parsed as JSON
    })
    .then(data => {
        console.log("✅ Leaderboard Data:", data);

        if (!data.top_10 || !Array.isArray(data.top_10)) {
            throw new Error("Invalid data format");
        }

        // Replace this with your own rendering logic
        renderTopThreePerformers(data.top_10);
        renderLeaderboard(data.top_10, data.me);
    })
    .catch(error => {
        console.error("❌ Leaderboard Fetch Error:", error);
        // alert("Something went wrong while loading leaderboard.");
    });


    
    function displayCurrentMonthYear() {
        const now = new Date();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // const formatted = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        // document.getElementById("month").textContent = formatted;
    }

    displayCurrentMonthYear();

    function renderTopThreePerformers(users) {
        const top3 = users.slice(0, 3);
        const container = document.getElementById("top-performers");
        container.innerHTML = "";

        const gradients = [
            "linear-gradient(135deg, #FFD700 0%, #FFC107 100%)", // 1st
            "linear-gradient(135deg, #FF7B9C 0%, #FF4D79 100%)", // 2nd
            "linear-gradient(135deg, #8A6EFF 0%, #6C4DF6 100%)"  // 3rd
        ];

        const displayOrder = [1, 0, 2]; // 2nd, 1st, 3rd podium

        displayOrder.forEach((orderIndex, podiumIndex) => {
            const user = top3[orderIndex];
            if (!user) return;

            const initials = getInitialsRegex(user.username);
            const profileImage = user.profile_image;
            const hasImage = profileImage && profileImage.trim() !== "";

            const defaultAvatar = "https://example.com/avatar.png"; // Replace with any public avatar URL
            // const initials = user.username ? user.username.charAt(0).toUpperCase() : "?"; // Get first letter of username

            const performerCard = document.createElement("div");
            performerCard.className = "text-center";

            // performerCard.innerHTML = `
            //     <div class="">
            //         <div class="d-flex position-relative">
            //             <div>
            //                 <div class="rounded-circle mx-auto" 
            //                     style="width: 80px; height: 80px; padding:20px; background: ${gradients[podiumIndex]}; overflow: hidden; position: relative;">
            //                     <span class="font-bold">${initials}</span>
                                
            //                 </div>
                            
                        
            //                 ${hasImage ? `
            //                         <div class="position-absolute" 
            //                             style="height:150px; width:100%; z-index:0; top:50px; left:0px;">
            //                             <img src="${profileImage}" alt="${user.username}" 
            //                                 style="width:100%; height:100%; object-fit:cover; border-radius:5%;">
            //                         </div>
            //                     ` : `<i class="fas fa-user text-white" style="font-size: 36px;"></i>`}

            //                 <div class="fw-semibold text-white overflow-hidden text-center"  style="margin-top: 150px;">${user.username}</div>
            //                 <div class="text-light small">${user.points} pts</div>
                            
            //             </div>
                       
            //                 <span class="rounded-pill" style="font-weight:800; font-size:36px;">
            //                     ${["🥈", "🥇", "🥉"][podiumIndex]}
            //                 </span>
                    
            //         </div>

            //     </div>

                
            // `;
            
            performerCard.innerHTML = `
            <div class="container-fluid p-2">
            <div class="d-flex flex-column align-items-center position-relative text-center">
                
                <div class="position-relative mb-2">
                <div class="rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 80px; height: 80px; background: ${gradients[podiumIndex]}; overflow: hidden; position: relative;">
                    ${hasImage ? `
                    <img src="${profileImage}" alt="${user.username}"
                        style="width: 100%; height: 100%; object-fit: cover;">
                    ` : `
                    <i class="fas fa-user text-white" style="font-size: 36px;"></i>
                    `}
                </div>
                </div>

                <div class="mt-2 text-white text-wrap fw-semibold w-100 overflow-hidden" style="min-height: 1.5rem;">
                ${user.username}
                </div>
                <div class="text-light small">${user.points} pts</div>

                <span class="position-absolute top-0 end-0 translate-middle-y rounded-pill"
                    style="font-weight:800; font-size: 36px;">
                ${["🥈", "🥇", "🥉"][podiumIndex]}
                </span>
            </div>
            </div>
            `;




            container.appendChild(performerCard);
        });
    }



    function renderLeaderboard(top10, me) {
        const leaderboardList = document.getElementById("rank-list");
        // leaderboardList.innerHTML = "";

        top10.forEach((user, index) => {
            leaderboardList.innerHTML += `
            <tr  class="rank-row p-4">
                <td>#${index+1}</td>
                <td class="d-flex align-items-center mt-2" style="gap: 10px;">
                    <div style="width: 45px; height:45px;" class="border bg-secondary rounded-circle text-center">
                        <div class="d-flex justify-content-center align-items-center pt-2">${getInitialsRegex(user.username)}</div>
                    </div>
                    <div>
                        <h6>${user.username}</h6><span class="text-secondary" style="font-size: 15px;">${user.attempts} tests</span>
                    </div>
                </td>
                <td>${user.attempts}</td>
                <td>${user.points}</td>
                <td>${user.points}%</td>
            </tr>`
           
        });

        if (me) {
            const rank = document.getElementById("my_rank");
            rank.innerText = `#${me.rank}`;

            const my_points = document.getElementById("my_points");
            my_points.innerText = `${me.points}`;

            const my_complete_test = document.getElementById("my_complete_test");
            my_complete_test.innerText = `${me.attempts}`;
            // currentUser.textContent = `You: ${me.username} - ${me.points} points`;
        }
    }
});



// function renderTopThreePerformers(users) {
    //     const top3 = users.slice(0, 3);
    //     const container = document.getElementById("top-performers");
    //     container.innerHTML = "";

    //     const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze
    //     const displayOrder = [1, 0, 2]; // podium order: 2nd, 1st, 3rd

    //     const gradientBackgrounds = [
    //         "linear-gradient(135deg, #FFD700 0%, #FFC107 100%)", // 1st
    //         "linear-gradient(135deg, #FF7B9C 0%, #FF4D79 100%)", // 2nd
    //         "linear-gradient(135deg, #8A6EFF 0%, #6C4DF6 100%)"  // 3rd
    //     ];

    //     const medalEmojis = ["🥇", "🥈", "🥉"];

    //     const row = document.createElement("div");
    //     row.className = "row justify-content-center align-items-end";

    //     displayOrder.forEach((orderIndex, podiumIndex) => {
    //         const user = top3[orderIndex];
    //         if (!user) return;

    //         const initials = getInitialsRegex(user.username);
    //         const hasImage = user.profile_picture && user.profile_picture.trim() !== "";

    //         const col = document.createElement("div");
    //         col.className = `col-4 d-flex flex-column align-items-center`;

    //         col.innerHTML = `
    //             <div class="position-relative mb-2">
    //                 ${
    //                     hasImage
    //                         ? `<img src="${user.profile_picture}" alt="${user.username}" class="rounded-circle border border-4" 
    //                             style="width: 90px; height: 90px; object-fit: cover; border-color: white;">`
    //                         : `<div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
    //                             style="width: 90px; height: 90px; background: ${gradientBackgrounds[podiumIndex]}; font-size: 1.25rem;">
    //                             ${initials}
    //                         </div>`
    //                 }
    //                 <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light shadow-sm">
    //                     ${medalEmojis[podiumIndex]}
    //                 </span>
    //             </div>
    //             <div class="text-white fw-semibold">${user.username}</div>
    //             <div class="text-secondary small">${user.points} pts</div>
    //         `;

    //         row.appendChild(col);
    //     });

    //     container.appendChild(row);

    // }