import { handlePlayerDamage } from './app.js';

export default class Enemy {
  constructor(scene, player, speed, dmg) {
    this.enemy = scene.physics.add.sprite(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 300), 'enemy');
    this.enemy.setBounce(0.2);
    this.enemy.setCollideWorldBounds(true);
    this.player = player;
    this.speed = speed || 100;
    this.dmg = dmg || 1;
    this.scene = scene

    this.createEnemyAnimations(scene);

    this.handleEnemy(scene);
  }

  getBounds() {
    return this.enemy.getBounds();
  }

  handleEnemy(scene) {
    scene.physics.add.collider(this.enemy, this.player, this.enemyPlayerCollision, null, scene);

    const updateEnemyMovement = () => {
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
    };

    scene.events.on('update', updateEnemyMovement, this);
  }

  enemyPlayerCollision = () => {
    handlePlayerDamage(this.scene, this.dmg);
  }

  destroy() {
    this.enemy.destroy();
  }

  createEnemyAnimations(scene) {
    scene.anims.create({
      key: 'left_enemy',
      frames: scene.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
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
      frames: scene.anims.generateFrameNumbers('enemy', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
  }
  handleAttackHit() {
    this.enemy.setTint(0xff0000);

    setTimeout(() => {
      this.enemy.clearTint();
    }, 200);

    this.enemy.disableBody(true, true);
  }
}
