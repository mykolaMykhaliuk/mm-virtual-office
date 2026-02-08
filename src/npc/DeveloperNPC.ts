/**
 * Developer NPC — the office owner, sitting at a triple-monitor desk.
 * Only available for meaningful interaction after clearance is granted.
 */

import { Scene } from "@babylonjs/core/scene";
import { GameState } from "../core/GameState";
import { NPCBase } from "./NPCBase";
import { DialogueTree } from "../dialogue/DialogueStateMachine";
import {
  getDeveloperDialogue,
  getDeveloperNoClearanceDialogue,
} from "../dialogue/DialogueData";

export class DeveloperNPC extends NPCBase {
  constructor(scene: Scene, gameState: GameState) {
    super("developer", "Developer", scene, gameState);
  }

  get interactionLabel(): string {
    if (!this.gameState.get("clearanceGranted")) {
      return "The developer seems busy...";
    }
    return "Talk to Developer";
  }

  canInteract(): boolean {
    return true; // Always interactable, but dialogue differs
  }

  getDialogueTree(): DialogueTree {
    if (this.gameState.get("clearanceGranted")) {
      return getDeveloperDialogue();
    }
    return getDeveloperNoClearanceDialogue();
  }
}
