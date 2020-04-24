class GameScene extends Phaser.Scene {
    successCount = 0;
    failedCount = 0;
    stopForQuestion = false;
    questions = [];
    questionIndex = 0;
    characterHeight = 200;
    questions = [];

    constructor() {
        super('playGame');
    }

    init(options) {
        this.options = {...options}
    }

    preload() {
        this.load.scenePlugin('DialogModalPlugin', 'plugins/dialog_plugin.js');
        this.questions = this.cache.json.get('questions')
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'bg01')
        this.background.setOrigin(0, 0);

        /** boy */
        this.boy = this.textures.get(this.options.charactor)
        console.log(this.boy)
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
                dialogSpeed: 10
            })

            const question = this.questions[this.questionIndex];

            this.sys.DialogModalPlugin.setText(question.text, true, {
                callback: () => {
                    question.answers.forEach(({id, text}, index) => {
                        this.sys.DialogModalPlugin.setText(text, false, {
                            yAxis: 40 * Math.floor(index / 2) + 10,
                            xAxis: index % 2 === 0 ? (this.sys.game.config.width / 2) : 0,
                            key: `answer_${id}`,
                            customData: {
                                id
                            },
                            events: {
                                pointerdown: (object, currentHighLight) => {
                                    console.log('custom_data: ', object.texture.customData);

                                    return () => {
                                        object.setStyle({
                                            fontStyle: 'bold',
                                            fill: 'yellow'
                                        })

                                        if(this.currentHighLight) {
                                            this.currentHighLight.setStyle({
                                                fontStyle: 'normal',
                                                fill: 'white'
                                            })
                                        }

                                        this.currentHighLight = object;
                                    }
                                }
                            },
                            pointer: true,
                            subText: true
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