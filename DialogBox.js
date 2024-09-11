import { viewHeight, viewWidth } from "../app.js";
import { resumeGame } from "./utils/enemiesHelper.js";

class DialogBox {
  constructor(scene) {
    this.scene = scene;
    this.dialogBox = scene.add.graphics();
    this.dialogText = scene.add.text(0, 0, '', { fontSize: '16px', fill: '#ffffff' });
    this.visible = false;
    this.keydownHandler;

    this.createDialogBox();
  }

  createDialogBox() {
    const camera = this.scene.cameras.main;

    this.dialogBox.fillStyle(0x000000, 0.95);

    const dialogX = camera.worldView.x + 100;
    const dialogY = camera.worldView.y + 100;

    this.dialogBox.fillRect(dialogX, dialogY, viewWidth - 200, viewHeight - 200);
    this.dialogBox.lineStyle(5, 0xffffff);
    this.dialogBox.strokeRect(dialogX, dialogY, viewWidth - 200, viewHeight - 200);

    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    this.dialogBox.setDepth(9999);
    this.dialogText.setDepth(9999);
  }

  updateDialogBoxPosition() {
    const camera = this.scene.cameras.main;
    const dialogX = camera.worldView.x + 100;
    const dialogY = camera.worldView.y + 100;

    this.dialogBox.clear();

    // Redraw the dialog box
    this.dialogBox.fillStyle(0x000000, 0.95);
    this.dialogBox.fillRect(dialogX, dialogY, viewWidth - 200, viewHeight - 200);
    this.dialogBox.lineStyle(5, 0xffffff);
    this.dialogBox.strokeRect(dialogX, dialogY, viewWidth - 200, viewHeight - 200);

    // Update text position
    this.dialogText.setPosition(
      camera.worldView.x + (viewWidth / 2) - 250,
      camera.worldView.y + (viewHeight / 2) - 50
    );
  }

  showDialog(text) {
    const handleKeydown = (event) => {
      this.hideDialog();
      resumeGame();
    };

    this.scene.input.keyboard.on('keydown', handleKeydown);

    this.updateDialogBoxPosition();
    this.dialogBox.setVisible(true);
    this.dialogText.setVisible(true).setText(text);

    const textBounds = this.dialogText.getBounds();
    const centeredX = this.scene.cameras.main.worldView.x + (viewWidth / 2) - (textBounds.width / 2);
    const centeredY = this.scene.cameras.main.worldView.y + (viewHeight / 2) - (textBounds.height / 2);
    this.dialogText.setPosition(centeredX, centeredY);

    this.visible = true;

    this.keydownHandler = handleKeydown;
  }

  hideDialog() {
    if (this.keydownHandler) {
      this.scene.input.keyboard.off('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    this.visible = false;
  }
}

export default DialogBox;
