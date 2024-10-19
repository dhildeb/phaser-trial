import { depthMap } from "../utils/constants.js";

class Inventory {
  constructor(scene, items = []) {
    this.scene = scene; // Reference to the Phaser scene
    this.items = [...items]; // List of items in the inventory
    this.capacity = 10; // Maximum number of items
    this.selectedIndex = 0; // Currently selected item index
    this.inventoryGraphics = []; // Array to hold visual representations
    this.inventoryBox = null; // Graphics for the inventory background
    this.isOpen = false;
  }

  // Add item to inventory if there's space
  addItem(item) {
    if (this.items.length < this.capacity) {
      this.items.push(item);
      console.log(`${item} added to inventory.`);
    } else {
      console.log("Inventory is full!");
    }
  }

  // Remove item from inventory by name or reference
  removeItem(itemName) {
    const index = this.items.findIndex(item => item === itemName);
    if (index > -1) {
      this.items.splice(index, 1);
      this.createVisualInventory(); // Update visuals after removing
      console.log(`${itemName} removed from inventory.`);
    } else {
      console.log(`${itemName} not found in inventory.`);
    }
  }

  // Create the visual representation of the inventory
  createVisualInventory() {
    this.clearVisualInventory();

    if (!this.inventoryBox) {
      this.inventoryBox = this.scene.add.graphics();
    }
    this.inventoryBox.clear();

    const camera = this.scene.cameras.main;
    const dialogX = camera.worldView.x + 100;
    const dialogY = camera.worldView.y + 100;
    const boxWidth = 400;
    const boxHeight = 300;

    // Draw the background box
    this.inventoryBox.fillStyle(0x000000, 0.75);
    this.inventoryBox.fillRect(dialogX, dialogY, boxWidth, boxHeight);
    this.inventoryBox.lineStyle(2, 0xffffff);
    this.inventoryBox.strokeRect(dialogX, dialogY, boxWidth, boxHeight);
    this.inventoryBox.setDepth(depthMap.iSeeYou)
    const startX = dialogX + 20;
    const startY = dialogY + 20;
    const spacing = 30;

    // Loop through items and display them
    this.items.forEach((item, index) => {
      let itemImage = this.scene.add.image(startX + index * spacing, startY, item.img);

      itemImage.setScale(item.xScale, item.yScale)
        .setTint(this.selectedIndex === index ? 0x00FF00 : 0xFFFFFF)
        .setDepth(depthMap.iSeeYou);
      this.inventoryGraphics.push(itemImage);
    });

  }

  selectNextItem() {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    this.updateVisualSelection();
  }

  selectPreviousItem() {
    this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
    this.updateVisualSelection();
  }

  // Update the visual highlight based on the selected index
  updateVisualSelection() {
    this.inventoryGraphics.forEach((graphic, index) => {
      if (this.selectedIndex === index) {
        graphic.setTint(0x00FF00); // Highlight selected item (green tint)
      } else {
        graphic.clearTint(); // Remove tint from non-selected items
      }
    });
  }

  // Clear visual inventory display
  clearVisualInventory() {
    if (this.inventoryBox) {
      this.inventoryBox.clear(); // Clear the box graphics
    }
    this.inventoryGraphics.forEach(graphic => graphic.destroy()); // Remove old graphics
    this.inventoryGraphics = [];
  }

  // Get the currently selected item
  getSelectedItem() {
    return this.items[this.selectedIndex];
  }
}

export default Inventory;
