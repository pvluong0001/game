class PreloadScene extends BaseScene {
    constructor() {
        super('bootGame');
    }

    preload() {
        this.load.image('grass', 'assets/grass.jpg')
        this.load.image('bg01', 'assets/background.jpg')
        this.load.image('bg02', 'assets/bg02-rz.png')

        this.load.image('boy', 'assets/knight/freeknight/png/Run (1).png')
        this.load.image('girl', 'assets/girl/png/Run (1).png')
        this.load.image('zombie', 'assets/zombie/png/male/Walk (1).png')

        /** load plugin */

        this.preloadAnimations('boy_animations', 'assets/knight/freeknight/png/Run ($).png', 10)
        this.preloadAnimations('zombie_animations', 'assets/zombie/png/male/Walk ($).png', 10)
        this.preloadAnimations('girl_animations', 'assets/girl/png/Run ($).png', 20)

        /** fake data */
        this.load.json({
            key: 'questions',
            url: 'http://www.json-generator.com/api/json/get/cqSJloBlua?indent=2',
            xhrSettings: {
                async: true
            }
        })
    }

    create() {
        this.scene.start('pickCharacter')
    }
}