/**
 * Dialogue state machine supporting branching dialogue, conditional options,
 * and state-modifying actions.
 */

import { GameState } from "../core/GameState";

export interface DialogueOption {
  /** Text shown to the player */
  text: string;

  /** ID of the next dialogue node, or null to end the dialogue */
  nextNodeId: string | null;

  /** If provided, option is only shown when this returns true */
  condition?: (state: GameState) => boolean;

  /** Side-effect executed when the player picks this option */
  action?: (state: GameState) => void;
}

export interface DialogueNode {
  id: string;

  /** Name of the speaker (NPC name or "You") */
  speaker: string;

  /** The dialogue text */
  text: string;

  /** Available response options */
  options: DialogueOption[];
}

export interface DialogueTree {
  /** Which node to start on */
  startNodeId: string;

  /** All nodes keyed by ID */
  nodes: Record<string, DialogueNode>;
}

export type DialogueNodeHandler = (node: DialogueNode, availableOptions: DialogueOption[]) => void;
export type DialogueEndHandler = () => void;

export class DialogueStateMachine {
  private currentTree: DialogueTree | null = null;
  private currentNode: DialogueNode | null = null;

  /** Fired when the current node changes */
  onNodeChanged: DialogueNodeHandler | null = null;

  /** Fired when the dialogue ends */
  onDialogueEnd: DialogueEndHandler | null = null;

  constructor(private readonly gameState: GameState) {}

  get isActive(): boolean {
    return this.currentTree !== null && this.currentNode !== null;
  }

  get activeNode(): DialogueNode | null {
    return this.currentNode;
  }

  start(tree: DialogueTree): void {
    this.currentTree = tree;
    const startNode = tree.nodes[tree.startNodeId];
    if (!startNode) {
      console.error(`Dialogue start node "${tree.startNodeId}" not found.`);
      this.end();
      return;
    }
    this.setNode(startNode);
  }

  selectOption(index: number): void {
    if (!this.currentNode || !this.currentTree) return;

    const available = this.getAvailableOptions();
    if (index < 0 || index >= available.length) return;

    const option = available[index];

    // Execute side-effect
    option.action?.(this.gameState);

    // Transition
    if (option.nextNodeId === null) {
      this.end();
    } else {
      const next = this.currentTree.nodes[option.nextNodeId];
      if (!next) {
        console.error(`Dialogue node "${option.nextNodeId}" not found.`);
        this.end();
        return;
      }
      this.setNode(next);
    }
  }

  end(): void {
    this.currentTree = null;
    this.currentNode = null;
    this.onDialogueEnd?.();
  }

  getAvailableOptions(): DialogueOption[] {
    if (!this.currentNode) return [];
    return this.currentNode.options.filter(
      (opt) => !opt.condition || opt.condition(this.gameState)
    );
  }

  private setNode(node: DialogueNode): void {
    this.currentNode = node;
    const available = this.getAvailableOptions();

    // If the node has no available options, auto-end
    if (available.length === 0) {
      this.end();
      return;
    }

    this.onNodeChanged?.(node, available);
  }
}
