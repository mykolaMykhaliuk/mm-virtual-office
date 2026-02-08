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
      // ── Floors & Walls ────────────────────────────────────────
      case "floor-wood":
        // Polished concrete floor (gray) — matching modern co-working space
        mat.albedoColor = new Color3(0.62, 0.60, 0.57);
        mat.metallic = 0.05;
        mat.roughness = 0.45;
        break;

      case "wall-paint":
        mat.albedoColor = new Color3(0.95, 0.94, 0.92);
        mat.metallic = 0.0;
        mat.roughness = 0.9;
        break;

      case "ceiling-white":
        mat.albedoColor = new Color3(0.97, 0.97, 0.97);
        mat.metallic = 0.0;
        mat.roughness = 0.95;
        break;

      case "wall-brick":
        mat.albedoColor = new Color3(0.72, 0.58, 0.48);
        mat.metallic = 0.0;
        mat.roughness = 0.92;
        break;

      // ── Desk Materials ────────────────────────────────────────
      case "desk-wood":
        // Dark wood modesty panel
        mat.albedoColor = new Color3(0.35, 0.22, 0.12);
        mat.metallic = 0.0;
        mat.roughness = 0.55;
        break;

      case "desk-surface":
        // Light natural wood desk top — matching photo
        mat.albedoColor = new Color3(0.78, 0.65, 0.48);
        mat.metallic = 0.0;
        mat.roughness = 0.45;
        break;

      case "desk-frame":
        // Black metal desk frame/legs
        mat.albedoColor = new Color3(0.08, 0.08, 0.08);
        mat.metallic = 0.85;
        mat.roughness = 0.35;
        break;

      // ── Chair ─────────────────────────────────────────────────
      case "chair-fabric":
        mat.albedoColor = new Color3(0.15, 0.15, 0.17);
        mat.metallic = 0.0;
        mat.roughness = 0.85;
        break;

      // ── Monitors & Tech ───────────────────────────────────────
      case "monitor-frame":
        mat.albedoColor = new Color3(0.05, 0.05, 0.06);
        mat.metallic = 0.1;
        mat.roughness = 0.6;
        break;

      case "monitor-screen":
        mat.albedoColor = new Color3(0.05, 0.08, 0.15);
        mat.metallic = 0.0;
        mat.roughness = 0.2;
        mat.emissiveColor = new Color3(0.12, 0.18, 0.3);
        break;

      case "monitor-screen-code":
        // Code editor screen (darker, green/blue tints)
        mat.albedoColor = new Color3(0.04, 0.06, 0.1);
        mat.metallic = 0.0;
        mat.roughness = 0.15;
        mat.emissiveColor = new Color3(0.08, 0.15, 0.12);
        break;

      case "monitor-screen-ui":
        // UI/design screen (brighter, orange/white)
        mat.albedoColor = new Color3(0.08, 0.07, 0.1);
        mat.metallic = 0.0;
        mat.roughness = 0.15;
        mat.emissiveColor = new Color3(0.2, 0.15, 0.1);
        break;

      case "laptop-body":
        mat.albedoColor = new Color3(0.72, 0.72, 0.74);
        mat.metallic = 0.9;
        mat.roughness = 0.2;
        break;

      case "laptop-screen":
        mat.albedoColor = new Color3(0.06, 0.08, 0.12);
        mat.metallic = 0.0;
        mat.roughness = 0.15;
        mat.emissiveColor = new Color3(0.1, 0.12, 0.18);
        break;

      case "laptop-keyboard":
        mat.albedoColor = new Color3(0.12, 0.12, 0.13);
        mat.metallic = 0.3;
        mat.roughness = 0.5;
        break;

      // ── Metals ────────────────────────────────────────────────
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

      case "metal-black":
        mat.albedoColor = new Color3(0.06, 0.06, 0.07);
        mat.metallic = 0.85;
        mat.roughness = 0.3;
        break;

      // ── Glass ─────────────────────────────────────────────────
      case "glass-window":
        mat.albedoColor = new Color3(0.88, 0.93, 1.0);
        mat.metallic = 0.0;
        mat.roughness = 0.02;
        mat.alpha = 0.25;
        mat.emissiveColor = new Color3(0.75, 0.85, 1.0);
        break;

      case "glass-partition":
        mat.albedoColor = new Color3(0.9, 0.92, 0.95);
        mat.metallic = 0.0;
        mat.roughness = 0.05;
        mat.alpha = 0.15;
        break;

      // ── People ────────────────────────────────────────────────
      case "skin":
        mat.albedoColor = new Color3(0.82, 0.65, 0.53);
        mat.metallic = 0.0;
        mat.roughness = 0.75;
        break;

      case "clothing-blazer":
        // Tan/beige blazer (woman in photo)
        mat.albedoColor = new Color3(0.62, 0.55, 0.42);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "clothing-blouse":
        // Light cream/white blouse under blazer
        mat.albedoColor = new Color3(0.9, 0.87, 0.82);
        mat.metallic = 0.0;
        mat.roughness = 0.75;
        break;

      case "clothing-hoodie":
        // Olive/khaki hoodie (man in photo)
        mat.albedoColor = new Color3(0.42, 0.40, 0.32);
        mat.metallic = 0.0;
        mat.roughness = 0.85;
        break;

      case "clothing-blue":
        mat.albedoColor = new Color3(0.2, 0.3, 0.55);
        mat.metallic = 0.0;
        mat.roughness = 0.8;
        break;

      case "clothing-dark":
        // Dark jeans
        mat.albedoColor = new Color3(0.15, 0.17, 0.22);
        mat.metallic = 0.0;
        mat.roughness = 0.8;
        break;

      case "hair-dark":
        mat.albedoColor = new Color3(0.12, 0.08, 0.06);
        mat.metallic = 0.0;
        mat.roughness = 0.65;
        break;

      case "hair-brown":
        mat.albedoColor = new Color3(0.32, 0.2, 0.12);
        mat.metallic = 0.0;
        mat.roughness = 0.65;
        break;

      // ── Plants ────────────────────────────────────────────────
      case "plant-green":
        mat.albedoColor = new Color3(0.18, 0.48, 0.15);
        mat.metallic = 0.0;
        mat.roughness = 0.7;
        break;

      case "plant-pot":
        // Terracotta / warm orange pot — matching photo
        mat.albedoColor = new Color3(0.78, 0.42, 0.22);
        mat.metallic = 0.0;
        mat.roughness = 0.82;
        break;

      // ── Furniture ─────────────────────────────────────────────
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

      // ── Accessories ───────────────────────────────────────────
      case "headphones":
        mat.albedoColor = new Color3(0.1, 0.1, 0.12);
        mat.metallic = 0.3;
        mat.roughness = 0.4;
        break;

      case "mug-white":
        mat.albedoColor = new Color3(0.92, 0.91, 0.89);
        mat.metallic = 0.0;
        mat.roughness = 0.35;
        break;

      case "notebook":
        mat.albedoColor = new Color3(0.88, 0.85, 0.78);
        mat.metallic = 0.0;
        mat.roughness = 0.8;
        break;

      case "pen-dark":
        mat.albedoColor = new Color3(0.08, 0.08, 0.1);
        mat.metallic = 0.4;
        mat.roughness = 0.3;
        break;

      case "radiator":
        mat.albedoColor = new Color3(0.9, 0.88, 0.85);
        mat.metallic = 0.6;
        mat.roughness = 0.4;
        break;

      // ── Structure ─────────────────────────────────────────────
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

      case "window-frame":
        mat.albedoColor = new Color3(0.12, 0.12, 0.13);
        mat.metallic = 0.85;
        mat.roughness = 0.3;
        break;

      default:
        mat.albedoColor = new Color3(0.5, 0.5, 0.5);
        mat.metallic = 0.0;
        mat.roughness = 0.5;
    }

    return mat;
  }
}
