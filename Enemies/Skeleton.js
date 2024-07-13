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
}
