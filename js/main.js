/*==============================================================
   Flappy Bird Clone - Motor do Jogo Aprimorado
   Desenvolvido por Igor Gomes
==============================================================*/

// Seleção do Canvas e Contexto
const canvas = document.getElementById("flappy-canvas");
const ctx = canvas.getContext("2d");

// Largura e Altura do Canvas Virtual
const CANVAS_WIDTH = 420;
const CANVAS_HEIGHT = 650;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Estados do Jogo
const STATES = {
    READY: 0,
    PLAYING: 1,
    GAMEOVER: 2
};
let gameState = STATES.READY;

// Pontuação e Recorde (Salvo no Navegador)
let score = 0;
let highScore = parseInt(localStorage.getItem("flappy_best_score")) || 0;
let frames = 0;
let soundEnabled = true;

/*======= Sistema de Sons Sintetizados (Web Audio API) =======*/
// Não depende de arquivos externos, funciona 100% offline e sem erros de carregamento
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freqStart, freqEnd, type, duration, volume = 0.15) {
    if (!soundEnabled || !audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);

        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Ignora silenciosamente se o áudio do navegador estiver bloqueado
    }
}

function soundFlap() {
    playTone(380, 750, 'sine', 0.12, 0.18);
}

function soundScore() {
    if (!soundEnabled || !audioCtx) return;
    try {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
        osc2.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.08); // E6

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.1);
        osc2.start(audioCtx.currentTime + 0.08);
        osc2.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
}

function soundHit() {
    playTone(300, 80, 'sawtooth', 0.15, 0.22);
}

function soundDie() {
    playTone(220, 50, 'sine', 0.35, 0.2);
}

/*======= Carregamento dos Sprites Originais =======*/
const images = {};
const imageSources = {
    background: "img/background.png",
    land: "img/land.png",
    bird1: "img/bird1.png",
    bird2: "img/bird2.png",
    head: "img/head.png",
    pp: "img/pp.png",
    gameover: "img/gameover2.png"
};

let loadedImages = 0;
const totalImages = Object.keys(imageSources).length;
let allImagesReady = false;

for (let key in imageSources) {
    images[key] = new Image();
    images[key].src = imageSources[key];
    images[key].onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
            allImagesReady = true;
        }
    };
}

/*======= Objeto do Pássaro (Bird) =======*/
const bird = {
    x: 90,
    y: 260,
    width: 44,
    height: 38,
    gravity: 0.36,
    lift: -6.8,
    velocity: 0,
    rotation: 0,
    animFrame: 0,

    flap: function() {
        this.velocity = this.lift;
        this.rotation = -0.42; // Inclina para cima ~25 graus
        soundFlap();
    },

    update: function() {
        if (gameState === STATES.READY) {
            // Flutuação suave na tela de início
            this.y = 260 + Math.sin(frames * 0.08) * 9;
            this.rotation = 0;
            this.animFrame = (frames % 16 < 8) ? 0 : 1;
            return;
        }

        // Aplica gravidade e velocidade vertical
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Animação das asas (bate asas ao subir)
        if (this.velocity < 0) {
            this.animFrame = (frames % 10 < 5) ? 1 : 0;
        } else {
            this.animFrame = 0;
        }

        // Rotação suave da queda
        if (this.velocity >= 2.5) {
            this.rotation += 0.055;
            if (this.rotation > 1.25) this.rotation = 1.25; // Limite de ~70 graus para baixo
        }

        // Colisão com o teto
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }

        // Colisão com o chão
        const groundY = CANVAS_HEIGHT - land.height;
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            gameOver();
        }
    },

    draw: function() {
        const sprite = this.animFrame === 1 ? images.bird2 : images.bird1;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = "#F8D838";
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    },

    reset: function() {
        this.y = 260;
        this.velocity = 0;
        this.rotation = 0;
    }
};

/*======= Cenário e Chão Móvel =======*/
const background = {
    x: 0,
    speed: 0.6,
    update: function() {
        if (gameState !== STATES.GAMEOVER) {
            this.x -= this.speed;
            if (this.x <= -CANVAS_WIDTH) {
                this.x = 0;
            }
        }
    },
    draw: function() {
        const bg = images.background;
        if (bg && bg.complete) {
            ctx.drawImage(bg, this.x, 0, CANVAS_WIDTH, CANVAS_HEIGHT - land.height);
            ctx.drawImage(bg, this.x + CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT - land.height);
        } else {
            ctx.fillStyle = "#4EC0CA";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
};

const land = {
    x: 0,
    y: CANVAS_HEIGHT - 110,
    height: 110,
    speed: 2.2,
    update: function() {
        if (gameState !== STATES.GAMEOVER) {
            this.x -= this.speed;
            if (this.x <= -336) {
                this.x = 0;
            }
        }
    },
    draw: function() {
        const l = images.land;
        if (l && l.complete) {
            for (let i = 0; i <= Math.ceil(CANVAS_WIDTH / 336) + 1; i++) {
                ctx.drawImage(l, this.x + i * 336, this.y, 336, this.height);
            }
        } else {
            ctx.fillStyle = "#DED895";
            ctx.fillRect(0, this.y, CANVAS_WIDTH, this.height);
        }
    }
};

/*======= Obstáculos (Canos / Pipes) =======*/
const pipes = {
    items: [],
    gap: 135, // Abertura segura e justa entre canos
    pipeWidth: 62,
    headHeight: 28,

    update: function() {
        if (gameState !== STATES.PLAYING) return;

        // Gera novo par de canos a cada 110 frames (~1.8 segundos)
        if (frames % 110 === 0) {
            const minHeight = 60;
            const maxHeight = CANVAS_HEIGHT - land.height - this.gap - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            this.items.push({
                x: CANVAS_WIDTH,
                topHeight: topHeight,
                bottomY: topHeight + this.gap,
                bottomHeight: CANVAS_HEIGHT - land.height - (topHeight + this.gap),
                passed: false
            });
        }

        for (let i = 0; i < this.items.length; i++) {
            const p = this.items[i];
            p.x -= land.speed;

            // Marca ponto ao passar pelo centro do pássaro
            if (!p.passed && p.x + this.pipeWidth < bird.x) {
                p.passed = true;
                score++;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("flappy_best_score", highScore);
                }
                soundScore();
            }

            // Verificação precisa de colisão com o pássaro
            const hitboxMargin = 4; // Ajuste para deixar a colisão justa
            const birdLeft = bird.x + hitboxMargin;
            const birdRight = bird.x + bird.width - hitboxMargin;
            const birdTop = bird.y + hitboxMargin;
            const birdBottom = bird.y + bird.height - hitboxMargin;

            // Colisão com o cano superior
            if (birdRight > p.x && birdLeft < p.x + this.pipeWidth && birdTop < p.topHeight) {
                gameOver();
                return;
            }

            // Colisão com o cano inferior
            if (birdRight > p.x && birdLeft < p.x + this.pipeWidth && birdBottom > p.bottomY) {
                gameOver();
                return;
            }

            // Remove canos que saíram da tela
            if (p.x + this.pipeWidth < -10) {
                this.items.splice(i, 1);
                i--;
            }
        }
    },

    draw: function() {
        const head = images.head;
        const pp = images.pp;

        for (let i = 0; i < this.items.length; i++) {
            const p = this.items[i];

            // 1. Cano Superior
            if (pp && pp.complete) {
                // Corpo do cano superior
                ctx.drawImage(pp, p.x, 0, this.pipeWidth, p.topHeight - this.headHeight);
            }
            if (head && head.complete) {
                // Boca do cano superior (invertida)
                ctx.save();
                ctx.translate(p.x + this.pipeWidth / 2, p.topHeight - this.headHeight / 2);
                ctx.scale(1, -1);
                ctx.drawImage(head, -this.pipeWidth / 2, -this.headHeight / 2, this.pipeWidth, this.headHeight);
                ctx.restore();
            }

            // 2. Cano Inferior
            if (head && head.complete) {
                // Boca do cano inferior
                ctx.drawImage(head, p.x, p.bottomY, this.pipeWidth, this.headHeight);
            }
            if (pp && pp.complete) {
                // Corpo do cano inferior
                ctx.drawImage(pp, p.x, p.bottomY + this.headHeight, this.pipeWidth, p.bottomHeight - this.headHeight);
            }
        }
    },

    reset: function() {
        this.items = [];
    }
};

/*======= Telas de Início e Game Over =======*/
function drawReadyScreen() {
    ctx.textAlign = "center";

    // Título Principal
    ctx.font = "bold 26px 'Press Start 2P', monospace";
    ctx.fillStyle = "#F8D838";
    ctx.fillText("FLAPPY BIRD", CANVAS_WIDTH / 2, 170);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#D88000";
    ctx.strokeText("FLAPPY BIRD", CANVAS_WIDTH / 2, 170);

    // Instrução
    ctx.font = "14px 'Poppins', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Toque na tela ou pressione", CANVAS_WIDTH / 2, 360);
    
    ctx.font = "bold 15px 'Press Start 2P', monospace";
    ctx.fillStyle = "#F8D838";
    ctx.fillText("[ ESPAÇO ]", CANVAS_WIDTH / 2, 395);

    ctx.font = "13px 'Poppins', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("para voar e desviar dos canos!", CANVAS_WIDTH / 2, 430);

    // Recorde Atual na tela inicial
    if (highScore > 0) {
        ctx.font = "12px 'Press Start 2P', monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`RECORDE: ${highScore}`, CANVAS_WIDTH / 2, 480);
    }
}

function drawScoreHUD() {
    if (gameState !== STATES.PLAYING) return;

    ctx.textAlign = "center";
    ctx.font = "bold 38px 'Press Start 2P', monospace";
    
    // Sombra do Score
    ctx.fillStyle = "#000000";
    ctx.fillText(score, CANVAS_WIDTH / 2 + 3, 73);

    // Score Branco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(score, CANVAS_WIDTH / 2, 70);
}

function drawGameOverScreen() {
    // Banner Game Over
    const goBanner = images.gameover;
    if (goBanner && goBanner.complete) {
        ctx.drawImage(goBanner, (CANVAS_WIDTH - 240) / 2, 120, 240, 60);
    } else {
        ctx.font = "bold 28px 'Press Start 2P', monospace";
        ctx.fillStyle = "#E53E3E";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 150);
    }

    // Painel do Placar
    const panelX = 50;
    const panelY = 205;
    const panelW = 320;
    const panelH = 190;

    // Fundo do painel
    ctx.fillStyle = "rgba(26, 32, 44, 0.92)";
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 16);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#F8D838";
    ctx.stroke();

    // Textos do Painel
    ctx.textAlign = "left";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillStyle = "#A0AEC0";
    ctx.fillText("PONTUAÇÃO", panelX + 30, panelY + 50);

    ctx.textAlign = "right";
    ctx.font = "bold 22px 'Press Start 2P', monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(score, panelX + panelW - 30, panelY + 55);

    ctx.textAlign = "left";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillStyle = "#A0AEC0";
    ctx.fillText("MELHOR", panelX + 30, panelY + 115);

    ctx.textAlign = "right";
    ctx.font = "bold 22px 'Press Start 2P', monospace";
    ctx.fillStyle = "#F8D838";
    ctx.fillText(highScore, panelX + panelW - 30, panelY + 120);

    // Medalha ou Selo
    let medalEmoji = "🥉";
    if (score >= 40) medalEmoji = "💎";
    else if (score >= 25) medalEmoji = "🥇";
    else if (score >= 10) medalEmoji = "🥈";

    if (score >= 5) {
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(medalEmoji, panelX + 50, panelY + 155);
    }

    // Botão / Instrução para Reiniciar
    ctx.textAlign = "center";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Pressione [ ESPAÇO ]", CANVAS_WIDTH / 2, 440);
    ctx.fillStyle = "#F8D838";
    ctx.fillText("ou Toque para Recomeçar", CANVAS_WIDTH / 2, 465);
}

function gameOver() {
    if (gameState === STATES.GAMEOVER) return;
    gameState = STATES.GAMEOVER;
    soundHit();
    setTimeout(soundDie, 160);
}

function resetGame() {
    score = 0;
    frames = 0;
    bird.reset();
    pipes.reset();
    gameState = STATES.READY;
}

/*======= Loop Principal com requestAnimationFrame =======*/
function gameLoop() {
    frames++;

    // 1. Atualizações
    background.update();
    pipes.update();
    bird.update();
    land.update();

    // 2. Renderização
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    background.draw();
    pipes.draw();
    land.draw();
    bird.draw();

    // 3. UI baseada no estado
    if (gameState === STATES.READY) {
        drawReadyScreen();
    } else if (gameState === STATES.PLAYING) {
        drawScoreHUD();
    } else if (gameState === STATES.GAMEOVER) {
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

/*======= Controle de Interação (Teclado, Mouse e Toque) =======*/
function handleAction() {
    initAudio();

    if (gameState === STATES.READY) {
        gameState = STATES.PLAYING;
        bird.flap();
    } else if (gameState === STATES.PLAYING) {
        bird.flap();
    } else if (gameState === STATES.GAMEOVER) {
        resetGame();
    }
}

// Teclado
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        handleAction();
    }
});

// Mouse e Toque no Canvas
canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    handleAction();
});

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleAction();
}, { passive: false });

/*======= Botão de Som =======*/
const btnSound = document.getElementById("btn-sound");
if (btnSound) {
    btnSound.addEventListener("click", (e) => {
        e.stopPropagation();
        initAudio();
        soundEnabled = !soundEnabled;
        btnSound.innerHTML = soundEnabled ? "<span>🔊 Som: ON</span>" : "<span>🔇 Som: OFF</span>";
    });
}

// Inicia o jogo
requestAnimationFrame(gameLoop);
