/**
 * Dialogue trees for all NPCs. Structured for easy extension.
 * Each tree is a set of DialogueNodes keyed by ID.
 */

import { DialogueTree } from "./DialogueStateMachine";

// ─── Secretary Dialogue ──────────────────────────────────────────────────────

export function getSecretaryDialogue(): DialogueTree {
  return {
    startNodeId: "greet",
    nodes: {
      greet: {
        id: "greet",
        speaker: "Secretary",
        text: "Good morning! Welcome to our office. I'm the front desk coordinator. How can I help you today?",
        options: [
          {
            text: "Hi, I'm here for a meeting with the developer.",
            nextNodeId: "ask-name",
          },
          {
            text: "Just looking around, thanks.",
            nextNodeId: "just-looking",
          },
          {
            text: "I already have clearance.",
            nextNodeId: "already-cleared",
            condition: (state) => state.get("clearanceGranted"),
          },
        ],
      },

      "ask-name": {
        id: "ask-name",
        speaker: "Secretary",
        text: "Of course. May I ask who you are and what this meeting is regarding? We need to verify your appointment.",
        options: [
          {
            text: "I'm a colleague — we scheduled a code review session.",
            nextNodeId: "verify-colleague",
          },
          {
            text: "I'm from the client team. We have a project sync scheduled.",
            nextNodeId: "verify-client",
          },
          {
            text: "I'd rather not say.",
            nextNodeId: "refuse-id",
          },
        ],
      },

      "verify-colleague": {
        id: "verify-colleague",
        speaker: "Secretary",
        text: "A code review — yes, I see that on the calendar. Let me confirm... Alright, everything checks out. You're cleared to go ahead. The developer's desk is at the back of the office, you can't miss the triple-monitor setup.",
        options: [
          {
            text: "Thank you!",
            nextNodeId: null,
            action: (state) => {
              state.set("clearanceGranted", true);
              state.set("hasMetSecretary", true);
              state.set("playerName", "Colleague");
            },
          },
        ],
      },

      "verify-client": {
        id: "verify-client",
        speaker: "Secretary",
        text: "A project sync, let me check the schedule... Yes, that's confirmed. You're all set. The developer is working at the large desk in the back — the one with three monitors side by side. Go right ahead.",
        options: [
          {
            text: "Great, thanks for your help.",
            nextNodeId: null,
            action: (state) => {
              state.set("clearanceGranted", true);
              state.set("hasMetSecretary", true);
              state.set("playerName", "Client");
            },
          },
        ],
      },

      "refuse-id": {
        id: "refuse-id",
        speaker: "Secretary",
        text: "I understand your privacy, but I'm unable to grant access to the developer without verifying your identity. Company policy, I'm afraid. Would you like to try again?",
        options: [
          {
            text: "Alright, let me identify myself properly.",
            nextNodeId: "ask-name",
          },
          {
            text: "I'll come back later.",
            nextNodeId: null,
            action: (state) => {
              state.set("hasMetSecretary", true);
            },
          },
        ],
      },

      "just-looking": {
        id: "just-looking",
        speaker: "Secretary",
        text: "Feel free to look around the reception area. If you need to meet with anyone, just come talk to me and I'll get you sorted out.",
        options: [
          {
            text: "Actually, I do need to see the developer.",
            nextNodeId: "ask-name",
          },
          {
            text: "Thanks, I'll do that.",
            nextNodeId: null,
            action: (state) => {
              state.set("hasMetSecretary", true);
            },
          },
        ],
      },

      "already-cleared": {
        id: "already-cleared",
        speaker: "Secretary",
        text: "Yes, you're already verified in our system. Go right ahead — you know where the developer sits.",
        options: [
          {
            text: "Thanks!",
            nextNodeId: null,
          },
        ],
      },
    },
  };
}

// ─── Developer Dialogue ──────────────────────────────────────────────────────

export function getDeveloperDialogue(): DialogueTree {
  return {
    startNodeId: "greet",
    nodes: {
      greet: {
        id: "greet",
        speaker: "Developer",
        text: "*Takes off headphones* Hey! Good to see you. I was just wrapping up some work. What brings you over?",
        options: [
          {
            text: "We have a code review session scheduled.",
            nextNodeId: "code-review",
            condition: (state) => state.get("playerName") === "Colleague",
          },
          {
            text: "We have a project sync meeting.",
            nextNodeId: "project-sync",
            condition: (state) => state.get("playerName") === "Client",
          },
          {
            text: "Just wanted to chat and see what you're working on.",
            nextNodeId: "casual-chat",
          },
        ],
      },

      "code-review": {
        id: "code-review",
        speaker: "Developer",
        text: "Right, the code review! I've got the pull request up on the center screen. I refactored the NPC dialogue system — it's much more modular now. Want me to walk you through the changes?",
        options: [
          {
            text: "Yes, let's go through it step by step.",
            nextNodeId: "review-detail",
          },
          {
            text: "Just give me the highlights.",
            nextNodeId: "review-summary",
          },
        ],
      },

      "review-detail": {
        id: "review-detail",
        speaker: "Developer",
        text: "So the main change is the dialogue state machine. Instead of hard-coded if-else chains, each NPC now has its own DialogueTree with conditional branching. The options can have guards and side-effects, which makes it trivial to add new NPCs or quest logic. Clean separation of concerns.",
        options: [
          {
            text: "That looks solid. Approved!",
            nextNodeId: "review-complete",
          },
          {
            text: "I have a few suggestions, but overall it's good.",
            nextNodeId: "review-complete",
          },
        ],
      },

      "review-summary": {
        id: "review-summary",
        speaker: "Developer",
        text: "In short: the dialogue system now uses a proper state machine with branching trees, conditional options, and side-effect actions. Much easier to extend. I also cleaned up the NPC base class to be more reusable.",
        options: [
          {
            text: "Sounds great, let's merge it.",
            nextNodeId: "review-complete",
          },
        ],
      },

      "review-complete": {
        id: "review-complete",
        speaker: "Developer",
        text: "Awesome, thanks for the review! I'll merge the PR right after this. Good session — let me know if there's anything else you need.",
        options: [
          {
            text: "Will do. Keep up the good work!",
            nextNodeId: null,
            action: (state) => {
              state.set("hasMetDeveloper", true);
              state.set("developerMeetingComplete", true);
            },
          },
        ],
      },

      "project-sync": {
        id: "project-sync",
        speaker: "Developer",
        text: "The project sync, right. I've got the progress dashboard up here. We're on track for the milestone — the 3D office environment is nearly complete, and the interaction system just passed testing. Want a demo?",
        options: [
          {
            text: "Absolutely, show me what you've got.",
            nextNodeId: "demo-show",
          },
          {
            text: "Let's focus on the timeline and deliverables.",
            nextNodeId: "timeline-discussion",
          },
        ],
      },

      "demo-show": {
        id: "demo-show",
        speaker: "Developer",
        text: "So here's the virtual office running in the browser — fully client-side, no backend needed. Babylon.js handles the rendering with PBR materials, real-time shadows, and post-processing. The NPC system supports branching dialogue and state-driven interactions. Pretty neat for a web app, right?",
        options: [
          {
            text: "Impressive work! The client will love this.",
            nextNodeId: "sync-complete",
          },
          {
            text: "Looks good. Let's discuss next steps.",
            nextNodeId: "sync-complete",
          },
        ],
      },

      "timeline-discussion": {
        id: "timeline-discussion",
        speaker: "Developer",
        text: "Sure. The core features — office environment, player controls, NPC interaction, and dialogue — are all done. Next sprint we're looking at adding more rooms, AI-driven dialogue responses, and possibly WebXR support for VR headsets. We're well within the timeline.",
        options: [
          {
            text: "That's exactly what we needed to hear.",
            nextNodeId: "sync-complete",
          },
        ],
      },

      "sync-complete": {
        id: "sync-complete",
        speaker: "Developer",
        text: "Great sync! I'll send the updated status report after this. Thanks for stopping by — it's much better than a video call, right? *smiles*",
        options: [
          {
            text: "Definitely! Thanks for the walkthrough.",
            nextNodeId: null,
            action: (state) => {
              state.set("hasMetDeveloper", true);
              state.set("developerMeetingComplete", true);
            },
          },
        ],
      },

      "casual-chat": {
        id: "casual-chat",
        speaker: "Developer",
        text: "I'm building this 3D virtual office in the browser — kind of meta, right? You're standing in it! It's all Babylon.js with TypeScript. Three monitors help a lot when you've got the scene on one, code on another, and docs on the third.",
        options: [
          {
            text: "That's really cool! Must be fun to work on.",
            nextNodeId: "chat-fun",
          },
          {
            text: "How long have you been working on this?",
            nextNodeId: "chat-timeline",
          },
        ],
      },

      "chat-fun": {
        id: "chat-fun",
        speaker: "Developer",
        text: "It really is. There's something satisfying about building a virtual space that people can explore in their browser. And the dialogue system... well, you're experiencing it right now! Anyway, feel free to hang out or explore the office. My headphones are going back on though — got some bugs to squash.",
        options: [
          {
            text: "Ha! I'll leave you to it. Good luck!",
            nextNodeId: null,
            action: (state) => {
              state.set("hasMetDeveloper", true);
              state.set("developerMeetingComplete", true);
            },
          },
        ],
      },

      "chat-timeline": {
        id: "chat-timeline",
        speaker: "Developer",
        text: "A few sprints now. Started with the scene setup and PBR materials, then the player controller, then the NPC and dialogue systems. The architecture is modular enough that adding new features — like more rooms or AI chat — should be straightforward. Anyway, I should get back to it. Good chatting with you!",
        options: [
          {
            text: "Thanks for sharing. I'll let you get back to work!",
            nextNodeId: null,
            action: (state) => {
              state.set("hasMetDeveloper", true);
              state.set("developerMeetingComplete", true);
            },
          },
        ],
      },
    },
  };
}

// ─── Developer — No Clearance (attempted interaction without clearance) ──────

export function getDeveloperNoClearanceDialogue(): DialogueTree {
  return {
    startNodeId: "blocked",
    nodes: {
      blocked: {
        id: "blocked",
        speaker: "Developer",
        text: "*Has headphones on, doesn't notice you* ...",
        options: [
          {
            text: "(The developer seems focused. Maybe I should check in with the secretary first.)",
            nextNodeId: null,
          },
        ],
      },
    },
  };
}
