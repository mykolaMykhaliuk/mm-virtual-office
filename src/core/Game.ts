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
    this.gameState = new GameState();
    this.ctx = SceneFactory.create(this.canvas);
    this.input = new InputManager(this.canvas);

    this.updateLoadingBar(25);

    // Player
    this.player = new PlayerController(this.ctx.scene, this.canvas);

    this.updateLoadingBar(35);

    // Environment
    const materials = new MaterialFactory(this.ctx.scene);
    const officeBuilder = new OfficeBuilder(this.ctx.scene, materials, this.ctx.shadowGenerator);
    officeBuilder.build();

    this.updateLoadingBar(50);

    const furnitureBuilder = new FurnitureBuilder(this.ctx.scene, materials, this.ctx.shadowGenerator);
    furnitureBuilder.build();

    this.updateLoadingBar(65);

    // NPCs
    this.createNPCs(furnitureBuilder, materials);

    this.updateLoadingBar(80);

    // Dialogue system
    this.dialogueSM = new DialogueStateMachine(this.gameState);
    this.dialogueUI = new DialogueUI(this.dialogueSM);

    // Interaction system
    this.interaction = new InteractionSystem(this.ctx.scene, this.player, this.input);
    this.interaction.registerNPC(this.secretary);
    this.interaction.registerNPC(this.developer);
    this.interaction.onInteract = (npc) => this.startDialogue(npc);

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
  }

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
