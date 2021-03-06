var DialogModalPlugin = function (scene, test) {
    // the scene that owns the plugin
    this.scene = scene;
    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted) {
        scene.sys.events.once('boot', this.boot, this);
    }
};

// Register this plugin with the PluginManager
DialogModalPlugin.register = function (PluginManager) {
    PluginManager.register('DialogModalPlugin', DialogModalPlugin, 'dialogModal');
};

DialogModalPlugin.prototype = {
    // called when the plugin is loaded by the PluginManager
    boot: function () {
        var eventEmitter = this.systems.events;
        eventEmitter.on('shutdown', this.shutdown, this);
        eventEmitter.on('destroy', this.destroy, this);
    },

    //  Called when a Scene shuts down, it may then come back again later
    // (which will invoke the 'start' event) but should be considered dormant.
    shutdown: function () {
        if (this.timedEvent) this.timedEvent.remove();
        if (this.text) this.text.destroy();
    },

    // called when a Scene is destroyed by the Scene Manager
    destroy: function () {
        this.shutdown();
        this.scene = undefined;
    },
    // Initialize the dialog modal
    init: function (opts) {
        // Check to see if any optional parameters were passed
        if (!opts) opts = {};
        // set properties from opts object or use defaults
        this.borderThickness = opts.borderThickness || 3;
        this.borderColor = opts.borderColor || 0x907748;
        this.borderAlpha = opts.borderAlpha || 1;
        this.windowAlpha = opts.windowAlpha || 0.8;
        this.windowColor = opts.windowColor || 0x303030;
        this.windowHeight = opts.windowHeight || 150;
        this.padding = opts.padding || 32;
        this.closeBtnColor = opts.closeBtnColor || 'darkgoldenrod';
        this.dialogSpeed = opts.dialogSpeed || 3;
        this.closeHandle = opts.closeHandle || null;

        // used for animating the text
        this.eventCounter = 0;
        // if the dialog window is shown
        this.visible = true;
        // the current text in the window
        this.text;
        // the text that will be displayed in the window
        this.dialog;
        this.graphics;
        this.closeBtn;

        /** set current highlight answer */
        this.currentHighLight = null

        // Create the dialog window
        this._createWindow();
    },
    // Gets the width of the game (based on the scene)
    _getGameWidth: function () {
        return this.scene.sys.game.config.width;
    },

    // Gets the height of the game (based on the scene)
    _getGameHeight: function () {
        return this.scene.sys.game.config.height;
    },

    // Calculates where to place the dialog window based on the game size
    _calculateWindowDimensions: function (width, height) {
        var x = this.padding;
        var y = height - this.windowHeight - this.padding;
        var rectWidth = width - (this.padding * 2);
        var rectHeight = this.windowHeight;
        return {
            x,
            y,
            rectWidth,
            rectHeight
        };
    },
    // Creates the inner dialog window (where the text is displayed)
    _createInnerWindow: function (x, y, rectWidth, rectHeight) {
        this.graphics.fillStyle(this.windowColor, this.windowAlpha);
        this.graphics.fillRect(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
    },

    // Creates the border rectangle of the dialog window
    _createOuterWindow: function (x, y, rectWidth, rectHeight) {
        this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
        this.graphics.strokeRect(x, y, rectWidth, rectHeight);
    },
    // Creates the dialog window
    _createWindow: function () {
        var gameHeight = this._getGameHeight();
        var gameWidth = this._getGameWidth();
        var dimensions = this._calculateWindowDimensions(gameWidth, gameHeight);
        this.graphics = this.scene.add.graphics();

        this._createOuterWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
        this._createInnerWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);

        this._createCloseModalButton();
        this._createCloseModalButtonBorder();
    },
    setText: function (text, animate, options = {}) {
        // Reset the dialog
        this.eventCounter = 0;
        this.dialog = text.split('');
        if (this.timedEvent) this.timedEvent.remove();

        var tempText = animate ? '' : text;
        this._setText(tempText, options);

        if (animate) {
            this.timedEvent = this.scene.time.addEvent({
                delay: 150 - (this.dialogSpeed * 30),
                callback: this._animateText(options),
                callbackScope: this,
                loop: true
            });
        }
    },
    // Calcuate the position of the text in the dialog window
    _setText: function (text, options) {
        const {xAxis = 0, yAxis = 0, key = 'text', pointer = false} = options;
        // Reset the dialog
        if (this[`${key}`]) this[`${key}`].destroy();

        var x = this.padding + 10 + xAxis;
        var y = this._getGameHeight() - this.windowHeight - this.padding + 10 + yAxis;
        options.subText && (y += this.text.height);

        this[`${key}`] = this.scene.make.text({
            x,
            y,
            text,
            style: {
                wordWrap: {
                    width: this._getGameWidth() - (this.padding * 2) - 25
                },
                font: '15px Arial'
            }
        });

        /** custom data */
        this[`${key}`].texture.customData = options.customData;

        /** style */
        if(pointer) {
            this[`${key}`].on('pointerover', () => this.systems.game.canvas.style.cursor = 'pointer')
            this[`${key}`].on('pointerout', () => this.systems.game.canvas.style.cursor = 'default')
        }

        /** events */
        const {events = null} = options;
        if(events) {
            this[`${key}`].setInteractive();

            Object.keys(events).forEach(eventName => {
                this[`${key}`].on(eventName, events[eventName](this[`${key}`], this.currentHighLight))
            })
        }
    },
    // Slowly displays the text in the window to make it appear animated
    _animateText: function (options) {
        const key = options.keys || 'text'
        return function() {
            this.eventCounter++;
            this[`${key}`].setText(this[`${key}`].text + this.dialog[this.eventCounter - 1]);
            if (this.eventCounter === this.dialog.length) {
                this.timedEvent.remove();

                options.callback && options.callback();
            }
        }
    },
    // Hide/Show the dialog window
    toggleWindow: function () {
        this.visible = !this.visible;
        if (this.text) this.text.visible = this.visible;
        if (this.graphics) this.graphics.visible = this.visible;
        if (this.closeBtn) this.closeBtn.visible = this.visible;
    },
    // Creates the close dialog window button
    _createCloseModalButton: function () {
        var self = this;
        this.closeBtn = this.scene.make.text({
            x: this._getGameWidth() - this.padding - 14,
            y: this._getGameHeight() - this.windowHeight - this.padding + 3,
            text: 'X',
            style: {
                font: 'bold 12px Arial',
                fill: this.closeBtnColor
            }
        });
        this.closeBtn.setInteractive();

        this.closeBtn.on('pointerover', function () {
            this.setTint(0xff0000);
            self.systems.game.canvas.style.cursor = 'pointer'
        });
        this.closeBtn.on('pointerout', function () {
            this.clearTint();
            self.systems.game.canvas.style.cursor = 'default'
        });
        this.closeBtn.on('pointerdown', function () {
            self.toggleWindow();
            self.systems.game.canvas.style.cursor = 'default'
            if(self.closeHandle) {
                self.closeHandle()
            }
        });
    },
    // Creates the close dialog button border
    _createCloseModalButtonBorder: function () {
        var x = this._getGameWidth() - this.padding - 20;
        var y = this._getGameHeight() - this.windowHeight - this.padding;
        this.graphics.strokeRect(x, y, 20, 20);
    }
};
