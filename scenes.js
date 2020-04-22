class Scene01 extends Phaser.Scene {
    constructor() {
        super('bootGame');
    }

    preload() {
        this.load.image('grass', 'assets/grass.jpg')
        this.load.image('bg01', 'assets/background.jpg')
        this.load.image('bg02', 'assets/bg02-rz.png')

        this.load.image('boy', 'assets/knight/freeknight/png/Run (1).png')
        this.load.image('zombie', 'assets/zombie/png/male/Walk (1).png')

        /** load plugin */
        // console.log(this.sys.dialogModal)

        Array(10).fill().map((_, i) => {
            this.load.image({
                key: `run_${i + 1}`,
                url: `assets/knight/freeknight/png/Run (${i + 1}).png`
            })

            this.load.image({
                key: `zombie_${i + 1}`,
                url: `assets/zombie/png/male/Walk (${i + 1}).png`
            })
        })
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
    successCount = 0;
    failedCount = 0;
    stopForQuestion = false;
    questions = [];
    questionIndex = 0;

    constructor() {
        super('playGame');
        this.characterHeight = 200;
    }

    preload() {
        this.load.scenePlugin('DialogModalPlugin', 'plugins/dialog_plugin.js');

        /** load data from api */
        this.questions = [
            {
                id: 1,
                text: 'Question 01',
                answers: [
                    {
                        id: 1,
                        text: 'Answer 01'
                    },
                    {
                        id: 2,
                        text: 'Answer 02'
                    }
                ]
            },
            {
                id: 2,
                text: 'Question 02',
                answers: [
                    {
                        id: 3,
                        text: 'Answer 03'
                    },
                    {
                        id: 4,
                        text: 'Answer 04'
                    }
                ]
            }
        ]
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'bg01')
        this.background.setOrigin(0, 0);

        /** boy */
        this.boy = this.add.sprite(100, 800 - 350, 'boy')
        this.zombie = this.add.sprite(this.sys.game.config.width - 150, 800 - 350, 'zombie')

        /** scale */
        const baseCharacterHeightImage = this.textures.get('boy').getSourceImage().height
        const baseZombieHeightImage = this.textures.get('zombie').getSourceImage().height

        /** text */
        this.text = this.add.text(this.sys.game.config.width - 50, 20, `${this.successCount} / ${this.failedCount}`, { fill: 'yellow', font: '20px Arial' })

        this.boy.setScale(this.characterHeight / baseCharacterHeightImage, this.characterHeight / baseCharacterHeightImage);
        this.zombie.setScale(- this.characterHeight / baseZombieHeightImage, this.characterHeight / baseZombieHeightImage);

        this.anims.create({
            key: 'boy_anim',
            frames: Array(10).fill().map((_, index) => ({key: `run_${index+1}`})),
            frameRate: 8,
            repeat: -1
        })

        this.anims.create({
            key: 'zombie_anim',
            frames: Array(10).fill().map((_, index) => ({key: `zombie_${index+1}`})),
            frameRate: 8,
            repeat: -1
        })

        this.boy.play('boy_anim')
        this.zombie.play('zombie_anim')
    }

    update() {
        if(!this.stopForQuestion) {
            this.background.tilePositionX += 2
            this.zombieMove(this.zombie, 3)
        }
    }

    zombieMove(zombie, speed) {
        zombie.x -= speed
        if(zombie.x < (this.boy.displayWidth / 2) + 110) {
            this.stopForQuestion = true
            this.sys.game.anims.pauseAll()

            this.sys.DialogModalPlugin.init({
                closeHandle: () => {
                    this.stopForQuestion = false
                    this.resetZombie(this.zombie)
                    this.updateCounter()
                    this.sys.game.anims.resumeAll()
                },
                dialogSpeed: 7
            })

            const question = this.questions[this.questionIndex];

            this.sys.DialogModalPlugin.setText(question.text, true, {
                callback: () => {
                    question.answers.forEach(({id, text}, index) => {
                        this.sys.DialogModalPlugin.setText(text, false, {
                            yAxis: 30 * (index + 1),
                            key: `answer_${id}`,
                            customData: {
                                id
                            },
                            events: {
                                pointerdown: (object) => {
                                    console.log('custom_data: ', object.texture.customData);
    
                                    return () => {
                                        object.setStyle({
                                            fontStyle: 'bold',
                                            fill: 'yellow'
                                        })
                                    }
                                }
                            },
                            pointer: true
                        })
                    })
                }
            })


            // this.sys.DialogModalPlugin.setText('Đây là một câu hỏi rất là dài và không có đáp án đâu. Đóng câu hỏi lại thôi!', true, {
            //     callback: () => {
            //         this.sys.DialogModalPlugin.setText('Thử test đáp án thôi', false, {
            //             yAxis: 30,
            //             key: 'aquestion',
            //             events: {
            //                 pointerdown: (object) => {
            //                     console.log('custom_data: ', object.texture.customData);

            //                     return () => {
            //                         object.setStyle({
            //                             fontStyle: 'bold',
            //                             fill: 'yellow'
            //                         })
            //                     }
            //                 }
            //             },
            //             pointer: true
            //         })
            //     }
            // })
        }
    }

    getQuestions() {
        return this.questions[this.questionIndex]
    }

    resetZombie(zombie) {
        zombie.x = this.sys.game.config.width
    }

    updateCounter() {
        this.successCount += 1;
        this.text.setText(`${this.successCount} / ${this.failedCount}`)
    }
}
