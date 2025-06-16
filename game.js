// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio Setup
const audioManager = {
    bgMusic: null,
    bossMusic: null,
    soundEnabled: true,
    currentTrack: 'normal',
    initialized: false,
    
    init() {
        // Create background music element - using local audio file
        this.bgMusic = new Audio("thornes' thorn.mp3");
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4;
        
        // Create boss battle music - using same file with different volume for variety
        this.bossMusic = new Audio("thornes' thorn.mp3");
        this.bossMusic.loop = true;
        this.bossMusic.volume = 0.6; // Slightly louder for boss battles
        
        this.initialized = true;
        
        // Start playing if enabled
        if (this.soundEnabled) {
            this.playMusic();
        }
    },
    
    playMusic() {
        if (!this.soundEnabled || !this.initialized) return;
        
        try {
            if (this.currentTrack === 'normal') {
                this.bossMusic.pause();
                this.bgMusic.play().catch(e => {
                    console.log("Audio couldn't autoplay: User interaction required first");
                });
            } else if (this.currentTrack === 'boss') {
                this.bgMusic.pause();
                this.bossMusic.play().catch(e => {
                    console.log("Audio couldn't autoplay: User interaction required first");
                });
            }
        } catch (error) {
            console.warn("Audio playback error:", error);
            // Continue game without audio if there's an error
        }
    },
    
    switchToBossMusic() {
        if (this.currentTrack !== 'boss') {
            this.currentTrack = 'boss';
            this.playMusic();
        }
    },
    
    switchToNormalMusic() {
        if (this.currentTrack !== 'normal') {
            this.currentTrack = 'normal';
            this.playMusic();
        }
    },
    
    pauseMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
        if (this.bossMusic) {
            this.bossMusic.pause();
        }
    },
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    },
    
    // Sound button UI
    drawSoundButton() {
        // Draw button background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(canvas.width - SOUND_BUTTON_X_OFFSET, SOUND_BUTTON_Y_OFFSET, SOUND_BUTTON_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw sound icon or muted icon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        
        if (this.soundEnabled) {
            // Sound on icon
            ctx.moveTo(canvas.width - 35, 30);
            ctx.lineTo(canvas.width - 30, 25);
            ctx.lineTo(canvas.width - 30, 35);
            ctx.lineTo(canvas.width - 35, 30);
            ctx.fill();
            
            // Sound waves
            ctx.beginPath();
            ctx.arc(canvas.width - 27, 30, 5, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(canvas.width - 25, 30, 10, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        } else {
            // Sound off icon (crossed speaker)
            ctx.moveTo(canvas.width - 35, 30);
            ctx.lineTo(canvas.width - 30, 25);
            ctx.lineTo(canvas.width - 30, 35);
            ctx.lineTo(canvas.width - 35, 30);
            ctx.fill();
            
            // X mark
            ctx.beginPath();
            ctx.moveTo(canvas.width - 25, 25);
            ctx.lineTo(canvas.width - 20, 35);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(canvas.width - 25, 35);
            ctx.lineTo(canvas.width - 20, 25);
            ctx.stroke();
        }
    },
    
    // Check if click is on sound button
    isSoundButtonClicked(x, y) {
        const deltaX = x - (canvas.width - SOUND_BUTTON_X_OFFSET);
        const deltaY = y - SOUND_BUTTON_Y_OFFSET;
        
        // Prevent potential division by zero or invalid calculations
        if (!isFinite(deltaX) || !isFinite(deltaY)) return false;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        return distance <= SOUND_BUTTON_RADIUS;
    }
};

// Game Constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;
const ATTACK_DURATION = 15;
const DASH_SPEED = 12;
const DASH_DURATION = 15;
const DASH_COOLDOWN = 40;

// UI Constants
const SOUND_BUTTON_RADIUS = 20;
const SOUND_BUTTON_X_OFFSET = 30;
const SOUND_BUTTON_Y_OFFSET = 30;
const DIALOGUE_BOX_MARGIN = 50;
const DIALOGUE_BOX_HEIGHT = 120;
const HUD_MARGIN = 20;

// Performance Constants
const MAX_VISUAL_EFFECTS = 20;
const TARGET_FPS = 60;

// Story Constants
const CHAPTERS = {
    INTRO: "intro",
    ASH_CHAPEL: "ash_chapel",
    BRIDGE: "bridge",
    WHISPERING_ROOM: "whispering_room",
    EIDOLON_TREE: "eidolon_tree",
    VOICE_MANIFESTATION: "voice_manifestation",
    LAMENT_GATE: "lament_gate",
    FOLDED_THRONE: "folded_throne"
};

// Emotional States
const EMOTIONS = {
    TRUTH: "truth",
    REGRET: "regret",
    FURY: "fury"
};

// Game State
const gameState = {
    paused: false,
    gameOver: false,
    escapeKeyPressed: false,
    inDialogue: false,
    currentChapter: CHAPTERS.INTRO,
    emotionalInventory: {
        [EMOTIONS.TRUTH]: 0,
        [EMOTIONS.REGRET]: 0,
        [EMOTIONS.FURY]: 0
    },
    hasEncounteredKas: false,
    hasFoundMemoryPage: false,
    chapterProgress: 0
};

// Assets - placeholder colors for now
const COLORS = {
    PLAYER: '#FFFFFF',
    PLAYER_DASH: '#AAAAFF',
    PLAYER_ATTACK: '#FF8866',
    ENEMY: '#FF0000',
    PLATFORM: '#555555',
    BACKGROUND_1: '#111122',
    BACKGROUND_2: '#222233',
    HEALTH: '#FF0000',
    SOUL: '#AAAAFF',
    DIALOGUE_BG: 'rgba(0, 0, 0, 0.7)',
    DIALOGUE_TEXT: '#FFFFFF',
    DIALOGUE_NAME: '#AAAAFF',
    VERGE_CORRUPTION: '#550055'
};

// Story characters
const CHARACTERS = {
    THORNE: "Thorne",
    AILA: "Aila (Echo)",
    KAS: "Kas Vire",
    VOICE_TRUTH: "Voice of Truth",
    VOICE_REGRET: "Voice of Regret",
    VOICE_FURY: "Voice of Fury",
    ASHLAN: "Ashlan",
    VOICE_FOLD: "Voice of the Fold"
};

// Dialogue System
class DialogueSystem {
    constructor() {
        this.dialogueQueue = [];
        this.currentDialogue = null;
        this.textSpeed = 2;
        this.textProgress = 0;
        this.dialogueComplete = false;
        this.currentChoices = null;
        this.selectedChoice = 0;
        this.choiceAreas = []; // Store clickable areas for choices
    }

    addDialogue(character, text, emotion = null, choices = null) {
        this.dialogueQueue.push({ character, text, emotion, choices });
        if (!this.currentDialogue) {
            this.nextDialogue();
        }
    }

    addDialogueSequence(dialogueArray) {
        dialogueArray.forEach(dialogue => {
            this.dialogueQueue.push(dialogue);
        });
        if (!this.currentDialogue) {
            this.nextDialogue();
        }
    }

    nextDialogue() {
        if (this.dialogueQueue.length > 0) {
            this.currentDialogue = this.dialogueQueue.shift();
            this.textProgress = 0;
            this.dialogueComplete = false;
            this.currentChoices = this.currentDialogue.choices;
            this.selectedChoice = 0;
            this.choiceAreas = []; // Reset clickable areas
            gameState.inDialogue = true;
        } else {
            this.currentDialogue = null;
            this.currentChoices = null;
            this.choiceAreas = []; // Reset clickable areas
            gameState.inDialogue = false;
            
            // Reset space key state to prevent jumping after dialogue
            keys['Space'] = false;
            keys.spacePressed = false;
            player.jumpKeyPressed = false;
        }
    }

    update() {
        if (!this.currentDialogue) return;

        if (!this.dialogueComplete) {
            this.textProgress += this.textSpeed;
            if (this.textProgress >= this.currentDialogue.text.length) {
                this.dialogueComplete = true;
                this.textProgress = this.currentDialogue.text.length;
            }
        }
    }

    draw() {
        if (!this.currentDialogue) return;

        // Draw dialogue box
        ctx.fillStyle = COLORS.DIALOGUE_BG;
        ctx.fillRect(50, canvas.height - 150, canvas.width - 100, 120);

        // Draw character name
        ctx.fillStyle = COLORS.DIALOGUE_NAME;
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.currentDialogue.character, 70, canvas.height - 120);

        // Draw text (animated)
        ctx.fillStyle = COLORS.DIALOGUE_TEXT;
        ctx.font = '16px Arial';
        
        const displayText = this.currentDialogue.text.substring(0, Math.floor(this.textProgress));
        
        // Word wrap for dialogue text
        const wrapText = (text, x, y, maxWidth, lineHeight) => {
            const words = text.split(' ');
            let line = '';
            let testLine = '';
            let lineCount = 0;

            for (let n = 0; n < words.length; n++) {
                testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, y + (lineCount * lineHeight));
                    line = words[n] + ' ';
                    lineCount++;
                } else {
                    line = testLine;
                }
            }
            
            ctx.fillText(line, x, y + (lineCount * lineHeight));
            return lineCount;
        };
        
        wrapText(displayText, 70, canvas.height - 100, canvas.width - 140, 22);

        // Draw "continue" indicator if dialogue is complete
        if (this.dialogueComplete) {
            // If there are choices, draw them
            if (this.currentChoices && this.currentChoices.length > 0) {
                this.choiceAreas = []; // Reset choice areas
                for (let i = 0; i < this.currentChoices.length; i++) {
                    const isSelected = i === this.selectedChoice;
                    ctx.fillStyle = isSelected ? '#FFCC00' : COLORS.DIALOGUE_TEXT;
                    
                    // Calculate text position
                    const x = 70;
                    const y = canvas.height - 50 + (i * 25);
                    const choiceText = `${i + 1}. ${this.currentChoices[i].text}`;
                    
                    // Draw choice text
                    ctx.fillText(choiceText, x, y);
                    
                    // Store clickable area for this choice
                    const textWidth = ctx.measureText(choiceText).width;
                    this.choiceAreas.push({
                        x: x - 5,
                        y: y - 15,
                        width: textWidth + 10,
                        height: 20,
                        index: i
                    });
                    
                    // Draw hover effect (subtle rectangle behind text)
                    if (isSelected) {
                        ctx.fillStyle = 'rgba(255, 204, 0, 0.2)';
                        ctx.fillRect(x - 5, y - 15, textWidth + 10, 20);
                    }
                }
            } else {
                // Otherwise, show continue prompt
                ctx.fillStyle = '#FFCC00';
                ctx.font = '14px Arial';
                ctx.textAlign = 'right';
                ctx.fillText('Click or press SPACE to continue...', canvas.width - 70, canvas.height - 40);
                
                // Add clickable area for continuing
                this.choiceAreas = [{
                    x: canvas.width - 250,
                    y: canvas.height - 55,
                    width: 180,
                    height: 20,
                    index: -1 // Special index for "continue"
                }];
            }
        }
    }

    // Check if a point is inside a choice area
    isPointInChoice(x, y) {
        for (const area of this.choiceAreas) {
            if (x >= area.x && x <= area.x + area.width &&
                y >= area.y && y <= area.y + area.height) {
                return area.index;
            }
        }
        return null;
    }

    handleInput(keys) {
        if (!this.currentDialogue || !this.dialogueComplete) return;

        // Handle dialogue choices
        if (this.currentChoices && this.currentChoices.length > 0) {
            // Navigate choices
            if (keys['ArrowUp'] && !keys.arrowUpPressed) {
                this.selectedChoice = (this.selectedChoice - 1 + this.currentChoices.length) % this.currentChoices.length;
                keys.arrowUpPressed = true;
            }
            if (keys['ArrowDown'] && !keys.arrowDownPressed) {
                this.selectedChoice = (this.selectedChoice + 1) % this.currentChoices.length;
                keys.arrowDownPressed = true;
            }
            
            // Select choice
            if (keys['Space'] && !keys.spacePressed) {
                // Execute the choice's effect
                const choice = this.currentChoices[this.selectedChoice];
                if (choice.effect) {
                    choice.effect();
                }
                keys.spacePressed = true;
                this.nextDialogue();
            }
        } else {
            // Just continue to next dialogue
            if (keys['Space'] && !keys.spacePressed) {
                keys.spacePressed = true;
                this.nextDialogue();
            }
        }
    }

    // Handle mouse click for dialogue choices
    handleMouseClick(x, y) {
        if (!this.currentDialogue || !this.dialogueComplete) return false;
        
        const choiceIndex = this.isPointInChoice(x, y);
        
        if (choiceIndex !== null) {
            if (choiceIndex === -1) {
                // Clicked on "continue"
                this.nextDialogue();
            } else if (this.currentChoices && this.currentChoices.length > 0) {
                // Clicked on a choice
                const choice = this.currentChoices[choiceIndex];
                if (choice.effect) {
                    choice.effect();
                }
                this.nextDialogue();
            }
            return true;
        }
        
        return false;
    }
}

// Game Story Manager
class StoryManager {
    constructor(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.storyEvents = {};
        this.setupStoryEvents();
    }

    spawnChapterEnemies() {
        // Clear existing enemies
        enemies = [];
        
        // Spawn enemies based on current chapter
        switch(gameState.currentChapter) {
            case CHAPTERS.ASH_CHAPEL:
                enemies.push(
                    new Enemy(100, 100, 'verge'),
                    new Enemy(400, 200, 'memory'),
                    new Enemy(600, 150, 'verge')
                );
                break;
            case CHAPTERS.BRIDGE:
                enemies.push(
                    new Enemy(200, 150, 'voice'),
                    new Enemy(450, 250, 'verge'),
                    new Enemy(700, 200, 'memory'),
                    new Enemy(300, 100, 'voice')
                );
                break;
            case CHAPTERS.WHISPERING_ROOM:
                enemies.push(
                    new Enemy(150, 200, 'memory'),
                    new Enemy(350, 150, 'verge'),
                    new Enemy(550, 250, 'voice'),
                    new Enemy(250, 100, 'memory'),
                    new Enemy(650, 150, 'verge')
                );
                break;
            case CHAPTERS.EIDOLON_TREE:
                enemies.push(
                    new Enemy(180, 120, 'voice'),
                    new Enemy(320, 180, 'memory'),
                    new Enemy(480, 220, 'verge'),
                    new Enemy(620, 160, 'voice'),
                    new Enemy(380, 100, 'memory'),
                    new Enemy(520, 140, 'verge')
                );
                break;
            // Add more chapters with their specific enemy configurations
            default:
                // Default enemies for other chapters
                enemies.push(
                    new Enemy(100, 100, 'verge'),
                    new Enemy(400, 200, 'memory'),
                    new Enemy(600, 150, 'verge')
                );
        }
    }

    setupStoryEvents() {
        // Chapter Intro
        this.storyEvents[CHAPTERS.INTRO] = () => {
            this.dialogueSystem.addDialogueSequence([
                { character: CHARACTERS.VOICE_REGRET, text: "Another day in this shattered realm..." },
                { character: CHARACTERS.THORNE, text: "The Verge grows stronger. I can feel it feeding on memories, on grief." },
                { character: CHARACTERS.VOICE_TRUTH, text: "Find her, Thorne. Find what remains." },
                { character: CHARACTERS.THORNE, text: "Aila... my daughter. What happened to you was unnatural. And I will find answers." }
            ]);
            
            // After initial dialogue, progress to first chapter
            gameState.currentChapter = CHAPTERS.ASH_CHAPEL;
            gameState.chapterProgress = 0;
            this.spawnChapterEnemies(); // Spawn enemies for the new chapter
        };

        // Chapter 1 - Ash Chapel
        this.storyEvents[CHAPTERS.ASH_CHAPEL] = () => {
            if (gameState.chapterProgress === 0) {
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.THORNE, text: "The Ash Chapel... where prayers turn to dust. This is where I'll begin my journey." },
                    { character: CHARACTERS.VOICE_FURY, text: "They all abandoned you. Remember that." }
                ]);
                gameState.chapterProgress = 1;
            } else if (gameState.chapterProgress === 1 && player.x > canvas.width * 0.7) {
                // Trigger when player reaches a certain point
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.AILA, text: "Father? Is that you?" },
                    { character: CHARACTERS.THORNE, text: "Aila? No... you can't be here." },
                    { character: CHARACTERS.AILA, text: "I'm lost in the spaces between memories. Help me." },
                    { character: CHARACTERS.VOICE_TRUTH, text: "This is merely an echo, Thorne. Don't lose yourself to false hope." },
                    { character: CHARACTERS.VOICE_REGRET, text: "But what if some part of her remains? You owe her that chance." },
                    { 
                        character: CHARACTERS.THORNE, 
                        text: "How should I respond?", 
                        choices: [
                            { 
                                text: "This isn't real. I must face the truth.", 
                                effect: () => { 
                                    gameState.emotionalInventory[EMOTIONS.TRUTH] += 1;
                                    this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "You're not real. You're a manifestation of the Verge, feeding on my grief.");
                                }
                            },
                            { 
                                text: "Aila, I'm so sorry I couldn't save you.", 
                                effect: () => { 
                                    gameState.emotionalInventory[EMOTIONS.REGRET] += 1;
                                    this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "I failed you. Every day I live with that regret.");
                                }
                            },
                            { 
                                text: "I'll find who did this to you.", 
                                effect: () => { 
                                    gameState.emotionalInventory[EMOTIONS.FURY] += 1;
                                    this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "I'll tear this realm apart to find those responsible.");
                                }
                            }
                        ]
                    }
                ]);
                gameState.chapterProgress = 2;
            } else if (gameState.chapterProgress === 2 && enemies.length === 0) {
                // When all enemies are defeated
                this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "The Bridge of Forgotten Names lies ahead. Kas might be there... if he still exists.");
                
                // Progress to next chapter after completing this area
                gameState.currentChapter = CHAPTERS.BRIDGE;
                gameState.chapterProgress = 0;
                this.spawnChapterEnemies(); // Spawn enemies for the new chapter
                player.resetTimeSlowAbility(); // Reset time slow ability
            }
        };

        // Chapter 2 - Bridge
        this.storyEvents[CHAPTERS.BRIDGE] = () => {
            if (gameState.chapterProgress === 0) {
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.THORNE, text: "The Bridge of Forgotten Names... each stone carries a memory of someone lost to the Verge." },
                    { character: CHARACTERS.KAS, text: "Thorne? Is that really you, old friend?" },
                    { character: CHARACTERS.THORNE, text: "Kas... You survived." },
                    { character: CHARACTERS.KAS, text: "Survived? Perhaps. Changed? Definitely. The Verge has ways of altering one's perspective." },
                    { character: CHARACTERS.KAS, text: "You're still looking for her, aren't you? Your daughter..." },
                    { 
                        character: CHARACTERS.THORNE, 
                        text: "How should I respond to Kas?", 
                        choices: [
                            { 
                                text: "I need to know what happened to her.", 
                                effect: () => { 
                                    this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "I need to understand what happened. What the Church did to her.");
                                    this.dialogueSystem.addDialogue(CHARACTERS.KAS, "Then you'll need to face your own memories first. The Whispering Room holds fragments of your past.");
                                    gameState.hasEncounteredKas = true;
                                }
                            },
                            { 
                                text: "Help me navigate the Verge.", 
                                effect: () => { 
                                    this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "You've been here longer. Help me understand this place.");
                                    this.dialogueSystem.addDialogue(CHARACTERS.KAS, "The Verge isn't a place, Thorne. It's what remains when the soul can't forget.");
                                    this.dialogueSystem.addDialogue(CHARACTERS.KAS, "Seek the Whispering Room. Your past awaits you there.");
                                    gameState.hasEncounteredKas = true;
                                }
                            }
                        ]
                    }
                ]);
                gameState.chapterProgress = 1;
            } else if (gameState.chapterProgress === 1 && enemies.length === 0) {
                this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "The Whispering Room lies ahead. My memories... I'm not sure I'm ready to face them.");
                gameState.currentChapter = CHAPTERS.WHISPERING_ROOM;
                gameState.chapterProgress = 0;
                this.spawnChapterEnemies(); // Spawn enemies for the new chapter
                player.resetTimeSlowAbility(); // Reset time slow ability
            }
        };
        
        // Chapter 3 - Whispering Room
        this.storyEvents[CHAPTERS.WHISPERING_ROOM] = () => {
            if (gameState.chapterProgress === 0) {
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.THORNE, text: "The Whispering Room... I can hear the echoes of the past." },
                    { character: CHARACTERS.VOICE_TRUTH, text: "Your memories are fragmented, scattered throughout this place." },
                    { character: CHARACTERS.VOICE_REGRET, text: "Some memories are better left forgotten, Thorne." }
                ]);
                gameState.chapterProgress = 1;
            } else if (gameState.chapterProgress === 1 && player.x > canvas.width * 0.6) {
                // Trigger when player reaches a certain point
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.THORNE, text: "I remember this... the day I found out what happened to Aila." },
                    { character: CHARACTERS.VOICE_REGRET, text: "The day everything changed..." },
                    { character: CHARACTERS.ASHLAN, text: "Thorne, the Church's experiments... they were trying to reach beyond the Verge." },
                    { character: CHARACTERS.ASHLAN, text: "Your daughter was one of their subjects. I'm sorry." }
                ]);
                gameState.chapterProgress = 2;
                gameState.hasFoundMemoryPage = true;
            } else if (gameState.chapterProgress === 2 && enemies.length === 0) {
                // When all enemies are defeated
                this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "The Eidolon Tree... that's where I need to go next. The answers are becoming clearer.");
                
                // Progress to next chapter
                gameState.currentChapter = CHAPTERS.EIDOLON_TREE;
                gameState.chapterProgress = 0;
                this.spawnChapterEnemies(); // Spawn enemies for the new chapter
                player.resetTimeSlowAbility(); // Reset time slow ability
            }
        };
        
        // Chapter 4 - Eidolon Tree
        this.storyEvents[CHAPTERS.EIDOLON_TREE] = () => {
            if (gameState.chapterProgress === 0) {
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.THORNE, text: "The Eidolon Tree... they say it connects all memories within the Verge." },
                    { character: CHARACTERS.VOICE_TRUTH, text: "Its roots run deep, Thorne. Deeper than you can imagine." },
                    { character: CHARACTERS.VOICE_FURY, text: "The Church used this place for their rituals. They must pay for what they did." }
                ]);
                gameState.chapterProgress = 1;
            } else if (gameState.chapterProgress === 1 && player.x > canvas.width * 0.7) {
                // Trigger when player reaches a certain point
                this.dialogueSystem.addDialogueSequence([
                    { character: CHARACTERS.AILA, text: "Father... the tree speaks to me. It shows me things." },
                    { character: CHARACTERS.THORNE, text: "Aila? Is it really you this time?" },
                    { character: CHARACTERS.AILA, text: "I'm scattered, father. Pieces of me exist throughout the Verge." },
                    { character: CHARACTERS.AILA, text: "Find the Voice Manifestation. That's where they performed the ritual." }
                ]);
                gameState.chapterProgress = 2;
            } else if (gameState.chapterProgress === 2 && enemies.length === 0) {
                // When all enemies are defeated
                this.dialogueSystem.addDialogue(CHARACTERS.THORNE, "The Voice Manifestation... I must go there to understand what happened to Aila.");
                
                // Progress to next chapter
                gameState.currentChapter = CHAPTERS.VOICE_MANIFESTATION;
                gameState.chapterProgress = 0;
                this.spawnChapterEnemies(); // Spawn enemies for the new chapter
                player.resetTimeSlowAbility(); // Reset time slow ability
            }
        };
    }

    triggerCurrentChapterEvents() {
        const currentChapterEvent = this.storyEvents[gameState.currentChapter];
        if (currentChapterEvent) {
            currentChapterEvent();
        }
    }

    updateChapterBackground() {
        // Change the visual elements based on current chapter
        switch (gameState.currentChapter) {
            case CHAPTERS.INTRO:
            case CHAPTERS.ASH_CHAPEL:
                COLORS.BACKGROUND_1 = '#111122';
                COLORS.BACKGROUND_2 = '#222233';
                COLORS.PLATFORM = '#555555';
                break;
            case CHAPTERS.BRIDGE:
                COLORS.BACKGROUND_1 = '#1a1a2e';
                COLORS.BACKGROUND_2 = '#292944';
                COLORS.PLATFORM = '#444466';
                break;
            case CHAPTERS.WHISPERING_ROOM:
                COLORS.BACKGROUND_1 = '#221122';
                COLORS.BACKGROUND_2 = '#332233';
                COLORS.PLATFORM = '#553355';
                break;
            case CHAPTERS.EIDOLON_TREE:
                COLORS.BACKGROUND_1 = '#112211';
                COLORS.BACKGROUND_2 = '#223322';
                COLORS.PLATFORM = '#335533';
                break;
            // Add more chapters with unique visuals
        }
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.facingRight = true;
        this.health = 5;
        this.maxHealth = 5;
        this.soul = 50; // Start with some soul for abilities
        this.maxSoul = 100;
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.canDoubleJump = true;
        this.jumpKeyPressed = false;
        this.dashKeyPressed = false;
        
        // Time slow ability
        this.timeSlowActive = false;
        this.timeSlowDuration = 180; // 3 seconds at 60 FPS
        this.timeSlowTimer = 0;
        this.timeSlowCooldown = 600; // 10 seconds at 60 FPS
        this.timeSlowCooldownTimer = 0;
        this.timeSlowKeyPressed = false;
        
        // Thorne-specific properties
        this.name = "Thorne";
        this.emotionalState = null; // Can be truth, regret, or fury
    }

    update(platforms) {
        // Time slow cooldown
        if (this.timeSlowCooldownTimer > 0) {
            this.timeSlowCooldownTimer--;
        }
        
        // Time slow active timer
        if (this.timeSlowActive) {
            this.timeSlowTimer--;
            if (this.timeSlowTimer <= 0) {
                this.timeSlowActive = false;
                // Reset enemy speeds to normal
                enemies.forEach(enemy => {
                    enemy.timeSlowFactor = 1;
                });
            }
        }
        
        // Dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }

        // Dashing logic
        if (this.isDashing) {
            this.dashTimer--;
            if (this.dashTimer <= 0) {
                this.isDashing = false;
                this.velocityX = 0;
            }
            return; // Skip other physics when dashing
        }

        // Attack timer
        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }

        // Apply gravity
        this.velocityY += GRAVITY;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Check for platform collisions
        this.checkPlatformCollisions(platforms);

        // Bound to canvas
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    checkPlatformCollisions(platforms) {
        let onGround = false;

        for (const platform of platforms) {
            // Check if player is colliding with platform
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {

                // Collision from top (landing)
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    onGround = true;
                    this.canDoubleJump = true;
                }
                // Collision from bottom
                else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Collision from left
                else if (this.velocityX > 0 && this.x + this.width - this.velocityX <= platform.x) {
                    this.x = platform.x - this.width - 1; // Add 1 pixel margin
                    this.velocityX = 0; // Stop horizontal movement
                }
                // Collision from right
                else if (this.velocityX < 0 && this.x - this.velocityX >= platform.x + platform.width) {
                    this.x = platform.x + platform.width + 1; // Add 1 pixel margin
                    this.velocityX = 0; // Stop horizontal movement
                }
            }
        }

        this.isJumping = !onGround;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
        } else if (this.canDoubleJump) {
            // Double jump
            this.velocityY = JUMP_FORCE;
            this.canDoubleJump = false;
        }
    }

    attack() {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = ATTACK_DURATION;
        }
    }

    dash() {
        if (!this.isDashing && this.dashCooldown === 0) {
            this.isDashing = true;
            this.dashTimer = DASH_DURATION;
            this.dashCooldown = DASH_COOLDOWN;
            this.velocityX = this.facingRight ? DASH_SPEED : -DASH_SPEED;
            this.velocityY = 0; // No gravity during dash
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            gameState.gameOver = true;
        }
    }

    gainSoul(amount) {
        this.soul = Math.min(this.soul + amount, this.maxSoul);
    }

    draw() {
        // Optimize drawing by minimizing context state changes
        
        // Draw dash effect (afterimages) first if dashing
        if (this.isDashing) {
            ctx.fillStyle = COLORS.PLAYER_DASH;
            for (let i = 1; i <= 3; i++) {
                const alpha = 0.3 - (i * 0.1);
                ctx.globalAlpha = alpha;
                const offset = this.facingRight ? -i * 10 : i * 10;
                ctx.fillRect(this.x + offset, this.y, this.width, this.height);
            }
            ctx.globalAlpha = 1; // Reset alpha once
        }
        
        // Main player body
        ctx.fillStyle = COLORS.PLAYER;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw attack animation
        if (this.isAttacking) {
            ctx.fillStyle = COLORS.PLAYER_ATTACK;
            const attackWidth = 40;
            const attackX = this.facingRight ? this.x + this.width : this.x - attackWidth;
            ctx.fillRect(attackX, this.y + 10, attackWidth, this.height - 20);
        }
    }

    drawHUD() {
        // Health
        ctx.fillStyle = COLORS.HEALTH;
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('SANITY', 20, 18);
        for (let i = 0; i < this.maxHealth; i++) {
            ctx.globalAlpha = i < this.health ? 1 : 0.3;
            ctx.fillRect(20 + i * 30, 25, 20, 20);
        }
        
        // Soul meter (renamed to "Memory Essence")
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#AAAAFF";
        ctx.fillText('MEMORY ESSENCE', 20, 65);
        ctx.fillStyle = "#333333";
        ctx.fillRect(20, 70, 100, 10);
        ctx.fillStyle = COLORS.SOUL;
        ctx.fillRect(20, 70, this.soul, 10);
        
        // Ability indicators
        ctx.fillStyle = "#AAAAFF";
        ctx.fillText('ABILITIES', 20, 105);
        
        // Time slow ability icon
        ctx.beginPath();
        ctx.arc(30, 125, 15, 0, Math.PI * 2);
        
        // Change color based on cooldown
        if (this.timeSlowCooldownTimer > 0) {
            // Show cooldown progress
            ctx.fillStyle = "#555555";
            ctx.fill();
            
            // Draw cooldown overlay
            const cooldownProgress = this.timeSlowCooldownTimer / this.timeSlowCooldown;
            ctx.beginPath();
            ctx.moveTo(30, 125);
            ctx.arc(30, 125, 15, -Math.PI/2, -Math.PI/2 + (1 - cooldownProgress) * Math.PI * 2);
            ctx.lineTo(30, 125);
            ctx.fillStyle = "#88CCFF";
            ctx.fill();
            
            // Show cooldown text
            ctx.fillStyle = "#FFFFFF";
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const cooldownSeconds = Math.ceil(this.timeSlowCooldownTimer / 60);
            ctx.fillText(cooldownSeconds, 30, 128);
        } else {
            // Ready to use
            ctx.fillStyle = this.timeSlowActive ? "#FFCC00" : "#88CCFF";
            ctx.fill();
            
            // Draw clock icon
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(30, 125);
            ctx.lineTo(30, 118);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(30, 125);
            ctx.lineTo(35, 125);
            ctx.stroke();
        }
        
        // Key binding text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('C', 30, 145);
        
        // Chapter display
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        let chapterName = "";
        switch(gameState.currentChapter) {
            case CHAPTERS.INTRO: chapterName = "Prologue"; break;
            case CHAPTERS.ASH_CHAPEL: chapterName = "Chapter 1: Ash Chapel"; break;
            case CHAPTERS.BRIDGE: chapterName = "Chapter 2: Bridge of Forgotten Names"; break;
            case CHAPTERS.WHISPERING_ROOM: chapterName = "Chapter 3: The Whispering Room"; break;
            case CHAPTERS.EIDOLON_TREE: chapterName = "Chapter 4: Eidolon Tree"; break;
            case CHAPTERS.VOICE_MANIFESTATION: chapterName = "Chapter 5: Voice Manifestation"; break;
            case CHAPTERS.LAMENT_GATE: chapterName = "Chapter 6: The Lament Gate"; break;
            case CHAPTERS.FOLDED_THRONE: chapterName = "Final Chapter: The Folded Throne"; break;
        }
        ctx.fillText(chapterName, canvas.width / 2, 30);
    }
    
    // Time slow ability
    activateTimeSlow() {
        if (!this.timeSlowActive && this.timeSlowCooldownTimer === 0 && this.soul >= 20) {
            this.timeSlowActive = true;
            this.timeSlowTimer = this.timeSlowDuration;
            this.timeSlowCooldownTimer = this.timeSlowCooldown;
            this.soul -= 20; // Cost soul to use ability
            
            // Slow down all enemies
            enemies.forEach(enemy => {
                enemy.timeSlowFactor = 0.3; // Enemies move at 30% speed
            });
            
            // Visual effect for time slow
            createTimeSlowEffect();
        }
    }
    
    // Reset time slow ability (called on chapter clear or death)
    resetTimeSlowAbility() {
        this.timeSlowActive = false;
        this.timeSlowTimer = 0;
        this.timeSlowCooldownTimer = 0;
        
        // Reset enemy speeds to normal
        enemies.forEach(enemy => {
            enemy.timeSlowFactor = 1;
        });
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.velocityX = 1; // Move back and forth
        this.velocityY = 0;
        this.type = type;
        this.health = 2;
        this.damage = 1;
        this.soulValue = 10;
        this.attackCooldown = 0;
        this.timeSlowFactor = 1; // Default normal speed (1 = 100%)
        
        // Story-specific enemy types
        switch(type) {
            case 'verge':
                this.color = COLORS.VERGE_CORRUPTION;
                this.health = 3;
                this.damage = 2;
                this.soulValue = 15;
                break;
            case 'memory':
                this.color = '#7788FF';
                this.health = 1;
                this.damage = 1;
                this.soulValue = 20;
                break;
            case 'voice':
                this.color = '#FF7788';
                this.health = 4;
                this.damage = 2;
                this.soulValue = 25;
                break;
            default:
                this.color = COLORS.ENEMY;
        }
    }

    update(platforms, player) {
        // Apply gravity (affected by time slow)
        this.velocityY += GRAVITY * this.timeSlowFactor;

        // Basic movement - patrol back and forth (affected by time slow)
        this.x += this.velocityX * this.timeSlowFactor;
        this.y += this.velocityY * this.timeSlowFactor;

        // Simple AI (affected by time slow)
        if (Math.random() < 0.01 * this.timeSlowFactor) {
            this.velocityX *= -1; // Randomly change direction
        }

        // Check for platform collisions
        for (const platform of platforms) {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {
                
                // Landing on platform
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                }
                // Hit ceiling
                else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Hit wall - change direction
                else if (this.velocityX > 0 && this.x + this.width - this.velocityX <= platform.x) {
                    this.x = platform.x - this.width;
                    this.velocityX *= -1;
                }
                else if (this.velocityX < 0 && this.x - this.velocityX >= platform.x + platform.width) {
                    this.x = platform.x + platform.width;
                    this.velocityX *= -1;
                }
            }
        }

        // Check for edge of platforms and reverse direction
        let onPlatform = false;
        for (const platform of platforms) {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height === platform.y) {
                onPlatform = true;
                
                // Check if about to walk off edge
                if ((this.velocityX > 0 && this.x + this.width + 5 > platform.x + platform.width) ||
                    (this.velocityX < 0 && this.x - 5 < platform.x)) {
                    this.velocityX *= -1;
                }
                break;
            }
        }

        // Check for collision with player
        if (this.attackCooldown > 0) {
            // Attack cooldown affected by time slow
            this.attackCooldown -= this.timeSlowFactor;
        }

        if (this.checkCollision(player) && this.attackCooldown === 0) {
            player.takeDamage(this.damage);
            this.attackCooldown = 30; // Prevent constant damage
        }

        // Check if enemy is hit by player attack
        if (player.isAttacking) {
            const attackBox = {
                x: player.facingRight ? player.x + player.width : player.x - 40,
                y: player.y + 10,
                width: 40,
                height: player.height - 20
            };
            
            if (this.checkCollisionWithRect(attackBox)) {
                this.health--;
                if (this.health <= 0) {
                    player.gainSoul(this.soulValue);
                    return false; // Enemy is defeated
                }
                
                // Knockback
                this.velocityX = player.facingRight ? 5 : -5;
                this.velocityY = -3;
            }
        }

        return true; // Enemy is still alive
    }

    checkCollision(player) {
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }

    checkCollisionWithRect(rect) {
        return this.x < rect.x + rect.width &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.height &&
               this.y + this.height > rect.y;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw time slow effect if active
        if (this.timeSlowFactor < 1) {
            ctx.strokeStyle = '#88CCFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.stroke();
            
            // Draw clock icon above enemy
            ctx.fillStyle = '#88CCFF';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 10, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + this.width / 2, this.y - 14);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y - 10);
            ctx.lineTo(this.x + this.width / 2 + 3, this.y - 8);
            ctx.stroke();
        }
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
        ctx.fillStyle = COLORS.PLATFORM;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Game initialization
let player = new Player(canvas.width / 2, canvas.height / 2);
let enemies = [
    new Enemy(100, 100, 'verge'),
    new Enemy(400, 200, 'memory'),
    new Enemy(600, 150, 'verge')
];
let platforms = [
    // Ground
    new Platform(0, canvas.height - 30, canvas.width, 30),
    // Platforms
    new Platform(100, 350, 200, 20),
    new Platform(400, 300, 200, 20),
    new Platform(200, 200, 150, 20),
    new Platform(500, 150, 100, 20),
    new Platform(50, 150, 100, 20)
];

// Memory fragments (collectibles that provide story exposition)
let memoryFragments = [];

// Dialogue and Story Initialization
const dialogueSystem = new DialogueSystem();
const storyManager = new StoryManager(dialogueSystem);

// Input handling
const keys = {
    arrowUpPressed: false,
    arrowDownPressed: false,
    spacePressed: false
};

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    
    // Prevent scrolling with space/arrow keys
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
    
    // Reset key pressed flags
    if (e.code === 'ArrowUp') keys.arrowUpPressed = false;
    if (e.code === 'ArrowDown') keys.arrowDownPressed = false;
    if (e.code === 'Space') keys.spacePressed = false;
});

// Mouse click event for sound button and dialogue choices
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Input validation - ensure coordinates are within canvas bounds
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
        return; // Ignore clicks outside canvas
    }
    
    // Check if sound button was clicked
    if (audioManager.isSoundButtonClicked(x, y)) {
        audioManager.toggleSound();
        return;
    }
    
    // Check if dialogue choice was clicked
    if (gameState.inDialogue) {
        dialogueSystem.handleMouseClick(x, y);
    }
});

// Mouse move event for dialogue choice hover
canvas.addEventListener('mousemove', e => {
    if (!gameState.inDialogue || !dialogueSystem.currentDialogue || 
        !dialogueSystem.dialogueComplete || !dialogueSystem.choiceAreas.length) {
        canvas.style.cursor = 'default';
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Input validation - ensure coordinates are valid
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
        canvas.style.cursor = 'default';
        return;
    }
    
    // Check if mouse is over a choice
    const choiceIndex = dialogueSystem.isPointInChoice(x, y);
    if (choiceIndex !== null) {
        canvas.style.cursor = 'pointer'; // Change cursor to pointer
        if (choiceIndex !== -1) {
            dialogueSystem.selectedChoice = choiceIndex;
        }
    } else {
        canvas.style.cursor = 'default'; // Reset cursor
    }
});

// Frame rate control
let lastTime = 0;
const frameTime = 1000 / TARGET_FPS;

// Game loop
function gameLoop(currentTime = 0) {
    try {
        // Frame rate limiting
        if (currentTime - lastTime < frameTime) {
            requestAnimationFrame(gameLoop);
            return;
        }
        lastTime = currentTime;
        
        if (gameState.gameOver) {
            drawGameOver();
            requestAnimationFrame(gameLoop);
            return;
        }
        
        if (gameState.paused) {
            drawPaused();
            requestAnimationFrame(gameLoop);
            return;
        }
    
    // Clear canvas
    ctx.fillStyle = COLORS.BACKGROUND_1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update story and dialogue
    storyManager.updateChapterBackground();
    dialogueSystem.update();
    
    // Update visual effects
    updateVisualEffects();
    
    // Only handle game input if not in dialogue
    if (!gameState.inDialogue) {
        // Handle player input
        handleInput();
        
        // Update game objects
        player.update(platforms);
        
        // Update enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            // Bounds checking to prevent array access errors
            if (i < 0 || i >= enemies.length) continue;
            
            const isAlive = enemies[i].update(platforms, player);
            if (!isAlive) {
                enemies.splice(i, 1);
                
                // Check for story triggers when enemies are defeated
                storyManager.triggerCurrentChapterEvents();
            }
        }
    } else {
        // Handle dialogue input when in dialogue mode
        dialogueSystem.handleInput(keys);
    }
    
    // Draw game objects
    platforms.forEach(platform => platform.draw());
    enemies.forEach(enemy => enemy.draw());
    player.draw();
    
    // Draw UI
    player.drawHUD();
    
    // Draw emotional inventory (based on Disco Elysium thought cabinet)
    drawEmotionalInventory();
    
    // Draw visual effects
    drawVisualEffects();
    
    // Draw sound button
    audioManager.drawSoundButton();
    
    // Draw dialogue last (on top of everything)
    dialogueSystem.draw();
    
    // Check for story triggers based on game state
    if (!gameState.inDialogue) {
        storyManager.triggerCurrentChapterEvents();
    }
    
        // Continue game loop
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("Game loop error:", error);
        // Try to continue the game loop despite errors
        requestAnimationFrame(gameLoop);
    }
}

function handleInput() {
    // Movement
    player.velocityX = 0;
    
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.velocityX = -PLAYER_SPEED;
        player.facingRight = false;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.velocityX = PLAYER_SPEED;
        player.facingRight = true;
    }
    
    // Jump - only if not just exiting dialogue
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !player.jumpKeyPressed && !keys.spacePressed) {
        player.jump();
        player.jumpKeyPressed = true;
    }
    if (!(keys['ArrowUp'] || keys['KeyW'] || keys['Space'])) {
        player.jumpKeyPressed = false;
    }
    
    // Attack
    if (keys['KeyZ'] || keys['KeyJ']) {
        player.attack();
    }
    
    // Dash
    if ((keys['KeyX'] || keys['KeyK']) && !player.dashKeyPressed) {
        player.dash();
        player.dashKeyPressed = true;
    }
    if (!(keys['KeyX'] || keys['KeyK'])) {
        player.dashKeyPressed = false;
    }
    
    // Time Slow Ability
    if ((keys['KeyC'] || keys['KeyL']) && !player.timeSlowKeyPressed) {
        player.activateTimeSlow();
        player.timeSlowKeyPressed = true;
    }
    if (!(keys['KeyC'] || keys['KeyL'])) {
        player.timeSlowKeyPressed = false;
    }
    
    // Pause
    if (keys['Escape'] && !gameState.escapeKeyPressed) {
        gameState.paused = !gameState.paused;
        gameState.escapeKeyPressed = true;
    }
    if (!keys['Escape']) {
        gameState.escapeKeyPressed = false;
    }
}

function drawBackground() {
    // Draw some parallax background elements
    ctx.fillStyle = COLORS.BACKGROUND_2;
    
    // Distant mountains/structures
    for (let i = 0; i < 5; i++) {
        const width = 150 + Math.random() * 100;
        const height = 100 + Math.random() * 200;
        const x = (i * 200) % canvas.width;
        const y = canvas.height - height;
        
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x + width, canvas.height);
        ctx.fill();
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SANITY LOST', canvas.width / 2, canvas.height / 2 - 40);
    
    // Display current chapter
    ctx.font = '24px Arial';
    let chapterName = "";
    switch(gameState.currentChapter) {
        case CHAPTERS.INTRO: chapterName = "Prologue"; break;
        case CHAPTERS.ASH_CHAPEL: chapterName = "Chapter 1: Ash Chapel"; break;
        case CHAPTERS.BRIDGE: chapterName = "Chapter 2: Bridge of Forgotten Names"; break;
        case CHAPTERS.WHISPERING_ROOM: chapterName = "Chapter 3: The Whispering Room"; break;
        case CHAPTERS.EIDOLON_TREE: chapterName = "Chapter 4: Eidolon Tree"; break;
        case CHAPTERS.VOICE_MANIFESTATION: chapterName = "Chapter 5: Voice Manifestation"; break;
        case CHAPTERS.LAMENT_GATE: chapterName = "Chapter 6: The Lament Gate"; break;
        case CHAPTERS.FOLDED_THRONE: chapterName = "Final Chapter: The Folded Throne"; break;
    }
    ctx.fillText(chapterName, canvas.width / 2, canvas.height / 2);
    
    ctx.fillText('The Verge has consumed your sanity', canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText('Press R to continue your journey', canvas.width / 2, canvas.height / 2 + 70);
    
    // Draw sound button
    audioManager.drawSoundButton();
    
    // Restart game on R key
    if (keys['KeyR']) {
        resetGame();
    }
}

function drawPaused() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText('Press ESC to resume', canvas.width / 2, canvas.height / 2 + 30);
    
    // Draw sound button
    audioManager.drawSoundButton();
}

function getCheckpointPosition() {
    // Return appropriate spawn position based on current chapter and progress
    switch(gameState.currentChapter) {
        case CHAPTERS.INTRO:
            return { x: canvas.width / 2, y: canvas.height / 2 };
            
        case CHAPTERS.ASH_CHAPEL:
            if (gameState.chapterProgress >= 1) {
                return { x: canvas.width * 0.4, y: canvas.height / 2 };
            }
            return { x: canvas.width / 4, y: canvas.height / 2 };
            
        case CHAPTERS.BRIDGE:
            if (gameState.chapterProgress >= 1) {
                return { x: canvas.width * 0.6, y: canvas.height / 2 };
            }
            return { x: canvas.width / 3, y: canvas.height / 2 };
            
        case CHAPTERS.WHISPERING_ROOM:
            if (gameState.chapterProgress >= 1) {
                return { x: canvas.width * 0.5, y: canvas.height / 2 };
            }
            return { x: canvas.width / 4, y: canvas.height / 2 };
            
        case CHAPTERS.EIDOLON_TREE:
            if (gameState.chapterProgress >= 1) {
                return { x: canvas.width * 0.6, y: canvas.height / 2 };
            }
            return { x: canvas.width / 3, y: canvas.height / 2 };
            
        default:
            return { x: canvas.width / 2, y: canvas.height / 2 };
    }
}

function resetGame() {
    // Store current chapter and progress before reset
    const currentChapter = gameState.currentChapter;
    const chapterProgress = gameState.chapterProgress;
    const emotionalInventory = { ...gameState.emotionalInventory };
    const hasEncounteredKas = gameState.hasEncounteredKas;
    const hasFoundMemoryPage = gameState.hasFoundMemoryPage;
    
    // Get checkpoint position based on chapter progress
    const checkpoint = getCheckpointPosition();
    
    // Reset player at checkpoint position
    player = new Player(checkpoint.x, checkpoint.y);
    
    // Reset game state but preserve story progress
    gameState.gameOver = false;
    gameState.paused = false;
    gameState.inDialogue = false;
    
    // Restore chapter and progress
    gameState.currentChapter = currentChapter;
    gameState.chapterProgress = chapterProgress;
    gameState.emotionalInventory = emotionalInventory;
    gameState.hasEncounteredKas = hasEncounteredKas;
    gameState.hasFoundMemoryPage = hasFoundMemoryPage;
    
    // Respawn enemies based on current chapter
    storyManager.spawnChapterEnemies();
    
    // Reset player abilities
    player.resetTimeSlowAbility();
    
    // Ensure music is playing if enabled
    audioManager.playMusic();
}

function drawEmotionalInventory() {
    // Draw emotional states at the top-right
    const emotions = Object.entries(gameState.emotionalInventory);
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    
    emotions.forEach((emotion, index) => {
        const [type, value] = emotion;
        let color;
        
        switch(type) {
            case EMOTIONS.TRUTH:
                color = '#AAAAFF';
                break;
            case EMOTIONS.REGRET:
                color = '#AAFFAA';
                break;
            case EMOTIONS.FURY:
                color = '#FFAAAA';
                break;
        }
        
        ctx.fillStyle = color;
        ctx.fillText(`${type}: ${value}`, canvas.width - 20, 80 + index * 20);
    });
}

// Start game
function startGame() {
    // Initialize audio
    audioManager.init();
    
    // Start game loop
    gameLoop();
}

// Initialize and start game
startGame();

// Visual effects
let visualEffects = [];

function createTimeSlowEffect() {
    // Create a ripple effect
    visualEffects.push({
        type: 'timeSlow',
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        radius: 10,
        maxRadius: 200,
        duration: 30,
        timer: 30,
        color: 'rgba(136, 204, 255, 0.5)'
    });
}

function updateVisualEffects() {
    // Prevent memory leaks by limiting maximum effects
    if (visualEffects.length > MAX_VISUAL_EFFECTS) {
        visualEffects.splice(0, visualEffects.length - MAX_VISUAL_EFFECTS);
    }
    
    for (let i = visualEffects.length - 1; i >= 0; i--) {
        // Bounds checking
        if (i < 0 || i >= visualEffects.length) continue;
        
        const effect = visualEffects[i];
        effect.timer--;
        
        if (effect.timer <= 0) {
            visualEffects.splice(i, 1);
            continue;
        }
        
        // Update specific effect types
        if (effect.type === 'timeSlow') {
            effect.radius = effect.maxRadius * (1 - effect.timer / effect.duration);
        }
    }
}

function drawVisualEffects() {
    for (const effect of visualEffects) {
        if (effect.type === 'timeSlow') {
            // Draw time slow ripple
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = effect.timer / effect.duration;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
} 