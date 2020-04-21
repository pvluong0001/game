class Scene01 extends Phaser.Scene {
    constructor() {
        super('bootGame');
    }

    preload() {
        this.load.image('grass', 'assets/grass.jpg')
        this.load.image('bg01', 'assets/background.jpg')
        this.load.image('bg02', 'assets/bg02-rz.png')

        this.load.image('boy', 'assets/knight/freeknight/png/Run (1).png')

        for(let i = 1; i < 11; i++) {
            this.load.image({
                key: `run_${i}`,
                url: `assets/knight/freeknight/png/Run (${i}).png`
            })
        }
    }

    create() {
        this.add.text(20, 20, 'Loading game....', {
            font: "25px Arial",
            fill: "yellow"
        })

        this.scene.start('playGame')
    }
}

class Scene02 extends Phaser.Scene {
    constructor() {
        super('playGame');
        this.characterHeight = 200;
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'bg01')
        this.background.setOrigin(0, 0);

        /** boy */
        this.boy = this.add.sprite(100, 800 - 350, 'boy')

        /** scale */
        const baseCharacterHeightImage = this.textures.get('boy').getSourceImage().height

        this.boy.setScale(this.characterHeight / baseCharacterHeightImage);

        Array(10).fill().map((_, index) => {
            // this[`run_${index + 1}`] = this.add.sprite(0, 0, `run_${index + 1}`)

            console.log(this[`run_${index + 1}`])
            // this[`run_${index + 1}`].setScale(2)
        })

        this.anims.create({
            key: 'boy_anim',
            frames: Array(10).fill().map((_, index) => ({key: `run_${index+1}`})),
            frameRate: 8,
            repeat: -1
        })

        this.boy.play('boy_anim')
    }

    update() {
        this.background.tilePositionX += 2
    }
}