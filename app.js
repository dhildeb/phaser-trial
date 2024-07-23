import HealthBar from './HPBar.js'
import Enemy from "./Enemies/enemy.js";
import skeleton from "./Enemies/Skeleton.js";
import { directionAngles } from "./utils/constants.js";

// Define global variables for game elements
let player;
export let playerDmg = 2;
export const setPlayerDmg = (dmg) => { playerDmg = dmg }
export let enemies = [];
let cursors;
let score = 0;
let scoreText;
let tombstones;
let allTombstones = [];
export let worldBounds = { x: 2500, y: 2500 }
let pressedKeys = {};

export let hpBar;
let gameOver;
export let attackVisual;
export const setWeapon = (wep, scaleX = 1, scaleY = 1) => {
  attackVisual.setTexture(wep)
  attackVisual.setScale(scaleX, scaleY)
}
let lastPressedKey = null;

let viewWidth = $(window).width()
let viewHeight = $(window).height()

var config = {
  type: Phaser.AUTO,
  width: viewWidth,
  height: viewHeight,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('tombstone', 'assets/tombstone.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('rock', 'assets/rock.png');
  this.load.image('potion', 'assets/star.png');
  this.load.image('shovel', 'assets/shovel.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('skeleton', 'assets/skeleton.png', { frameWidth: 64, frameHeight: 64 });
  this.load.spritesheet('enemy', 'assets/Wisp.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  tombstones = this.physics.add.staticGroup();
  generatetombstones();

  this.physics.add.collider(player, tombstones);

  hpBar = new HealthBar(this, player.x - 50, player.y - 50, 100);

  attackVisual = this.add.sprite(0, 0, 'rock');
  attackVisual.setVisible(false);
  attackVisual.setScale(.05);

  createPlayerAnimations(this);

  this.physics.world.setBounds(0, 0, worldBounds.x, worldBounds.y);
  this.cameras.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
  this.cameras.main.startFollow(player);

  // Input events
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown', function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        pressedKeys[event.code] = true;
        break;
    }
  });

  // Use the 'keyup' event to remove released arrow keys from pressedKeys
  this.input.keyboard.on('keyup', function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        delete pressedKeys[event.code]; // Remove released keys
        break;
    }
  });

  // Spawn initial enemy
  enemies.push(new Enemy(this, player, 3, 100, 1));

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
  scoreText.setScrollFactor(0);
  function generatetombstones() {
    for (let i = 0; i < 20; i++) {
      let x = Phaser.Math.Between(0, worldBounds.x);
      let y = Phaser.Math.Between(0, worldBounds.y);
      let tombstone = tombstones.create(x, y, 'tombstone');
      tombstone.setScale(0.1, 0.1).refreshBody();
      allTombstones.push(tombstone);
    }
  }
}

function update() {

  hpBar.setPosition(player.x - 50, player.y - 50);
  if (!gameOver) {
    handlePlayerMovement();
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      performAttack(this);
    }
    enemies.forEach((enemy, index) => {
      if (enemy && enemy.enemy) {
        enemy.handleEnemy(this);
      } else {
        enemies.splice(index, 1);
      }
    })
  }
}
function movePlayer(velocityX, velocityY, direction) {
  player.setVelocityX(velocityX);
  player.setVelocityY(velocityY);
  if (direction) {
    player.anims.play(direction, true);
    lastPressedKey = direction; // Update last pressed direction
  } else {
    player.setVelocity(0); // Stop the player if no keys are pressed
    player.anims.play('turn');
  }
}
function updateScore(score) {
  scoreText.setText('Score: ' + score);
}
function performAttack(scene) {
  let attackRangeX = player.x;
  let attackRangeY = player.y;

  switch (lastPressedKey) {
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

  attackVisual.setPosition(attackRangeX, attackRangeY);
  attackVisual.setVisible(true);
  const angle = directionAngles[lastPressedKey] || 0;
  attackVisual.setAngle(angle);
  setTimeout(() => {
    attackVisual.setVisible(false);
  }, 500);
  enemies.forEach((enemy) => {
    if (!enemy || !enemy.enemy) {
      return;
    }
    if (Phaser.Geom.Rectangle.ContainsPoint(enemy.getBounds(), new Phaser.Geom.Point(attackRangeX, attackRangeY))) {
      handleAttackHit(enemy, scene);
    }
  });
  tombstones.getChildren().forEach((tombstone) => {
    if (attackVisual.frame.texture.key !== 'shovel') {
      return;
    }
    if (Phaser.Geom.Intersects.RectangleToRectangle(attackVisual.getBounds(), tombstone.getBounds())) {
      handleTombstoneHit(tombstone);
    }
  });
}

function handleAttackHit(enemy, scene) {

  const isDead = enemy.handleAttackHit()
  if (!isDead) {
    return;
  }
  updateScore(++score);
  if (Math.random() < 0.3) {
    enemies.push(new skeleton(scene, player, 25, 75, 5))
  }

  respawnEnemy(scene);
}

function createPlayerAnimations(scene) {
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

// Function to handle player movement based on pressed keys
function handlePlayerMovement() {
  let velocityX = 0;
  let velocityY = 0;
  let direction = '';

  // Determine movement direction based on pressed keys
  if (pressedKeys['ArrowUp']) {
    velocityY = -200;
    direction += 'up';
  }
  if (pressedKeys['ArrowDown']) {
    velocityY = 200;
    direction += 'down';
  }
  if (pressedKeys['ArrowLeft']) {
    velocityX = -200;
    direction += 'left';
  }
  if (pressedKeys['ArrowRight']) {
    velocityX = 200;
    direction += 'right';
  }

  // Move player and play animation based on direction
  movePlayer(velocityX, velocityY, direction);
}

export function handlePlayerDamage(scene, dmg) {
  hpBar.setValue(hpBar.value - dmg);
  if (hpBar.value <= 0) {
    gameOver = true;
    updateScore('You Lose!');

    player.setTint(0xff0000);
    player.anims.play('turn');
  }
}

function respawnEnemy(scene) {
  setTimeout(() => {
    enemies.push(new Enemy(scene, player, 3, 100, 1))
  }, 1000);
}

function handleTombstoneHit(tombstone) {
  const index = allTombstones.indexOf(tombstone);
  tombstone.destroy()
  if (index > -1) {
    allTombstones.splice(index, 1);
  }
  if (allTombstones.length <= 0) {
    handleVictory()
  }
}

function handleVictory() {
  gameOver = true;
  updateScore('You Win!');
}