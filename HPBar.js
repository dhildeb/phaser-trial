export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, value, color) {
    super(scene, x, y);
    this.scene = scene;
    this.value = value;
    this.color = color || 0xff0000

    // Create the background of the health bar (gray bar)
    this.bg = new Phaser.GameObjects.Graphics(scene);
    this.bg.fillStyle(0x000000);
    this.bg.fillRect(0, 0, 100, 20);
    this.add(this.bg);

    // Create the health bar (red bar)
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.bar.fillStyle(this.color);
    this.bar.fillRect(2, 2, 96, 16);
    this.add(this.bar);

    // Set initial position and add to scene
    this.setPosition(x, y);
    scene.add.existing(this);

    // Set initial value
    this.setValue(value);
  }

  // Update the health bar based on the current value
  setValue(value) {
    this.bar.scaleX = Phaser.Math.Clamp(value / 100, 0, 1);
    this.value = value
  }
  setColor(color) {
    this.color = color;
    this.bar.clear();
    this.bar.fillStyle(this.color);
    this.bar.fillRect(2, 2, 96, 16);
  }
}
