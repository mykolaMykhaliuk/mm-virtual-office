/**
 * Centralized input handling for keyboard and pointer lock.
 */

export type ActionCallback = () => void;

export class InputManager {
  private keysDown = new Set<string>();
  private actionCallbacks = new Map<string, ActionCallback>();
  private _pointerLocked = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    document.addEventListener("pointerlockchange", () => {
      this._pointerLocked = document.pointerLockElement === this.canvas;
    });
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keysDown.add(e.code);

    switch (e.code) {
      case "KeyE":
        this.actionCallbacks.get("interact")?.();
        break;
      case "Escape":
        this.actionCallbacks.get("cancel")?.();
        break;
      case "Digit1":
      case "Digit2":
      case "Digit3":
      case "Digit4":
      case "Digit5":
        this.actionCallbacks.get(`option${e.code.charAt(5)}`)?.();
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysDown.delete(e.code);
  };

  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  onAction(action: string, callback: ActionCallback): void {
    this.actionCallbacks.set(action, callback);
  }

  removeAction(action: string): void {
    this.actionCallbacks.delete(action);
  }

  get pointerLocked(): boolean {
    return this._pointerLocked;
  }

  requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
