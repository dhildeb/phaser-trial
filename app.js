import HealthBar from './HPBar.js'

// Define global variables for game elements
let player;
let enemies = [];
let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let scoreText;
let attackVisual; // Declare attack visual as a global variable
let playerHP = 100;
let hpBar;
let enemyHP = 100;
let gameOver;
let bombVisual;
let lastPressedKey = null;

let viewWidth = $(window).width()
let viewHeight = $(window).height()

// Phaser configuration and scene definition
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

// Initialize Phaser game instance
let game = new Phaser.Game(config);

// Preload assets
function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('enemy', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  // this.load.spritesheet('attackSpriteSheet', 'assets/attack_sprite_sheet.png', { frameWidth: 64, frameHeight: 64 });

}

// Create game elements and setup
function create() {
  // Create player sprite and set physics properties
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Create health bar for player and position it relative to player sprite
  hpBar = new HealthBar(this, player.x - 50, player.y - 50, playerHP);
  // Create bomb visual sprite
  bombVisual = this.add.sprite(0, 0, 'bomb');
  bombVisual.setVisible(false); // Hide by default
  bombVisual.setScale(2); // Scale as needed

  // Create animations for player
  createPlayerAnimations(this);

  // Set up world bounds and camera
  this.physics.world.setBounds(0, 0, 14000, 10000);
  this.cameras.main.setBounds(0, 0, 14000, 10000);
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
  // Spawn initial enemies
  spawnEnemy(this);
  spawnEnemy(this);

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
  scoreText.setScrollFactor(0);

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
  }
}
function updateScore(score) {
  scoreText.setText('Score: ' + score);
}
// Function to perform player attack
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
  }, 500); // Example: Hide after 500 milliseconds
  // Check if enemy overlaps with attack range
  // Check attack against each enemy in the array
  enemies.forEach((enemy) => {
    if (Phaser.Geom.Rectangle.ContainsPoint(enemy.getBounds(), new Phaser.Geom.Point(attackRangeX, attackRangeY))) {
      handleAttackHit(enemy, scene);
    }
  });
}

// Function to handle attack logic on enemy
function handleAttackHit(enemy, scene) {
  // Example: Reduce enemy health, play attack animation, etc.
  enemy.setTint(0xff0000); // Example: Tint enemy red

  setTimeout(() => {
    enemy.clearTint(); // Remove tint after a delay
  }, 200); // Example: Remove tint after 200 milliseconds

  // Remove enemy from array or perform other logic
  // For this example, we disable the enemy after being hit
  enemy.disableBody(true, true); // Disable enemy
  updateScore(++score);
  respawnEnemy(scene);
}



// Function to create animations for player
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

// Function to create animations for enemy
function createEnemyAnimations(scene) {
  scene.anims.create({
    key: 'left_enemy',
    frames: scene.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'turn_enemy',
    frames: [{ key: 'enemy', frame: 4 }],
    frameRate: 20
  });

  scene.anims.create({
    key: 'right_enemy',
    frames: scene.anims.generateFrameNumbers('enemy', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });
}

// Function to handle enemy behavior
function handleEnemy(scene, enemy, player) {
  // Create collision between enemy and player
  scene.physics.add.collider(enemy, player, enemyPlayerCollision, null, scene);

  function updateEnemyMovement() {
    const speed = 100;
    const distance = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));

    // Normalize the direction vector (unit vector)
    const directionX = (player.x - enemy.x) / distance;
    const directionY = (player.y - enemy.y) / distance;

    // Update enemy velocity based on direction towards the player
    enemy.setVelocityX(directionX * speed);
    enemy.setVelocityY(directionY * speed);

    // Play animation based on velocity
    if (directionX > 0) {
      enemy.anims.play('right_enemy', true);
    } else {
      enemy.anims.play('left_enemy', true);
    }
  }

  scene.events.on('update', updateEnemyMovement);
}

function enemyPlayerCollision(enemy, player, scene) {
  // Example: Handle collision between enemy and player
  enemy.setTint(0xff0000); // Example: Tint enemy red

  setTimeout(() => {
    enemy.clearTint(); // Remove tint after a delay
  }, 200); // Example: Remove tint after 200 milliseconds

  // Example: Reduce player health or perform other actions
  // For this example, we'll reduce player health
  handlePlayerDamage(scene);
}


function handlePlayerDamage(scene) {
  playerHP--;
  hpBar.setValue(playerHP);
  console.log('Player was hit!');
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
  }, 1000); // Example: Respawn after 1 second (adjust timing as needed)
}


function spawnEnemy(scene) {
  let newEnemy = scene.physics.add.sprite(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 300), 'enemy');
  newEnemy.setBounce(0.2);
  newEnemy.setCollideWorldBounds(true);

  // Add animations for the enemy (if needed)
  createEnemyAnimations(scene);

  // Add enemy to the enemies array
  enemies.push(newEnemy);

  // Handle enemy behavior
  handleEnemy(scene, newEnemy, player);
}