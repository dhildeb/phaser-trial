export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
    this.oldManDialog = ['Hey kid,', 'I lost a key to this here sepulcher.', 'I\'m sure its around here somewhere...']
    this.dialogIndex = 0;
  }

  preload() {
    this.load.image('coolGuy', './assets/cool_shovel_dude.png');
  }

  create() {
    this.add.image($(window).width() / 2, $(window).height() / 2, 'coolGuy').setScale(.2);

    const dialogText = this.add.text(400, 100, this.oldManDialog[this.dialogIndex], {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', () => {
      if (this.dialogIndex < this.oldManDialog.length - 1) {
        this.dialogIndex++;
        dialogText.setText(this.oldManDialog[this.dialogIndex]);
      } else {
        this.scene.start('SceneOne');
        // this.scene.start('EndTwoScene');
      }
    });
  }

}
