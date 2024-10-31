
import { createCommonSceneElements, getGridCoordinates, isCellOccupied, markCellsOccupied, tombstones, setTombstones, allTombstones, enemies, gameOver, worldBounds, buildingPositions } from "../app.js";
import { player } from "../components/player.js";
import Enemy from "../Enemies/Enemy.js";
import DialogBox from '../components/DialogBox.js';
import { pauseGame } from '../utils/enemiesHelper.js'
import { depthMap, headstoneRips } from "../utils/constants.js";


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

    player.setScene(this)
    this.dialogBox = new DialogBox(this);

    createCommonSceneElements(this, { x: 72, y: 100 });
    generatetombstones(this);
    player.character = this.physics.add.sprite(worldBounds.x / 2, worldBounds.y / 2, 'player');
    player.setupPlayerCreate(this);
    this.createWorldBorder(this, worldBounds);

    const buildings = this.physics.add.staticGroup();
    let coor = buildingPositions.find((b) => b.key === 'crypt');
    const crypt = buildings.create(coor.x, coor.y, 'crypt');

    crypt.setOrigin(0.5, 0.5).setDepth(depthMap.base);

    this.physics.add.collider(player.character, buildings, () => {
      if (!this.dialogBox.visible) {
        this.dialogBox.showDialog('"LOCKED"\n\n\nYou have found the crypt. What secrets lie within?\n\n    Perhaps the clues lie beyond the grave.');
        pauseGame();
      }
    });
    this.physics.add.collider(player.character, tombstones, (character, tombstone) => {
      if (!this.dialogBox.visible) {
        this.dialogBox.showDialog(tombstone.getData('rip'));
        pauseGame();
      }
    });

    this.cameras.main.startFollow(player.character);

    enemies.push(new Enemy(this, 3, 100, .5));
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
      scene.add.image(x + borderWidth, borderHeight, 'fence_x').setOrigin(0.5, 0.5).setDepth(depthMap.base);
    }

    // Bottom border
    for (let x = 32; x < worldBounds.x - 64; x += borderWidth) {
      scene.add.image(x + borderWidth, worldBounds.x - borderHeight, 'fence_x').setOrigin(0.5, 0.5);
    }

    // Left border
    for (let y = 32; y < worldBounds.y - 64; y += borderHeight) {
      scene.add.image(borderWidth, y + borderHeight, 'fence_y').setOrigin(0.5, 0.5).setDepth(depthMap.base);
    }

    // Right border
    for (let y = 32; y < worldBounds.y - 64; y += borderHeight) {
      scene.add.image(worldBounds.y - borderWidth, y + borderHeight, 'fence_y').setOrigin(0.5, 0.5).setDepth(depthMap.base);
    }
  }

}

export const generatetombstones = (scene) => {
  setTombstones(scene.physics.add.staticGroup())
  let x, y, row, col, isValid;

  for (let i = 0; i < 20; i++) {
    do {
      x = Phaser.Math.Between(128, worldBounds.x - 128);
      y = Phaser.Math.Between(128, worldBounds.y - 128);
      ({ row, col } = getGridCoordinates(x, y));
      isValid = !isCellOccupied(row, col);
    } while (!isValid);

    let tombstone = tombstones.create(x, y, `tombstone${Math.floor(Math.random() * 5) + 1}`);
    tombstone.setScale(1.5).refreshBody();
    tombstone.setData('rip', headstoneRips[i]);

    markCellsOccupied(row, col);
    allTombstones.push(tombstone);
  }
};

export function checkTombstoneName(tombstone) {
  console.log(tombstone.getData('name'))
  allTombstones.forEach(tombstone => {
    // console.log('Tombstone name:', tombstone.getData('name'));
  });
}


export const addBuilding = (scene, x, y, key) => {
  const building = scene.physics.add.staticGroup().create(x, y, key);
  markCellsOccupied(x, y, building.displayWidth, building.displayHeight);
  return building;
};
