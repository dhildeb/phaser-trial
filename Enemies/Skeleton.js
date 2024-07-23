import Item from "../Item.js";
import { playerDmg, setPlayerDmg, setWeapon, attackVisual, hpBar } from "../app.js";
import Enemy from './enemy.js'
export default class skeleton extends Enemy {
  constructor(scene, player, hp, speed, dmg) {
    super(scene, player, hp, speed, dmg)
  }

  configureEnemy() {
    this.createEnemyAnimations(this.scene);

    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);

    this.handleEnemy(this.scene);
  }

  updateEnemyMovement() {
    const dx = this.player.x - this.enemy.x;
    const dy = this.player.y - this.enemy.y;

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
    if (Math.random() < 0.5 && attackVisual.frame.texture.key !== 'shovel') {
      let shovel = new Item(this.scene, this.enemy.x, this.enemy.y, 'shovel', 5);
      shovel.setScale(24 / shovel.width);
      this.scene.physics.add.overlap(this.player, shovel, () => {
        let upgrade = shovel.collect()
        if (playerDmg < 5) {
          setPlayerDmg(upgrade);
          setWeapon('shovel', 0.006857, 0.006857)
        }
      }, null, this.scene);
    } else {
      let potion = new Item(this.scene, this.enemy.x, this.enemy.y, 'potion', 10);
      this.scene.physics.add.overlap(this.player, potion, () => {
        const newHP = potion.collect() + hpBar.value;
        hpBar.setValue(newHP > 100 ? 100 : newHP);
      }, null, this.scene);
    }
  }
}
