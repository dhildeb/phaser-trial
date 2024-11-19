
import { createCommonSceneElements, setTombstones, gameOver, enemies, worldBounds } from "../app.js";
import { player } from "../components/player.js";
import DialogBox from '../components/DialogBox.js';
import Slime from "../Enemies/Slime.js";
import Ghost from "../Enemies/Ghost.js";

export class SceneFour extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneFour' });
    this.dialogBox = { visible: false }
  }

  preload() {
    this.load.image('rock', './assets/rock.png');
    this.load.image('potion', './assets/holy_water.png');
    this.load.image('jar', './assets/jar.png');
    this.load.image('shovel', './assets/shovel.png');
    this.load.image('torch', './assets/Torch_Gif.gif');
    this.load.spritesheet('player', './assets/scared_little_girl.png', { frameWidth: 20, frameHeight: 29 });
    this.load.spritesheet('slime', './assets/slime.png', { frameWidth: 32, frameHeight: 25 });
    this.load.spritesheet('enemy', './assets/Wisp.png', { frameWidth: 32, frameHeight: 32 });
    worldBounds.x = 1024//4086
    worldBounds.y = 1024//4086
  }
  create() {
    player.setScene(this)
    this.dialogBox = new DialogBox(this);

    createCommonSceneElements(this);
    setTombstones(this.physics.add.staticGroup())
    player.character = this.physics.add.sprite(worldBounds.x / 2, worldBounds.y - 50, 'player');
    player.setupPlayerCreate(this);

    this.cameras.main.startFollow(player.character);
    enemies.push(new Slime(this, 500, 10, 0));
    enemies.push(new Ghost(this, 100, player.speed * 1.5, 0));
  }

  update() {
    if (!gameOver) {
      player.setupPlayerUpdate(this);
    }
  }
}
