import { StartScene } from './scenes/start.js';
import { SceneOne } from './scenes/level_1.js';
import { SceneTwo } from './scenes/level_2.js';
import { EndOneScene } from './scenes/end_1.js';

export let viewWidth = $(window).width()
export let viewHeight = $(window).height()

export let worldBounds = { x: 2048, y: 2048 }
export let tombstones;
export const setTombstones = (newTombstones) => {
  tombstones = newTombstones
}
export let allTombstones = [];
export let enemies = [];
export let score = 0;
export let scoreText;
export let gameOver;

export let buildingPositions = [{ key: 'crypt', x: 1024, y: 896 }]
const GRID_SIZE = 128;
const grid = Array.from({ length: worldBounds.x / GRID_SIZE }, () => Array(worldBounds.y / GRID_SIZE).fill(false));

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
  scene: [StartScene, SceneOne, EndOneScene, SceneTwo]
};

new Phaser.Game(config);

export const createCommonSceneElements = (scene) => {
  scene.physics.world.setBounds(48, 48, worldBounds.x - 72, worldBounds.y - 100);
  scene.cameras.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
  initializeGrid();
  scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
  scoreText.setScrollFactor(0);
}

export const updateScore = (newScore) => {
  score = newScore
  scoreText.setText('Score: ' + newScore);
}

const initializeGrid = () => {
  const crypt = buildingPositions.find((b) => b.key === 'crypt')
  const max = crypt.x / GRID_SIZE + 1
  const min = crypt.y / GRID_SIZE - 1
  for (let i = min; i < max; i++) {
    for (let j = min; j < max; j++) {
      markCellsOccupied(i, j)
    }
  }
};

export const markCellsOccupied = (row, col) => {
  if (grid[row]) {
    grid[row][col] = true;
  }
};

export const isCellOccupied = (row, col) => {
  return grid[row] ? grid[row][col] : false;
};
export const getGridCoordinates = (x, y) => {
  const row = Math.floor(y / GRID_SIZE);
  const col = Math.floor(x / GRID_SIZE);
  return { row, col };
};

export const handleVictory = () => {
  gameOver = true;
  updateScore('You Win!');
}

export const setGameOver = (gameBool) => {
  gameOver = gameBool;
}