import Enemy from './enemy.js';
import { player } from "../components/player.js";
import { worldBounds } from "../app.js";
export default class Ghost extends Enemy {
  constructor(scene, hp, speed, dmg) {
    super(scene, hp, speed, dmg);
    this.timerEvent = this.scene.time.addEvent({
      delay: 250, // 1 second delay
      callback: this.updateMovement,
      callbackScope: this,
      loop: true // Loop the event
    });
  }

  updateEnemyMovement() {

  }

  updateMovement() {
    const distance = Phaser.Math.Distance.Between(player.character.x, player.character.y, this.enemy.x, this.enemy.y);

    const closeToLeft = this.enemy.x <= 75;
    const closeToRight = this.enemy.x >= worldBounds.x - 75;
    const closeToBottom = this.enemy.y >= worldBounds.y - 75;
    const closeToTop = this.enemy.y <= 75;

    let directionX = (this.enemy.x - player.character.x) / distance;
    let directionY = (this.enemy.y - player.character.y) / distance;

    if (closeToLeft && closeToTop) {
      directionX = 1;
      directionY = 1;
    } else if (closeToLeft && closeToBottom) {
      directionX = 1;
      directionY = -1;
    } else if (closeToRight && closeToTop) {
      directionX = -1;
      directionY = 1;
    } else if (closeToRight && closeToBottom) {
      directionX = -1;
      directionY = -1;
    } else {
      if (closeToLeft && directionY < 0) directionX = -1;
      if (closeToRight && directionY > 0) directionX = 1;
      if (closeToTop && directionX < 0) directionY = -1;
      if (closeToBottom && directionX > 0) directionY = 1;
    }

    this.enemy.setVelocityX(directionX * this.speed);
    this.enemy.setVelocityY(directionY * this.speed);

    this.enemy.anims.play(directionX > 0 ? 'right_enemy' : 'left_enemy', true);
  }
}

