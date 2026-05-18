// Kid Wordle — game logic.
// Depends on globals from words.js (WORDS) and valid-guesses.js (VALID_GUESSES),
// which must be loaded first in index.html.

let answer = "";
let currentRow = 0;
let currentGuess = "";
let gameOver = false;
let mode = "random";        // "random" or "set" (two-player)
let isSettingWord = false;  // true while Player 1 is entering a secret word

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const toast = document.getElementById("toast");
const overlay = document.getElementById("overlay");

function buildBoard() {
  board.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.row = r;
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.row = r;
      tile.dataset.col = c;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

const KB_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","BACK"]
];

function buildKeyboard() {
  keyboard.innerHTML = "";
  KB_ROWS.forEach(row => {
    const r = document.createElement("div");
    r.className = "krow";
    row.forEach(k => {
      const btn = document.createElement("button");
      btn.className = "key" + (k === "ENTER" || k === "BACK" ? " wide" : "");
      btn.textContent = k === "BACK" ? "⌫" : k;
      btn.dataset.key = k;
      btn.addEventListener("click", e => {
        e.preventDefault();
        handleKey(k);
      });
      r.appendChild(btn);
    });
    keyboard.appendChild(r);
  });
}

function handleKey(k) {
  if (gameOver) return;
  if (k === "ENTER") return submitGuess();
  if (k === "BACK") {
    currentGuess = currentGuess.slice(0, -1);
    return renderCurrent();
  }
  if (/^[A-Z]$/.test(k) && currentGuess.length < 5) {
    currentGuess += k;
    renderCurrent();
  }
}

function renderCurrent() {
  if (!board.children[currentRow]) return;
  const tiles = board.children[currentRow].children;
  for (let i = 0; i < 5; i++) {
    const t = tiles[i];
    const ch = currentGuess[i] || "";
    // Mask the secret while Player 1 is setting it
    t.textContent = (isSettingWord && ch) ? "●" : ch;
    t.classList.toggle("filled", !!ch);
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1400);
}

function submitGuess() {
  if (isSettingWord) return submitSetWord();
  if (currentGuess.length < 5) {
    showToast("Not enough letters");
    shakeRow();
    return;
  }
  if (!VALID_GUESSES.has(currentGuess)) {
    showToast("Not a word I know");
    shakeRow();
    return;
  }
  const colors = scoreGuess(currentGuess, answer);
  applyColors(colors);
  updateKeyboard(currentGuess, colors);
  const won = currentGuess === answer;
  currentRow++;
  if (won) {
    gameOver = true;
    setTimeout(() => winAnim(), 100);
    setTimeout(() => showOverlay(true), 1400);
    return;
  }
  if (currentRow >= 6) {
    gameOver = true;
    setTimeout(() => showOverlay(false), 800);
    return;
  }
  currentGuess = "";
}

function submitSetWord() {
  if (currentGuess.length < 5) {
    showToast("Need 5 letters");
    shakeRow();
    return;
  }
  if (!VALID_GUESSES.has(currentGuess)) {
    showToast("Pick a real word");
    shakeRow();
    return;
  }
  answer = currentGuess;
  document.getElementById("confirm-word-text").textContent = answer;
  showScreen("confirm-word");
}

function scoreGuess(guess, ans) {
  const result = ["gray","gray","gray","gray","gray"];
  const ansArr = ans.split("");
  for (let i = 0; i < 5; i++) {
    if (guess[i] === ansArr[i]) {
      result[i] = "green";
      ansArr[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === "green") continue;
    const idx = ansArr.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = "yellow";
      ansArr[idx] = null;
    }
  }
  return result;
}

function applyColors(colors) {
  const tiles = board.children[currentRow].children;
  colors.forEach((color, i) => {
    setTimeout(() => {
      tiles[i].classList.remove("filled");
      tiles[i].classList.add(color);
    }, i * 200);
  });
}

function updateKeyboard(guess, colors) {
  const rank = { gray: 0, yellow: 1, green: 2 };
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      const ch = guess[i];
      const btn = keyboard.querySelector(`[data-key="${ch}"]`);
      if (!btn) continue;
      const current = btn.classList.contains("green") ? "green"
        : btn.classList.contains("yellow") ? "yellow"
        : btn.classList.contains("gray") ? "gray" : null;
      if (!current || rank[colors[i]] > rank[current]) {
        btn.classList.remove("green","yellow","gray");
        btn.classList.add(colors[i]);
      }
    }
  }, 1100);
}

function shakeRow() {
  const r = board.children[currentRow];
  if (!r) return;
  r.classList.add("shake");
  setTimeout(() => r.classList.remove("shake"), 400);
}

function winAnim() {
  const row = board.children[currentRow - 1];
  row.classList.add("bounce");
  fireConfetti();
}

function fireConfetti() {
  const colors = ["#6aaa64","#c9b458","#e88","#88c","#fc8","#8cf"];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.background = colors[i % colors.length];
    c.style.left = (Math.random() * 100) + "vw";
    c.style.top = "-20px";
    c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(c);
    const dur = 1500 + Math.random() * 1500;
    const x = (Math.random() - 0.5) * 200;
    c.animate([
      { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
      { transform: `translate(${x}px, 100vh) rotate(${Math.random()*720}deg)`, opacity: 0.9 }
    ], { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" });
    setTimeout(() => c.remove(), dur);
  }
}

function showOverlay(won) {
  const emoji = document.getElementById("ov-emoji");
  const title = document.getElementById("ov-title");
  const word = document.getElementById("ov-word");
  overlay.classList.remove("lose");
  if (won) {
    const wins = ["You got it! 🎉","Amazing! ⭐","Wordle wizard! 🧙","You did it! 🌟","Great guess! 🚀"];
    emoji.textContent = ["🎉","🌟","⭐","🎊","🏆"][Math.floor(Math.random()*5)];
    title.textContent = wins[Math.floor(Math.random()*wins.length)];
    word.textContent = answer;
  } else {
    overlay.classList.add("lose");
    emoji.textContent = "🤗";
    title.textContent = "Good try!";
    word.textContent = answer;
  }
  overlay.classList.add("show");
  document.body.classList.add("screen-active");
}

// --- Screen / mode management ---

function hideAllScreens() {
  ["start-screen","confirm-word","pass-screen","reset-confirm"].forEach(id => {
    document.getElementById(id).classList.remove("show");
  });
  overlay.classList.remove("show");
  document.body.classList.remove("screen-active");
}

function showScreen(id) {
  hideAllScreens();
  document.getElementById(id).classList.add("show");
  document.body.classList.add("screen-active");
}

function setSubtitle(text) {
  document.getElementById("subtitle").textContent = text;
}

function resetBoardAndKeyboard() {
  currentRow = 0;
  currentGuess = "";
  gameOver = false;
  buildBoard();
  buildKeyboard();
}

function startRandomGame() {
  mode = "random";
  isSettingWord = false;
  hideAllScreens();
  answer = WORDS[Math.floor(Math.random() * WORDS.length)];
  resetBoardAndKeyboard();
  setSubtitle("guess the 5-letter word");
}

function startSetMode() {
  mode = "set";
  isSettingWord = true;
  hideAllScreens();
  resetBoardAndKeyboard();
  setSubtitle("Player 1: type a secret word");
}

function startPlayer2Turn() {
  isSettingWord = false;
  hideAllScreens();
  resetBoardAndKeyboard();
  setSubtitle("Player 2: guess the secret word!");
}

document.getElementById("btn-random").addEventListener("click", startRandomGame);
document.getElementById("btn-set").addEventListener("click", startSetMode);
document.getElementById("btn-confirm").addEventListener("click", () => showScreen("pass-screen"));
document.getElementById("btn-retype").addEventListener("click", () => {
  hideAllScreens();
  currentGuess = "";
  renderCurrent();
});
document.getElementById("btn-ready").addEventListener("click", startPlayer2Turn);

document.getElementById("ov-btn").addEventListener("click", () => {
  overlay.classList.remove("show");
  showScreen("start-screen");
});

// Reset button: confirm if a game is in progress, otherwise just go back to menu
document.getElementById("reset-btn").addEventListener("click", () => {
  const hasProgress = currentRow > 0 || currentGuess.length > 0 || isSettingWord;
  showScreen(hasProgress ? "reset-confirm" : "start-screen");
});
document.getElementById("btn-cancel-reset").addEventListener("click", hideAllScreens);
document.getElementById("btn-yes-reset").addEventListener("click", () => showScreen("start-screen"));

// Hardware keyboard support (helpful for testing on desktop)
document.addEventListener("keydown", e => {
  if (gameOver) return;
  if (e.key === "Enter") handleKey("ENTER");
  else if (e.key === "Backspace") handleKey("BACK");
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});

// Prevent pinch-zoom & double-tap zoom on iOS
document.addEventListener("gesturestart", e => e.preventDefault());
let lastTouch = 0;
document.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - lastTouch <= 300) e.preventDefault();
  lastTouch = now;
}, { passive: false });

// Boot: show the mode-pick screen
showScreen("start-screen");
