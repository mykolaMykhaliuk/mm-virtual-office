/**
 * Constructs office furniture: modern desks with black metal frames, chairs,
 * monitors, laptop, desk accessories (mugs, notebooks, pens), plants in
 * terracotta pots, bookshelf, and procedural seated humanoid figures.
 *
 * Layout matches the reference photo: open-plan co-working space with a woman
 * at a laptop on the left and a man at dual monitors on the right.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MaterialFactory } from "./MaterialFactory";

import "@babylonjs/core/Meshes/Builders/boxBuilder";
import "@babylonjs/core/Meshes/Builders/sphereBuilder";
import "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import "@babylonjs/core/Meshes/Builders/torusBuilder";
import "@babylonjs/core/Meshes/Builders/planeBuilder";

export interface DeskConfig {
  name: string;
  position: Vector3;
  rotationY: number;
  width: number;
  depth: number;
  height: number;
}

export interface HumanoidConfig {
  name: string;
  position: Vector3;
  rotationY: number;
  clothingMaterial: string;
  hairMaterial: string;
  hasHeadphones: boolean;
}

export class FurnitureBuilder {
  private root: TransformNode;

  constructor(
    private readonly scene: Scene,
    private readonly materials: MaterialFactory,
    private readonly shadows: ShadowGenerator
  ) {
    this.root = new TransformNode("furniture", scene);
  }

  build(): TransformNode {
    // Main workstations
    this.createSecretaryDesk();
    this.createDeveloperDesk();
    this.createDeveloperMonitors();

    // Desk accessories
    this.createLaptop();
    this.createDeskAccessories();

    // Background workstations
    this.createBackgroundDesks();

    // Plants (many, terracotta pots)
    this.createPlants();

    // Other furniture
    this.createBookshelf();
    this.createWhiteboard();
    this.createFilingCabinet();
    return this.root;
  }

  // ── Desks ──────────────────────────────────────────────────────────

  private createSecretaryDesk(): void {
    // Woman's desk (left side, near windows) — simple modern desk
    this.createModernDesk({
      name: "secretary-desk",
      position: new Vector3(-4, 0, 7),
      rotationY: 0,
      width: 1.4,
      depth: 0.7,
      height: 0.74,
    });
  }

  private createDeveloperDesk(): void {
    // Man's desk (right side, larger) — wider for dual monitors
    this.createModernDesk({
      name: "developer-desk",
      position: new Vector3(3, 0, 7),
      rotationY: 0,
      width: 2.0,
      depth: 0.8,
      height: 0.74,
    });
  }

  /** Modern desk with black metal frame and light wood top */
  private createModernDesk(cfg: DeskConfig): TransformNode {
    const group = new TransformNode(cfg.name, this.scene);
    group.position = cfg.position;
    group.rotation.y = cfg.rotationY;
    group.parent = this.root;

    // Desktop surface — light natural wood
    const top = MeshBuilder.CreateBox(`${cfg.name}-top`, {
      width: cfg.width, height: 0.035, depth: cfg.depth,
    }, this.scene);
    top.position.y = cfg.height;
    top.material = this.materials.get("desk-surface");
    top.checkCollisions = true;
    top.receiveShadows = true;
    this.shadows.addShadowCaster(top);
    top.parent = group;

    // Black metal frame legs (rectangular tube style)
    const legMat = this.materials.get("desk-frame");
    const legW = 0.04;
    const legH = cfg.height - 0.035;

    // Two A-frame style leg supports
    for (const side of [-1, 1]) {
      const xOff = side * (cfg.width / 2 - 0.06);

      // Vertical legs
      const frontLeg = MeshBuilder.CreateBox(`${cfg.name}-fleg-${side}`, {
        width: legW, height: legH, depth: legW,
      }, this.scene);
      frontLeg.position = new Vector3(xOff, legH / 2, -cfg.depth / 2 + 0.06);
      frontLeg.material = legMat;
      frontLeg.checkCollisions = true;
      this.shadows.addShadowCaster(frontLeg);
      frontLeg.parent = group;

      const backLeg = MeshBuilder.CreateBox(`${cfg.name}-bleg-${side}`, {
        width: legW, height: legH, depth: legW,
      }, this.scene);
      backLeg.position = new Vector3(xOff, legH / 2, cfg.depth / 2 - 0.06);
      backLeg.material = legMat;
      backLeg.checkCollisions = true;
      this.shadows.addShadowCaster(backLeg);
      backLeg.parent = group;

      // Horizontal cross bar connecting front and back legs
      const crossBar = MeshBuilder.CreateBox(`${cfg.name}-cross-${side}`, {
        width: legW, height: legW, depth: cfg.depth - 0.12,
      }, this.scene);
      crossBar.position = new Vector3(xOff, 0.15, 0);
      crossBar.material = legMat;
      crossBar.parent = group;
    }

    return group;
  }

  // ── Laptop (on secretary desk) ────────────────────────────────────

  private createLaptop(): void {
    const group = new TransformNode("laptop", this.scene);
    group.position = new Vector3(-4, 0.76, 7);
    group.parent = this.root;

    // Base (keyboard area)
    const base = MeshBuilder.CreateBox("laptop-base", {
      width: 0.34, height: 0.012, depth: 0.24,
    }, this.scene);
    base.position.y = 0;
    base.material = this.materials.get("laptop-body");
    this.shadows.addShadowCaster(base);
    base.parent = group;

    // Keyboard surface
    const keyboard = MeshBuilder.CreateBox("laptop-keyboard", {
      width: 0.28, height: 0.003, depth: 0.12,
    }, this.scene);
    keyboard.position = new Vector3(0, 0.008, -0.02);
    keyboard.material = this.materials.get("laptop-keyboard");
    keyboard.parent = group;

    // Screen (angled)
    const screen = MeshBuilder.CreateBox("laptop-screen", {
      width: 0.34, height: 0.22, depth: 0.008,
    }, this.scene);
    screen.position = new Vector3(0, 0.12, 0.12);
    screen.rotation.x = -0.25;
    screen.material = this.materials.get("laptop-body");
    this.shadows.addShadowCaster(screen);
    screen.parent = group;

    // Screen display
    const display = MeshBuilder.CreatePlane("laptop-display", {
      width: 0.3, height: 0.19,
    }, this.scene);
    display.position = new Vector3(0, 0.12, 0.115);
    display.rotation.x = -0.25;
    display.material = this.materials.get("laptop-screen");
    display.parent = group;
  }

  // ── Desk Accessories ──────────────────────────────────────────────

  private createDeskAccessories(): void {
    // Secretary desk accessories (left desk at -4, 0, 7)
    this.createMug("mug-secretary", new Vector3(-3.4, 0.76, 6.7));
    this.createNotebook("notebook-secretary", new Vector3(-4.35, 0.76, 6.65), 0.15);
    this.createPen("pen-secretary", new Vector3(-4.2, 0.76, 6.55));

    // Developer desk accessories (right desk at 3, 0, 7)
    this.createMug("mug-developer", new Vector3(3.7, 0.76, 6.6));
  }

  private createMug(name: string, position: Vector3): void {
    const group = new TransformNode(name, this.scene);
    group.position = position;
    group.parent = this.root;

    const mugMat = this.materials.get("mug-white");

    // Mug body
    const body = MeshBuilder.CreateCylinder(`${name}-body`, {
      diameterTop: 0.08, diameterBottom: 0.07, height: 0.1,
    }, this.scene);
    body.position.y = 0.05;
    body.material = mugMat;
    this.shadows.addShadowCaster(body);
    body.parent = group;

    // Handle
    const handle = MeshBuilder.CreateTorus(`${name}-handle`, {
      diameter: 0.05, thickness: 0.008, tessellation: 16,
    }, this.scene);
    handle.position = new Vector3(0.045, 0.05, 0);
    handle.rotation.y = Math.PI / 2;
    handle.scaling.x = 0.7;
    handle.material = mugMat;
    handle.parent = group;
  }

  private createNotebook(name: string, position: Vector3, rotationY: number): void {
    const notebook = MeshBuilder.CreateBox(name, {
      width: 0.18, height: 0.015, depth: 0.24,
    }, this.scene);
    notebook.position = position;
    notebook.position.y += 0.008;
    notebook.rotation.y = rotationY;
    notebook.material = this.materials.get("notebook");
    this.shadows.addShadowCaster(notebook);
    notebook.parent = this.root;
  }

  private createPen(name: string, position: Vector3): void {
    const pen = MeshBuilder.CreateCylinder(name, {
      diameter: 0.008, height: 0.14,
    }, this.scene);
    pen.position = position;
    pen.position.y += 0.004;
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.3;
    pen.material = this.materials.get("pen-dark");
    pen.parent = this.root;
  }

  // ── Monitors ───────────────────────────────────────────────────────

  createMonitor(
    name: string,
    position: Vector3,
    rotationY: number,
    screenW: number,
    screenH: number,
    screenMaterial?: string
  ): TransformNode {
    const group = new TransformNode(name, this.scene);
    group.position = position;
    group.rotation.y = rotationY;
    group.parent = this.root;

    // Screen bezel
    const bezel = MeshBuilder.CreateBox(`${name}-bezel`, {
      width: screenW + 0.03, height: screenH + 0.03, depth: 0.025,
    }, this.scene);
    bezel.position.y = screenH / 2 + 0.15;
    bezel.material = this.materials.get("monitor-frame");
    this.shadows.addShadowCaster(bezel);
    bezel.parent = group;

    // Screen surface
    const screen = MeshBuilder.CreatePlane(`${name}-screen`, {
      width: screenW, height: screenH,
    }, this.scene);
    screen.position = new Vector3(0, screenH / 2 + 0.15, -0.013);
    screen.material = this.materials.get(screenMaterial || "monitor-screen");
    screen.parent = group;

    // Stand neck
    const neck = MeshBuilder.CreateBox(`${name}-neck`, {
      width: 0.04, height: 0.12, depth: 0.04,
    }, this.scene);
    neck.position.y = 0.06;
    neck.material = this.materials.get("metal-black");
    neck.parent = group;

    // Stand base
    const base = MeshBuilder.CreateBox(`${name}-base`, {
      width: 0.2, height: 0.012, depth: 0.15,
    }, this.scene);
    base.position.y = 0.006;
    base.material = this.materials.get("metal-black");
    base.parent = group;

    return group;
  }

  private createDeveloperMonitors(): void {
    const baseY = 0.76;
    const z = 7.3;
    const screenW = 0.55;
    const screenH = 0.34;
    const spacing = 0.6;

    // Two monitors side by side (matching photo — dual monitor setup)
    this.createMonitor("dev-monitor-left", new Vector3(3 - spacing / 2, baseY, z), 0, screenW, screenH, "monitor-screen-code");
    this.createMonitor("dev-monitor-right", new Vector3(3 + spacing / 2, baseY, z), 0, screenW, screenH, "monitor-screen-ui");
  }

  // ── Chairs ─────────────────────────────────────────────────────────

  createChair(name: string, position: Vector3, rotationY: number): TransformNode {
    const group = new TransformNode(name, this.scene);
    group.position = position;
    group.rotation.y = rotationY;
    group.parent = this.root;

    const mat = this.materials.get("chair-fabric");

    // Seat
    const seat = MeshBuilder.CreateBox(`${name}-seat`, {
      width: 0.48, height: 0.06, depth: 0.46,
    }, this.scene);
    seat.position.y = 0.45;
    seat.material = mat;
    seat.checkCollisions = true;
    this.shadows.addShadowCaster(seat);
    seat.parent = group;

    // Backrest
    const back = MeshBuilder.CreateBox(`${name}-back`, {
      width: 0.46, height: 0.5, depth: 0.04,
    }, this.scene);
    back.position = new Vector3(0, 0.75, 0.22);
    back.material = mat;
    this.shadows.addShadowCaster(back);
    back.parent = group;

    // Base pole
    const pole = MeshBuilder.CreateCylinder(`${name}-pole`, {
      diameter: 0.05, height: 0.35,
    }, this.scene);
    pole.position.y = 0.22;
    pole.material = this.materials.get("metal-black");
    pole.parent = group;

    // Wheel base star (simplified as 5 short cylinders)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const arm = MeshBuilder.CreateCylinder(`${name}-arm${i}`, {
        diameter: 0.025, height: 0.25,
      }, this.scene);
      arm.position = new Vector3(Math.sin(angle) * 0.12, 0.02, Math.cos(angle) * 0.12);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = angle;
      arm.material = this.materials.get("metal-black");
      arm.parent = group;
    }

    // Armrests
    for (const side of [-1, 1]) {
      const armrest = MeshBuilder.CreateBox(`${name}-armrest-${side}`, {
        width: 0.04, height: 0.04, depth: 0.3,
      }, this.scene);
      armrest.position = new Vector3(side * 0.24, 0.62, 0.05);
      armrest.material = mat;
      armrest.parent = group;

      // Armrest support
      const support = MeshBuilder.CreateBox(`${name}-armsup-${side}`, {
        width: 0.03, height: 0.15, depth: 0.03,
      }, this.scene);
      support.position = new Vector3(side * 0.24, 0.54, -0.05);
      support.material = this.materials.get("metal-black");
      support.parent = group;
    }

    return group;
  }

  // ── Seated Humanoid ────────────────────────────────────────────────

  createSeatedHumanoid(cfg: HumanoidConfig): TransformNode {
    const group = new TransformNode(cfg.name, this.scene);
    group.position = cfg.position;
    group.rotation.y = cfg.rotationY;
    group.parent = this.root;

    const skin = this.materials.get("skin");
    const clothing = this.materials.get(cfg.clothingMaterial);
    const hair = this.materials.get(cfg.hairMaterial);

    const seatY = 0.45;

    // Torso
    const torso = MeshBuilder.CreateBox(`${cfg.name}-torso`, {
      width: 0.36, height: 0.45, depth: 0.2,
    }, this.scene);
    torso.position.y = seatY + 0.28;
    torso.material = clothing;
    this.shadows.addShadowCaster(torso);
    torso.parent = group;

    // Neck
    const neck = MeshBuilder.CreateCylinder(`${cfg.name}-neck`, {
      diameter: 0.08, height: 0.08,
    }, this.scene);
    neck.position.y = seatY + 0.54;
    neck.material = skin;
    neck.parent = group;

    // Head
    const head = MeshBuilder.CreateSphere(`${cfg.name}-head`, {
      diameter: 0.22,
    }, this.scene);
    head.position.y = seatY + 0.68;
    head.material = skin;
    this.shadows.addShadowCaster(head);
    head.parent = group;

    // Hair (back hemisphere)
    const hairMesh = MeshBuilder.CreateSphere(`${cfg.name}-hair`, {
      diameter: 0.235, slice: 0.5,
    }, this.scene);
    hairMesh.position.y = seatY + 0.69;
    hairMesh.position.z = 0.01;
    hairMesh.material = hair;
    hairMesh.parent = group;

    // Upper arms
    for (const side of [-1, 1]) {
      const upper = MeshBuilder.CreateCylinder(`${cfg.name}-uarm-${side}`, {
        diameter: 0.07, height: 0.28,
      }, this.scene);
      upper.position = new Vector3(side * 0.22, seatY + 0.35, 0);
      upper.material = clothing;
      upper.parent = group;

      // Forearms (resting forward, toward desk)
      const fore = MeshBuilder.CreateCylinder(`${cfg.name}-farm-${side}`, {
        diameter: 0.06, height: 0.26,
      }, this.scene);
      fore.position = new Vector3(side * 0.18, seatY + 0.22, -0.18);
      fore.rotation.x = Math.PI / 2;
      fore.material = skin;
      fore.parent = group;

      // Hands
      const hand = MeshBuilder.CreateSphere(`${cfg.name}-hand-${side}`, {
        diameter: 0.06,
      }, this.scene);
      hand.position = new Vector3(side * 0.15, seatY + 0.22, -0.32);
      hand.material = skin;
      hand.parent = group;
    }

    // Thighs (going forward from seat)
    for (const side of [-1, 1]) {
      const thigh = MeshBuilder.CreateCylinder(`${cfg.name}-thigh-${side}`, {
        diameter: 0.1, height: 0.4,
      }, this.scene);
      thigh.position = new Vector3(side * 0.1, seatY - 0.02, -0.18);
      thigh.rotation.x = Math.PI / 2;
      thigh.material = this.materials.get("clothing-dark");
      thigh.parent = group;

      // Shins
      const shin = MeshBuilder.CreateCylinder(`${cfg.name}-shin-${side}`, {
        diameter: 0.08, height: 0.42,
      }, this.scene);
      shin.position = new Vector3(side * 0.1, seatY / 2 - 0.04, -0.38);
      shin.material = this.materials.get("clothing-dark");
      shin.parent = group;
    }

    // Headphones (developer only)
    if (cfg.hasHeadphones) {
      this.addHeadphones(cfg.name, group, seatY + 0.68);
    }

    return group;
  }

  private addHeadphones(name: string, parent: TransformNode, headY: number): void {
    const mat = this.materials.get("headphones");

    // Headband
    const band = MeshBuilder.CreateTorus(`${name}-headband`, {
      diameter: 0.24, thickness: 0.015, tessellation: 32,
    }, this.scene);
    band.position.y = headY + 0.06;
    band.rotation.z = Math.PI / 2;
    band.scaling.y = 0.6;
    band.material = mat;
    band.parent = parent;

    // Ear cups
    for (const side of [-1, 1]) {
      const cup = MeshBuilder.CreateCylinder(`${name}-earcup-${side}`, {
        diameter: 0.08, height: 0.03,
      }, this.scene);
      cup.position = new Vector3(side * 0.12, headY, 0);
      cup.rotation.z = Math.PI / 2;
      cup.material = mat;
      cup.parent = parent;

      // Padding
      const pad = MeshBuilder.CreateCylinder(`${name}-earpad-${side}`, {
        diameter: 0.09, height: 0.015,
      }, this.scene);
      pad.position = new Vector3(side * 0.115, headY, 0);
      pad.rotation.z = Math.PI / 2;
      pad.material = this.materials.get("chair-fabric");
      pad.parent = parent;
    }
  }

  // ── Background Desks ──────────────────────────────────────────────

  private createBackgroundDesks(): void {
    // Additional workstations visible in the background (photo shows more desks)

    // Background desk 1 (behind and to the right)
    this.createModernDesk({
      name: "bg-desk-1",
      position: new Vector3(4, 0, 12),
      rotationY: 0,
      width: 1.6,
      depth: 0.7,
      height: 0.74,
    });
    this.createMonitor("bg-monitor-1", new Vector3(4, 0.76, 12.3), 0, 0.5, 0.32, "monitor-screen-code");

    // Background desk 2 (far back left)
    this.createModernDesk({
      name: "bg-desk-2",
      position: new Vector3(-3, 0, 13),
      rotationY: 0,
      width: 1.4,
      depth: 0.7,
      height: 0.74,
    });
    this.createMonitor("bg-monitor-2", new Vector3(-3, 0.76, 13.3), 0, 0.5, 0.32, "monitor-screen-ui");

    // Background desk 3 (far right)
    this.createModernDesk({
      name: "bg-desk-3",
      position: new Vector3(6, 0, 10),
      rotationY: Math.PI / 2,
      width: 1.4,
      depth: 0.7,
      height: 0.74,
    });
  }

  // ── Bookshelf ──────────────────────────────────────────────────────

  private createBookshelf(): void {
    const group = new TransformNode("bookshelf", this.scene);
    group.position = new Vector3(7.2, 0, 14);
    group.parent = this.root;

    const mat = this.materials.get("bookshelf-wood");
    const w = 1.0, d = 0.3, h = 1.8;

    // Frame sides
    for (const side of [-1, 1]) {
      const panel = MeshBuilder.CreateBox(`bookshelf-side-${side}`, {
        width: 0.025, height: h, depth: d,
      }, this.scene);
      panel.position = new Vector3(side * w / 2, h / 2, 0);
      panel.material = mat;
      panel.checkCollisions = true;
      this.shadows.addShadowCaster(panel);
      panel.parent = group;
    }

    // Shelves (5 shelves including top and bottom)
    for (let i = 0; i < 5; i++) {
      const shelf = MeshBuilder.CreateBox(`bookshelf-shelf-${i}`, {
        width: w, height: 0.02, depth: d,
      }, this.scene);
      shelf.position.y = i * (h / 4);
      shelf.material = mat;
      shelf.parent = group;
    }

    // Back panel
    const backPanel = MeshBuilder.CreateBox("bookshelf-back", {
      width: w, height: h, depth: 0.01,
    }, this.scene);
    backPanel.position = new Vector3(0, h / 2, d / 2);
    backPanel.material = mat;
    backPanel.parent = group;

    // Books (colored blocks on shelves)
    const bookColors = ["book-red", "book-blue", "book-green", "book-red", "book-blue"];
    for (let shelf = 1; shelf < 4; shelf++) {
      const shelfY = shelf * (h / 4) + 0.01;
      let xPos = -w / 2 + 0.08;
      for (let b = 0; b < 5 + Math.floor(Math.random() * 3); b++) {
        const bw = 0.03 + Math.random() * 0.04;
        const bh = 0.18 + Math.random() * 0.1;
        const book = MeshBuilder.CreateBox(`book-${shelf}-${b}`, {
          width: bw, height: bh, depth: d * 0.7,
        }, this.scene);
        book.position = new Vector3(xPos, shelfY + bh / 2, -0.02);
        book.material = this.materials.get(bookColors[b % bookColors.length]);
        book.parent = group;
        xPos += bw + 0.005;
        if (xPos > w / 2 - 0.08) break;
      }
    }
  }

  // ── Plants ─────────────────────────────────────────────────────────

  private createPlants(): void {
    // Many terracotta potted plants scattered around (matching photo)
    const plantConfigs = [
      // Near entrance (left)
      { pos: new Vector3(-7, 0, 2), scale: 1.0 },
      // Near entrance (right)
      { pos: new Vector3(6.5, 0, 2), scale: 0.9 },
      // Behind secretary (left window area)
      { pos: new Vector3(-6.5, 0, 9), scale: 1.1 },
      // Next to developer desk
      { pos: new Vector3(5.5, 0, 7), scale: 1.0 },
      // Back right area
      { pos: new Vector3(7, 0, 11), scale: 0.85 },
      // Back center
      { pos: new Vector3(0, 0, 16), scale: 1.0 },
      // Near glass partition
      { pos: new Vector3(-2, 0, 14.5), scale: 0.95 },
      // Far back right
      { pos: new Vector3(6, 0, 15), scale: 1.1 },
    ];

    plantConfigs.forEach((cfg, i) => this.createPlant(`plant-${i}`, cfg.pos, cfg.scale));
  }

  private createPlant(name: string, position: Vector3, scale: number): void {
    const group = new TransformNode(name, this.scene);
    group.position = position;
    group.scaling = new Vector3(scale, scale, scale);
    group.parent = this.root;

    // Terracotta pot
    const pot = MeshBuilder.CreateCylinder(`${name}-pot`, {
      diameterTop: 0.30, diameterBottom: 0.22, height: 0.32,
    }, this.scene);
    pot.position.y = 0.16;
    pot.material = this.materials.get("plant-pot");
    pot.checkCollisions = true;
    this.shadows.addShadowCaster(pot);
    pot.parent = group;

    // Pot rim
    const rim = MeshBuilder.CreateCylinder(`${name}-rim`, {
      diameterTop: 0.33, diameterBottom: 0.33, height: 0.03,
    }, this.scene);
    rim.position.y = 0.33;
    rim.material = this.materials.get("plant-pot");
    rim.parent = group;

    // Foliage (cluster of spheres — fuller plant)
    const leafMat = this.materials.get("plant-green");
    const foliagePositions = [
      new Vector3(0, 0.55, 0),
      new Vector3(0.1, 0.6, 0.08),
      new Vector3(-0.09, 0.58, -0.06),
      new Vector3(0.06, 0.65, -0.05),
      new Vector3(-0.05, 0.62, 0.08),
      new Vector3(0, 0.7, 0.02),
    ];

    foliagePositions.forEach((fp, j) => {
      const leaf = MeshBuilder.CreateSphere(`${name}-leaf-${j}`, {
        diameter: 0.18 + Math.random() * 0.1,
      }, this.scene);
      leaf.position = fp;
      leaf.material = leafMat;
      this.shadows.addShadowCaster(leaf);
      leaf.parent = group;
    });
  }

  // ── Whiteboard ─────────────────────────────────────────────────────

  private createWhiteboard(): void {
    const group = new TransformNode("whiteboard", this.scene);
    group.position = new Vector3(7.9, 1.3, 7);
    group.parent = this.root;

    // Board surface
    const board = MeshBuilder.CreateBox("wb-board", {
      width: 0.02, height: 1.0, depth: 1.5,
    }, this.scene);
    board.material = this.materials.get("whiteboard");
    board.parent = group;

    // Frame
    const frameMat = this.materials.get("metal-black");
    const edges = [
      { w: 0.02, h: 0.03, d: 1.56, pos: new Vector3(0, 0.515, 0) },
      { w: 0.02, h: 0.03, d: 1.56, pos: new Vector3(0, -0.515, 0) },
      { w: 0.02, h: 1.06, d: 0.03, pos: new Vector3(0, 0, 0.765) },
      { w: 0.02, h: 1.06, d: 0.03, pos: new Vector3(0, 0, -0.765) },
    ];
    edges.forEach((e, i) => {
      const edge = MeshBuilder.CreateBox(`wb-frame-${i}`, {
        width: e.w, height: e.h, depth: e.d,
      }, this.scene);
      edge.position = e.pos;
      edge.material = frameMat;
      edge.parent = group;
    });
  }

  // ── Filing Cabinet ─────────────────────────────────────────────────

  private createFilingCabinet(): void {
    const cabinet = MeshBuilder.CreateBox("filing-cabinet", {
      width: 0.45, height: 1.1, depth: 0.55,
    }, this.scene);
    cabinet.position = new Vector3(7.2, 0.55, 4);
    cabinet.material = this.materials.get("metal-dark");
    cabinet.checkCollisions = true;
    cabinet.receiveShadows = true;
    this.shadows.addShadowCaster(cabinet);
    cabinet.parent = this.root;

    // Drawer handles
    for (let i = 0; i < 3; i++) {
      const handle = MeshBuilder.CreateBox(`cabinet-handle-${i}`, {
        width: 0.15, height: 0.02, depth: 0.02,
      }, this.scene);
      handle.position = new Vector3(7.2, 0.25 + i * 0.35, 3.72);
      handle.material = this.materials.get("metal-chrome");
      handle.parent = this.root;
    }
  }
}
