const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.getElementById('game'),
    scene: [Scene01, PickCharacterScene, Scene02],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
}

var game = new Phaser.Game(config);