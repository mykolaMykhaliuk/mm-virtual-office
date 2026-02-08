/**
 * Secretary NPC — gatekeeper near the entrance.
 * Handles visitor identification and grants clearance to meet the developer.
 */

import { Scene } from "@babylonjs/core/scene";
import { GameState } from "../core/GameState";
import { NPCBase } from "./NPCBase";
import { DialogueTree } from "../dialogue/DialogueStateMachine";
import { getSecretaryDialogue } from "../dialogue/DialogueData";

export class SecretaryNPC extends NPCBase {
  constructor(scene: Scene, gameState: GameState) {
    super("secretary", "Secretary", scene, gameState);
  }

  get interactionLabel(): string {
    if (this.gameState.get("clearanceGranted")) {
      return "Talk to Secretary";
    }
    return "Talk to Secretary";
  }

  canInteract(): boolean {
    return true; // Secretary is always available
  }

  getDialogueTree(): DialogueTree {
    return getSecretaryDialogue();
  }
}
