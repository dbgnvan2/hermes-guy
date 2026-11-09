# Hermes Guy

A visual theme editor for [Hermes Agent](https://hermes-agent.nousresearch.com/) skins.
Click an element on a sample Hermes screen to change its color, font, and weight, then
export a ready-to-use skin YAML.

No build step, no dependencies — a single static page.

## Features

- **Point-and-click editing** — a mock Hermes desktop (sidebar sessions, thinking block,
  tool-call lines, errors, warnings, status bar) where every element is clickable.
- **Color, font, weight, size** per element, with live preview.
- **Accurate color mapping** — colors write to real Hermes skin keys
  (`ui_error`, `ui_text`, `ui_accent`, …) and the desktop CSS variables
  (`--ui-text-secondary`, `--conversation-scaffold-text`, …).
- **Three ways out**:
  - **Save & apply via Hermes** — sends the skin to a Hermes agent to write and activate
    (works when the page is opened inside the Hermes desktop preview pane).
  - **Download .yaml** — writes the skin file straight to disk.
  - **Copy YAML** — copies to the clipboard.

## Quick start

Just open `index.html` in a browser:

```bash
open index.html            # macOS
# or
python3 -m http.server     # then visit http://localhost:8000
```

Or run it inside Hermes itself by dropping `index.html` into the desktop app's preview pane.

## How it maps to a Hermes skin

A Hermes skin is a YAML file under `~/.hermes/skins/<name>.yaml` with two relevant sections:

| Section | What it carries | Used for |
|---|---|---|
| `colors:` | hex values for skin keys | colors that Hermes natively supports |
| `customCSS:` | raw CSS injected into the desktop app | font / weight / size, plus colors that only exist as desktop CSS variables or selectors |

Hermes Guy generates **both**:

- **Color** → the matching `colors:` key where one exists, otherwise a `customCSS` rule or
  `:root` variable.
- **Font / weight / size** → `customCSS` rules, because the Hermes skin format has **no**
  native font or weight fields. The exact selector is written into the generated CSS so you
  can see (and adjust) where it targets.

### Element → skin key

| Element | Color target |
|---|---|
| App background | `background` |
| Accent (links, buttons) | `ui_accent` |
| Headings | `ui_primary` |
| Body / message text | `ui_text` |
| Sidebar session names | `--ui-text-secondary` (CSS var) |
| Muted / captions & timestamps | `--ui-text-tertiary` (CSS var) |
| Thinking text (🧠) | `ui_thinking` + `[data-slot='aui_thinking-disclosure']` |
| Tool-call lines (`>_`) | `--conversation-scaffold-text` (CSS var) + `ui_tool` |
| Error messages (`!`) | `ui_error` + `.text-destructive` |
| Warning messages | `ui_warn` |
| Success indicators | `ui_ok` |
| Borders / dividers | `ui_border` |
| Selected session (highlight) | `--ui-row-active-background` (CSS var) |
| Selected session text | `[class*="ui-row-active"]` (CSS) |
| Status bar background | `status_bar_bg` |
| Status bar text | `status_bar_text` |

## Applying a generated skin

1. Put the generated YAML at `~/.hermes/skins/<name>.yaml`.
2. Activate it:
   ```bash
   hermes config set display.skin <name>
   ```
   …or in a Hermes chat, `/skin <name>`.

The desktop app repaints live within about a second.

## Notes & caveats

- **Font / weight / size are inherently `customCSS`** — the Hermes skin schema has no
  per-element typography, only colors plus a raw `customCSS` hook. The generated selectors
  target the desktop app's actual DOM (`[data-slot=…]`, `.text-destructive`, etc.). If a
  selector doesn't hit your build exactly, adjust it in the generated CSS.
- **`customCSS` is desktop/web only** — it's ignored by the CLI and TUI. The `colors:`
  keys theme every surface.
- Built-in skin names (`mono`, `slate`, `cyberpunk`, `nous`, `midnight`, `ember`, …) are
  reserved by the desktop app; pick a fresh name.

## Related

- [Hermes skins docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/skins)
- [Hermes Mod](https://github.com/cocktailpeanut/hermes-mod) — a community form-based skin
  editor (colors, spinner, branding, banner art). Hermes Guy is the click-on-element +
  typography complement.

## License

[MIT](LICENSE)
