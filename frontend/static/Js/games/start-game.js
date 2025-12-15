// // Game State
// let score = 0;
// let timeLeft = 180000; // 3 minutes in milliseconds
// let gameOver = false;
// let currentWord = '';
// let currentWordArr = [];
// let mixedArr = [];
// let currentTile = null;
// let emptySlot = null;
// let timerInterval = null;
// let wordsUsed = new Set();

// const cellSize = 50;
// const cellDistance = cellSize + 6;

// // DOM Elements
// const gameScreen = document.getElementById('gameScreen');
// const gameOverScreen = document.getElementById('gameOverScreen');
// const scoreDisplay = document.getElementById('scoreDisplay');
// const timerDisplay = document.getElementById('timerDisplay');
// const finalScore = document.getElementById('finalScore');
// const slotsContainer = document.getElementById('slotsContainer');
// const tilesContainer = document.getElementById('tilesContainer');
// const boardContainer = document.querySelector('board-container');

// // Register GSAP Plugin
// gsap.registerPlugin(Draggable);

// // Initialize Game
// document.addEventListener('DOMContentLoaded', () => {
//   startGame();
// });

// function startGame() {
//   // Start timer
//   timerInterval = setInterval(() => {
//     timeLeft -= 10;
//     updateTimer();

//     if (timeLeft <= 0) {
//       endGame();
//     }
//   }, 10);

//   dealNewWord();
// }

// function dealNewWord() {
//   // Get a random word that hasn't been used yet
//   let availableWords = words_filter.filter(word => !wordsUsed.has(word));

//   if (availableWords.length === 0) {
//     // Reset if all words used
//     wordsUsed.clear();
//     availableWords = [...words_filter];
//   }

//   const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
//   wordsUsed.add(randomWord);

//   const wordArr = randomWord.toUpperCase().split('');
//   currentWordArr = wordArr;
//   currentWord = randomWord;

//   // Shuffle the letters using GSAP shuffle utility
//   let shuffled = gsap.utils.shuffle([...wordArr]);
//   while (shuffled.join('') === wordArr.join('')) {
//     shuffled = gsap.utils.shuffle([...wordArr]);
//   }
//   mixedArr = shuffled;

//   const numLetters = wordArr.length;
//   const containerWidth = slotsContainer.offsetWidth || 350;
//   const leftSide = (containerWidth - ((cellDistance * (numLetters - 1)) + cellSize)) / 2;

//   // Clear existing content
//   slotsContainer.innerHTML = '';
//   tilesContainer.innerHTML = '';

//   // Create slots
//   wordArr.forEach((_, i) => {
//     const slot = document.createElement('div');
//     slot.className = 'slot';
//     slot.id = `slot-${i}`;
//     slot.style.width = `${cellSize}px`;
//     slot.style.height = `${cellSize}px`;
//     slot.style.left = `${leftSide}px`;
//     slot.style.backgroundColor = '#FF7B33';
//     gsap.set(slot, { x: i * cellDistance });
//     slotsContainer.appendChild(slot);
//   });

//   // Create tiles
//   shuffled.forEach((letter, i) => {
//     const tile = document.createElement('div');
//     tile.className = 'tile';
//     tile.id = `tile-${i}`;
//     tile.textContent = letter;
//     tile.setAttribute('data-letter', letter);
//     tile.style.width = `${cellSize - 4}px`;
//     tile.style.height = `${cellSize - 4}px`;
//     tile.style.left = `${leftSide + 2}px`;
//     tile.style.backgroundColor = 'white';
//     tile.style.color = '#430676';
//     tile.style.cursor = 'grab';
//     gsap.set(tile, { x: i * cellDistance, y: 0 });
//     tilesContainer.appendChild(tile);
//   });

//   // Setup draggable after tiles are created
//   setTimeout(() => {
//     setupDraggable(numLetters);
//     checkAnswer(numLetters);
//   }, 100);
// }

// function setupDraggable(numLetters) {
//   let lastHitTile = null;
//   let dragThrottle = false;

//   Draggable.create('.tile', {
//     type: 'x,y',
//     bounds: boardContainer,
//     onPress: function () {
//       currentTile = this.target;
//       emptySlot = gsap.getProperty(this.target, 'x');
//       lastHitTile = null;
//       gsap.to(this.target, { scale: 1.1, duration: 0.15, zIndex: 100 });
//     },
//     onDrag: function () {
//       // Throttle hitTest checks for better performance
//       if (dragThrottle) return;
//       dragThrottle = true;

//       requestAnimationFrame(() => {
//         for (let i = 0; i < numLetters; i++) {
//           const targetId = `tile-${i}`;
//           if (currentTile.id !== targetId) {
//             const targetTile = document.getElementById(targetId);

//             // Skip if we already swapped with this tile
//             if (targetTile && targetTile !== lastHitTile &&
//               Draggable.hitTest(currentTile, targetTile, '50%')) {

//               lastHitTile = targetTile;
//               const targetX = gsap.getProperty(targetTile, 'x');

//               // Smoothly swap positions
//               gsap.to(targetTile, {
//                 x: emptySlot,
//                 duration: 0.15,
//                 ease: 'power2.out'
//               });

//               emptySlot = targetX;
//               break;
//             }
//           }
//         }
//         dragThrottle = false;
//       });
//     },
//     onRelease: function () {
//       gsap.to(this.target, {
//         x: emptySlot,
//         y: 0,
//         scale: 1,
//         zIndex: 1,
//         duration: 0.2,
//         ease: 'power2.out',
//         onComplete: () => {
//           lastHitTile = null;
//           checkAnswer(numLetters);
//         }
//       });
//     }
//   });
// }

// function checkAnswer(numLetters) {
//   const tiles = [];
//   for (let i = 0; i < numLetters; i++) {
//     const tile = document.getElementById(`tile-${i}`);
//     if (tile) {
//       tiles.push({
//         x: gsap.getProperty(tile, 'x'),
//         letter: tile.getAttribute('data-letter') || tile.textContent
//       });
//     }
//   }

//   tiles.sort((a, b) => a.x - b.x);
//   const currentAnswer = tiles.map(t => t.letter).join('');

//   // Update slot colors
//   for (let i = 0; i < numLetters; i++) {
//     const slot = document.getElementById(`slot-${i}`);
//     if (slot) {
//       if (currentAnswer[i] === currentWordArr[i]) {
//         gsap.to(slot, { backgroundColor: '#3CFA3C', duration: 0.3 });
//       } else {
//         gsap.to(slot, { backgroundColor: '#FF7B33', duration: 0.3 });
//       }
//     }
//   }

//   // Check if complete word is correct
//   if (currentAnswer === currentWordArr.join('')) {
//     // Correct answer!
//     score++;
//     scoreDisplay.textContent = score;
//     timeLeft = Math.min(timeLeft + 1000, 180000); // Add 1 second bonus, max 3 minutes

//     // Disable dragging
//     const draggables = Draggable.get('.tile');
//     if (draggables) {
//       if (Array.isArray(draggables)) {
//         draggables.forEach(d => d.disable());
//       } else {
//         draggables.disable();
//       }
//     }

//     // Success animation
//     gsap.timeline({
//       onComplete: () => dealNewWord()
//     })
//       .to('.tile', { scale: 1.16, duration: 0.35 })
//       .to('.tile', { opacity: 0, scale: 1, duration: 0.2 });
//   }
// }

// function skipWord() {
//   dealNewWord();
// }

// function updateTimer() {
//   const totalSeconds = Math.floor(timeLeft / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;
//   timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
// }

// function endGame() {
//   gameOver = true;
//   if (timerInterval) {
//     clearInterval(timerInterval);
//   }

//   // Show game over screen
//   gameScreen.classList.add('hidden');
//   gameOverScreen.classList.remove('hidden');
//   finalScore.textContent = score;
// }

// function playAgain() {
//   // Reset game state
//   score = 0;
//   timeLeft = 180000;
//   gameOver = false;
//   wordsUsed.clear();

//   // Update displays
//   scoreDisplay.textContent = score;
//   updateTimer();

//   // Show game screen
//   gameOverScreen.classList.add('hidden');
//   gameScreen.classList.remove('hidden');

//   // Start new game
//   startGame();
// }

// function goHome() {
//   window.location.href = '/word-games/';
// }

// =================================================================
// WORD GAME SCRIPT (FINAL VERSION - SUBMISSION RE-ENABLED)
// Features: M:SS Timer, Fixed Drag-and-Drop/Word Change, 
//           API Submission with SweetAlert Modal Form for Guest Users.
// =================================================================

// Ensure GSAP plugins are registered (requires gsap.min.js and Draggable.min.js)
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
const cellDistance = cellSize + cellGap; // 56

// ================= API ENDPOINTS =================
const API_WORD_URL = "http://161.97.141.58:8005/api/puzzles/1/word/"; 
const API_SUBMIT_URL = "/api/word-game/submit/"; 

// ================= DOM ELEMENTS =================
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
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
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
}

/**
 * Shows the SweetAlert modal form for Name and Phone Number. (REINSTATED)
 */
async function promptForUserInfo() {
    const { value: formValues } = await Swal.fire({
        title: 'Enter Your Details',
        text: 'To submit your score, please provide your name and phone number.',
        html:
            '<input id="swal-input-name" class="swal2-input" placeholder="Your Name" required>' +
            '<input id="swal-input-phone" class="swal2-input" placeholder="Phone Number" type="tel" pattern="[0-9]{10,15}" required>',
        focusConfirm: false,
        allowOutsideClick: false, 
        preConfirm: () => {
            const username = document.getElementById('swal-input-name').value.trim();
            const phone_number = document.getElementById('swal-input-phone').value.trim();

            if (!username || !phone_number) {
                Swal.showValidationMessage('Please enter both your name and phone number.');
                return false;
            }

            return { username, phone_number };
        }
    });

    if (formValues) {
        return formValues;
    }
    throw new Error("User cancelled score submission.");
}

// ================= FETCH WORD =================
async function fetchNewWord() {
    try {
        const res = await fetch(API_WORD_URL);
        const data = await res.json();

        if (!data?.data?.text) {
            console.warn("API returned no word or invalid data structure. Ending game.");
            endGame(); 
            return;
        }

        currentWord = data.data.text.toUpperCase();
        currentWordArr = currentWord.split("");

        renderBoard();
    } catch (err) {
        console.error("Word API error. Check network or CORS settings:", err);
        console.error('Could not load a new word. Game ending.', err);
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
        const draggablesToKill = Array.isArray(currentDraggables) ? currentDraggables : [currentDraggables];
        draggablesToKill.forEach(d => d.kill());
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

                    gsap.to(targetTile, { 
                        x: emptyX, 
                        duration: 0.15,
                        ease: 'power2.out'
                    });

                    emptyX = targetX;
                }
            });
            
            if (lastHitTile && !Draggable.hitTest(currentTile, lastHitTile, "50%")) {
                lastHitTile = null;
            }
        },

        onRelease() {
            gsap.to(this.target, {
                x: emptyX,
                y: 0, 
                scale: 1,
                zIndex: 1,
                duration: 0.2,
                ease: 'power2.out',
                onComplete: checkAnswer
            });
        }
    });
}

// ================= CHECK ANSWER =================
function checkAnswer() {
    const tiles = [...document.querySelectorAll(".tile")]
        .map(t => ({
            x: gsap.getProperty(t, "x"),
            letter: t.dataset.letter
        }))
        .sort((a, b) => a.x - b.x);

    const answer = tiles.map(t => t.letter).join("");
    let isCorrect = answer === currentWord;

    currentWordArr.forEach((l, i) => {
        const slot = document.getElementById(`slot-${i}`);
        gsap.to(slot, {
            backgroundColor: answer[i] === l ? "#3CFA3C" : "#FF7B33", 
            duration: 0.3
        });
    });

    if (isCorrect) {
        score++;
        scoreDisplay.textContent = score;

        const currentDraggables = Draggable.get(".tile");
        if (currentDraggables) {
            const draggablesToDisable = Array.isArray(currentDraggables) ? currentDraggables : [currentDraggables];
            draggablesToDisable.forEach(d => d.disable());
        }

        // Automatic word change logic
        gsap.timeline({
            onComplete: () => fetchNewWord() 
        })
            .to(".tile", { scale: 1.16, duration: 0.35 })
            .to(".tile", { opacity: 0, scale: 1, duration: 0.2 });
    }
}

// ================= GAME MECHANICS =================

function skipWord() {
    if (gameOver) return;

    gsap.timeline({
        onComplete: () => fetchNewWord() 
    })
    .to(".tile", { opacity: 0, scale: 0.5, duration: 0.2 });
}

if (skipButton) {
    skipButton.addEventListener('click', skipWord);
}


// ================= TIMER =================
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = formatTime(timeLeft); 

        if (timeLeft <= 0) endGame();
    }, 1000);
}

// ================= SCORE SUBMISSION (RE-ENABLED) =================
async function submitScoreToAPI() {
    const token = localStorage.getItem("access_token");
    let username = localStorage.getItem("username");
    let phone = localStorage.getItem("phone_number");
    let payload = { score: score };
    let submissionSuccess = false;

    // 1. Authenticated User (Token exists)
    if (token) {
        try {
            const res = await fetch(API_SUBMIT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                submissionSuccess = true;
                Swal.fire('Score Submitted!', 'Your score has been saved.', 'success');
            } else {
                console.error("Token submission failed with status:", res.status);
            }
        } catch (err) {
            console.error("Token submission failed:", err);
        }
    }
    
    if (submissionSuccess) return;

    // 2. Guest User Logic: Show Modal Form if details are MISSING
    if (!username || !phone) {
        try {
            // *** MODAL FORM PROMPT IS HERE ***
            const userInfo = await promptForUserInfo(); 
            username = userInfo.username;
            phone = userInfo.phone_number;
            localStorage.setItem("username", username);
            localStorage.setItem("phone_number", phone);
        } catch (error) {
            console.warn("Score submission cancelled by user.", error);
            Swal.fire('Submission Cancelled', 'Your score was not saved to the leaderboard.', 'info');
            return; 
        }
    }

    // 3. Final Guest Submission (Details are now guaranteed)
    payload.username = username;
    payload.phone_number = phone;

    try {
        const res = await fetch(API_SUBMIT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            Swal.fire('Score Submitted!', `Thanks, ${username}. Your best score is now ${data.score}!`, 'success');
        } else {
            const errorData = await res.json();
            Swal.fire('Error', errorData.error || 'Failed to submit score to the server.', 'error');
        }
    } catch (err) {
        console.error("Guest submission failed:", err);
        Swal.fire('Error', 'Network error during submission.', 'error');
    }
}

// ================= END GAME =================
async function endGame() {
    if (gameOver) return; 
    gameOver = true;
    clearInterval(timerInterval);

    // Show game over screen with the score
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
    finalScore.textContent = score;

    // Trigger score submission which handles the modal form prompt
    await submitScoreToAPI();
}

// ================= GAME FLOW =================
function startGame() {
    score = 0;
    timeLeft = 20; 
    gameOver = false;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = formatTime(timeLeft); 

    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    fetchNewWord();
    startTimer();
}

// ================= BUTTON HANDLERS =================
function playAgain() {
    startGame();
}

function goHome() {
    window.location.href = "/word-games/";
}

// ================= START GAME =================
document.addEventListener('DOMContentLoaded', startGame);