
// document.addEventListener("DOMContentLoaded", function () {

//     function getInitialsRegex(fullName) {
//         if (!fullName) return "";
//         const matches = fullName.match(/\b\w/g) || []; // Find the first letter of each word
//         return matches.map(char => char.toUpperCase()).join('');
//     }

//     // Function to get the correct image path for static files in Django
//     function getStaticImageUrl(imageName) {
//         return `/static/images/${imageName}`; // Example: /static/images/user.png
//     }

//     const token = localStorage.getItem("access_token");
//     const phoneNumber = localStorage.getItem("phone_number");

//     // Pagination variables
//     const usersPerPage = 10;
//     let currentPage = 1;
//     let allLeaderboardUsers = []; // To store all users for client-side pagination
//     let currentUserData = null; // Store data.me here

//     // Prepare the URL
//     let leaderboardUrl = "/api/practice/leaderboard/";

//     // If no token, add phone number to query params
//     if (!token && phoneNumber) {
//         leaderboardUrl += `?phone_number=${encodeURIComponent(phoneNumber)}`;
//     }

//     // Prepare headers
//     const headers = {
//         "Content-Type": "application/json"
//     };

//     if (token) {
//         headers["Authorization"] = `Bearer ${token}`;
//     }

//     fetch(leaderboardUrl, {
//         method: "GET",
//         headers: headers
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json(); // Ensure it's parsed as JSON
//     })
//     .then(data => {
//         console.log("✅ Leaderboard Data:", data);

//         if (!data.top_10 || !Array.isArray(data.top_10)) {
//             console.warn("Invalid data format: 'top_10' array is missing or malformed.");
//         } else {
//             allLeaderboardUsers = data.top_10; // Store all users
//             currentUserData = data.me; // Store the 'me' data
//             renderTopThreePerformers(allLeaderboardUsers); // Still render top 3 from all users
//             renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
//             setupPagination(allLeaderboardUsers.length); // Setup pagination controls
//         }
        
//         // Always attempt to display user's own stats if available
//         if (data.me) {
//             updateMyStats(data.me);
//         }

//     })
//     .catch(error => {
//         console.error("❌ Leaderboard Fetch Error:", error);
//         // You might want to display a user-friendly error message on the page
//         // alert("Something went wrong while loading leaderboard.");
//     });

//     // Function to update "My Stats" section
//     function updateMyStats(me) {
//         const myRankElement = document.getElementById("my_rank");
//         const myPointsElement = document.getElementById("my_points");
//         const myCompletedTasksElement = document.getElementById("my_complete_test");
        
//         const progressPercentageElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector("h3");
//         const nextRankPointsNeededElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector(".small span:last-child");
//         const progressBarFillElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector(".progress-bar");
//         const currentRankTextElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector(".small span:first-child");


//         if (myRankElement) {
//             myRankElement.innerText = `#${me.rank || '--'}`;
//         }
//         if (myPointsElement) {
//             myPointsElement.innerText = `${me.points || '--'}`;
//         }
//         if (myCompletedTasksElement) {
//             myCompletedTasksElement.innerText = `${me.attempts || '--'}/--`;
//         }

//         if (progressPercentageElement && me.progress_to_next_rank !== undefined) {
//              progressPercentageElement.innerText = `${me.progress_to_next_rank}%`;
//              if (progressBarFillElement) {
//                 progressBarFillElement.style.width = `${me.progress_to_next_rank}%`;
//                 progressBarFillElement.setAttribute('aria-valuenow', me.progress_to_next_rank);
//              }
//         } else if (progressPercentageElement) {
//             progressPercentageElement.innerText = `--%`;
//             if (progressBarFillElement) {
//                 progressBarFillElement.style.width = `0%`;
//                 progressBarFillElement.setAttribute('aria-valuenow', 0);
//             }
//         }

//         if (currentRankTextElement && me.next_rank_details && me.next_rank_details.rank) {
//             currentRankTextElement.innerText = `Rank #${me.next_rank_details.rank}`;
//         } else if (currentRankTextElement) {
//             currentRankTextElement.innerText = `Rank #--`;
//         }

//         if (nextRankPointsNeededElement && me.next_rank_details && me.next_rank_details.points_needed !== undefined) {
//             nextRankPointsNeededElement.innerText = `${me.next_rank_details.points_needed} points needed`;
//         } else if (nextRankPointsNeededElement) {
//             nextRankPointsNeededElement.innerText = `-- points needed`;
//         }
//     }


//     function renderTopThreePerformers(users) {
//         if (!users || users.length === 0) {
//             document.getElementById("top-performers").innerHTML = '<p class="text-white text-center">No top performers to display yet.</p>';
//             return;
//         }

//         const top3 = users.slice(0, 3);
//         const container = document.getElementById("top-performers");
//         container.innerHTML = "";

//         const gradients = [
//             "linear-gradient(149.8deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)",
//             "linear-gradient(149.78deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)",
//             "linear-gradient(149.8deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)"
//         ];

//         const borders =[
//             "1px solid #FFD700",
//             "1px solid #0FFFE6",
//             "1px solid #13E0B44D"
//         ];

//         const round_colors = [
//             "#FFD700",
//             "#C0C0C0",
//             "#CD7F32"
//         ];

//         const round_dropshadows = [
//             "0px 0px 20px 0px #CD7F3299",
//             "0px 0px 20px 0px #C0C0C099",
//             "0px 0px 20px 0px #CD7F3299"
//         ];
//         const dropshadows = [
//             "0px 20px 20px 0px #FFD7004D",
//             "0px 20px 20px 0px #00FFCC40",
//             "0px 20px 20px 0px #00000066"
//         ];

//         const buttons_style =[
//             "background: linear-gradient(75.81deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%); border: 1px solid #FFD700; color: #FFD700;",
//             "background: linear-gradient(74.07deg, rgba(192, 192, 192, 0.3) 0%, rgba(192, 192, 192, 0.15) 100%); border: 1px solid #C0C0C0; color: #C0C0C0;",
//             "background: linear-gradient(72.56deg, rgba(205, 127, 50, 0.3) 0%, rgba(205, 127, 50, 0.15) 100%); border: 1px solid #CD7F32; color: #CD7F32;"
//         ];
        
//         const displayOrderIndices = [1, 0, 2]; 

//         displayOrderIndices.forEach((originalIndex, podiumPosition) => {
//             const user = top3[originalIndex];
//             if (!user) return;

//             const profileImageSrc = user.profile_image ? user.profile_image : getStaticImageUrl('user.png');
//             const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));

//             const performerCol = document.createElement("div");
//             if (podiumPosition === 0) {
//                 performerCol.className = "col-4 order-1 col-md-4 order-md-1"; 
//             } else if (podiumPosition === 1) {
//                 performerCol.className = "col-4 order-0 col-md-4 order-md-0";
//             } else if (podiumPosition === 2) {
//                 performerCol.className = "col-4 order-2 col-md-4 order-md-2";
//             }


//             performerCol.innerHTML = `
//                 <div class="position-relative p-3 text-center top-performer-card" 
//                      style="background: ${gradients[originalIndex]}; border: ${borders[originalIndex]}; box-shadow: ${dropshadows[originalIndex]}; border-radius: 15px; margin: 10px auto; min-height: 300px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
//                     <span class="position-absolute end-0 translate-middle badge rounded-pill text-white fw-bold" style="background-color:${round_colors[originalIndex]}; font-size: 24px; padding: 5px 10px; top: 39px;">
//                         #${originalIndex + 1}
//                     </span>
//                     <div class="rounded-circle overflow-hidden mb-2" style="width: 100px; height: 100px; border: 4px solid ${round_colors[originalIndex]}; box-shadow: ${round_dropshadows[originalIndex]}; margin-top: 1.5rem;">
//                         ${isValidImageUrl ? `<img src="${profileImageSrc}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div class="initials-avatar" style="width: 100%; height: 100%;">${getInitialsRegex(user.username)}</div>`}
//                     </div>
//                     <div class="text-white fw-bold mb-1">${user.username}</div>
//                     <div class="text-light small mb-2">${user.course || 'N/A'}</div>
//                     <div class="text-custom-gradient h3 fw-bold mb-4">${user.points} pts</div>
//                     <button class="btn btn-sm rounded-pill" style="${buttons_style[originalIndex]} opacity: 0.8;">
//                         ${originalIndex === 0 ? "Top Performer" : originalIndex === 1 ? "Fast Learner" : "Consistent"}
//                     </button>
//                 </div>
//             `;
//             container.appendChild(performerCol);
//         });
//     }

//     // Function to render a specific page of the leaderboard
//     function renderLeaderboardPage(page, meData) { // Added meData parameter
//         const leaderboardTableBody = document.getElementById("leaderboard-table-body");
//         leaderboardTableBody.innerHTML = ""; // Clear existing content

//         const startIndex = (page - 1) * usersPerPage;
//         const endIndex = startIndex + usersPerPage;
//         const usersToDisplay = allLeaderboardUsers.slice(startIndex, endIndex);

//         let tableRowsHtml = '';

//         usersToDisplay.forEach((user, index) => {
//             const actualRank = startIndex + index + 1; // Calculate actual rank for the displayed user
//             const isMeRow = (meData && user.username === meData.username); // Use meData here
//             const rowClass = isMeRow ? "align-middle leaderboard-you-row" : "align-middle";
            
//             const profileImageSrc = user.profile_image ? user.profile_image : getStaticImageUrl('user.png');
//             const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));

//             let badgeHtml = '';
//             if (actualRank <= 3) {
//                 if (actualRank === 1) badgeHtml = `<span class="table-badge table-badge-top">Top Performer</span>`;
//                 else if (actualRank === 2) badgeHtml = `<span class="table-badge table-badge-fast">Fast Learner</span>`;
//                 else if (actualRank === 3) badgeHtml = `<span class="table-badge table-badge-consistent">Consistent</span>`;
//             }
//             if (user.badges && Array.isArray(user.badges)) {
//                 badgeHtml += user.badges.map(badge => `<span class="table-badge table-badge-${badge.toLowerCase().replace(/\s/g, '')}">${badge}</span>`).join(' ');
//             }

//             tableRowsHtml += `
//                 <tr class="${rowClass}">
//                     <td class="px-4 py-3 text-sm fw-bold ${isMeRow ? 'text-info'  : 'text-gray-300'}">
//                         ${actualRank <= 3 ? `<span class="d-inline-flex align-items-center justify-content-center ${actualRank === 1 ? 'bg-warning text-dark' : actualRank === 2 ? 'bg-info text-dark' : 'bg-primary text-dark'} rounded-circle me-2" style="width: 24px; height: 24px; font-size: 0.75rem;">${actualRank}</span>` : `#${actualRank}`}
//                     </td>
//                     <td class="px-4 py-3 text-sm ${isMeRow ? 'text-white' : 'text-white'}">
//                         <div class="d-flex align-items-center">
//                             ${isValidImageUrl ? 
//                                 `<img src="${profileImageSrc}" alt="${user.username}" class="profile-img-sm">` :
//                                 `<div class="initials-avatar profile-img-sm">${getInitialsRegex(user.username)}</div>`
//                             }
//                              ${user.username}
//                         </div>
//                     </td>
//                     <td class="px-4 py-3 text-sm">${user.attempts || '--'}</td>
//                     <td class="px-4 py-3 text-lg fw-bold ${isMeRow ? 'text-info' : 'text-white'}">${user.points}</td>
//                     <td class="px-4 py-3 text-sm">
//                         ${badgeHtml}
//                     </td>
//                 </tr>`;
//         });

//         leaderboardTableBody.innerHTML = tableRowsHtml;
//     }

//     // Function to set up pagination controls
//     function setupPagination(totalUsers) {
//         const totalPages = Math.ceil(totalUsers / usersPerPage);
//         const paginationContainer = document.getElementById("pagination-controls");
//         paginationContainer.innerHTML = ''; // Clear existing controls

//         if (totalPages <= 1) {
//             return; // No need for pagination if only one page
//         }

//         const ul = document.createElement("ul");
//         ul.className = "pagination justify-content-center";

//         // Previous button
//         const prevLi = document.createElement("li");
//         prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
//         prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">Previous</a>`;
//         prevLi.addEventListener("click", function(e) {
//             e.preventDefault();
//             if (currentPage > 1) {
//                 currentPage--;
//                 renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
//                 setupPagination(totalUsers);
//             }
//         });
//         ul.appendChild(prevLi);

//         // Page number buttons
//         for (let i = 1; i <= totalPages; i++) {
//             const li = document.createElement("li");
//             li.className = `page-item ${currentPage === i ? 'active' : ''}`;
//             li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
//             li.addEventListener("click", function(e) {
//                 e.preventDefault();
//                 currentPage = i;
//                 renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
//                 setupPagination(totalUsers);
//             });
//             ul.appendChild(li);
//         }

//         // Next button
//         const nextLi = document.createElement("li");
//         nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
//         nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">Next</a>`;
//         nextLi.addEventListener("click", function(e) {
//             e.preventDefault();
//             if (currentPage < totalPages) {
//                 currentPage++;
//                 renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
//                 setupPagination(totalUsers);
//             }
//         });
//         ul.appendChild(nextLi);

//         paginationContainer.appendChild(ul);
//     }
// });


document.addEventListener("DOMContentLoaded", function () {

    // --- State Management ---
    const usersPerPage = 10;
    let currentPage = 1;
    let allLeaderboardUsers = []; 
    let currentUserData = null; 

    // --- Helper: Initials for Fallback Avatars ---
    function getInitials(fullName) {
        if (!fullName) return "??";
        const matches = fullName.match(/\b\w/g) || [];
        return matches.map(char => char.toUpperCase()).join('').substring(0, 2);
    }

    // --- Helper: Django Static Paths ---
    function getStaticImageUrl(imageName) {
        return `/static/images/${imageName}`;
    }

    // --- Initialization & API Fetching ---
    const token = localStorage.getItem("access_token");
    const phoneNumber = localStorage.getItem("phone_number");
    let leaderboardUrl = "/api/practice/leaderboard/";

    if (!token && phoneNumber) {
        leaderboardUrl += `?phone_number=${encodeURIComponent(phoneNumber)}`;
    }

    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(leaderboardUrl, { method: "GET", headers: headers })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("✅ Leaderboard Data Received");

            if (data.top_10 && Array.isArray(data.top_10)) {
                allLeaderboardUsers = data.top_10;
                currentUserData = data.me;
                
                // Trigger UI Renders
                renderTopThreePerformers(allLeaderboardUsers);
                renderLeaderboardPage(currentPage, currentUserData);
                setupPagination(allLeaderboardUsers.length);
            }

            if (data.me) {
                updateMyStats(data.me);
            }
        })
        .catch(error => {
            console.error("❌ Leaderboard Fetch Error:", error);
        });

    // --- UI Component: Personal Stats (Top Header) ---
    function updateMyStats(me) {
        const myRankElement = document.getElementById("my_rank");
        const myPointsElement = document.getElementById("my_points");
        const myCompletedTasksElement = document.getElementById("my_complete_test");
        
        // Find progress section relative to the stats card
        const statCard = document.querySelector("#my_complete_test")?.closest(".card-dark-bg");
        const progressSection = statCard?.nextElementSibling;

        if (myRankElement) myRankElement.innerText = `#${me.rank || '--'}`;
        if (myPointsElement) myPointsElement.innerText = `${(me.points || 0).toLocaleString()}`;
        if (myCompletedTasksElement) myCompletedTasksElement.innerText = `${me.attempts || '0'}/--`;

        if (progressSection) {
            const percText = progressSection.querySelector("h3");
            const nextRankText = progressSection.querySelector(".small span:first-child");
            const pointsNeededText = progressSection.querySelector(".small span:last-child");
            const progressBar = progressSection.querySelector(".progress-bar");

            const progress = me.progress_to_next_rank ?? 0;
            if (percText) percText.innerText = `${progress}%`;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
            }
            if (nextRankText) nextRankText.innerText = `Rank #${me.next_rank_details?.rank || '--'}`;
            if (pointsNeededText) pointsNeededText.innerText = `${me.next_rank_details?.points_needed || '0'} points needed`;
        }
    }

    // --- UI Component: Top 3 Podium Cards ---
    function renderTopThreePerformers(users) {
        const container = document.getElementById("top-performers");
        if (!container || !users || users.length === 0) return;

        const top3 = users.slice(0, 3);
        container.innerHTML = "";

        // Style configurations for 1st, 2nd, and 3rd place
        const styles = [
            { // 1st Place (Index 0)
                grad: "linear-gradient(149.8deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)",
                border: "1px solid #FFD700",
                accent: "#FFD700",
                shadow: "0px 20px 20px 0px #FFD7004D",
                btnStyle: "background: linear-gradient(75.81deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%); border: 1px solid #FFD700; color: #FFD700;",
                label: "Top Performer"
            },
            { // 2nd Place (Index 1)
                grad: "linear-gradient(149.78deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)",
                border: "1px solid #0FFFE6",
                accent: "#C0C0C0",
                shadow: "0px 20px 20px 0px #00FFCC40",
                btnStyle: "background: linear-gradient(74.07deg, rgba(192, 192, 192, 0.3) 0%, rgba(192, 192, 192, 0.15) 100%); border: 1px solid #C0C0C0; color: #C0C0C0;",
                label: "Fast Learner"
            },
            { // 3rd Place (Index 2)
                grad: "linear-gradient(149.8deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)",
                border: "1px solid #13E0B44D",
                accent: "#CD7F32",
                shadow: "0px 20px 20px 0px #00000066",
                btnStyle: "background: linear-gradient(72.56deg, rgba(205, 127, 50, 0.3) 0%, rgba(205, 127, 50, 0.15) 100%); border: 1px solid #CD7F32; color: #CD7F32;",
                label: "Consistent"
            }
        ];
        
        // Podium order display: 2nd place on left, 1st in middle, 3rd on right
        const displayOrder = [1, 0, 2]; 

        displayOrder.forEach((originalIndex) => {
            const user = top3[originalIndex];
            if (!user) return;

            const config = styles[originalIndex];
            const profileImg = user.profile_image || getStaticImageUrl('user.png');
            const col = document.createElement("div");
            
            // Handle responsive column ordering
            col.className = `col-4 px-1 px-md-3 order-${originalIndex === 0 ? 1 : originalIndex === 1 ? 0 : 2}`;

            col.innerHTML = `
                <div class="position-relative p-2 p-md-3 text-center top-performer-card h-100 shadow-lg" 
                     style="background: ${config.grad}; border: ${config.border}; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; min-height: 280px;">
                    
                    <span class="position-absolute end-0 translate-middle badge rounded-pill text-white fw-bold" 
                          style="background-color:${config.accent}; font-size: 16px; padding: 6px 12px; top: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        #${originalIndex + 1}
                    </span>

                    <div class="rounded-circle overflow-hidden mb-3" style="width: 75px; height: 75px; border: 3px solid ${config.accent}; margin-top: 1.5rem;">
                        ${user.profile_image ? 
                            `<img src="${profileImg}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `<div class="d-flex align-items-center justify-content-center h-100 bg-secondary text-white fw-bold">${getInitials(user.username)}</div>`
                        }
                    </div>

                    <div class="text-white fw-bold small mb-1 text-truncate w-100">${user.username}</div>
                    <div class="text-custom-gradient h5 fw-bold mb-3">${(user.points || 0).toLocaleString()} <span class="small" style="font-size: 10px;">PTS</span></div>
                    
                    <button class="btn btn-xs rounded-pill w-100 fw-bold text-uppercase" style="${config.btnStyle} font-size: 9px; letter-spacing: 0.5px;">
                        ${config.label}
                    </button>
                </div>
            `;
            container.appendChild(col);
        });
    }

    // --- UI Component: Main Leaderboard Table ---
    function renderLeaderboardPage(page, meData) {
        const tableBody = document.getElementById("leaderboard-table-body");
        if (!tableBody) return;
        
        tableBody.innerHTML = ""; 

        const start = (page - 1) * usersPerPage;
        const slice = allLeaderboardUsers.slice(start, start + usersPerPage);

        slice.forEach((user, index) => {
            const actualRank = start + index + 1;
            const isMe = (meData && String(user.username) === String(meData.username));
            const profileImg = user.profile_image || getStaticImageUrl('user.png');

            let badge = '';
            if (actualRank === 1) badge = `<span class="table-badge table-badge-top text-success">Top Performer</span>`;
            else if (actualRank === 2) badge = `<span class="table-badge table-badge-fast text-primary">Fast Learner</span>`;
            else if (actualRank === 3) badge = `<span class="table-badge table-badge-consistent text-secondary">Consistent</span>`;

            tableBody.innerHTML += `
                <tr class="align-middle ${isMe ? 'leaderboard-you-row' : ''}">
                    <td class="px-4 py-3">
                        <span class="d-inline-flex align-items-center justify-content-center fw-bold rounded-circle 
                            ${actualRank === 1 ? 'bg-warning text-white' : actualRank === 2 ? 'bg-info text-white' : actualRank === 3 ? 'bg-primary text-white' : 'text-white'}" 
                            style="width: 30px; height: 30px; font-size: 0.85rem;">
                            ${actualRank}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${profileImg}" class="rounded-circle border border-secondary" style="width: 35px; height: 35px; object-fit: cover;">
                            <span class="fw-bold ${isMe ? 'text-white' : 'text-white'}">${user.username}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-secondary">${user.attempts || '0'}</td>
                    <td class="px-4 py-3 fw-bold ${isMe ? 'text-white' : 'text-white'}">${(user.points || 0).toLocaleString()}</td>
                    <td class="px-4 py-3">${badge}</td>
                </tr>`;
        });
    }

    // --- UI Component: Pagination Logic ---
    function setupPagination(total) {
        const navContainer = document.getElementById("pagination-controls");
        if (!navContainer) return;

        const pages = Math.ceil(total / usersPerPage);
        navContainer.innerHTML = ''; 
        if (pages <= 1) return;

        const ul = document.createElement("ul");
        ul.className = "pagination justify-content-center mt-4 gap-1";

        // Previous Button
        ul.appendChild(createPageBtn("Previous", currentPage > 1, () => {
            currentPage--;
            refreshUI();
        }));

        // Number Buttons
        for (let i = 1; i <= pages; i++) {
            const li = createPageBtn(i, true, () => {
                currentPage = i;
                refreshUI();
            });
            if (i === currentPage) li.querySelector('a').classList.add("active", "bg-info", "border-info");
            ul.appendChild(li);
        }

        // Next Button
        ul.appendChild(createPageBtn("Next", currentPage < pages, () => {
            currentPage++;
            refreshUI();
        }));

        navContainer.appendChild(ul);
    }

    function createPageBtn(label, active, action) {
        const li = document.createElement("li");
        li.className = `page-item ${!active ? 'disabled' : ''}`;
        li.innerHTML = `<a class="page-link bg-dark border-secondary text-white rounded px-3" href="#">${label}</a>`;
        if (active) {
            li.addEventListener("click", (e) => {
                e.preventDefault();
                action();
            });
        }
        return li;
    }

    function refreshUI() {
        renderLeaderboardPage(currentPage, currentUserData);
        setupPagination(allLeaderboardUsers.length);
        // Scroll to table top on page change
        document.getElementById('leaderboard-table-body')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});