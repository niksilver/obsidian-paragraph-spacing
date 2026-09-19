# Changelog

All notable changes to this plugin are documented here.
This project follows [Semantic Versioning](https://semver.org/).

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
