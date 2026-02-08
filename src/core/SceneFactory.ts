/**
 * Scene creation, lighting, shadows, post-processing, and environment setup.
 * Configured for a bright, airy open-plan office with strong natural light
 * from large floor-to-ceiling windows on the left wall.
 */

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";

// Side-effect imports for shadow map support
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  sunLight: DirectionalLight;
  shadowGenerator: ShadowGenerator;
}

export class SceneFactory {
  static create(canvas: HTMLCanvasElement): SceneContext {
    const engine = new Engine(canvas, true, {
      stencil: true,
      antialias: true,
      adaptToDeviceRatio: true,
    });

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.65, 0.78, 0.92, 1.0);
    scene.ambientColor = new Color3(0.2, 0.2, 0.22);
    scene.collisionsEnabled = true;
    scene.gravity = new Vector3(0, -9.81 / 60, 0);

    SceneFactory.setupLighting(scene);
    const sunLight = SceneFactory.createSunlight(scene);
    const shadowGenerator = SceneFactory.createShadows(sunLight);
    SceneFactory.setupEnvironment(scene);
    SceneFactory.setupPostProcessing(scene);

    return { engine, scene, sunLight, shadowGenerator };
  }

  private static setupLighting(scene: Scene): void {
    // Bright ambient hemisphere light — simulates bright daylight sky
    const ambient = new HemisphericLight(
      "ambientLight",
      new Vector3(0, 1, 0),
      scene
    );
    ambient.intensity = 0.65;
    ambient.diffuse = new Color3(0.98, 0.97, 1.0);
    ambient.groundColor = new Color3(0.4, 0.38, 0.35);
    ambient.specular = new Color3(0.15, 0.15, 0.15);

    // Overhead fill lights — larger office needs more coverage
    const ceilingPositions = [
      new Vector3(-4, 3.1, 4),
      new Vector3(0, 3.1, 4),
      new Vector3(4, 3.1, 4),
      new Vector3(-4, 3.1, 9),
      new Vector3(0, 3.1, 9),
      new Vector3(4, 3.1, 9),
      new Vector3(-4, 3.1, 14),
      new Vector3(0, 3.1, 14),
      new Vector3(4, 3.1, 14),
    ];

    ceilingPositions.forEach((pos, i) => {
      const light = new PointLight(`ceilingLight${i}`, pos, scene);
      light.intensity = 0.35;
      light.diffuse = new Color3(1.0, 0.97, 0.92);
      light.range = 10;
    });
  }

  private static createSunlight(scene: Scene): DirectionalLight {
    // Strong sunlight coming through large windows on the left wall
    const sun = new DirectionalLight(
      "sunLight",
      new Vector3(1, -0.5, 0.2).normalize(),
      scene
    );
    sun.intensity = 1.6;
    sun.diffuse = new Color3(1.0, 0.97, 0.9);
    sun.specular = new Color3(1.0, 0.98, 0.94);
    sun.position = new Vector3(-12, 8, 9);

    return sun;
  }

  private static createShadows(light: DirectionalLight): ShadowGenerator {
    const generator = new ShadowGenerator(2048, light);
    generator.usePercentageCloserFiltering = true;
    generator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    generator.bias = 0.001;
    generator.normalBias = 0.02;
    generator.darkness = 0.35;

    return generator;
  }

  private static setupEnvironment(scene: Scene): void {
    // Use a prefiltered environment texture for PBR reflections
    try {
      const envTexture = CubeTexture.CreateFromPrefilteredData(
        "https://assets.babylonjs.com/environments/environmentSpecular.env",
        scene
      );
      scene.environmentTexture = envTexture;
      scene.environmentIntensity = 0.5;
    } catch {
      // Graceful fallback — PBR will work without environment reflections
      console.warn("Environment texture unavailable; PBR reflections disabled.");
    }
  }

  private static setupPostProcessing(scene: Scene): void {
    // Glow layer for emissive surfaces (monitor screens, window light)
    const glow = new GlowLayer("glowLayer", scene, {
      blurKernelSize: 32,
      mainTextureFixedSize: 512,
    });
    glow.intensity = 0.25;

    // Tone mapping and exposure — bright, airy feel
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.25;
    scene.imageProcessingConfiguration.contrast = 1.1;
  }
}
