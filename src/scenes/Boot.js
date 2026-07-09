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
        this.load.image('titan', './assets/titan.png');
        
        // Cargamos los sonidos
        this.load.audio('shoot', './assets/shoot.wav');
        this.load.audio('hit', './assets/hit.wav');
        this.load.audio('bgm', './assets/bgm.wav');
        this.load.audio('zap', './assets/zap.wav');
    }

    create() {
        this.add.text(400, 250, 'Procesando assets...', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);
        
        // Hacer fondos transparentes
        const keys = ['wizard', 'crystal', 'demon', 'golem', 'spell', 'imp', 'titan'];
        keys.forEach(key => {
            let src = this.textures.get(key).getSourceImage();
            let canvas = document.createElement('canvas');
            canvas.width = src.width;
            canvas.height = src.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(src, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;
            let bgR = data[0], bgG = data[1], bgB = data[2];
            for (let i = 0; i < data.length; i += 4) {
                if (Math.abs(data[i]-bgR) < 20 && Math.abs(data[i+1]-bgG) < 20 && Math.abs(data[i+2]-bgB) < 20) {
                    data[i+3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            this.textures.remove(key);
            this.textures.addImage(key, canvas);
        });

        this.time.delayedCall(500, () => {
            this.scene.start('MainMenu');
        });
    }
}
