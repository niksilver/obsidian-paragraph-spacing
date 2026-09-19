# 截图任务书 — Dense Reading

README 里 `![Line width preview in settings](docs/shot-settings.png)` 这行已经写好，
**只等图片文件**。目前 `docs/` 是空的，所以 GitHub 上打开 README 会在那里显示一个破图。

## 需要几张

| 文件名 | 内容 | 必要性 |
|---|---|---|
| `docs/shot-settings.png` | **设置页**：语言选择器 + 行宽档位（含滑条）+ 总开关 + 页脚 | **必需**，README 已引用 |
| `docs/shot-reading.png` | **正文对比**：同一篇笔记，密排关 / 开 的对照 | 可选，但市场页面很吃这个 |
| `docs/shot-rail.png` | 阅读视图右侧的行宽效果（宽幅档） | 可选 |

先交第一张就能把破图修掉，后两张有了再补。

## 怎么截

**目标文件**：`E:\1project\dense-reading-obsidian\docs\`

1. 打开 **设置 → Dense Reading**（插件已启用，配置已预置好）。
2. 截图范围：**只截设置面板本身**，不要带整个 Obsidian 窗口，也不要用系统的窗口截图工具带阴影/圆角窗框。
   - Windows：`Win + Shift + S` → 矩形截取，框住设置面板内容区。
   - 如果 Obsidian 是深色主题，直接截就行，**不需要**换成浅色——README 在深浅两种主题下都能显示。
3. 建议**把语言切到 English 再截**（README 主文是英文，图与文一致更好看）；截完切回中文。
4. 存成 `shot-settings.png`，放进上面那个目录。

## 规格（不用你处理，我会做）

原图直接丢过来就行，我会统一：
- 裁掉多余留白、补 2× 边距
- 保证宽度 ≥ 1200px（GitHub 会等比缩放）
- 无损压缩到 300KB 以内（README 加载速度）

## 注意

- **别把 vault 路径、笔记标题、侧栏文件树留在图里** —— 这个仓库是 public。
  设置面板本身不含这些，但如果截图框大了就会带进来。
- 截图里**不要出现真实姓名/邮箱**（GitHub 是公开仓库）。
