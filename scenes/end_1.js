export class EndOneScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndOneScene' });
    this.oldManDialog = [
      'I guess you did alright, findin me key.',
      'Now things get a little rough from here.',
      'Hope you ain\'t squeamish.'
    ];
    this.dialogIndex = 0;
    this.keyCollected = false;
    this.inputEnabled = false;
    this.key;
  }

  preload() {
    this.load.image('coolGuy', './assets/cool_shovel_dude.png');
    this.load.image('key', './assets/Skeleton_Key.png');
  }

  create() {
    this.key = this.add.image(400, 300, 'key').setScale(0.5);

    const dialogText = this.add.text(600, 100, 'The Crypt Master key! (Achievement unlocked: Grave Digger)', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Enable input after a delay
    this.time.delayedCall(2000, () => {
      this.inputEnabled = true;
    });

    this.input.keyboard.on('keydown', () => {
      if (!this.inputEnabled) return;

      if (!this.keyCollected) {
        this.key.setVisible(false);
        this.add.image(400, 300, 'coolGuy').setScale(0.2);
        dialogText.setText(this.oldManDialog[this.dialogIndex]);
        this.keyCollected = true;
      } else {
        if (this.dialogIndex < this.oldManDialog.length - 1) {
          dialogText.setText(this.oldManDialog[this.dialogIndex]);
          this.dialogIndex++;
        } else {
          this.scene.start('SceneTwo');
        }
      }
    });
  }
}
