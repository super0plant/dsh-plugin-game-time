# 下一版发布文案（0.12.0 候选）

> 用途：把 0.9.0 之后散落在多个补丁里的变化，合成一份给用户看的说明。
> 发版时整段贴进 GitHub Release；`CHANGELOG` 里仍按版本分条保留。

---

## Game Time 0.12.0

### 中文

这一版把「看时长」这件事收口了：今日页重排、图表重画、时间窗口换成更符合直觉的「近 7 天 / 近 1 月」。

**今日页**
- 顺序调整为：统计卡 → 今天玩过 → 趋势图。
- 趋势图独立成一个模块：左边「今日 24 小时」，右边「近 7 天 / 近 30 天」；在右图上滚动滚轮即可切换 7/30 天，不需要点按钮。
- 两张图默认是曲线，可以把任意一张切成柱状；每张卡**各自记住**自己的选择，重启 DSH 后仍然保留（存在配置文件，不在浏览器里）。
- 鼠标悬停只显示一个数值（如 `3.5时` / `42分`）；**点一下柱子**才弹出完整明细（各游戏/平台各占多久），点图表以外的地方关闭。
- 两张图都能左右拖动看更早的数据，`↺` 回到当前。

**图表**
- 曲线改成堆叠色带，和柱状图用同一套颜色与顺序，切换视图不会跳色。
- 曲线用单调三次平滑，拐点圆润但不会冲出数据范围；面积渐变、双层描边、数据点按密度显隐。
- 柱状图顶部圆角；零值柱子不再画。

**时间窗口**
- 新增「近 7 天 / 近 1 月」，替换原来的「本周 / 本月」；它们是定长窗口，可以左右平移。
- 平移/缩放只在你需要的时候出现（没有可翻的页就不显示按钮）。

**背景**
- 面板改成「不透明纯色打底 + 图片叠加」，DSH 自己的主题不会再透上来和背景图混在一起；图片透明度真正可调。
- 背景裁剪可选预设比例（原图 / 16:9 / 8:3 / 4:3；标题图 6:1 / 4:1 / 3:1），图标仍是 1:1。
- 「铺满」改为：宽度跟随窗口，缩到原图尺寸就停住，再窄只裁切不压缩。

**其他**
- 修「选择文件」卡死：取消不会再弹第二个窗口；对话框有真实父窗口，不会藏在主窗口后面。
- 粘贴 `.lnk` / `.url` 路径也会解析成真实 exe（以前只有拖拽会）。
- 一键备份 / 还原：`backup.cmd` / `restore.cmd`（备份数据文件 + 打代码标签；还原前会先另存当前数据）。

**已知限制**
- 仅 Windows。
- 没有自动发现：新游戏需要手动拖入 exe。
- 目前只有「按进程计时」，没有「仅前台计时」（旧开关已移除，替代方案在计划中）。
- 数据只在本机 `%USERPROFILE%\.dsh\storages\game-time\`。

### English (short)

Charts and the today page are settled in this release.

- Today page: summary, then today's games, then a trend module with a 24-hour chart and a 7/30-day chart (wheel to switch). Hover shows a single number; click a column for the breakdown; click outside to close.
- Each chart remembers its own bar/line choice and the 7/30-day window in the config file, so a restart keeps them.
- Line charts stack the same slices as the bars, use monotone smoothing, gradient fills and density-aware dots; bars get rounded caps.
- Rolling 7-day / 30-day windows replace calendar week/month, and both pan left/right.
- Backgrounds are an opaque base colour with the image on top, so DSH themes cannot bleed through; crop presets for backgrounds; cover never squashes the image.
- The file picker no longer chains dialogs, and pasted shortcuts resolve.
- Windows only, local data under `%USERPROFILE%\.dsh\storages\game-time\`.

---

## 发布前检查清单

- [ ] `npm test` 退出码 0
- [ ] 两处版本号一致（`package.json` / `client.js`）
- [ ] `CHANGELOG.md` 有本版条目
- [ ] `node scripts/build.mjs` 出包
- [ ] Release 只挂 `dsh-plugin-game-time.zip`（资产名不带版本号）
- [ ] 需要重启 DSH 的改动在说明里写清楚
