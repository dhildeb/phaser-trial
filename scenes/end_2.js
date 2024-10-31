export class EndTwoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndTwoScene' });
    this.oldManDialog = [
      `Is ${sessionStorage.getItem('secretName')} important to ya?`,
      'Looks like ya still have a shovel\'ful to figure out.',
      'Gonna have to dig deeper to find what yer lookin fer.'
    ];
    this.dialogIndex = 0;
    this.inputEnabled = false;
    this.key;
  }

  preload() {
    this.load.image('coolGuy', './assets/cool_shovel_dude.png');
  }

  create() {
    const dialogText = this.add.text(600, 100, sessionStorage.getItem('secretName'), {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Enable input after a delay
    this.time.delayedCall(1000, () => {
      this.inputEnabled = true;
    });

    this.input.keyboard.on('keydown', () => {
      if (!this.inputEnabled) return;

      this.add.image(400, 300, 'coolGuy').setScale(0.2);
      dialogText.setText(this.oldManDialog[this.dialogIndex]);
      if (this.dialogIndex < this.oldManDialog.length - 1) {
        dialogText.setText(this.oldManDialog[this.dialogIndex]);
        this.dialogIndex++;
      } else {
        this.scene.start('SceneFour');
      }
    });
  }
}
