// ========================================
// THORNE'S JOURNEY - Game.js Rewrite
// Version 2.0 - Simplified & Optimized
// 
// A Dark Souls-inspired adventure following Thorne's
// search for his daughter Aila in the mysterious Verge
//
// Features:
// - Complete gameplay with combat and platforming
// - Story integration with dialogue system
// - Audio system with Prokofiev background music
// - Visual effects and particle system
// - Professional UI with multiple game states
// ========================================

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    throw new Error('Canvas element with id "gameCanvas" not found!');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('2D canvas context not supported!');
}

// Essential Game Constants
const GAME_CONFIG = {
    GRAVITY: 0.5,
    PLAYER_SPEED: 5,
    JUMP_FORCE: -12,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 450,
    TARGET_FPS: 60,
    ATTACK_RANGE: 50,
    ATTACK_DURATION: 20,
    INVINCIBILITY_TIME: 60
};

// Color Palette
const COLORS = {
    BACKGROUND: '#111122',
    BACKGROUND_ACCENT: '#222233',
    PLATFORM: '#555555',
    PLATFORM_EDGE: '#777777',
    PLAYER: '#FFFFFF',
    PLAYER_ATTACK: '#FFAA00',
    PLAYER_INVINCIBLE: '#AAAAFF',
    ENEMY: '#FF4444',
    ENEMY_DAMAGED: '#FF8888',
    ENEMY_ATTACK: '#FF6666',
    UI_TEXT: '#FFFFFF',
    UI_ACCENT: '#AAAAFF',
    HEALTH: '#FF0000',
    PARTICLE: '#FFCC66',
    BACKGROUND_PARTICLE: '#444455'
};

// Game State Management
const gameState = {
    current: 'menu', // 'menu', 'playing', 'paused', 'gameOver', 'dialogue'
    isPaused: false,
    playerHealth: 3,
    maxHealth: 3,
    currentChapter: 1, // Changed to numeric for combat system
    inDialogue: false,
    enemiesDefeated: 0,
    souls: 0,
    debugMode: false,
    screenFlash: null,
    chapterProgress: {
        1: { completed: false, parrySuccessRate: 0, enemiesDefeated: 0, title: "First Steps" },
        2: { completed: false, parrySuccessRate: 0, enemiesDefeated: 0, title: "Rhythm and Timing" },
        3: { completed: false, parrySuccessRate: 0, enemiesDefeated: 0, title: "Spatial Awareness" },
        4: { completed: false, parrySuccessRate: 0, enemiesDefeated: 0, title: "Combat Flow" },
        5: { completed: false, parrySuccessRate: 0, enemiesDefeated: 0, title: "Master of Arms" }
    }
};

// ========================================
// AUDIO SYSTEM
// ========================================

class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.soundEnabled = true;
        this.musicVolume = 0.3;
        this.initialized = false;
        this.userInteracted = false;
    }

    init() {
        try {
            // Create background music
            this.bgMusic = new Audio();
            this.bgMusic.src = "SpotiDownloader.com - Adagio Op.87 – Between Echo and Ash - Erik J. Lindström.mp3";
            this.bgMusic.loop = true;
            this.bgMusic.volume = this.musicVolume;
            this.bgMusic.preload = 'auto';
            
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    playMusic() {
        if (!this.soundEnabled || !this.initialized || !this.bgMusic) return;
        
        this.bgMusic.play().catch(e => {
            console.log('Music autoplay blocked - waiting for user interaction');
        });
    }

    pauseMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }

    // Enhanced attack sound system using Web Audio API
    playAttackSound(type = 'slash') {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different sounds for different attack types
            switch (type) {
                case 'slash':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                    
                case 'thrust':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.08);
                    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
                    oscillator.stop(audioContext.currentTime + 0.08);
                    break;
                    
                case 'aoe':
                case 'cone':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'charge':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
                    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                    oscillator.stop(audioContext.currentTime + 0.4);
                    break;
                    
                case 'groundSlam':
                    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;
                    
                case 'riposte':
                    // Enhanced attack sound for riposte
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
                    
                case 'parry_attempt':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.05);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                    oscillator.stop(audioContext.currentTime + 0.05);
                    break;
                    
                case 'parry_perfect':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                case 'parry_good':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.08);
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
                    
                case 'parry_fail':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                default:
                    // Default slash sound
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.stop(audioContext.currentTime + 0.1);
            }
            
            oscillator.start(audioContext.currentTime);
        } catch (error) {
            console.warn('Could not play attack sound:', error);
        }
    }

    // Enable audio on first user interaction
    enableAudio() {
        if (!this.userInteracted) {
            this.userInteracted = true;
            if (this.soundEnabled && gameState.current === 'playing') {
                this.playMusic();
            }
        }
    }
}

// Create audio manager instance
// Add parry sound method to AudioManager
AudioManager.prototype.playParrySound = function(quality = 'good') {
    if (!this.soundEnabled || !this.audioContext) return;
    
    try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Different sounds for different parry qualities
        switch (quality) {
            case 'perfect':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
                
            case 'good':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
                
            case 'failed':
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
        }
        
        oscillator.start(this.audioContext.currentTime);
        
    } catch (error) {
        console.warn('Parry sound error:', error);
    }
};

const audioManager = new AudioManager();

// ========================================
// PARTICLE SYSTEM
// ========================================

class Particle {
    constructor(x, y, velocityX, velocityY, color, life, size = 2) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.life--;
        
        // Fade out over time
        this.alpha = this.life / this.maxLife;
        
        return this.life > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Particle manager
const particles = [];

function createAttackParticles(x, y, direction) {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i + (direction > 0 ? 0 : Math.PI);
        const speed = 2 + Math.random() * 3;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 1,
            COLORS.PARTICLE,
            20 + Math.random() * 10,
            1 + Math.random() * 2
        ));
    }
}

function createDamageParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 1,
            COLORS.HEALTH,
            15 + Math.random() * 10,
            2 + Math.random() * 2
        ));
    }
}

function updateParticles() {
    // Limit particle count for performance
    if (particles.length > 50) {
        particles.splice(0, particles.length - 50);
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        if (i >= 0 && i < particles.length && !particles[i].update()) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => particle.draw());
}

function createEnemyDeathParticles(x, y) {
    // Large explosion particles
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        particles.push(new Particle(
            x + (Math.random() - 0.5) * 20, 
            y + (Math.random() - 0.5) * 20,
            velocityX, velocityY,
            '#FF6B6B', // Red explosion color
            40 + Math.random() * 30,
            4 + Math.random() * 3
        ));
    }
    
    // Secondary white flash particles
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = 4 + Math.random() * 2;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        particles.push(new Particle(
            x, y,
            velocityX, velocityY,
            '#FFFFFF',
            20 + Math.random() * 15,
            2
        ));
    }
}

function createSoulRewardParticles(x, y, amount) {
    // Golden soul particles that float upward
    for (let i = 0; i < amount; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 10;
        const velocityX = (Math.random() - 0.5) * 2;
        const velocityY = -2 - Math.random() * 2; // Float upward
        
        particles.push(new Particle(
            x + offsetX, 
            y + offsetY,
            velocityX, velocityY,
            '#FFD700', // Golden color
            60 + Math.random() * 30,
            2 + Math.random()
        ));
    }
}

// ========================================
// DIALOGUE SYSTEM
// ========================================

class DialogueSystem {
    constructor() {
        this.currentDialogue = null;
        this.dialogueQueue = [];
        this.textProgress = 0;
        this.textSpeed = 2;
        this.isComplete = false;
    }

    addDialogue(character, text) {
        this.dialogueQueue.push({ character, text });
        if (!this.currentDialogue) {
            this.nextDialogue();
        }
    }

    nextDialogue() {
        if (this.dialogueQueue.length > 0) {
            this.currentDialogue = this.dialogueQueue.shift();
            this.textProgress = 0;
            this.isComplete = false;
            gameState.inDialogue = true;
        } else {
            this.currentDialogue = null;
            gameState.inDialogue = false;
        }
    }

    update() {
        if (!this.currentDialogue) return;

        if (!this.isComplete) {
            this.textProgress += this.textSpeed;
            if (this.textProgress >= this.currentDialogue.text.length) {
                this.isComplete = true;
                this.textProgress = this.currentDialogue.text.length;
            }
        }
    }

    draw() {
        if (!this.currentDialogue) return;

        // Dialogue box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(50, canvas.height - 150, canvas.width - 100, 120);
        
        // Border
        ctx.strokeStyle = COLORS.UI_ACCENT;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, canvas.height - 150, canvas.width - 100, 120);

        // Character name
        ctx.fillStyle = COLORS.UI_ACCENT;
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.currentDialogue.character, 70, canvas.height - 120);

        // Dialogue text (animated)
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '16px Arial';
        const displayText = this.currentDialogue.text.substring(0, Math.floor(this.textProgress));
        
        // Word wrap
        this.wrapText(displayText, 70, canvas.height - 95, canvas.width - 140, 20);

        // Continue indicator
        if (this.isComplete) {
            ctx.fillStyle = COLORS.UI_ACCENT;
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('Press SPACE to continue...', canvas.width - 70, canvas.height - 40);
        }
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y + (lineCount * lineHeight));
                line = words[n] + ' ';
                lineCount++;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y + (lineCount * lineHeight));
    }

    handleInput() {
        if (!this.currentDialogue) return;
        
        if (this.isComplete && (keyPressed['Space'] || keyPressed['Enter'])) {
            this.nextDialogue();
        }
    }
}

// Story chapters and dialogue
const CHAPTERS = {
    INTRO: 'intro',
    ASH_CHAPEL: 'ash_chapel',
    BRIDGE: 'bridge',
    VICTORY: 'victory'
};

const CHARACTERS = {
    THORNE: "Thorne",
    AILA: "Aila (Echo)",
    VOICE_REGRET: "Voice of Regret"
};

// Create dialogue system
const dialogueSystem = new DialogueSystem();

// ========================================
// STORY MANAGER
// ========================================

function triggerStoryEvent(eventType) {
    switch (eventType) {
        case 'gameStart':
            gameState.currentChapter = 1;  // Set to combat chapter 1
            dialogueSystem.addDialogue(CHARACTERS.VOICE_REGRET, "Another day in this shattered realm...");
            dialogueSystem.addDialogue(CHARACTERS.THORNE, "The Verge grows stronger. I can feel it feeding on memories, on grief.");
            dialogueSystem.addDialogue(CHARACTERS.THORNE, "Aila... my daughter. I will find answers in this cursed place.");
            break;
            
        case 'firstEnemyDefeated':
            if (gameState.enemiesDefeated === 1) {
                dialogueSystem.addDialogue(CHARACTERS.THORNE, "These creatures... they're manifestations of the Verge itself.");
            }
            break;
            
        case 'halfEnemiesDefeated':
            if (gameState.enemiesDefeated === 1 && enemies.length === 1) {
                dialogueSystem.addDialogue(CHARACTERS.AILA, "Father? Is that you?");
                dialogueSystem.addDialogue(CHARACTERS.THORNE, "Aila? No... you can't be here.");
                dialogueSystem.addDialogue(CHARACTERS.AILA, "I'm lost in the spaces between memories. Help me find peace.");
            }
            break;
            
        case 'allEnemiesDefeated':
            gameState.current = 'victory';  // Switch to victory screen instead of setting chapter
            dialogueSystem.addDialogue(CHARACTERS.THORNE, "The chapel is cleansed... but this is only the beginning.");
            dialogueSystem.addDialogue(CHARACTERS.AILA, "Thank you, father. I can rest now.");
            dialogueSystem.addDialogue(CHARACTERS.VOICE_REGRET, "One step closer to the truth, Thorne. But the path ahead grows darker.");
            break;
    }
}

function updateChapterDisplay() {
    let chapterName = "";
    switch (gameState.currentChapter) {
        case CHAPTERS.INTRO:
            chapterName = "Prologue";
            break;
        case CHAPTERS.ASH_CHAPEL:
            chapterName = "Chapter 1: Ash Chapel";
            break;
        case CHAPTERS.BRIDGE:
            chapterName = "Chapter 2: Bridge of Forgotten Names";
            break;
        case CHAPTERS.VICTORY:
            chapterName = "Victory";
            break;
        default:
            chapterName = "Unknown Chapter";
    }
    return chapterName;
}

// ========================================
// GAME OBJECTS
// ========================================

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.health = 3;
        this.maxHealth = 3;
        this.facingRight = true;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.invincibilityTimer = 0;
        
        // Advanced combat properties
        this.parrySystem = new ParrySystem(this);
        this.damageBoost = null;
        this.damageBoostMultiplier = 1.0; // Default damage multiplier
        this.vulnerabilityTime = 0;
        
        // Stamina system
        this.stamina = 100;
        this.maxStamina = 100;
        this.staminaRegenRate = 25; // Stamina per second
        this.staminaRegenDelay = 1.0; // Delay after stamina use before regen starts
        this.lastStaminaUse = 0;
        this.isExhausted = false;
    }

    update() {
        // Update timers
        if (this.attackTimer > 0) this.attackTimer--;
        if (this.invincibilityTimer > 0) this.invincibilityTimer--;
        if (this.vulnerabilityTime > 0) this.vulnerabilityTime -= deltaTime;
        
        // Update damage boost
        if (this.damageBoost && this.damageBoost.duration > 0) {
            this.damageBoost.duration -= deltaTime;
            this.damageBoostMultiplier = this.damageBoost.multiplier || 1.0;
            if (this.damageBoost.duration <= 0) {
                this.damageBoost = null;
                this.damageBoostMultiplier = 1.0; // Reset to default
            }
        } else {
            this.damageBoostMultiplier = 1.0; // Ensure default when no boost
        }
        
        // Update parry system
        this.parrySystem.update(deltaTime);
        
        // Update stamina system
        this.updateStamina(deltaTime);
        
        // Attack is active during timer
        this.isAttacking = this.attackTimer > 0;

        // Handle movement input
        this.velocityX = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) {
            if (this.canUseStamina(5)) { // Running costs stamina
                this.velocityX = -GAME_CONFIG.PLAYER_SPEED;
                this.facingRight = false;
                this.useStamina(5);
            } else {
                // Slow walk when exhausted
                this.velocityX = -GAME_CONFIG.PLAYER_SPEED * 0.5;
                this.facingRight = false;
            }
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            if (this.canUseStamina(5)) { // Running costs stamina
                this.velocityX = GAME_CONFIG.PLAYER_SPEED;
                this.facingRight = true;
                this.useStamina(5);
            } else {
                // Slow walk when exhausted
                this.velocityX = GAME_CONFIG.PLAYER_SPEED * 0.5;
                this.facingRight = true;
            }
        }

        // Handle jump (only when not in dialogue)
        if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && this.isOnGround && !gameState.inDialogue) {
            if (this.canUseStamina(20)) { // Jumping costs stamina
                this.velocityY = GAME_CONFIG.JUMP_FORCE;
                this.isOnGround = false;
                this.useStamina(20);
            }
        }

        // Handle attack (only when not in dialogue)
        if ((keys['KeyZ'] || keys['KeyJ']) && (keyPressed['KeyZ'] || keyPressed['KeyJ']) && !gameState.inDialogue) {
            if (this.canUseStamina(15)) { // Attacking costs stamina
                this.attack();
                this.useStamina(15);
            }
        }
        
        // Handle parry (only when not in dialogue)
        if (keys['KeyQ'] && keyPressed['KeyQ'] && !gameState.inDialogue) {
            if (this.canUseStamina(10)) { // Parrying costs stamina
                this.parrySystem.attemptParry();
                this.useStamina(10);
            }
        }

        // Apply gravity
        this.velocityY += GAME_CONFIG.GRAVITY;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Boundary checking
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y > canvas.height) {
            this.takeDamage(1); // Fall damage
            this.respawn();
        }
    }

    attack() {
        if (this.attackTimer > 0 || !this.canUseStamina(15)) return;
        
        this.attackTimer = GAME_CONFIG.ATTACK_DURATION;
        this.useStamina(15);
        
        // Check for riposte bonus
        const isRiposte = this.parrySystem.canRiposte;
        const riposteMult = isRiposte ? this.parrySystem.riposteDamageMultiplier : 1.0;
        
        // Create attack box for collision detection
        const attackBox = {
            x: this.facingRight ? this.x + this.width : this.x - GAME_CONFIG.ATTACK_RANGE,
            y: this.y + 10,
            width: GAME_CONFIG.ATTACK_RANGE,
            height: this.height - 20
        };
        
        // Check for enemy hits
        enemies.forEach(enemy => {
            if (enemy.checkCollisionWithRect(attackBox)) {
                const damage = 1 * this.damageBoostMultiplier * riposteMult;
                enemy.takeDamage(damage);
                createDamageParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                
                // If this was a riposte, apply stagger
                if (isRiposte) {
                    enemy.stagger(1.0); // 1 second stagger
                    this.parrySystem.canRiposte = false; // Consume riposte
                    this.parrySystem.riposteWindow = 0;
                    
                    // Create special riposte effects
                    for (let i = 0; i < 15; i++) {
                        particles.push(new Particle(
                            enemy.x + enemy.width/2,
                            enemy.y + enemy.height/2,
                            (Math.random() - 0.5) * 8,
                            -Math.random() * 6,
                            '#FFD700',
                            40,
                            3 + Math.random() * 2
                        ));
                    }
                }
            }
        });
        
        // Create attack particles (enhanced for riposte)
        const attackX = this.facingRight ? this.x + this.width + 25 : this.x - 25;
        const attackY = this.y + this.height / 2;
        const direction = this.facingRight ? 1 : -1;
        createAttackParticles(attackX, attackY, direction);
        
        // Add extra particles for riposte
        if (isRiposte) {
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(
                    attackX,
                    attackY,
                    (Math.random() - 0.5) * 6 * direction,
                    -Math.random() * 4,
                    '#FFD700',
                    30,
                    2
                ));
            }
        }
        
        // Play attack sound
        if (audioManager) {
            audioManager.playAttackSound(isRiposte ? 'riposte' : 'slash');
        }
    }

    takeDamage(damage) {
        if (this.invincibilityTimer === 0) {
            this.health -= damage;
            this.invincibilityTimer = GAME_CONFIG.INVINCIBILITY_TIME;
            
            // Create damage particles
            createDamageParticles(this.x + this.width/2, this.y + this.height/2);
            
            if (this.health <= 0) {
                gameState.current = 'gameOver';
            }
        }
    }

    respawn() {
        this.x = 100;
        this.y = 300;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    draw() {
        // Choose color based on state
        let playerColor = COLORS.PLAYER;
        if (this.invincibilityTimer > 0) {
            // Flash during invincibility
            playerColor = (Math.floor(this.invincibilityTimer / 5) % 2) ? COLORS.PLAYER_INVINCIBLE : COLORS.PLAYER;
        }
        
        // Apply damage boost glow
        if (this.damageBoost) {
            ctx.save();
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
        }
        
        ctx.fillStyle = playerColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.damageBoost) {
            ctx.restore();
        }
        
        // Draw attack hitbox
        if (this.isAttacking) {
            ctx.fillStyle = COLORS.PLAYER_ATTACK;
            const attackX = this.facingRight ? this.x + this.width : this.x - GAME_CONFIG.ATTACK_RANGE;
            ctx.fillRect(attackX, this.y + 10, GAME_CONFIG.ATTACK_RANGE, this.height - 20);
        }
        
        // Render parry system effects
        this.parrySystem.render(ctx);
    }

    getAttackBox() {
        if (!this.isAttacking) return null;
        
        return {
            x: this.facingRight ? this.x + this.width : this.x - GAME_CONFIG.ATTACK_RANGE,
            y: this.y + 10,
            width: GAME_CONFIG.ATTACK_RANGE,
            height: this.height - 20
        };
    }
    
    // Stamina Management Methods
    updateStamina(deltaTime) {
        const currentTime = Date.now() / 1000;
        
        // Check if we should start regenerating stamina
        if (currentTime - this.lastStaminaUse >= this.staminaRegenDelay) {
            // Regenerate stamina
            if (this.stamina < this.maxStamina) {
                this.stamina += this.staminaRegenRate * deltaTime;
                this.stamina = Math.min(this.stamina, this.maxStamina);
                
                // No longer exhausted if we have some stamina
                if (this.stamina > 10) {
                    this.isExhausted = false;
                }
            }
        }
        
        // Check for exhaustion
        if (this.stamina <= 0) {
            this.isExhausted = true;
            this.stamina = 0;
            
            // Trigger stamina tutorial on first exhaustion
            tutorialSystem.triggerStaminaTutorial();
        }
    }
    
    canUseStamina(amount) {
        return this.stamina >= amount && !this.isExhausted;
    }
    
    useStamina(amount) {
        if (this.stamina >= amount) {
            this.stamina -= amount;
            this.lastStaminaUse = Date.now() / 1000;
            
            if (this.stamina <= 0) {
                this.isExhausted = true;
                this.stamina = 0;
            }
            return true;
        }
        return false;
    }
    
    getStaminaPercentage() {
        return this.stamina / this.maxStamina;
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        // Main platform body
        ctx.fillStyle = COLORS.PLATFORM;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Top edge highlight
        ctx.fillStyle = COLORS.PLATFORM_EDGE;
        ctx.fillRect(this.x, this.y, this.width, 2);
        
        // Side edges for depth
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x + this.width - 1, this.y, 1, this.height);
        ctx.fillRect(this.x, this.y + this.height - 1, this.width, 1);
    }
}

// Enemy Class (Basic)
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.velocityX = 1;
        this.velocityY = 0;
        this.health = 2;
        this.maxHealth = 2;
        this.damageFlashTimer = 0;
        this.attackTelegraph = 0;
        this.attackCooldown = 0;
        
        // Advanced combat properties
        this.currentAttack = null;
        this.attackTypes = this.getChapterAttackTypes();
        this.facingLeft = false;
        this.staggerTime = 0;
        this.lastAttackTime = 0;
        
        // Combo system properties
        this.inCombo = false;
        this.comboSequence = [];
        this.comboIndex = 0;
        this.comboTimer = 0;
    }
    
    getChapterAttackTypes() {
        const chapter = gameState.currentChapter || 1;
        switch (chapter) {
            case 1: return [ATTACK_TYPES.SLASH];
            case 2: return [ATTACK_TYPES.SLASH, ATTACK_TYPES.THRUST];
            case 3: return [ATTACK_TYPES.SLASH, ATTACK_TYPES.THRUST, ATTACK_TYPES.AOE_CIRCLE];
            case 4: return [ATTACK_TYPES.SLASH, ATTACK_TYPES.THRUST, ATTACK_TYPES.AOE_CIRCLE, ATTACK_TYPES.AOE_CONE, ATTACK_TYPES.CHARGE];
            case 5: return [ATTACK_TYPES.SLASH, ATTACK_TYPES.THRUST, ATTACK_TYPES.AOE_CIRCLE, ATTACK_TYPES.AOE_CONE, ATTACK_TYPES.CHARGE, ATTACK_TYPES.GROUND_SLAM];
            default: return [ATTACK_TYPES.SLASH];
        }
    }

    update() {
        // Update timers
        if (this.damageFlashTimer > 0) this.damageFlashTimer--;
        if (this.attackTelegraph > 0) this.attackTelegraph--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.staggerTime > 0) this.staggerTime -= deltaTime;

        // Update current attack
        if (this.currentAttack) {
            this.currentAttack.update(deltaTime);
            
            // Check if attack hits player and handle parrying
            if (this.currentAttack.state === ATTACK_STATES.EXECUTE) {
                const parryResult = player.parrySystem.checkParryAgainstAttack(this.currentAttack);
                if (!parryResult && this.currentAttack.checkPlayerHit()) {
                    // Player hit by attack
                    const damage = this.currentAttack.getScaledDamage();
                    player.takeDamage(damage);
                }
            }
            
            // Clean up finished attacks
            if (this.currentAttack.state === ATTACK_STATES.IDLE) {
                this.currentAttack = null;
            }
        }
        
        // Update combo sequence
        this.updateComboSequence(deltaTime);

        // Don't move while staggered
        if (this.staggerTime <= 0) {
            // Simple AI - move back and forth
            this.x += this.velocityX;
            
            // Update facing direction
            this.facingLeft = this.velocityX < 0;
            
            // Reverse direction at boundaries
            if (this.x <= 0 || this.x + this.width >= canvas.width) {
                this.velocityX *= -1;
            }

            // Attack logic when player is nearby
            const playerDistance = Math.abs(this.x - player.x);
            const currentTime = Date.now();
            if (playerDistance < 120 && !this.currentAttack && !this.inCombo && currentTime - this.lastAttackTime > 2000) {
                // Trigger parry tutorial on first enemy encounter
                if (this.lastAttackTime === 0) {
                    tutorialSystem.triggerParryTutorial();
                }
                
                this.initiateComboAttack();
                this.lastAttackTime = currentTime;
            }
        }

        // Apply gravity
        this.velocityY += GAME_CONFIG.GRAVITY;
        this.y += this.velocityY;
    }
    
    initiateAttack() {
        // Choose random attack type based on chapter
        const attackType = this.attackTypes[Math.floor(Math.random() * this.attackTypes.length)];
        
        switch (attackType) {
            case ATTACK_TYPES.SLASH:
                this.currentAttack = new SlashAttack(this);
                break;
            case ATTACK_TYPES.THRUST:
                this.currentAttack = new ThrustAttack(this);
                break;
            case ATTACK_TYPES.AOE_CIRCLE:
                this.currentAttack = new AOECircleAttack(this, 80);
                break;
            case ATTACK_TYPES.AOE_CONE:
                this.currentAttack = new AOEConeAttack(this);
                break;
            case ATTACK_TYPES.CHARGE:
                this.currentAttack = new ChargeAttack(this);
                tutorialSystem.triggerChargeTutorial();
                break;
            case ATTACK_TYPES.GROUND_SLAM:
                this.currentAttack = new GroundSlamAttack(this);
                tutorialSystem.triggerGroundSlamTutorial();
                break;
        }
        
        if (this.currentAttack) {
            this.currentAttack.startAttack();
        }
    }
    
    // Combo Attack System
    initiateComboAttack() {
        const chapter = gameState.currentChapter || 1;
        
        // Only chapters 4+ have combo attacks
        if (chapter < 4) {
            this.initiateAttack();
            return;
        }
        
        // 30% chance for combo attack in chapter 4+
        if (Math.random() < 0.3) {
            this.startComboSequence();
        } else {
            this.initiateAttack();
        }
    }
    
    startComboSequence() {
        this.comboSequence = [];
        this.comboIndex = 0;
        this.comboTimer = 0;
        this.inCombo = true;
        
        // Trigger combo tutorial
        tutorialSystem.triggerComboTutorial();
        
        // Create combo sequence based on chapter
        const chapter = gameState.currentChapter || 1;
        if (chapter >= 4) {
            // 2-3 attack combo
            const comboLength = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < comboLength; i++) {
                const attackType = this.attackTypes[Math.floor(Math.random() * this.attackTypes.length)];
                this.comboSequence.push(attackType);
            }
        }
        
        // Start first attack in combo
        this.executeNextComboAttack();
    }
    
    executeNextComboAttack() {
        if (this.comboIndex >= this.comboSequence.length) {
            this.endComboSequence();
            return;
        }
        
        const attackType = this.comboSequence[this.comboIndex];
        
        switch (attackType) {
            case ATTACK_TYPES.SLASH:
                this.currentAttack = new SlashAttack(this);
                break;
            case ATTACK_TYPES.THRUST:
                this.currentAttack = new ThrustAttack(this);
                break;
            case ATTACK_TYPES.AOE_CIRCLE:
                this.currentAttack = new AOECircleAttack(this, 60); // Smaller AOE in combos
                break;
            case ATTACK_TYPES.AOE_CONE:
                this.currentAttack = new AOEConeAttack(this, Math.PI / 4, 100); // Smaller cone in combos
                break;
            case ATTACK_TYPES.CHARGE:
                this.currentAttack = new ChargeAttack(this);
                break;
            case ATTACK_TYPES.GROUND_SLAM:
                this.currentAttack = new GroundSlamAttack(this);
                break;
        }
        
        if (this.currentAttack) {
            this.currentAttack.startAttack();
            this.comboIndex++;
        }
    }
    
    updateComboSequence(deltaTime) {
        if (!this.inCombo) return;
        
        // Check if current attack is finished
        if (!this.currentAttack || this.currentAttack.state === ATTACK_STATES.IDLE) {
            this.comboTimer += deltaTime;
            
            // Wait 0.3 seconds between combo attacks
            if (this.comboTimer >= 0.3) {
                this.comboTimer = 0;
                this.executeNextComboAttack();
            }
        }
    }
    
    endComboSequence() {
        this.inCombo = false;
        this.comboSequence = [];
        this.comboIndex = 0;
        this.comboTimer = 0;
    }
    
    stagger(duration) {
        this.staggerTime = duration;
        this.velocityX = 0;
        
        // Create stagger effect
        createDamageParticles(this.x + this.width/2, this.y + this.height/2);
    }

    takeDamage(damage) {
        this.health -= damage;
        this.damageFlashTimer = 10;
        
        // Create damage particles
        createDamageParticles(this.x + this.width/2, this.y + this.height/2);
        
        return this.health <= 0;
    }

    checkCollisionWithRect(rect) {
        if (!rect || typeof rect.x !== 'number') return false;
        
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    draw() {
        // Choose color based on state
        let enemyColor = COLORS.ENEMY;
        if (this.damageFlashTimer > 0) {
            enemyColor = COLORS.ENEMY_DAMAGED;
        } else if (this.staggerTime > 0) {
            enemyColor = '#FFAA00'; // Orange when staggered
        }
        
        ctx.fillStyle = enemyColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw current attack
        if (this.currentAttack) {
            this.currentAttack.render(ctx);
        }
        
        // Draw attack telegraph (legacy support)
        if (this.attackTelegraph > 0) {
            const intensity = this.attackTelegraph / 30;
            ctx.save();
            ctx.globalAlpha = intensity * 0.7;
            ctx.fillStyle = COLORS.ENEMY_ATTACK;
            
            // Draw attack range indicator
            const attackRange = 60;
            const attackX = this.x - (attackRange - this.width) / 2;
            ctx.fillRect(attackX, this.y + this.height - 5, attackRange, 5);
            
            // Draw warning glow around enemy
            ctx.strokeStyle = COLORS.ENEMY_ATTACK;
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.restore();
        }
        
        // Draw simple health bar
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#333333';
            ctx.fillRect(this.x, this.y - 10, this.width, 4);
            ctx.fillStyle = COLORS.HEALTH;
            ctx.fillRect(this.x, this.y - 10, (this.health / this.maxHealth) * this.width, 4);
        }
    }
}

// ===== ADVANCED COMBAT SYSTEM =====

// Attack Types Enum
const ATTACK_TYPES = {
    SLASH: 'slash',
    THRUST: 'thrust',
    AOE_CIRCLE: 'aoe_circle',
    AOE_CONE: 'aoe_cone',
    CHARGE: 'charge',
    GROUND_SLAM: 'ground_slam',
    PROJECTILE: 'projectile'
};

// Attack States
const ATTACK_STATES = {
    IDLE: 'idle',
    TELEGRAPH: 'telegraph',
    WINDUP: 'windup',
    EXECUTE: 'execute',
    RECOVERY: 'recovery'
};

// Base Attack Class
class AttackBase {
    constructor(enemy, type, damage, range, telegraphTime, windupTime, executeTime, recoveryTime) {
        this.enemy = enemy;
        this.type = type;
        this.damage = damage;
        this.range = range;
        this.telegraphTime = telegraphTime;
        this.windupTime = windupTime;
        this.executeTime = executeTime;
        this.recoveryTime = recoveryTime;
        
        this.state = ATTACK_STATES.IDLE;
        this.stateTimer = 0;
        this.isParryable = true;
        this.hitboxes = [];
        this.particles = [];
        
        // Chapter-based scaling
        this.chapterScaling = this.getChapterScaling();
    }
    
    getChapterScaling() {
        const chapter = gameState.currentChapter || 1;
        const scalingTable = {
            1: { telegraphTime: 1.5, damage: 1.0, speed: 1.0 },
            2: { telegraphTime: 1.25, damage: 1.1, speed: 1.1 },
            3: { telegraphTime: 1.0, damage: 1.25, speed: 1.2 },
            4: { telegraphTime: 0.8, damage: 1.4, speed: 1.3 },
            5: { telegraphTime: 0.6, damage: 1.75, speed: 1.5 }
        };
        return scalingTable[chapter] || scalingTable[1];
    }
    
    startAttack() {
        if (this.state !== ATTACK_STATES.IDLE) return false;
        
        this.state = ATTACK_STATES.TELEGRAPH;
        this.stateTimer = 0;
        this.createTelegraphEffects();
        return true;
    }
    
    update(deltaTime) {
        this.stateTimer += deltaTime;
        
        switch (this.state) {
            case ATTACK_STATES.TELEGRAPH:
                this.updateTelegraph(deltaTime);
                if (this.stateTimer >= this.telegraphTime * this.chapterScaling.telegraphTime) {
                    this.state = ATTACK_STATES.WINDUP;
                    this.stateTimer = 0;
                }
                break;
                
            case ATTACK_STATES.WINDUP:
                this.updateWindup(deltaTime);
                if (this.stateTimer >= this.windupTime) {
                    this.state = ATTACK_STATES.EXECUTE;
                    this.stateTimer = 0;
                    this.executeAttack();
                }
                break;
                
            case ATTACK_STATES.EXECUTE:
                this.updateExecute(deltaTime);
                if (this.stateTimer >= this.executeTime) {
                    this.state = ATTACK_STATES.RECOVERY;
                    this.stateTimer = 0;
                }
                break;
                
            case ATTACK_STATES.RECOVERY:
                this.updateRecovery(deltaTime);
                if (this.stateTimer >= this.recoveryTime) {
                    this.state = ATTACK_STATES.IDLE;
                    this.stateTimer = 0;
                    this.cleanup();
                }
                break;
        }
        
        this.updateParticles(deltaTime);
    }
    
    createTelegraphEffects() {
        // Override in subclasses
    }
    
    updateTelegraph(deltaTime) {
        // Override in subclasses
    }
    
    updateWindup(deltaTime) {
        // Override in subclasses
    }
    
    executeAttack() {
        // Override in subclasses
    }
    
    updateExecute(deltaTime) {
        // Override in subclasses
    }
    
    updateRecovery(deltaTime) {
        // Override in subclasses
    }
    
    cleanup() {
        this.hitboxes = [];
        this.particles = [];
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
    }
    
    render(ctx) {
        this.renderTelegraph(ctx);
        this.renderHitboxes(ctx);
        this.renderParticles(ctx);
    }
    
    renderTelegraph(ctx) {
        // Override in subclasses
    }
    
    renderHitboxes(ctx) {
        if (gameState.debugMode) {
            ctx.strokeStyle = this.isParryable ? 'yellow' : 'red';
            ctx.lineWidth = 2;
            this.hitboxes.forEach(hitbox => {
                ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
            });
        }
    }
    
    renderParticles(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }
    
    checkPlayerHit() {
        if (this.state !== ATTACK_STATES.EXECUTE) return false;
        
        return this.hitboxes.some(hitbox => 
            player.x < hitbox.x + hitbox.width &&
            player.x + player.width > hitbox.x &&
            player.y < hitbox.y + hitbox.height &&
            player.y + player.height > hitbox.y
        );
    }
    
    getScaledDamage() {
        return Math.floor(this.damage * this.chapterScaling.damage);
    }
}

// Slash Attack Class
class SlashAttack extends AttackBase {
    constructor(enemy, direction = 'horizontal') {
        super(enemy, ATTACK_TYPES.SLASH, 20, 80, 1.0, 0.3, 0.2, 0.5);
        this.direction = direction; // 'horizontal', 'vertical', 'diagonal'
        this.slashAngle = this.getSlashAngle();
    }
    
    getSlashAngle() {
        switch (this.direction) {
            case 'horizontal': return 0;
            case 'vertical': return Math.PI / 2;
            case 'diagonal': return Math.PI / 4;
            default: return 0;
        }
    }
    
    createTelegraphEffects() {
        // Create telegraph glow
        const glowIntensity = Math.sin(this.stateTimer * 8) * 0.5 + 0.5;
        this.telegraphGlow = {
            intensity: glowIntensity,
            color: this.isParryable ? 'rgba(255, 255, 0, ' : 'rgba(255, 0, 0, '
        };
    }
    
    updateTelegraph(deltaTime) {
        const progress = this.stateTimer / (this.telegraphTime * this.chapterScaling.telegraphTime);
        this.telegraphGlow.intensity = Math.sin(progress * Math.PI * 6) * 0.5 + 0.5;
    }
    
    executeAttack() {
        // Create hitbox based on direction
        const hitboxWidth = this.direction === 'vertical' ? 40 : this.range;
        const hitboxHeight = this.direction === 'horizontal' ? 40 : this.range;
        
        this.hitboxes = [{
            x: this.enemy.x + (this.enemy.facingLeft ? -this.range : this.enemy.width),
            y: this.enemy.y + this.enemy.height / 2 - hitboxHeight / 2,
            width: hitboxWidth,
            height: hitboxHeight
        }];
        
        // Create slash particles
        this.createSlashParticles();
        
        // Play attack sound
        if (audioManager) {
            audioManager.playAttackSound('slash');
        }
    }
    
    createSlashParticles() {
        const particleCount = 8;
        const startX = this.enemy.x + this.enemy.width / 2;
        const startY = this.enemy.y + this.enemy.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = this.slashAngle + (Math.random() - 0.5) * 0.5;
            const speed = 150 + Math.random() * 100;
            
            this.particles.push(new Particle(
                startX + Math.cos(angle) * 20,
                startY + Math.sin(angle) * 20,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.3,
                '#FFD700',
                3
            ));
        }
    }
    
    renderTelegraph(ctx) {
        if (this.state === ATTACK_STATES.TELEGRAPH && this.telegraphGlow) {
            ctx.save();
            ctx.globalAlpha = this.telegraphGlow.intensity;
            ctx.strokeStyle = this.telegraphGlow.color + this.telegraphGlow.intensity + ')';
            ctx.lineWidth = 4;
            
            const centerX = this.enemy.x + this.enemy.width / 2;
            const centerY = this.enemy.y + this.enemy.height / 2;
            const length = this.range;
            
            ctx.beginPath();
            if (this.direction === 'horizontal') {
                const startX = this.enemy.facingLeft ? centerX - length : centerX;
                const endX = this.enemy.facingLeft ? centerX : centerX + length;
                ctx.moveTo(startX, centerY);
                ctx.lineTo(endX, centerY);
            } else if (this.direction === 'vertical') {
                ctx.moveTo(centerX, centerY - length / 2);
                ctx.lineTo(centerX, centerY + length / 2);
            } else if (this.direction === 'diagonal') {
                const offset = length / 2;
                ctx.moveTo(centerX - offset, centerY - offset);
                ctx.lineTo(centerX + offset, centerY + offset);
            }
            ctx.stroke();
            ctx.restore();
        }
    }
}

// Thrust Attack Class
class ThrustAttack extends AttackBase {
    constructor(enemy) {
        super(enemy, ATTACK_TYPES.THRUST, 25, 120, 0.8, 0.2, 0.15, 0.4);
        this.thrustDistance = 0;
        this.maxThrustDistance = 60;
    }
    
    createTelegraphEffects() {
        this.telegraphGlow = {
            intensity: 0,
            color: 'rgba(255, 165, 0, '
        };
    }
    
    updateTelegraph(deltaTime) {
        const progress = this.stateTimer / (this.telegraphTime * this.chapterScaling.telegraphTime);
        this.telegraphGlow.intensity = Math.sin(progress * Math.PI * 8) * 0.7 + 0.3;
    }
    
    executeAttack() {
        // Create narrow, long hitbox for thrust
        this.hitboxes = [{
            x: this.enemy.x + (this.enemy.facingLeft ? -this.range : this.enemy.width),
            y: this.enemy.y + this.enemy.height / 2 - 15,
            width: this.range,
            height: 30
        }];
        
        this.createThrustParticles();
        
        if (audioManager) {
            audioManager.playAttackSound('thrust');
        }
    }
    
    createThrustParticles() {
        const startX = this.enemy.x + this.enemy.width / 2;
        const startY = this.enemy.y + this.enemy.height / 2;
        const direction = this.enemy.facingLeft ? -1 : 1;
        
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(
                startX + direction * 30,
                startY + (Math.random() - 0.5) * 20,
                direction * (200 + Math.random() * 100),
                (Math.random() - 0.5) * 50,
                0.25,
                '#FFA500',
                2
            ));
        }
    }
    
    renderTelegraph(ctx) {
        if (this.state === ATTACK_STATES.TELEGRAPH && this.telegraphGlow) {
            ctx.save();
            ctx.globalAlpha = this.telegraphGlow.intensity;
            ctx.strokeStyle = this.telegraphGlow.color + this.telegraphGlow.intensity + ')';
            ctx.lineWidth = 3;
            
            const centerX = this.enemy.x + this.enemy.width / 2;
            const centerY = this.enemy.y + this.enemy.height / 2;
            const direction = this.enemy.facingLeft ? -1 : 1;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + direction * this.range, centerY);
            ctx.stroke();
            
            // Add arrowhead
            const arrowX = centerX + direction * this.range;
            ctx.beginPath();
            ctx.moveTo(arrowX, centerY);
            ctx.lineTo(arrowX - direction * 15, centerY - 8);
            ctx.lineTo(arrowX - direction * 15, centerY + 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
}

// AOE Circle Attack Class
class AOECircleAttack extends AttackBase {
    constructor(enemy, radius = 100) {
        super(enemy, ATTACK_TYPES.AOE_CIRCLE, 30, radius, 1.2, 0.4, 0.3, 0.6);
        this.radius = radius;
        this.currentRadius = 0;
        this.isParryable = false; // AOE attacks cannot be parried
    }
    
    createTelegraphEffects() {
        this.telegraphCircle = {
            radius: 0,
            maxRadius: this.radius,
            color: 'rgba(255, 0, 0, 0.3)',
            borderColor: 'rgba(255, 0, 0, 0.8)'
        };
    }
    
    updateTelegraph(deltaTime) {
        const progress = this.stateTimer / (this.telegraphTime * this.chapterScaling.telegraphTime);
        this.telegraphCircle.radius = this.radius * progress;
    }
    
    executeAttack() {
        const centerX = this.enemy.x + this.enemy.width / 2;
        const centerY = this.enemy.y + this.enemy.height / 2;
        
        // Create circular hitbox
        this.hitboxes = [{
            x: centerX - this.radius,
            y: centerY - this.radius,
            width: this.radius * 2,
            height: this.radius * 2,
            isCircular: true,
            centerX: centerX,
            centerY: centerY,
            radius: this.radius
        }];
        
        this.createAOEParticles();
        
        // Trigger AOE tutorial
        tutorialSystem.triggerAOETutorial();
        
        if (audioManager) {
            audioManager.playAttackSound('aoe');
        }
    }
    
    createAOEParticles() {
        const centerX = this.enemy.x + this.enemy.width / 2;
        const centerY = this.enemy.y + this.enemy.height / 2;
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = this.radius * (0.7 + Math.random() * 0.3);
            
            this.particles.push(new Particle(
                centerX + Math.cos(angle) * distance,
                centerY + Math.sin(angle) * distance,
                Math.cos(angle) * 100,
                Math.sin(angle) * 100,
                0.4,
                '#FF4444',
                4
            ));
        }
    }
    
    checkPlayerHit() {
        if (this.state !== ATTACK_STATES.EXECUTE) return false;
        
        return this.hitboxes.some(hitbox => {
            if (hitbox.isCircular) {
                const dx = (player.x + player.width / 2) - hitbox.centerX;
                const dy = (player.y + player.height / 2) - hitbox.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance <= hitbox.radius;
            }
            return false;
        });
    }
    
    renderTelegraph(ctx) {
        if (this.state === ATTACK_STATES.TELEGRAPH && this.telegraphCircle) {
            const centerX = this.enemy.x + this.enemy.width / 2;
            const centerY = this.enemy.y + this.enemy.height / 2;
            
            ctx.save();
            
            // Fill circle
            ctx.fillStyle = this.telegraphCircle.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.telegraphCircle.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Border circle
            ctx.strokeStyle = this.telegraphCircle.borderColor;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

// AOE Cone Attack Class
class AOEConeAttack extends AttackBase {
    constructor(enemy, angle = Math.PI / 3, range = 120) {
        super(enemy, ATTACK_TYPES.AOE_CONE, 35, range, 1.0, 0.3, 0.25, 0.5);
        this.coneAngle = angle;
        this.isParryable = false; // AOE attacks cannot be parried
    }
    
    createTelegraphEffects() {
        this.telegraphCone = {
            angle: 0,
            maxAngle: this.coneAngle,
            color: 'rgba(255, 100, 0, 0.3)',
            borderColor: 'rgba(255, 100, 0, 0.8)'
        };
    }
    
    updateTelegraph(deltaTime) {
        const progress = this.stateTimer / (this.telegraphTime * this.chapterScaling.telegraphTime);
        this.telegraphCone.angle = this.coneAngle * progress;
    }
    
    executeAttack() {
        const centerX = this.enemy.x + this.enemy.width / 2;
        const centerY = this.enemy.y + this.enemy.height / 2;
        const direction = this.enemy.facingLeft ? Math.PI : 0;
        
        // Create cone hitbox (approximated as triangle)
        const halfAngle = this.coneAngle / 2;
        const x1 = centerX;
        const y1 = centerY;
        const x2 = centerX + Math.cos(direction - halfAngle) * this.range;
        const y2 = centerY + Math.sin(direction - halfAngle) * this.range;
        const x3 = centerX + Math.cos(direction + halfAngle) * this.range;
        const y3 = centerY + Math.sin(direction + halfAngle) * this.range;
        
        this.hitboxes = [{
            isCone: true,
            centerX: centerX,
            centerY: centerY,
            direction: direction,
            angle: this.coneAngle,
            range: this.range,
            vertices: [
                { x: x1, y: y1 },
                { x: x2, y: y2 },
                { x: x3, y: y3 }
            ]
        }];
        
        this.createConeParticles();
        
        if (audioManager) {
            audioManager.playAttackSound('cone');
        }
    }
    
    createConeParticles() {
        const centerX = this.enemy.x + this.enemy.width / 2;
        const centerY = this.enemy.y + this.enemy.height / 2;
        const direction = this.enemy.facingLeft ? Math.PI : 0;
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = direction + (Math.random() - 0.5) * this.coneAngle;
            const distance = Math.random() * this.range;
            
            this.particles.push(new Particle(
                centerX + Math.cos(angle) * distance,
                centerY + Math.sin(angle) * distance,
                Math.cos(angle) * 150,
                Math.sin(angle) * 150,
                0.35,
                '#FF6600',
                3
            ));
        }
    }
    
    checkPlayerHit() {
        if (this.state !== ATTACK_STATES.EXECUTE) return false;
        
        return this.hitboxes.some(hitbox => {
            if (hitbox.isCone) {
                const playerCenterX = player.x + player.width / 2;
                const playerCenterY = player.y + player.height / 2;
                
                // Check if player is within cone
                const dx = playerCenterX - hitbox.centerX;
                const dy = playerCenterY - hitbox.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > hitbox.range) return false;
                
                const playerAngle = Math.atan2(dy, dx);
                const angleDiff = Math.abs(playerAngle - hitbox.direction);
                const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                
                return normalizedAngleDiff <= hitbox.angle / 2;
            }
            return false;
        });
    }
    
    renderTelegraph(ctx) {
        if (this.state === ATTACK_STATES.TELEGRAPH && this.telegraphCone) {
            const centerX = this.enemy.x + this.enemy.width / 2;
            const centerY = this.enemy.y + this.enemy.height / 2;
            const direction = this.enemy.facingLeft ? Math.PI : 0;
            const halfAngle = this.telegraphCone.angle / 2;
            
            ctx.save();
            
            // Fill cone
            ctx.fillStyle = this.telegraphCone.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, this.range, direction - halfAngle, direction + halfAngle);
            ctx.closePath();
            ctx.fill();
            
            // Border cone
            ctx.strokeStyle = this.telegraphCone.borderColor;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

// ===== PLAYER PARRY SYSTEM =====

// Parry States
const PARRY_STATES = {
    READY: 'ready',
    ACTIVE: 'active',
    RECOVERY: 'recovery',
    COOLDOWN: 'cooldown'
};

// Parry Results
const PARRY_RESULTS = {
    PERFECT: 'perfect',
    GOOD: 'good',
    FAILED: 'failed',
    MISSED: 'missed'
};

class ParrySystem {
    constructor(player) {
        this.player = player;
        this.state = PARRY_STATES.READY;
        this.stateTimer = 0;
        
        // Chapter-based parry windows (in frames at 60fps)
        this.parryWindows = {
            1: { perfect: 3, good: 12, total: 15 },
            2: { perfect: 3, good: 10, total: 13 },
            3: { perfect: 2, good: 8, total: 10 },
            4: { perfect: 2, good: 8, total: 10 },
            5: { perfect: 2, good: 6, total: 8 }
        };
        
        // Timing constants (in seconds)
        this.activeTime = 0.25;    // How long parry window stays open
        this.recoveryTime = 0.2;   // Recovery after parry attempt
        this.cooldownTime = 0.1;   // Cooldown before next parry
        
        // Parry effects
        this.parryEffects = [];
        this.lastParryResult = null;
        this.parryStreak = 0;
        this.totalParries = 0;
        this.successfulParries = 0;
        
        // Riposte system
        this.riposteWindow = 0;
        this.riposteWindowDuration = 1.0; // 1 second window after successful parry
        this.riposteDamageMultiplier = 2.0; // Double damage for riposte attacks
        this.canRiposte = false;
        
        // Visual feedback
        this.parryGlow = {
            intensity: 0,
            color: '#FFD700',
            duration: 0
        };
    }
    
    getCurrentParryWindow() {
        const chapter = gameState.currentChapter || 1;
        return this.parryWindows[chapter] || this.parryWindows[1];
    }
    
    attemptParry() {
        if (this.state !== PARRY_STATES.READY) return false;
        
        this.state = PARRY_STATES.ACTIVE;
        this.stateTimer = 0;
        this.createParryEffects();
        
        // Play parry attempt sound
        if (audioManager) {
            audioManager.playAttackSound('parry_attempt');
        }
        
        return true;
    }
    
    update(deltaTime) {
        this.stateTimer += deltaTime;
        
        switch (this.state) {
            case PARRY_STATES.ACTIVE:
                if (this.stateTimer >= this.activeTime) {
                    this.state = PARRY_STATES.RECOVERY;
                    this.stateTimer = 0;
                    
                    // If no successful parry occurred, it's a missed parry
                    if (this.lastParryResult === null) {
                        this.handleParryResult(PARRY_RESULTS.MISSED);
                    }
                }
                break;
                
            case PARRY_STATES.RECOVERY:
                if (this.stateTimer >= this.recoveryTime) {
                    this.state = PARRY_STATES.COOLDOWN;
                    this.stateTimer = 0;
                }
                break;
                
            case PARRY_STATES.COOLDOWN:
                if (this.stateTimer >= this.cooldownTime) {
                    this.state = PARRY_STATES.READY;
                    this.stateTimer = 0;
                    this.lastParryResult = null;
                }
                break;
        }
        
        // Update riposte window
        if (this.riposteWindow > 0) {
            this.riposteWindow -= deltaTime;
            if (this.riposteWindow <= 0) {
                this.canRiposte = false;
            }
        }
        
        this.updateEffects(deltaTime);
    }
    
    checkParryAgainstAttack(attack) {
        if (this.state !== PARRY_STATES.ACTIVE) return false;
        if (!attack || !attack.isParryable) return false;
        if (attack.state !== ATTACK_STATES.EXECUTE) return false;
        
        // Check if attack is hitting player
        if (!attack.checkPlayerHit()) return false;
        
        // Determine parry quality based on timing
        const frameTime = 1/60; // 60 FPS
        const parryFrames = Math.floor(this.stateTimer / frameTime);
        const window = this.getCurrentParryWindow();
        
        let result;
        if (parryFrames <= window.perfect) {
            result = PARRY_RESULTS.PERFECT;
        } else if (parryFrames <= window.good) {
            result = PARRY_RESULTS.GOOD;
        } else {
            result = PARRY_RESULTS.FAILED;
        }
        
        this.handleParryResult(result, attack);
        
        // Trigger tutorial for perfect parry
        if (result === PARRY_RESULTS.PERFECT) {
            tutorialSystem.triggerPerfectParryTutorial();
        }
        
        // Play parry sound based on quality
        if (audioManager) {
            const soundQuality = result === PARRY_RESULTS.PERFECT ? 'perfect' : 
                                result === PARRY_RESULTS.GOOD ? 'good' : 'failed';
            if (audioManager.playParrySound) {
                audioManager.playParrySound(soundQuality);
            }
        }
        
        return result !== PARRY_RESULTS.FAILED;
    }
    
    handleParryResult(result, attack = null) {
        this.lastParryResult = result;
        this.totalParries++;
        
        switch (result) {
            case PARRY_RESULTS.PERFECT:
                this.successfulParries++;
                this.parryStreak++;
                this.grantParryRewards(result, attack);
                this.createParrySuccessEffects('perfect');
                // Enable riposte window
                this.riposteWindow = this.riposteWindowDuration;
                this.canRiposte = true;
                tutorialSystem.triggerRiposteTutorial();
                if (audioManager) audioManager.playAttackSound('parry_perfect');
                break;
                
            case PARRY_RESULTS.GOOD:
                this.successfulParries++;
                this.parryStreak++;
                this.grantParryRewards(result, attack);
                this.createParrySuccessEffects('good');
                // Enable shorter riposte window for good parries
                this.riposteWindow = this.riposteWindowDuration * 0.7;
                this.canRiposte = true;
                if (audioManager) audioManager.playAttackSound('parry_good');
                break;
                
            case PARRY_RESULTS.FAILED:
                this.parryStreak = 0;
                this.createParryFailEffects();
                if (audioManager) audioManager.playAttackSound('parry_fail');
                break;
                
            case PARRY_RESULTS.MISSED:
                this.parryStreak = 0;
                break;
        }
        
        // Update player vulnerability and stamina penalties
        if (result === PARRY_RESULTS.FAILED) {
            this.player.vulnerabilityTime = 0.5; // Extra vulnerability after failed parry
            this.player.useStamina(20); // Extra stamina penalty for failed parry
        } else if (result === PARRY_RESULTS.MISSED) {
            this.player.useStamina(5); // Small penalty for missed parry
        }
    }
    
    grantParryRewards(result, attack) {
        let soulReward = 0;
        let damageBoostDuration = 0;
        
        switch (result) {
            case PARRY_RESULTS.PERFECT:
                soulReward = 15 + (this.parryStreak * 2);
                damageBoostDuration = 3.0;
                break;
            case PARRY_RESULTS.GOOD:
                soulReward = 10 + this.parryStreak;
                damageBoostDuration = 2.0;
                break;
        }
        
        // Grant soul reward
        if (soulReward > 0) {
            gameState.souls += soulReward;
            this.createSoulRewardEffect(soulReward);
        }
        
        // Grant damage boost
        if (damageBoostDuration > 0) {
            this.player.damageBoost = {
                multiplier: result === PARRY_RESULTS.PERFECT ? 1.5 : 1.25,
                duration: damageBoostDuration
            };
        }
        
        // Stagger enemy
        if (attack && attack.enemy) {
            attack.enemy.stagger(result === PARRY_RESULTS.PERFECT ? 1.5 : 1.0);
        }
    }
    
    createParryEffects() {
        this.parryGlow = {
            intensity: 1.0,
            color: '#FFD700',
            duration: this.activeTime
        };
    }
    
    createParrySuccessEffects(quality) {
        const color = quality === 'perfect' ? '#FFD700' : '#FFA500';
        const particleCount = quality === 'perfect' ? 12 : 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = quality === 'perfect' ? 200 : 150;
            
            this.parryEffects.push(new Particle(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.5,
                color,
                quality === 'perfect' ? 5 : 3
            ));
        }
        
        // Screen flash effect for perfect parries
        if (quality === 'perfect') {
            gameState.screenFlash = {
                intensity: 0.3,
                color: '#FFD700',
                duration: 0.1
            };
        }
    }
    
    createParryFailEffects() {
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            
            this.parryEffects.push(new Particle(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                Math.cos(angle) * 100,
                Math.sin(angle) * 100,
                0.3,
                '#FF4444',
                2
            ));
        }
    }
    
    createSoulRewardEffect(amount) {
        // Create floating text effect
        this.parryEffects.push({
            type: 'text',
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            text: `+${amount} Souls`,
            color: '#FFD700',
            life: 1.0,
            maxLife: 1.0,
            velocityY: -50,
            update: function(deltaTime) {
                this.life -= deltaTime;
                this.y += this.velocityY * deltaTime;
                this.velocityY *= 0.95;
            },
            render: function(ctx) {
                ctx.save();
                ctx.globalAlpha = this.life / this.maxLife;
                ctx.fillStyle = this.color;
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.text, this.x, this.y);
                ctx.restore();
            }
        });
    }
    
    updateEffects(deltaTime) {
        // Update parry glow
        if (this.parryGlow.duration > 0) {
            this.parryGlow.duration -= deltaTime;
            this.parryGlow.intensity = Math.max(0, this.parryGlow.duration / this.activeTime);
        }
        
        // Update parry effects
        this.parryEffects = this.parryEffects.filter(effect => {
            if (effect.update) {
                effect.update(deltaTime);
                return effect.life > 0;
            } else {
                effect.update(deltaTime);
                return effect.life > 0;
            }
        });
    }
    
    render(ctx) {
        // Render parry glow
        if (this.parryGlow.intensity > 0) {
            ctx.save();
            ctx.globalAlpha = this.parryGlow.intensity * 0.5;
            ctx.strokeStyle = this.parryGlow.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(
                this.player.x - 5,
                this.player.y - 5,
                this.player.width + 10,
                this.player.height + 10
            );
            ctx.restore();
        }
        
        // Render parry effects
        this.parryEffects.forEach(effect => {
            if (effect.render) {
                effect.render(ctx);
            } else {
                effect.render(ctx);
            }
        });
        
        // Render parry timing indicator (debug mode)
        if (gameState.debugMode && this.state === PARRY_STATES.ACTIVE) {
            const window = this.getCurrentParryWindow();
            const frameTime = 1/60;
            const currentFrame = Math.floor(this.stateTimer / frameTime);
            
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 150, 200, 60);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.fillText(`Parry Frame: ${currentFrame}`, 15, 170);
            ctx.fillText(`Perfect: 0-${window.perfect}`, 15, 185);
            ctx.fillText(`Good: ${window.perfect+1}-${window.good}`, 15, 200);
            
            ctx.restore();
        }
    }
    
    getSuccessRate() {
        return this.totalParries > 0 ? (this.successfulParries / this.totalParries) * 100 : 0;
    }
    
    reset() {
        this.state = PARRY_STATES.READY;
        this.stateTimer = 0;
        this.lastParryResult = null;
        this.parryEffects = [];
        this.parryGlow.intensity = 0;
    }
}

// ========================================
// GLOBAL INSTANCES (Will be created after class definitions)
// ========================================

// Global instances will be created at the end of the file



// ========================================
// GAME INSTANCES
// ========================================

// Game Objects
let player = new Player(100, 300);
let platforms = [
    new Platform(0, canvas.height - 30, canvas.width, 30), // Ground
    new Platform(200, 350, 200, 20),
    new Platform(500, 300, 150, 20),
    new Platform(100, 200, 100, 20)
];
let enemies = [
    new Enemy(300, 320),
    new Enemy(600, 270)
];

// ========================================
// COLLISION DETECTION
// ========================================

function checkCollisions() {
    // Player-Platform collisions
    player.isOnGround = false;
    
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height) {
            
            // Landing on top
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isOnGround = true;
            }
        }
    });

    // Enemy-Platform collisions (basic)
    enemies.forEach(enemy => {
        platforms.forEach(platform => {
            if (enemy.x + enemy.width > platform.x &&
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height > platform.y &&
                enemy.y < platform.y + platform.height) {
                
                if (enemy.velocityY > 0 && enemy.y + enemy.height - enemy.velocityY <= platform.y) {
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                }
            }
        });
    });

    // Combat collisions
    const attackBox = player.getAttackBox();
    if (attackBox) {
        // Check player attack vs enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].checkCollisionWithRect(attackBox)) {
                if (enemies[i].takeDamage(1)) {
                    // Create death explosion particles
                    createEnemyDeathParticles(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2);
                    
                    // Award souls with visual effect
                    gameState.souls += 10;
                    createSoulRewardParticles(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, 10);
                    
                    enemies.splice(i, 1); // Remove dead enemy
                    gameState.enemiesDefeated++;
                    
                    // Trigger story events
                    if (gameState.enemiesDefeated === 1) {
                        triggerStoryEvent('firstEnemyDefeated');
                    }
                    if (enemies.length === 1) {
                        triggerStoryEvent('halfEnemiesDefeated');
                    }
                    if (enemies.length === 0) {
                        triggerStoryEvent('allEnemiesDefeated');
                        // Victory after dialogue completes
                        setTimeout(() => {
                            if (!gameState.inDialogue) {
                                gameState.current = 'victory';
                            }
                        }, 5000);
                    }
                }
            }
        }
    }

    // Check enemy damage to player
    enemies.forEach(enemy => {
        if (player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height) {
            player.takeDamage(1);
        }
    });
}

// Input System
const keys = {};
const keyPressed = {};

// Initialize Input Handlers
function initializeInput() {
    window.addEventListener('keydown', (e) => {
        if (e.code) {
            keys[e.code] = true;
            keyPressed[e.code] = true;
            
            // Only prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyJ', 'Escape'].includes(e.code)) {
                e.preventDefault();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code) {
            keys[e.code] = false;
            
            // Only prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyJ', 'Escape'].includes(e.code)) {
                e.preventDefault();
            }
        }
    });

    // Mouse click for menus
    canvas.addEventListener('click', handleMouseClick);
}

// Mouse Click Handler
function handleMouseClick(e) {
    try {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Validate click coordinates
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            return;
        }
        
        // Enable audio on first click
        audioManager.enableAudio();
        
        // Check sound button (always visible)
        const soundButtonX = canvas.width - 50;
        const soundButtonY = 30;
        const distance = Math.sqrt((x - soundButtonX) ** 2 + (y - soundButtonY) ** 2);
        if (distance <= 20) {
            audioManager.toggleSound();
            return;
        }
        
        // Handle clicks based on current state
        switch (gameState.current) {
            case 'menu':
                handleMenuClick(x, y);
                break;
            case 'paused':
                handlePauseClick(x, y);
                break;
            case 'gameOver':
                handleGameOverClick(x, y);
                break;
            case 'controls':
                handleControlsClick(x, y);
                break;
            case 'victory':
                handleVictoryClick(x, y);
                break;
        }
    } catch (error) {
        console.warn('Mouse click error:', error);
    }
}

// Menu Click Logic
function handleMenuClick(x, y) {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Start Game button
    const startY = canvas.height / 2;
            if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= startY && y <= startY + buttonHeight) {
            gameState.current = 'playing';
            audioManager.playMusic();
            triggerStoryEvent('gameStart'); // Start the story
            return;
        }
    
    // Controls button
    const controlsY = canvas.height / 2 + 70;
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= controlsY && y <= controlsY + buttonHeight) {
        gameState.current = 'controls';
        return;
    }
}

// Pause Menu Click Logic
function handlePauseClick(x, y) {
    const buttonWidth = 180;
    const buttonHeight = 45;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Resume button
    const resumeY = canvas.height / 2;
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= resumeY && y <= resumeY + buttonHeight) {
        gameState.current = 'playing';
        audioManager.playMusic();
        return;
    }
    
    // Main Menu button
    const menuY = canvas.height / 2 + 60;
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= menuY && y <= menuY + buttonHeight) {
        gameState.current = 'menu';
        audioManager.pauseMusic();
        resetGame();
        return;
    }
}

// Game Over Click Logic
function handleGameOverClick(x, y) {
    const buttonWidth = 180;
    const buttonHeight = 45;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Restart button
    const restartY = canvas.height / 2 + 50;
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= restartY && y <= restartY + buttonHeight) {
        resetGame();
        gameState.current = 'playing';
        audioManager.playMusic();
        return;
    }
    
    // Main Menu button
    const menuY = canvas.height / 2 + 110;
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= menuY && y <= menuY + buttonHeight) {
        gameState.current = 'menu';
        audioManager.pauseMusic();
        resetGame();
        return;
    }
}

// Basic Game Loop
let lastTime = 0;
const frameTime = 1000 / GAME_CONFIG.TARGET_FPS;
let deltaTime = 0;

function gameLoop(currentTime = 0) {
    try {
        // Calculate deltaTime for frame-rate independent animations
        deltaTime = currentTime - lastTime;
        deltaTime = Math.min(deltaTime / 1000, 1/30); // Cap at 30fps minimum, convert to seconds
        
        // Frame rate control
        if (currentTime - lastTime < frameTime) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastTime = currentTime;
        
        // Update FPS counter
        updateFPS(currentTime);

        // Clear canvas
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Handle different game states
        switch (gameState.current) {
            case 'menu':
                drawMainMenu();
                break;
            case 'playing':
                updateGame();
                drawGame();
                break;
            case 'paused':
                drawGame(); // Show game behind pause menu
                drawPauseMenu();
                break;
            case 'gameOver':
                drawGameOver();
                break;
            case 'controls':
                drawControlsScreen();
                break;
            case 'victory':
                drawVictoryScreen();
                break;
            default:
                // Fallback to menu if unknown state
                gameState.current = 'menu';
                drawMainMenu();
        }
        
        // Draw debug info (F12 to toggle)
        drawDebugInfo();

        // Reset key pressed flags
        Object.keys(keyPressed).forEach(key => keyPressed[key] = false);

        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Game loop error:', error);
        // Graceful continuation
        requestAnimationFrame(gameLoop);
    }
}

// Main Menu
function drawMainMenu() {
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("THORNE'S JOURNEY", canvas.width / 2, canvas.height / 2 - 100);
    
    ctx.font = '24px Arial';
    ctx.fillText('A Dark Adventure', canvas.width / 2, canvas.height / 2 - 60);
    
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Start Game button
    const startY = canvas.height / 2;
    ctx.fillStyle = COLORS.UI_ACCENT;
    ctx.fillRect(buttonX, startY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '20px Arial';
    ctx.fillText('START GAME', canvas.width / 2, startY + 30);
    
    // Controls button
    const controlsY = canvas.height / 2 + 70;
    ctx.fillStyle = '#444444';
    ctx.fillRect(buttonX, controlsY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.fillText('CONTROLS', canvas.width / 2, controlsY + 30);
    
    drawSoundButton();
}

// Game Update Function
function updateGame() {
    // Handle pause
    if (keyPressed['Escape']) {
        gameState.current = gameState.current === 'paused' ? 'playing' : 'paused';
        if (gameState.current === 'paused') {
            audioManager.pauseMusic();
        } else {
            audioManager.playMusic();
        }
    }

    // Only update game objects when not paused
    if (gameState.current === 'playing') {
        // Handle dialogue input first
        if (gameState.inDialogue) {
            dialogueSystem.handleInput();
        } else {
            // Only update game when not in dialogue
            player.update();
            enemies.forEach(enemy => enemy.update());
            checkCollisions();
        }
        
        // Always update visual effects and dialogue
        updateParticles();
        dialogueSystem.update();
        
        // Update tutorial system
        tutorialSystem.update(deltaTime);
        
        // Check chapter progression
        chapterManager.checkChapterProgression();
    }
}

function drawGame() {
    // Draw enhanced background
    drawGameBackground();
    
    // Draw platforms
    platforms.forEach(platform => platform.draw());
    
    // Draw enemies
    enemies.forEach(enemy => enemy.draw());
    
    // Draw player
    player.draw();
    
    // Draw particles
    drawParticles();
    
    // Draw simple HUD
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, 20, 30);
    
    // Draw health bars
    for (let i = 0; i < player.maxHealth; i++) {
        ctx.fillStyle = i < player.health ? COLORS.HEALTH : '#333333';
        ctx.fillRect(20 + i * 25, 40, 20, 15);
    }
    
    // Draw stamina bar
    const staminaBarWidth = 200;
    const staminaBarHeight = 15;
    const staminaX = 20;
    const staminaY = 65;
    
    // Stamina text
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    const staminaText = player.isExhausted ? 'Exhausted!' : `Stamina: ${Math.floor(player.stamina)}/${player.maxStamina}`;
    ctx.fillText(staminaText, staminaX, staminaY - 3);
    
    // Stamina bar background
    ctx.fillStyle = '#333333';
    ctx.fillRect(staminaX, staminaY, staminaBarWidth, staminaBarHeight);
    
    // Stamina bar fill
    const staminaPercentage = player.getStaminaPercentage();
    let staminaColor = '#4CAF50'; // Green
    if (staminaPercentage < 0.3) {
        staminaColor = '#FF9800'; // Orange when low
    }
    if (player.isExhausted) {
        staminaColor = '#F44336'; // Red when exhausted
    }
    
    ctx.fillStyle = staminaColor;
    ctx.fillRect(staminaX, staminaY, staminaBarWidth * staminaPercentage, staminaBarHeight);
    
    // Stamina bar border
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(staminaX, staminaY, staminaBarWidth, staminaBarHeight);
    
    // Draw chapter display
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(updateChapterDisplay(), canvas.width / 2, 25);
    
    // Draw enemy counter
    ctx.textAlign = 'right';
    ctx.fillText(`Enemies: ${enemies.length}`, canvas.width - 20, 70);
    
    // Draw sound button
    drawSoundButton();
    
    // Draw dialogue on top of everything
    dialogueSystem.draw();
    
    // Draw tutorial system
    tutorialSystem.draw(ctx);
    
    // Draw screen flash effects
    if (gameState.screenFlash && gameState.screenFlash.duration > 0) {
        ctx.save();
        ctx.globalAlpha = gameState.screenFlash.intensity * (gameState.screenFlash.duration / 0.1);
        ctx.fillStyle = gameState.screenFlash.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        gameState.screenFlash.duration -= deltaTime;
        if (gameState.screenFlash.duration <= 0) {
            gameState.screenFlash = null;
        }
    }
}

function drawGameBackground() {
    // Base gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, COLORS.BACKGROUND);
    gradient.addColorStop(1, COLORS.BACKGROUND_ACCENT);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add atmospheric particles
    const time = Date.now() * 0.001;
    for (let i = 0; i < 20; i++) {
        const x = (i * 40 + Math.sin(time + i) * 10) % canvas.width;
        const y = (i * 30 + Math.cos(time * 0.7 + i) * 20) % canvas.height;
        const alpha = 0.1 + Math.sin(time + i) * 0.05;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.BACKGROUND_PARTICLE;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.sin(time + i) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawSoundButton() {
    const buttonX = canvas.width - 50;
    const buttonY = 30;
    const buttonRadius = 20;
    
    // Button background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sound icon
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(audioManager.soundEnabled ? '🔊' : '🔇', buttonX, buttonY + 5);
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 60);
    
    const buttonWidth = 180;
    const buttonHeight = 45;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Resume button
    const resumeY = canvas.height / 2;
    ctx.fillStyle = COLORS.UI_ACCENT;
    ctx.fillRect(buttonX, resumeY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '18px Arial';
    ctx.fillText('RESUME', canvas.width / 2, resumeY + 25);
    
    // Main Menu button
    const menuY = canvas.height / 2 + 60;
    ctx.fillStyle = '#444444';
    ctx.fillRect(buttonX, menuY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.fillText('MAIN MENU', canvas.width / 2, menuY + 25);
    
    drawSoundButton();
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.HEALTH;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '20px Arial';
    ctx.fillText('Your sanity has been consumed...', canvas.width / 2, canvas.height / 2);
    
    const buttonWidth = 180;
    const buttonHeight = 45;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Restart button
    const restartY = canvas.height / 2 + 50;
    ctx.fillStyle = COLORS.UI_ACCENT;
    ctx.fillRect(buttonX, restartY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '18px Arial';
    ctx.fillText('TRY AGAIN', canvas.width / 2, restartY + 25);
    
    // Main Menu button
    const menuY = canvas.height / 2 + 110;
    ctx.fillStyle = '#444444';
    ctx.fillRect(buttonX, menuY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.fillText('MAIN MENU', canvas.width / 2, menuY + 25);
    
    drawSoundButton();
}

function drawControlsScreen() {
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CONTROLS', canvas.width / 2, 80);
    
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    const startX = 150;
    let currentY = 150;
    const lineHeight = 35;
    
    const controls = [
        'MOVEMENT: A/D or ← →',
        'JUMP: W or ↑ or SPACE',
        'ATTACK: Z or J',
        'PARRY: Q',
        'PAUSE: ESC',
        '',
        'STAMINA SYSTEM:',
        '• Actions consume stamina',
        '• Exhaustion slows movement',
        '• Stamina regenerates over time',
        '',
        'OBJECTIVE:',
        '• Defeat all enemies to progress',
        '• Master parrying to survive',
        '• Manage your stamina wisely'
    ];
    
    controls.forEach(control => {
        if (control === '') {
            currentY += lineHeight / 2;
        } else if (control.startsWith('•')) {
            ctx.fillStyle = COLORS.UI_ACCENT;
            ctx.fillText(control, startX + 20, currentY);
            currentY += lineHeight;
        } else if (control === 'OBJECTIVE:') {
            ctx.fillStyle = COLORS.UI_ACCENT;
            ctx.font = '20px Arial';
            ctx.fillText(control, startX, currentY);
            ctx.font = '18px Arial';
            currentY += lineHeight;
        } else {
            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.fillText(control, startX, currentY);
            currentY += lineHeight;
        }
    });
    
    // Back button
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height - 80;
    
    ctx.fillStyle = COLORS.UI_ACCENT;
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BACK', canvas.width / 2, buttonY + 25);
    
    drawSoundButton();
}

function handleControlsClick(x, y) {
    // Back button
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    const buttonY = canvas.height - 80;
    
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= buttonY && y <= buttonY + buttonHeight) {
        gameState.current = 'menu';
    }
}

function drawVictoryScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.UI_ACCENT;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CHAPTER COMPLETE', canvas.width / 2, canvas.height / 2 - 80);
    
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '24px Arial';
    ctx.fillText('The Ash Chapel has been cleansed', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '18px Arial';
    ctx.fillText('But Thorne\'s journey is far from over...', canvas.width / 2, canvas.height / 2);
    
    const buttonWidth = 180;
    const buttonHeight = 45;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Continue button (placeholder for future chapters)
    const continueY = canvas.height / 2 + 50;
    ctx.fillStyle = '#666666';
    ctx.fillRect(buttonX, continueY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.font = '16px Arial';
    ctx.fillText('CONTINUE (Coming Soon)', canvas.width / 2, continueY + 25);
    
    // Main Menu button
    const menuY = canvas.height / 2 + 110;
    ctx.fillStyle = COLORS.UI_ACCENT;
    ctx.fillRect(buttonX, menuY, buttonWidth, buttonHeight);
    ctx.fillStyle = COLORS.UI_TEXT;
    ctx.fillText('MAIN MENU', canvas.width / 2, menuY + 25);
    
    drawSoundButton();
}

function handleVictoryClick(x, y) {
    const buttonWidth = 180;
    const buttonHeight = 45;
    const buttonX = canvas.width / 2 - buttonWidth / 2;
    
    // Main Menu button
    const menuY = canvas.height / 2 + 110;
    if (x >= buttonX && x <= buttonX + buttonWidth && 
        y >= menuY && y <= menuY + buttonHeight) {
        gameState.current = 'menu';
        audioManager.pauseMusic();
        resetGame();
    }
}

// Reset Game Function
function resetGame() {
    player = new Player(100, 300);
    enemies = [
        new Enemy(300, 320),
        new Enemy(600, 270)
    ];
    
    // Reset story state
    gameState.currentChapter = 1;  // Start at combat chapter 1
    gameState.inDialogue = false;
    gameState.enemiesDefeated = 0;
    
    // Clear dialogue
    dialogueSystem.currentDialogue = null;
    dialogueSystem.dialogueQueue = [];
}

// Initialize and Start Game
function startGame() {
    initializeInput();
    audioManager.init(); // Initialize audio system
    gameLoop();
}

// Start the game when page loads
startGame();

// Performance monitoring
let frameCount = 0;
let lastFpsTime = 0;
let currentFps = 60;

function updateFPS(currentTime) {
    frameCount++;
    if (currentTime - lastFpsTime >= 1000) {
        currentFps = frameCount;
        frameCount = 0;
        lastFpsTime = currentTime;
    }
}

function drawDebugInfo() {
    // Only show in development (can be toggled)
    if (keys['F12']) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width - 150, 0, 150, 100);
        
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${currentFps}`, canvas.width - 140, 20);
        ctx.fillText(`Particles: ${particles.length}`, canvas.width - 140, 35);
        ctx.fillText(`Enemies: ${enemies.length}`, canvas.width - 140, 50);
        ctx.fillText(`Chapter: ${gameState.currentChapter}`, canvas.width - 140, 65);
        ctx.fillText(`Stamina: ${Math.floor(player.stamina)}/${player.maxStamina}`, canvas.width - 140, 80);
        ctx.fillText(`Exhausted: ${player.isExhausted}`, canvas.width - 140, 95);
        ctx.fillText(`In Dialogue: ${gameState.inDialogue}`, canvas.width - 140, 110);
    }
}

// ========================================
// TUTORIAL SYSTEM
// ========================================

class TutorialSystem {
    constructor() {
        this.currentTutorial = null;
        this.tutorialQueue = [];
        this.tutorialTimer = 0;
        this.tutorialDuration = 4.0; // 4 seconds per tutorial
        this.hasShownTutorials = {
            parry: false,
            stamina: false,
            aoe: false,
            combo: false,
            perfectParry: false
        };
    }
    
    showTutorial(type, message) {
        if (this.hasShownTutorials[type]) return;
        
        this.currentTutorial = {
            type: type,
            message: message,
            alpha: 0,
            fadeIn: true
        };
        this.tutorialTimer = 0;
        this.hasShownTutorials[type] = true;
    }
    
    update(deltaTime) {
        if (!this.currentTutorial) return;
        
        this.tutorialTimer += deltaTime;
        
        // Fade in/out animation
        if (this.currentTutorial.fadeIn) {
            this.currentTutorial.alpha = Math.min(1, this.tutorialTimer * 3);
            if (this.currentTutorial.alpha >= 1) {
                this.currentTutorial.fadeIn = false;
            }
        } else if (this.tutorialTimer >= this.tutorialDuration - 1) {
            // Fade out in last second
            this.currentTutorial.alpha = Math.max(0, 1 - (this.tutorialTimer - (this.tutorialDuration - 1)) * 3);
        }
        
        // Remove tutorial after duration
        if (this.tutorialTimer >= this.tutorialDuration) {
            this.currentTutorial = null;
            this.tutorialTimer = 0;
        }
    }
    
    draw(ctx) {
        if (!this.currentTutorial) return;
        
        const tutorial = this.currentTutorial;
        
        // Tutorial background
        ctx.save();
        ctx.globalAlpha = tutorial.alpha * 0.9;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(50, canvas.height - 120, canvas.width - 100, 70);
        
        // Tutorial border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, canvas.height - 120, canvas.width - 100, 70);
        
        // Tutorial text
        ctx.globalAlpha = tutorial.alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TUTORIAL', canvas.width / 2, canvas.height - 100);
        
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '14px Arial';
        this.wrapText(ctx, tutorial.message, canvas.width / 2, canvas.height - 80, canvas.width - 120, 16);
        
        ctx.restore();
    }
    
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    // Tutorial triggers
    triggerParryTutorial() {
        this.showTutorial('parry', 'Press Q to parry incoming attacks! Time it right for maximum rewards.');
    }
    
    triggerStaminaTutorial() {
        this.showTutorial('stamina', 'Watch your stamina! Actions consume stamina. Rest to regenerate.');
    }
    
    triggerAOETutorial() {
        this.showTutorial('aoe', 'Red attacks cannot be parried! Move away from the danger zone.');
    }
    
    triggerComboTutorial() {
        this.showTutorial('combo', 'Enemy combo attack! Parry each attack in sequence for bonus rewards.');
    }
    
    triggerPerfectParryTutorial() {
        this.showTutorial('perfectParry', 'Perfect parry! Frame-perfect timing grants maximum souls and damage boost.');
    }
    
    triggerChargeTutorial() {
        this.showTutorial('charge', 'Enemy charge attack! Dodge or parry at the right moment to avoid being hit.');
    }
    
    triggerGroundSlamTutorial() {
        this.showTutorial('groundSlam', 'Ground slam incoming! The shockwave cannot be parried - move away from the danger zone!');
    }
    
    triggerRiposteTutorial() {
        this.showTutorial('riposte', 'Riposte window open! Attack now for double damage and enemy stagger!');
    }
}

// ========================================
// CHAPTER PROGRESSION SYSTEM
// ========================================

class ChapterManager {
    constructor() {
        this.chapterRequirements = {
            1: { enemiesDefeated: 2, parrySuccessRate: 0 },
            2: { enemiesDefeated: 3, parrySuccessRate: 40 },
            3: { enemiesDefeated: 4, parrySuccessRate: 50 },
            4: { enemiesDefeated: 5, parrySuccessRate: 60 },
            5: { enemiesDefeated: 6, parrySuccessRate: 70 }
        };
        this.chapterUnlockMessages = {
            2: "Chapter 2 Unlocked: Rhythm and Timing - Enemies now use thrust attacks!",
            3: "Chapter 3 Unlocked: Spatial Awareness - Beware of area attacks!",
            4: "Chapter 4 Unlocked: Combat Flow - Enemies can chain attacks together!",
            5: "Chapter 5 Unlocked: Master of Arms - Face the ultimate challenge!"
        };
    }
    
    checkChapterProgression() {
        const currentChapter = gameState.currentChapter;
        const nextChapter = currentChapter + 1;
        
        if (nextChapter > 5) return; // Max chapter reached
        
        const requirements = this.chapterRequirements[nextChapter];
        
        // Check if requirements are met
        const enemiesDefeated = gameState.enemiesDefeated || 0;
        const parrySuccessRate = player.parrySystem.getSuccessRate();
        
        if (enemiesDefeated >= requirements.enemiesDefeated && 
            parrySuccessRate >= requirements.parrySuccessRate) {
            this.advanceChapter();
        }
    }
    
    advanceChapter() {
        const oldChapter = gameState.currentChapter;
        gameState.currentChapter++;
        
        // Mark previous chapter as completed
        gameState.chapterProgress[oldChapter].completed = true;
        gameState.chapterProgress[oldChapter].parrySuccessRate = player.parrySystem.getSuccessRate();
        gameState.chapterProgress[oldChapter].enemiesDefeated = gameState.enemiesDefeated;
        
        // Show chapter unlock message
        if (this.chapterUnlockMessages[gameState.currentChapter]) {
            this.showChapterUnlock(gameState.currentChapter);
        }
        
        // Reset enemies for new chapter
        this.spawnChapterEnemies();
        
        // Update existing enemies with new attack types
        enemies.forEach(enemy => {
            enemy.attackTypes = enemy.getChapterAttackTypes();
        });
    }
    
    showChapterUnlock(chapter) {
        // Create a special dialogue for chapter unlock
        dialogueSystem.addDialogue("System", this.chapterUnlockMessages[chapter]);
        
        // Screen flash effect
        gameState.screenFlash = {
            intensity: 0.2,
            color: '#FFD700',
            duration: 0.5
        };
    }
    
    spawnChapterEnemies() {
        // Add one more enemy each chapter (up to 5 total)
        const targetEnemyCount = Math.min(2 + gameState.currentChapter - 1, 5);
        
        while (enemies.length < targetEnemyCount) {
            const x = 200 + enemies.length * 150 + Math.random() * 100;
            const y = 300 + Math.random() * 50;
            enemies.push(new Enemy(x, y));
        }
    }
    
    getCurrentChapterInfo() {
        const chapter = gameState.currentChapter;
        const progress = gameState.chapterProgress[chapter];
        return {
            title: progress.title,
            chapter: chapter,
            requirements: this.chapterRequirements[chapter + 1] || null
        };
    }
}

// ========================================
// ADVANCED ATTACK TYPES (PHASE 9 COMPLETION)
// ========================================

class ChargeAttack extends AttackBase {
    constructor(enemy) {
        const scaling = enemy.getChapterScaling();
        super(
            enemy, 
            'charge',
            25 * scaling.damage,
            150,
            1.0 * scaling.telegraphTime,
            0.3,
            0.5,
            0.4
        );
        this.chargeSpeed = 8;
        this.chargeDirection = enemy.x < player.x ? 1 : -1;
        this.originalX = enemy.x;
        this.chargeDistance = 200;
        this.hasCharged = false;
    }
    
    createTelegraphEffects() {
        // Create direction indicator particles
        for (let i = 0; i < 15; i++) {
            const angle = this.chargeDirection > 0 ? 0 : Math.PI;
            const speed = 2 + Math.random() * 3;
            particles.push(new Particle(
                this.enemy.x + this.enemy.width / 2,
                this.enemy.y + this.enemy.height / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
                '#FF4444',
                30,
                3
            ));
        }
    }
    
    executeAttack() {
        if (!this.hasCharged) {
            this.hasCharged = true;
            audioManager.playAttackSound('charge');
            this.createChargeParticles();
        }
        
        // Move enemy during charge
        const targetX = this.originalX + (this.chargeDistance * this.chargeDirection);
        const distanceToTarget = Math.abs(targetX - this.enemy.x);
        
        if (distanceToTarget > 5) {
            this.enemy.x += this.chargeSpeed * this.chargeDirection;
            
            // Check collision with player during charge
            if (this.checkPlayerHit()) {
                player.takeDamage(this.getScaledDamage());
                this.createImpactParticles();
            }
        }
    }
    
    createChargeParticles() {
        // Dust cloud at start of charge
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(
                this.enemy.x + Math.random() * this.enemy.width,
                this.enemy.y + this.enemy.height,
                (Math.random() - 0.5) * 4,
                -Math.random() * 3,
                '#8B4513',
                40,
                2 + Math.random() * 2
            ));
        }
    }
    
    createImpactParticles() {
        // Impact effects when charge hits
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(
                player.x + player.width / 2,
                player.y + player.height / 2,
                (Math.random() - 0.5) * 6,
                -Math.random() * 4,
                '#FF6666',
                30,
                3
            ));
        }
    }
    
    renderTelegraph(ctx) {
        if (this.state !== 'telegraph' && this.state !== 'windup') return;
        
        ctx.save();
        
        // Draw charge path indicator
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        const startX = this.enemy.x + this.enemy.width / 2;
        const endX = startX + (this.chargeDistance * this.chargeDirection);
        const y = this.enemy.y + this.enemy.height / 2;
        
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
        
        // Draw arrow at end
        const arrowSize = 10;
        const arrowX = endX;
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        if (this.chargeDirection > 0) {
            ctx.moveTo(arrowX, y);
            ctx.lineTo(arrowX - arrowSize, y - arrowSize / 2);
            ctx.lineTo(arrowX - arrowSize, y + arrowSize / 2);
        } else {
            ctx.moveTo(arrowX, y);
            ctx.lineTo(arrowX + arrowSize, y - arrowSize / 2);
            ctx.lineTo(arrowX + arrowSize, y + arrowSize / 2);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

class GroundSlamAttack extends AttackBase {
    constructor(enemy) {
        const scaling = enemy.getChapterScaling();
        super(
            enemy,
            'groundSlam',
            30 * scaling.damage,
            120,
            1.2 * scaling.telegraphTime,
            0.4,
            0.3,
            0.5
        );
        this.shockwaveRadius = 0;
        this.maxShockwaveRadius = 150;
        this.shockwaveSpeed = 8;
        this.hasSlammed = false;
    }
    
    createTelegraphEffects() {
        // Ground crack particles
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            particles.push(new Particle(
                this.enemy.x + this.enemy.width / 2 + Math.cos(angle) * 20,
                this.enemy.y + this.enemy.height,
                Math.cos(angle) * 0.5,
                -Math.random(),
                '#8B4513',
                60,
                2
            ));
        }
    }
    
    executeAttack() {
        if (!this.hasSlammed) {
            this.hasSlammed = true;
            audioManager.playAttackSound('groundSlam');
            this.createSlamParticles();
        }
        
        // Expand shockwave
        if (this.shockwaveRadius < this.maxShockwaveRadius) {
            this.shockwaveRadius += this.shockwaveSpeed;
            
            // Check if player is in shockwave
            const dx = player.x + player.width / 2 - (this.enemy.x + this.enemy.width / 2);
            const dy = player.y + player.height / 2 - (this.enemy.y + this.enemy.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.shockwaveRadius && distance >= this.shockwaveRadius - this.shockwaveSpeed) {
                player.takeDamage(this.getScaledDamage());
                // Knockback effect
                const knockbackForce = 8;
                const angle = Math.atan2(dy, dx);
                player.velocityX += Math.cos(angle) * knockbackForce;
                player.velocityY = Math.min(player.velocityY, -6); // Upward knockback
            }
        }
    }
    
    createSlamParticles() {
        // Ground impact particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            particles.push(new Particle(
                this.enemy.x + this.enemy.width / 2,
                this.enemy.y + this.enemy.height,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 1,
                '#654321',
                50,
                3 + Math.random() * 2
            ));
        }
    }
    
    renderTelegraph(ctx) {
        if (this.state !== 'telegraph' && this.state !== 'windup') return;
        
        ctx.save();
        
        // Draw expanding danger circle
        const centerX = this.enemy.x + this.enemy.width / 2;
        const centerY = this.enemy.y + this.enemy.height / 2;
        
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        
        // Animated expanding circle
        const pulseRadius = this.maxShockwaveRadius * (0.7 + 0.3 * Math.sin(Date.now() * 0.01));
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Warning text
        ctx.fillStyle = '#FF4444';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GROUND SLAM!', centerX, centerY - 30);
        
        ctx.restore();
    }
    
    render(ctx) {
        super.render(ctx);
        
        // Draw shockwave during execution
        if (this.state === 'execute' && this.shockwaveRadius > 0) {
            ctx.save();
            
            const centerX = this.enemy.x + this.enemy.width / 2;
            const centerY = this.enemy.y + this.enemy.height / 2;
            
            // Shockwave ring
            ctx.strokeStyle = '#FF6666';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

// ========================================
// CREATE GLOBAL INSTANCES AFTER ALL CLASSES ARE DEFINED
// ========================================

// Create tutorial system instance
const tutorialSystem = new TutorialSystem();

// Create chapter manager instance
const chapterManager = new ChapterManager();