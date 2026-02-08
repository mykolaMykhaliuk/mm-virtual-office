/**
 * Application entry point.
 * Initializes the Game once the DOM is ready.
 *
 * Append ?debug to the URL to enable the on-screen error overlay.
 */

import { Game } from "./core/Game";
import { DebugOverlay } from "./core/DebugOverlay";

async function main(): Promise<void> {
  // Activate debug overlay when ?debug is in the URL
  if (DebugOverlay.isDebugMode()) {
    DebugOverlay.init();
  }

  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;

  if (!canvas) {
    console.error("Canvas element #renderCanvas not found.");
    return;
  }

  const game = new Game(canvas);

  try {
    await game.init();
  } catch (err) {
    console.error("Failed to initialize game:", err);

    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      const msg = loadingScreen.querySelector("p");
      if (msg) {
        msg.textContent = "Failed to load. Please refresh the page.";
        msg.style.color = "#ff6b6b";
      }
    }
  }
}

// Wait for DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
