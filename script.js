// Konfetti Effekt
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

const colors = ['#ff69b4', '#ffe066', '#8fd3f4', '#c1f7c7', '#ffb6c1', '#f7cac9', '#f6e3b4'];
const confetti = [];

for (let i = 0; i < 150; i++) {
    confetti.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height,
        r: Math.random() * 8 + 2,
        d: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngle: 0,
        tiltAngleIncrement: Math.random() * 0.07 + 0.05
    });
}

function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confetti.forEach(c => {
        confettiCtx.beginPath();
        confettiCtx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        confettiCtx.fillStyle = c.color;
        confettiCtx.fill();
    });
}

function updateConfetti() {
    confetti.forEach(c => {
        c.y += c.d;
        c.x += Math.sin(c.tiltAngle) * 2;
        c.tiltAngle += c.tiltAngleIncrement;
        if (c.y > confettiCanvas.height) {
            c.y = -10;
            c.x = Math.random() * confettiCanvas.width;
        }
    });
}

function animateConfetti() {
    drawConfetti();
    updateConfetti();
    requestAnimationFrame(animateConfetti);
}

animateConfetti();

window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});

// Sound-Icon Funktion
const soundIcon = document.getElementById('sound-icon');
const audio = document.getElementById('birthday-audio');
let isPlaying = false;

soundIcon.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        soundIcon.textContent = '🎵';
    } else {
        audio.play();
        soundIcon.textContent = '🔇';
    }
    isPlaying = !isPlaying;
});

// Optional: Icon ändern, wenn Musik zu Ende ist
audio.addEventListener('ended', () => {
    soundIcon.textContent = '🎵';
    isPlaying = false;
});

// Game-Popup Logik
const gameIcon = document.getElementById('game-icon');
const gamePopup = document.getElementById('game-popup');
const startGameBtn = document.getElementById('start-game-btn');
const gameArea = document.getElementById('game-area');
const closePopup = document.getElementById('close-popup');

gameIcon.addEventListener('click', () => {
    gamePopup.style.display = 'flex';
    gameArea.style.display = 'none';
    startGameBtn.style.display = 'inline-block';
    const startInfo = document.getElementById('game-start-info');
    if (startInfo) startInfo.style.display = 'block';
});

closePopup.addEventListener('click', () => {
    gamePopup.style.display = 'none';
});

startGameBtn.addEventListener('click', () => {
    startGameBtn.style.display = 'none';
    gameArea.style.display = 'block';
    const startInfo = document.getElementById('game-start-info');
    if (startInfo) startInfo.style.display = 'none';
    startCatchGame();
});

// --- Catch Game ---
function startCatchGame() {
    gameArea.innerHTML = '';
    // Spielvariablen
    let score = 2;
    let lives = 3;
    let gameOver = false;
    let playerX = 120;
    const playerWidth = 60;
    const areaWidth = 300;
    const areaHeight = 400;
    let fallingItems = [];
    let fallSpeed = 2.3;
    let animationId;

    // Emojis
    const giftEmoji = '🎁';
    const mangoEmoji = '🥭';
    const bombEmoji = '📄';

    // Game Area Canvas
    const canvas = document.createElement('canvas');
    canvas.width = areaWidth;
    canvas.height = areaHeight;
    canvas.style.background = 'linear-gradient(135deg, #ffe066, #ffb6c1, #8fd3f4)';
    canvas.style.borderRadius = '30px';
    canvas.style.boxShadow = '0 0 20px #ff69b4, 0 0 40px #ffe066';
    canvas.style.margin = '0 auto';
    canvas.style.display = 'block';
    gameArea.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Touch-Steuerung für mobile
    let touchStartX = null;
    canvas.addEventListener('touchstart', function(e) {
        if (gameOver) return;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
    });
    canvas.addEventListener('touchmove', function(e) {
        if (gameOver) return;
        if (touchStartX === null) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        if (Math.abs(deltaX) > 20) {
            if (deltaX > 0) {
                playerX += 30;
                if (playerX > areaWidth - playerWidth) playerX = 0;
            } else {
                playerX -= 30;
                if (playerX < 0) playerX = areaWidth - playerWidth;
            }
            touchStartX = touch.clientX;
        }
    });
    canvas.addEventListener('touchend', function() {
        touchStartX = null;
    });

    // HUD
    const hud = document.createElement('div');
    hud.style.display = 'flex';
    hud.style.justifyContent = 'space-between';
    hud.style.alignItems = 'center';
    hud.style.width = areaWidth + 'px';
    hud.style.margin = '10px auto 0 auto';
    hud.style.fontSize = '1.5em';
    hud.style.color = '#fff';
    hud.style.textShadow = '0 0 10px #ff69b4, 0 0 20px #ffe066';
    gameArea.insertBefore(hud, canvas);

    function drawHUD() {
        let hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
        hud.innerHTML = `<span>🎯 ${score}</span><span>${hearts}</span>`;
    }

    // Player
    function drawPlayer() {
        ctx.font = '2.5em serif';
        ctx.textAlign = 'center';
        ctx.fillText(giftEmoji, playerX + playerWidth / 2, areaHeight - 30);
    }

    // Items
    function spawnItem() {
        // Mango häufiger als Bombe
        const isBomb = Math.random() < 0.18;
        fallingItems.push({
            x: Math.random() * (areaWidth - 40) + 20,
            y: -40,
            type: isBomb ? 'bomb' : 'mango',
            caught: false
        });
    }

    function drawItems() {
        ctx.font = '2em serif';
        fallingItems.forEach(item => {
            const emoji = item.type === 'mango' ? mangoEmoji : bombEmoji;
            ctx.fillText(emoji, item.x, item.y);
        });
    }

    function updateItems() {
        fallingItems.forEach(item => {
            item.y += fallSpeed;
        });
        // Remove items out of area
        fallingItems = fallingItems.filter(item => !item.caught && item.y < areaHeight + 30);
    }

    function checkCollisions() {
        fallingItems.forEach(item => {
            if (item.caught) return;
            // Collision mit Geschenk
            if (
                item.y > areaHeight - 70 &&
                item.x > playerX &&
                item.x < playerX + playerWidth
            ) {
                item.caught = true;
                if (item.type === 'mango') {
                    score--;
                    if (score === 0) endGame(true);
                } else if (item.type === 'bomb') {
                    endGame(false, 'You hit the Job Application!');
                }
            } else if (item.y > areaHeight - 10 && !item.caught) {
                // Mango verpasst
                if (item.type === 'mango') {
                    lives--;
                    if (lives === 0) endGame(false, 'No lives left!');
                }
                item.caught = true;
            }
        });
    }

    function endGame(win, msg) {
        gameOver = true;
        cancelAnimationFrame(animationId);
        if (win) {
            triggerPopupConfetti();
        }
        setTimeout(() => {
            let imgHtml = '';
            if (!win) {
                imgHtml = '<img src="sad.png" alt="Sad" style="width:320px;margin-bottom:30px;display:block;margin-left:auto;margin-right:auto;">';
            }
            let mainText = win ? '🎉 You got your Gift! 🎁' : '💥 Game Over!';
            // Entferne den Titeltext im Game Over/Win Screen
            if (document.querySelector('.game-title')) {
                document.querySelector('.game-title').style.display = 'none';
            }
            gameArea.innerHTML = `<div style="font-size:2em;color:#ff69b4;text-shadow:0 0 20px #ffe066;">${imgHtml}${mainText}<br>${msg ? msg : ''}<br><button class='game-btn small-btn' id='restart-btn'>Play Again</button></div>`;
            document.getElementById('restart-btn').onclick = () => startCatchGame();
        }, 800);


// Konfetti-Effekt im Popup bei Gewinn
function triggerPopupConfetti() {
    const popupCanvas = document.getElementById('popup-confetti-canvas');
    if (!popupCanvas) return;
    // Setze die Größe auf die der Popup-Box
    const popupBox = popupCanvas.parentElement;
    popupCanvas.width = popupBox.offsetWidth;
    popupCanvas.height = popupBox.offsetHeight;
    popupCanvas.style.display = 'block';
    const ctx = popupCanvas.getContext('2d');
    const popupConfetti = [];
    for (let i = 0; i < 80; i++) {
        popupConfetti.push({
            x: Math.random() * popupCanvas.width,
            y: -10,
            r: Math.random() * 8 + 4,
            d: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngle: 0,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05
        });
    }
    let frames = 0;
    function drawPopupConfetti() {
        ctx.clearRect(0, 0, popupCanvas.width, popupCanvas.height);
        popupConfetti.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fillStyle = c.color;
            ctx.fill();
        });
    }
    function updatePopupConfetti() {
        popupConfetti.forEach(c => {
            c.y += c.d;
            c.x += Math.sin(c.tiltAngle) * 2;
            c.tiltAngle += c.tiltAngleIncrement;
            if (c.y > popupCanvas.height) {
                c.y = -10;
                c.x = Math.random() * popupCanvas.width;
            }
        });
    }
    function animatePopupConfetti() {
        drawPopupConfetti();
        updatePopupConfetti();
        frames++;
        if (frames < 120) {
            requestAnimationFrame(animatePopupConfetti);
        } else {
            popupCanvas.style.display = 'none';
        }
    }
    animatePopupConfetti();
}
    }

    // Steuerung
    document.addEventListener('keydown', movePlayer);
    function movePlayer(e) {
        if (gameOver) return;
        if (e.key === 'ArrowLeft') {
            playerX -= 30;
            if (playerX < 0) playerX = areaWidth - playerWidth;
        }
        if (e.key === 'ArrowRight') {
            playerX += 30;
            if (playerX > areaWidth - playerWidth) playerX = 0;
        }
    }

    // Hauptloop
    let spawnTimer = 0;
    function gameLoop() {
        ctx.clearRect(0, 0, areaWidth, areaHeight);
        drawPlayer();
        drawItems();
        updateItems();
        checkCollisions();
        drawHUD();
        if (!gameOver) {
            animationId = requestAnimationFrame(gameLoop);
            spawnTimer++;
            if (spawnTimer % 60 === 0) spawnItem();
        }
    }

    drawHUD();
    gameLoop();
}

// Bunter Cursor-Trail Effekt
const trailColors = ['#ff69b4', '#ffe066', '#8fd3f4', '#c1f7c7', '#ffb6c1', '#f7cac9', '#f6e3b4'];

function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    const color = trailColors[Math.floor(Math.random() * trailColors.length)];
    trail.style.background = color;
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    setTimeout(() => {
        trail.style.opacity = '0';
        setTimeout(() => trail.remove(), 400);
    }, 400);
}

document.addEventListener('mousemove', (e) => {
    createTrail(e.clientX, e.clientY);
});
