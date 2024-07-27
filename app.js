import { StartScene } from './scenes/start.js';
import { SceneOne } from './scenes/level_1.js';

let viewWidth = $(window).width()
let viewHeight = $(window).height()

export let worldBounds = { x: 2500, y: 2500 }

export let enemies = [];
export let score = 0;
export let scoreText;
export let gameOver;
export let tombstones;
export let allTombstones = [];

document.body.style.overflow = 'hidden';

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
  scene: [StartScene, SceneOne]
};

new Phaser.Game(config);

export const createCommonSceneElements = (scene) => {
  scene.physics.world.setBounds(0, 0, worldBounds.x, worldBounds.y);
  scene.cameras.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
  generatetombstones(scene);
  scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
  scoreText.setScrollFactor(0);
}

export const updateScore = (score) => {
  scoreText.setText('Score: ' + score);
}

export const setTombstones = (tombstones) => {
  tombstones = tombstones
}

export const generatetombstones = (scene) => {
  tombstones = scene.physics.add.staticGroup()
  for (let i = 0; i < 20; i++) {
    let x = Phaser.Math.Between(0, worldBounds.x);
    let y = Phaser.Math.Between(0, worldBounds.y);
    let tombstone = tombstones.create(x, y, 'tombstone');
    tombstone.setScale(0.1, 0.1).refreshBody();
    allTombstones.push(tombstone);
  }
}

export const handleVictory = () => {
  gameOver = true;
  updateScore('You Win!');
}

export const setGameOver = (gameBool) => {
  gameOver = gameBool;
}