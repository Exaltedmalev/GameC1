// =============================================================================
// BOSS INTEGRATION PATCH - Add this code to your game.js file
// =============================================================================

// 1. Add these properties to gameState object (around line 150)
gameState.hasEncounteredMalenia = false;
gameState.hasEncounteredGael = false;
gameState.frameCount = 0;

// 2. Enhance the existing Enemy class (replace existing Enemy class)
class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.velocityX = 1;
        this.velocityY = 0;
        this.type = type;
        this.health = 2;
        this.damage = 1;
        this.soulValue = 10;
        this.attackCooldown = 0;
        this.timeSlowFactor = 1;
        
        // Boss-specific properties
        this.isBoss = false;
        this.statusEffects = {};
        this.visualEffects = [];
        this.attackPatterns = [];
        this.phase = 1;
        this.maxPhases = 1;
        this.hitboxes = [{ x: 0, y: 0, width: this.width, height: this.height }];
        
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
            this.velocityX *= -1;
        }

        // Platform collision logic (existing code)
        for (const platform of platforms) {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {
                
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                }
                else if (this.velocityY < 0 && this.y - this.velocityY >= platform.y + platform.height) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
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

        // Edge detection (existing code)
        let onPlatform = false;
        for (const platform of platforms) {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height === platform.y) {
                onPlatform = true;
                
                if ((this.velocityX > 0 && this.x + this.width + 5 > platform.x + platform.width) ||
                    (this.velocityX < 0 && this.x - 5 < platform.x)) {
                    this.velocityX *= -1;
                }
                break;
            }
        }

        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= this.timeSlowFactor;
        }

        // Collision with player
        if (this.checkCollision(player) && this.attackCooldown === 0) {
            player.takeDamage(this.damage);
            this.attackCooldown = 30;
        }

        // Player attack collision
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
                    return false;
                }
                
                this.velocityX = player.facingRight ? 5 : -5;
                this.velocityY = -3;
            }
        }

        // Update status effects for bosses
        if (this.isBoss) {
            this.updateStatusEffects(player);
        }

        return true;
    }

    // Enhanced collision system for bosses
    checkCollisionWithPlayer(player, attackBox = null) {
        if (!this.isBoss) return this.checkCollision(player);
        
        const targetBox = attackBox || {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        for (const hitbox of this.hitboxes) {
            const absoluteHitbox = {
                x: this.x + hitbox.x,
                y: this.y + hitbox.y,
                width: hitbox.width,
                height: hitbox.height
            };
            
            if (this.rectIntersection(targetBox, absoluteHitbox)) {
                return true;
            }
        }
        return false;
    }
    
    rectIntersection(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateStatusEffects(player) {
        Object.keys(this.statusEffects).forEach(effect => {
            if (this.statusEffects[effect] > 0) {
                this.statusEffects[effect]--;
                this.applyStatusEffect(effect, player);
            }
        });
    }
    
    applyStatusEffect(effect, player) {
        // Override in boss classes
    }

    checkCollision(player) {
        if (!player || typeof player.x === 'undefined') return false;
        
        const margin = 2;
        return this.x - margin < player.x + player.width &&
               this.x + this.width + margin > player.x &&
               this.y - margin < player.y + player.height &&
               this.y + this.height + margin > player.y;
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
        
        if (this.timeSlowFactor < 1) {
            ctx.strokeStyle = '#88CCFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.stroke();
            
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

// 3. Add Boss Manager System (add after Platform class)
class BossManager {
    constructor() {
        this.activeBoss = null;
        this.bossIntroComplete = false;
        this.bossArena = null;
        this.originalCameraMode = null;
    }
    
    spawnBoss(bossType, x, y) {
        enemies = enemies.filter(enemy => !enemy.isBoss);
        
        switch(bossType) {
            case 'malenia':
                this.activeBoss = new Malenia(x, y);
                break;
            case 'gael':
                this.activeBoss = new SlaveKnightGael(x, y);
                break;
        }
        
        if (this.activeBoss) {
            this.activeBoss.isBoss = true;
            enemies.push(this.activeBoss);
            this.setupBossArena();
            audioManager.switchToBossMusic();
        }
    }
    
    setupBossArena() {
        this.bossArena = {
            x: 50,
            y: 50,
            width: canvas.width - 100,
            height: canvas.height - 100
        };
        
        platforms.push(
            new Platform(this.bossArena.x - 20, this.bossArena.y, 20, this.bossArena.height),
            new Platform(this.bossArena.x + this.bossArena.width, this.bossArena.y, 20, this.bossArena.height),
            new Platform(this.bossArena.x, this.bossArena.y - 20, this.bossArena.width, 20)
        );
    }
    
    update() {
        if (this.activeBoss && this.activeBoss.health <= 0) {
            this.defeatBoss();
        }
    }
    
    defeatBoss() {
        this.activeBoss = null;
        this.bossIntroComplete = false;
        this.cleanupArena();
        audioManager.switchToNormalMusic();
    }
    
    cleanupArena() {
        if (!this.bossArena) return;
        
        platforms = platforms.filter(platform => 
            platform.x !== this.bossArena.x - 20 &&
            platform.x !== this.bossArena.x + this.bossArena.width &&
            platform.y !== this.bossArena.y - 20
        );
    }
}

// 4. Add Visual Effect Manager (add after BossManager)
class VisualEffectManager {
    constructor() {
        this.effects = [];
        this.maxEffects = 50;
    }
    
    addEffect(effect) {
        if (this.effects.length >= this.maxEffects) {
            this.effects.shift();
        }
        this.effects.push(effect);
    }
    
    update() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.lifetime--;
            
            if (effect.lifetime <= 0) {
                this.effects.splice(i, 1);
                continue;
            }
            
            switch(effect.type) {
                case 'shockwave':
                    effect.radius += 5;
                    break;
                case 'bloodBurst':
                    effect.scale += 0.1;
                    effect.alpha -= 0.02;
                    break;
                case 'scarletRot':
                    effect.rotation += 0.1;
                    break;
            }
        }
    }
    
    draw() {
        this.effects.forEach(effect => {
            ctx.save();
            ctx.globalAlpha = effect.alpha || 1;
            
            switch(effect.type) {
                case 'shockwave':
                    this.drawShockwave(effect);
                    break;
                case 'bloodBurst':
                    this.drawBloodBurst(effect);
                    break;
                case 'scarletRot':
                    this.drawScarletRot(effect);
                    break;
            }
            
            ctx.restore();
        });
    }
    
    drawShockwave(effect) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawBloodBurst(effect) {
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 20 * (effect.scale || 1), 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawScarletRot(effect) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.rotation || 0);
        ctx.fillRect(-10, -10, 20, 20);
        ctx.restore();
    }
}

// 5. Initialize managers (add after existing game initialization)
const bossManager = new BossManager();
const visualEffectManager = new VisualEffectManager();

// 6. Add to Player class - Status Effects System
// Add this method to the Player class update method
Player.prototype.updateStatusEffects = function() {
    if (this.statusEffects) {
        // Scarlet Rot (Malenia)
        if (this.statusEffects.scarletRot > 0) {
            if (gameState.frameCount % 60 === 0) {
                this.takeDamage(this.statusEffects.scarletRot * 3);
                this.statusEffects.scarletRot = Math.max(0, this.statusEffects.scarletRot - 1);
            }
        }
        
        // Bleed (Gael)
        if (this.statusEffects.bleed > 0) {
            if (gameState.frameCount % 120 === 0) {
                this.takeDamage(this.statusEffects.bleed * 8);
                this.statusEffects.bleed = Math.max(0, this.statusEffects.bleed - 1);
            }
        }
        
        // Frostbite (future boss)
        if (this.statusEffects.frostbite > 0) {
            this.speed *= 0.7;
            if (gameState.frameCount % 180 === 0) {
                this.statusEffects.frostbite--;
            }
        }
    }
};

// 7. Add status effect indicators to Player drawHUD method
Player.prototype.drawStatusEffects = function() {
    if (!this.statusEffects) return;
    
    let effectY = 100;
    const effectSize = 20;
    
    if (this.statusEffects.scarletRot > 0) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillRect(10, effectY, effectSize, effectSize);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(this.statusEffects.scarletRot, 35, effectY + 15);
        effectY += 25;
    }
    
    if (this.statusEffects.bleed > 0) {
        ctx.fillStyle = 'rgba(150, 0, 0, 0.8)';
        ctx.fillRect(10, effectY, effectSize, effectSize);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(this.statusEffects.bleed, 35, effectY + 15);
        effectY += 25;
    }
};

// =============================================================================
// INTEGRATION INSTRUCTIONS:
// 1. Add the boss classes from Bosses.md to your game.js file
// 2. Apply the modifications shown in the comments above
// 3. Test with simple boss spawning first
// 4. Monitor console for any errors
// ============================================================================= 