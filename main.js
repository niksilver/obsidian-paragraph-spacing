/* Dense Reading（密排阅读）
   把原来那个 CSS 片段（dense-reading.css）+ Style Settings 的组合，换成真插件。

   为什么要变成插件：
   片段那套必须先在 Style Settings 里勾总开关、再手写 `cssclasses: dense-w54`
   才生效 —— 用户得先知道要写什么才用得上。插件把这层拿掉：
   命令面板直接切档位、每篇笔记记住自己的档位、设置页有实时预览。

   设计上守住原来片段的三条底线（它们是踩过坑得出的，不要动）：

   1. 只改「视图层」，不改文件。
      行宽必须写在 `:is(.markdown-source-view.mod-cm6, .markdown-preview-view,
      .markdown-rendered)` 上，不能写在 body 上 —— Obsidian 会内联
      `--file-line-width: 700px`，写在 body 上会被它压掉，看起来像没生效。

   2. 间距规则全部包在 `body.dense-reading-mode` 下。
      关掉总开关时，除了行宽以外零生效，不残留任何副作用。

   3. 不写死颜色。
      hr / 行内代码一律 currentColor + color-mix，跟随主题。

   实现路线：只往 body 上加 class。
   档位是 dense-w44 / dense-w54 / dense-w66 / dense-w78 / dense-w-custom，
   与片段完全同名 —— 这样两套可以共存、也可以平滑迁移，互不打架。
*/

"use strict";

const { Plugin, PluginSettingTab, Setting, Notice } = require("obsidian");

/* ---------------------------------------------------------------- 常量 */

const WIDTH_CLASSES = ["dense-w44", "dense-w54", "dense-w66", "dense-w78", "dense-w-custom"];
const MODE_CLASS = "dense-reading-mode";

/** 档位表：值是 rem 数；null 表示「自定义」，另取 settings.customWidth。
 *  `cls` 是它对应的 body class —— 显式写出来而不是靠字符串拼，
 *  因为 "custom" 这种档位名一旦去拼就会拼成 `dense-wustom`。 */
const PRESETS = [
  { id: "w44", label: "窄读", rem: 44, cls: "dense-w44" },
  { id: "w54", label: "均衡", rem: 54, cls: "dense-w54" },
  { id: "w66", label: "宽幅", rem: 66, cls: "dense-w66" },
  { id: "w78", label: "超宽", rem: 78, cls: "dense-w78" },
  { id: "custom", label: "自定义", rem: null, cls: "dense-w-custom" },
];

/** 档位 id → body class。唯一入口，避免在多处重复拼接逻辑。 */
function classForPreset(id) {
  const hit = PRESETS.find((p) => p.id === id);
  return hit ? hit.cls : "dense-w54";
}

const DEFAULT_SETTINGS = {
  /** 总开关：阅读视图的密排间距。与行宽互相独立，沿用片段的语义。 */
  denseMode: false,
  /** 行宽档位 id（见 PRESETS）。 */
  widthPreset: "w54",
  /** 自定义档位的 rem 数（36–96，与片段的滑条范围一致）。 */
  customWidth: 54,
  /** 打开新笔记时，是否自动套用该笔记记住的档位。 */
  rememberPerNote: true,
  /** 每篇笔记的档位覆盖：{ "path/to/note.md": "w66" }。 */
  perNote: {},
};

/* ---------------------------------------------------------------- 主插件 */

class DenseReadingPlugin extends Plugin {
  async onload() {
    const saved = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
    if (typeof this.settings.perNote !== "object" || this.settings.perNote === null) {
      this.settings.perNote = {};
    }

    // 首次加载：把状态落到 body 上。
    this.applyClasses();

    this.addSettingTab(new DenseReadingSettingTab(this.app, this));

    this.addCommand({
      id: "toggle-dense-mode",
      name: "切换密排阅读",
      callback: async () => {
        this.settings.denseMode = !this.settings.denseMode;
        await this.saveSettings();
        this.applyClasses();
        new Notice(this.settings.denseMode ? "密排阅读：开" : "密排阅读：关");
      },
    });

    this.addCommand({
      id: "cycle-width",
      name: "循环切换行宽档位",
      callback: async () => {
        const ids = PRESETS.map((p) => p.id);
        const at = ids.indexOf(this.settings.widthPreset);
        this.settings.widthPreset = ids[(at + 1) % ids.length];
        await this.saveSettings();
        this.applyClasses();
        new Notice(`行宽：${this.presetLabel(this.settings.widthPreset)}`);
      },
    });

    this.addCommand({
      id: "set-width-for-note",
      name: "为当前笔记固定行宽档位",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) void this.pinCurrentNote(file.path);
        return true;
      },
    });

    this.addCommand({
      id: "clear-width-for-note",
      name: "清除当前笔记的行宽档位",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !(file.path in this.settings.perNote)) return false;
        if (!checking) void this.clearNotePin(file.path);
        return true;
      },
    });

    // 换笔记时套用该笔记自己的档位（如果有）。
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
    // 卸载时把插件加的 class 全部摘掉，不留残留。
    try {
      document.body.removeClass(MODE_CLASS, ...WIDTH_CLASSES);
    } catch {
      /* 忽略卸载竞态 */
    }
  }

  /* -------------------------------------------------------------- 状态 */

  presetLabel(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return id;
    return p.rem === null ? `${p.label}（${this.settings.customWidth}rem）` : `${p.label}（${p.rem}rem）`;
  }

  /** 当前笔记若固定过档位，返回它；否则返回全局档位。 */
  effectivePreset() {
    if (!this.settings.rememberPerNote) return this.settings.widthPreset;
    try {
      const file = this.app.workspace.getActiveFile();
      if (file && file.extension === "md") {
        const pinned = this.settings.perNote[file.path];
        if (pinned && PRESETS.some((p) => p.id === pinned)) return pinned;
      }
    } catch {
      /* 拿不到活动文件就用全局值 */
    }
    return this.settings.widthPreset;
  }

  /** 把两个维度的状态写成 body class —— 这是插件唯一真正「做事」的地方。 */
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

      // 自定义档位靠这个变量取值；CSS 里写了 var(--dense-width-value, 54rem) 兜底。
      body.style.setProperty("--dense-width-value", `${this.clampWidth(this.settings.customWidth)}rem`);
    } catch {
      /* 任何异常都不该让插件崩掉；最坏情况就是样式没生效。 */
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

  /** 把当前档位固定到某篇笔记上。 */
  async pinCurrentNote(path) {
    const id = this.effectivePreset();
    this.settings.perNote[path] = id;
    await this.saveSettings();
    this.applyClasses();
    new Notice(`已固定为「${this.presetLabel(id)}」：${path}`);
  }

  async clearNotePin(path) {
    if (path in this.settings.perNote) {
      delete this.settings.perNote[path];
      await this.saveSettings();
      this.applyClasses();
      new Notice("已清除该笔记的档位固定");
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
    containerEl.empty();
    containerEl.createEl("h3", { text: "Dense Reading" });

    containerEl.createDiv({ cls: "dr-usage" }, (el) => {
      el.createEl("p", {
        text:
          "行宽按「视图层」生效，不受总开关影响；间距只在总开关打开时作用。" +
          "两者都与原来的 dense-reading.css 片段同名，可平滑迁移。",
      });
    });

    new Setting(containerEl)
      .setName("密排阅读总开关")
      .setDesc("收紧密排阅读视图的段落与标题间距。关闭时除行宽外零生效。")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.denseMode).onChange((v) => {
          void this.plugin.setDenseMode(v);
        })
      );

    new Setting(containerEl)
      .setName("行宽档位")
      .setDesc("覆盖主题的可读行宽。与总开关互相独立。")
      .addDropdown((drop) => {
        for (const p of PRESETS) {
          drop.addOption(p.id, p.rem === null ? p.label : `${p.label} ${p.rem}rem`);
        }
        drop.setValue(this.plugin.settings.widthPreset).onChange((v) => {
          void this.plugin.setPreset(v);
          this.display();
        });
      });

    new Setting(containerEl)
      .setName("自定义行宽")
      .setDesc("仅在行宽档位选「自定义」时生效（36–96rem）")
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
      .setName("按笔记记住档位")
      .setDesc("每篇笔记可以固定自己的档位，切换笔记时自动套用。")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.rememberPerNote).onChange((v) => {
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
        text: pinned.length ? `已固定档位的笔记（${pinned.length}）` : "还没有固定过档位的笔记",
      });
      for (const path of pinned.slice(0, 12)) {
        const row = box.createDiv({ cls: "dr-pinned-row" });
        row.createSpan({ text: path });
        row.createEl("button", { text: "清除" }).addEventListener("click", () => {
          void (async () => {
            await this.plugin.clearNotePin(path);
            this.display();
          })();
        });
      }
      if (pinned.length > 12) {
        box.createEl("div", { cls: "dr-pinned-more", text: `…另外 ${pinned.length - 12} 条` });
      }
    }

    // 实时预览：改滑条时立刻看到宽度变化，不用来回切笔记试。
    this.previewEl = containerEl.createDiv({ cls: "dr-preview" });
    this.previewEl.createEl("div", { cls: "dr-preview-label", text: "行宽预览" });
    const stage = this.previewEl.createDiv({ cls: "dr-preview-stage" });
    this.sampleEl = stage.createDiv({ cls: "dr-preview-sample" });
    this.sampleEl.setText(
      "阅读行宽决定了眼睛每行的移动距离。窄一点更专注，宽一点更适合表格与代码。"
    );
    this.updatePreview();
  }

  updatePreview() {
    if (!this.sampleEl) return;
    const preset = this.plugin.settings.widthPreset;
    const p = PRESETS.find((x) => x.id === preset);
    const rem = p && p.rem !== null ? p.rem : this.plugin.settings.customWidth;
    // 预览用 px 近似：1rem ≈ 16px，再按舞台宽度收一下，避免撑破设置页。
    const target = Math.max(44, Math.min(96, rem)) * 16;
    this.sampleEl.style.maxWidth = `${target}px`;
    this.sampleEl.style.margin = "0 auto";
  }
}

module.exports = DenseReadingPlugin;
