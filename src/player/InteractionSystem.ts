/**
 * Raycasting-based interaction system. Detects interactable NPCs in front
 * of the player and shows a prompt. Fires interaction events on key press.
 */

import { Scene } from "@babylonjs/core/scene";
import { Ray } from "@babylonjs/core/Culling/ray";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { PlayerController } from "./PlayerController";
import { NPCBase } from "../npc/NPCBase";
import { InputManager } from "../input/InputManager";

import "@babylonjs/core/Culling/ray";

export interface InteractionTarget {
  npc: NPCBase;
  distance: number;
}

export class InteractionSystem {
  private currentTarget: InteractionTarget | null = null;
  private promptElement: HTMLDivElement;
  private readonly INTERACT_RANGE = 3.0;

  /** Registry of all interactable NPCs */
  private npcs: NPCBase[] = [];

  /** Callback when interaction is triggered */
  onInteract: ((npc: NPCBase) => void) | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly player: PlayerController,
    private readonly input: InputManager
  ) {
    this.promptElement = this.createPromptUI();
    this.input.onAction("interact", () => this.tryInteract());

    // Update every frame
    this.scene.onBeforeRenderObservable.add(() => this.update());
  }

  registerNPC(npc: NPCBase): void {
    this.npcs.push(npc);
  }

  private update(): void {
    const ray = this.player.camera.getForwardRay(this.INTERACT_RANGE);
    let closest: InteractionTarget | null = null;

    for (const npc of this.npcs) {
      if (!npc.interactable) continue;

      const hit = this.rayIntersectsNPC(ray, npc);
      if (hit !== null) {
        if (!closest || hit < closest.distance) {
          closest = { npc, distance: hit };
        }
      }
    }

    // Also check proximity (trigger volume) as a fallback
    if (!closest) {
      for (const npc of this.npcs) {
        if (!npc.interactable) continue;
        const dist = this.distanceToNPC(npc);
        if (dist < this.INTERACT_RANGE * 0.7) {
          if (!closest || dist < closest.distance) {
            closest = { npc, distance: dist };
          }
        }
      }
    }

    this.currentTarget = closest;
    this.updatePromptUI();
  }

  private rayIntersectsNPC(ray: Ray, npc: NPCBase): number | null {
    const triggerMesh = npc.triggerMesh;
    if (!triggerMesh) return null;

    const hit = ray.intersectsMesh(triggerMesh as AbstractMesh);
    if (hit.hit && hit.distance <= this.INTERACT_RANGE) {
      return hit.distance;
    }
    return null;
  }

  private distanceToNPC(npc: NPCBase): number {
    const npcPos = npc.worldPosition;
    const playerPos = this.player.position;
    return npcPos.subtract(playerPos).length();
  }

  private tryInteract(): void {
    if (this.currentTarget) {
      this.onInteract?.(this.currentTarget.npc);
    }
  }

  private createPromptUI(): HTMLDivElement {
    const el = document.createElement("div");
    el.id = "interaction-prompt";
    Object.assign(el.style, {
      position: "fixed",
      bottom: "25%",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 24px",
      background: "rgba(0, 0, 0, 0.75)",
      color: "#ffffff",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontSize: "16px",
      borderRadius: "8px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      pointerEvents: "none",
      display: "none",
      zIndex: "100",
      letterSpacing: "0.03em",
      backdropFilter: "blur(4px)",
    });
    document.body.appendChild(el);
    return el;
  }

  private updatePromptUI(): void {
    if (this.currentTarget) {
      const npc = this.currentTarget.npc;
      this.promptElement.innerHTML = `<strong>E</strong> &mdash; ${npc.interactionLabel}`;
      this.promptElement.style.display = "block";
    } else {
      this.promptElement.style.display = "none";
    }
  }

  dispose(): void {
    this.promptElement.remove();
    this.scene.onBeforeRenderObservable.clear();
  }
}
