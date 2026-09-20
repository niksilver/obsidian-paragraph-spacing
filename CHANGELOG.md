# Changelog

All notable changes to this plugin are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## 0.2.2

- **Fixed: the width preview in settings was useless.** Every preset rendered at
  the same width. The preview set `max-width` to the raw width in pixels
  (44–96rem → 704–1536px), but the settings pane is only about 640px wide, so
  all five presets clamped to the pane and looked identical. The preview now
  maps the range proportionally (55%–100% of the pane) and adds a ruler bar
  plus a readout (`w78: 78rem ≈ 1248px`), so presets are visually distinct.
- Sponsorship now points at GitHub Sponsors only; the previous
  international/China split (Ko-fi, 爱发电) has been removed.

## 0.2.1

- **Fixed: the plugin failed to load in Obsidian.** 0.2.0 split the code into
  sibling modules and pulled them in with `require("./i18n")`. Obsidian injects
  a whitelist `require` that resolves *only* `obsidian`, `@codemirror/*` and
  `@lezer/*`; anything else falls through to Electron's `window.require`, which
  resolves relative paths against Obsidian's install directory rather than the
  plugin folder. The call returned `undefined` and the plugin threw
  `Cannot destructure property 'bindI18n' of 'require(...)' as it is undefined.`
  The three modules are now inlined into `main.js`, which is self-contained.
  The readable sources are still shipped as `i18n.js` / `locales.js` /
  `sponsor.js` and are inlined by a packaging step.

## 0.2.0

- Bilingual interface: the settings page, commands and notices now ship in
  Chinese and English, with an in-settings language selector
  (`Auto` / `简体中文` / `English`). `Auto` follows Obsidian's own language.
  Adding a further language is a pure data change in `locales.js`.
- Settings page footer with version and repository link, plus a sponsorship
  block listing international and China-friendly options.
- Restore-defaults button. It deliberately keeps the language choice, since
  that preference is about the page itself.
- Preset display names are now translated at render time while preset ids and
  CSS class names stay language-independent.

## 0.1.0

- Initial release. Extracted from a personal `dense-reading.css` snippet that
  needed Style Settings plus per-note `cssclasses` frontmatter to be usable.
- Dense spacing switch for reading view (paragraphs, `h2`/`h3`, lists, `hr`,
  inline code), off by default and fully inert when off.
- Line width in five presets plus a custom slider, applied at the view layer so
  it is not overridden by Obsidian's inline `--file-line-width`.
- Per-note width pinning, with the pinned list shown and clearable in settings.
- Class names match the original snippet, so migrating is non-breaking.
- No default hotkey: width is an occasional, deliberate choice.
