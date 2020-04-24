class PickCharacterScene extends Phaser.Scene {
    mainCharactor = 'boy';
    directionDown = true;
    characterHeight = 200;

    constructor() {
        super('pickCharacter');
    }

    preload() {
        this.load.image('picker', 'assets/finger-down.png')
    }

    create() {
        this.add.text(this.sys.game.config.width / 2 - 70, 50, 'Chọn nhân vật', {
            font: "25px Arial",
            fill: "yellow"
        })

        this.add.text(this.sys.game.config.width / 2 - 70, this.sys.game.height - 100, 'Nhấn enter để chọn nhân vật', {
            font: "25px Arial",
            fill: "yellow"
        })

        this.cursorKeys = this.input.keyboard.createCursorKeys();



        this.picker = this.add.sprite(300, 200, 'picker')
        this.picker.setScale(40 / this.textures.get('picker').getSourceImage().height)

        const boy = new Character({
            scene: this,
            x: 300,
            y: 330,
            name: 'boy',
            options: {
                animation: {
                    key: 'boy_animations',
                    range: 10,
                    repeat: -1,
                    frameRate: 10
                },
                playAnimation: true,
                scale: {
                    width: 200
                }
            }
        })
        
        boy.registerAnimation('boy_animations', {
            range: 10,
            repeat: -1,
            frameRate: 10
        })

        boy.scaleWidth(200)

        const girl = new Character({
            scene: this,
            x: 500,
            y: 330,
            name: 'girl'
        })

        girl.scaleWidth(180)

        girl.registerAnimation('girl_animations', {
            range: 20,
            repeat: -1,
            frameRate: 16
        })

        
        boy.activeAnimation('boy_animations')
        girl.activeAnimation('girl_animations')

        this.input.keyboard.on('keyup-ENTER', () => {
            this.scene.start('playGame', {
                charactor: this.mainCharactor
            })
        })
        // this.scene.start('playGame')
    }

    update() {
        const speed = this.directionDown ? 2 : -2;
        this.picker.y += speed
        if(this.picker.y > 220) {
            this.directionDown = false
        } else if(this.picker.y < 200) {
            this.directionDown = true
        }

        this.pickCharactor()
    }

    pickCharactor() {
        if(this.cursorKeys.right.isDown) {
            if(this.mainCharactor === 'boy') {
                this.picker.x += 200
                this.mainCharactor = 'girl'
            }
        } else if(this.cursorKeys.left.isDown) {
            if(this.mainCharactor === 'girl') {
                this.picker.x -= 200
                this.mainCharactor = 'boy'
            }
        }
    }
}