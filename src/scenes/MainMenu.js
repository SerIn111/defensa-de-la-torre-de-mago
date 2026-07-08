export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Título del juego
        this.add.text(400, 150, 'Defensa de la Torre de Magos', { 
            fontSize: '40px', 
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instrucciones breves
        this.add.text(400, 220, 'Selecciona un modo de juego:', { 
            fontSize: '20px', 
            fill: '#ffffff' 
        }).setOrigin(0.5);

        // Crear botones de modo
        this.createButton(400, 300, 'Modo Básico (Nivel 1)', 1);
        this.createButton(400, 370, 'Modo Intermedio (Nivel 2)', 2);
        this.createButton(400, 440, 'Modo Avanzado (Nivel 3)', 3);
    }

    createButton(x, y, text, mode) {
        let btn = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setStyle({ fill: '#ffff00', backgroundColor: '#555555' });
        });

        btn.on('pointerout', () => {
            btn.setStyle({ fill: '#ffffff', backgroundColor: '#333333' });
        });

        btn.on('pointerdown', () => {
            // Iniciar la escena Game pasando el modo seleccionado
            this.scene.start('Game', { mode: mode });
        });
    }
}
