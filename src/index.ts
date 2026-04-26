import fs from "node:fs";
import path from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

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

function getSettingsPath(): string | undefined {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) return undefined;
  return path.join(home, ".pi", "agent", "settings.json");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadSettings(settingsPath: string): Record<string, unknown> {
  if (!fs.existsSync(settingsPath)) return {};

  const raw = fs.readFileSync(settingsPath, "utf8").trim();
  if (raw.length === 0) return {};

  const parsed = JSON.parse(raw) as unknown;
  if (!isPlainObject(parsed)) {
    throw new Error("settings.json must contain a JSON object at the top level.");
  }

  return parsed;
}

function saveDefaultThinkingLevel(level: ThinkingLevel): { ok: boolean; error?: string } {
  const settingsPath = getSettingsPath();
  if (!settingsPath) {
    return { ok: false, error: "Could not resolve your home directory." };
  }

  try {
    const settings = loadSettings(settingsPath);
    settings.defaultThinkingLevel = level;

    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

export default function (pi: ExtensionAPI) {
  const usage = `/thinking <${VALID_LEVELS.join("|")}>`;

  pi.registerCommand("thinking", {
    description: `Set current thinking level and persist it as the default. Usage: ${usage}`,
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

      const saveResult = saveDefaultThinkingLevel(action.level);
      if (!saveResult.ok) {
        ctx.ui.notify(
          `Set current thinking to ${action.level}, but failed to save default: ${saveResult.error}`,
          "warning"
        );
        return;
      }

      ctx.ui.notify(`Thinking level set to ${action.level} and saved as defaultThinkingLevel.`, "info");
    },
  });
}
