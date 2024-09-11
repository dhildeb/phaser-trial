import { StartScene } from './scenes/start.js';
import { SceneOne } from './scenes/level_1.js';
import { EndOneScene } from './scenes/end_1.js';
import { headstoneRips } from "./utils/constants.js";

export let viewWidth = $(window).width()
export let viewHeight = $(window).height()

export let worldBounds = { x: 2048, y: 2048 }

export let enemies = [];
export let score = 0;
export let scoreText;
export let gameOver;
export let tombstones;
export let allTombstones = [];
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
  scene: [StartScene, SceneOne, EndOneScene]
};

new Phaser.Game(config);

export const createCommonSceneElements = (scene) => {
  scene.physics.world.setBounds(48, 48, worldBounds.x - 72, worldBounds.y - 100);
  scene.cameras.main.setBounds(0, 0, worldBounds.x, worldBounds.y);
  initializeGrid();
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

const markCellsOccupied = (row, col) => {
  if (grid[row]) {
    grid[row][col] = true;
  }
};

const isCellOccupied = (row, col) => {
  return grid[row] ? grid[row][col] : false;
};
const getGridCoordinates = (x, y) => {
  const row = Math.floor(y / GRID_SIZE);
  const col = Math.floor(x / GRID_SIZE);
  return { row, col };
};

export const generatetombstones = (scene) => {
  tombstones = scene.physics.add.staticGroup();
  let x, y, row, col, isValid;

  for (let i = 0; i < 20; i++) {
    do {
      x = Phaser.Math.Between(128, worldBounds.x - 128);
      y = Phaser.Math.Between(128, worldBounds.y - 128);
      ({ row, col } = getGridCoordinates(x, y));
      isValid = !isCellOccupied(row, col);
    } while (!isValid);

    let tombstone = tombstones.create(x, y, `tombstone${Math.floor(Math.random() * 5) + 1}`);
    tombstone.setScale(1.5).refreshBody();
    tombstone.setData('rip', headstoneRips[i]);

    markCellsOccupied(row, col);
    allTombstones.push(tombstone);
  }
};

export function checkTombstoneName(tombstone) {
  console.log(tombstone.getData('name'))
  allTombstones.forEach(tombstone => {
    // console.log('Tombstone name:', tombstone.getData('name'));
  });
}


export const addBuilding = (scene, x, y, key) => {
  const building = scene.physics.add.staticGroup().create(x, y, key);
  markCellsOccupied(x, y, building.displayWidth, building.displayHeight);
  return building;
};

export const handleVictory = () => {
  gameOver = true;
  updateScore('You Win!');
}

export const setGameOver = (gameBool) => {
  gameOver = gameBool;
}