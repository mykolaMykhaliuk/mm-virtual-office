/**
 * Constructs the office shell: floor, ceiling, walls, windows, entrance.
 * Office dimensions: 10m wide (x: -5..+5) × 14m deep (z: 0..14) × 3m tall.
 */

import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MaterialFactory } from "./MaterialFactory";

// Side-effect imports for mesh builders
import "@babylonjs/core/Meshes/Builders/boxBuilder";
import "@babylonjs/core/Meshes/Builders/groundBuilder";
import "@babylonjs/core/Meshes/Builders/planeBuilder";

export const OFFICE = {
  WIDTH: 10,
  DEPTH: 14,
  HEIGHT: 3,
  WALL_THICKNESS: 0.15,
  ENTRANCE_WIDTH: 1.6,
  ENTRANCE_HEIGHT: 2.4,
} as const;

export class OfficeBuilder {
  private root: TransformNode;

  constructor(
    private readonly scene: Scene,
    private readonly materials: MaterialFactory,
    private readonly shadows: ShadowGenerator
  ) {
    this.root = new TransformNode("office", scene);
  }

  build(): TransformNode {
    this.createFloor();
    this.createCeiling();
    this.createWalls();
    this.createWindows();
    this.createEntranceDoorFrame();
    this.createBaseboards();
    this.createCeilingLights();
    return this.root;
  }

  private createFloor(): void {
    const floor = MeshBuilder.CreateGround(
      "floor",
      { width: OFFICE.WIDTH, height: OFFICE.DEPTH },
      this.scene
    );
    floor.position = new Vector3(0, 0, OFFICE.DEPTH / 2);
    floor.material = this.materials.get("floor-wood");
    floor.checkCollisions = true;
    floor.receiveShadows = true;
    floor.parent = this.root;
  }

  private createCeiling(): void {
    const ceiling = MeshBuilder.CreatePlane(
      "ceiling",
      { width: OFFICE.WIDTH, height: OFFICE.DEPTH },
      this.scene
    );
    ceiling.position = new Vector3(0, OFFICE.HEIGHT, OFFICE.DEPTH / 2);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.material = this.materials.get("ceiling-white");
    ceiling.parent = this.root;
  }

  private createWalls(): void {
    const t = OFFICE.WALL_THICKNESS;
    const h = OFFICE.HEIGHT;
    const w = OFFICE.WIDTH;
    const d = OFFICE.DEPTH;

    // Back wall (z = DEPTH)
    this.createWallSegment("wall-back", w + 2 * t, h, t, new Vector3(0, h / 2, d + t / 2));

    // Left wall (x = -WIDTH/2) — with window gaps
    this.createLeftWall();

    // Right wall (x = +WIDTH/2) — solid
    this.createWallSegment(
      "wall-right",
      t, h, d + 2 * t,
      new Vector3(w / 2 + t / 2, h / 2, d / 2)
    );

    // Front wall with entrance gap
    this.createFrontWall();
  }

  private createLeftWall(): void {
    const t = OFFICE.WALL_THICKNESS;
    const h = OFFICE.HEIGHT;
    const d = OFFICE.DEPTH;
    const x = -OFFICE.WIDTH / 2 - t / 2;

    // Window layout: two windows on left wall
    // Window 1: z = 3..5 (near secretary)
    // Window 2: z = 9..11 (near developer)
    const windowSill = 0.9;
    const windowTop = 2.4;
    const windowWidth = 2.0;

    const segments: { name: string; height: number; depth: number; y: number; z: number }[] = [
      // Below windows — full length strip
      { name: "left-below", height: windowSill, depth: d + 2 * t, y: windowSill / 2, z: d / 2 },
      // Above windows — full length strip
      { name: "left-above", height: h - windowTop, depth: d + 2 * t, y: windowTop + (h - windowTop) / 2, z: d / 2 },
      // Between start and window 1
      { name: "left-seg0", height: windowTop - windowSill, depth: 3, y: windowSill + (windowTop - windowSill) / 2, z: 1.5 },
      // Between window 1 and window 2
      { name: "left-seg1", height: windowTop - windowSill, depth: 4, y: windowSill + (windowTop - windowSill) / 2, z: 7 },
      // After window 2
      { name: "left-seg2", height: windowTop - windowSill, depth: 3, y: windowSill + (windowTop - windowSill) / 2, z: 12.5 },
    ];

    for (const seg of segments) {
      this.createWallSegment(seg.name, t, seg.height, seg.depth, new Vector3(x, seg.y, seg.z));
    }
  }

  private createFrontWall(): void {
    const t = OFFICE.WALL_THICKNESS;
    const h = OFFICE.HEIGHT;
    const w = OFFICE.WIDTH;
    const halfEntrance = OFFICE.ENTRANCE_WIDTH / 2;
    const z = -t / 2;

    // Left part of front wall
    const leftWidth = w / 2 - halfEntrance;
    this.createWallSegment(
      "wall-front-left",
      leftWidth, h, t,
      new Vector3(-halfEntrance - leftWidth / 2, h / 2, z)
    );

    // Right part of front wall
    this.createWallSegment(
      "wall-front-right",
      leftWidth, h, t,
      new Vector3(halfEntrance + leftWidth / 2, h / 2, z)
    );

    // Above entrance
    this.createWallSegment(
      "wall-front-top",
      OFFICE.ENTRANCE_WIDTH, h - OFFICE.ENTRANCE_HEIGHT, t,
      new Vector3(0, OFFICE.ENTRANCE_HEIGHT + (h - OFFICE.ENTRANCE_HEIGHT) / 2, z)
    );
  }

  private createWallSegment(
    name: string,
    width: number,
    height: number,
    depth: number,
    position: Vector3
  ): Mesh {
    const wall = MeshBuilder.CreateBox(name, { width, height, depth }, this.scene);
    wall.position = position;
    wall.material = this.materials.get("wall-paint");
    wall.checkCollisions = true;
    wall.receiveShadows = true;
    wall.parent = this.root;
    return wall;
  }

  private createWindows(): void {
    // Emissive window panes on left wall
    const windowConfigs = [
      { z: 4, width: 2.0 },
      { z: 10, width: 2.0 },
    ];

    const windowSill = 0.9;
    const windowHeight = 1.5;
    const x = -OFFICE.WIDTH / 2 - 0.01;

    for (let i = 0; i < windowConfigs.length; i++) {
      const cfg = windowConfigs[i];
      const pane = MeshBuilder.CreatePlane(
        `window-pane-${i}`,
        { width: cfg.width, height: windowHeight },
        this.scene
      );
      pane.position = new Vector3(x, windowSill + windowHeight / 2, cfg.z);
      pane.rotation.y = Math.PI / 2;
      pane.material = this.materials.get("glass-window");
      pane.parent = this.root;
    }
  }

  private createEntranceDoorFrame(): void {
    const mat = this.materials.get("door-frame");
    const frameWidth = 0.08;
    const h = OFFICE.ENTRANCE_HEIGHT;
    const w = OFFICE.ENTRANCE_WIDTH;

    // Left jamb
    const left = MeshBuilder.CreateBox("doorframe-left", {
      width: frameWidth, height: h, depth: OFFICE.WALL_THICKNESS + 0.02,
    }, this.scene);
    left.position = new Vector3(-w / 2, h / 2, 0);
    left.material = mat;
    left.parent = this.root;

    // Right jamb
    const right = MeshBuilder.CreateBox("doorframe-right", {
      width: frameWidth, height: h, depth: OFFICE.WALL_THICKNESS + 0.02,
    }, this.scene);
    right.position = new Vector3(w / 2, h / 2, 0);
    right.material = mat;
    right.parent = this.root;

    // Header
    const header = MeshBuilder.CreateBox("doorframe-header", {
      width: w + 2 * frameWidth, height: frameWidth, depth: OFFICE.WALL_THICKNESS + 0.02,
    }, this.scene);
    header.position = new Vector3(0, h, 0);
    header.material = mat;
    header.parent = this.root;
  }

  private createBaseboards(): void {
    const mat = this.materials.get("baseboard");
    const bh = 0.08;
    const bd = 0.02;

    // Back wall
    const back = MeshBuilder.CreateBox("baseboard-back", {
      width: OFFICE.WIDTH, height: bh, depth: bd,
    }, this.scene);
    back.position = new Vector3(0, bh / 2, OFFICE.DEPTH - bd / 2);
    back.material = mat;
    back.parent = this.root;

    // Right wall
    const right = MeshBuilder.CreateBox("baseboard-right", {
      width: bd, height: bh, depth: OFFICE.DEPTH,
    }, this.scene);
    right.position = new Vector3(OFFICE.WIDTH / 2 - bd / 2, bh / 2, OFFICE.DEPTH / 2);
    right.material = mat;
    right.parent = this.root;

    // Left wall
    const left = MeshBuilder.CreateBox("baseboard-left", {
      width: bd, height: bh, depth: OFFICE.DEPTH,
    }, this.scene);
    left.position = new Vector3(-OFFICE.WIDTH / 2 + bd / 2, bh / 2, OFFICE.DEPTH / 2);
    left.material = mat;
    left.parent = this.root;
  }

  private createCeilingLights(): void {
    const mat = this.materials.get("ceiling-light-fixture");
    const positions = [
      new Vector3(-2.5, OFFICE.HEIGHT - 0.02, 4),
      new Vector3(2.5, OFFICE.HEIGHT - 0.02, 4),
      new Vector3(-2.5, OFFICE.HEIGHT - 0.02, 8),
      new Vector3(2.5, OFFICE.HEIGHT - 0.02, 8),
      new Vector3(-2.5, OFFICE.HEIGHT - 0.02, 12),
      new Vector3(2.5, OFFICE.HEIGHT - 0.02, 12),
    ];

    positions.forEach((pos, i) => {
      const fixture = MeshBuilder.CreateBox(`ceiling-light-${i}`, {
        width: 1.0, height: 0.04, depth: 0.3,
      }, this.scene);
      fixture.position = pos;
      fixture.material = mat;
      fixture.parent = this.root;
    });
  }
}
