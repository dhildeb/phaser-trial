import HealthBar from './HPBar.js'
import Enemy from "./enemy.js";
import Potion from "./Item.js";

// Define global variables for game elements
let player;
let enemies = [];
let cursors;
let score = 0;
let scoreText;
let platforms;
let worldBounds = { x: 2500, y: 2500 }

export let playerHP = 100;
let hpBar;
let gameOver;
let bombVisual;
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
  this.load.image('platform', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.image('potion', 'assets/star.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('enemy', 'assets/Wisp.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  platforms = this.physics.add.staticGroup();
  // Generate platforms dynamically
  generatePlatforms(this);

  this.physics.add.collider(player, platforms);

  hpBar = new HealthBar(this, player.x - 50, player.y - 50, playerHP);

  bombVisual = this.add.sprite(0, 0, 'bomb');
  bombVisual.setVisible(false);
  bombVisual.setScale(2);

  createPlayerAnimations(this);

  // Set up world bounds and camera
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
        lastPressedKey = event.code; // Update last pressed key
        break;
    }
  });
  // Spawn initial enemy
  spawnEnemy(this);

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
  scoreText.setScrollFactor(0);
  // Function to generate platforms dynamically
  function generatePlatforms(scene) {
    // Example pattern for generating platforms
    for (let i = 0; i < 20; i++) {
      let x = Phaser.Math.Between(0, worldBounds.x); // Random x position within world bounds
      let y = Phaser.Math.Between(0, worldBounds.y); // Random y position within world bounds
      let platform = platforms.create(x, y, 'platform');
      platform.setScale(2, 2).refreshBody(); // Adjust the scale and refresh body
    }
  }
}

// Update function called every frame
function update() {

  hpBar.setPosition(player.x - 50, player.y - 50);
  // Check for input events
  if (!gameOver) {
    if (cursors.left.isDown) {
      player.setVelocityX(-200);
      player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(200);
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
      player.setVelocityY(200);
    } else {
      player.setVelocityY(0);
    }

    // Check for spacebar input to perform attack
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      performAttack(this);
    }
    enemies.forEach((enemy) => {
      enemy.handleEnemy(this);
    })
  }
}
function updateScore(score) {
  scoreText.setText('Score: ' + score);
}
function performAttack(scene) {
  let attackRangeX = player.x;
  let attackRangeY = player.y;


  // Define attack range in front of the player
  switch (lastPressedKey) {
    case 'ArrowUp':
      attackRangeY -= 50
      break
    case 'ArrowDown':
      attackRangeY += 50
      break
    case 'ArrowLeft':
      attackRangeX -= 50
      break
    case 'ArrowRight':
      attackRangeX += 50
      break
  }

  // Show bomb visual at player position
  bombVisual.setPosition(attackRangeX, attackRangeY);
  bombVisual.setVisible(true);

  // Hide bomb visual after a certain duration
  setTimeout(() => {
    bombVisual.setVisible(false);
  }, 500);

  enemies.forEach((enemy) => {
    if (Phaser.Geom.Rectangle.ContainsPoint(enemy.getBounds(), new Phaser.Geom.Point(attackRangeX, attackRangeY))) {
      handleAttackHit(enemy, scene);
    }
  });
}

function handleAttackHit(enemy, scene) {

  enemy.handleAttackHit()
  updateScore(++score);
  if (Math.random() < 0.3) {
    let potion = new Potion(scene, enemy.enemy.x, enemy.enemy.y);
    scene.physics.add.overlap(player, potion, () => {
      const newHP = potion.collect() + playerHP;
      hpBar.setValue(newHP > 100 ? 100 : newHP);
      playerHP = newHP > 100 ? 100 : newHP;
    }, null, scene);
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

export function handlePlayerDamage(scene, dmg) {
  playerHP -= dmg;
  hpBar.setValue(playerHP);
  if (playerHP <= 0) {
    gameOver = true;
    updateScore('You Lose!')

    player.setTint(0xff0000);
    player.anims.play('turn');
  }
}

function respawnEnemy(scene) {
  setTimeout(() => {
    spawnEnemy(scene);
  }, 1000);
}

function spawnEnemy(scene) {
  let newEnemy = new Enemy(scene, player)
  enemies.push(newEnemy);
}