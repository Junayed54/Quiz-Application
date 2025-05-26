document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("access_token");
    
    if (!accessToken) {
        alert("No access token found. Please log in.");
        window.path.location = "/login/";
        return;
    }
    const path =  window.location.pathname; 

    const examId = path.split('/')[3];
    
    console.log(examId);
    function getInitialsRegex(fullName) {
        const matches = fullName.match(/\b\w/g) || []; // Find the first letter of each word
        return matches.map(char => char.toUpperCase()).join('');
    }

    fetch(`/quiz/past-exam/${examId}/leaderboard/`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
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
    function displayCurrentMonthYear() {
        const now = new Date();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const formatted = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        document.getElementById("month").textContent = formatted;
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

        const performerCard = document.createElement("div");
        performerCard.className = "col text-center";

        performerCard.innerHTML = `
            <div class="position-relative d-inline-block">
                <div class="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style="width: 80px; height: 80px; background: ${gradients[podiumIndex]}; overflow: hidden;">
                    ${hasImage ? `
                        <img src="${profileImage}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;">
                    ` : `
                        <span class="text-white fw-bold fs-4">${initials}</span>
                    `}
                </div>
                <span class="position-absolute top-0 end-0 bg-white rounded-pill px-2 small shadow">
                    ${["🥈", "🥇", "🥉"][podiumIndex]}
                </span>
            </div>
            <div class="mt-2 fw-semibold text-white">${user.username}</div>
            <div class="text-light small">${user.points} pts</div>
        `;

        container.appendChild(performerCard);
    });
}



    function renderLeaderboard(top10, me) {
        console.log("me", me, "top 10", top10);
        const leaderboardList = document.getElementById("rank-list");
        // leaderboardList.innerHTML = "";

        top10.forEach((user, index) => {
            leaderboardList.innerHTML += `
            <tr  class="rank-row p-4">
                <td>#${index+1}</td>
                <td class="d-flex align-items-center mt-2" style="gap: 10px;"><div style="width: 45px; height:45px;" class="border bg-secondary rounded-circle text-center"><div class="d-flex justify-content-center align-items-center pt-2">${getInitialsRegex(user.username)}</div></div><div><h6>${user.username}</h6><span class="text-secondary" style="font-size: 15px;">${user.points}</span></div></td>
                <td>${user.attempts}</td>
                <td>${user.points}</td>
                <td>${user.percentage}%</td>
            </tr>`
            // <div class="rank-row">
            //     <div class="row align-items-center text-center">
            //             <div class="col">#</div>
            //             <div class="col">div>
            //             <div class="col"></div>
            //             <div class="col"></div>
            //             <div class="col text-success">↑</div>
            //     </div>
            // </div>`
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
