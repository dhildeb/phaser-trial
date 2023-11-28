import { enemy } from "./app.js";
export function handleEnemy(game, platforms) {
  enemy.setBounce(0.2);
  enemy.setCollideWorldBounds(true);

  game.anims.create({
    key: 'left',
    frames: game.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  game.anims.create({
    key: 'turn',
    frames: [{ key: 'enemy', frame: 4 }],
    frameRate: 20
  });

  game.anims.create({
    key: 'right',
    frames: game.anims.generateFrameNumbers('enemy', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  game.physics.add.collider(enemy, platforms);

}