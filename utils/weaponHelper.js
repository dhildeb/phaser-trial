export function getWepStartPos(x, y, lastPressedKey, wepType) {
  let wepStartX = x;
  let wepStartY = y;

  if (wepType === 'rock') {
    return { wepStartX, wepStartY }
  }

  switch (lastPressedKey) {
    case 'up':
      wepStartY -= 50;
      break;
    case 'down':
      wepStartY += 50;
      break;
    case 'left':
      wepStartX -= 50;
      break;
    case 'right':
      wepStartX += 50;
      break;
    case 'upleft':
      wepStartX -= 50;
      wepStartY -= 50
      break;
    case 'upright':
      wepStartX += 50
      wepStartY -= 50
      break;
    case 'downleft':
      wepStartX -= 50
      wepStartY += 50
      break;
    case 'downright':
      wepStartX += 50
      wepStartY += 50
      break;
    default:
      return;
  }

  return { wepStartX, wepStartY }
}

export function getWepRangePos(x, y, lastPressedKey, wepType, powerLevel) {
  let attackRangeX = x;
  let attackRangeY = y;

  if (wepType === 'rock') {
    switch (lastPressedKey) {
      case 'up':
        attackRangeY -= powerLevel;
        break;
      case 'down':
        attackRangeY += powerLevel;
        break;
      case 'left':
        attackRangeX -= powerLevel;
        break;
      case 'right':
        attackRangeX += powerLevel;
        break;
      case 'upleft':
        attackRangeX -= powerLevel;
        attackRangeY -= powerLevel;
        break;
      case 'upright':
        attackRangeX += powerLevel;
        attackRangeY -= powerLevel;
        break;
      case 'downleft':
        attackRangeX -= powerLevel;
        attackRangeY += powerLevel;
        break;
      case 'downright':
        attackRangeX += powerLevel;
        attackRangeY += powerLevel;
        break;
      default:
        return;
    }
    return { attackRangeX, attackRangeY }
  }

  switch (lastPressedKey) {
    case 'up':
      attackRangeX -= 20
      break;
    case 'down':
      attackRangeX -= 20;
      break;
    case 'left':
      attackRangeY -= 20;
      break;
    case 'right':
      attackRangeY -= 20;
      break;
    case 'upleft':
      attackRangeX -= 20;
      attackRangeY -= 20
      break;
    case 'upright':
      attackRangeX += 20
      attackRangeY -= 20
      break;
    case 'downleft':
      attackRangeX -= 20
      attackRangeY += 20
      break;
    case 'downright':
      attackRangeX -= 20
      attackRangeY += 20
      break;
    default:
      return;
  }

  return { attackRangeX, attackRangeY }
}
