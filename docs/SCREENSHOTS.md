# Screenshots — Dense Reading

Status: **done** (2026-09-19). The three files below are in this folder and are
already referenced by the README.

| File | What it shows |
|---|---|
| `shot-presets.png` | The preset dropdown: Narrow 44rem / Balanced 54rem / Wide 66rem / Extra wide 78rem / Custom |
| `shot-settings.png` | The full settings page, including the proportional width-preview bar |
| `shot-reading.png` | Reading view at the chosen width, with dense spacing on |

## Notes for whoever replaces these

- Capture the **settings panel itself**, not the whole Obsidian window — no
  window chrome, no drop shadow, no rounded frame.
- Windows: `Win + Shift + S` → rectangular snip around the panel.
- **Switch the language to English before capturing.** The README body is in
  English, so the images should match. Switch back afterwards.
- Dark theme is fine — GitHub renders either.

## What must NOT appear in a shot

This repository is **public**.

- No vault path, no note titles, no file-explorer sidebar. The settings panel
  itself contains none of these, but a wider crop will pick them up.
- No real name or email address.
- Use the demo vault at `E:\1project\_scratch\plugin-demo-vault\` for the
  reading-view shot — it holds no real notes.

## Specs

Source files can be dropped in as-is. Processing: crop stray whitespace, keep
width ≥ 1200px (GitHub scales down), lossless-compress to under 300 KB.

## `shot-settings.png` currently shows `Custom 96rem`

The preview bar is at 100% in that shot because `Custom` is the selected preset.
That is correct behaviour, but it does not demonstrate that the five presets
differ. If the settings page is ever re-shot, pick **Narrow 44rem** so the bar
sits at 55% and the proportional mapping is visible.
