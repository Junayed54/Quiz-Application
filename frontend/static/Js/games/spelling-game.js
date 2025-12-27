// Game Data (Moved from spellingWords.js)
const sevenLetterWords = [
  "KITCHEN", "CHICKEN", "BLANKET", "GARDENS", "MORNING", "TONIGHT",
  "MACHINE", "CLIMATE", "PARENTS", "FRIENDS", "HUNDRED", "ANCIENT",
  "GENERAL", "PROBLEM", "SCIENCE", "BROTHER", "ANOTHER", "AGAINST",
  "HISTORY", "STUDENT", "CULTURE", "READING", "WRITING", "SUBJECT",
  "TEACHER", "MINERAL", "PATTERN", "CHAPTER", "ARTICLE", "STRANGE",
  "BELIEVE", "BETWEEN", "CERTAIN", "CONTROL", "DEVELOP", "EXAMPLE",
  "FORWARD", "GREATER", "HEALTHY", "INSTEAD", "JUSTICE", "KINGDOM",
  "LIBRARY", "MILLION", "NATURAL", "OCTOBER", "PACKAGE", "QUALIFY",
  "REALITY", "SERVICE", "TESTING", "UNIFORM", "VERSION", "WEATHER",
  "JOURNEY", "PROUDLY", "QUARTER", "REVENUE", "SHELTER", "THROUGH",
  "VILLAGE", "WHETHER", "WORKING", "COUNCIL", "DYNAMIC", "EDITION",
  "FEDERAL", "HABITAT", "IMPROVE", "JOURNAL", "KITCHEN", "MESSAGE",
  "NETWORK", "OBJECTS", "PERCEPT", "QUALITY", "RESERVE", "STORAGE",
  "TENSION", "UPGRADE", "VISIBLE", "WARNING", "YIELDED"
];

// const dictionary = [
//   "the", "and", "are", "cat", "hat", "bat", "kit", "kin", "can", "hen",
//   "ten", "net", "ice", "nice", "kite", "hike", "bike", "chin", "inch",
//   "each", "ache", "cake", "bake", "take", "make", "like", "bike", "hike",
//   "tech", "etch", "tick", "kick", "neck", "check", "thick", "chick",
//   "chicken", "kitchen", "blanket", "thicken", "thin", "knit", "knight",
//   "night", "eight", "right", "light", "fight", "sight", "tight", "might",
//   "flight", "height", "weight", "bright", "slight", "tonight", "morning",
//   "born", "corn", "horn", "torn", "worn", "iron", "grin", "ring", "sing",
//   "song", "long", "along", "strong", "wrong", "grown", "grow", "brown",
//   "crown", "drown", "frown", "town", "down", "gown", "known", "know",
//   "show", "slow", "flow", "glow", "blow", "snow", "throw", "crow", "grow",
//   "ride", "side", "tide", "wide", "hide", "slide", "glide", "guide",
//   "pride", "bride", "stride", "inside", "outside", "beside", "garden",
//   "gardens", "dark", "park", "bark", "lark", "mark", "shark", "spark",
//   "stark", "blank", "plank", "tank", "rank", "bank", "drank", "thank",
//   "think", "drink", "link", "sink", "pink", "wink", "blink", "shrink",
//   "drink", "trunk", "drunk", "clunk", "skunk", "junk", "spun", "pun",
//   "sun", "gun", "run", "fun", "bun", "nun", "done", "gone", "bone",
//   "cone", "zone", "tone", "stone", "phone", "alone", "clone", "throne",
//   "phone", "prone", "shone", "crone", "drone", "clean", "lean", "mean",
//   "bean", "jean", "ocean", "organ", "human", "woman", "roman", "urban",
//   "pagan", "slogan", "vegan", "began", "japan", "span", "plan", "clan",
//   "scan", "than", "rain", "gain", "main", "pain", "vain", "brain", "drain",
//   "grain", "train", "strain", "sprain", "plain", "slain", "chain", "stain",
//   "cute", "mute", "flute", "lute", "jute"
// ];

// API Settings
const API_SUBMIT_URL = "/api/word-game/submit/"; 

// 2. DOM Elements Mapping
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over-screen'),
    userModal: document.getElementById('user-modal') 
};

const elements = {
    btnPlay: document.getElementById('btn-play'),
    btnRestart: document.getElementById('btn-restart'),
    btnDelete: document.getElementById('btn-delete'),
    btnShuffle: document.getElementById('btn-shuffle'),
    btnSubmit: document.getElementById('btn-submit'),
    wordInput: document.getElementById('word-input'),
    scoreVal: document.getElementById('score-val'),
    timerVal: document.getElementById('timer-val'),
    foundWordsList: document.getElementById('found-words-list'),
    foundCount: document.getElementById('found-count'),
    finalScoreVal: document.getElementById('final-score-val'),
    hive: document.querySelector('.hive'),
    toast: document.getElementById('feedback-toast'),
    // Guest Form Elements
    guestName: document.getElementById("guestName"),
    guestPhone: document.getElementById("guestPhone")
};

// 3. Game State
let gameState = {
    score: 0,
    timeLeft: 10,
    gameOver: false,
    allLetters: [],
    wordBank: [],
    foundWords: [],
    currentInput: '',
    timerInterval: null
};

// 4. Initialization & Event Listeners
elements.btnPlay.addEventListener('click', startGame);
elements.btnRestart.addEventListener('click', startGame);
elements.btnDelete.addEventListener('click', handleDelete);
elements.btnShuffle.addEventListener('click', handleShuffle);
elements.btnSubmit.addEventListener('click', handleSubmit);

document.addEventListener('keydown', (e) => {
    if (gameState.gameOver || screens.game.style.display === 'none') return;
    if (e.key === 'Backspace') handleDelete();
    else if (e.key === 'Enter') handleSubmit();
    else if (/^[a-zA-Z]$/.test(e.key)) handleLetterClick(e.key.toUpperCase());
});

// 5. Core Game Functions
function startGame() {
    gameState = { score: 0, timeLeft: 180, gameOver: false, foundWords: [], currentInput: '', timerInterval: null };
    
    let randomWord;
    let uniqueSet;
    do {
        randomWord = sevenLetterWords[Math.floor(Math.random() * sevenLetterWords.length)];
        uniqueSet = new Set(randomWord.toUpperCase().split(''));
    } while (uniqueSet.size < 7);

    const uniqueLetters = Array.from(uniqueSet);
    for (let i = uniqueLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueLetters[i], uniqueLetters[j]] = [uniqueLetters[j], uniqueLetters[i]];
    }

    gameState.allLetters = uniqueLetters.slice(0, 7);
    gameState.wordBank = generateWordBank(gameState.allLetters.join(''));

    elements.scoreVal.textContent = '0';
    elements.timerVal.textContent = '03:00';
    elements.foundCount.textContent = '0';
    elements.foundWordsList.innerHTML = '';
    elements.wordInput.textContent = '';

    showScreen('game');
    renderHive();
    startTimer();
    gsap.to('.input-underline', { width: 0, duration: 0 });
}

function generateWordBank(sevenLetters) {
    const letters = sevenLetters.toLowerCase().split('');
    const letterSet = new Set(letters);
    return dictionary.filter(word => {
        word = word.toLowerCase();
        if (word.length < 3) return false;
        for (let char of word) {
            if (!letterSet.has(char)) return false;
        }
        return true;
    });
}

function renderHive() {
    elements.hive.innerHTML = '';
    const centerLetter = gameState.allLetters[0];
    const outerLetters = gameState.allLetters.slice(1);
    createHex(centerLetter, 'center', 'center');
    outerLetters.forEach((letter, i) => createHex(letter, 'outer', i));

    gsap.fromTo('.hex', { scale: 0, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.7)", clearProps: "scale"
    });
}

function createHex(letter, type, pos) {
    const hex = document.createElement('div');
    hex.className = `hex ${type}`;
    hex.setAttribute('data-pos', pos);
    hex.textContent = letter;
    hex.addEventListener('click', () => handleLetterClick(letter));
    elements.hive.appendChild(hex);
}

function handleLetterClick(letter) {
    if (!gameState.allLetters.includes(letter)) return;
    gameState.currentInput += letter;
    updateInputDisplay();
}

function updateInputDisplay() {
    elements.wordInput.textContent = gameState.currentInput;
    const targetWidth = Math.min(gameState.currentInput.length * 20, 300);
    gsap.to('.input-underline', { width: targetWidth, duration: 0.3, ease: "power2.out" });
}

function handleDelete() {
    gameState.currentInput = gameState.currentInput.slice(0, -1);
    updateInputDisplay();
}

function handleShuffle() {
    const outerLetters = gameState.allLetters.slice(1);
    outerLetters.sort(() => Math.random() - 0.5);
    gameState.allLetters = [gameState.allLetters[0], ...outerLetters];
    gsap.to('.hex.outer', { scale: 0, opacity: 0, duration: 0.2, onComplete: () => renderHive() });
}

function handleSubmit() {
    const word = gameState.currentInput.toLowerCase();
    if (word.length < 3) { showToast('Too short!', 'error'); shakeInput(); return; }
    if (gameState.foundWords.includes(word)) { showToast('Already found!', 'info'); shakeInput(); return; }

    if (gameState.wordBank.includes(word)) {
        gameState.foundWords.push(word);
        gameState.score++;
        updateUI();
        addWordToList(word);
        showToast('Nice!', 'success');
        gsap.fromTo(elements.scoreVal, { scale: 1.5 }, { scale: 1, duration: 0.5 });
    } else {
        showToast('Not in list!', 'error');
        shakeInput();
    }
    gameState.currentInput = '';
    updateInputDisplay();
}

function updateUI() {
    elements.scoreVal.textContent = gameState.score;
    elements.foundCount.textContent = gameState.foundWords.length;
}

function addWordToList(word) {
    const span = document.createElement('span');
    span.textContent = word;
    elements.foundWordsList.prepend(span);
}

function startTimer() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        if (gameState.timeLeft <= 0) endGame();
        const mins = Math.floor(gameState.timeLeft / 60);
        const secs = gameState.timeLeft % 60;
        elements.timerVal.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function showScreen(screenId) {
    Object.keys(screens).forEach(id => {
        if(screens[id]) {
            screens[id].style.display = 'none';
            screens[id].classList.remove('active');
        }
    });
    screens[screenId].style.display = 'flex';
    setTimeout(() => screens[screenId].classList.add('active'), 10);
}

function showToast(msg, type) {
    elements.toast.textContent = msg;
    elements.toast.className = `toast show ${type}`;
    setTimeout(() => elements.toast.classList.remove('show'), 2000);
}

function shakeInput() {
    gsap.fromTo('.input-container', { x: -10 }, { x: 10, duration: 0.05, repeat: 5, yoyo: true });
}

// ==========================================
// SYSTEM: SCORE SUBMISSION LOGIC
// ==========================================

async function endGame() {
    gameState.gameOver = true;
    clearInterval(gameState.timerInterval);
    elements.finalScoreVal.textContent = gameState.score;
    
    showScreen('gameOver');

    const token = localStorage.getItem("access_token");
    const savedName = localStorage.getItem("username");
    const savedPhone = localStorage.getItem("phone_number");

    // Logic: If user is logged in, submit now. 
    // If not logged in but we have guest info, submit now.
    // Otherwise, show the modal.
    if (token || (savedName && savedPhone)) {
        await submitScoreToAPI();
    } else {
        openUserModal();
    }
}

function openUserModal() {
    if (screens.userModal) {
        // Ensure modal is visible and on top
        screens.userModal.classList.remove("hidden");
        screens.userModal.style.display = "flex";
        screens.userModal.style.zIndex = "9999";
        
        // Hide the game layout so they focus on the form
        screens.game.style.opacity = "0.3";
    }
}

async function handleCustomFormSubmit() {
    const username = elements.guestName.value.trim();
    const phone_number = elements.guestPhone.value.trim();

    if (!username || !phone_number) {
        alert("Please enter both name and phone number.");
        return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("phone_number", phone_number);

    if (screens.userModal) {
        screens.userModal.classList.add("hidden");
        screens.userModal.style.display = "none";
    }
    
    await submitScoreToAPI();
}

async function submitScoreToAPI() {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const phone = localStorage.getItem("phone_number");
    
    const PUZZLE_ID = 2; // 👈 STATIC ID HERE
    let payload = {puzzle_id: PUZZLE_ID, score: gameState.score};
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
            showToast("Score saved!", "success");
        }
    } catch (err) {
        console.error("Submission failed", err);
        showToast("Score not saved", "error");
    }
}
