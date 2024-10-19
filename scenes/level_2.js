
import { createCommonSceneElements, setTombstones, gameOver, enemies, worldBounds } from "../app.js";
import { player } from "../components/player.js";
import DialogBox from '../components/DialogBox.js';
import Slime from "../Enemies/Slime.js";
import { depthMap, Items } from "../utils/constants.js";

let darkness;
let dimLight;
let currentRunes = '';
let goalsHit = [];
let displayRuneText;
const tileKeys = ['tile', 'tile1', 'tile2', 'tile3'];
const runes = ['manea', 'prantika', 'amaia']
const choosenRune = Phaser.Utils.Array.GetRandom(runes)
const otherRunes = ['r', '⎝', 'ϓ', 'd', 'o', '₷', 'f', 'g', 'l', 'c', 'b', '*', '~', 'ʘ', 'ʖ', 'ɘ', 'Φ', 'Σ', 'Ϟ', 'Ϯ', '₪', '↫', '≋', '⎎', 's', 'h', 'c', '☥', 'u', '⚔']
function generateValues(count) {
  const values = [];
  for (let i = 0; i < count; i++) {
    const value = Phaser.Math.Between(1, 32) * 32;
    values.push(value);
  }
  return values;
}

const goalx = generateValues(choosenRune.length)
const goaly = generateValues(choosenRune.length)
const trapsx = generateValues(12)
const trapsy = generateValues(12)
console.log(goalx)
let goalTiles;
let trapTiles;
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
    this.load.image('torch', './assets/Torch_Gif.gif');
    this.load.image('tile', './assets/tile.png');
    this.load.image('tile1', './assets/tile_1.png');
    this.load.image('tile2', './assets/tile_2.png');
    this.load.image('tile3', './assets/tile_3.png');
    this.load.image('tileGoal', './assets/tile_goal.png');
    this.load.image('tileTrap', './assets/tile_trap.png');
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
    this.setTiles()

    // Create a dark overlay
    darkness = this.add.graphics();
    darkness.fillStyle(0x000000);
    darkness.fillRect(0, 0, worldBounds.x, worldBounds.y - 250);
    darkness.setDepth(depthMap.iSeeYou - 1);

    dimLight = this.add.graphics();
    dimLight.fillStyle(0x000000, .8);
    dimLight.fillRect(0, 0, worldBounds.x, worldBounds.y + 250);
    dimLight.setDepth(depthMap.iSeeYou - 1);

    this.cameras.main.startFollow(player.character);
    enemies.push(new Slime(this, 500, 10, .1));
    enemies.push(new Slime(this, 500, 10, .1));
    enemies.push(new Slime(this, 500, 10, .1));
    enemies.push(new Slime(this, 500, 10, .1));
    enemies.push(new Slime(this, 500, 10, .1));
    const jar = this.physics.add.staticGroup();
    const lightJar = jar.create(worldBounds.x - 50, worldBounds.y - 200, 'jar');
    this.physics.add.overlap(lightJar, player.character, () => {
      if (!player.hasTorch) {
        this.setTorchLighting()
        player.hasTorch = true;
        player.collectItem(Items.torch)
      }
    }, null, this);
    displayRuneText = this.add.text(10, 10, currentRunes, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Cinzel Decorative',
      align: 'center'
    });
  }

  setTiles() {
    goalTiles = this.physics.add.staticGroup();
    trapTiles = this.physics.add.staticGroup();
    // Create the background with random tiles
    for (let x = -32; x < worldBounds.x; x += 32) {
      for (let y = -32; y < worldBounds.y; y += 32) {
        let selectedTile = Phaser.Utils.Array.GetRandom(tileKeys);
        this.add.image(x, y, selectedTile).setOrigin(0).setDepth(depthMap.background);
      }
    }
    // Set Goal tiles
    for (let i = 0; i < [...choosenRune].length; i++) {
      const goalTile = goalTiles.create(goalx[i], goaly[i], Phaser.Utils.Array.GetRandom(tileKeys)).setOrigin(0).setDepth(depthMap.background);
      goalTile.body.setSize(32, 32).setOffset(48, 48);
      goalTile.goalId = i;
      goalTile.rune = [...choosenRune][i]
      const text = this.add.text(goalTile.x + 24, goalTile.y + 17, [...choosenRune][i], { fontSize: '22px', color: '#ff0000', fontFamily: 'Cinzel Decorative', align: 'center' })
        .setDepth(depthMap.background);
    }
    // Set trap tiles
    for (let i = 0; i < trapsx.length; i++) {
      const trapTile = trapTiles.create(trapsx[i], trapsy[i], Phaser.Utils.Array.GetRandom(tileKeys)).setOrigin(0).setDepth(depthMap.background);
      trapTile.body.setSize(32, 32).setOffset(48, 48);
      const text = this.add.text(trapTile.x + 24, trapTile.y + 16, Phaser.Utils.Array.GetRandom(otherRunes), { fontSize: '22px', color: '#ff0000', fontFamily: 'Cinzel Decorative', align: 'center' })
        .setDepth(depthMap.background);
    }


    this.physics.add.overlap(goalTiles, player.character, (player, goalTile) => {
      this.handleGoalTouch(goalTile);
    }, null, this);
    this.physics.add.overlap(trapTiles, player.character, (player, trapTile) => {
      this.handleTrapTouch();
    }, null, this);
  }

  handleGoalTouch(tile) {
    if (!tile.touched && [...choosenRune][currentRunes.length] === tile.rune) {
      currentRunes += tile.rune
      displayRuneText.setDepth(depthMap.iSeeYou).setScrollFactor(0);
      tile.touched = true
      displayRuneText.setText(currentRunes);
    }
    if (currentRunes === choosenRune) {
      displayRuneText.setText('You did it!')
    }
  }

  handleTrapTouch() {
    if (currentRunes.length > 0) {
      currentRunes = ''
      goalTiles.children.entries.forEach(tile => tile.touched = false);
      player.handlePlayerDamaged(5)
      displayRuneText.setText(currentRunes);
    }
  }

  setTorchLighting() {
    const torchMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    torchMaskShape.fillStyle(0xffffff);
    torchMaskShape.fillCircle(0, 0, 75);

    const torchMask = torchMaskShape.createGeometryMask();
    torchMask.invertAlpha = true;
    dimLight.setMask(torchMask);

    const dimLightMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    dimLightMaskShape.fillStyle(0xffffff);
    dimLightMaskShape.fillCircle(0, 0, 225);

    const dimLightMask = dimLightMaskShape.createGeometryMask();
    dimLightMask.invertAlpha = true;
    darkness.setMask(dimLightMask);

    this.events.on('update', () => {
      torchMaskShape.setPosition(player.character.x, player.character.y);
      dimLightMaskShape.setPosition(player.character.x, player.character.y);
    });
  }


  update() {
    if (!gameOver) {
      player.setupPlayerUpdate(this);
    }
  }
}
