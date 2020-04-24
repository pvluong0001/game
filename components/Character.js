class Character extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.name);

        this.scene = config.scene;
        this.options = config.options || {} 

        this.scene.add.existing(this)
        this.characterHeight = this.scene.textures.get(config.name).getSourceImage().height
    }

    fetchOptions() {
        
    }

    registerAnimation(key, config) {
        if (config.hasOwnProperty('custom')) {
            this.scene.anims.create({
                key,
                ...custom
            })
        } else {
            this.scene.anims.create({
                key,
                frames: Array(config.range).fill().map(
                    (_, index) => ({ key: `${key}_${index + 1}` })
                ),
                frameRate: config.frameRate,
                repeat: config.repeat
            })
        }
    }

    activeAnimation(key) {
        this.play(key);
    }

    scaleWidth(expectedWidth) {
        this.setScale(expectedWidth / this.characterHeight)
    }
}