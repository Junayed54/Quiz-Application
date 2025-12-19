// =================================================================
// WORD GAME SCRIPT (CUSTOM MODAL VERSION)
// Features: M:SS Timer, Fixed Drag-and-Drop, Custom UI Modal
// =================================================================

gsap.registerPlugin(Draggable);

// ================= GAME STATE =================
let currentWord = "";
let currentWordArr = [];
let score = 0;
let timeLeft = 210; // 3 minutes 30 seconds
let timerInterval;
let gameOver = false;

const cellSize = 50;
const cellGap = 6;
const cellDistance = cellSize + cellGap; 

// ================= API ENDPOINTS =================
const API_WORD_URL = "/api/puzzles/1/word/"; 
const API_SUBMIT_URL = "/api/word-game/submit/"; 

// ================= DOM ELEMENTS =================
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const userModal = document.getElementById("userModal"); // Custom Modal ID
const scoreDisplay = document.getElementById("scoreDisplay");
const timeDisplay = document.getElementById("timerDisplay");
const finalScore = document.getElementById("finalScore");
const slotsContainer = document.getElementById("slotsContainer");
const tilesContainer = document.getElementById("tilesContainer");
const boardContainer = document.querySelector(".board-container");
const skipButton = document.getElementById("skipButton"); 

// ================= UTILITY FUNCTIONS =================

function centerBoard(numLetters) {
    const containerWidth = slotsContainer.offsetWidth || 350; 
    const wordWidth = (cellDistance * (numLetters - 1)) + cellSize;
    return (containerWidth - wordWidth) / 2;
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ================= FETCH WORD =================
async function fetchNewWord() {
    try {
        const res = await fetch(API_WORD_URL);
        const data = await res.json();

        if (!data?.data?.text) {
            endGame(); 
            return;
        }

        currentWord = data.data.text.toUpperCase();
        currentWordArr = currentWord.split("");
        renderBoard();
    } catch (err) {
        console.error("API Error:", err);
        endGame();
    }
}

// ================= RENDER UI =================
function renderBoard() {
    slotsContainer.innerHTML = "";
    tilesContainer.innerHTML = "";

    let shuffled = gsap.utils.shuffle([...currentWordArr]);
    while (shuffled.join('') === currentWordArr.join('')) {
        shuffled = gsap.utils.shuffle([...currentWordArr]);
    }
    
    const left = centerBoard(currentWordArr.length);

    currentWordArr.forEach((_, i) => {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.id = `slot-${i}`;
        slot.style.width = `${cellSize}px`;
        slot.style.height = `${cellSize}px`;
        slot.style.left = `${left}px`;
        slot.style.backgroundColor = '#FF7B33'; 
        gsap.set(slot, { x: i * cellDistance });
        slotsContainer.appendChild(slot);
    });

    shuffled.forEach((letter, i) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.id = `tile-${i}`;
        tile.textContent = letter;
        tile.dataset.letter = letter;
        tile.style.width = `${cellSize - 4}px`;
        tile.style.height = `${cellSize - 4}px`;
        tile.style.left = `${left + 2}px`;
        tile.style.cursor = 'grab';
        gsap.set(tile, { x: i * cellDistance, y: 0 });
        tilesContainer.appendChild(tile);
    });

    setTimeout(enableDrag, 100); 
}

// ================= DRAG & SWAP LOGIC =================
function enableDrag() {
    let lastHitTile = null; 
    let emptyX = 0; 

    const currentDraggables = Draggable.get(".tile");
    if (currentDraggables) {
        (Array.isArray(currentDraggables) ? currentDraggables : [currentDraggables]).forEach(d => d.kill());
    }
    
    Draggable.create(".tile", {
        type: "x,y",
        bounds: boardContainer,
        onPress() {
            emptyX = gsap.getProperty(this.target, "x");
            lastHitTile = null;
            gsap.to(this.target, { scale: 1.1, zIndex: 50 });
        },
        onDrag() {
            const currentTile = this.target;
            document.querySelectorAll(".tile").forEach(targetTile => {
                if (currentTile === targetTile) return;
                if (Draggable.hitTest(currentTile, targetTile, "50%")) {
                    if (targetTile === lastHitTile) return; 
                    lastHitTile = targetTile;
                    const targetX = gsap.getProperty(targetTile, "x");
                    gsap.to(targetTile, { x: emptyX, duration: 0.15, ease: 'power2.out'});
                    emptyX = targetX;
                }
            });
        },
        onRelease() {
            gsap.to(this.target, {
                x: emptyX, y: 0, scale: 1, zIndex: 1,
                duration: 0.2, ease: 'power2.out',
                onComplete: checkAnswer
            });
        }
    });
}

// ================= CHECK ANSWER =================
function checkAnswer() {
    const tiles = [...document.querySelectorAll(".tile")]
        .map(t => ({ x: gsap.getProperty(t, "x"), letter: t.dataset.letter }))
        .sort((a, b) => a.x - b.x);

    const answer = tiles.map(t => t.letter).join("");
    
    currentWordArr.forEach((l, i) => {
        const slot = document.getElementById(`slot-${i}`);
        if(slot) {
            gsap.to(slot, {
                backgroundColor: answer[i] === l ? "#3CFA3C" : "#FF7B33", 
                duration: 0.3
            });
        }
    });

    if (answer === currentWord) {
        score++;
        scoreDisplay.textContent = score;
        const draggables = Draggable.get(".tile");
        if (draggables) {
            (Array.isArray(draggables) ? draggables : [draggables]).forEach(d => d.disable());
        }

        gsap.timeline({ onComplete: () => fetchNewWord() })
            .to(".tile", { scale: 1.16, duration: 0.35 })
            .to(".tile", { opacity: 0, scale: 1, duration: 0.2 });
    }
}

// ================= GAME CORE =================
function skipWord() {
    if (gameOver) return;
    gsap.to(".tile", { opacity: 0, scale: 0.5, duration: 0.2, onComplete: fetchNewWord });
}

if (skipButton) skipButton.addEventListener('click', skipWord);

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = formatTime(timeLeft); 
        if (timeLeft <= 0) endGame();
    }, 1000);
}

// ================= CUSTOM SUBMISSION FLOW =================

async function endGame() {
    if (gameOver) return; 
    gameOver = true;
    clearInterval(timerInterval);

    finalScore.textContent = score;
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    // Decision logic for Custom Modal
    checkSubmissionStatus();
}

function checkSubmissionStatus() {
    const token = localStorage.getItem("access_token");
    const existingName = localStorage.getItem("username");

    // If logged in OR guest info already exists, submit automatically
    if (token || existingName) {
        submitScoreToAPI();
    } else {
        // Raise the Custom Modal
        if (userModal) userModal.classList.remove("hidden");
    }
}

async function handleCustomFormSubmit() {
    const nameInput = document.getElementById("guestName");
    const phoneInput = document.getElementById("guestPhone");

    const username = nameInput.value.trim();
    const phone_number = phoneInput.value.trim();

    if (!username || !phone_number) {
        alert("Please enter both name and phone number.");
        return;
    }

    // Save for next session
    localStorage.setItem("username", username);
    localStorage.setItem("phone_number", phone_number);

    // Hide Modal and Submit
    if (userModal) userModal.classList.add("hidden");
    await submitScoreToAPI();
}

function closeUserModal() {
    if (userModal) userModal.classList.add("hidden");
}

async function submitScoreToAPI() {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const phone = localStorage.getItem("phone_number");
    
    let payload = { score: score };
    let headers = { "Content-Type": "application/json" };

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    } else {
        payload.username = username;
        payload.phone_number = phone;
    }

    try {
        const res = await fetch(API_SUBMIT_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log("Score saved successfully");
            // Optional: Show a small toast or non-intrusive message
        }
    } catch (err) {
        console.error("Submission failed", err);
    }
}

// ================= GAME FLOW =================
function startGame() {
    score = 0;
    timeLeft =  180; 
    gameOver = false;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = formatTime(timeLeft); 

    gameOverScreen.classList.add("hidden");
    if (userModal) userModal.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    fetchNewWord();
    startTimer();
}

function playAgain() { startGame(); }
function goHome() { window.location.href = "/word-games/"; }
function goToLeaderboard() { window.location.href = "/word-games/leaderboard/"; }

document.addEventListener('DOMContentLoaded', startGame);