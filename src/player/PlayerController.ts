/**
 * First-person player controller using UniversalCamera.
 * WASD movement, mouse look with pointer lock, collision handling.
 */

import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class PlayerController {
  readonly camera: UniversalCamera;
  private _enabled = true;

  constructor(
    private readonly scene: Scene,
    private readonly canvas: HTMLCanvasElement
  ) {
    this.camera = new UniversalCamera(
      "playerCamera",
      new Vector3(0, 3, 1.5),
      scene
    );

    this.configureCamera();
    this.setupPointerLock();
  }

  private configureCamera(): void {
    const cam = this.camera;

    // Look direction — into the office
    cam.setTarget(new Vector3(0, 1.6, 5));

    // WASD keys
    cam.keysUp = [87];    // W
    cam.keysDown = [83];  // S
    cam.keysLeft = [65];  // A
    cam.keysRight = [68]; // D

    // Movement
    cam.speed = 3.0;
    cam.inertia = 0.82;

    // Mouse look
    cam.angularSensibility = 2500;
    cam.minZ = 0.1;

    // Collision ellipsoid — player is ~1.7m tall, 0.4m radius
    cam.ellipsoid = new Vector3(0.4, 0.85, 0.4);
    cam.ellipsoidOffset = new Vector3(0, 0.85, 0);
    cam.checkCollisions = true;
    cam.applyGravity = true;

    cam.attachControl(this.canvas, true);
  }

  private setupPointerLock(): void {
    this.scene.onPointerDown = () => {
      if (!this._enabled) return;
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    };
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    if (value) {
      this.camera.attachControl(this.canvas, true);
    } else {
      this.camera.detachControl();
    }
  }

  get position(): Vector3 {
    return this.camera.position;
  }

  get forwardDirection(): Vector3 {
    return this.camera.getForwardRay(1).direction;
  }

  dispose(): void {
    this.camera.detachControl();
    this.camera.dispose();
  }
}
