// document.addEventListener("DOMContentLoaded", function () {

//     function getInitialsRegex(fullName) {
//         if (!fullName) return "";
//         const matches = fullName.match(/\b\w/g) || []; // Find the first letter of each word
//         return matches.map(char => char.toUpperCase()).join('');
//     }

//     // Function to get the correct image path for static files in Django
//     // This assumes your static URL is configured correctly.
//     // You might need to adjust this if your static files are served from a different path.
//     function getStaticImageUrl(imageName) {
//         return `/static/images/${imageName}`; // Example: /static/images/user.png
//     }

//     const token = localStorage.getItem("access_token");
//     const phoneNumber = localStorage.getItem("phone_number");

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
//             // Proceed without rendering top performers if top_10 is missing
//         } else {
//             renderTopThreePerformers(data.top_10);
//             renderLeaderboard(data.top_10, data.me);
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
        
//         // These elements are placeholders, assuming API provides progress data
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
//             // Assuming me.completed_tasks and me.total_tasks if available in API
//             myCompletedTasksElement.innerText = `${me.attempts || '--'}/--`; // Adjust if API provides total tasks
//         }

//         // Update Progress to Next Rank (assuming API fields like progress_to_next_rank, next_rank_details)
//         if (progressPercentageElement && me.progress_to_next_rank !== undefined) {
//              progressPercentageElement.innerText = `${me.progress_to_next_rank}%`;
//              if (progressBarFillElement) {
//                 progressBarFillElement.style.width = `${me.progress_to_next_rank}%`;
//                 progressBarFillElement.setAttribute('aria-valuenow', me.progress_to_next_rank);
//              }
//         } else if (progressPercentageElement) {
//             progressPercentageElement.innerText = `--%`; // Default if data is missing
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


//     // The user's provided renderTopThreePerformers function, adapted for Bootstrap grid
//     function renderTopThreePerformers(users) {
//         const top3 = users.slice(0, 3);
//         const container = document.getElementById("top-performers");
//         container.innerHTML = ""; // Clear existing static content

//         // Gradients, borders, and dropshadows are from the user's provided JS for these cards
//         const gradients = [
//             "linear-gradient(149.8deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)", // 1st (yellow)
//             "linear-gradient(149.78deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)", // 2nd (cyan)
//             "linear-gradient(149.8deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)"  // 3rd (orange)
//         ];

//         const borders =[
//             "1px solid #FFD700",
//             "1px solid #0FFFE6",
//             "1px solid #13E0B44D"
//         ];

//         const round_colors = [
//             "#FFD700;",
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
        
//         // Ensure 3 columns for Bootstrap grid layout
//         const bootstrapCols = ["col-12 col-sm-6 col-lg-4", "col-12 col-sm-6 col-lg-4", "col-12 col-sm-12 col-lg-4"];

//         top3.forEach((user, index) => {
//             if (!user) return;

//             const profileImageSrc = user.profile_image ? user.profile_image : getStaticImageUrl('user.png');
//             // Check if profileImageSrc is a valid URL before using it
//             const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));

//             const performerCol = document.createElement("div");
//             performerCol.className = bootstrapCols[index]; // Use Bootstrap grid classes

//             performerCol.innerHTML = `
//                 <div class="position-relative p-3 text-center top-performer-card" 
//                      style="background: ${gradients[index]}; border: ${borders[index]}; box-shadow: ${dropshadows[index]}; border-radius: 15px; margin: 10px auto; min-height: 300px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
//                     <span class="position-absolute end-0 translate-middle badge rounded-pill text-white fw-bold" style="background-color:${round_colors[index]}; font-size: 24px; padding: 5px 10px; top: 39px;">
//                         #${index + 1}
//                     </span>
//                     <div class="rounded-circle overflow-hidden mb-2" style="width: 100px; height: 100px; border: 4px solid ${round_colors[index]}; box-shadow: ${round_dropshadows[index]}; margin-top: 1.5rem;">
//                         ${isValidImageUrl ? `<img src="${profileImageSrc}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div class="initials-avatar" style="width: 100%; height: 100%;">${getInitialsRegex(user.username)}</div>`}
//                     </div>
//                     <div class="text-white fw-bold mb-1">${user.username}</div>
//                     <div class="text-light small mb-2">${user.course || 'N/A'}</div>
//                     <div class="text-custom-gradient h3 fw-bold mb-4">${user.points} pts</div>
//                     <button class="btn btn-sm rounded-pill" style="${buttons_style[index]} opacity: 0.8;">
//                         ${index === 0 ? "Top Performer" : index === 1 ? "Fast Learner" : "Consistent"}
//                     </button>
//                 </div>
//             `;
//             container.appendChild(performerCol);
//         });
//     }

//     // The user's provided renderLeaderboard function, adapted for Bootstrap and dynamic content
//     function renderLeaderboard(top10, me) {
//         const leaderboardTableBody = document.getElementById("leaderboard-table-body");
//         leaderboardTableBody.innerHTML = ""; // Clear existing static content

//         let tableRowsHtml = '';

//         top10.forEach((user, index) => {
//             // Determine if this is the "me" user and apply special styling
//             // meNotInTop10 = me && !top10.some(u => u.username === me.username && u.rank === me.rank);
//             const isMeRow = me && user.username === me.username; // Assuming rank and username uniquely identify "me"
//             // console.log(isMeRow, user.username, me.username, user.rank, me.rank);
//             const rowClass = isMeRow ? "align-middle leaderboard-you-row" : "align-middle";
            
//             const profileImageSrc = user.profile_image ? user.profile_image : getStaticImageUrl('user.png');
//             const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));

//             // Use the "table-badge" classes from the CSS
//             let badgeHtml = '';
//             // Example of assigning badges based on rank or predefined criteria
//             if (index === 0) badgeHtml = `<span class="table-badge table-badge-top">Top Performer</span>`;
//             else if (index === 1) badgeHtml = `<span class="table-badge table-badge-fast">Fast Learner</span>`;
//             else if (index === 2) badgeHtml = `<span class="table-badge table-badge-consistent">Consistent</span>`;
//             // Add more badge logic here if API provides specific badge types (e.g., user.badges array)
//             if (user.badges && Array.isArray(user.badges)) {
//                 badgeHtml += user.badges.map(badge => `<span class="table-badge table-badge-${badge.toLowerCase().replace(/\s/g, '')}">${badge}</span>`).join(' ');
//             }

//             // --- THE CHANGE IS HERE ---
//             const displayedRank = user.rank ? `#${user.rank}` : `#${index + 1}`;
//             // --- END OF CHANGE ---

            

//             tableRowsHtml += `
//                 <tr class="${rowClass}">
//                     <td class="px-4 py-3 text-sm fw-bold ${isMeRow ? 'text-info'  : 'text-gray-300'}">
//                         ${index < 3 ? `<span class="d-inline-flex align-items-center justify-content-center ${index === 0 ? 'bg-warning text-dark' : index === 1 ? 'bg-info text-dark' : 'bg-primary text-dark'} rounded-circle me-2" style="width: 24px; height: 24px; font-size: 0.75rem;">${index + 1}</span>` : displayedRank}
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

//         // If "me" user is not in the top 10, add a separate row for them
//         // const meNotInTop10 = me && !top10.some(u => u.username === me.username && u.rank === me.rank);

//         // if (me && meNotInTop10) {
//         //     const profileImageSrc = me.profile_image ? me.profile_image : getStaticImageUrl('user.png');
//         //     const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));
            
//         //     let myBadgeHtml = '';
//         //     if (me.badges && Array.isArray(me.badges)) {
//         //         myBadgeHtml = me.badges.map(badge => `<span class="table-badge table-badge-${badge.toLowerCase().replace(/\s/g, '')}">${badge}</span>`).join(' ');
//         //     }

//         //     tableRowsHtml += `
//         //         <tr class="align-middle leaderboard-you-row">
//         //             <td class="px-4 py-3 text-sm fw-bold text-info">${me.rank ? `${me.rank}` : '--'}</td>
//         //             <td class="px-4 py-3 text-sm text-white">
//         //                 <div class="d-flex align-items-center">
//         //                     ${isValidImageUrl ? 
//         //                         `<img src="${profileImageSrc}" alt="${me.username}" class="profile-img-sm">` :
//         //                         `<div class="initials-avatar profile-img-sm">${getInitialsRegex(me.username)}</div>`
//         //                     }
//         //                     ${me.username}
//         //                 </div>
//         //             </td>

//         //             <td class="px-4 py-3 text-sm">${me.attempts || '--'}</td>
//         //             <td class="px-4 py-3 text-lg fw-bold text-info">${me.points}</td>
//         //             <td class="px-4 py-3 text-sm">
//         //                 ${myBadgeHtml}
//         //             </td>
                    
//         //         </tr>`;
//         // }

//         leaderboardTableBody.innerHTML = tableRowsHtml;
//     }
// });






document.addEventListener("DOMContentLoaded", function () {

    function getInitialsRegex(fullName) {
        if (!fullName) return "";
        const matches = fullName.match(/\b\w/g) || []; // Find the first letter of each word
        return matches.map(char => char.toUpperCase()).join('');
    }

    // Function to get the correct image path for static files in Django
    function getStaticImageUrl(imageName) {
        return `/static/images/${imageName}`; // Example: /static/images/user.png
    }

    const token = localStorage.getItem("access_token");
    const phoneNumber = localStorage.getItem("phone_number");

    // Pagination variables
    const usersPerPage = 10;
    let currentPage = 1;
    let allLeaderboardUsers = []; // To store all users for client-side pagination
    let currentUserData = null; // Store data.me here

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
        return response.json(); // Ensure it's parsed as JSON
    })
    .then(data => {
        console.log("✅ Leaderboard Data:", data);

        if (!data.top_10 || !Array.isArray(data.top_10)) {
            console.warn("Invalid data format: 'top_10' array is missing or malformed.");
        } else {
            allLeaderboardUsers = data.top_10; // Store all users
            currentUserData = data.me; // Store the 'me' data
            renderTopThreePerformers(allLeaderboardUsers); // Still render top 3 from all users
            renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
            setupPagination(allLeaderboardUsers.length); // Setup pagination controls
        }
        
        // Always attempt to display user's own stats if available
        if (data.me) {
            updateMyStats(data.me);
        }

    })
    .catch(error => {
        console.error("❌ Leaderboard Fetch Error:", error);
        // You might want to display a user-friendly error message on the page
        // alert("Something went wrong while loading leaderboard.");
    });

    // Function to update "My Stats" section
    function updateMyStats(me) {
        const myRankElement = document.getElementById("my_rank");
        const myPointsElement = document.getElementById("my_points");
        const myCompletedTasksElement = document.getElementById("my_complete_test");
        
        const progressPercentageElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector("h3");
        const nextRankPointsNeededElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector(".small span:last-child");
        const progressBarFillElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector(".progress-bar");
        const currentRankTextElement = document.querySelector("#my_complete_test").closest(".card-dark-bg").nextElementSibling?.querySelector(".small span:first-child");


        if (myRankElement) {
            myRankElement.innerText = `#${me.rank || '--'}`;
        }
        if (myPointsElement) {
            myPointsElement.innerText = `${me.points || '--'}`;
        }
        if (myCompletedTasksElement) {
            myCompletedTasksElement.innerText = `${me.attempts || '--'}/--`;
        }

        if (progressPercentageElement && me.progress_to_next_rank !== undefined) {
             progressPercentageElement.innerText = `${me.progress_to_next_rank}%`;
             if (progressBarFillElement) {
                progressBarFillElement.style.width = `${me.progress_to_next_rank}%`;
                progressBarFillElement.setAttribute('aria-valuenow', me.progress_to_next_rank);
             }
        } else if (progressPercentageElement) {
            progressPercentageElement.innerText = `--%`;
            if (progressBarFillElement) {
                progressBarFillElement.style.width = `0%`;
                progressBarFillElement.setAttribute('aria-valuenow', 0);
            }
        }

        if (currentRankTextElement && me.next_rank_details && me.next_rank_details.rank) {
            currentRankTextElement.innerText = `Rank #${me.next_rank_details.rank}`;
        } else if (currentRankTextElement) {
            currentRankTextElement.innerText = `Rank #--`;
        }

        if (nextRankPointsNeededElement && me.next_rank_details && me.next_rank_details.points_needed !== undefined) {
            nextRankPointsNeededElement.innerText = `${me.next_rank_details.points_needed} points needed`;
        } else if (nextRankPointsNeededElement) {
            nextRankPointsNeededElement.innerText = `-- points needed`;
        }
    }


    function renderTopThreePerformers(users) {
        if (!users || users.length === 0) {
            document.getElementById("top-performers").innerHTML = '<p class="text-white text-center">No top performers to display yet.</p>';
            return;
        }

        const top3 = users.slice(0, 3);
        const container = document.getElementById("top-performers");
        container.innerHTML = "";

        const gradients = [
            "linear-gradient(149.8deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)",
            "linear-gradient(149.78deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)",
            "linear-gradient(149.8deg, rgba(16, 38, 51, 0.9) 0%, rgba(11, 26, 38, 0.95) 100%)"
        ];

        const borders =[
            "1px solid #FFD700",
            "1px solid #0FFFE6",
            "1px solid #13E0B44D"
        ];

        const round_colors = [
            "#FFD700",
            "#C0C0C0",
            "#CD7F32"
        ];

        const round_dropshadows = [
            "0px 0px 20px 0px #CD7F3299",
            "0px 0px 20px 0px #C0C0C099",
            "0px 0px 20px 0px #CD7F3299"
        ];
        const dropshadows = [
            "0px 20px 20px 0px #FFD7004D",
            "0px 20px 20px 0px #00FFCC40",
            "0px 20px 20px 0px #00000066"
        ];

        const buttons_style =[
            "background: linear-gradient(75.81deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%); border: 1px solid #FFD700; color: #FFD700;",
            "background: linear-gradient(74.07deg, rgba(192, 192, 192, 0.3) 0%, rgba(192, 192, 192, 0.15) 100%); border: 1px solid #C0C0C0; color: #C0C0C0;",
            "background: linear-gradient(72.56deg, rgba(205, 127, 50, 0.3) 0%, rgba(205, 127, 50, 0.15) 100%); border: 1px solid #CD7F32; color: #CD7F32;"
        ];
        
        const displayOrderIndices = [1, 0, 2]; 

        displayOrderIndices.forEach((originalIndex, podiumPosition) => {
            const user = top3[originalIndex];
            if (!user) return;

            const profileImageSrc = user.profile_image ? user.profile_image : getStaticImageUrl('user.png');
            const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));

            const performerCol = document.createElement("div");
            if (podiumPosition === 0) {
                performerCol.className = "col-4 order-1 col-md-4 order-md-1"; 
            } else if (podiumPosition === 1) {
                performerCol.className = "col-4 order-0 col-md-4 order-md-0";
            } else if (podiumPosition === 2) {
                performerCol.className = "col-4 order-2 col-md-4 order-md-2";
            }


            performerCol.innerHTML = `
                <div class="position-relative p-3 text-center top-performer-card" 
                     style="background: ${gradients[originalIndex]}; border: ${borders[originalIndex]}; box-shadow: ${dropshadows[originalIndex]}; border-radius: 15px; margin: 10px auto; min-height: 300px; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                    <span class="position-absolute end-0 translate-middle badge rounded-pill text-white fw-bold" style="background-color:${round_colors[originalIndex]}; font-size: 24px; padding: 5px 10px; top: 39px;">
                        #${originalIndex + 1}
                    </span>
                    <div class="rounded-circle overflow-hidden mb-2" style="width: 100px; height: 100px; border: 4px solid ${round_colors[originalIndex]}; box-shadow: ${round_dropshadows[originalIndex]}; margin-top: 1.5rem;">
                        ${isValidImageUrl ? `<img src="${profileImageSrc}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div class="initials-avatar" style="width: 100%; height: 100%;">${getInitialsRegex(user.username)}</div>`}
                    </div>
                    <div class="text-white fw-bold mb-1">${user.username}</div>
                    <div class="text-light small mb-2">${user.course || 'N/A'}</div>
                    <div class="text-custom-gradient h3 fw-bold mb-4">${user.points} pts</div>
                    <button class="btn btn-sm rounded-pill" style="${buttons_style[originalIndex]} opacity: 0.8;">
                        ${originalIndex === 0 ? "Top Performer" : originalIndex === 1 ? "Fast Learner" : "Consistent"}
                    </button>
                </div>
            `;
            container.appendChild(performerCol);
        });
    }

    // Function to render a specific page of the leaderboard
    function renderLeaderboardPage(page, meData) { // Added meData parameter
        const leaderboardTableBody = document.getElementById("leaderboard-table-body");
        leaderboardTableBody.innerHTML = ""; // Clear existing content

        const startIndex = (page - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const usersToDisplay = allLeaderboardUsers.slice(startIndex, endIndex);

        let tableRowsHtml = '';

        usersToDisplay.forEach((user, index) => {
            const actualRank = startIndex + index + 1; // Calculate actual rank for the displayed user
            const isMeRow = (meData && user.username === meData.username); // Use meData here
            const rowClass = isMeRow ? "align-middle leaderboard-you-row" : "align-middle";
            
            const profileImageSrc = user.profile_image ? user.profile_image : getStaticImageUrl('user.png');
            const isValidImageUrl = profileImageSrc && (profileImageSrc.startsWith('http://') || profileImageSrc.startsWith('https://') || profileImageSrc.startsWith('/static/'));

            let badgeHtml = '';
            if (actualRank <= 3) {
                if (actualRank === 1) badgeHtml = `<span class="table-badge table-badge-top">Top Performer</span>`;
                else if (actualRank === 2) badgeHtml = `<span class="table-badge table-badge-fast">Fast Learner</span>`;
                else if (actualRank === 3) badgeHtml = `<span class="table-badge table-badge-consistent">Consistent</span>`;
            }
            if (user.badges && Array.isArray(user.badges)) {
                badgeHtml += user.badges.map(badge => `<span class="table-badge table-badge-${badge.toLowerCase().replace(/\s/g, '')}">${badge}</span>`).join(' ');
            }

            tableRowsHtml += `
                <tr class="${rowClass}">
                    <td class="px-4 py-3 text-sm fw-bold ${isMeRow ? 'text-info'  : 'text-gray-300'}">
                        ${actualRank <= 3 ? `<span class="d-inline-flex align-items-center justify-content-center ${actualRank === 1 ? 'bg-warning text-dark' : actualRank === 2 ? 'bg-info text-dark' : 'bg-primary text-dark'} rounded-circle me-2" style="width: 24px; height: 24px; font-size: 0.75rem;">${actualRank}</span>` : `#${actualRank}`}
                    </td>
                    <td class="px-4 py-3 text-sm ${isMeRow ? 'text-white' : 'text-white'}">
                        <div class="d-flex align-items-center">
                            ${isValidImageUrl ? 
                                `<img src="${profileImageSrc}" alt="${user.username}" class="profile-img-sm">` :
                                `<div class="initials-avatar profile-img-sm">${getInitialsRegex(user.username)}</div>`
                            }
                             ${user.username}
                        </div>
                    </td>
                    <td class="px-4 py-3 text-sm">${user.attempts || '--'}</td>
                    <td class="px-4 py-3 text-lg fw-bold ${isMeRow ? 'text-info' : 'text-white'}">${user.points}</td>
                    <td class="px-4 py-3 text-sm">
                        ${badgeHtml}
                    </td>
                </tr>`;
        });

        leaderboardTableBody.innerHTML = tableRowsHtml;
    }

    // Function to set up pagination controls
    function setupPagination(totalUsers) {
        const totalPages = Math.ceil(totalUsers / usersPerPage);
        const paginationContainer = document.getElementById("pagination-controls");
        paginationContainer.innerHTML = ''; // Clear existing controls

        if (totalPages <= 1) {
            return; // No need for pagination if only one page
        }

        const ul = document.createElement("ul");
        ul.className = "pagination justify-content-center";

        // Previous button
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">Previous</a>`;
        prevLi.addEventListener("click", function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
                setupPagination(totalUsers);
            }
        });
        ul.appendChild(prevLi);

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${currentPage === i ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", function(e) {
                e.preventDefault();
                currentPage = i;
                renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
                setupPagination(totalUsers);
            });
            ul.appendChild(li);
        }

        // Next button
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">Next</a>`;
        nextLi.addEventListener("click", function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderLeaderboardPage(currentPage, currentUserData); // Pass currentUserData
                setupPagination(totalUsers);
            }
        });
        ul.appendChild(nextLi);

        paginationContainer.appendChild(ul);
    }
});