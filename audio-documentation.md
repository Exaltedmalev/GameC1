[# Audio System Documentation

## Overview

This document explains the audio system implemented in the Hollowveil game. The system provides background music, sound control, and a user interface for toggling audio.

## Audio Manager

The core of the audio system is the `audioManager` object, which handles all audio-related functionality:

```javascript
const audioManager = {
    bgMusic: null,
    bossMusic: null,
    soundEnabled: true,
    currentTrack: 'normal',
    
    // Methods for controlling audio...
}
```

### Key Components

1. **Audio Tracks**
   - `bgMusic`: Main background music (apocalyptic orchestral theme)
   - `bossMusic`: Intense music for boss battles

2. **State Management**
   - `soundEnabled`: Boolean flag to track if sound is on/off
   - `currentTrack`: Tracks which music is currently playing ('normal' or 'boss')

## Core Functions

### Initialization

```javascript
init() {
    // Create background music element
    this.bgMusic = new Audio('https://cdn.freesound.org/previews/425/425556_4929134-lq.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.4;
    
    // Create boss battle music
    this.bossMusic = new Audio('https://cdn.freesound.org/previews/352/352172_1526022-lq.mp3');
    this.bossMusic.loop = true;
    this.bossMusic.volume = 0.5;
    
    // Start playing if enabled
    if (this.soundEnabled) {
        this.playMusic();
    }
}
```

This function:
- Creates Audio objects for both music tracks
- Sets them to loop continuously
- Adjusts volume levels
- Begins playback if sound is enabled

### Music Control

```javascript
playMusic() {
    if (!this.soundEnabled) return;
    
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
}
```

This function:
- Checks if sound is enabled
- Plays the appropriate track based on the current game context
- Pauses the other track to avoid overlapping audio
- Includes error handling for browsers that require user interaction before playing audio

### Track Switching

```javascript
switchToBossMusic() {
    if (this.currentTrack !== 'boss') {
        this.currentTrack = 'boss';
        this.playMusic();
    }
}

switchToNormalMusic() {
    if (this.currentTrack !== 'normal') {
        this.currentTrack = 'normal';
        this.playMusic();
    }
}
```

These functions:
- Allow the game to switch between normal and boss music based on gameplay context
- Prevent unnecessary audio reloading by checking the current track first

### Sound Toggle

```javascript
toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
        this.playMusic();
    } else {
        this.pauseMusic();
    }
}
```

This function:
- Toggles the sound on/off state
- Plays or pauses music accordingly

## User Interface

### Sound Button

```javascript
drawSoundButton() {
    // Draw button background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(canvas.width - 30, 30, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw sound icon or muted icon
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    
    if (this.soundEnabled) {
        // Sound on icon
        // ...drawing code...
    } else {
        // Sound off icon
        // ...drawing code...
    }
}
```

This function:
- Draws a circular button in the top-right corner
- Shows different icons based on whether sound is enabled or disabled
- Uses canvas drawing operations to create speaker icons

### Click Detection

```javascript
isSoundButtonClicked(x, y) {
    const distance = Math.sqrt(
        Math.pow(x - (canvas.width - 30), 2) + 
        Math.pow(y - 30, 2)
    );
    return distance <= 20;
}
```

This function:
- Calculates the distance between the click point and the button center
- Returns true if the click was within the button's radius

## Integration with Game Loop

The sound button is drawn in all game states:

1. **Main Game Loop**
   ```javascript
   // Draw sound button
   audioManager.drawSoundButton();
   ```

2. **Pause Screen**
   ```javascript
   function drawPaused() {
       // ...existing code...
       
       // Draw sound button
       audioManager.drawSoundButton();
   }
   ```

3. **Game Over Screen**
   ```javascript
   function drawGameOver() {
       // ...existing code...
       
       // Draw sound button
       audioManager.drawSoundButton();
   }
   ```

## Event Handling

```javascript
// Mouse click event for sound button
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if sound button was clicked
    if (audioManager.isSoundButtonClicked(x, y)) {
        audioManager.toggleSound();
    }
});
```

This code:
- Listens for clicks on the canvas
- Converts the click coordinates to canvas space
- Checks if the click was on the sound button
- Toggles sound if the button was clicked

## Game State Integration

The audio system is integrated with various game states:

1. **Game Initialization**
   ```javascript
   function startGame() {
       // Initialize audio
       audioManager.init();
       
       // Start game loop
       gameLoop();
   }
   ```

2. **Player Respawn**
   ```javascript
   function resetGame() {
       // ...existing code...
       
       // Ensure music is playing if enabled
       audioManager.playMusic();
   }
   ```

## Using the Audio System

### For Developers

1. **Play/Pause Music**
   ```javascript
   audioManager.playMusic();  // Play current track
   audioManager.pauseMusic(); // Pause all music
   ```

2. **Switch Tracks**
   ```javascript
   audioManager.switchToBossMusic();  // For boss battles
   audioManager.switchToNormalMusic(); // For regular gameplay
   ```

3. **Toggle Sound**
   ```javascript
   audioManager.toggleSound(); // Toggle sound on/off
   ```

4. **Check Sound State**
   ```javascript
   if (audioManager.soundEnabled) {
       // Sound is on
   } else {
       // Sound is off
   }
   ```

### Future Enhancements

Potential improvements to the audio system:

1. **Sound Effects**
   - Add sound effects for actions like jumping, attacking, and taking damage
   - Implement a separate volume control for music vs. sound effects

2. **Additional Music Tracks**
   - Chapter-specific background music
   - Special event music for story moments

3. **Audio Settings Menu**
   - Allow players to adjust volume levels
   - Separate toggles for music and sound effects

4. **Dynamic Music**
   - Crossfade between tracks for smoother transitions
   - Adapt music based on player health or emotional inventory 