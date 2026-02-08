/**
 * Constructs the office shell: floor, ceiling, walls, windows, entrance.
 * Open-plan co-working space with large windows, glass partitions, and
 * industrial-modern aesthetic matching the reference photo.
 *
 * Office dimensions: 16m wide (x: -8..+8) × 18m deep (z: 0..18) × 3.2m tall.
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
import "@babylonjs/core/Meshes/Builders/cylinderBuilder";

export const OFFICE = {
  WIDTH: 16,
  DEPTH: 18,
  HEIGHT: 3.2,
  WALL_THICKNESS: 0.15,
  ENTRANCE_WIDTH: 1.8,
  ENTRANCE_HEIGHT: 2.6,
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
    this.createWindowFrames();
    this.createRadiators();
    this.createEntranceDoorFrame();
    this.createBaseboards();
    this.createCeilingLights();
    this.createGlassPartitions();
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

    // Left wall (x = -WIDTH/2) — with large window gaps
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

    // Large floor-to-ceiling windows on left wall
    // Window openings: 0.3m sill, up to 2.8m top (nearly floor-to-ceiling)
    // 4 large window bays with narrow mullions between them
    const windowSill = 0.3;
    const windowTop = 2.8;

    // Below windows — full length strip (thin sill)
    this.createWallSegment("left-below", t, windowSill, d + 2 * t, new Vector3(x, windowSill / 2, d / 2));
    // Above windows — full length strip
    this.createWallSegment("left-above", t, h - windowTop, d + 2 * t, new Vector3(x, windowTop + (h - windowTop) / 2, d / 2));

    // Mullion columns between window bays
    const mullionWidth = 0.15;
    const mullionH = windowTop - windowSill;
    const mullionY = windowSill + mullionH / 2;
    const mullionPositions = [0, 4.5, 9, 13.5, 18];

    for (let i = 0; i < mullionPositions.length; i++) {
      this.createWallSegment(
        `left-mullion-${i}`, t, mullionH, mullionWidth,
        new Vector3(x, mullionY, mullionPositions[i])
      );
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
    // 4 large window panes on left wall (floor-to-ceiling style)
    const windowSill = 0.3;
    const windowHeight = 2.5;
    const x = -OFFICE.WIDTH / 2 - 0.01;

    const windowBays = [
      { z: 2.25, width: 4.2 },
      { z: 6.75, width: 4.2 },
      { z: 11.25, width: 4.2 },
      { z: 15.75, width: 4.2 },
    ];

    for (let i = 0; i < windowBays.length; i++) {
      const cfg = windowBays[i];
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

  private createWindowFrames(): void {
    const x = -OFFICE.WIDTH / 2 + 0.01;
    const frameMat = this.materials.get("window-frame");
    const windowSill = 0.3;
    const windowTop = 2.8;

    // Horizontal sill and header bars across the full wall
    const sill = MeshBuilder.CreateBox("window-sill", {
      width: 0.08, height: 0.04, depth: OFFICE.DEPTH,
    }, this.scene);
    sill.position = new Vector3(x, windowSill, OFFICE.DEPTH / 2);
    sill.material = frameMat;
    sill.parent = this.root;

    const header = MeshBuilder.CreateBox("window-header", {
      width: 0.08, height: 0.04, depth: OFFICE.DEPTH,
    }, this.scene);
    header.position = new Vector3(x, windowTop, OFFICE.DEPTH / 2);
    header.material = frameMat;
    header.parent = this.root;
  }

  private createRadiators(): void {
    // Radiators below windows on left wall
    const mat = this.materials.get("radiator");
    const x = -OFFICE.WIDTH / 2 + 0.15;
    const radiatorPositions = [2.25, 6.75, 11.25, 15.75];

    for (let i = 0; i < radiatorPositions.length; i++) {
      const radiator = MeshBuilder.CreateBox(`radiator-${i}`, {
        width: 0.06, height: 0.5, depth: 2.0,
      }, this.scene);
      radiator.position = new Vector3(x, 0.28, radiatorPositions[i]);
      radiator.material = mat;
      radiator.parent = this.root;

      // Radiator fins (simplified)
      for (let f = 0; f < 8; f++) {
        const fin = MeshBuilder.CreateBox(`radiator-fin-${i}-${f}`, {
          width: 0.04, height: 0.44, depth: 0.02,
        }, this.scene);
        fin.position = new Vector3(x, 0.28, radiatorPositions[i] - 0.8 + f * 0.22);
        fin.material = mat;
        fin.parent = this.root;
      }
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
  }

  private createCeilingLights(): void {
    const mat = this.materials.get("ceiling-light-fixture");
    const positions = [
      new Vector3(-4, OFFICE.HEIGHT - 0.02, 4),
      new Vector3(0, OFFICE.HEIGHT - 0.02, 4),
      new Vector3(4, OFFICE.HEIGHT - 0.02, 4),
      new Vector3(-4, OFFICE.HEIGHT - 0.02, 9),
      new Vector3(0, OFFICE.HEIGHT - 0.02, 9),
      new Vector3(4, OFFICE.HEIGHT - 0.02, 9),
      new Vector3(-4, OFFICE.HEIGHT - 0.02, 14),
      new Vector3(0, OFFICE.HEIGHT - 0.02, 14),
      new Vector3(4, OFFICE.HEIGHT - 0.02, 14),
    ];

    positions.forEach((pos, i) => {
      const fixture = MeshBuilder.CreateBox(`ceiling-light-${i}`, {
        width: 1.2, height: 0.04, depth: 0.3,
      }, this.scene);
      fixture.position = pos;
      fixture.material = mat;
      fixture.parent = this.root;
    });
  }

  private createGlassPartitions(): void {
    const glassMat = this.materials.get("glass-partition");
    const frameMat = this.materials.get("metal-black");

    // Glass partition at back of office (visible in background of photo)
    const partition1 = MeshBuilder.CreatePlane("glass-partition-1", {
      width: 6, height: 2.8,
    }, this.scene);
    partition1.position = new Vector3(2, 1.4, 15);
    partition1.material = glassMat;
    partition1.parent = this.root;

    // Frame for partition
    const frame1 = MeshBuilder.CreateBox("partition-frame-1", {
      width: 0.04, height: 2.8, depth: 0.04,
    }, this.scene);
    frame1.position = new Vector3(-1, 1.4, 15);
    frame1.material = frameMat;
    frame1.parent = this.root;

    const frame2 = MeshBuilder.CreateBox("partition-frame-2", {
      width: 0.04, height: 2.8, depth: 0.04,
    }, this.scene);
    frame2.position = new Vector3(5, 1.4, 15);
    frame2.material = frameMat;
    frame2.parent = this.root;

    // Second partition at angle
    const partition2 = MeshBuilder.CreatePlane("glass-partition-2", {
      width: 5, height: 2.8,
    }, this.scene);
    partition2.position = new Vector3(5.5, 1.4, 12);
    partition2.rotation.y = Math.PI / 2;
    partition2.material = glassMat;
    partition2.parent = this.root;
  }
}
