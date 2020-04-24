class BaseScene extends Phaser.Scene {
    preloadAnimations(key, template, range) {
        Array(range).fill().map((_, i) => {
            let temp = template
            this.load.image({
                key: `${key}_${i + 1}`,
                url: temp.replace('$', i + 1),
            })
        })
    }
}