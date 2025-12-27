// --- Configuration ---
const GRID_SIZE = 7;
const INITIAL_LIFE = 30;
const INITIAL_NEXT_COUNT = 5;

// --- State ---
let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
let nextQueue = [];
let life = INITIAL_LIFE;
let foundWords = [];
let longestWord = '';
let isGameOver = false;
let isGameWon = false;
let isStarted = false;

// --- DOM Elements ---
const gridElement = document.getElementById('game-grid');
const nextQueueElement = document.getElementById('next-queue');
const lifeElement = document.getElementById('life-count');
const wordCountElement = document.getElementById('word-count');
const lastWordElement = document.getElementById('last-word');
const canvas = document.getElementById('arrow-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startModal = document.getElementById('start-modal');
const gameOverModal = document.getElementById('game-over-modal');
const winModal = document.getElementById('win-modal');
const userModal = document.getElementById('user-modal');

// --- Helper Functions ---
const getWeightedRandomChar = () => {
    const percent = {
        a: 8.167, b: 1.492, c: 2.782, d: 4.253, e: 12.702, f: 2.228, g: 2.015, h: 6.094, i: 6.966, j: 0.153,
        k: 0.772, l: 4.025, m: 2.406, n: 6.749, o: 7.507, p: 1.929, q: 0.095, r: 5.987, s: 6.327, t: 9.056,
        u: 2.758, v: 0.978, w: 2.360, x: 0.150, y: 1.974, z: 0.074
    };
    let s = 0;
    const sum = [];
    const entries = Object.entries(percent);
    for (const [char, val] of entries) {
        sum.push(s);
        s += val;
    }
    const r = Math.random() * s;
    for (let i = 0; i < sum.length; i++) {
        if (r >= sum[i] && (i === sum.length - 1 || r < sum[i + 1])) return entries[i][0].toUpperCase();
    }
    return 'E';
};

const reverseString = (str) => str.split('').reverse().join('');

const findCombinations = (prefix, letter, suffix) => {
    let all = [];
    const pStr = prefix.toLowerCase();
    const lStr = letter.toLowerCase();
    const sStr = suffix.toLowerCase();

    for (let p = 0; p <= prefix.length; p++) {
        for (let s = 0; s <= suffix.length; s++) {
            const subPrefix = pStr.substring(0, p);
            const subSuffix = sStr.substring(0, s);

            const w = reverseString(subPrefix) + lStr + subSuffix;
            const revW = reverseString(w);

            if (w.length > 1 && window.corpus.hasOwnProperty(w)) all.push({ word: w, begin: -p, end: s, type: 'normal' });
            if (revW.length > 1 && window.corpus.hasOwnProperty(revW)) all.push({ word: revW, begin: s, end: -p, type: 'reversed' });
        }
    }
    return all;
};

// --- Core Game Functions ---
const initGame = () => {
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    nextQueue = Array(20).fill(null).map(() => getWeightedRandomChar());
    life = INITIAL_LIFE;
    foundWords = [];
    longestWord = '';
    isGameOver = false;
    isGameWon = false;
    isStarted = true;

    renderGrid();
    renderStats();
    renderNextQueue();

    hideOverlay();
    resizeCanvas();
};

const renderGrid = () => {
    gridElement.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < GRID_SIZE; c++) {
            const td = document.createElement('td');
            td.className = 'cell';
            td.dataset.row = r;
            td.dataset.col = c;
            td.textContent = grid[r][c];
            if (grid[r][c]) td.classList.add('filled');
            td.addEventListener('click', () => handleCellClick(r, c));
            tr.appendChild(td);
        }
        gridElement.appendChild(tr);
    }
};

const renderStats = () => {
    lifeElement.textContent = life;
    wordCountElement.textContent = foundWords.length;
};

const renderNextQueue = () => {
    nextQueueElement.innerHTML = '';
    nextQueue.slice(0, INITIAL_NEXT_COUNT).forEach((char, i) => {
        const div = document.createElement('div');
        div.className = 'next-char' + (i === 0 ? ' current' : '');
        div.textContent = char;
        nextQueueElement.appendChild(div);
    });
};

const handleCellClick = (r, c) => {
    if (isGameOver || isGameWon || !isStarted) return;
    if (grid[r][c] !== '') return;

    const char = nextQueue.shift();
    nextQueue.push(getWeightedRandomChar());
    grid[r][c] = char;

    const cell = gridElement.rows[r].cells[c];
    cell.textContent = char;
    cell.classList.add('filled', 'last-placed');

    life -= 1;
    checkWords(r, c, char);

    const isFull = grid.every(row => row.every(c => c !== ''));
    if (isFull) {
        isGameWon = true;
        handleGameEnd();
    } else if (life <= 0) {
        isGameOver = true;
        handleGameEnd();
    }

    renderStats();
    renderNextQueue();
};

const checkWords = (r, c, char) => {
    let foundThisTurn = [];
    let arrows = [];

    // Horizontal
    let hPrefix = '';
    for (let i = 1; c - i >= 0; i++) if (!grid[r][c - i]) break; else hPrefix += grid[r][c - i];
    let hSuffix = '';
    for (let i = 1; c + i < GRID_SIZE; i++) if (!grid[r][c + i]) break; else hSuffix += grid[r][c + i];
    const hResults = findCombinations(hPrefix, char, hSuffix);
    hResults.forEach(res => {
        foundThisTurn.push(res.word);
        arrows.push({ r1: r, c1: c + res.begin, r2: r, c2: c + res.end, label: res.word });
    });

    // Vertical
    let vPrefix = '';
    for (let i = 1; r - i >= 0; i++) if (!grid[r - i][c]) break; else vPrefix += grid[r - i][c];
    let vSuffix = '';
    for (let i = 1; r + i < GRID_SIZE; i++) if (!grid[r + i][c]) break; else vSuffix += grid[r + i][c];
    const vResults = findCombinations(vPrefix, char, vSuffix);
    vResults.forEach(res => {
        foundThisTurn.push(res.word);
        arrows.push({ r1: r + res.begin, c1: c, r2: r + res.end, c2: c, label: res.word });
    });

    if (foundThisTurn.length > 0) {
        life += foundThisTurn.length;
        foundWords.push(...foundThisTurn);

        foundThisTurn.forEach(w => { if (w.length > longestWord.length) longestWord = w; });
        animateArrows(arrows);
    }
};

// --- Animations ---
const animateArrows = async (arrows) => {
    for (const arrow of arrows) {
        const lastWordContent = document.getElementById('last-word-content');
        lastWordContent.textContent = arrow.label.toUpperCase();

        gsap.killTweensOf(lastWordElement);
        gsap.fromTo(lastWordElement, { scale: 0, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' });

        const startRect = gridElement.rows[arrow.r1].cells[arrow.c1].getBoundingClientRect();
        const endRect = gridElement.rows[arrow.r2].cells[arrow.c2].getBoundingClientRect();
        const gridWrapperRect = document.getElementById('grid-wrapper').getBoundingClientRect();

        const x1 = (startRect.left + startRect.width / 2) - gridWrapperRect.left;
        const y1 = (startRect.top + startRect.height / 2) - gridWrapperRect.top;
        const x2 = (endRect.left + endRect.width / 2) - gridWrapperRect.left;
        const y2 = (endRect.top + endRect.height / 2) - gridWrapperRect.top;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.font = 'bold 20px Outfit';
        const metrics = ctx.measureText(arrow.label);
        const textWidth = metrics.width;

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(midX - textWidth / 2 - 8, midY - 14, textWidth + 16, 28);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(arrow.label.toUpperCase(), midX, midY);

        await new Promise(r => setTimeout(r, 1000));
        gsap.to(lastWordElement, { opacity: 0, scale: 1.2, duration: 0.3 });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await new Promise(r => setTimeout(r, 100));
    }
};

const resizeCanvas = () => {
    const rect = document.getElementById('grid-wrapper').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
};

// --- Overlay / Modal Management ---
const showOverlay = (modalId) => {
    overlay.classList.add('show');
    [startModal, gameOverModal, winModal, userModal].forEach(m => m.classList.remove('show'));
    document.getElementById(modalId).classList.add('show');
    gsap.fromTo(`#${modalId}`, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
};

const hideOverlay = () => {
    gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => { overlay.classList.remove('show'); overlay.style.opacity = 1; } });
};

// --- Score Submission ---
async function submitScoreToAPI() {
    const API_SUBMIT_URL = "/api/word-game/submit/"; 
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const phone_number = localStorage.getItem("phone_number");
    const PUZZLE_ID = 3;
    const score = foundWords.length;

    let payload = { puzzle_id: PUZZLE_ID, score: score };
    let headers = { "Content-Type": "application/json" };

    if (token) headers["Authorization"] = "Bearer " + token;
    else { payload.username = username; payload.phone_number = phone_number; }

    try {
        const res = await fetch(API_SUBMIT_URL, { method: "POST", headers, body: JSON.stringify(payload) });
        if (res.ok) showOverlay("win-modal");
        else alert("Score not saved");
    } catch (err) {
        console.error("Submission failed", err);
        alert("Score not saved");
    }
}

// --- Handle Game End ---
function handleGameEnd() {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const phone = localStorage.getItem("phone_number");

    const winWordsEl = document.getElementById('win-words');
    if (winWordsEl) winWordsEl.textContent = foundWords.length;

    const winLongestEl = document.getElementById('win-longest');
    if (winLongestEl) winLongestEl.textContent = longestWord || '-';

    const finalWordsEl = document.getElementById('final-words');
    if (finalWordsEl) finalWordsEl.textContent = foundWords.length;

    const finalLongestEl = document.getElementById('final-longest');
    if (finalLongestEl) finalLongestEl.textContent = longestWord || '-';


    if (token || (username && phone)) {
        submitScoreToAPI();
    } else {
        showOverlay("user-modal");
    }
}

// --- User Modal Submit ---
function submitUserInfo() {
    const usernameInput = document.getElementById("user-username");
    const phoneInput = document.getElementById("user-phone");

    const username = usernameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!username || !phone) {
        alert("Please enter username and phone number");
        return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("phone_number", phone);

    hideOverlay();
    submitScoreToAPI();
}

// --- Event Listeners ---
document.getElementById('start-btn').addEventListener('click', initGame);
document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('next-game-btn').addEventListener('click', initGame);
document.getElementById('submit')?.addEventListener('click', submitUserInfo);
window.addEventListener('resize', resizeCanvas);

// --- Initial Setup ---
window.onload = () => {
    resizeCanvas();
    showOverlay('start-modal');
};
