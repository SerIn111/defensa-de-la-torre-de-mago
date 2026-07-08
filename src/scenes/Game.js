export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.mode = data.mode || 1;
    }

    create() {
        this.add.text(10, 10, `Modo Activo: Nivel ${this.mode}`, { fill: '#ffffff' });

        let backBtn = this.add.text(700, 20, 'Volver', { fill: '#ff0000' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.bgm && this.bgm.isPlaying) this.bgm.stop();
                this.scene.start('MainMenu');
            });

        this.setupGame();
    }

    setupGame() {
        this.timeElapsed = 0;
        this.crystalHp = 3;
        this.score = 0;
        this.gameOver = false;

        // Groups
        this.enemies = this.physics.add.group();
        this.spells = this.physics.add.group();

        this.createCrystal();
        this.createPlayer();

        // HUD
        this.timerText = this.add.text(400, 20, 'Tiempo: 60', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.hpText = this.add.text(10, 50, 'Cristal HP: 3', { fontSize: '20px', fill: '#0f0' });

        if (this.mode >= 2) {
            this.scoreText = this.add.text(10, 80, 'Puntos: 0', { fontSize: '20px', fill: '#fff' });
        }

        // Audio
        this.shootSound = this.sound.add('shoot', { volume: 0.5 });
        this.hitSound = this.sound.add('hit', { volume: 0.8 });
        this.shieldSound = this.sound.add('shoot', { volume: 0.1, rate: 0.2, loop: true });

        if (this.mode === 3) {
            this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });
            this.bgm.play();
        }

        // Timers
        this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });

        // Collisions
        this.physics.add.overlap(this.crystal, this.enemies, this.hitCrystal, null, this);
        this.physics.add.overlap(this.spells, this.enemies, this.hitEnemy, null, this);

        this.startSpawner();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

        // Combat mechanics (All modes)
        this.input.on('pointerdown', this.shootSpell, this);

        // Barrier mechanic (Mode 3)
        if (this.mode === 3) {
            this.barrierActive = false;
            this.barrierCooldown = false;

            this.barrierGraphic = this.add.circle(400, 300, 60, 0x00ffff, 0.3);
            this.barrierGraphic.setStrokeStyle(2, 0x00ffff);
            this.barrierGraphic.setVisible(false);
            this.physics.add.existing(this.barrierGraphic, true); // static body

            // Colisión de barrera con enemigos
            this.physics.add.overlap(this.barrierGraphic, this.enemies, this.hitBarrier, null, this);

            // HUD de Cooldown
            this.cooldownText = this.add.text(400, 560, 'Escudo Listo (ESPACIO)', { fontSize: '18px', fill: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
            this.cooldownBarBG = this.add.rectangle(400, 580, 200, 15, 0x555555).setOrigin(0.5);
            this.cooldownBarFG = this.add.rectangle(300, 580, 200, 15, 0x00ff00).setOrigin(0, 0.5);
        }

        // Instrucciones en pantalla
        let instructionStr = 'Presiona WASD para moverte\nClick Izquierdo para disparar';
        if (this.mode === 3) instructionStr += '\nEspacio para activar Escudo';

        this.instructionText = this.add.text(400, 500, instructionStr, {
            fontSize: '20px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        // Ocultar instrucciones después de 10 segundos
        this.time.delayedCall(10000, () => {
            if (this.instructionText) {
                this.tweens.add({
                    targets: this.instructionText,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => { this.instructionText.destroy(); }
                });
            }
        });
    }

    createCrystal() {
        this.crystal = this.physics.add.sprite(400, 300, 'crystal');
        this.crystal.setDisplaySize(60, 80);
        this.crystal.setImmovable(true);
    }

    createPlayer() {
        this.player = this.physics.add.sprite(400, 350, 'wizard');
        this.player.setDisplaySize(50, 50);
        this.player.setCollideWorldBounds(true);
    }

    startSpawner() {
        this.spawnEvent = this.time.addEvent({
            delay: (this.mode >= 2) ? 1200 : 2000, // Spawn inicial más rápido en niveles superiores
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemy() {
        if (this.gameOver) return;

        const edge = Phaser.Math.Between(0, 3);
        let x, y;
        if (edge === 0) { x = Phaser.Math.Between(0, 800); y = -20; }
        else if (edge === 1) { x = Phaser.Math.Between(0, 800); y = 620; }
        else if (edge === 2) { x = -20; y = Phaser.Math.Between(0, 600); }
        else { x = 820; y = Phaser.Math.Between(0, 600); }

        // Determinar tipo de enemigo basado en modo y tiempo
        let type = 'demon';
        let speed = 50;
        let hp = 1;
        let size = 20;
        let points = 10;

        if (this.mode >= 2) {
            // Fase 2: mucho más rápidos los spawns
            if (this.timeElapsed >= 30) {
                this.spawnEvent.delay = 600;
            }

            // Ajuste de probabilidades para que haya más demonios rojos
            let golemChance = this.timeElapsed >= 30 ? 0.25 : 0.15;
            let impChance = this.mode === 3 ? 0.15 : 0;

            let rand = Math.random();
            if (rand < golemChance) {
                type = 'golem';
                speed = 25;
                hp = 3;
                size = 35;
                points = 50;
            } else if (rand < golemChance + impChance) {
                type = 'imp';
                speed = 120; // Muy rápido
                hp = 1;
                size = 15;
                points = 30;
            }
        }

        let texture = type;
        let enemy = this.physics.add.sprite(x, y, texture);
        enemy.setDisplaySize(size * 2, size * 2);
        enemy.hp = hp;
        enemy.points = points;
        this.enemies.add(enemy);

        this.physics.moveToObject(enemy, this.crystal, speed);
    }

    shootSpell(pointer) {
        if (this.gameOver) return;

        if (this.shootSound) this.shootSound.play();

        let spell = this.physics.add.sprite(this.player.x, this.player.y, 'spell');
        spell.setDisplaySize(20, 20);
        this.spells.add(spell);

        // Destruir proyectil después de un tiempo
        this.time.delayedCall(2000, () => {
            if (spell.active) spell.destroy();
        });

        this.physics.moveTo(spell, pointer.x, pointer.y, 300);
    }

    activateBarrier() {
        if (this.gameOver || this.barrierActive || this.barrierCooldown) return;

        this.barrierActive = true;
        this.barrierGraphic.setVisible(true);

        this.cooldownText.setText('Escudo Activo');
        this.cooldownText.setColor('#00ffff');
        this.cooldownBarFG.setFillStyle(0x00ffff);
        this.cooldownBarFG.width = 200;

        if (this.shieldSound) this.shieldSound.play();

        // Dura 3 segundos
        this.time.delayedCall(3000, () => {
            if (this.shieldSound) this.shieldSound.stop();

            this.barrierActive = false;
            this.barrierGraphic.setVisible(false);

            // Cooldown de 10 segundos
            this.barrierCooldown = true;
            this.cooldownText.setText('Recargando...');
            this.cooldownText.setColor('#ff0000');
            this.cooldownBarFG.setFillStyle(0xff0000);
            this.cooldownBarFG.width = 0;

            this.tweens.add({
                targets: this.cooldownBarFG,
                width: 200,
                duration: 10000,
                onComplete: () => {
                    this.barrierCooldown = false;
                    this.cooldownText.setText('Escudo Listo (ESPACIO)');
                    this.cooldownText.setColor('#00ff00');
                    this.cooldownBarFG.setFillStyle(0x00ff00);
                }
            });
        });
    }

    updateTimer() {
        if (this.gameOver) return;

        this.timeElapsed++;
        let timeLeft = 60 - this.timeElapsed;
        this.timerText.setText('Tiempo: ' + timeLeft);

        if (timeLeft <= 0) {
            this.endGame(true);
        }
    }

    hitCrystal(crystal, enemy) {
        enemy.destroy();
        this.crystalHp--;
        this.hpText.setText('Cristal HP: ' + this.crystalHp);

        // Sonido de daño al cristal
        if (this.hitSound) {
            this.hitSound.play({ rate: 2.0, volume: 1.0 });
        }

        if (this.crystalHp === 2) this.hpText.setColor('#ffaa00');
        if (this.crystalHp === 1) this.hpText.setColor('#ff0000');

        if (this.crystalHp <= 0) {
            this.endGame(false);
        }
    }

    hitEnemy(spell, enemy) {
        spell.destroy();

        enemy.hp--;
        if (enemy.hp <= 0) {
            if (this.mode >= 2) {
                this.score += enemy.points;
                this.scoreText.setText('Puntos: ' + this.score);
            }

            if (this.hitSound) {
                if (enemy.texture.key === 'golem') {
                    // Sonido grave extremo (rate 0.25)
                    this.hitSound.play({ rate: 0.25, volume: 1.0 });
                } else if (enemy.texture.key === 'imp') {
                    // Sonido grave y doble
                    this.hitSound.play({ rate: 0.4, volume: 0.7 });
                    this.time.delayedCall(150, () => {
                        this.hitSound.play({ rate: 0.5, volume: 0.7 });
                    });
                } else {
                    // Normal explícitamente restaurado para evitar que herede tonos anteriores
                    this.hitSound.play({ rate: 1.0, volume: 0.8 });
                }
            }

            enemy.destroy();
        } else {
            // Flash visual al recibir daño
            enemy.setTintFill(0xffffff);
            this.time.delayedCall(100, () => {
                if (enemy.active) {
                    enemy.clearTint();
                }
            });
        }
    }

    hitBarrier(barrier, enemy) {
        if (!this.barrierActive) return;

        // Destruye enemigos que tocan la barrera
        if (this.mode >= 2) {
            this.score += enemy.points;
            this.scoreText.setText('Puntos: ' + this.score);
        }
        enemy.destroy();
    }

    endGame(isVictory) {
        this.gameOver = true;
        this.physics.pause();
        this.spawnEvent.remove();
        if (this.bgm && this.bgm.isPlaying) this.bgm.stop();
        if (this.shieldSound && this.shieldSound.isPlaying) this.shieldSound.stop();

        let msg = isVictory ? '¡VICTORIA!' : '¡GAME OVER!';
        let color = isVictory ? '#00ff00' : '#ff0000';

        this.add.text(400, 300, msg, { fontSize: '64px', fill: color, fontStyle: 'bold' }).setOrigin(0.5);
    }

    update() {
        if (this.gameOver) return;

        // Movimiento del jugador
        let velocity = 150;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.body.setVelocityX(-velocity);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.body.setVelocityX(velocity);
        }

        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.player.body.setVelocityY(-velocity);
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.player.body.setVelocityY(velocity);
        }

        this.player.body.velocity.normalize().scale(velocity);

        // Activar barrera (Modo 3)
        if (this.mode === 3 && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.activateBarrier();
        }
    }
}
