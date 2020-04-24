const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.getElementById('game'),
    scene: [PreloadScene, PickCharacterScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
}

var game = new Phaser.Game(config);