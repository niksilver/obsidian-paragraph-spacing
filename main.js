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


/* ---------- locales.js ---------- */
/* Dense Reading —— Interface string table.

   Include only the keys specific to this plugin; the language dropdown,
   thanks section, and general buttons are provided by the common table.  */

/* Shared keys — These are identical across all four plugins; please
   synchronize any changes across all of them (there is a similar note in `i18n.js`).*/

const COMMON = {
  en: {
    "settings.language.name": "Interface language",
    "settings.language.desc":
      'Language for this settings page, commands and notices. "Follow Obsidian" tracks the app language.',
    "thanks.title": "Thanks",
    "thanks.body":
      "With thanks to yunmin31, whose Dense Reading plugin this is adapted from.",
    "meta.version": "Version",
    "meta.repository": "Repository",
  },
};

/* A key exclusive to this plugin. */
const OWN = {
  en: {
    "meta.desc":
      "Dense reading: tighter spacing plus an adjustable line width, with no Style Settings or CSS snippet required.",

    "command.toggle": "Toggle dense reading",

    "notice.mode.on": "Dense reading: on",
    "notice.mode.off": "Dense reading: off",

    "settings.mode.name": "Dense spacing",
    "settings.mode.desc":
      "Tightens paragraph and heading spacing in reading view.",

    "settings.reset.name": "Restore defaults",
    "settings.reset.desc":
      "Clear the master switch and the preset back to their initial values.",
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

/* 
   Thanks block.

   Deliberately designed as a standalone section rather than being buried in
   the descriptive text: the settings page is the only place users actually
   read carefully, so hiding it effectively renders it invisible. The block
   renders only a link and loads no external scripts or images—the plugin
   must maintain zero network requests to avoid scrutiny during the community
   marketplace review process.

   Retaining the `THANKS` array structure (instead of flattening it into
   a single string) ensures that if a second entry needs to be added in
   the future, only the data requires modification, leaving the rendering
   code untouched.
 */

const THANKS = [
  { label: "yunmin31 on GitHub", url: "https://github.com/yunmin311/" },
];

function linkRow(parent, label, url) {
  const a = parent.createEl("a", { cls: "sp-link", text: label, href: url });
  a.setAttr("target", "_blank");
  a.setAttr("rel", "noopener");
}

/** Render the thanks block within the parent component.
   `t` is the translation function for the current language. */
function renderThanks(parent, t) {
  const box = parent.createDiv({ cls: "sp-box" });
  box.createDiv({ cls: "sp-title", text: t("thanks.title") });
  box.createDiv({ cls: "sp-body", text: t("thanks.body") });

  const row = box.createDiv({ cls: "sp-row" });
  for (const l of THANKS) linkRow(row, l.label, l.url);
}

/* ======================== Inline module end ======================== */
/* ---------------------------------------------------------------- constant */

const MODE_CLASS = "dense-reading-mode";

const DEFAULT_SETTINGS = {
  /* Master switch: Compact line spacing for Reading View. Independent of
     line width; adheres to the semantic meaning of the segment.  */
  denseMode: true,
  /* Interface language: auto / zh / en (see i18n.js).  */
  language: "auto",
};

/* ---------------------------------------------------------------- 主插件 */

class DenseReadingPlugin extends Plugin {
  async onload() {
    const saved = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);

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
      document.body.removeClass(MODE_CLASS);
    } catch {
      // Ignore uninstallation race conditions.
    }
  }

  /* -------------------------------------------------------------- state */

  /* Writing the two-dimensional state as a body class—this is the only
     place where the plugin actually "does" anything.*/
  applyClasses() {
    const body = document.body;
    if (!body) return;

    try {

      if (this.settings.denseMode) body.addClass(MODE_CLASS);
      else body.removeClass(MODE_CLASS);

    } catch {
      /* No anomaly should cause the plugin to crash; the worst-case
         scenario is simply that the styles fail to take effect. */
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async setDenseMode(on) {
    this.settings.denseMode = on;
    await this.saveSettings();
    this.applyClasses();
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

    new Setting(containerEl)
      .setName(t("settings.mode.name"))
      .setDesc(t("settings.mode.desc"))
      .addToggle((tg) =>
        tg.setValue(this.plugin.settings.denseMode).onChange((v) => {
          void this.plugin.setDenseMode(v);
        })
      );

    this.renderFooter(containerEl, t);
  }

  /* Version + Repository + Thanks. */
  renderFooter(containerEl, t) {
    const wrap = containerEl.createDiv({ cls: "dr-about" });

    const meta = wrap.createDiv({ cls: "dr-about-meta" });
    meta.createSpan({ text: `${t("meta.version")} ${this.plugin.manifest.version}` });
    meta.createSpan({ cls: "dr-about-sep", text: "·" });
    const repo = meta.createEl("a", {
      text: this.plugin.manifest.id,
      href: "https://github.com/niksilver/obsidian-paragraph-spacing",
    });
    repo.setAttr("target", "_blank");
    repo.setAttr("rel", "noopener");

    renderThanks(wrap, t);
  }
}

module.exports = DenseReadingPlugin;
