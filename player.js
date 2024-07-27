import HealthBar from './HPBar.js'
import { enemies, tombstones, allTombstones, updateScore, score, setGameOver } from "./app.js";
import { directionAngles } from "./utils/constants.js";
import skeleton from "./Enemies/Skeleton.js";
class Player {
  constructor() {
    this.character;
    this.dmg = 2
    this.pressedKeys = {}
    this.lastPressedKey = null
    this.hpBar;
    this.attackVisual;
    this.attackDelay;
    this.cursors;
  }

  setDmg = (dmg) => { this.dmg = dmg }

  setupPlayerCreate(scene) {
    this.character = scene.physics.add.sprite(100, 450, 'dude');
    this.character.setBounce(0.2);
    this.character.setCollideWorldBounds(true);

    this.hpBar = new HealthBar(scene, this.character.x - 50, this.character.y - 50, 100);

    // Input events
    this.cursors = scene.input.keyboard.createCursorKeys();
    scene.input.keyboard.on('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.pressedKeys[event.code] = true;
          break;
      }
    });

    // Use the 'keyup' event to remove released arrow keys from this.pressedKeys
    scene.input.keyboard.on('keyup', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          delete this.pressedKeys[event.code]; // Remove released keys
          break;
      }
    });

    this.createPlayerAnimations(scene);
  }

  createPlayerAnimations(scene) {
    scene.anims.create({
      key: 'left',
      frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    scene.anims.create({
      key: 'right',
      frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
  }

  setupPlayerUpdate(scene) {
    this.hpBar.setPosition(player.character.x - 50, player.character.y - 50);
    this.handlePlayerMovement();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.attackDelay) {
      this.performAttack(scene);
    }
  }
  setWeapon = (wep, scaleX = 1, scaleY = 1) => {
    this.attackVisual.setTexture(wep)
    this.attackVisual.setScale(scaleX, scaleY)
  }

  performAttack(scene) {
    this.attackDelay = true;
    this.attackVisual = scene.add.sprite(0, 0, 'rock');
    this.attackVisual.setVisible(false);
    this.attackVisual.setScale(.05);
    let attackRangeX = this.character.x;
    let attackRangeY = this.character.y;

    switch (this.lastPressedKey) {
      case 'up':
        attackRangeY -= 50;
        break;
      case 'down':
        attackRangeY += 50;
        break;
      case 'left':
        attackRangeX -= 50;
        break;
      case 'right':
        attackRangeX += 50;
        break;
      case 'upleft':
        attackRangeX -= 50;
        attackRangeY -= 50;
        break;
      case 'upright':
        attackRangeX += 50;
        attackRangeY -= 50;
        break;
      case 'downleft':
        attackRangeX -= 50;
        attackRangeY += 50;
        break;
      case 'downright':
        attackRangeX += 50;
        attackRangeY += 50;
        break;
      default:
        // If no valid direction, do nothing
        return;
    }

    this.attackVisual.setPosition(attackRangeX, attackRangeY);
    const angle = directionAngles[this.lastPressedKey] || 0;
    this.attackVisual.setAngle(angle);
    this.attackVisual.setVisible(true);
    setTimeout(() => {
      this.attackDelay = false;
      this.attackVisual.setVisible(false);
    }, 500);
    enemies.forEach((enemy) => {
      if (!enemy || !enemy.enemy) {
        return;
      }
      if (Phaser.Geom.Rectangle.ContainsPoint(enemy.getBounds(), new Phaser.Geom.Point(attackRangeX, attackRangeY))) {
        this.handleAttackHit(enemy, scene);
      }
    });
    tombstones.getChildren().forEach((tombstone) => {
      if (this.attackVisual.frame.texture.key !== 'shovel') {
        return;
      }
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.attackVisual.getBounds(), tombstone.getBounds())) {
        handleTombstoneHit(tombstone);
      }
    });
  }

  handleTombstoneHit(tombstone) {
    const index = allTombstones.indexOf(tombstone);
    tombstone.destroy()
    if (index > -1) {
      allTombstones.splice(index, 1);
    }
    if (allTombstones.length <= 0) {
      handleVictory()
    }
  }

  handleAttackHit(enemy, scene) {
    const isDead = enemy.handleAttackHit()
    if (!isDead) {
      return;
    }
    updateScore(+score);
    if (Math.random() < 0.3) {
      enemies.push(new skeleton(scene, 25, 75, 5))
    }

    enemy.respawnEnemy(scene);
  }

  handlePlayerMovement() {
    let velocityX = 0;
    let velocityY = 0;
    let direction = '';

    // Determine movement direction based on pressed keys
    if (this.pressedKeys['ArrowUp']) {
      velocityY = -200;
      direction += 'up';
    }
    if (this.pressedKeys['ArrowDown']) {
      velocityY = 200;
      direction += 'down';
    }
    if (this.pressedKeys['ArrowLeft']) {
      velocityX = -200;
      direction += 'left';
    }
    if (this.pressedKeys['ArrowRight']) {
      velocityX = 200;
      direction += 'right';
    }

    // Move player and play animation based on direction
    this.movePlayer(velocityX, velocityY, direction);
  }

  movePlayer(velocityX, velocityY, direction) {
    this.character.setVelocityX(velocityX);
    this.character.setVelocityY(velocityY);
    if (direction) {
      this.character.anims.play(direction, true);
      this.lastPressedKey = direction; // Update last pressed direction
    } else {
      this.character.setVelocity(0); // Stop the player if no keys are pressed
      this.character.anims.play('turn');
    }
  }

  handlePlayerDamaged(dmg) {
    this.hpBar.setValue(this.hpBar.value - dmg);
    if (this.hpBar.value <= 0) {
      setGameOver(true);
      updateScore('You Lose!');

      this.character.setTint(0xff0000);
      this.character.anims.play('turn');
    }
  }
}
export const player = new Player()