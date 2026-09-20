/*
   Dense Reading
   From https://github.com/yunmin311/dense-reading-obsidian/tree/main
   Chinese translated by Google Translate.

   Replacing the original combination of a CSS snippet (`dense-reading.css`)
   and the Style Settings plugin with a dedicated plugin.

   Why switch to a plugin?

   The snippet approach required users to first toggle the master switch
   in Style Settings and then manually type `cssclasses: dense-w54` for
   it to take effect—meaning users had to know exactly what to type to
   use it. The plugin removes this friction: switch modes directly via the
   command palette, have each note remember its own mode, and enjoy a live
   preview in the settings page.

   The design adheres to three key principles established by the original
   snippet (these were hard-learned lessons; do not alter them):

   1. Modify only the "view layer," not the file itself.  Line width must
   be defined on `:is(.markdown-source-view.mod-cm6, .markdown-preview-view,
   .markdown-rendered)` rather than the `body` tag. Obsidian injects an inline
   style for `--file-line-width: 700px`; defining it on the `body` causes
   it to be overridden, making it appear as though the setting isn't working.

   2. Encapsulate all spacing rules within `body.dense-reading-mode`.
   When the master switch is turned off, nothing remains active (except for
   line width), leaving no side effects.

   3. Avoid hard-coding colors.  Use `currentColor` and `color-mix` for
   elements like horizontal rules (`hr`) and inline code, ensuring they
   adapt to the active theme.

   Implementation strategy: Simply add a class to the `body` element.
   The modes are named `dense-w44`, `dense-w54`, `dense-w66`, `dense-w78`,
   and `dense-w-custom`, matching the snippet names exactly. This allows
   both systems to coexist and enables a smooth migration without conflicts.
*/

"use strict";

const { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");


/* ============================================================
   [Inline Module · Automatically generated; please do not manually edit this section]
   ------------------------------------------------------------
   The following three sections originate from `locales.js`, `i18n.js`,
   and `sponsor.js` in the repository, and are concatenated here by the
   `bundle-inline.js` script (located in `_scratch/_i18n/`).

   Why not simply use `require("./locales")`?  The `require` function injected
   by Obsidian is restricted to a whitelist—recognizing only `obsidian`,
   `@codemirror`, `@lezer`, and Electron's `window.require`—and **does not
   resolve relative paths** within the plugin.  Consequently, `require("./x")`
   would return `undefined`, causing the plugin to fail to load.

   Workflow for changes: Modify source files → run `node bundle-inline.js
   <plugin-directory>` → run `sync-plugins.ps1`.

   ============================================================ */

/* ---------- locales.js ---------- */
/* Dense Reading —— Interface string table.

   Include only the keys specific to this plugin; the language dropdown,
   sponsorship section, and general buttons are provided by the common table.  */

/* Shared keys — These are identical across all four plugins; please
   synchronize any changes across all of them (there is a similar note in `i18n.js`).*/

const COMMON = {
  en: {
    "settings.language.name": "Interface language",
    "settings.language.desc":
      'Language for this settings page, commands and notices. "Follow Obsidian" tracks the app language.',
    "sponsor.title": "Sponsorship",
    "sponsor.body":
      "These plugins are built independently and released free and open-source, with no commercial tie-in. If one of them saves you time, you can support ongoing maintenance via GitHub Sponsors.",
    "meta.version": "Version",
    "meta.repository": "Repository",
    "common.reset": "Restore defaults",
    "common.reset.done": "Settings restored to defaults",
    "common.clear": "Clear",
  },
};

/* A key exclusive to this plugin. */
const OWN = {
  en: {
    "meta.desc":
      "Dense reading: tighter spacing plus an adjustable line width, with no Style Settings or CSS snippet required.",

    "command.toggle": "Toggle dense reading",
    "command.cycle": "Cycle line-width preset",
    "command.pin": "Pin line width for this note",
    "command.unpin": "Clear line width for this note",

    "notice.mode.on": "Dense reading: on",
    "notice.mode.off": "Dense reading: off",
    "notice.width": "Line width: {label}",
    "notice.pinned": 'Pinned to "{label}": {path}',
    "notice.unpinned": "This note's pinned width was cleared",

    "preset.w44": "Narrow",
    "preset.w54": "Balanced",
    "preset.w66": "Wide",
    "preset.w78": "Extra wide",
    "preset.custom": "Custom",

    "settings.usage":
      "Line width applies at the view layer and is independent of the master switch; spacing only kicks in while the switch is on. Both keep the same class names as the original dense-reading.css snippet, so migrating is seamless.",

    "settings.mode.name": "Dense spacing",
    "settings.mode.desc":
      "Tightens paragraph and heading spacing in reading view. With it off, nothing but the line width applies.",

    "settings.width.name": "Line-width preset",
    "settings.width.desc":
      "Overrides the theme's readable line width. Independent of the master switch.",

    "settings.custom.name": "Custom line width",
    "settings.custom.desc": "Only used when the preset above is set to Custom (36–96rem).",

    "settings.perNote.name": "Remember width per note",
    "settings.perNote.desc":
      "Each note can pin its own preset, applied automatically when you switch to it.",

    "settings.pinned.title": "Notes with a pinned preset ({n})",
    "settings.pinned.empty": "No note has a pinned preset yet",
    "settings.pinned.more": "…and {n} more",

    "settings.preview.label": "Width preview",
    "settings.preview.sample":
      "Line width sets how far the eye travels per line. Narrower reads more focused; wider suits tables and code.",

    "settings.reset.name": "Restore defaults",
    "settings.reset.desc":
      "Clear the master switch, the preset and every per-note pin back to their initial values.",
  },
};
const LOCALES = buildLocales();
/** Merge the public table with the plugin's table; fall back to English
    if the plugin lacks a specific language. */
function buildLocales() {
  const out = {};
  const langs = new Set([...Object.keys(COMMON), ...Object.keys(OWN)]);
  for (const lang of langs) {
    out[lang] = Object.assign(
      {},
      COMMON[lang] || COMMON.en,
      OWN[lang] || OWN.en
    );
  }
  return out;
}

/* ---------- i18n.js ---------- */
/* i18n — A multi-language runtime. 

   Why not use Obsidian's `moment.locale()`? Moment handles only date
   formatting and does not provide a UI string table; furthermore, language
   changes in the settings page need to take effect immediately, whereas
   Moment's switching mechanism requires the UI to be rebuilt.

   Design constraints:
   - `t()` never throws exceptions: if a key is missing, it falls back
     to English; if the English version is also missing, it returns the key
     name itself.  (A missing line of text in the settings page is better than
     a blank screen.)
   - Supports `{name}` placeholders; if a parameter is not provided, the
     placeholder remains as-is, making it easy to spot missing arguments.

   - All UI strings are centralized in `locales.js`; no string literals are
     kept in `main.js`.

   This `i18n.js` file is shared across four self-developed plugins (each has
   its own copy, as the plugins reside in independent repositories and cannot
   `require` one another). Please ensure any changes are synchronized across
   all four. */

/** Set the definition order for the language drop-down list on the page. */
const LANGUAGE_OPTIONS = [
  { id: "auto", label: "Follow Obsidian" },
  { id: "en", label: "English" },
];

/* Resolve preferences into actual language IDs.
   When set to "auto," it uses Obsidian's interface language; it falls back
   to English in the event of any error — a failure in language detection
   shouldn't prevent the settings page from opening.

 */
function resolveLanguage(pref) {
  if (pref && pref !== "auto" && LOCALES[pref]) return pref;
  try {
    const raw =
      window.localStorage.getItem("language") ||
      document.documentElement.lang ||
      "";
    const short = String(raw).toLowerCase().slice(0, 2);
    if (short && LOCALES[short]) return short;
  } catch (e) {
    /* Ignore: English for "fall back" / "retrace" */
  }
  return "en";
}

function translate(lang, key, vars) {
  const table = LOCALES[lang] || LOCALES.en;
  let s = table[key];
  if (s === undefined) {
    const fb = LOCALES.en[key];
    s = fb === undefined ? key : fb;
  }
  if (!vars) return s;
  return String(s).replace(/\{(\w+)\}/g, (m, name) =>
    vars[name] === undefined ? m : String(vars[name])
  );
}

/** Bind plugin instance: Read settings.language and expose t(). */
function bindI18n(plugin) {
  const current = () =>
    resolveLanguage(plugin && plugin.settings ? plugin.settings.language : "auto");

  plugin.i18n = {
    get resolved() {
      return current();
    },
    t(key, vars) {
      return translate(current(), key, vars);
    },
    options: LANGUAGE_OPTIONS,
  };
  return plugin.i18n;
}

/* ---------- sponsor.js ---------- */
/* 
   Sponsorship block.

   Deliberately designed as a standalone section rather than being buried in
   the descriptive text: the settings page is the only place users actually
   read carefully, so hiding it effectively renders it invisible. The block
   renders only a link and loads no external scripts or images—the plugin
   must maintain zero network requests to avoid scrutiny during the community
   marketplace review process.

   Why is there only a single GitHub Sponsors entry?  Initially, domestic
   and international options (Aifadian + Ko-fi) were listed separately,
   but qy decided to consolidate everything under GitHub— a single entry
   point simplifies maintenance and avoids including multiple platforms that
   might break or require real-name verification.

   Retaining the `SPONSORS` array structure (instead of flattening it into
   a single string) ensures that if a second entry needs to be added in
   the future, only the data requires modification, leaving the rendering
   code untouched.
 */

const SPONSORS = [
  { label: "GitHub Sponsors", url: "https://github.com/sponsors/yunmin311" },
];

function linkRow(parent, label, url) {
  const a = parent.createEl("a", { cls: "sp-link", text: label, href: url });
  a.setAttr("target", "_blank");
  a.setAttr("rel", "noopener");
}

/** Render the sponsorship block within the parent component.
   `t` is the translation function for the current language. */
function renderSponsor(parent, t) {
  const box = parent.createDiv({ cls: "sp-box" });
  box.createDiv({ cls: "sp-title", text: t("sponsor.title") });
  box.createDiv({ cls: "sp-body", text: t("sponsor.body") });

  const row = box.createDiv({ cls: "sp-row" });
  for (const l of SPONSORS) linkRow(row, l.label, l.url);
}

/* ======================== Inline module end ======================== */
/* ---------------------------------------------------------------- constant */

const WIDTH_CLASSES = ["dense-w44", "dense-w54", "dense-w66", "dense-w78", "dense-w-custom"];
const MODE_CLASS = "dense-reading-mode";

/* Breakpoint table:
   - values ​​are in `rem`; `null` indicates "custom," falling
     back to `settings.customWidth`.
   - `cls` is the corresponding body class—defined explicitly rather than
     via string concatenation, because concatenating a name like "custom"
     would result in something like `dense-wustom`.
   - `key` is the i18n key for the display name; the label updates when
     the language changes, whereas classes and IDs remain constant.
    */
const PRESETS = [
  { id: "w44", key: "preset.w44", rem: 44, cls: "dense-w44" },
  { id: "w54", key: "preset.w54", rem: 54, cls: "dense-w54" },
  { id: "w66", key: "preset.w66", rem: 66, cls: "dense-w66" },
  { id: "w78", key: "preset.w78", rem: 78, cls: "dense-w78" },
  { id: "custom", key: "preset.custom", rem: null, cls: "dense-w-custom" },
];

/* Tier ID → body class. A single entry point to avoid duplicating
   concatenation logic in multiple places.  */
function classForPreset(id) {
  const hit = PRESETS.find((p) => p.id === id);
  return hit ? hit.cls : "dense-w54";
}

const DEFAULT_SETTINGS = {
  /* Master switch: Compact line spacing for Reading View. Independent of
     line width; adheres to the semantic meaning of the segment.  */
  denseMode: false,
  /* Line width preset ID (see PRESETS).   */
  widthPreset: "w54",
  /* The number of rem to customize the scale (36–96, consistent with the
     clip's slider range).  */
  customWidth: 54,
  /* When opening a new note, should the note's saved settings be
     automatically applied?  */
  rememberPerNote: true,
  /* Tier coverage for each note: { "path/to/note.md": "w66" }.  */
  perNote: {},
  /* Interface language: auto / zh / en (see i18n.js).  */
  language: "auto",
};

/* ---------------------------------------------------------------- 主插件 */

class DenseReadingPlugin extends Plugin {
  async onload() {
    const saved = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
    if (typeof this.settings.perNote !== "object" || this.settings.perNote === null) {
      this.settings.perNote = {};
    }

    // Initial load: Persist the state to the `body`.
    this.applyClasses();

    bindI18n(this);

    this.addSettingTab(new DenseReadingSettingTab(this.app, this));

    const t = (k, v) => this.i18n.t(k, v);

    this.addCommand({
      id: "toggle-dense-mode",
      name: t("command.toggle"),
      callback: async () => {
        this.settings.denseMode = !this.settings.denseMode;
        await this.saveSettings();
        this.applyClasses();
        new Notice(
          this.i18n.t(this.settings.denseMode ? "notice.mode.on" : "notice.mode.off")
        );
      },
    });

    this.addCommand({
      id: "cycle-width",
      name: t("command.cycle"),
      callback: async () => {
        const ids = PRESETS.map((p) => p.id);
        const at = ids.indexOf(this.settings.widthPreset);
        this.settings.widthPreset = ids[(at + 1) % ids.length];
        await this.saveSettings();
        this.applyClasses();
        new Notice(
          this.i18n.t("notice.width", {
            label: this.presetLabel(this.settings.widthPreset),
          })
        );
      },
    });

    this.addCommand({
      id: "set-width-for-note",
      name: t("command.pin"),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) void this.pinCurrentNote(file.path);
        return true;
      },
    });

    this.addCommand({
      id: "clear-width-for-note",
      name: t("command.unpin"),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !(file.path in this.settings.perNote)) return false;
        if (!checking) void this.clearNotePin(file.path);
        return true;
      },
    });

    // When switching notes, apply that note's specific setting (if available).
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.applyClasses();
      })
    );

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.applyClasses();
      })
    );
  }

  onunload() {
    // Remove all classes added by the plugin during uninstallation,
    // leaving no traces behind.
    try {
      document.body.removeClass(MODE_CLASS, ...WIDTH_CLASSES);
    } catch {
      // Ignore uninstallation race conditions.
    }
  }

  /* -------------------------------------------------------------- 状态 */

  presetLabel(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return id;
    const name = this.i18n.t(p.key);
    return p.rem === null
      ? `${name}（${this.settings.customWidth}rem）`
      : `${name}（${p.rem}rem）`;
  }

  /* If the current note has a fixed slot assigned, return it;
     otherwise, return the global slot.  */
  effectivePreset() {
    if (!this.settings.rememberPerNote) return this.settings.widthPreset;
    try {
      const file = this.app.workspace.getActiveFile();
      if (file && file.extension === "md") {
        const pinned = this.settings.perNote[file.path];
        if (pinned && PRESETS.some((p) => p.id === pinned)) return pinned;
      }
    } catch {
      /* If the event file cannot be retrieved, use the global value.  */
    }
    return this.settings.widthPreset;
  }

  /* Writing the two-dimensional state as a body class—this is the only
     place where the plugin actually "does" anything.*/
  applyClasses() {
    const body = document.body;
    if (!body) return;
    const preset = this.effectivePreset() || "w54";
    const widthClass = classForPreset(preset);

    try {
      body.removeClass(...WIDTH_CLASSES);
      body.addClass(widthClass);

      if (this.settings.denseMode) body.addClass(MODE_CLASS);
      else body.removeClass(MODE_CLASS);

      /* Custom spacing levels rely on this variable for their values;
         a fallback of `var(--dense-width-value, 54rem)` is defined in the CSS.  */
      body.style.setProperty("--dense-width-value", `${this.clampWidth(this.settings.customWidth)}rem`);
    } catch {
      /* No anomaly should cause the plugin to crash; the worst-case
         scenario is simply that the styles fail to take effect. */
    }
  }

  clampWidth(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return 54;
    return Math.min(96, Math.max(36, n));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async setPreset(id) {
    this.settings.widthPreset = id;
    await this.saveSettings();
    this.applyClasses();
  }

  async setDenseMode(on) {
    this.settings.denseMode = on;
    await this.saveSettings();
    this.applyClasses();
  }

  async setCustomWidth(rem) {
    this.settings.customWidth = this.clampWidth(rem);
    await this.saveSettings();
    this.applyClasses();
  }

  /* Pin the current setting to a specific note.  */
  async pinCurrentNote(path) {
    const id = this.effectivePreset();
    this.settings.perNote[path] = id;
    await this.saveSettings();
    this.applyClasses();
    new Notice(
      this.i18n.t("notice.pinned", { label: this.presetLabel(id), path })
    );
  }

  async clearNotePin(path) {
    if (path in this.settings.perNote) {
      delete this.settings.perNote[path];
      await this.saveSettings();
      this.applyClasses();
      new Notice(this.i18n.t("notice.unpinned"));
    }
  }
}

/* ---------------------------------------------------------------- 设置页 */

class DenseReadingSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const t = (k, v) => this.plugin.i18n.t(k, v);
    containerEl.empty();
    containerEl.createEl("h3", { text: "Dense Reading" });

    new Setting(containerEl)
      .setName(t("settings.language.name"))
      .setDesc(t("settings.language.desc"))
      .addDropdown((drop) => {
        for (const opt of this.plugin.i18n.options) {
          drop.addOption(opt.id, opt.label);
        }
        drop.setValue(this.plugin.settings.language || "auto").onChange(
          async (v) => {
            this.plugin.settings.language = v;
            await this.plugin.saveSettings();
            this.display();
          }
        );
      });

    containerEl.createDiv({ cls: "dr-usage" }, (el) => {
      el.createEl("p", { text: t("settings.usage") });
    });

    new Setting(containerEl)
      .setName(t("settings.mode.name"))
      .setDesc(t("settings.mode.desc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.denseMode).onChange((v) => {
          void this.plugin.setDenseMode(v);
        })
      );

    new Setting(containerEl)
      .setName(t("settings.width.name"))
      .setDesc(t("settings.width.desc"))
      .addDropdown((drop) => {
        for (const p of PRESETS) {
          const name = t(p.key);
          drop.addOption(p.id, p.rem === null ? name : `${name} ${p.rem}rem`);
        }
        drop.setValue(this.plugin.settings.widthPreset).onChange((v) => {
          void this.plugin.setPreset(v);
          this.display();
        });
      });

    new Setting(containerEl)
      .setName(t("settings.custom.name"))
      .setDesc(t("settings.custom.desc"))
      .addSlider((s) =>
        s
          .setLimits(36, 96, 0.5)
          .setValue(this.plugin.settings.customWidth)
          .setDynamicTooltip()
          .onChange((v) => {
            void this.plugin.setCustomWidth(v);
            this.updatePreview();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.perNote.name"))
      .setDesc(t("settings.perNote.desc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.rememberPerNote).onChange((v) => {
          void (async () => {
            this.plugin.settings.rememberPerNote = v;
            await this.plugin.saveSettings();
            this.plugin.applyClasses();
            this.display();
          })();
        })
      );

    if (this.plugin.settings.rememberPerNote) {
      const pinned = Object.keys(this.plugin.settings.perNote);
      const box = containerEl.createDiv({ cls: "dr-pinned" });
      box.createEl("div", {
        cls: "dr-pinned-title",
        text: pinned.length
          ? t("settings.pinned.title", { n: pinned.length })
          : t("settings.pinned.empty"),
      });
      for (const path of pinned.slice(0, 12)) {
        const row = box.createDiv({ cls: "dr-pinned-row" });
        row.createSpan({ text: path });
        row
          .createEl("button", { text: t("common.clear") })
          .addEventListener("click", () => {
            void (async () => {
              await this.plugin.clearNotePin(path);
              this.display();
            })();
          });
      }
      if (pinned.length > 12) {
        box.createEl("div", {
          cls: "dr-pinned-more",
          text: t("settings.pinned.more", { n: pinned.length - 12 }),
        });
      }
    }

    /* Real-time preview: See width changes immediately when adjusting
       the slider, without needing to switch back and forth to test.

       Why not simply use `max-width: <n>rem`?  The actual line width ranges
       from 44–96rem (approx. 704–1536px), whereas the content area in
       the settings is only about 640px wide.  If an absolute value were
       set directly, **every setting level would fill the entire available
       space**, making all five levels look identical — rendering the
       preview useless. Therefore, a proportional mapping approach is used
       here instead (see `updatePreview`).
    */

    this.previewEl = containerEl.createDiv({ cls: "dr-preview" });
    this.previewEl.createEl("div", {
      cls: "dr-preview-label",
      text: t("settings.preview.label"),
    });
    const stage = this.previewEl.createDiv({ cls: "dr-preview-stage" });
    // Scale: Plot the width "relative to the narrowest setting" to make
    // the differences between settings visible.
    const ruler = stage.createDiv({ cls: "dr-preview-ruler" });
    this.barEl = ruler.createDiv({ cls: "dr-preview-bar" });
    this.sampleEl = stage.createDiv({ cls: "dr-preview-sample" });
    this.sampleEl.setText(t("settings.preview.sample"));
    this.readoutEl = this.previewEl.createDiv({ cls: "dr-preview-readout" });
    this.updatePreview();

    new Setting(containerEl)
      .setName(t("settings.reset.name"))
      .setDesc(t("settings.reset.desc"))
      .addButton((b) =>
        b.setButtonText(t("common.reset")).onClick(async () => {
          // The language setting is specific to "this page itself"
          // and is intentionally preserved when reverting to defaults;
          // otherwise, a single click on the button would switch the
          // interface to English for Chinese users.
          const keepLang = this.plugin.settings.language;
          this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS, {
            perNote: {},
            language: keepLang,
          });
          await this.plugin.saveSettings();
          this.plugin.applyClasses();
          new Notice(t("common.reset.done"));
          this.display();
        })
      );

    this.renderFooter(containerEl, t);
  }

  /* Version + Repository + Sponsorship. All four plugins share the
     same structure and copy.  */
  renderFooter(containerEl, t) {
    const wrap = containerEl.createDiv({ cls: "dr-about" });

    const meta = wrap.createDiv({ cls: "dr-about-meta" });
    meta.createSpan({ text: `${t("meta.version")} ${this.plugin.manifest.version}` });
    meta.createSpan({ cls: "dr-about-sep", text: "·" });
    const repo = meta.createEl("a", {
      text: this.plugin.manifest.id,
      href: `https://github.com/yunmin311/${this.plugin.manifest.id}-obsidian`,
    });
    repo.setAttr("target", "_blank");
    repo.setAttr("rel", "noopener");

    renderSponsor(wrap, t);
  }

  /* Map the actual line widths to a scale that makes the differences visually
     apparent on the settings page.

     The actual line widths range from 44rem to 96rem—all exceeding the
     width of the settings page itself; simply filling the available space
     would result in no discernible difference between the settings.  Here,
     the values ​​are normalized against 44rem: the narrowest setting
     occupies 55% of the width, the widest occupies 100%, and intermediate
     values ​​are determined via linear interpolation.  Consequently,
     the difference between w44 and w78 (a shift from 44 to 78, or roughly
     1.8x) is represented in the preview as a change from 55% to 81%, making
     the distinction immediately obvious; note that this is a **proportional
     representation**, not a pixel-perfect scale model.
   */
  updatePreview() {
    if (!this.sampleEl) return;
    const MIN_REM = 44;
    const MAX_REM = 96;
    const preset = PRESETS.find((x) => x.id === this.plugin.settings.widthPreset);
    const rem =
      preset && preset.rem !== null ? preset.rem : this.plugin.settings.customWidth;

    const t = Math.max(0, Math.min(1, (rem - MIN_REM) / (MAX_REM - MIN_REM)));
    const pct = 55 + t * 45; // 55% – 100%

    this.sampleEl.style.maxWidth = pct.toFixed(1) + "%";
    this.sampleEl.style.margin = "0 auto";
    if (this.barEl) this.barEl.style.width = pct.toFixed(1) + "%";
    if (this.readoutEl) {
      const label = preset && preset.rem !== null ? preset.id : "custom";
      this.readoutEl.setText(
        this.plugin.i18n.t("settings.preview.readout", {
          preset: label,
          rem: String(rem),
          px: String(Math.round(rem * 16)),
        })
      );
    }
  }
}

module.exports = DenseReadingPlugin;
