export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Creamos una barra de progreso
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(400 - 150, 300 - 15, 300, 30);
        
        // Cargamos los sprites generados por IA
        this.load.image('wizard', './assets/wizard.png');
        this.load.image('crystal', './assets/crystal.png');
        this.load.image('demon', './assets/demon.png');
        this.load.image('golem', './assets/golem.png');
        this.load.image('spell', './assets/spell.png');
        this.load.image('imp', './assets/imp.png');
        
        // Cargamos los sonidos
        this.load.audio('shoot', './assets/shoot.wav');
        this.load.audio('hit', './assets/hit.wav');
        this.load.audio('bgm', './assets/bgm.wav');
    }

    create() {
        this.add.text(400, 250, 'Cargando...', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        
        // Simulamos un pequeño tiempo de carga antes de ir al menú
        this.time.delayedCall(1000, () => {
            this.scene.start('MainMenu');
        });
    }
}
