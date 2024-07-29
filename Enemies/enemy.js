import { enemies, tombstones, worldBounds } from '../app.js';
import { generateRandomID } from "../util.js";
import Item from "../Item.js";
import { player } from "../player.js";

export default class Enemy {
  constructor(scene, hp, speed, dmg) {
    this.id = generateRandomID();
    this.enemy = scene.physics.add.sprite(Phaser.Math.Between(100, worldBounds.x), Phaser.Math.Between(100, worldBounds.y), 'enemy');
    this.enemy.setBounce(0.2);
    this.enemy.setCollideWorldBounds(true);
    this.speed = speed || 100;
    this.dmg = dmg || 1;
    this.scene = scene;
    this.hp = hp || 1;
    this.slowed;
    this.invincible;

    this.enemy.body.setSize(this.enemy.width - 25, this.enemy.height - 25);


    this.configureEnemy()
  }

  configureEnemy() {
    this.createEnemyAnimations(this.scene);

    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);

    this.handleEnemy(this.scene);
  }

  getBounds() {
    return this.enemy.getBounds();
  }

  handleEnemy(scene) {
    scene.physics.add.collider(this.enemy, player.character, this.enemyPlayerCollision, null, scene);
    scene.physics.add.overlap(this.enemy, tombstones, this.handleObstacle.bind(this), null, scene);
    this.updateListener = scene.events.on('update', this.updateEnemyMovement, this);
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  handleObstacle() {
    if (this.slowed) {
      return;
    }
    this.slowed = true
    this.setSpeed(30)
    this.enemy.setAlpha(0.5);
    this.invincible = true
    setTimeout(() => {
      this.invincible = false
      this.enemy.setAlpha(1);
      this.slowed = false
      this.setSpeed(100)
    }, 1000)
  }

  updateEnemyMovement() {
    const distance = Math.sqrt(Math.pow(player.character.x - this.enemy.x, 2) + Math.pow(player.character.y - this.enemy.y, 2));

    const directionX = (player.character.x - this.enemy.x) / distance;
    const directionY = (player.character.y - this.enemy.y) / distance;

    this.enemy.setVelocityX(directionX * this.speed);
    this.enemy.setVelocityY(directionY * this.speed);
    if (directionX > 0) {
      this.enemy.anims.play('right_enemy', true);
    } else {
      this.enemy.anims.play('left_enemy', true);
    }
  }

  enemyPlayerCollision = () => {
    player.handlePlayerDamaged(this.dmg);
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
    if (this.invincible) {
      return;
    }
    this.enemy.setTint(0xff0000);

    setTimeout(() => {
      this.enemy.clearTint();
    }, 200);

    this.hp -= player.dmg;

    if (this.hp < 1) {
      const index = enemies.findIndex((enemy) => enemy.id === this.id);
      enemies.splice(index, 1);

      this.scene.events.off('update', this.updateEnemyMovement, this);

      this.enemy.destroy();
      this.handleDrop();
      return true;
    }
    return false;
  }

  handleDrop() {
    if (Math.random() < 0.3) {
      let potion = new Item(this.scene, this.enemy.x, this.enemy.y, 'potion', 20);
      this.scene.physics.add.overlap(player.character, potion, () => {
        const newHP = potion.collect() + player.hpBar.value;
        player.hpBar.setValue(newHP > 100 ? 100 : newHP);
      }, null, this.scene);
    }
  }

  respawnEnemy(scene) {
    setTimeout(() => {
      enemies.push(new Enemy(scene, 3, 100, 1))
    }, 1000);
  }
}
