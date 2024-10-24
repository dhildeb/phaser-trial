import { enemies, tombstones, worldBounds } from '../app.js';
import { generateRandomID } from "../utils/idGenerator.js";
import Item from "../components/Item.js";
import { player } from "../components/player.js";
import { colorWheel } from "../utils/constants.js";

export default class Enemy {
  constructor(scene, hp, speed, dmg) {
    this.id = generateRandomID();
    this.enemy = scene.physics.add.sprite(Phaser.Math.Between(100, worldBounds.x), Phaser.Math.Between(100, worldBounds.y), 'enemy');
    this.enemy.setBounce(0.2);
    this.enemy.setCollideWorldBounds(true);
    this.speed = speed || 100;
    this.originalSpeed = this.speed
    this.dmg = dmg ?? 1;
    this.scene = scene;
    this.hp = hp || 1;
    this.slowed = false;
    this.invincible = false;

    this.enemy.body.setSize(this.enemy.width - 5, this.enemy.height - 5);

    this.configureEnemy();
  }

  configureEnemy() {
    if (!this.scene.anims.get('left_enemy')) {
      this.createEnemyAnimations(this.scene);
    }

    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);
    this.handleEnemy(this.scene);
  }

  getBounds() {
    return this.enemy.getBounds();
  }

  handleEnemy(scene) {
    scene.physics.add.collider(this.enemy, player.character, this.enemyPlayerCollision, null, this);
    scene.physics.add.overlap(this.enemy, tombstones, this.handleObstacle.bind(this), null, this);
    this.updateListener = scene.events.on('update', this.updateEnemyMovement, this);
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed;
  }

  handleObstacle() {
    if (this.slowed) return;
    this.slowed = true;
    this.setSpeed(30);
    this.enemy.setAlpha(0.5);
    this.invincible = true;

    this.scene.time.delayedCall(1000, () => {
      this.invincible = false;
      this.enemy.setAlpha(1);
      this.slowed = false;
      this.setSpeed(this.originalSpeed);
    });
  }

  updateEnemyMovement() {
    const distance = Phaser.Math.Distance.Between(player.character.x, player.character.y, this.enemy.x, this.enemy.y);
    // if (distance > 200) return; // Skip movement updates for far-away enemies

    const directionX = (player.character.x - this.enemy.x) / distance;
    const directionY = (player.character.y - this.enemy.y) / distance;

    this.enemy.setVelocityX(directionX * this.speed);
    this.enemy.setVelocityY(directionY * this.speed);

    this.enemy.anims.play(directionX > 0 ? 'right_enemy' : 'left_enemy', true);
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

  handleAttackHit(dmg) {
    if (this.invincible) {
      return;
    }
    this.enemy.setTint(colorWheel.red);

    this.scene.time.delayedCall(200, () => {
      this.enemy.clearTint();
    });

    this.hp -= dmg;

    if (this.hp < 1) {
      this.handleDrop();
      const index = enemies.findIndex((enemy) => enemy.id === this.id);
      enemies.splice(index, 1);
      this.scene.events.off('update', this.updateEnemyMovement, this);
      this.scene.time.delayedCall(100, () => {
        this.enemy.destroy();
      })
      return true;
    }
    return false;
  }

  removeSelf() {
    const index = enemies.findIndex((enemy) => enemy.id === this.id);
    if (index > -1) {
      enemies.splice(index, 1);
    }
    this.scene.events.off('update', this.updateEnemyMovement, this);
    this.enemy.destroy();
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
    this.scene.time.delayedCall(1000, () => {
      if (enemies.length > 9) {
        return
      }
      enemies.push(new Enemy(scene, 3, 100, .5))
    });
  }
}
