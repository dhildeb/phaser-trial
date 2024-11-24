
import { createCommonSceneElements, setTombstones, gameOver, enemies, worldBounds } from "../app.js";
import { player } from "../components/player.js";
import DialogBox from '../components/DialogBox.js';
import Slime from "../Enemies/Slime.js";
import Ghost from "../Enemies/Ghost.js";
import { depthMap } from "../utils/constants.js";

const tileKeys = ['tile', 'tile1', 'tile2', 'tile3'];

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
    this.load.image('tile', './assets/tile.png');
    this.load.image('tile1', './assets/tile_1.png');
    this.load.image('tile2', './assets/tile_2.png');
    this.load.image('tile3', './assets/tile_3.png');
    this.load.spritesheet('player', './assets/scared_little_girl.png', { frameWidth: 20, frameHeight: 29 });
    this.load.spritesheet('slime', './assets/slime.png', { frameWidth: 32, frameHeight: 25 });
    this.load.spritesheet('enemy', './assets/Wisp.png', { frameWidth: 32, frameHeight: 32 });
    worldBounds.x = 1024
    worldBounds.y = 512
  }
  create() {
    player.setScene(this)
    this.dialogBox = new DialogBox(this);

    createCommonSceneElements(this);
    setTombstones(this.physics.add.staticGroup())
    player.character = this.physics.add.sprite(worldBounds.x / 2, worldBounds.y - 50, 'player');
    this.setTiles()
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

  setTiles() {
    for (let x = -32; x < worldBounds.x; x += 32) {
      for (let y = -32; y < worldBounds.y; y += 32) {
        let selectedTile = Phaser.Utils.Array.GetRandom(tileKeys);
        this.add.image(x, y, selectedTile).setOrigin(0).setDepth(depthMap.background);
      }
    }
  }
}
