# Boss Mechanics - Elden Ring & Dark Souls 3

This file contains boss code implementations inspired by **Malenia, Blade of Miquella** from Elden Ring and **Slave Knight Gael** from Dark Souls 3.

## Malenia, Blade of Miquella

```javascript
class Malenia extends Enemy {
    constructor(x, y) {
        super(x, y, 'malenia');
        this.maxHealth = 3000;
        this.health = this.maxHealth;
        this.phase = 1;
        this.scarletRotStacks = 0;
        this.waterfowlCharging = false;
        this.waterfowlCooldown = 0;
        this.healOnHit = true;
        this.prostheticArm = true;
        
        // Attack patterns
        this.attacks = {
            slashCombo: { damage: 80, cooldown: 0, range: 100 },
            thrust: { damage: 120, cooldown: 0, range: 150 },
            waterfowlDance: { damage: 200, cooldown: 0, hits: 4 },
            scarletAeonia: { damage: 300, cooldown: 0, aoe: 200 }
        };
        
        // Phase 2 transformations
        this.goddessOfRot = false;
        this.rotWings = false;
        this.diveDive = { active: false, damage: 250 };
        
        // Movement
        this.speed = 3;
        this.agility = 8; // High mobility
        this.canFly = false;
    }
    
    update(platforms, player) {
        super.update(platforms, player);
        
        // Phase transition at 50% health
        if (this.health <= this.maxHealth * 0.5 && this.phase === 1) {
            this.enterPhase2();
        }
        
        this.updateAttackCooldowns();
        this.decideAttack(player);
        this.updateScarletRot(player);
    }
    
    enterPhase2() {
        this.phase = 2;
        this.goddessOfRot = true;
        this.rotWings = true;
        this.canFly = true;
        this.health = this.maxHealth; // Full heal on phase transition
        this.scarletRotStacks = 0;
        
        // Enhanced abilities
        this.speed += 2;
        this.attacks.waterfowlDance.hits = 6;
        this.attacks.scarletAeonia.aoe = 300;
    }
    
    decideAttack(player) {
        const distanceToPlayer = Math.abs(this.x - player.x);
        
        if (this.phase === 2 && this.attacks.scarletAeonia.cooldown <= 0) {
            this.scarletAeonia(player);
        } else if (this.waterfowlCooldown <= 0 && distanceToPlayer < 200) {
            this.waterfowlDance(player);
        } else if (distanceToPlayer < 100 && this.attacks.slashCombo.cooldown <= 0) {
            this.slashCombo(player);
        } else if (distanceToPlayer < 150 && this.attacks.thrust.cooldown <= 0) {
            this.thrustAttack(player);
        }
    }
    
    waterfowlDance(player) {
        this.waterfowlCharging = true;
        this.waterfowlCooldown = 180; // 3 second cooldown at 60fps
        
        // Multi-hit flurry attack
        for (let i = 0; i < this.attacks.waterfowlDance.hits; i++) {
            setTimeout(() => {
                this.createWaterfowlSlash(player, i);
            }, i * 200); // 200ms between each slash
        }
        
        // Self-heal on successful hits
        if (this.healOnHit) {
            this.health += 50 * this.attacks.waterfowlDance.hits;
            this.health = Math.min(this.health, this.maxHealth);
        }
    }
    
    createWaterfowlSlash(player, slashIndex) {
        const angle = (slashIndex * Math.PI) / 4; // Spread slashes in arc
        const slashX = this.x + Math.cos(angle) * 80;
        const slashY = this.y + Math.sin(angle) * 80;
        
        // Check if player is in range
        const distance = Math.sqrt((player.x - slashX) ** 2 + (player.y - slashY) ** 2);
        if (distance < 60) {
            player.takeDamage(this.attacks.waterfowlDance.damage / this.attacks.waterfowlDance.hits);
            this.applyScarletRot(player);
        }
    }
    
    scarletAeonia(player) {
        this.attacks.scarletAeonia.cooldown = 300; // 5 second cooldown
        
        // Large AoE explosion
        const distance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);
        if (distance < this.attacks.scarletAeonia.aoe) {
            player.takeDamage(this.attacks.scarletAeonia.damage);
            this.applyScarletRot(player, 5); // Heavy rot application
        }
        
        // Create rot pools around the area
        this.createRotPools();
    }
    
    applyScarletRot(player, stacks = 1) {
        this.scarletRotStacks += stacks;
        player.statusEffects = player.statusEffects || {};
        player.statusEffects.scarletRot = (player.statusEffects.scarletRot || 0) + stacks;
    }
    
    updateScarletRot(player) {
        if (player.statusEffects && player.statusEffects.scarletRot > 0) {
            // Deal damage over time
            if (gameState.frameCount % 60 === 0) { // Every second
                player.takeDamage(player.statusEffects.scarletRot * 5);
                player.statusEffects.scarletRot = Math.max(0, player.statusEffects.scarletRot - 1);
            }
        }
    }
    
    slashCombo(player) {
        this.attacks.slashCombo.cooldown = 90;
        
        // Three-hit combo
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (Math.abs(this.x - player.x) < this.attacks.slashCombo.range) {
                    player.takeDamage(this.attacks.slashCombo.damage);
                    if (this.healOnHit) {
                        this.health += 15;
                        this.health = Math.min(this.health, this.maxHealth);
                    }
                }
            }, i * 300);
        }
    }
    
    updateAttackCooldowns() {
        Object.keys(this.attacks).forEach(attackName => {
            if (this.attacks[attackName].cooldown > 0) {
                this.attacks[attackName].cooldown--;
            }
        });
        
        if (this.waterfowlCooldown > 0) {
            this.waterfowlCooldown--;
        }
    }
    
    draw() {
        // Base enemy drawing
        super.draw();
        
        // Malenia-specific visual elements
        if (this.phase === 2) {
            this.drawRotWings();
        }
        
        this.drawProstheticArm();
        this.drawHealthBar();
        
        if (this.waterfowlCharging) {
            this.drawWaterfowlEffect();
        }
    }
    
    drawRotWings() {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.beginPath();
        ctx.ellipse(this.x - 30, this.y - 20, 40, 15, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x + 30, this.y - 20, 40, 15, -Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    
    drawHealthBar() {
        const barWidth = 300;
        const barHeight = 20;
        const barX = canvas.width / 2 - barWidth / 2;
        const barY = 50;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);
        
        // Health bar
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = this.phase === 2 ? '#FF6B6B' : '#FFD93D';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Boss name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        const name = this.phase === 2 ? 'Malenia, Goddess of Rot' : 'Malenia, Blade of Miquella';
        ctx.fillText(name, canvas.width / 2, barY - 10);
    }
}
```

## Slave Knight Gael

```javascript
class SlaveKnightGael extends Enemy {
    constructor(x, y) {
        super(x, y, 'gael');
        this.maxHealth = 4000;
        this.health = this.maxHealth;
        this.phase = 1;
        this.darkSoulPower = 0;
        this.bloodLust = false;
        
        // Gael's iconic greatsword
        this.greatsword = {
            length: 80,
            damage: 150,
            range: 120,
            bloodBurst: false
        };
        
        // Attack patterns by phase
        this.attacks = {
            // Phase 1: Controlled knight
            swordCombo: { damage: 100, cooldown: 0, hits: 3 },
            shoulderSlam: { damage: 180, cooldown: 0, knockback: 20 },
            capeSwipe: { damage: 80, cooldown: 0, range: 100 },
            
            // Phase 2: Consumed by dark soul
            bloodSlash: { damage: 200, cooldown: 0, bleed: 5 },
            soulSpear: { damage: 250, cooldown: 0, piercing: true },
            groundSlam: { damage: 300, cooldown: 0, aoe: 150 },
            
            // Phase 3: Frenzied beast
            crossbowBarrage: { damage: 80, cooldown: 0, projectiles: 12 },
            berserkerRush: { damage: 400, cooldown: 0, duration: 5 },
            skulStorm: { damage: 150, cooldown: 0, tracking: true }
        };
        
        this.speed = 2;
        this.aggression = 1;
        this.bleedResistance = 0.8;
    }
    
    update(platforms, player) {
        super.update(platforms, player);
        
        // Phase transitions
        if (this.health <= this.maxHealth * 0.66 && this.phase === 1) {
            this.enterPhase2();
        } else if (this.health <= this.maxHealth * 0.33 && this.phase === 2) {
            this.enterPhase3();
        }
        
        this.updateAttackCooldowns();
        this.updateBloodLust();
        this.decideAttack(player);
    }
    
    enterPhase2() {
        this.phase = 2;
        this.darkSoulPower = 50;
        this.greatsword.bloodBurst = true;
        this.speed += 1;
        this.aggression += 0.5;
        
        // Visual transformation
        this.bloodLust = true;
        
        // New attack patterns unlock
        this.attacks.swordCombo.hits = 4;
        this.attacks.swordCombo.damage = 120;
    }
    
    enterPhase3() {
        this.phase = 3;
        this.darkSoulPower = 100;
        this.speed += 2;
        this.aggression += 1;
        
        // Frenzied state
        this.bloodLust = true;
        this.berserk = true;
        
        // Enhanced abilities
        this.attacks.berserkerRush.damage = 500;
        this.crossbowReady = true;
    }
    
    decideAttack(player) {
        const distanceToPlayer = Math.abs(this.x - player.x);
        
        if (this.phase === 3 && this.attacks.crossbowBarrage.cooldown <= 0) {
            this.crossbowBarrage(player);
        } else if (this.phase === 3 && this.berserk && this.attacks.berserkerRush.cooldown <= 0) {
            this.berserkerRush(player);
        } else if (this.phase >= 2 && this.attacks.groundSlam.cooldown <= 0 && distanceToPlayer < 100) {
            this.groundSlam(player);
        } else if (this.phase >= 2 && this.attacks.bloodSlash.cooldown <= 0 && distanceToPlayer < 150) {
            this.bloodSlash(player);
        } else if (distanceToPlayer < this.greatsword.range && this.attacks.swordCombo.cooldown <= 0) {
            this.swordCombo(player);
        } else if (distanceToPlayer < 80 && this.attacks.shoulderSlam.cooldown <= 0) {
            this.shoulderSlam(player);
        }
    }
    
    swordCombo(player) {
        this.attacks.swordCombo.cooldown = 120;
        
        for (let i = 0; i < this.attacks.swordCombo.hits; i++) {
            setTimeout(() => {
                const distance = Math.abs(this.x - player.x);
                if (distance < this.greatsword.range) {
                    player.takeDamage(this.attacks.swordCombo.damage);
                    
                    if (this.greatsword.bloodBurst && this.phase >= 2) {
                        this.createBloodExplosion(player);
                    }
                }
            }, i * 400); // Slower, more deliberate swings
        }
    }
    
    bloodSlash(player) {
        this.attacks.bloodSlash.cooldown = 180;
        
        // Wide arc slash with blood projectiles
        const slashAngle = Math.atan2(player.y - this.y, player.x - this.x);
        
        for (let i = -2; i <= 2; i++) {
            const angle = slashAngle + (i * Math.PI / 8);
            this.createBloodProjectile(angle, this.attacks.bloodSlash.damage);
        }
    }
    
    groundSlam(player) {
        this.attacks.groundSlam.cooldown = 240;
        
        // AoE attack around Gael
        const distance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);
        if (distance < this.attacks.groundSlam.aoe) {
            player.takeDamage(this.attacks.groundSlam.damage);
            
            // Create shockwave effect
            this.createShockwave();
        }
    }
    
    crossbowBarrage(player) {
        this.attacks.crossbowBarrage.cooldown = 300;
        
        // Rain of crossbow bolts
        for (let i = 0; i < this.attacks.crossbowBarrage.projectiles; i++) {
            setTimeout(() => {
                const targetX = player.x + (Math.random() - 0.5) * 200;
                const targetY = player.y + (Math.random() - 0.5) * 100;
                this.createCrossbowBolt(targetX, targetY);
            }, i * 100);
        }
    }
    
    berserkerRush(player) {
        this.attacks.berserkerRush.cooldown = 400;
        this.berserkTimer = this.attacks.berserkerRush.duration * 60; // Convert to frames
        
        // Continuous aggressive attacks
        const rushInterval = setInterval(() => {
            if (this.berserkTimer <= 0) {
                clearInterval(rushInterval);
                return;
            }
            
            const distance = Math.abs(this.x - player.x);
            if (distance < 100) {
                player.takeDamage(this.attacks.berserkerRush.damage / 10); // Spread damage
            }
            
            this.berserkTimer--;
        }, 100);
    }
    
    createBloodExplosion(player) {
        const explosionRadius = 60;
        const distance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);
        
        if (distance < explosionRadius) {
            player.takeDamage(50); // Additional blood damage
            player.statusEffects = player.statusEffects || {};
            player.statusEffects.bleed = (player.statusEffects.bleed || 0) + 3;
        }
    }
    
    createShockwave() {
        // Visual and mechanical shockwave
        const shockwaveEffect = {
            x: this.x,
            y: this.y,
            radius: 0,
            maxRadius: this.attacks.groundSlam.aoe,
            lifetime: 60,
            type: 'shockwave'
        };
        
        // Add to visual effects array (assuming it exists)
        if (window.visualEffects) {
            window.visualEffects.push(shockwaveEffect);
        }
    }
    
    updateBloodLust() {
        if (this.bloodLust && this.health < this.maxHealth * 0.5) {
            // Increased aggression when low on health
            this.aggression = Math.min(3, this.aggression + 0.01);
            this.speed = Math.min(8, this.speed + 0.005);
        }
    }
    
    updateAttackCooldowns() {
        Object.keys(this.attacks).forEach(attackName => {
            if (this.attacks[attackName].cooldown > 0) {
                this.attacks[attackName].cooldown--;
            }
        });
    }
    
    draw() {
        super.draw();
        
        // Phase-specific visual elements
        if (this.phase >= 2) {
            this.drawBloodAura();
        }
        
        if (this.phase === 3) {
            this.drawBerserkEffect();
        }
        
        this.drawGreatsword();
        this.drawHealthBar();
        this.drawCloak();
    }
    
    drawGreatsword() {
        ctx.save();
        ctx.strokeStyle = this.greatsword.bloodBurst ? '#8B0000' : '#C0C0C0';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(this.x - 10, this.y);
        ctx.lineTo(this.x - 10, this.y - this.greatsword.length);
        ctx.stroke();
        
        // Crossguard
        ctx.beginPath();
        ctx.moveTo(this.x - 25, this.y - 60);
        ctx.lineTo(this.x + 5, this.y - 60);
        ctx.stroke();
        ctx.restore();
    }
    
    drawCloak() {
        ctx.save();
        ctx.fillStyle = this.bloodLust ? '#4A0000' : '#2F2F2F';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 20, 40, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    
    drawHealthBar() {
        const barWidth = 350;
        const barHeight = 25;
        const barX = canvas.width / 2 - barWidth / 2;
        const barY = 30;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);
        
        // Health bar with phase coloring
        const healthPercentage = this.health / this.maxHealth;
        let barColor = '#FFD700'; // Phase 1: Gold
        if (this.phase === 2) barColor = '#DC143C'; // Phase 2: Crimson
        if (this.phase === 3) barColor = '#8B0000'; // Phase 3: Dark Red
        
        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Phase indicators
        const phase2Mark = barX + (barWidth * 0.66);
        const phase3Mark = barX + (barWidth * 0.33);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(phase2Mark, barY);
        ctx.lineTo(phase2Mark, barY + barHeight);
        ctx.moveTo(phase3Mark, barY);
        ctx.lineTo(phase3Mark, barY + barHeight);
        ctx.stroke();
        
        // Border
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Boss name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        let name = 'Slave Knight Gael';
        if (this.phase === 2) name = 'Gael, Slave Knight';
        if (this.phase === 3) name = 'Gael, Consumed by the Dark Soul';
        ctx.fillText(name, canvas.width / 2, barY - 8);
    }
}
```

## Usage Instructions

To integrate these bosses into your game:

1. **Add to your enemy spawning system:**
```javascript
// In your game initialization or level setup
function spawnMalenia(x, y) {
    const malenia = new Malenia(x, y);
    enemies.push(malenia);
    audioManager.switchToBossMusic();
    return malenia;
}

function spawnGael(x, y) {
    const gael = new SlaveKnightGael(x, y);
    enemies.push(gael);
    audioManager.switchToBossMusic();
    return gael;
}
```

2. **Add status effects to player class:**
```javascript
// Add to Player class
updateStatusEffects() {
    if (this.statusEffects) {
        // Handle scarlet rot
        if (this.statusEffects.scarletRot > 0) {
            if (gameState.frameCount % 60 === 0) {
                this.takeDamage(this.statusEffects.scarletRot * 5);
                this.statusEffects.scarletRot--;
            }
        }
        
        // Handle bleed
        if (this.statusEffects.bleed > 0) {
            if (gameState.frameCount % 120 === 0) {
                this.takeDamage(this.statusEffects.bleed * 10);
                this.statusEffects.bleed--;
            }
        }
    }
}
```

## Boss Mechanics Summary

### Malenia Features:
- **Lifesteal on hit** - Heals when dealing damage
- **Waterfowl Dance** - Multi-hit flurry attack
- **Scarlet Rot** - DoT status effect
- **Phase 2 transformation** - Becomes Goddess of Rot
- **Scarlet Aeonia** - Large AoE explosion

### Gael Features:
- **Three-phase fight** with increasing aggression
- **Greatsword combat** with blood effects
- **Crossbow barrages** in final phase
- **Berserker rush** - Frenzied attack state
- **Blood explosions** and status effects
- **Shockwave attacks** with AoE damage

Both bosses feature dynamic phase transitions, complex attack patterns, and visual effects that match their source material! 