
import { createCommonSceneElements, setTombstones, gameOver, enemies, worldBounds } from "../app.js";
import { player } from "../player.js";
import DialogBox from '../DialogBox.js';
import Slime from "../Enemies/Slime.js";

export class SceneTwo extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneTwo' });
    this.dialogBox = { visible: false }
  }

  preload() {
    this.load.image('rock', './assets/rock.png');
    this.load.image('potion', './assets/holy_water.png');
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
    player.setupPlayerCreate(this);

    this.cameras.main.startFollow(player.character);
    enemies.push(new Slime(this, 500, 10, .1));
  }

  update() {
    if (!gameOver) {
      player.setupPlayerUpdate(this);
    }
  }
}
