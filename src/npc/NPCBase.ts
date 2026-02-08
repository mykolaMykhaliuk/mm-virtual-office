/**
 * Base NPC class providing mesh references, collision, interaction triggers,
 * and dialogue hooks. Secretary and Developer extend this.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { GameState } from "../core/GameState";
import { DialogueTree } from "../dialogue/DialogueStateMachine";

import "@babylonjs/core/Meshes/Builders/boxBuilder";

export type NPCState = "idle" | "talking" | "unavailable";

export abstract class NPCBase {
  readonly id: string;
  readonly displayName: string;

  protected _state: NPCState = "idle";
  protected _interactable = true;

  /** Root transform containing all NPC meshes */
  readonly rootNode: TransformNode;

  /** Invisible mesh used for raycast/interaction detection */
  readonly triggerMesh: Mesh;

  constructor(
    id: string,
    displayName: string,
    protected readonly scene: Scene,
    protected readonly gameState: GameState
  ) {
    this.id = id;
    this.displayName = displayName;

    this.rootNode = new TransformNode(`npc-${id}-root`, scene);

    // Interaction trigger volume — invisible bounding box around NPC
    this.triggerMesh = MeshBuilder.CreateBox(
      `npc-${id}-trigger`,
      { width: 1.2, height: 2.0, depth: 1.2 },
      scene
    );
    this.triggerMesh.position.y = 1.0;
    this.triggerMesh.isVisible = false;
    this.triggerMesh.isPickable = true;
    this.triggerMesh.parent = this.rootNode;

    // Tag the trigger mesh so the interaction system can identify it
    this.triggerMesh.metadata = { interactable: true, npcId: id, npc: this };
  }

  // ── Public API ─────────────────────────────────────────────────────

  get state(): NPCState {
    return this._state;
  }

  get interactable(): boolean {
    return this._interactable && this._state !== "talking";
  }

  get worldPosition(): Vector3 {
    return this.rootNode.getAbsolutePosition();
  }

  /** Label shown in the interaction prompt */
  abstract get interactionLabel(): string;

  /** Returns the dialogue tree for the current game state */
  abstract getDialogueTree(): DialogueTree;

  /** Whether this NPC can currently be interacted with, given game state */
  abstract canInteract(): boolean;

  /** Called when dialogue starts */
  onDialogueStart(): void {
    this._state = "talking";
  }

  /** Called when dialogue ends */
  onDialogueEnd(): void {
    this._state = "idle";
  }

  /** Set the NPC's root position */
  setPosition(position: Vector3): void {
    this.rootNode.position = position;
  }

  /** Attach visual meshes (humanoid, chair, etc.) to the root */
  attachVisuals(node: TransformNode): void {
    node.parent = this.rootNode;
  }

  dispose(): void {
    this.triggerMesh.dispose();
    this.rootNode.dispose();
  }
}
