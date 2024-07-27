import { StartScene } from './scenes/start.js';
import { SceneOne } from './scenes/level_1.js';
import { EndOneScene } from './scenes/end_1.js';

let viewWidth = $(window).width()
let viewHeight = $(window).height()

export let worldBounds = { x: 2000, y: 2000 }

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
  scene: [StartScene, SceneOne, EndOneScene]
};

new Phaser.Game(config);

export const createCommonSceneElements = (scene) => {
  scene.physics.world.setBounds(0, 0, worldBounds.x, worldBounds.y);
  scene.cameras.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
  generatetombstones(scene);
  scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
  scoreText.setScrollFactor(0);
}

export const updateScore = (newScore) => {
  score = newScore
  scoreText.setText('Score: ' + newScore);
}

export const setTombstones = (tombstones) => {
  tombstones = tombstones
}

export const generatetombstones = (scene) => {
  tombstones = scene.physics.add.staticGroup()
  for (let i = 0; i < 20; i++) {
    let x = Phaser.Math.Between(0, worldBounds.x);
    let y = Phaser.Math.Between(0, worldBounds.y);
    const rand = Math.random();
    let tombstone = tombstones.create(x, y, `tombstone${Math.floor(Math.random() * 5) + 1}`);
    tombstone.setScale(1.5).refreshBody();
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