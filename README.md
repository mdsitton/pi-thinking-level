# pi-thinking-level

A small [pi](https://pi.dev) package that adds a `/thinking` command to set the current thinking level and persist it as your default.

## Why this exists

pi already makes it easy to change thinking level interactively with **Shift+Tab**.

This package exists for a slightly different use case: giving you an **explicit command** for setting a **specific** level and saving it as your default in one step.

That makes it useful if you want a workflow that is:

- **More deliberate** — choose `high` or `medium` directly instead of cycling
- **More persistent** — update your current session and your future default together
- **More scriptable/documentable** — easy to mention in notes, team docs, screenshots, and demos
- **More self-explanatory** — `/thinking high` is clearer than “press Shift+Tab until it looks right” 

## What it does

- Adds a `/thinking` command
- Updates the current session's thinking level immediately
- Writes `defaultThinkingLevel` to `~/.pi/agent/settings.json`
- Supports the built-in pi thinking levels:
  - `off`
  - `minimal`
  - `low`
  - `medium`
  - `high`
  - `xhigh`

## Command

```text
/thinking status
/thinking off
/thinking minimal
/thinking low
/thinking medium
/thinking high
/thinking xhigh
```

If you run `/thinking` with no arguments, it shows the current level.

## Installation

### From npm

```bash
pi install npm:pi-thinking-level
```

### From GitHub

```bash
pi install git:github.com/<your-user>/pi-thinking-level
```

### From a local path

```bash
pi install /absolute/path/to/pi-thinking-level
```

Or use it for a single run:

```bash
pi -e /absolute/path/to/pi-thinking-level
```

After installation, run:

```text
/reload
```

## Usage examples

```text
/thinking status
/thinking medium
/thinking high
```

Example flow:

1. Run `/thinking high`
2. pi switches the current session to `high`
3. The extension saves `"defaultThinkingLevel": "high"` to your pi settings
4. Future sessions start with that default unless you change it again

## Notes

- This package only adds one command and has no third-party runtime dependencies.
- If pi cannot write `settings.json`, it still updates the current session and shows a warning.
- If `settings.json` contains invalid JSON or a non-object top-level value, the extension will warn instead of overwriting it blindly.

## Package structure

```text
pi-thinking-level/
├── index.ts
├── package.json
├── README.md
└── LICENSE
```

The package uses the pi package manifest in `package.json`:

```json
{
  "pi": {
    "extensions": ["./index.ts"]
  }
}
```

## Development

Test locally with:

```bash
pi -e ./index.ts
```

Or place the folder in:

```text
~/.pi/agent/extensions/pi-thinking-level
```

Then hot reload with:

```text
/reload
```

## License

MIT
