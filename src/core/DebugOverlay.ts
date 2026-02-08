/**
 * DebugOverlay — captures and displays all errors as stacked banners
 * at the top of the page.
 *
 * Activated via `?debug` URL parameter or by calling `DebugOverlay.init()`.
 * Hooks into:
 *  - window.onerror (uncaught exceptions)
 *  - window.onunhandledrejection (unhandled promise rejections)
 *  - console.error (all console.error calls)
 *  - console.warn  (all console.warn calls)
 */

type ErrorLevel = "error" | "warn" | "info";

interface DebugEntry {
  id: number;
  level: ErrorLevel;
  message: string;
  stack?: string;
  timestamp: string;
}

export class DebugOverlay {
  private static instance: DebugOverlay | null = null;
  private container!: HTMLDivElement;
  private entries: DebugEntry[] = [];
  private nextId = 0;

  private originalConsoleError!: typeof console.error;
  private originalConsoleWarn!: typeof console.warn;

  private constructor() {
    this.createContainer();
    this.hookGlobalErrors();
    this.hookConsole();
  }

  /** Initialise the debug overlay (idempotent). */
  static init(): DebugOverlay {
    if (!DebugOverlay.instance) {
      DebugOverlay.instance = new DebugOverlay();
    }
    return DebugOverlay.instance;
  }

  /** Returns true when `?debug` is present in the URL. */
  static isDebugMode(): boolean {
    return new URLSearchParams(window.location.search).has("debug");
  }

  // ── DOM ──────────────────────────────────────────────────────

  private createContainer(): void {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      zIndex: "10000",
      maxHeight: "60vh",
      overflowY: "auto",
      pointerEvents: "auto",
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      fontSize: "12px",
    } as CSSStyleDeclaration);

    // Header bar
    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "4px 10px",
      background: "rgba(30, 30, 30, 0.95)",
      borderBottom: "1px solid #444",
      color: "#ccc",
    } as CSSStyleDeclaration);

    const title = document.createElement("span");
    title.textContent = "DEBUG MODE";
    title.style.fontWeight = "bold";
    title.style.letterSpacing = "0.1em";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear All";
    Object.assign(clearBtn.style, {
      background: "transparent",
      border: "1px solid #666",
      color: "#ccc",
      padding: "2px 8px",
      cursor: "pointer",
      borderRadius: "3px",
      fontSize: "11px",
    } as CSSStyleDeclaration);
    clearBtn.addEventListener("click", () => this.clearAll());

    header.appendChild(title);
    header.appendChild(clearBtn);
    this.container.appendChild(header);

    document.body.appendChild(this.container);
  }

  // ── Hooks ────────────────────────────────────────────────────

  private hookGlobalErrors(): void {
    window.addEventListener("error", (event: ErrorEvent) => {
      this.push("error", event.message || String(event.error), this.extractStack(event.error));
    });

    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      this.push("error", `Unhandled Promise: ${message}`, stack);
    });
  }

  private hookConsole(): void {
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);

    console.error = (...args: unknown[]) => {
      this.originalConsoleError(...args);
      this.push("error", this.formatArgs(args), this.captureCallStack());
    };

    console.warn = (...args: unknown[]) => {
      this.originalConsoleWarn(...args);
      this.push("warn", this.formatArgs(args));
    };
  }

  // ── Entry management ─────────────────────────────────────────

  push(level: ErrorLevel, message: string, stack?: string): void {
    const entry: DebugEntry = {
      id: this.nextId++,
      level,
      message,
      stack: stack || undefined,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.entries.push(entry);
    this.renderEntry(entry);
  }

  private clearAll(): void {
    this.entries = [];
    // Keep the header, remove everything else
    while (this.container.children.length > 1) {
      this.container.removeChild(this.container.lastChild!);
    }
  }

  // ── Rendering ────────────────────────────────────────────────

  private renderEntry(entry: DebugEntry): void {
    const colors: Record<ErrorLevel, { bg: string; border: string; text: string }> = {
      error: { bg: "rgba(180, 30, 30, 0.92)", border: "#ff4444", text: "#ffd0d0" },
      warn:  { bg: "rgba(160, 120, 0, 0.92)", border: "#ffaa00", text: "#fff3cd" },
      info:  { bg: "rgba(30, 80, 160, 0.92)", border: "#4488ff", text: "#cce0ff" },
    };

    const style = colors[entry.level];
    const row = document.createElement("div");
    row.dataset.entryId = String(entry.id);
    Object.assign(row.style, {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      padding: "6px 10px",
      background: style.bg,
      borderLeft: `3px solid ${style.border}`,
      color: style.text,
      borderBottom: "1px solid rgba(0,0,0,0.3)",
      cursor: entry.stack ? "pointer" : "default",
      wordBreak: "break-word",
    } as CSSStyleDeclaration);

    // Timestamp
    const ts = document.createElement("span");
    ts.textContent = entry.timestamp;
    ts.style.opacity = "0.6";
    ts.style.flexShrink = "0";

    // Level badge
    const badge = document.createElement("span");
    badge.textContent = entry.level.toUpperCase();
    Object.assign(badge.style, {
      background: "rgba(0,0,0,0.3)",
      padding: "1px 5px",
      borderRadius: "3px",
      fontSize: "10px",
      flexShrink: "0",
    } as CSSStyleDeclaration);

    // Message
    const msg = document.createElement("span");
    msg.textContent = entry.message;
    msg.style.flex = "1";

    // Dismiss button
    const dismiss = document.createElement("span");
    dismiss.textContent = "\u00d7";
    Object.assign(dismiss.style, {
      cursor: "pointer",
      padding: "0 4px",
      fontSize: "14px",
      opacity: "0.7",
      flexShrink: "0",
    } as CSSStyleDeclaration);
    dismiss.addEventListener("click", (e) => {
      e.stopPropagation();
      row.remove();
      this.entries = this.entries.filter((e) => e.id !== entry.id);
    });

    row.appendChild(ts);
    row.appendChild(badge);
    row.appendChild(msg);
    row.appendChild(dismiss);

    // Expandable stack trace
    if (entry.stack) {
      const stackEl = document.createElement("pre");
      stackEl.textContent = entry.stack;
      Object.assign(stackEl.style, {
        display: "none",
        margin: "4px 0 0 0",
        padding: "6px",
        background: "rgba(0,0,0,0.3)",
        borderRadius: "3px",
        fontSize: "11px",
        whiteSpace: "pre-wrap",
        maxHeight: "200px",
        overflowY: "auto",
      } as CSSStyleDeclaration);

      const wrapper = document.createElement("div");
      wrapper.style.width = "100%";

      const msgRow = document.createElement("div");
      msgRow.style.display = "flex";
      msgRow.style.alignItems = "flex-start";
      msgRow.style.gap = "8px";
      msgRow.appendChild(ts);
      msgRow.appendChild(badge);
      msgRow.appendChild(msg);
      msgRow.appendChild(dismiss);

      wrapper.appendChild(msgRow);
      wrapper.appendChild(stackEl);

      // Clear row and re-add as wrapper
      row.innerHTML = "";
      row.style.display = "block";
      row.appendChild(wrapper);

      row.addEventListener("click", () => {
        stackEl.style.display = stackEl.style.display === "none" ? "block" : "none";
      });
    }

    this.container.appendChild(row);

    // Auto-scroll to latest
    this.container.scrollTop = this.container.scrollHeight;
  }

  // ── Helpers ──────────────────────────────────────────────────

  private formatArgs(args: unknown[]): string {
    return args
      .map((a) => {
        if (a instanceof Error) return a.message;
        if (typeof a === "object") {
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        }
        return String(a);
      })
      .join(" ");
  }

  private extractStack(err: unknown): string | undefined {
    if (err instanceof Error && err.stack) return err.stack;
    return undefined;
  }

  private captureCallStack(): string {
    const stack = new Error().stack || "";
    // Remove the first 3 lines (Error, captureCallStack, hooked console.error)
    return stack.split("\n").slice(3).join("\n");
  }
}
