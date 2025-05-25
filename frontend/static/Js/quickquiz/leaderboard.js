document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("access_token");
    
    if (!accessToken) {
        alert("No access token found. Please log in.");
        return;
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
            <tr>
                <td>#${index+1}</td>
                <td>${user.username}</td>
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
