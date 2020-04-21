const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.getElementById('game'),
    scene: [Scene01, Scene02]
}

var game = new Phaser.Game(config);