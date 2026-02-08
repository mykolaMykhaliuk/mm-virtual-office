/**
 * Main game class — wires together all systems:
 * scene, player, environment, NPCs, interaction, dialogue, input.
 */

import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { SceneFactory, SceneContext } from "./SceneFactory";
import { GameState } from "./GameState";
import { InputManager } from "../input/InputManager";
import { PlayerController } from "../player/PlayerController";
import { InteractionSystem } from "../player/InteractionSystem";
import { MaterialFactory } from "../environment/MaterialFactory";
import { OfficeBuilder } from "../environment/OfficeBuilder";
import { FurnitureBuilder } from "../environment/FurnitureBuilder";
import { SecretaryNPC } from "../npc/SecretaryNPC";
import { DeveloperNPC } from "../npc/DeveloperNPC";
import { NPCBase } from "../npc/NPCBase";
import { DialogueStateMachine } from "../dialogue/DialogueStateMachine";
import { DialogueUI } from "../dialogue/DialogueUI";

export class Game {
  private ctx!: SceneContext;
  private gameState!: GameState;
  private input!: InputManager;
  private player!: PlayerController;
  private interaction!: InteractionSystem;
  private dialogueSM!: DialogueStateMachine;
  private dialogueUI!: DialogueUI;

  // NPCs
  private secretary!: SecretaryNPC;
  private developer!: DeveloperNPC;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  async init(): Promise<void> {
    this.updateLoadingBar(10);

    // Core systems
    this.initStep("GameState", () => { this.gameState = new GameState(); });
    this.initStep("SceneFactory", () => { this.ctx = SceneFactory.create(this.canvas); });
    this.initStep("InputManager", () => { this.input = new InputManager(this.canvas); });

    this.updateLoadingBar(25);

    // Player
    this.initStep("PlayerController", () => {
      this.player = new PlayerController(this.ctx.scene, this.canvas);
    });

    this.updateLoadingBar(35);

    // Environment
    this.initStep("Environment (materials & office)", () => {
      const materials = new MaterialFactory(this.ctx.scene);
      this._materials = materials;
      const officeBuilder = new OfficeBuilder(this.ctx.scene, materials, this.ctx.shadowGenerator);
      officeBuilder.build();
    });

    this.updateLoadingBar(50);

    this.initStep("Furniture", () => {
      const furnitureBuilder = new FurnitureBuilder(this.ctx.scene, this._materials!, this.ctx.shadowGenerator);
      this._furnitureBuilder = furnitureBuilder;
      furnitureBuilder.build();
    });

    this.updateLoadingBar(65);

    // NPCs
    this.initStep("NPCs", () => {
      this.createNPCs(this._furnitureBuilder!, this._materials!);
    });

    this.updateLoadingBar(80);

    // Dialogue system
    this.initStep("Dialogue system", () => {
      this.dialogueSM = new DialogueStateMachine(this.gameState);
      this.dialogueUI = new DialogueUI(this.dialogueSM);
    });

    // Interaction system
    this.initStep("Interaction system", () => {
      this.interaction = new InteractionSystem(this.ctx.scene, this.player, this.input);
      this.interaction.registerNPC(this.secretary);
      this.interaction.registerNPC(this.developer);
      this.interaction.onInteract = (npc) => this.startDialogue(npc);
    });

    // Handle Escape to close dialogue
    this.input.onAction("cancel", () => {
      if (this.dialogueSM.isActive) {
        this.endDialogue();
      }
    });

    this.updateLoadingBar(95);

    // Wait one frame for everything to settle
    await new Promise<void>((resolve) => {
      this.ctx.scene.executeWhenReady(() => resolve());
    });

    this.updateLoadingBar(100);

    // Hide loading screen
    setTimeout(() => this.hideLoadingScreen(), 300);

    // Start render loop
    this.ctx.engine.runRenderLoop(() => {
      this.ctx.scene.render();
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.ctx.engine.resize();
    });

    // Clean up temp references
    this._materials = undefined;
    this._furnitureBuilder = undefined;
  }

  /** Run an init step, wrapping errors with the step name for debug visibility. */
  private initStep(name: string, fn: () => void): void {
    try {
      fn();
    } catch (err) {
      console.error(`[Init] ${name} failed:`, err);
      throw err;
    }
  }

  // Temp references used during init to pass between steps
  private _materials?: MaterialFactory;
  private _furnitureBuilder?: FurnitureBuilder;

  private createNPCs(furniture: FurnitureBuilder, materials: MaterialFactory): void {
    // ── Secretary ───────────────────────────────────────────
    this.secretary = new SecretaryNPC(this.ctx.scene, this.gameState);
    this.secretary.setPosition(new Vector3(2.5, 0, 4.5));

    // Secretary chair (facing entrance, rotated 180deg)
    furniture.createChair("secretary-chair", new Vector3(2.5, 0, 5.2), Math.PI);

    // Secretary humanoid (seated, facing entrance)
    const secHumanoid = furniture.createSeatedHumanoid({
      name: "secretary-body",
      position: new Vector3(2.5, 0, 5.2),
      rotationY: Math.PI,
      clothingMaterial: "clothing-blue",
      hairMaterial: "hair-brown",
      hasHeadphones: false,
    });
    this.secretary.attachVisuals(secHumanoid);

    // ── Developer ──────────────────────────────────────────
    this.developer = new DeveloperNPC(this.ctx.scene, this.gameState);
    this.developer.setPosition(new Vector3(0, 0, 11.5));

    // Developer chair (facing monitors/back wall)
    furniture.createChair("developer-chair", new Vector3(0, 0, 11.2), 0);

    // Developer humanoid (seated, facing monitors)
    const devHumanoid = furniture.createSeatedHumanoid({
      name: "developer-body",
      position: new Vector3(0, 0, 11.2),
      rotationY: 0,
      clothingMaterial: "clothing-dark",
      hairMaterial: "hair-dark",
      hasHeadphones: true,
    });
    this.developer.attachVisuals(devHumanoid);
  }

  private startDialogue(npc: NPCBase): void {
    if (this.dialogueSM.isActive) return;
    if (!npc.canInteract()) return;

    const tree = npc.getDialogueTree();
    npc.onDialogueStart();
    this.gameState.set("currentDialogueActive", true);

    // Disable player movement during dialogue
    this.player.enabled = false;

    // Release pointer lock so player can click dialogue options
    document.exitPointerLock();

    // Wire up dialogue end
    const originalEnd = this.dialogueSM.onDialogueEnd;
    this.dialogueSM.onDialogueEnd = () => {
      this.endDialogue();
      npc.onDialogueEnd();
      this.dialogueSM.onDialogueEnd = originalEnd;
    };

    this.dialogueSM.start(tree);
  }

  private endDialogue(): void {
    if (this.dialogueSM.isActive) {
      this.dialogueSM.end();
    }
    this.dialogueUI.hide();
    this.gameState.set("currentDialogueActive", false);
    this.player.enabled = true;
  }

  private updateLoadingBar(percent: number): void {
    const bar = document.getElementById("loadingBar");
    if (bar) {
      bar.style.width = `${percent}%`;
    }
  }

  private hideLoadingScreen(): void {
    const screen = document.getElementById("loadingScreen");
    if (screen) {
      screen.classList.add("fade-out");
      setTimeout(() => screen.remove(), 600);
    }
  }

  dispose(): void {
    this.interaction.dispose();
    this.dialogueUI.dispose();
    this.player.dispose();
    this.input.dispose();
    this.secretary.dispose();
    this.developer.dispose();
    this.ctx.scene.dispose();
    this.ctx.engine.dispose();
  }
}
