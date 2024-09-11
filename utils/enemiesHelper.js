import { enemies } from "../app.js";
import { player } from "../player.js";

export function pauseGame() {
  enemies.forEach(enemy => {
    if (enemy && enemy.enemy) {
      enemy.savedVelocity = { x: enemy.enemy.body.velocity.x, y: enemy.enemy.body.velocity.y };
      enemy.setSpeed(0);
    }
  });
  player.setSpeed(0)

}

export function resumeGame() {
  enemies.forEach(enemy => {
    if (enemy && enemy.enemy && enemy.savedVelocity) {
      enemy.setSpeed(enemy.originalSpeed);
    }
  });
  player.setSpeed(player.originalSpeed)
}