import Enemy from './enemy.js';
import { worldBounds } from "../app.js";
import { player } from "../components/player.js";
export default class Ghost extends Enemy {
  constructor(scene, hp, speed, dmg) {
    super(scene, hp, speed, dmg);
  }

  configureEnemy() {
    if (!this.scene.anims.get('left_enemy')) {
      this.createEnemyAnimations(this.scene);
    }
    this.enemy.setVelocityX(Phaser.Math.FloatBetween(-1, 1) * this.speed);
    this.enemy.setVelocityY(Phaser.Math.FloatBetween(-1, 1) * this.speed);
    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);
    this.handleEnemy(this.scene);
  }

  handleEnemy(scene) {
    this.updateListener = scene.events.on('update', this.updateEnemyMovement, this);
  }

  updateEnemyMovement() {

  }

  updateMovement() {
    const distance = Phaser.Math.Distance.Between(player.character.x, player.character.y, this.enemy.x, this.enemy.y);
    if (distance > 200) {
      this.enemy.setVelocity(0, 0);
      return
    }

    const closeToLeft = this.enemy.x <= 75;
    const closeToRight = this.enemy.x >= worldBounds.x - 5;
    const closeToTop = this.enemy.y <= 75;
    const closeToBottom = this.enemy.y >= worldBounds.y - 5;

    if (closeToLeft) {
      this.enemy.setVelocityX(this.speed);
      this.enemy.setVelocityY(Phaser.Math.Between(-this.speed, this.speed));
    }
    else if (closeToRight) {
      this.enemy.setVelocityX(-this.speed);
      this.enemy.setVelocityY(Phaser.Math.Between(-this.speed, this.speed));
    }
    else if (closeToTop) {
      this.enemy.setVelocityY(this.speed);
      this.enemy.setVelocityX(Phaser.Math.Between(-this.speed, this.speed));
    }
    else if (closeToBottom) {
      this.enemy.setVelocityY(-this.speed);
      this.enemy.setVelocityX(Phaser.Math.Between(-this.speed, this.speed));
    } else {
      const directionX = this.enemy.x < player.character.x ? -this.speed : this.speed;
      const directionY = this.enemy.y < player.character.y ? -this.speed : this.speed;
      this.enemy.setVelocity(directionX, directionY);
    }

    this.enemy.anims.play(this.enemy.body.velocity.x > 0 ? 'right_enemy' : 'left_enemy', true);
  }
}

