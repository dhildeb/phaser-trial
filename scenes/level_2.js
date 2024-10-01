
import { createCommonSceneElements, setTombstones, gameOver, enemies, worldBounds } from "../app.js";
import { player } from "../components/player.js";
import DialogBox from '../components/DialogBox.js';
import Slime from "../Enemies/Slime.js";
import { depthMap } from "../utils/constants.js";

let darkness;

export class SceneTwo extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneTwo' });
    this.dialogBox = { visible: false }
  }

  preload() {
    this.load.image('rock', './assets/rock.png');
    this.load.image('potion', './assets/holy_water.png');
    this.load.image('jar', './assets/jar.png');
    this.load.image('shovel', './assets/shovel.png');
    this.load.spritesheet('player', './assets/scared_little_girl.png', { frameWidth: 20, frameHeight: 29 });
    this.load.spritesheet('slime', './assets/slime.png', { frameWidth: 32, frameHeight: 25 });
    worldBounds.x = 1024
    worldBounds.y = 1024
  }
  create() {
    player.setScene(this)
    this.dialogBox = new DialogBox(this);

    createCommonSceneElements(this);
    setTombstones(this.physics.add.staticGroup())
    player.character = this.physics.add.sprite(worldBounds.x / 2, worldBounds.y - 50, 'player');
    player.setupPlayerCreate(this);

    // Create a dark overlay
    darkness = this.add.graphics();
    darkness.fillStyle(0x000000);  // Dark color with some transparency
    darkness.fillRect(0, 0, worldBounds.x, worldBounds.y - 250);
    darkness.fillStyle(0x000000, .8);  // Dark color with some transparency
    darkness.fillRect(0, 0, worldBounds.x, worldBounds.y + 250);
    darkness.setDepth(depthMap.iSeeYou - 1);

    this.cameras.main.startFollow(player.character);
    enemies.push(new Slime(this, 500, 10, .1));
    enemies.push(new Slime(this, 500, 10, .1));
    enemies.push(new Slime(this, 500, 10, .1));
    const jar = this.physics.add.staticGroup();
    const lightJar = jar.create(worldBounds.x - 50, worldBounds.y - 200, 'jar');
    this.physics.add.overlap(lightJar, player.character, () => {
      if (!player.hasTorch) {
        this.setTorchLighting()
      }
    }, null, this);
  }

  setTorchLighting() {
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillCircle(0, 0, 75);

    const mask = maskShape.createGeometryMask();
    mask.invertAlpha = true;

    darkness.setMask(mask);

    this.events.on('update', () => {
      maskShape.setPosition(player.character.x, player.character.y);
    });
    player.hasTorch = true
  }

  update() {
    if (!gameOver) {
      player.setupPlayerUpdate(this);
    }
  }
}
