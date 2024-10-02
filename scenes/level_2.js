
import { createCommonSceneElements, setTombstones, gameOver, enemies, worldBounds } from "../app.js";
import { player } from "../components/player.js";
import DialogBox from '../components/DialogBox.js';
import Slime from "../Enemies/Slime.js";
import { depthMap } from "../utils/constants.js";

let darkness;
let dimLight;
let countDown = 0;
let goalsHit = [];
let countdownTimer;
let countdownText;
const tileKeys = ['tile', 'tile1', 'tile2', 'tile3'];
const goalx = [96, 288, 384, 512, 704, 896, 640]
const goaly = [512, 768, 160, 352, 640, 64, 32]
const trapsx = [192, 512, 64, 224, 960, 32]
const trapsy = [192, 128, 768, 32, 384, 288]

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
    enemies.push(new Slime(this, 500, 10, .1));
    const jar = this.physics.add.staticGroup();
    const lightJar = jar.create(worldBounds.x - 50, worldBounds.y - 200, 'jar');
    this.physics.add.overlap(lightJar, player.character, () => {
      if (!player.hasTorch) {
        this.setTorchLighting()
      }
    }, null, this);
  }

  setTiles() {
    const goalTiles = this.physics.add.staticGroup();
    const trapTiles = this.physics.add.staticGroup();
    // Create the background with random tiles
    for (let x = -32; x < worldBounds.x; x += 32) {
      for (let y = -32; y < worldBounds.y; y += 32) {
        let selectedTile = Phaser.Utils.Array.GetRandom(tileKeys);
        this.add.image(x, y, selectedTile).setOrigin(0).setDepth(depthMap.background);
      }
    }

    for (let i = 0; i < goalx.length; i++) {
      const goalTile = goalTiles.create(goalx[i], goaly[i], 'tileGoal').setOrigin(0).setDepth(depthMap.background);
      goalTile.body.setSize(32, 32).setOffset(48, 48);
      goalTile.goalId = i;
    }
    for (let i = 0; i < trapsx.length; i++) {
      const trapTile = trapTiles.create(trapsx[i], trapsy[i], 'tileTrap').setOrigin(0).setDepth(depthMap.background);
      trapTile.body.setSize(32, 32).setOffset(48, 48);
    }


    this.physics.add.overlap(goalTiles, player.character, (player, goalTile) => {
      this.handleGoalTouch(goalTile.goalId);
    }, null, this);
    this.physics.add.overlap(trapTiles, player.character, (player, trapTile) => {
      this.handleTrapTouch();
    }, null, this);
  }

  handleTrapTouch() {
    player.handlePlayerDamaged(1)
  }

  handleGoalTouch(goalId) {
    if (goalsHit.find((goal) => goal == goalId) === undefined) {
      countDown += goalId < 4 ? goalId : 3
      goalsHit.push(goalId)
      if (goalsHit.length === 1) {
        countdownTimer = this.time.addEvent({
          delay: 1000,
          callback: this.updateCountdown,
          callbackScope: this,
          loop: true
        });
        countdownText = this.add.text(10, 10, countDown, {
          fontSize: '32px',
          fill: '#ffffff',
          fontFamily: 'Arial',
          align: 'center'
        });
        countdownText.setDepth(depthMap.iSeeYou).setScrollFactor(0);
      }
      if (goalsHit.length === goalx.length) {
        countdownText.setText('You did it!')
      }
      countdownText.setText(countDown);
    }
  }

  updateCountdown() {
    countDown--;
    countdownText.setText(countDown);
    if (countDown < 0) {
      countDown = 0
      goalsHit = []
      countdownTimer.remove();
      countdownText.destroy();
    }
  }

  setTorchLighting() {
    const torchMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    torchMaskShape.fillStyle(0xffffff);
    torchMaskShape.fillCircle(0, 0, 50);

    const torchMask = torchMaskShape.createGeometryMask();
    torchMask.invertAlpha = true;
    dimLight.setMask(torchMask);

    const dimLightMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    dimLightMaskShape.fillStyle(0xffffff);
    dimLightMaskShape.fillCircle(0, 0, 100);

    const dimLightMask = dimLightMaskShape.createGeometryMask();
    dimLightMask.invertAlpha = true;
    darkness.setMask(dimLightMask);

    this.events.on('update', () => {
      torchMaskShape.setPosition(player.character.x, player.character.y);
      dimLightMaskShape.setPosition(player.character.x, player.character.y);
    });

    player.hasTorch = true;
  }


  update() {
    if (!gameOver) {
      player.setupPlayerUpdate(this);
    }
  }
}
