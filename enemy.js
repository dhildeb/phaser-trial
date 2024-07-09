import { enemies, handlePlayerDamage, playerDmg } from './app.js';
import { generateRandomID } from "./util.js";

export default class Enemy {
  constructor(scene, player, hp, speed, dmg) {
    this.id = generateRandomID();
    this.enemy = scene.physics.add.sprite(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 300), 'enemy');
    this.enemy.setBounce(0.2);
    this.enemy.setCollideWorldBounds(true);
    this.player = player;
    this.speed = speed || 100;
    this.dmg = dmg || 1;
    this.scene = scene;
    this.hp = hp || 1;

    this.createEnemyAnimations(scene);

    // Bind the event handler to this instance
    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);

    this.handleEnemy(scene);
  }

  getBounds() {
    return this.enemy.getBounds();
  }

  handleEnemy(scene) {
    scene.physics.add.collider(this.enemy, this.player, this.enemyPlayerCollision, null, scene);

    // Add the event listener and store a reference to it
    this.updateListener = scene.events.on('update', this.updateEnemyMovement, this);
  }

  updateEnemyMovement() {
    const distance = Math.sqrt(Math.pow(this.player.x - this.enemy.x, 2) + Math.pow(this.player.y - this.enemy.y, 2));

    const directionX = (this.player.x - this.enemy.x) / distance;
    const directionY = (this.player.y - this.enemy.y) / distance;

    this.enemy.setVelocityX(directionX * this.speed);
    this.enemy.setVelocityY(directionY * this.speed);

    if (directionX > 0) {
      this.enemy.anims.play('right_enemy', true);
    } else {
      this.enemy.anims.play('left_enemy', true);
    }
  }

  enemyPlayerCollision = () => {
    handlePlayerDamage(this.scene, this.dmg);
  }

  createEnemyAnimations(scene) {
    scene.anims.create({
      key: 'left_enemy',
      frames: scene.anims.generateFrameNumbers('enemy', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: 'turn_enemy',
      frames: [{ key: 'enemy', frame: 4 }],
      frameRate: 20
    });

    scene.anims.create({
      key: 'right_enemy',
      frames: scene.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  handleAttackHit() {
    this.enemy.setTint(0xff0000);

    setTimeout(() => {
      this.enemy.clearTint();
    }, 200);

    this.hp -= playerDmg;

    if (this.hp < 1) {
      const index = enemies.findIndex((enemy) => enemy.id === this.id);
      enemies.splice(index, 1);

      // Remove the specific event listener
      this.scene.events.off('update', this.updateEnemyMovement, this);

      this.enemy.destroy();
      return true;
    }
    return false;
  }
}
