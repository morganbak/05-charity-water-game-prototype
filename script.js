// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');


const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameArea = document.getElementById('game-area');
const gameOverScreen = document.getElementById('gameover-screen');
const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const distanceDisplay = document.getElementById('distance');
const waterDisplay = document.getElementById('water');
const finalDistance = document.getElementById('final-distance');
const finalWater = document.getElementById('final-water');
const charityFact = document.getElementById('charity-fact');

// Charity: water facts
const facts = [
  "Every $40 can bring clean water to one person.",
  "Charity: water has funded 91,414 water projects.",
  "Clean water improves health and education.",
  "Women and children spend 200 million hours daily collecting water.",
  "Access to clean water can transform entire communities."
];

// Game variables
let distance = 0;
let water = 0;
let isJumping = false;
let gameInterval;
let rockPosition = 600;
let waterPosition = 900;
let stickY = 0; // 0 = ground, 1 = jumping
let speed = 5; // Initial speed
let jumpCooldown = false; // Prevent jump spamming

// Show only the selected screen
function showScreen(screen) {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  screen.style.display = 'flex';
}

// Start game
startBtn.onclick = function() {
  showScreen(gameScreen);
  startGame();
};

// Play again
playAgainBtn.onclick = function() {
  showScreen(gameScreen);
  startGame();
};

// Start or restart the game
function startGame() {
  // Reset variables
  distance = 0;
  water = 0;
  stickY = 0;
  rockPosition = 600;
  waterPosition = 900;
  isJumping = false;
  updateHUD();
  gameArea.innerHTML = ''; // Clear game area
  speed = 5; // Reset speed at start

  // Start game loop
  gameInterval = setInterval(gameLoop, 30);

  // Listen for jump (spacebar or click)
  document.onkeydown = function(e) {
    if (e.code === 'Space' && !isJumping) {
      jump();
    }
  };
  gameArea.onclick = function() {
    if (!isJumping) {
      jump();
    }
  };
}

// Game loop: moves obstacles, checks collisions, updates display
function gameLoop() {
  distance += 1;
  updateHUD();

  // Gradually increase speed every 100 distance units
  if (distance % 100 === 0 && speed < 20) {
    speed += 0.5; // Increase speed, max out at 20
  }

  // Move rock and water left
  rockPosition -= speed;
  waterPosition -= speed;

  // If rock goes off screen, reset position
  if (rockPosition < -50) {
    rockPosition = 600 + Math.random() * 200;
  }
  // If water goes off screen, reset position
  if (waterPosition < -50) {
    waterPosition = 600 + Math.random() * 400;
  }

  // Draw everything
  drawGame();

  // Check collision with rock
  if (rockPosition < 60 && rockPosition > 0 && stickY === 0) {
    endGame();
  }

  // Check collision with water
  if (waterPosition < 60 && waterPosition > 0 && stickY === 0) {
    water += 1;
    waterPosition = 600 + Math.random() * 400;
  }
}

// Draw stick figure, ground, rock, and water
function drawGame() {
  // Clear game area
  gameArea.innerHTML = '';

  // Draw ground (sand color)
  const ground = document.createElement('div');
  ground.className = 'ground';
  gameArea.appendChild(ground);

  // Draw stick figure
  const stick = document.createElement('div');
  stick.style.position = 'absolute';
  stick.style.left = '40px';
  stick.style.bottom = stickY === 0 ? '96px' : '276px'; // ground height + jump height
  stick.style.width = '4px';
  stick.style.height = '48px';
  stick.style.background = 'black';
  stick.style.borderRadius = '2px';

  // Head
  const head = document.createElement('div');
  head.style.width = '18px';
  head.style.height = '18px';
  head.style.background = '#68b6ffff';
  head.style.borderRadius = '50%';
  head.style.position = 'absolute';
  head.style.left = '-7px';
  head.style.top = '-20px';
  stick.appendChild(head);

  // Arms
  const leftArm = document.createElement('div');
  leftArm.style.width = '22px';
  leftArm.style.height = '4px';
  leftArm.style.background = 'black';
  leftArm.style.position = 'absolute';
  leftArm.style.left = '-18px';
  leftArm.style.top = '12px';
  leftArm.style.transform = 'rotate(-25deg)';
  leftArm.style.borderRadius = '2px';
  stick.appendChild(leftArm);

  const rightArm = document.createElement('div');
  rightArm.style.width = '22px';
  rightArm.style.height = '4px';
  rightArm.style.background = 'black';
  rightArm.style.position = 'absolute';
  rightArm.style.left = '0px';
  rightArm.style.top = '12px';
  rightArm.style.transform = 'rotate(25deg)';
  rightArm.style.borderRadius = '2px';
  stick.appendChild(rightArm);

  // Legs
  const leftLeg = document.createElement('div');
  leftLeg.style.width = '18px';
  leftLeg.style.height = '4px';
  leftLeg.style.background = 'black';
  leftLeg.style.position = 'absolute';
  leftLeg.style.left = '-14px';
  leftLeg.style.top = '40px';
  leftLeg.style.transform = 'rotate(-20deg)';
  leftLeg.style.borderRadius = '2px';
  stick.appendChild(leftLeg);

  const rightLeg = document.createElement('div');
  rightLeg.style.width = '18px';
  rightLeg.style.height = '4px';
  rightLeg.style.background = 'black';
  rightLeg.style.position = 'absolute';
  rightLeg.style.left = '4px';
  rightLeg.style.top = '40px';
  rightLeg.style.transform = 'rotate(20deg)';
  rightLeg.style.borderRadius = '2px';
  stick.appendChild(rightLeg);

  gameArea.appendChild(stick);

  // Draw rock (with bumps and polygon shape)
  const rock = document.createElement('div');
  rock.className = 'rock';
  rock.style.left = `${rockPosition}px`;
  rock.style.bottom = '96px';
  // Main body
  const rockBody = document.createElement('div');
  rockBody.className = 'rock-body';
  rock.appendChild(rockBody);
  // Small bump 1
  const bump1 = document.createElement('div');
  bump1.className = 'rock-bump1';
  rock.appendChild(bump1);
  // Small bump 2
  const bump2 = document.createElement('div');
  bump2.className = 'rock-bump2';
  rock.appendChild(bump2);
  gameArea.appendChild(rock);

  // Draw water droplet (droplet shape)
  const drop = document.createElement('div');
  drop.style.position = 'absolute';
  drop.style.left = `${waterPosition}px`;
  drop.style.bottom = '136px';
  drop.style.width = '24px';
  drop.style.height = '32px';
  drop.style.background = 'linear-gradient(180deg, #4fc3f7 60%, #00bcd4 100%)';
  drop.style.borderRadius = '50% 50% 60% 60% / 60% 60% 100% 100%';
  drop.style.boxShadow = '0 4px 12px #81d4fa inset';
  drop.style.borderBottom = '4px solid #1976d2';
  // Add a highlight
  const highlight = document.createElement('div');
  highlight.style.position = 'absolute';
  highlight.style.left = '6px';
  highlight.style.top = '6px';
  highlight.style.width = '8px';
  highlight.style.height = '12px';
  highlight.style.background = 'rgba(255,255,255,0.6)';
  highlight.style.borderRadius = '50%';
  drop.appendChild(highlight);
  gameArea.appendChild(drop);
}

// Make the stick figure jump
function jump() {
  // Prevent jumping if already jumping or in cooldown
  if (isJumping || jumpCooldown) {
    return;
  }
  isJumping = true;
  jumpCooldown = true;
  stickY = 1;
  drawGame();
  setTimeout(() => {
    stickY = 0;
    isJumping = false;
    drawGame();
    // Add a brief cooldown after landing (300ms)
    setTimeout(() => {
      jumpCooldown = false;
    }, 300);
  }, 600); // Jump lasts 600ms
}

// Update distance and water count
function updateHUD() {
  distanceDisplay.textContent = `Distance: ${distance} m`;
  waterDisplay.textContent = `Water: ${water}`;
}

// End the game and show Game Over screen
function endGame() {
  clearInterval(gameInterval);
  document.onkeydown = null;
  gameArea.onclick = null;
  finalDistance.textContent = `Total Distance: ${distance}`;
  finalWater.textContent = `Water Collected: ${water}`;
  charityFact.textContent = facts[Math.floor(Math.random() * facts.length)];
  showScreen(gameOverScreen);
}
