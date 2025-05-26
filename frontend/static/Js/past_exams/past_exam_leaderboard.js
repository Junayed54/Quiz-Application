document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("access_token");
    
    if (!accessToken) {
        alert("No access token found. Please log in.");
        return;
    }

    function getInitialsRegex(fullName) {
        const matches = fullName.match(/\b\w/g) || []; // Find the first letter of each word
        return matches.map(char => char.toUpperCase()).join('');
    }

    fetch("/api/practice/leaderboard/", {
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
        renderLeaderboard(data.top_10, data.me);
    })
    .catch(error => {
        console.error("❌ Leaderboard Fetch Error:", error);
        // alert("Something went wrong while loading leaderboard.");
    });

    function renderLeaderboard(top10, me) {
        const leaderboardList = document.getElementById("rank-list");
        // leaderboardList.innerHTML = "";

        top10.forEach((user, index) => {
            leaderboardList.innerHTML += `
            <tr  class="rank-row" style=" background: #1e293b;">
                <td>#${index+1}</td>
                <td class="d-flex align-items-center" style="gap: 5px;"><div style="width: 45px; height:45px;" class="border bg-secondary rounded-circle text-center"><div class="d-flex justify-content-center align-items-center pt-2">${getInitialsRegex(user.username)}</div></div><div><h6>${user.username}</h6><span class="text-secondary" style="font-size: 15px;">${user.points}</span></div></td>
                <td>${user.attempts}</td>
                <td>${user.points}</td>
                <td>${user.points}%</td>
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
