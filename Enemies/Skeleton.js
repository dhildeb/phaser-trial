import Enemy from './enemy.js';
import Item from "../Item.js";
import { player } from "../player.js";

export default class skeleton extends Enemy {
  constructor(scene, hp, speed, dmg) {
    super(scene, hp, speed, dmg)
  }

  configureEnemy() {
    this.createEnemyAnimations(this.scene);
    this.enemy.setSize(32, 48);
    this.enemy.setOffset(16, 14);
    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);

    this.handleEnemy(this.scene);
  }

  handleEnemy(scene) {
    scene.physics.add.collider(this.enemy, player.character, this.enemyPlayerCollision, null, scene);
    this.updateListener = scene.events.on('update', this.updateEnemyMovement, this);
  }

  updateEnemyMovement() {
    if (this.isCollidingWithObstacle) {
      return;
    }
    const dx = player.character.x - this.enemy.x;
    const dy = player.character.y - this.enemy.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const directionX = dx / distance;
    const directionY = dy / distance;

    this.enemy.setVelocityX(directionX * this.speed);
    this.enemy.setVelocityY(directionY * this.speed);
    if (Math.abs(directionX) > Math.abs(directionY)) {
      if (directionX > 0) {
        this.enemy.anims.play('3_move', true);
      } else {
        this.enemy.anims.play('1_move', true);
      }
    } else {
      if (directionY > 0) {
        this.enemy.anims.play('2_move', true);
      } else {
        this.enemy.anims.play('0_move', true);
      }
    }
  }

  createEnemyAnimations(scene) {
    for (let row = 0; row < 4; row++) {
      const startFrame = row * 9;
      const endFrame = startFrame + 8;
      scene.anims.create({
        key: `${row}_move`,
        frames: scene.anims.generateFrameNumbers('skeleton', { start: startFrame, end: endFrame }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  handleDrop() {
    if (Math.random() < 0.5 && player.attackVisual.frame.texture.key !== 'shovel') {
      let shovel = new Item(this.scene, this.enemy.x, this.enemy.y, 'shovel', 5);
      shovel.setScale(24 / shovel.width);
      this.scene.physics.add.overlap(player.character, shovel, () => {
        let upgrade = shovel.collect()
        if (player.dmg < 5) {
          player.setDmg(upgrade);
          player.setWeapon('shovel', 0.006857, 0.006857)
        }
      }, null, this.scene);
    } else {
      let potion = new Item(this.scene, this.enemy.x, this.enemy.y, 'potion', 50);
      this.scene.physics.add.overlap(player.character, potion, () => {
        const newHP = potion.collect() + player.hpBar.value;
        player.hpBar.setValue(newHP > 100 ? 100 : newHP);
      }, null, this.scene);
    }
  }
}
