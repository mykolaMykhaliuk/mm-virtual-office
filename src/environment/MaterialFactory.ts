/**
 * PBR material factory. Caches materials by name for reuse.
 */

import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";

export class MaterialFactory {
  private cache = new Map<string, PBRMaterial>();

  constructor(private readonly scene: Scene) {}

  get(name: string): PBRMaterial {
    const cached = this.cache.get(name);
    if (cached) return cached;

    const mat = this.createMaterial(name);
    this.cache.set(name, mat);
    return mat;
  }

  private createMaterial(name: string): PBRMaterial {
    const mat = new PBRMaterial(name, this.scene);

    switch (name) {
      case "floor-wood":
        mat.albedoColor = new Color3(0.55, 0.38, 0.22);
        mat.metallic = 0.0;
        mat.roughness = 0.65;
        break;

      case "wall-paint":
        mat.albedoColor = new Color3(0.92, 0.91, 0.88);
        mat.metallic = 0.0;
        mat.roughness = 0.9;
        break;

      case "ceiling-white":
        mat.albedoColor = new Color3(0.96, 0.96, 0.96);
        mat.metallic = 0.0;
        mat.roughness = 0.95;
        break;

      case "desk-wood":
        mat.albedoColor = new Color3(0.35, 0.22, 0.12);
        mat.metallic = 0.0;
        mat.roughness = 0.55;
        break;

      case "desk-surface":
        mat.albedoColor = new Color3(0.82, 0.78, 0.72);
        mat.metallic = 0.0;
        mat.roughness = 0.4;
        break;

      case "chair-fabric":
        mat.albedoColor = new Color3(0.18, 0.18, 0.2);
        mat.metallic = 0.0;
        mat.roughness = 0.85;
        break;

      case "monitor-frame":
        mat.albedoColor = new Color3(0.05, 0.05, 0.06);
        mat.metallic = 0.1;
        mat.roughness = 0.6;
        break;

      case "monitor-screen":
        mat.albedoColor = new Color3(0.05, 0.08, 0.15);
        mat.metallic = 0.0;
        mat.roughness = 0.2;
        mat.emissiveColor = new Color3(0.1, 0.15, 0.25);
        break;

      case "metal-chrome":
        mat.albedoColor = new Color3(0.8, 0.8, 0.82);
        mat.metallic = 0.95;
        mat.roughness = 0.15;
        break;

      case "metal-dark":
        mat.albedoColor = new Color3(0.2, 0.2, 0.22);
        mat.metallic = 0.8;
        mat.roughness = 0.3;
        break;

      case "glass-window":
        mat.albedoColor = new Color3(0.85, 0.92, 1.0);
        mat.metallic = 0.0;
        mat.roughness = 0.05;
        mat.alpha = 0.3;
        mat.emissiveColor = new Color3(0.7, 0.8, 0.95);
        break;

      case "skin":
        mat.albedoColor = new Color3(0.82, 0.65, 0.53);
        mat.metallic = 0.0;
        mat.roughness = 0.75;
        break;

      case "clothing-blue":
        mat.albedoColor = new Color3(0.2, 0.3, 0.55);
        mat.metallic = 0.0;
        mat.roughness = 0.8;
        break;

      case "clothing-dark":
        mat.albedoColor = new Color3(0.12, 0.12, 0.15);
        mat.metallic = 0.0;
        mat.roughness = 0.8;
        break;

      case "hair-dark":
        mat.albedoColor = new Color3(0.08, 0.06, 0.05);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "hair-brown":
        mat.albedoColor = new Color3(0.3, 0.18, 0.1);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "plant-green":
        mat.albedoColor = new Color3(0.15, 0.45, 0.12);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "plant-pot":
        mat.albedoColor = new Color3(0.6, 0.4, 0.25);
        mat.metallic = 0.0;
        mat.roughness = 0.85;
        break;

      case "leather-couch":
        mat.albedoColor = new Color3(0.25, 0.2, 0.15);
        mat.metallic = 0.0;
        mat.roughness = 0.5;
        break;

      case "bookshelf-wood":
        mat.albedoColor = new Color3(0.42, 0.28, 0.16);
        mat.metallic = 0.0;
        mat.roughness = 0.6;
        break;

      case "book-red":
        mat.albedoColor = new Color3(0.6, 0.12, 0.1);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "book-blue":
        mat.albedoColor = new Color3(0.1, 0.15, 0.5);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "book-green":
        mat.albedoColor = new Color3(0.1, 0.35, 0.12);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "carpet":
        mat.albedoColor = new Color3(0.3, 0.32, 0.35);
        mat.metallic = 0.0;
        mat.roughness = 0.95;
        break;

      case "headphones":
        mat.albedoColor = new Color3(0.1, 0.1, 0.12);
        mat.metallic = 0.3;
        mat.roughness = 0.4;
        break;

      case "door-frame":
        mat.albedoColor = new Color3(0.85, 0.83, 0.78);
        mat.metallic = 0.0;
        mat.roughness = 0.6;
        break;

      case "baseboard":
        mat.albedoColor = new Color3(0.88, 0.86, 0.82);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "whiteboard":
        mat.albedoColor = new Color3(0.95, 0.95, 0.96);
        mat.metallic = 0.0;
        mat.roughness = 0.3;
        break;

      case "ceiling-light-fixture":
        mat.albedoColor = new Color3(0.9, 0.9, 0.92);
        mat.metallic = 0.4;
        mat.roughness = 0.3;
        mat.emissiveColor = new Color3(0.9, 0.88, 0.82);
        break;

      default:
        mat.albedoColor = new Color3(0.5, 0.5, 0.5);
        mat.metallic = 0.0;
        mat.roughness = 0.5;
    }

    return mat;
  }
}
