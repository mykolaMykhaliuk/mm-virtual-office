/**
 * Scene creation, lighting, shadows, post-processing, and environment setup.
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

// Side-effect imports
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/standardMaterial";

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
    scene.clearColor = new Color4(0.53, 0.72, 0.88, 1.0);
    scene.ambientColor = new Color3(0.15, 0.15, 0.18);
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
    // Ambient hemisphere light — simulates sky dome
    const ambient = new HemisphericLight(
      "ambientLight",
      new Vector3(0, 1, 0),
      scene
    );
    ambient.intensity = 0.5;
    ambient.diffuse = new Color3(0.95, 0.95, 1.0);
    ambient.groundColor = new Color3(0.3, 0.28, 0.25);
    ambient.specular = new Color3(0.1, 0.1, 0.1);

    // Overhead fill lights — simulating recessed ceiling lighting
    const ceilingPositions = [
      new Vector3(-2.5, 2.9, 4),
      new Vector3(2.5, 2.9, 4),
      new Vector3(-2.5, 2.9, 8),
      new Vector3(2.5, 2.9, 8),
      new Vector3(-2.5, 2.9, 12),
      new Vector3(2.5, 2.9, 12),
    ];

    ceilingPositions.forEach((pos, i) => {
      const light = new PointLight(`ceilingLight${i}`, pos, scene);
      light.intensity = 0.4;
      light.diffuse = new Color3(1.0, 0.97, 0.92);
      light.range = 8;
    });
  }

  private static createSunlight(scene: Scene): DirectionalLight {
    // Sunlight coming through windows on the left wall
    const sun = new DirectionalLight(
      "sunLight",
      new Vector3(1, -0.7, 0.3).normalize(),
      scene
    );
    sun.intensity = 1.2;
    sun.diffuse = new Color3(1.0, 0.96, 0.88);
    sun.specular = new Color3(1.0, 0.98, 0.92);
    sun.position = new Vector3(-8, 6, 7);

    return sun;
  }

  private static createShadows(light: DirectionalLight): ShadowGenerator {
    const generator = new ShadowGenerator(2048, light);
    generator.usePercentageCloserFiltering = true;
    generator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    generator.bias = 0.001;
    generator.normalBias = 0.02;
    generator.darkness = 0.4;

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
      scene.environmentIntensity = 0.4;
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
    glow.intensity = 0.3;

    // Tone mapping and exposure
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.1;
    scene.imageProcessingConfiguration.contrast = 1.15;
  }
}
