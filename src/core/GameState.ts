/**
 * Central game state management with observable property changes.
 */

export interface IGameState {
  playerName: string;
  clearanceGranted: boolean;
  hasMetSecretary: boolean;
  hasMetDeveloper: boolean;
  developerMeetingComplete: boolean;
  currentDialogueActive: boolean;
}

type StateListener<K extends keyof IGameState> = (value: IGameState[K]) => void;

export class GameState {
  private state: IGameState = {
    playerName: "",
    clearanceGranted: false,
    hasMetSecretary: false,
    hasMetDeveloper: false,
    developerMeetingComplete: false,
    currentDialogueActive: false,
  };

  private listeners = new Map<keyof IGameState, StateListener<any>[]>();

  get<K extends keyof IGameState>(key: K): IGameState[K] {
    return this.state[key];
  }

  set<K extends keyof IGameState>(key: K, value: IGameState[K]): void {
    const prev = this.state[key];
    this.state[key] = value;
    if (prev !== value) {
      this.notify(key, value);
    }
  }

  on<K extends keyof IGameState>(key: K, callback: StateListener<K>): () => void {
    const list = this.listeners.get(key) ?? [];
    list.push(callback);
    this.listeners.set(key, list);

    return () => {
      const idx = list.indexOf(callback);
      if (idx >= 0) list.splice(idx, 1);
    };
  }

  private notify<K extends keyof IGameState>(key: K, value: IGameState[K]): void {
    const list = this.listeners.get(key);
    if (list) {
      for (const cb of list) {
        cb(value);
      }
    }
  }

  snapshot(): Readonly<IGameState> {
    return { ...this.state };
  }
}
