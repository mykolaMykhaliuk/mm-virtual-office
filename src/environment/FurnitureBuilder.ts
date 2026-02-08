/**
 * Constructs office furniture: desks, chairs, monitors, bookshelf, couch,
 * plants, whiteboard, and procedural seated humanoid figures.
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
    this.createSecretaryDesk();
    this.createDeveloperDesk();
    this.createDeveloperMonitors();
    this.createBookshelf();
    this.createCouch();
    this.createCoffeeTable();
    this.createPlants();
    this.createWhiteboard();
    this.createFilingCabinet();
    this.createCarpetRug();
    return this.root;
  }

  // ── Desks ──────────────────────────────────────────────────────────

  private createSecretaryDesk(): void {
    this.createDesk({
      name: "secretary-desk",
      position: new Vector3(2.5, 0, 4.5),
      rotationY: Math.PI,
      width: 1.5,
      depth: 0.75,
      height: 0.75,
    });

    // Secretary monitor
    this.createMonitor("secretary-monitor", new Vector3(2.5, 0.75, 4.2), Math.PI, 0.55, 0.35);
  }

  private createDeveloperDesk(): void {
    this.createDesk({
      name: "developer-desk",
      position: new Vector3(0, 0, 12),
      rotationY: 0,
      width: 2.4,
      depth: 0.8,
      height: 0.75,
    });
  }

  private createDesk(cfg: DeskConfig): TransformNode {
    const group = new TransformNode(cfg.name, this.scene);
    group.position = cfg.position;
    group.rotation.y = cfg.rotationY;
    group.parent = this.root;

    // Desktop surface
    const top = MeshBuilder.CreateBox(`${cfg.name}-top`, {
      width: cfg.width, height: 0.04, depth: cfg.depth,
    }, this.scene);
    top.position.y = cfg.height;
    top.material = this.materials.get("desk-surface");
    top.checkCollisions = true;
    top.receiveShadows = true;
    this.shadows.addShadowCaster(top);
    top.parent = group;

    // Legs
    const legH = cfg.height - 0.04;
    const legR = 0.03;
    const legPositions = [
      new Vector3(-cfg.width / 2 + 0.06, legH / 2, -cfg.depth / 2 + 0.06),
      new Vector3(cfg.width / 2 - 0.06, legH / 2, -cfg.depth / 2 + 0.06),
      new Vector3(-cfg.width / 2 + 0.06, legH / 2, cfg.depth / 2 - 0.06),
      new Vector3(cfg.width / 2 - 0.06, legH / 2, cfg.depth / 2 - 0.06),
    ];

    legPositions.forEach((pos, i) => {
      const leg = MeshBuilder.CreateCylinder(`${cfg.name}-leg${i}`, {
        diameter: legR * 2, height: legH,
      }, this.scene);
      leg.position = pos;
      leg.material = this.materials.get("metal-chrome");
      leg.checkCollisions = true;
      this.shadows.addShadowCaster(leg);
      leg.parent = group;
    });

    // Modesty panel (front panel)
    const panel = MeshBuilder.CreateBox(`${cfg.name}-panel`, {
      width: cfg.width - 0.12, height: cfg.height * 0.5, depth: 0.02,
    }, this.scene);
    panel.position = new Vector3(0, cfg.height * 0.35, -cfg.depth / 2 + 0.07);
    panel.material = this.materials.get("desk-wood");
    panel.checkCollisions = true;
    panel.parent = group;

    return group;
  }

  // ── Monitors ───────────────────────────────────────────────────────

  createMonitor(
    name: string,
    position: Vector3,
    rotationY: number,
    screenW: number,
    screenH: number
  ): TransformNode {
    const group = new TransformNode(name, this.scene);
    group.position = position;
    group.rotation.y = rotationY;
    group.parent = this.root;

    // Screen bezel
    const bezel = MeshBuilder.CreateBox(`${name}-bezel`, {
      width: screenW + 0.03, height: screenH + 0.03, depth: 0.03,
    }, this.scene);
    bezel.position.y = screenH / 2 + 0.15;
    bezel.material = this.materials.get("monitor-frame");
    this.shadows.addShadowCaster(bezel);
    bezel.parent = group;

    // Screen surface
    const screen = MeshBuilder.CreatePlane(`${name}-screen`, {
      width: screenW, height: screenH,
    }, this.scene);
    screen.position = new Vector3(0, screenH / 2 + 0.15, -0.016);
    screen.material = this.materials.get("monitor-screen");
    screen.parent = group;

    // Stand neck
    const neck = MeshBuilder.CreateBox(`${name}-neck`, {
      width: 0.04, height: 0.12, depth: 0.04,
    }, this.scene);
    neck.position.y = 0.06;
    neck.material = this.materials.get("metal-chrome");
    neck.parent = group;

    // Stand base
    const base = MeshBuilder.CreateBox(`${name}-base`, {
      width: 0.2, height: 0.015, depth: 0.15,
    }, this.scene);
    base.position.y = 0.0075;
    base.material = this.materials.get("metal-chrome");
    base.parent = group;

    return group;
  }

  private createDeveloperMonitors(): void {
    const baseY = 0.75;
    const z = 12.25;
    const screenW = 0.58;
    const screenH = 0.36;
    const spacing = 0.64;

    // Three horizontal monitors side by side
    this.createMonitor("dev-monitor-left", new Vector3(-spacing, baseY, z), 0, screenW, screenH);
    this.createMonitor("dev-monitor-center", new Vector3(0, baseY, z), 0, screenW, screenH);
    this.createMonitor("dev-monitor-right", new Vector3(spacing, baseY, z), 0, screenW, screenH);
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
    pole.material = this.materials.get("metal-chrome");
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
      arm.material = this.materials.get("metal-chrome");
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
      support.material = this.materials.get("metal-chrome");
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
      thigh.material = clothing;
      thigh.parent = group;

      // Shins
      const shin = MeshBuilder.CreateCylinder(`${cfg.name}-shin-${side}`, {
        diameter: 0.08, height: 0.42,
      }, this.scene);
      shin.position = new Vector3(side * 0.1, seatY / 2 - 0.04, -0.38);
      shin.material = clothing;
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

  // ── Bookshelf ──────────────────────────────────────────────────────

  private createBookshelf(): void {
    const group = new TransformNode("bookshelf", this.scene);
    group.position = new Vector3(-4.2, 0, 8);
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

  // ── Couch ──────────────────────────────────────────────────────────

  private createCouch(): void {
    const group = new TransformNode("couch", this.scene);
    group.position = new Vector3(-3.2, 0, 2);
    group.rotation.y = Math.PI / 2;
    group.parent = this.root;

    const mat = this.materials.get("leather-couch");

    // Seat
    const seat = MeshBuilder.CreateBox("couch-seat", {
      width: 1.8, height: 0.2, depth: 0.7,
    }, this.scene);
    seat.position.y = 0.35;
    seat.material = mat;
    seat.checkCollisions = true;
    seat.receiveShadows = true;
    this.shadows.addShadowCaster(seat);
    seat.parent = group;

    // Backrest
    const back = MeshBuilder.CreateBox("couch-back", {
      width: 1.8, height: 0.5, depth: 0.15,
    }, this.scene);
    back.position = new Vector3(0, 0.55, 0.35);
    back.material = mat;
    back.checkCollisions = true;
    back.parent = group;

    // Armrests
    for (const side of [-1, 1]) {
      const arm = MeshBuilder.CreateBox(`couch-arm-${side}`, {
        width: 0.12, height: 0.35, depth: 0.7,
      }, this.scene);
      arm.position = new Vector3(side * 0.96, 0.5, 0);
      arm.material = mat;
      arm.checkCollisions = true;
      arm.parent = group;
    }

    // Legs
    const legMat = this.materials.get("metal-dark");
    const legPositions = [
      new Vector3(-0.8, 0.06, -0.28),
      new Vector3(0.8, 0.06, -0.28),
      new Vector3(-0.8, 0.06, 0.28),
      new Vector3(0.8, 0.06, 0.28),
    ];
    for (let i = 0; i < legPositions.length; i++) {
      const leg = MeshBuilder.CreateCylinder(`couch-leg-${i}`, {
        diameter: 0.04, height: 0.12,
      }, this.scene);
      leg.position = legPositions[i];
      leg.material = legMat;
      leg.parent = group;
    }
  }

  // ── Coffee Table ───────────────────────────────────────────────────

  private createCoffeeTable(): void {
    const group = new TransformNode("coffee-table", this.scene);
    group.position = new Vector3(-3.2, 0, 3.2);
    group.parent = this.root;

    const top = MeshBuilder.CreateBox("coffee-table-top", {
      width: 0.8, height: 0.03, depth: 0.5,
    }, this.scene);
    top.position.y = 0.4;
    top.material = this.materials.get("desk-surface");
    top.checkCollisions = true;
    top.receiveShadows = true;
    this.shadows.addShadowCaster(top);
    top.parent = group;

    const legMat = this.materials.get("metal-chrome");
    const positions = [
      new Vector3(-0.33, 0.2, -0.18),
      new Vector3(0.33, 0.2, -0.18),
      new Vector3(-0.33, 0.2, 0.18),
      new Vector3(0.33, 0.2, 0.18),
    ];
    for (let i = 0; i < positions.length; i++) {
      const leg = MeshBuilder.CreateCylinder(`ct-leg-${i}`, {
        diameter: 0.025, height: 0.4,
      }, this.scene);
      leg.position = positions[i];
      leg.material = legMat;
      leg.parent = group;
    }
  }

  // ── Plants ─────────────────────────────────────────────────────────

  private createPlants(): void {
    const plantPositions = [
      new Vector3(-4.5, 0, 1),
      new Vector3(4.3, 0, 1.5),
      new Vector3(4.3, 0, 10),
    ];

    plantPositions.forEach((pos, i) => this.createPlant(`plant-${i}`, pos));
  }

  private createPlant(name: string, position: Vector3): void {
    const group = new TransformNode(name, this.scene);
    group.position = position;
    group.parent = this.root;

    // Pot
    const pot = MeshBuilder.CreateCylinder(`${name}-pot`, {
      diameterTop: 0.28, diameterBottom: 0.2, height: 0.3,
    }, this.scene);
    pot.position.y = 0.15;
    pot.material = this.materials.get("plant-pot");
    pot.checkCollisions = true;
    this.shadows.addShadowCaster(pot);
    pot.parent = group;

    // Foliage (cluster of spheres)
    const leafMat = this.materials.get("plant-green");
    const foliagePositions = [
      new Vector3(0, 0.5, 0),
      new Vector3(0.08, 0.55, 0.06),
      new Vector3(-0.07, 0.52, -0.05),
      new Vector3(0.05, 0.6, -0.04),
    ];

    foliagePositions.forEach((fp, j) => {
      const leaf = MeshBuilder.CreateSphere(`${name}-leaf-${j}`, {
        diameter: 0.2 + Math.random() * 0.08,
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
    group.position = new Vector3(4.9, 1.3, 7);
    group.parent = this.root;

    // Board surface
    const board = MeshBuilder.CreateBox("wb-board", {
      width: 0.02, height: 1.0, depth: 1.5,
    }, this.scene);
    board.material = this.materials.get("whiteboard");
    board.parent = group;

    // Frame
    const frameMat = this.materials.get("metal-chrome");
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
    cabinet.position = new Vector3(3.8, 0.55, 5.5);
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
      handle.position = new Vector3(3.8, 0.25 + i * 0.35, 5.22);
      handle.material = this.materials.get("metal-chrome");
      handle.parent = this.root;
    }
  }

  // ── Carpet Rug (under developer desk area) ─────────────────────────

  private createCarpetRug(): void {
    const rug = MeshBuilder.CreateBox("carpet-rug", {
      width: 3.5, height: 0.01, depth: 3.0,
    }, this.scene);
    rug.position = new Vector3(0, 0.005, 11.5);
    rug.material = this.materials.get("carpet");
    rug.receiveShadows = true;
    rug.parent = this.root;
  }
}
