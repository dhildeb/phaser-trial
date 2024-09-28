import { depthMap } from "../utils/constants.js";

export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, value, color) {
    super(scene, x, y);
    this.scene = scene;
    this.value = value;
    this.color = color || 0xff0000;

    // Create the background of the health bar (gray bar)
    this.bg = new Phaser.GameObjects.Graphics(scene);
    this.bg.fillStyle(0x000000);
    this.bg.fillRect(0, 0, 100, 20);
    this.add(this.bg);

    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.bar.fillStyle(this.color);
    this.bar.fillRect(2, 2, 96, 16);
    this.setDepth(depthMap.iSeeYou)
    this.add(this.bar);

    this.text = new Phaser.GameObjects.Text(scene, 50, 10, `${value}%`, {
      fontSize: '14px',
      fill: '#ffffff',
      align: 'center',
      fontFamily: 'Arial'
    });
    this.text.setOrigin(0.5);
    this.add(this.text);

    this.setPosition(x, y);
    this.setScrollFactor(0);
    scene.add.existing(this);
    this.setValue(value);
  }

  setValue(value) {
    this.bar.scaleX = Phaser.Math.Clamp(value / 100, 0, 1);
    this.value = value;

    this.text.setText(`${value.toFixed(0)}%`);
  }

  setColor(color) {
    this.color = color;
    this.bar.clear();
    this.bar.fillStyle(this.color);
    this.bar.fillRect(2, 2, 96, 16);
  }
}
