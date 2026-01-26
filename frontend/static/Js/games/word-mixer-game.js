gsap.registerPlugin(Draggable);

// ================= GAME STATE =================
let currentWord = "";
let currentWordData = null; // Stores full object (meaning, examples)
let currentWordArr = [];
let solvedWords = []; 
let seenWordIds = [];
let score = 0;
let timeLeft = 180; // 3 Minutes
let timerInterval;
let gameOver = false;

const cellSize = 55;
const cellGap = 8;
const cellDistance = cellSize + cellGap;

// ================= API CONFIG =================
const API_WORD_URL = "/api/puzzles/1/word/"; 
const API_SUBMIT_URL = "/api/word-game/submit/"; 

// ================= DOM ELEMENTS =================
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const userModal = document.getElementById("userModal");
const scoreDisplay = document.getElementById("scoreDisplay");
const timeDisplay = document.getElementById("timerDisplay");
const finalScore = document.getElementById("finalScore");
const slotsContainer = document.getElementById("slotsContainer");
const tilesContainer = document.getElementById("tilesContainer");
const solvedWordsList = document.getElementById("solvedWordsList");

// ================= UTILITY FUNCTIONS =================

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// function speakWord(word) {
//     const utterance = new SpeechSynthesisUtterance(word);
//     utterance.lang = 'en-US';
//     utterance.rate = 0.9;
//     window.speechSynthesis.speak(utterance);
// }


// function speakWord(word) {
//     if (window.flutter_inappwebview) {
//         window.flutter_inappwebview.callHandler('speak', word);
//     } else {
//         // Browser fallback
//         const utterance = new SpeechSynthesisUtterance(word);
//         utterance.lang = 'en-US';
//         utterance.rate = 0.9;
//         window.speechSynthesis.speak(utterance);
//     }
// }



function speakWord(word) {
    if (window.TTS) {
        // Flutter WebView
        TTS.postMessage(word);
    } else if ('speechSynthesis' in window) {
        // Desktop browser
        const u = new SpeechSynthesisUtterance(word);
        speechSynthesis.speak(u);
    } else {
        alert("Speech not supported");
    }
}

// ================= API FETCH =================

async function fetchNewWord() {
    try {
        let url = `${API_WORD_URL}?`;
        seenWordIds.forEach(id => url += `exclude[]=${id}&`);

        const res = await fetch(url);
        const data = await res.json();

        if (!data?.data?.text) {
            endGame(); 
            return;
        }

        currentWordData = data.data; // Store full object (meaning, example, example_bn)
        seenWordIds.push(currentWordData.id);
        currentWord = currentWordData.text.toUpperCase();
        currentWordArr = currentWord.split("");
        renderBoard();
    } catch (err) {
        console.error("API Error:", err);
        endGame();
    }
}

// ================= RENDER BOARD =================

// --- Update these in your JS ---

function getResponsiveCellSize(numLetters) {
    const screenWidth = window.innerWidth;
    const containerPadding = 40; // Total horizontal padding
    const availableWidth = Math.min(screenWidth, 900) - containerPadding;
    
    // Calculate max possible size per cell including gaps
    let calculatedSize = Math.floor(availableWidth / numLetters) - cellGap;
    
    // Clamp the size: Minimum 35px (for readability), Maximum 55px (for desktop)
    return Math.max(35, Math.min(55, calculatedSize));
}

function renderBoard() {
    slotsContainer.innerHTML = "";
    tilesContainer.innerHTML = "";

    // 1. Get the new cell size based on word length
    const dynamicCellSize = getResponsiveCellSize(currentWordArr.length);
    const dynamicCellDist = dynamicCellSize + cellGap;

    let shuffled = gsap.utils.shuffle([...currentWordArr]);
    while (shuffled.join('') === currentWordArr.join('')) {
        shuffled = gsap.utils.shuffle([...currentWordArr]);
    }
    
    const containerWidth = slotsContainer.offsetWidth || 350;
    const totalWordWidth = (dynamicCellDist * (currentWordArr.length - 1)) + dynamicCellSize;
    const left = (containerWidth - totalWordWidth) / 2;

    currentWordArr.forEach((_, i) => {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.id = `slot-${i}`;
        // Apply dynamic size
        slot.style.width = slot.style.height = `${dynamicCellSize}px`;
        slot.style.left = `${left}px`;
        gsap.set(slot, { x: i * dynamicCellDist });
        slotsContainer.appendChild(slot);
    });

    shuffled.forEach((letter, i) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.id = `tile-${i}`;
        tile.textContent = letter;
        tile.dataset.letter = letter;
        // Apply dynamic size (slightly smaller than slot for margin)
        tile.style.width = tile.style.height = `${dynamicCellSize - 4}px`;
        tile.style.left = `${left + 2}px`;
        // Handle font size for very small tiles
        tile.style.fontSize = dynamicCellSize < 45 ? "1.2rem" : "1.6rem";
        
        gsap.set(tile, { x: i * dynamicCellDist, y: 0 });
        tilesContainer.appendChild(tile);
    });

    setTimeout(enableDrag, 100); 
}

// ================= DRAG & SWAP LOGIC =================

function enableDrag() {
    let lastHitTile = null; 
    let emptyX = 0; 

    Draggable.create(".tile", {
        type: "x,y",
        onPress() {
            emptyX = gsap.getProperty(this.target, "x");
            lastHitTile = null;
            gsap.to(this.target, {zIndex: 50 });
        },
        onDrag() {
            const currentTile = this.target;
            document.querySelectorAll(".tile").forEach(targetTile => {
                if (currentTile === targetTile) return;
                if (Draggable.hitTest(currentTile, targetTile, "50%")) {
                    if (targetTile === lastHitTile) return; 
                    lastHitTile = targetTile;
                    const targetX = gsap.getProperty(targetTile, "x");
                    gsap.to(targetTile, { x: emptyX, duration: 0.2, ease: 'power2.out'});
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

        // Save rich data for the list
        solvedWords.push({
            word: currentWord,
            meaning: currentWordData.meaning_bn || "No meaning",
            example: currentWordData.example_en || "No example",
            exampleBN: currentWordData.example_bn || ""
        });

        gsap.timeline({ onComplete: () => fetchNewWord() })
            .to(".tile", { scale: 1.16, duration: 0.35 })
            .to(".tile", { opacity: 0, scale: 0.5, duration: 0.2 });
    }
}

// ================= END GAME & MODAL =================

function endGame() {
    if (gameOver) return; 
    gameOver = true;
    clearInterval(timerInterval);

    finalScore.textContent = score;
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    renderSolvedWords();
    checkSubmissionStatus();
}

function renderSolvedWords() {
    solvedWordsList.innerHTML = '';

    if (solvedWords.length === 0) {
        solvedWordsList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No words solved yet.</p>';
        return;
    }

    solvedWords.forEach(item => {
        const wordItem = document.createElement('div');
        wordItem.className = 'solved-word-item';
        wordItem.innerHTML = `
            <div class="word-info">
                <div class="word-main">
                    <span class="word-en">${item.word}</span>
                    <span class="word-bn">(${item.meaning})</span>
                </div>
                <div class="word-example-container">
                    <p class="word-example">"${item.example}"</p>
                    <p class="word-example-bn">${item.exampleBN}</p>
                </div>
            </div>
            <button class="speaker-btn" onclick="speakWord('${item.word}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke-linecap="round"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        solvedWordsList.appendChild(wordItem);
    });
}

// ================= SCORE SUBMISSION =================

function checkSubmissionStatus() {
    const token = localStorage.getItem("access_token");
    const existingName = localStorage.getItem("username");

    if (token || existingName) {
        submitScoreToAPI();
    } else {
        if (userModal) userModal.classList.remove("hidden");
    }
}

async function handleCustomFormSubmit() {
    const username = document.getElementById("guestName").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();

    if (!username || !phone) {
        alert("Please enter both name and phone number.");
        return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("phone_number", phone);

    if (userModal) userModal.classList.add("hidden");
    await submitScoreToAPI();
}

async function submitScoreToAPI() {
    const token = localStorage.getItem("access_token");
    const payload = {
        puzzle_id: 1, 
        score: score,
        username: localStorage.getItem("username"),
        phone_number: localStorage.getItem("phone_number")
    };

    let headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;

    try {
        await fetch(API_SUBMIT_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Submission failed", err);
    }
}

// ================= GAME CORE =================

function startGame() {
    score = 0;
    timeLeft = 180; 
    gameOver = false;
    solvedWords = [];
    seenWordIds = [];

    scoreDisplay.textContent = score;
    timeDisplay.textContent = formatTime(timeLeft); 

    gameOverScreen.classList.add("hidden");
    if (userModal) userModal.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    fetchNewWord();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = formatTime(timeLeft); 
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function skipWord() {
    if (gameOver) return;
    gsap.to(".tile", { opacity: 0, scale: 0.5, duration: 0.2, onComplete: fetchNewWord });
}

function closeUserModal() {
    if (userModal) userModal.classList.add("hidden");
}

function playAgain() { startGame(); }
function goHome() { window.location.href = "/word-games/"; }
function goToLeaderboard() { window.location.href = "/word-games/leaderboard/"; }

document.getElementById("skipButton").addEventListener('click', skipWord);
document.addEventListener('DOMContentLoaded', startGame);