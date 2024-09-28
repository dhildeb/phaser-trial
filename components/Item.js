export default class Item extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, item, value) {
    super(scene, x, y, item);
    this.value = value;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.setScale(24 / this.width, 24 / this.height);
  }

  collect() {
    this.destroy();
    return this.value
  }
}
