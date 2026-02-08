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
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { SSAO2RenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline";

// Side-effect imports
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";

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
    scene.clearColor = new Color4(0.72, 0.84, 0.96, 1.0);
    scene.ambientColor = new Color3(0.25, 0.24, 0.26);
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
    ambient.intensity = 0.7;
    ambient.diffuse = new Color3(0.98, 0.97, 1.0);
    ambient.groundColor = new Color3(0.45, 0.42, 0.38);
    ambient.specular = new Color3(0.2, 0.2, 0.2);

    // Overhead fill lights — warm office fluorescents
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
      light.intensity = 0.4;
      light.diffuse = new Color3(1.0, 0.95, 0.88);
      light.specular = new Color3(0.8, 0.78, 0.72);
      light.range = 12;
    });

    // Window bounce fill light — simulates light bouncing off left wall floor
    const bounceLight = new HemisphericLight(
      "bounceLight",
      new Vector3(1, 0.3, 0),
      scene
    );
    bounceLight.intensity = 0.2;
    bounceLight.diffuse = new Color3(0.85, 0.9, 1.0);
    bounceLight.groundColor = new Color3(0.0, 0.0, 0.0);
    bounceLight.specular = new Color3(0.05, 0.05, 0.05);

    // Desk spot lights for focused work areas
    const deskSpots = [
      { pos: new Vector3(-4, 2.8, 6.5), target: new Vector3(-4, 0.76, 7) },
      { pos: new Vector3(3, 2.8, 6.5), target: new Vector3(3, 0.76, 7) },
    ];
    deskSpots.forEach((cfg, i) => {
      const dir = cfg.target.subtract(cfg.pos).normalize();
      const spot = new SpotLight(
        `deskSpot${i}`, cfg.pos, dir, Math.PI / 4, 2, scene
      );
      spot.intensity = 0.3;
      spot.diffuse = new Color3(1.0, 0.97, 0.92);
      spot.range = 5;
    });
  }

  private static createSunlight(scene: Scene): DirectionalLight {
    // Strong sunlight coming through large windows on the left wall
    const sun = new DirectionalLight(
      "sunLight",
      new Vector3(1, -0.5, 0.2).normalize(),
      scene
    );
    sun.intensity = 1.8;
    sun.diffuse = new Color3(1.0, 0.96, 0.88);
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
      scene.environmentIntensity = 0.6;
    } catch {
      // Graceful fallback — PBR will work without environment reflections
      console.warn("Environment texture unavailable; PBR reflections disabled.");
    }
  }

  /** Call after camera is created to enable SSAO ambient occlusion */
  static setupSSAO(scene: Scene): void {
    if (!scene.activeCamera) return;
    try {
      const ssao = new SSAO2RenderingPipeline("ssao", scene, {
        ssaoRatio: 0.5,
        blurRatio: 1,
      });
      ssao.radius = 1.5;
      ssao.totalStrength = 0.8;
      ssao.base = 0.1;
      ssao.samples = 16;
      ssao.maxZ = 50;
      ssao.minZAspect = 0.5;

      scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(
        "ssao",
        scene.activeCamera
      );
    } catch {
      console.warn("SSAO2 unavailable; continuing without ambient occlusion.");
    }
  }

  private static setupPostProcessing(scene: Scene): void {
    // Glow layer for emissive surfaces (monitor screens, window light)
    const glow = new GlowLayer("glowLayer", scene, {
      blurKernelSize: 32,
      mainTextureFixedSize: 512,
    });
    glow.intensity = 0.3;

    // Tone mapping and exposure — bright, airy feel
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.3;
    scene.imageProcessingConfiguration.contrast = 1.15;
  }
}
