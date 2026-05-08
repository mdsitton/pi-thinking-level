import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const VALID_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh"] as const;

type ThinkingLevel = (typeof VALID_LEVELS)[number];

type ThinkingCommandAction =
  | { kind: "showStatus" }
  | { kind: "setLevel"; level: ThinkingLevel };

function normalizeThinkingLevel(value: string | undefined): ThinkingLevel | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return VALID_LEVELS.find((level) => level === normalized);
}

function parseThinkingCommand(args: string | undefined): ThinkingCommandAction | undefined {
  const trimmed = (args || "").trim();
  if (trimmed.length === 0) return { kind: "showStatus" };

  const normalized = trimmed.toLowerCase();
  if (normalized === "status") return { kind: "showStatus" };

  const level = normalizeThinkingLevel(trimmed);
  if (!level) return undefined;
  return { kind: "setLevel", level };
}

export default function (pi: ExtensionAPI) {
  const usage = `/thinking <${VALID_LEVELS.join("|")}>`;

  pi.registerCommand("thinking", {
    description: `Set current thinking level and persist it as the global default. Usage: ${usage}`,
    getArgumentCompletions: (prefix) => {
      const normalizedPrefix = (prefix || "").trim().toLowerCase();
      const options = ["status", ...VALID_LEVELS];
      const items = options
        .filter((value) => value.startsWith(normalizedPrefix))
        .map((value) => ({ value, label: value }));
      return items.length > 0 ? items : null;
    },
    handler: async (args, ctx) => {
      const action = parseThinkingCommand(args);

      if (!action || action.kind === "showStatus") {
        const current = pi.getThinkingLevel();
        const suffix = action ? "" : ` Usage: ${usage}`;
        ctx.ui.notify(`Current thinking: ${current}.${suffix}`, "info");
        return;
      }

      pi.setThinkingLevel(action.level);
      ctx.ui.notify(`Thinking level set to ${action.level} and saved as global default.`, "info");
    },
  });
}
