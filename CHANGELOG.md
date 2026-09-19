# Changelog

All notable changes to this plugin are documented here.
This project follows [Semantic Versioning](https://semver.org/).

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
