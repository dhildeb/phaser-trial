import HealthBar from './HPBar.js'
import { enemies, tombstones, allTombstones, updateScore, score, setGameOver, worldBounds, viewWidth, viewHeight } from "./app.js";
import skeleton from "./Enemies/Skeleton.js";
import Item from "./Item.js";
import { directionAngles } from "./utils/constants.js"
import { getWepRangePos, getWepStartPos } from "./utils/weaponHelper.js";

class Player {
  constructor() {
    this.character;
    this.dmg = 2;
    this.pressedKeys = {};
    this.lastPressedKey = null;
    this.wep = { img: 'rock', xScale: .05, yScale: .05 };
    this.hpBar;
    this.attackVisual;
    this.attackDelay;
    this.cursors;
    this.powerLevel;
    this.powerBar;
    this.speed = 200
    this.originalSpeed = this.speed
  }

  setDmg = (dmg) => { this.dmg = dmg }

  setupPlayerCreate(scene) {
    this.character = scene.physics.add.sprite(worldBounds.x / 2, worldBounds.y / 2, 'player');
    this.character.setBounce(0.2).setScale(1.5);
    this.character.setCollideWorldBounds(true);

    this.hpBar = new HealthBar(scene, viewWidth / 2, 16, 100);
    this.powerBar = new HealthBar(scene, viewWidth / 2, viewHeight - 32, 0, 0xFFFF00);

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

    scene.input.keyboard.on('keyup', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          delete this.pressedKeys[event.code];
          break;
      }
    });

    this.createPlayerAnimations(scene);
  }

  createPlayerAnimations(scene) {
    scene.anims.create({
      key: 'left',
      frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 9 }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: 'up',
      frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: 'turn',
      frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    scene.anims.create({
      key: 'right',
      frames: scene.anims.generateFrameNumbers('player', { start: 9, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
    scene.anims.create({
      key: 'down',
      frames: scene.anims.generateFrameNumbers('player', { start: 9, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
  }

  setupPlayerUpdate(scene) {
    this.handlePlayerMovement();
    if (this.cursors.space.isDown) {
      this.chargePowerUp();
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.space) && !this.attackDelay) {
      this.performAttack(scene, this.powerLevel);
      scene.time.delayedCall(250, () => {
        this.resetPowerUp();
      })
    }
  }

  chargePowerUp = () => {
    if (this.powerLevel < 100) {
      this.powerLevel += 2
      this.powerBar.setValue(this.powerLevel);
    }
    if (this.powerLevel >= 50) {
      this.powerBar.setColor(0x00FF00)
    }
    if (this.powerLevel >= 100) {
      this.powerBar.setColor(0x00FFFF)
    }
  }
  resetPowerUp = () => {
    if (this.powerLevel >= 50) {
      this.dmg /= 2
      this.powerBar.setColor(0xFFFF00)
    }
    this.powerLevel = 0;
    this.powerBar.setValue(this.powerLevel);
  }

  setWeapon = (wep, x = 1, y = 1) => {
    this.wep = { img: wep, xScale: x, yScale: y };
  }

  performAttack(scene) {
    if (this.powerLevel > 50) {
      this.dmg *= 2;
    }
    this.attackDelay = true;

    const { wepStartX, wepStartY } = getWepStartPos(this.character.x, this.character.y, this.lastPressedKey, this.wep.img)

    this.attackVisual = scene.physics.add.sprite(wepStartX, wepStartY, this.wep.img);
    this.attackVisual.setVisible(true);
    this.attackVisual.setScale(this.wep.xScale, this.wep.yScale);
    const isWepShovel = this.wep.img === 'shovel'
    if (isWepShovel) {
      this.attackVisual.setRotation(directionAngles[this.lastPressedKey])
    }

    const { attackRangeX, attackRangeY } = getWepRangePos(wepStartX, wepStartY, this.lastPressedKey, this.wep.img, this.powerLevel)

    const duration = isWepShovel ? 75 : 200

    scene.tweens.add({
      targets: this.attackVisual,
      x: attackRangeX,
      y: attackRangeY,
      duration: duration,
      onComplete: () => {
        this.attackVisual.destroy();
        this.attackDelay = false;
      }
    });

    scene.physics.moveTo(this.attackVisual, attackRangeX, attackRangeY, duration);
    scene.physics.add.collider(this.attackVisual, enemies.map(enemy => enemy.enemy), (attackVisual, enemySprite) => {
      const enemy = enemies.find(e => e.enemy === enemySprite);
      if (enemy) {
        this.handleAttackHit(enemy, scene);
        this.attackVisual.destroy();
      }
    });

    // Check for tombstone hits
    tombstones.getChildren().forEach((tombstone) => {
      if (!isWepShovel) {
        return;
      }
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.attackVisual.getBounds(), tombstone.getBounds())) {
        this.handleTombstoneHit(scene, tombstone);
      }
    });
  }

  handleTombstoneHit(scene, tombstone) {
    if (tombstone?.isHit) {
      return;
    }
    const index = allTombstones.indexOf(tombstone);
    tombstone.isHit = true
    if (index > -1) {
      allTombstones.splice(index, 1);
    }
    if (allTombstones.length <= 0) {
      let key = new Item(scene, tombstone.x, worldBounds.y < tombstone.y + 30 ? tombstone.y - 50 : tombstone.y + 50, 'key', 50);
      scene.physics.add.overlap(this.character, key, () => {
        key.collect()
        scene.scene.start('EndOneScene');
      }, null, scene);
    } else {
      let dirt = scene.physics.add.staticGroup()
      dirt.create(tombstone.x, tombstone.y + 30, Math.random() > 0.5 ? 'dirt' : 'dirt2').setScale(.05);
    }
  }

  handleAttackHit(enemy, scene) {
    if (!enemy || !enemy.enemy) {
      return;
    }
    const isDead = enemy.handleAttackHit(this.dmg)
    if (!isDead) {
      return;
    }
    updateScore(score + 1);
    if (Math.random() < 0.3) {
      scene.time.delayedCall(500, () => {
        enemies.push(new skeleton(scene, 25, 75, 5))
      });
    }

    enemy.respawnEnemy(scene);
  }

  setSpeed(newSpeed) {
    this.speed = newSpeed
  }

  handlePlayerMovement() {
    let velocityX = 0;
    let velocityY = 0;
    let direction = '';

    // Determine movement direction based on pressed keys
    if (this.pressedKeys['ArrowUp']) {
      velocityY = -this.speed;
      direction += 'up';
    }
    if (this.pressedKeys['ArrowDown']) {
      velocityY = this.speed;
      direction += 'down';
    }
    if (this.pressedKeys['ArrowLeft']) {
      velocityX = -this.speed;
      direction += 'left';
    }
    if (this.pressedKeys['ArrowRight']) {
      velocityX = this.speed;
      direction += 'right';
    }

    // Move player and play animation based on direction
    this.movePlayer(velocityX, velocityY, direction);
  }

  movePlayer(velocityX, velocityY, direction) {
    this.character.setVelocityX(velocityX);
    this.character.setVelocityY(velocityY);
    if (direction) {
      this.character.setFlipX(direction.includes('right') || direction.includes('down'));
      this.character.anims.play(direction.includes('up') ? 'up' : direction.includes('down') ? 'down' : direction, true);
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