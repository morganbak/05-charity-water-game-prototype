//// script.js - Water Run (difficulty modes, DOM interactions, charity footer)
// Author: updated integration for user

console.log('script loaded — Water Run');

// Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameArea = document.getElementById('game-area');
const gameOverScreen = document.getElementById('gameover-screen');
const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToStartBtn = document.getElementById('back-to-start');
const distanceDisplay = document.getElementById('distance');
const waterDisplay = document.getElementById('water');
const goalDisplay = document.getElementById('goal');
const finalDistance = document.getElementById('final-distance');
const finalWater = document.getElementById('final-water');
const waterFact = document.getElementById('waterFact');
const goTitle = document.getElementById('go-title');

const difficultyButtons = document.querySelectorAll('.difficulty');
let difficulty = 'normal';

// Difficulty config: speed px/frame, waterSpawn ms, goal water required
const DIFFICULTY_CONFIG = {
  easy:   { speed: 4, spawnMs: 2200, goal: 10 },
  normal: { speed: 6, spawnMs: 1500, goal: 20 },
  hard:   { speed: 9, spawnMs: 1000, goal: 30 }
};

// Game facts
const facts = [
  "Every $40 can bring clean water to one person.",
  "Charity: water has funded tens of thousands of water projects globally.",
  "Women and children spend 200 million hours daily collecting water.",
  "Access to clean water improves health and education for whole communities."
];

// Game state
let distance = 0;
let water = 0;
let speed = DIFFICULTY_CONFIG.normal.speed;
let waterSpawnMs = DIFFICULTY_CONFIG.normal.spawnMs;
let goalWater = DIFFICULTY_CONFIG.normal.goal;

let gameInterval = null;
let distanceInterval = null;
let spawnTimer = null;

// DOM objects that persist during a run
let playerEl = null;
let rockEl = null;
let dropEl = null;
let playerIsJumping = false;
let jumpCooldown = false;

// UI: difficulty selection
difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    difficultyButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    difficulty = btn.dataset.mode;
    const cfg = DIFFICULTY_CONFIG[difficulty];
    goalDisplay.textContent = `Goal: ${cfg.goal} water`;
    startBtn.disabled = false;
  });
});

// initialize default HUD goal
goalDisplay.textContent = `Goal: ${DIFFICULTY_CONFIG[difficulty].goal} water`;

// Navigation between screens
function showScreen(screen) {
  [startScreen, gameScreen, gameOverScreen].forEach(s => s.style.display = 'none');
  screen.style.display = 'flex';
}

// Start game button
startBtn.addEventListener('click', () => {
  showScreen(gameScreen);
  startGame();
});

// Play again
playAgainBtn.addEventListener('click', () => {
  showScreen(gameScreen);
  startGame();
});
backToStartBtn?.addEventListener('click', () => {
  showScreen(startScreen);
});

// core game start
function startGame() {
  clearAllTimers();
  gameArea.innerHTML = '';
  distance = 0;
  water = 0;
  playerIsJumping = false;
  jumpCooldown = false;

  const cfg = DIFFICULTY_CONFIG[difficulty];
  speed = cfg.speed;
  waterSpawnMs = cfg.spawnMs;
  goalWater = cfg.goal;

  updateHUD();

  createGround();
  createPlayer();
  createRock();
  spawnDropWithDelay(600 + Math.random() * 400);

  gameInterval = requestAnimationFrame(gameLoop);

  distanceInterval = setInterval(() => {
    distance += 1;
    updateHUD();
    if (distance % 100 === 0 && speed < 24) {
      speed += 0.3;
    }
  }, 30);

  document.onkeydown = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      triggerJump();
    }
  };
  gameArea.onclick = () => triggerJump();
}

function clearAllTimers() {
  if (gameInterval) { cancelAnimationFrame(gameInterval); gameInterval = null; }
  if (distanceInterval) { clearInterval(distanceInterval); distanceInterval = null; }
  if (spawnTimer) { clearTimeout(spawnTimer); spawnTimer = null; }
}

// DOM constructors
function createGround() {
  const ground = document.createElement('div');
  ground.className = 'ground';
  gameArea.appendChild(ground);
}

function createPlayer() {
  playerEl = document.createElement('div');
  playerEl.className = 'player';
  const head = document.createElement('div');
  head.className = 'head';
  playerEl.appendChild(head);
  playerEl.style.left = '40px';
  playerEl.style.bottom = '96px';
  gameArea.appendChild(playerEl);
}

function createRock() {
  rockEl = document.createElement('div');
  rockEl.className = 'rock';
  rockEl.style.left = `${gameArea.clientWidth + 40}px`;
  gameArea.appendChild(rockEl);
  resetRockPosition();
}

function createDrop(initialLeft) {
  if (dropEl) return;
  dropEl = document.createElement('div');
  dropEl.className = 'water-drop';
  dropEl.style.left = (initialLeft !== undefined) ? `${initialLeft}px` : `${gameArea.clientWidth + 80}px`;
  gameArea.appendChild(dropEl);
}

function resetRockPosition() {
  const startX = gameArea.clientWidth + 80 + Math.random() * 260;
  rockEl.style.left = `${startX}px`;
}

function spawnDropWithDelay(delayMs) {
  if (spawnTimer) clearTimeout(spawnTimer);
  spawnTimer = setTimeout(() => {
    const startX = gameArea.clientWidth + 60 + Math.random() * 400;
    createDrop(startX);
    spawnTimer = null;
  }, delayMs);
}

// Game loop
function gameLoop() {
  if (rockEl) {
    const currentLeft = parseFloat(rockEl.style.left || rockEl.getBoundingClientRect().left);
    const newLeft = currentLeft - speed;
    rockEl.style.left = `${newLeft}px`;
    if (newLeft < -80) resetRockPosition();
  }

  if (dropEl) {
    const currentLeft = parseFloat(dropEl.style.left || dropEl.getBoundingClientRect().left);
    const newLeft = currentLeft - speed;
    dropEl.style.left = `${newLeft}px`;
    if (newLeft < -60) {
      dropEl.remove();
      dropEl = null;
      spawnDropWithDelay(600 + Math.random() * waterSpawnMs);
    }
  }

  checkCollisions();
  gameInterval = requestAnimationFrame(gameLoop);
}

function pxToNum(px) {
  return parseFloat(px.replace('px','')) || 0;
}

function checkCollisions() {
  const playerLeft = pxToNum(playerEl.style.left || '40px');
  const playerBottom = pxToNum(playerEl.style.bottom || '96px');
  const playerFront = playerLeft + 10;
  const playerBack = playerLeft - 6;
  const playerFeetOnGround = playerBottom <= 100;

  if (rockEl) {
    const rockLeft = pxToNum(rockEl.style.left);
    const rockRight = rockLeft + rockEl.offsetWidth;
    if (playerFeetOnGround && rangesOverlap(playerBack, playerFront, rockLeft, rockRight)) {
      setTimeout(() => endGame(false), 0);
      return;
    }
  }

  if (dropEl) {
    const dropLeft = pxToNum(dropEl.style.left);
    const dropRight = dropLeft + dropEl.offsetWidth;
    if (playerFeetOnGround && rangesOverlap(playerBack, playerFront, dropLeft, dropRight)) {
      collectDrop();
    }
  }
}

function rangesOverlap(a1, a2, b1, b2) {
  return !(a2 < b1 || b2 < a1);
}

function collectDrop() {
  if (!dropEl) return;
  dropEl.remove();
  dropEl = null;
  water += 1;
  updateHUD();

  if (water >= goalWater) {
    setTimeout(() => endGame(true), 0);
  } else {
    spawnDropWithDelay(300 + Math.random() * waterSpawnMs);
  }
}

function triggerJump() {
  if (playerIsJumping || jumpCooldown) return;
  playerIsJumping = true;
  jumpCooldown = true;
  playerEl.style.bottom = '276px';
  setTimeout(() => {
    playerEl.style.bottom = '96px';
    playerIsJumping = false;
    setTimeout(() => { jumpCooldown = false; }, 200);
  }, 600);
}

function updateHUD() {
  distanceDisplay.textContent = `Distance: ${distance} m`;
  waterDisplay.textContent = `Water: ${water}`;
  goalDisplay.textContent = `Goal: ${goalWater} water`;
}

// End game / win
function endGame(didWin = false) {
  clearAllTimers();
  document.onkeydown = null;
  gameArea.onclick = null;

  finalDistance.textContent = `Total Distance: ${distance} m`;
  finalWater.textContent = `Water Collected: ${water} / ${goalWater}`;

  const randomIndex = Math.floor(Math.random() * facts.length);
  waterFact.textContent = facts[randomIndex];

  if (didWin) {
    goTitle.textContent = 'You Did It! 🎉';
    goTitle.style.color = '#159A48';
  } else {
    goTitle.textContent = 'Game Over!';
    goTitle.style.color = '#f5402c';
  }

  setTimeout(() => showScreen(gameOverScreen), 0);
}
