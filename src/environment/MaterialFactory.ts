/**
 * PBR material factory. Caches materials by name for reuse.
 * Includes procedural textures for realistic surface appearance.
 */

import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

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

  // ── Procedural Texture Generators ──────────────────────────────

  /** Creates a polished concrete / stone floor texture */
  private createFloorTexture(): DynamicTexture {
    const size = 512;
    const tex = new DynamicTexture("floor-tex", size, this.scene, true);
    const ctx = tex.getContext();

    // Base concrete color
    ctx.fillStyle = "#9e9a94";
    ctx.fillRect(0, 0, size, size);

    // Subtle noise / variation for polished concrete
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise - 3));
    }

    // Add subtle tile grid lines (polished concrete slabs)
    const tileSize = size / 4;
    ctx.putImageData(imageData, 0, 0);
    ctx.strokeStyle = "rgba(80, 78, 74, 0.3)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= size; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Add some larger subtle stain patches for realism
    for (let p = 0; p < 8; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const radius = 20 + Math.random() * 40;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, "rgba(140, 135, 128, 0.12)");
      gradient.addColorStop(1, "rgba(140, 135, 128, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    tex.update();
    tex.uScale = 3;
    tex.vScale = 3;
    return tex;
  }

  /** Creates a bump/normal-like texture for the floor */
  private createFloorBumpTexture(): DynamicTexture {
    const size = 256;
    const tex = new DynamicTexture("floor-bump", size, this.scene, true);
    const ctx = tex.getContext();

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15;
      const val = 128 + noise;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);

    // Tile grid bump lines
    const tileSize = size / 4;
    ctx.strokeStyle = "rgba(60, 60, 60, 0.4)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= size; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    tex.update();
    tex.uScale = 3;
    tex.vScale = 3;
    return tex;
  }

  /** Creates a wall paint texture with subtle plaster variation */
  private createWallTexture(): DynamicTexture {
    const size = 512;
    const tex = new DynamicTexture("wall-tex", size, this.scene, true);
    const ctx = tex.getContext();

    // Base off-white paint
    ctx.fillStyle = "#f2f0ec";
    ctx.fillRect(0, 0, size, size);

    // Fine plaster grain noise
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Very subtle vertical streaks (roller marks)
    for (let s = 0; s < 30; s++) {
      const sx = Math.random() * size;
      ctx.strokeStyle = `rgba(230, 228, 224, ${0.1 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5 + Math.random() * 1;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 4, size);
      ctx.stroke();
    }

    tex.update();
    tex.uScale = 2;
    tex.vScale = 2;
    return tex;
  }

  /** Creates a wall bump texture */
  private createWallBumpTexture(): DynamicTexture {
    const size = 256;
    const tex = new DynamicTexture("wall-bump", size, this.scene, true);
    const ctx = tex.getContext();

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    // Fine plaster bump grain
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      const val = 128 + noise;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);

    tex.update();
    tex.uScale = 2;
    tex.vScale = 2;
    return tex;
  }

  /** Creates an acoustic ceiling tile texture */
  private createCeilingTexture(): DynamicTexture {
    const size = 512;
    const tex = new DynamicTexture("ceiling-tex", size, this.scene, true);
    const ctx = tex.getContext();

    // Base white
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, size, size);

    // Fine stipple noise (acoustic tile dots)
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Acoustic tile grid
    const tileSize = size / 4;
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= size; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    tex.update();
    tex.uScale = 4;
    tex.vScale = 4;
    return tex;
  }

  /** Creates a wood grain texture for desk surfaces */
  private createWoodTexture(): DynamicTexture {
    const size = 512;
    const tex = new DynamicTexture("wood-tex", size, this.scene, true);
    const ctx = tex.getContext();

    // Base wood color
    ctx.fillStyle = "#c4a67a";
    ctx.fillRect(0, 0, size, size);

    // Wood grain lines
    for (let i = 0; i < 60; i++) {
      const y = Math.random() * size;
      const opacity = 0.05 + Math.random() * 0.12;
      ctx.strokeStyle = `rgba(140, 95, 50, ${opacity})`;
      ctx.lineWidth = 0.5 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      // Wavy grain line
      for (let x = 0; x < size; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
      }
      ctx.stroke();
    }

    // Subtle knots
    for (let k = 0; k < 2; k++) {
      const kx = Math.random() * size;
      const ky = Math.random() * size;
      const gradient = ctx.createRadialGradient(kx, ky, 0, kx, ky, 15);
      gradient.addColorStop(0, "rgba(120, 80, 40, 0.2)");
      gradient.addColorStop(1, "rgba(120, 80, 40, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(kx, ky, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    tex.update();
    tex.uScale = 2;
    tex.vScale = 2;
    return tex;
  }

  // ── Material Creation ──────────────────────────────────────────

  private createMaterial(name: string): PBRMaterial {
    const mat = new PBRMaterial(name, this.scene);

    switch (name) {
      // ── Floors & Walls ────────────────────────────────────────
      case "floor-wood": {
        // Polished concrete floor with procedural texture
        mat.albedoColor = new Color3(0.62, 0.60, 0.57);
        mat.metallic = 0.08;
        mat.roughness = 0.35;
        mat.albedoTexture = this.createFloorTexture();
        mat.bumpTexture = this.createFloorBumpTexture();
        (mat.bumpTexture as Texture).level = 0.3;
        // Slight specular reflection for polished concrete
        mat.reflectivityColor = new Color3(0.15, 0.15, 0.15);
        mat.environmentIntensity = 0.3;
        break;
      }

      case "wall-paint": {
        mat.albedoColor = new Color3(0.95, 0.94, 0.92);
        mat.metallic = 0.0;
        mat.roughness = 0.85;
        mat.albedoTexture = this.createWallTexture();
        mat.bumpTexture = this.createWallBumpTexture();
        (mat.bumpTexture as Texture).level = 0.15;
        break;
      }

      case "ceiling-white": {
        mat.albedoColor = new Color3(0.97, 0.97, 0.97);
        mat.metallic = 0.0;
        mat.roughness = 0.92;
        mat.albedoTexture = this.createCeilingTexture();
        break;
      }

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

      case "desk-surface": {
        // Light natural wood desk top with grain texture
        mat.albedoColor = new Color3(0.78, 0.65, 0.48);
        mat.metallic = 0.0;
        mat.roughness = 0.4;
        mat.albedoTexture = this.createWoodTexture();
        break;
      }

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
        mat.roughness = 0.15;
        mat.emissiveColor = new Color3(0.18, 0.25, 0.4);
        break;

      case "monitor-screen-code":
        // Code editor screen (darker, green/blue tints)
        mat.albedoColor = new Color3(0.04, 0.06, 0.1);
        mat.metallic = 0.0;
        mat.roughness = 0.12;
        mat.emissiveColor = new Color3(0.12, 0.22, 0.18);
        break;

      case "monitor-screen-ui":
        // UI/design screen (brighter, orange/white)
        mat.albedoColor = new Color3(0.08, 0.07, 0.1);
        mat.metallic = 0.0;
        mat.roughness = 0.12;
        mat.emissiveColor = new Color3(0.28, 0.22, 0.15);
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
        mat.metallic = 0.05;
        mat.roughness = 0.02;
        mat.alpha = 0.2;
        mat.emissiveColor = new Color3(0.8, 0.88, 1.0);
        mat.reflectivityColor = new Color3(0.3, 0.3, 0.3);
        mat.indexOfRefraction = 1.52;
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
        mat.roughness = 0.7;
        mat.subSurface.isTranslucencyEnabled = true;
        mat.subSurface.translucencyIntensity = 0.15;
        mat.subSurface.tintColor = new Color3(0.9, 0.45, 0.35);
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
        mat.albedoColor = new Color3(0.2, 0.52, 0.17);
        mat.metallic = 0.0;
        mat.roughness = 0.65;
        // Subtle subsurface scattering effect via translucency
        mat.subSurface.isTranslucencyEnabled = true;
        mat.subSurface.translucencyIntensity = 0.3;
        mat.subSurface.tintColor = new Color3(0.15, 0.4, 0.1);
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
        mat.albedoColor = new Color3(0.95, 0.95, 0.97);
        mat.metallic = 0.2;
        mat.roughness = 0.2;
        mat.emissiveColor = new Color3(1.0, 0.97, 0.9);
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
