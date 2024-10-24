import Enemy from './enemy.js';
import { player } from "../components/player.js";
import { colorWheel, depthMap } from "../utils/constants.js";

export default class Slime extends Enemy {
  constructor(scene, hp, speed, dmg) {
    super(scene, hp, speed, dmg)
  }

  configureEnemy() {
    this.createEnemyAnimations(this.scene);
    this.updateEnemyMovement = this.updateEnemyMovement.bind(this);

    this.handleEnemy(this.scene);
    this.createTrail(this.scene);
  }

  handleEnemy(scene) {
    scene.physics.add.collider(this.enemy, player.character, this.enemyPlayerCollision, null, scene);
    this.updateListener = scene.events.on('update', this.updateEnemyMovement, this);
  }

  createEnemyAnimations(scene) {
    scene.anims.create({
      key: 'left_slime',
      frames: scene.anims.generateFrameNumbers('slime', { start: 7, end: 0 }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: 'turn_slime',
      frames: [{ key: 'slime', frame: 4 }],
      frameRate: 20
    });

    scene.anims.create({
      key: 'right_slime',
      frames: scene.anims.generateFrameNumbers('slime', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: 'slime_attack',
      frames: scene.anims.generateFrameNumbers('slime', { start: 8, end: 15 }),
      frameRate: 10,
      repeat: 0
    });
  }

  createTrail(scene) {
    this.trailGroup = scene.physics.add.group({
      classType: Phaser.GameObjects.Sprite,
      runChildUpdate: true
    });
    scene.physics.add.overlap(player.character, this.trailGroup, () => {
      if (!player.hasControl) { return }
      player.setHasControl(false)
      player.character.setTint(colorWheel.blue)
      scene.time.delayedCall(750, () => {
        player.setHasControl(true)
        player.character.clearTint()
      })
    });
  }

  updateEnemyMovement() {
    const distance = Phaser.Math.Distance.Between(player.character.x, player.character.y, this.enemy.x, this.enemy.y);
    if (distance > 512) {
      this.enemy.setVelocity(0);
      this.enemy.anims.stop();
      return;
    }
    if (this.enemy.anims.currentAnim && this.enemy.anims.currentAnim.key === 'slime_attack') {
      console.log(this.enemy.anims.currentAnim)
      return;
    }
    const directionX = (player.character.x - this.enemy.x) / distance;
    const directionY = (player.character.y - this.enemy.y) / distance;

    this.enemy.setVelocityX(directionX * this.speed);
    this.enemy.setVelocityY(directionY * this.speed);

    this.enemy.anims.play(directionX > 0 ? 'right_slime' : 'left_slime', true);

    this.createTrailPart(this.scene, this.enemy.x, this.enemy.y);
  }

  createTrailPart(scene, x, y) {
    // Create the trail part using a circle
    const trail = scene.add.circle(x, y + 4, 6, colorWheel.blue);
    trail.setAlpha(0.01); // transparency

    // Add physics to the trail
    scene.physics.add.existing(trail);

    // Set up physics properties for the trail body
    trail.body.setCircle(6);
    trail.body.setAllowGravity(false);
    trail.body.setImmovable(true);

    // Set trail depth
    trail.setDepth(depthMap.background + 1);

    // Create a tween to slowly fade out and destroy the trail part
    scene.tweens.add({
      targets: trail,
      alpha: { from: .05, to: 0.01 },
      duration: 60000,
      onComplete: () => {
        trail.body.enable = false;
        trail.destroy();
      },
    });

    // Add the trail part to the trailGroup for collision detection
    this.trailGroup.add(trail);
  }

  enemyPlayerCollision = () => {
    if (this.isAttacking) return;
    // TODO figure out why this attack animation isnt playing
    this.isAttacking = true;
    this.enemy.anims.play('slime_attack', true);
    player.handlePlayerDamaged(this.dmg);
    console.log('test')
    this.scene.time.delayedCall(1000, () => {
      this.isAttacking = false;
    });
  }
}
