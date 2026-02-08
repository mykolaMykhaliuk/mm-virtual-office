/**
 * Full-screen dialogue overlay built with HTML/CSS for crisp text rendering.
 * Listens to DialogueStateMachine events and renders nodes + options.
 */

import { DialogueNode, DialogueOption, DialogueStateMachine } from "./DialogueStateMachine";

export class DialogueUI {
  private container: HTMLDivElement;
  private speakerEl: HTMLDivElement;
  private textEl: HTMLDivElement;
  private optionsEl: HTMLDivElement;
  private _visible = false;

  /** Called when the player picks an option */
  onOptionSelected: ((index: number) => void) | null = null;

  constructor(private readonly stateMachine: DialogueStateMachine) {
    this.container = this.buildDOM();
    this.speakerEl = this.container.querySelector("#dlg-speaker") as HTMLDivElement;
    this.textEl = this.container.querySelector("#dlg-text") as HTMLDivElement;
    this.optionsEl = this.container.querySelector("#dlg-options") as HTMLDivElement;

    document.body.appendChild(this.container);

    // Wire up state machine callbacks
    this.stateMachine.onNodeChanged = (node, options) => this.renderNode(node, options);
    this.stateMachine.onDialogueEnd = () => this.hide();

    // Keyboard shortcuts for options (1-5)
    window.addEventListener("keydown", this.onKeyDown);
  }

  get visible(): boolean {
    return this._visible;
  }

  show(): void {
    this._visible = true;
    this.container.style.display = "flex";
  }

  hide(): void {
    this._visible = false;
    this.container.style.display = "none";
  }

  private renderNode(node: DialogueNode, availableOptions: DialogueOption[]): void {
    this.show();
    this.speakerEl.textContent = node.speaker;
    this.textEl.textContent = node.text;

    // Clear old options
    this.optionsEl.innerHTML = "";

    availableOptions.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "dlg-option-btn";
      btn.innerHTML = `<span class="dlg-option-key">${i + 1}</span> ${this.escapeHtml(opt.text)}`;
      btn.addEventListener("click", () => this.selectOption(i));
      this.optionsEl.appendChild(btn);
    });
  }

  private selectOption(index: number): void {
    this.onOptionSelected?.(index);
    this.stateMachine.selectOption(index);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this._visible) return;

    const keyNum = parseInt(e.key, 10);
    if (keyNum >= 1 && keyNum <= 9) {
      const options = this.stateMachine.getAvailableOptions();
      if (keyNum <= options.length) {
        this.selectOption(keyNum - 1);
      }
    }
  };

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private buildDOM(): HTMLDivElement {
    const container = document.createElement("div");
    container.id = "dialogue-overlay";
    container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      padding: 0 5%;
      z-index: 200;
      pointer-events: none;
    `;

    const panel = document.createElement("div");
    panel.id = "dlg-panel";
    panel.style.cssText = `
      width: 100%;
      max-width: 800px;
      background: rgba(10, 15, 30, 0.92);
      border: 1px solid rgba(120, 160, 220, 0.3);
      border-bottom: none;
      border-radius: 12px 12px 0 0;
      padding: 24px 32px 20px;
      pointer-events: auto;
      backdrop-filter: blur(12px);
      box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5);
      font-family: 'Segoe UI', system-ui, sans-serif;
    `;
    container.appendChild(panel);

    const speaker = document.createElement("div");
    speaker.id = "dlg-speaker";
    speaker.style.cssText = `
      font-size: 14px;
      font-weight: 600;
      color: #7ab8f5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    `;
    panel.appendChild(speaker);

    const text = document.createElement("div");
    text.id = "dlg-text";
    text.style.cssText = `
      font-size: 17px;
      line-height: 1.55;
      color: #e0e4ec;
      margin-bottom: 20px;
      min-height: 48px;
    `;
    panel.appendChild(text);

    const divider = document.createElement("div");
    divider.style.cssText = `
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(120, 160, 220, 0.3), transparent);
      margin-bottom: 14px;
    `;
    panel.appendChild(divider);

    const options = document.createElement("div");
    options.id = "dlg-options";
    options.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;
    panel.appendChild(options);

    // Inject button styles
    const style = document.createElement("style");
    style.textContent = `
      .dlg-option-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        color: #c8cdd8;
        font-size: 15px;
        font-family: inherit;
        text-align: left;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
      }
      .dlg-option-btn:hover {
        background: rgba(100, 160, 240, 0.15);
        border-color: rgba(100, 160, 240, 0.35);
        color: #ffffff;
      }
      .dlg-option-key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        color: #7ab8f5;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);

    return container;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    this.container.remove();
  }
}
