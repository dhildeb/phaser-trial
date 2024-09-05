
import { createCommonSceneElements, tombstones, enemies, gameOver, worldBounds, buildingPositions, viewHeight, viewWidth, checkTombstoneName, allTombstones } from "../app.js";
import { player } from "../player.js";
import Enemy from "../Enemies/enemy.js";

export class SceneOne extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneOne' });
    this.dialogBox = { visible: false }
  }

  preload() {
    this.load.image('tombstone1', './assets/tombstone1.png');
    this.load.image('tombstone2', './assets/tombstone2.png');
    this.load.image('tombstone3', './assets/tombstone3.png');
    this.load.image('tombstone4', './assets/tombstone4.png');
    this.load.image('tombstone5', './assets/tombstone5.png');
    this.load.image('fence_x', './assets/fence_x.png');
    this.load.image('fence_y', './assets/fence_y.png');
    this.load.image('crypt', './assets/crypt.png');
    this.load.image('dirt', './assets/dirt.png');
    this.load.image('dirt2', './assets/dirt.webp');
    this.load.image('star', './assets/star.png');
    this.load.image('rock', './assets/rock.png');
    this.load.image('potion', './assets/holy_water.png');
    this.load.image('shovel', './assets/shovel.png');
    this.load.image('key', './assets/Skeleton_Key.png');
    this.load.spritesheet('player', './assets/scared_little_girl.png', { frameWidth: 20, frameHeight: 29 });
    this.load.spritesheet('skeleton', './assets/skeleton.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('enemy', './assets/Wisp.png', { frameWidth: 32, frameHeight: 32 });
  }
  create() {
    // this.physics.world.createDebugGraphic();
    createCommonSceneElements(this);
    player.setupPlayerCreate(this);
    this.createWorldBorder(this, worldBounds);

    const buildings = this.physics.add.staticGroup();
    let coor = buildingPositions.find((b) => b.key === 'crypt');
    const crypt = buildings.create(coor.x, coor.y, 'crypt');

    crypt.setOrigin(0.5, 0.5).setDepth(-4);

    this.physics.add.collider(player.character, buildings, () => {
      if (!this.dialogBox.visible) {
        this.createDialogBox();
        this.showDialog('"LOCKED"\n\n\nYou have found the crypt. What secrets lie within?\n\n    Perhaps the clues lie beyond the grave.');
        this.pauseEnemies();
      }
    });
    this.physics.add.collider(player.character, tombstones, (character, tombstone) => {
      if (!this.dialogBox.visible) {
        this.createDialogBox();
        this.showDialog(tombstone.getData('rip'));
        this.pauseEnemies();
      }
    });

    this.cameras.main.startFollow(player.character);

    enemies.push(new Enemy(this, 3, 100, 1));
  }

  createDialogBox() {
    const camera = this.cameras.main;

    this.dialogBox = this.add.graphics();
    this.dialogBox.fillStyle(0x000000, .95);

    const dialogX = camera.worldView.x;
    const dialogY = camera.worldView.y;

    this.dialogBox.fillRect(dialogX + 100, dialogY + 100, viewWidth - 200, viewHeight - 200);
    this.dialogBox.lineStyle(5, 0xffffff);
    this.dialogBox.strokeRect(dialogX + 100, dialogY + 100, viewWidth - 200, viewHeight - 200);
    this.dialogText = this.add.text(dialogX + (viewWidth / 2) - 250, dialogY + (viewHeight / 2) - 50, '', { fontSize: '16px', fill: '#ffffff' });
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);


    this.input.keyboard.on('keydown', () => {
      this.hideDialog();
      this.resumeEnemies();
    });
  }

  showDialog(text) {
    this.dialogBox.setVisible(true);
    this.dialogText.setVisible(true).setText(text);
    player.setSpeed(0);
  }

  hideDialog() {
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    player.setSpeed(player.originalSpeed);
  }

  pauseEnemies() {
    enemies.forEach(enemy => {
      if (enemy && enemy.enemy) {
        enemy.savedVelocity = { x: enemy.enemy.body.velocity.x, y: enemy.enemy.body.velocity.y };
        enemy.setSpeed(0);
      }
    });
  }

  resumeEnemies() {
    enemies.forEach(enemy => {
      if (enemy && enemy.enemy && enemy.savedVelocity) {
        enemy.setSpeed(enemy.originalSpeed);
      }
    });
  }

  update() {
    if (!gameOver) {
      player.setupPlayerUpdate(this);
      enemies.forEach((enemy, index) => {
        if (enemy && enemy.enemy) {
          enemy.handleEnemy(this);
        } else {
          enemies.splice(index, 1);
        }
      })
    }
  }

  createWorldBorder(scene, worldBounds) {
    const borderWidth = 32;
    const borderHeight = 48;

    // Top border
    for (let x = 30; x < worldBounds.x - 64; x += borderWidth) {
      scene.add.image(x + borderWidth, borderHeight, 'fence_x').setOrigin(0.5, 0.5).setDepth(-5);
    }

    // Bottom border
    for (let x = 32; x < worldBounds.x - 64; x += borderWidth) {
      scene.add.image(x + borderWidth, worldBounds.x - borderHeight, 'fence_x').setOrigin(0.5, 0.5);
    }

    // Left border
    for (let y = 32; y < worldBounds.y - 64; y += borderHeight) {
      scene.add.image(borderWidth, y + borderHeight, 'fence_y').setOrigin(0.5, 0.5).setDepth(-5);
    }

    // Right border
    for (let y = 32; y < worldBounds.y - 64; y += borderHeight) {
      scene.add.image(worldBounds.y - borderWidth, y + borderHeight, 'fence_y').setOrigin(0.5, 0.5).setDepth(-5);
    }
  }

}