# Game Time — 交接文档

> 给下一个会话/下一个人的现状说明。读完这份就能接着改，不需要回溯之前的对话。
>
> **回复约定**：每次答复开头先写一行「难度：★☆☆☆☆（很低）」这样的评级（5 星制 + 一句理由）；**关键步骤当场记进 §1「最近改动」**，不要攒到最后。详见 §13。

---

## 0. 现状速览（先读这 12 行）

- **版本**：0.16.0（本地已提交 + 已打 tag `v0.16.0`，**未推送**：沙箱里没有可用的 GitHub 凭据，见 §10）；GitHub 线上最新仍是 **v0.15.2**；**npm 未发布** —— 包名空闲（`npm view` 404），但 `%USERPROFILE%\.npmrc` 里的 token 已失效（`npm whoami` 401、`publish` E404），需要换一个新 token。
- **形态**：只有 DSH 插件。独立网页版/桌面外壳已在 0.14.0 移除（`standalone/`、`tests/standalone-check.mjs`、`docs/WEB-FROZEN.md` 都删了）。
- **测试**：**四套**（render / host / exit / restore），`npm test` 一条命令；**一定看退出码**。
- **今日页**：三张对比卡（本日 / 本周·本月 / 总计，带圆轮）→ 今天玩过（行中间有三段灰字提示）→ 「趋势图」模块（左 24 小时、右 7/30 天，滚轮切换，悬停看数值、点击看明细）。
- **时间窗**：今日 / 近 7 天 / 近 1 月 / 全部；`last7`、`last30` 是**定长可平移**窗口。
- **平均**：全站只有一个口径——**有玩的那一天**的平均（`averagePerDay` / `activeDaysOf` / `activeMean`）；没玩的日子不进分母。改平均先改这三个函数。
- **列表提示**：`对比平均 / 平均每天 / 已玩` 只给最近 `settings.statsDays`（默认 7）天内玩过的游戏显示。
- **响应式**：`Page` 用 `ResizeObserver` 量 `.gt-shell` → `data-w="lg|md|sm|xs|xxs"` → CSS 分档隐藏。**不要用 `@media`**（面板宽度 ≠ 窗口宽度）。
- **背景**：不透明纯色底（`settings.baseColor`）+ 图片（`imageOpacity`）；每个游戏可独立背景。
- **偏好**：`settings.todayChartHours` / `todayChartRange` / `todayWindow` / `statsDays`，存在 config.json（不是 localStorage）。
- **改哪里生效**：`client.js` → 刷新页面；`src/host/*`、`index.js` → 重启 DSH；**新增配置字段必须先加白名单再重启**。
- **备份/还原**：`backup.cmd` / `restore.cmd`（数据快照 + 代码 tag；`backups/` 已 gitignore）。
- **发布**：流程见 `docs/RELEASING.md`，下一版文案见 `docs/RELEASE-NEXT.md`。
- **历史**：改动细节按版本记在 §1（最近）与 `CHANGELOG.md`（全量）。

---

## 1. 这是什么

一个 DSH 插件，在侧边栏加「游戏时长」面板，本地采集游戏游玩时长：

- 按进程判断游戏是否在运行（不看启动器）
- 记录每局开始/结束，按天、周、月、总计统计
- 支持多平台合并、按平台拆分、背景图、自定义图标、图标裁剪
- 多个小游戏可归到同一个统计组（`group`）；卸载的游戏可归档折叠（`archived`）
- 数据全部落在本地 `%USERPROFILE%\.dsh\storages\game-time\`

**当前状态**：源码 0.11.6；今日页趋势模块、滚动窗口、背景纯色底、选择框修复均已上线；**网页版/桌面外壳已删除**。已发布 v0.11.6（GitHub Release）。**未完成**：npm 发布、awesome 投稿、自动发现（§11）、双采集器硬互斥、按游戏的后台暂停（替代 §10 #5）、CI、英文 README。
**分享版 0.2.0**：两个包——DSH 插件包与独立网页包（`dist/`，`node scripts/build.mjs` 生成）；不预置任何游戏与启动器路径，设置页底部有作者署名（茄子超人），安装说明见 `README.md`。

### 版本管理（2026-11-10 起）

- 仓库：`plugins/game-time/.git`（main 分支）；当前 4 个提交：`bfd00b1`（保留全部+懒加载）、`361537f`（changelog）、`890d80f`（首包幽灵修复）、外加本次 docs 交接/性能提交。工作区干净。
- `.gitignore` 忽略 `node_modules/`、`dist/`、日志、`.tmp-*` 等；`.gitattributes` 对 `.ps1`/`.cmd` 用 `-text`，**`launcher.ps1` 的 UTF-8 BOM 不能丢**（build 会校验）。
- 约定：功能/修复 + 测试通过 + 文档同步后自动 commit；**push、改历史、删分支/标签必须先问用户**；只跟踪源码，**不跟踪** `%USERPROFILE%\.dsh` 里的游玩数据。

### 最近改动（按时间倒序，新条目加在最上面）

- **2026-11-16 · 0.16.0 平均口径统一 + 列表提示 + 对比圆轮 + 详情页天数（a/b/c/d/e 五件事）**：按用户要求做成**五个可分别 revert 的提交**（`cc7cf3c` 共用函数 → `a13c4b7` 宿主天数 → `2f96d52` 图表平均 → `a9da03a` 详情页 → `c30e230` 行提示 → `686adf8` 提示时间窗设置 → `f528ea1` 圆轮）。

  - **e · 图表平均忽略 0**：`Chart` 的 `mean` 改调 `activeMean(points)`（分母 = 非零格子数）。`render-check` 新增「同一组非零值、有没有空格子，平均线 y 必须相同」。
  - **d · 详情页**：新增「已玩 xx天」（跟随范围；`全部` 用宿主全量天数）、「平均」→「平均每天」（范围时长 ÷ 范围天数）。`.gt-summary` 变四列（`.gt-summary-4`），窄屏 2×2。`全部` 的时长改用 `totalsFor(all)`（以前是「已加载窗口」的时长，和头部全量总计不一致）。
  - **列表行提示**：`HintStrip`（两处列表共用）：显示顺序是 `平均/天:`、`总天数:`、`比平均:`（**半角冒号**，不要用全角 `：`）。三段合起来是一个**白色细边**的小圆角 chip（`.gt-hints`：固定列宽 88/64/84，窄档换 44/28/40 等，`flex:0 0 auto` + `margin-left:auto`）。**标签 11 px 灰字、数值 13 px 满强度**（和右侧数字列同号，这是用户明确要求的「数据要高亮、和数字一样大」）；内容左对齐，所以上下行的同名数据在同一条竖线上。**data-rank 按重要性排列（2、3、1）**——`比平均` 是 rank 1，最后才消失；收起的顺序是 灰字标签 → 总天数(3) → 平均/天(2) → 比平均(1)。
  - **列表外框**：`.gt-list-card` 把「标题 + 表头 + 行」包成一张圆角软框（12 px 圆角、`.18` 边框、淡渐变底），首页因此是「统计卡 / 列表卡 / 趋势卡」三个区块。如果觉得两层框太重，删掉这一个 class 即可回到无外框。
  - **b · 只给最近玩过的显示**：`settings.statsDays`（1–3650，默认 7），设置页「界面 → 列表提示」。判定用 `lastPlayedAt(gameId)`，超过窗口整条提示不渲染。
  - **c · 三张统计卡**：`StatsRow` + `Ring`（纯 SVG）。本日 = 今天 vs「平均每日」（**基准排除今天**，否则今天玩得多会抬高自己的基准）；本周 = **本周已玩 ÷ 上周总和**（分母是上周总量，不是日均；点卡片切本月时换成上月总和，`STATS_PERIOD` 放模块级，和 `LAST_ROUTE` 同理）；总计 = 总计 + `已玩 xx天`，圆轮分母是 `recordDays()`（首条记录 → 今天，含两端）。
  - **圆轮是双轨**（2026-11-16 定为最终形态）：**内圈 = 目标 0–100%**（r 13、4 px；<100% 灰底绿弧，≥100% 满），**外圈细轨 = 超出的 100–200%**（r 19、2 px、红）。≥200% 时外圈满、内圈压暗成红底（`strokeOpacity` .4）。中间直接写百分比，>100% 红字、>999% 封顶 `999%+`。**不要再把 200% 画在同一个圆上**——一圈画不下第二圈，靠同色深浅区分对比不够（用户实机反馈「看着像纯色」）。
  - **统计卡小字**：`平均/天:3.2时`（半角冒号、标签在前）和时间**同一行**（`.gt-stat-line`），小字本身是一个小圆角 chip；圆轮 `margin-left:auto` 靠右，卡片两行高。
  - **列表对齐**：`.gt-row-main .gt-name-wrap` 基准宽度（lg 180 / md 150 / sm 140 / xs 120，xxs 吃满，`flex:0 1` 可被挤窄）+ 名字省略号；`.gt-hints` 是**固定列宽 grid**（88/64/84 → 44/28/40 → 44/40 → 40）+ 白色细边 chip，`flex:0 0 auto` + `margin-left:auto`——chip 跨行同宽同位置，内容左对齐。改列数时必须同时改 `grid-template-columns`，否则会留一个空列。
  - **字号/颜色 token**：`.gt-shell` 上定义 `--gt-fs-1..4`（10/11/13/20px）、`--gt-green`、`--gt-red`、`--gt-muted`。**新增样式一律用这四档字号和两个强调色**，不要再写字面量（这轮之前同一屏有 9/10.5/11/12/12.5/23 六种字号）。
  - **响应式**：`widthTier(shellWidth)` → `.gt-shell[data-w]`；隐藏顺序＝灰字标签 → rank3（总天数）→ rank2（平均/天）→ rank1（比平均）；统计卡先藏圆轮、再藏小字标签、最后藏整段小字。
  - **宿主**：`/state` 新增 `playedDays`（每游戏全量天数）+ `playedDaysTotal`；`snapshot()` 里用 `dayRangeOf()`（`src/host/sessions.js`）拿**连续整数日索引**，共享一个 `Date`（最初一版每个会话 new 两个 Date，慢一个数量级）。实测中位数：1 年×4 局/天 0.13 → 0.23 ms；10 年×4 局/天 0.55 → 1.77 ms；11 万条会话 4.45 → 17.8 ms（30 秒一次 ≈ 0.06% CPU）。这一块字段**可合并**（秒数/天数相加、首末时间取 min/max），见 §10 的分片计划。
  - **验证**：render-check 新增 4 组断言（平均口径、详情四卡、行提示 + 时间窗、圆轮几何 + 本周→本月切换）；host-check 新增「已玩天数按自然日去重 + 跨零点算两天 + 白名单 clamp」；四套全绿。

- **2026-11-15 · 0.15.2 Steam .url 识别修复 + 拖入失败提示**：`RESOLVE_SCRIPT` 的 exe 扫描 `-Depth 2`→`4`（Alyx 的 `hlvr.exe` 在 `game\bin\win64` 4 层内），过滤词加 `install|vconsole|vrserver|vrprism|vrcompositor|vrmonitor|vrstartup|vrdashboard|vrwebhelper|vrpathreg|vrsetup`（Wallpaper Engine 之前选中 `installer.exe`，SteamVR 会选 `vrprismhost.exe`）。验证方式：用 `$env:APPDATA\...\Start Menu\Programs\Steam\*.url` 跑 `RESOLVE_SCRIPT`（powershell -File），现在 Celeste/Alyx/VRChat/Wallpaper Engine 都能解析到正确 exe。另外 `DropSurface` 加了 `note` 状态 + `.gt-drop-toast`，识别失败时显示原因（新 key `drop.badGame`），不再静默。注意：Node 里 `spawnSync` 抓 stdout 在沙箱会 EPERM，所以测试解析器要用 `powershell -File` 直接跑、结果读 JSON 文件。


- **2026-11-15 · 0.15.1 今日页空状态文案**：只改 `empty.title` / `empty.body`（今日页用），中文「今天还没有玩游戏 / 如要添加新游戏，把游戏 exe 或快捷方式拖到面板里」，英文「No games played today / To add a new game, drop its exe or shortcut on this panel」。**「全部」页用的是 `all.empty`，没动**。纯前端。


- **2026-11-14 · 0.15.0 内置平台名本地化 + 独立 profile 安装验证**：新增 `platformLabel(platform)`（模块级 `TR_FN` 在 apply 里绑定 `t`），替换徽章/图例/设置列表/会话行/添加弹窗里的 `platform.name`；`platform.id === 'other'` 时用 `t('platform.other')`。配置里仍存「其他」，不写回英文。另外用 `npm pack` 的 tgz 在 `~/.dsh/profiles/game-time-test` 跑 `pnpm install` 验证包可安装（0.15.0），desktop profile 的 `link:` 未动。注意：写 `~/.dsh/profiles` 需要 danger-full-access。


- **2026-11-14 · 0.13.0 拖拽添加 + 确认弹窗 + 默认「其他」平台 + 检查更新 + 英文 README**：① `DropSurface`（今日/全部/详情三处根节点）接页面级拖放，遮罩提示后弹 `AddGameDialog`（可改名称、选平台，默认 `other`，重复 exe 只提示）；数据来自新函数 `draftGameFromResolved` → 确认后 `commitGameDraft`，与设置页那套共存。② `DEFAULT_PLATFORMS` 加 `other`（无启动器路径），`PRESETS_VERSION` 1→2，老配置启动时自动补上；新游戏 platform 兜底改为 `other`。③ 空状态文案改成「当前没有进程在计时 + 拖入提示」。④ 设置页「关于」+ `UpdateCheck`（GitHub Releases API，只读，`compareVersion` 比较后提示/给下载链接）。⑤ `README.en.md` 精简英文版 + 中文 README 顶部切换。⑥ 修 AllView 默认 `range='week'`（该选项已被 last7/last30 取代）导致选择器无高亮的 bug。验证：新增 draft/confirm/duplicate 三条断言 + 五套全绿。**宿主预置变了 → 重启 DSH。**


- **2026-11-14 · 0.12.0 语言设置（跟随系统 / 中文 / English）**：`settings.language`（auto|zh|en）进宿主白名单 + `constants.js` 默认 `auto`；客户端 `t()` 改成「auto → 直接用 DSH 的 `ctx.locale.bind` 结果（DSH 自己会跟随系统并兜底），zh/en → 取本插件字典」。设置页「界面」组多了语言下拉。注意：**不要在 `t()` 里自己判断 navigator.language 覆盖 auto**——第一次写成那样，测试里 `t` 是恒等函数、而真实环境会返回字典值，导致两套行为；现在 auto 完全交给 DSH。踩坑：用脚本按行号替换 `apply` 块时多留了一个 `)` 和一份重复的 `sidebar.panellist` 注册，`node --check` 直接报错，靠它发现。宿主白名单变了 → 重启 DSH。


- **2026-11-14 · 0.11.6 趋势图最小宽度 450px**：`.gt-trend-row` 的 `minmax(450px,1fr)` + `.gt-trend-cell{min-width:450px}`（原 260/240）。并排需 ~910px，更窄则两行；单卡窄于 450 时横向滚动不压缩。纯 CSS，刷新即生效。


- **2026-11-14 · 0.11.5 拆开两张趋势图的图型记忆**：0.11.4 用同一个 `settings.todayChart` 做受控属性，点一张另一张跟着变（用户报的「左右绑在一起」）。现在拆成 `todayChartHours`（左 24h）和 `todayChartRange`（右 7/30 天），`TodayTrend` 加 `prefField` 决定读写字段时间，两张卡各自受控、各自 `touch()` 落盘。旧字段 `todayChart` 从白名单移除（保存后自动消失）。**宿主白名单变了，重启 DSH 生效。** 验证：五套全绿。


- **2026-11-14 · 0.11.4 趋势图偏好进配置 + 点外部关卡片 + 自适应两列**：① 偏好从 localStorage 挪到 `settings.todayChart` / `settings.todayWindow`（宿主 `sanitizeConfig` 白名单 + `constants.js` 默认值 + 客户端 `SETTINGS` 默认值）；`TodayTrend` 写入后调 `touch()` 落盘，重启 DSH 仍生效；`ChartCard` 支持受控 `chartType` / `onChartType`（不再依赖 localStorage）。② `Chart` 加 `wrapRef` + `useEffect(document mousedown)`，点到图表外清空 `detail`。③ `.gt-trend-row` 改 `repeat(auto-fit,minmax(260px,1fr))` + `overflow-x:auto`，`.gt-trend-cell` `min-width:240px`：宽=两列、窄=两行、再窄=横向滚动不压缩。**宿主白名单改了，要重启 DSH 才生效。** 验证：五套全绿。


- **2026-11-14 · 0.11.3 趋势图改「悬浮看数值、点击看明细」**：Chart 新增 detailOnClick（ChartCard 透传），今日页两张卡传 true。命中区 onMouseMove 在 detailOnClick 时只 setTip({x,y,chip:compactDuration(秒)})；onClick 打开/切换 detail（Object.assign(tipFor(...), {key}) 用于判断同一根）。渲染分支：detailOnClick 时画 .gt-chart-chip 小标签 + 由 detail 画完整卡片；非 detailOnClick 走原来的悬浮卡片。新增 compactDuration()（≥1 小时保留一位小数、去 .0；<1 小时按分钟）。文字密度在 .gt-trend-module 作用域内降：隐藏卡片日期范围、坐标字号 6.5px、说明缩短；**回退只需删那三条 CSS**。验证：新增 4 条 compactDuration 断言 + 五套全绿。**纯前端。**

- **2026-11-14 · 0.11.2 趋势图模块化 + 偏好记忆**：ChartCard 新增 defaultType / prefKey 两个可选属性（不传就还是柱状、不记忆，不影响「全部」页）；storedPref/setStoredPref 包一层 localStorage。今日页两张卡传 defaultType:'line' + prefKey:'gt-today-chart'，所以默认曲线、点柱状后记住；7/30 天窗口也存 gt-today-window，滚轮切换时写入。两张卡包进 .gt-trend-module，标题「趋势图」+ 说明，模块 order-top 与列表分隔。验证：render-check 断言「两张卡默认 line」「模块只有一个」+ 五套全绿。**纯前端。**

- **2026-11-14 · 0.11.1 今日页双趋势图定稿**：① 顺序改成 统计卡 → 今天玩过列表 → 趋势图（用户要求「今日玩过放在表格上面」）；② 左图 = 
ange:'day' + GRAIN.h1（24 根小时柱），右图 = last7/last30 + GRAIN.d1，TodayTrend 用 onWheel（280ms 防抖）在 7/30 天之间切换，去掉了原来的「周/月」分段按钮；③ windowBounds 去掉「滚动窗口忽略 anchor」的特判，last7/last30 恢复成可平移的定长窗口（
angeLabelOf 的特判同步删除，注意别把 const unit = grainOf(...) 一起删掉——这次就删错过一次，靠 render-check 抓到）；④ AllView/DetailView 的 
olling ? undefined 门控全部移除，平移/缩放/重置恢复。验证：五套全绿。**纯前端，刷新即可。**

- **2026-11-14 · 0.11.0 滚动窗口 + 今日页双趋势图（从 0.9.0 重新做，避开 0.10.0）**：0.10.0 的今日页（正在游玩卡/同期对比/小图）在真机出问题，已整体 git reset --hard v0.9.0 回退，本版只在 0.9.0 上加趋势图。数据层新增 last7 / last30：
angeBounds 给 7/30 天，GRAIN_LEVELS.last7=[d1]、last30=[w1,mo]，windowLength 7/30，defaultAnchor 明天零点；windowBounds 对滚动窗口**特判**（恒定结束于明天零点、不受 anchor 影响），
angeLabelOf 也特判；ucketLabel 里 last7 按天显示星期。因为滚动窗口不翻页，AllView/DetailView 的 onPan/onZoom/onReset 在 
olling 时传 undefined（ChartCard 自动不渲染对应按钮）。今日页新增 TodayTrend（内部复用 ChartCard），两列网格 .gt-trend-row：左 last7/d1，右 last30/w1（可切月）。验证：新增「last7 跨 7 天 / 7 个日桶 / last30 五个周桶 / 标签含日期 / 今日页两张趋势卡」断言；五套全绿。**纯前端，刷新即可。**

- **2026-11-14 · 0.9.0 曲线改成堆叠色带**：用户要「曲线里也要有柱状图那种分块，颜色同一套逻辑」。做法：按 order（和柱状完全相同的切片顺序）累加每个切片的上下边界，andPath(lower, upper) = 上边界平滑路径 + 反向的下边界平滑路径 + Z，每个 band 用 sliceColor(id) 填充、opacity .82；顶部再画一条 1.2 px 总时长线（原来 1.7）。只有一个切片时仍走原来的渐变面积分支。点更小（3 / 1.7 px）。验证：
ender-check 新增「曲线 band 数 == 可见切片数 + 只有一条总时长线 + 线宽 ≤1.3」；五套全绿。**纯前端，刷新即可。**

- **2026-11-14 · 0.8.0 曲线图重做（精致度）**：新增三个纯函数 smoothPath（Fritsch–Carlson 单调三次，保证不过冲）、arTopPath（顶部圆角柱，半径 2.5，堆叠只圆最上一段）、chartColor（存储色提亮 14%，不写回配置）。曲线：渐变面积（24%→0）+ 双层描边（4px@16% 底 + 1.7px 亮线）+ 点数 ≤40 才画点（外圈光晕）+ 悬停竖直参考线。交互改成一块透明命中区统一处理 hover/click（indexAt() 用 viewBox 换算），柱子/圆点不再各自绑事件，零值柱子直接不画。验证：
ender-check 的柱状断言改成「path 数组 + 闭合路径」，新增平滑/圆角/取色断言；五套全绿（注意：**
pm test 的退出码要真检查**，这次差点被 Select-Object -First N 吞掉失败）。**纯前端，刷新即可。**

- **2026-11-14 · 0.7.1 悬停卡片换行顺序**：用户截图显示长游戏名把「1时16分」挤成两行。改 CSS：.gt-tip-dur 加 white-space:nowrap;flex:0 0 auto，.gt-tip-name 改成最多两行（-webkit-line-clamp:2）+ 断词，行内 lign-items:flex-start 让色块/时间贴第一行，卡片 max-width 220→248。纯 CSS。

- **2026-11-14 · 0.7.0 图表悬停改成「整柱明细卡」**：用户要的是「悬停在柱子上看总时长 + 每个色块各自的时长」，原来三段 hover（堆叠段、无切片柱、曲线点）各自只报**当前那一段**。改法：抽出纯函数 `tipSegments(parts)`（过滤 0 秒、按秒数降序、最多 8 行、其余折成一行），`Chart` 里统一用 `tipFor(point, x, y)` 生成 `{label,total,rows}`；渲染从「一行药丸」换成卡片：`gt-tip-head`（总时长 + 标签）+ `gt-tip-row`（色块 / 名称 / 时长）。曲线点的 hover 也走同一张卡。验证：`render-check` 新增 `tipSegments` 三条断言（丢 0 秒、降序、超过 8 项折叠并合计）+ 五套全绿。**纯前端，刷新即可。**

- **2026-11-14 · 0.6.0「添加平台」这一行重排**：用户截图指出名称框撑满整行、地址框只剩一条缝、按钮被挤成两行。根因：名称框是裸 `.gt-input`（CSS 里 `width:100%`），又没有 flex 尺寸约束，于是在 flex 行里把宽度吃光。改法：新增行容器 `.gt-platform-new`（flex 行，gap 8），名称框 `flex:0 0 128px`，地址列 `flex:1 1 auto;min-width:0`，三个控件统一 `height:32px`；按钮从 `.gt-link` 换成 `.gt-btn .gt-platform-add`（实心、`white-space:nowrap`、`flex:0 0 auto`、带 hover）。平台说明补「可以直接拖 exe / 快捷方式到地址框」。**纯前端，刷新页面即可。**

- **2026-11-14 · 0.5.0 背景裁剪预设比例 + 新的「铺满」规则（批 B）**：① `Cropper` 新增可选 `ratios`，背景类图片给预设（主界面/游戏：原图、16:9、8:3、4:3；标题：原图、6:1、4:1、3:1），**图标仍固定 1:1**（不传 ratios 就没有比例条）；切换比例会重新贴合图片并把缩放归 1。② 「铺满」不再用 CSS `cover`：新函数 `backgroundWidth(原图宽, 窗口宽) = max(原图宽, 窗口宽)`——窗口比图宽就放大，缩到原图尺寸就停住（只裁切不压缩）。`Page` 用 `ResizeObserver` 量 `.gt-shell` 宽、用 `new Image()` 读 `naturalWidth`，把结果写进 `background-size: <px> auto`；`.gt-bg` 和 `.gt-header-bg` 都走这套。③ 平铺仍然是 `auto + repeat`（原始像素）。验证：`render-check` 新增 `backgroundWidth` 五条断言 + 五套全绿；**只改客户端，刷新页面即可**（版本号要重启 DSH 才更新）。

- **2026-11-14 · 0.4.2 背景模型重做 + 文案整理（批 A）**：用户发现 DSH 自定义主题会透过插件和背景图**叠在一起**。根因是面板一直半透明（`.gt-shell` 没有底色、`.gt-bg` 透明度写死 16%、再加一层蒙版），而且界面上那个「图片透明度」**从来没接线**。改成：`settings.baseColor`（默认 `#0b0b0c`，不透明纯色打底）+ 图片叠在上面 + `imageOpacity`（0–100%）真的可调；删掉 `backgroundMask` / `backgroundMaskOpacity` / `backgroundOpacity`（后者原本兼职控制卡片透明度，现在 `--gt-surface-alpha` 固定 0.18）；每游戏只保留 `imageOpacity`（底色跟全局）。设置页新增「底色」色块，蒙版两个旋钮移除。顺带：界面密度「紧凑」差值加大（root padding 14→8、行 9→4、字号 23→18、卡片 12→8，另加标题/标签/列表行），并把 `settings.density.hint` 接到界面上；设置/游戏设置的小字整体重写（删掉「演示状态」「接入采集后」「导入导出」这类过时说法，数据行改成直接给路径）。验证：五套全绿；`host-check` 的迁移断言从 `backgroundMask` 改成 `imageOpacity`。**改了宿主白名单，要重启 DSH。** 0.5.0 再做第 5 条（裁剪预设比例 + 新的「铺满」规则）。

- **2026-11-14 · 0.4.1 修「选择文件」卡死**：用户反馈设置/游戏设置里的选择按钮「非常慢、很卡」。根因是**取消后自动回退**：`PathField` 的 `acceptPicked(null)` 会调 `pickExecutable()`（选目录 → 取目录里第一个 exe），也就是说按 Esc/取消会再弹一个窗口，连点就叠出好几个，看起来像死机。改法：① 取消即结束（删掉回退）；② `picking` 状态 + 按钮 `disabled` + 提示「正在打开选择窗口…」，点击立即反馈；③ 宿主 `PICK_SCRIPT` 建一个 `Show()` 过的小 owner 窗口再 `ShowDialog($owner)`（以前 owner 从不 Show，对话框可能落在 DSH 窗口后面 → 用户以为没反应）；④ 选择框超时 60s → 300s（`runScript` 新增可选 timeout）；⑤ 路径框拆成两个按钮：文件夹=选择、↗=打开所在位置（以前按钮会按「有没有值」偷偷换功能）；⑥ 粘贴 `.lnk`/`.url` 在失焦时也解析（以前只有拖拽解析）。验证：`render-check` 新增 `normalizePath` 引号剥离断言 + 五套全绿；PowerShell 脚本用 `Parser::ParseFile` 过了语法检查。**改了宿主，要重启 DSH。**

- **2026-11-14 · 0.4.0 线（批 2/2）：删空开关、藏起宿主专用入口、把网页版文档收进一个档案**：① 设置里的「仅前台计时」整块删掉（[client.js](client.js) 里的 Field 换成一行说明），两条 `settings.foreground*` 文案键一并删除，宿主 `config.js` 的白名单行与 `constants.js` 默认值改成注释/删除——**字段留着也不会被读取**；② 「开机自启」的设置块**整块注释**（`/* 冻结（0.4.0）… */`），恢复只需取消注释，`settings.autostart*` 文案键和宿主接口 `/api/game-time/autostart` 全部保留；③ 网页版相关的所有文档（原 README 一章 + 构建/托盘/自启/MOTW 的坑 + 恢复步骤）收进 **`docs/WEB-FROZEN.md`**，README 只留一行「`standalone/` 是暂停维护的网页版遗留，可以忽略」；④ 页脚从品牌标语改成产品署名 `游戏时长 v0.4.0 · super0plant`（英文 `Game Time v0.4.0 · super0plant`），用户看不懂「local-first tools for DSH」那种定位语。验证：五套测试全绿 + 重新打包。

- **2026-11-14 · 0.4.0 线开张（批 1/2）**：① 打了回退锚点 `v0.3.2-final`（本地 + 远端都有），0.4.0 做坏时 `git reset --hard v0.3.2-final` 就回到现在的样子；② 版本号 → **0.4.0**（删设置项属于行为变化，按 semver 走 minor）；③ **独立网页版暂停维护**：代码留在 `standalone/`，README 那一节加了「暂停维护」说明，不再宣传、不再测试（`npm test` 里仍会跑 `standalone-check`，它只在包内缺 `standalone/` 时跳过——**下个版本考虑把它摘出默认测试**）；④ 设置页页脚从「作者：super0plant」改成开发者署名式 `super0plant — local-first tools for DSH · v0.4.0`，版本号由 `client.js` 里的 `VERSION` 常量提供（以后发版只改这一处 + `package.json`）。批 2 是删掉 `foregroundOnly` 空开关。

- **2026-11-14 · 品牌定名 super0plant（发布准备）**：包名仍是 `dsh-plugin-game-time`（npm 上查过未占用；社区惯例比 scope 更好搜）。`package.json` 的 `author` / `repository` / `homepage` / `bugs` 从 `OWNER` 占位换成 `super0plant`，`keywords` 补 `deepseek-harness` / `playtime-tracker` / `game-tracker` / `local-first`；MIT 版权行、README、两个 locale 的 `meta.description`、设置页署名（`settings.credit`）统一成 `super0plant（茄子超人）`。`publish/` 的收录条目按规范改名成 `data-plugins-super0plant__dsh-plugin-game-time.yml`，**分类从 `usage` 改成 `fun`**（`usage` 在 awesome 里是「用量与计费」，游戏时长属于「🎮 娱乐」）。验证：五套测试全绿 + 重新打包 0.3.2。纯文案/元数据，**不用重启 DSH**。
  - 2026-11-14 补充：GitHub 账号确认是**主号改名**（id 90775956、注册于 2021-09-15），不是新号，ToS 上没问题。本地 10 个 commit 的作者从 `yjs <1060143199@qq.com>` 统一重写成 `super0plant <90775956+super0plant@users.noreply.github.com>`（用 `git commit-tree` 重建，因为沙箱里 `rebase --exec` / `filter-branch` 要启 sh，会被管道限制打断）；仓库还没 remote，改写后 hash 全变但树一致、工作区干净。新增 `assets/icon-460.png`（GitHub 头像用）和 `assets/icon-180.png`（市场卡片用）；npm 包 `files` 去掉 `icon.png`（555 KB，运行时不引用，包体积 840 KB → 约 285 KB），`icon.ico` 必须留（独立版 launcher 和 index.html 都读它）。

- **2026-11-14 · 「今日」跟着系统时钟翻页（0.3.2，本次）**：用户报「13 号开着一路玩到 14 号，今日不刷新」。根因在客户端：`NOW` 是**模块加载那一刻**的 `const Date`，`defaultAnchor` / `TodayView` / `totalsFor(...,'day')` 全用它，所以「今天」被钉在打开面板的那一天，30 秒轮询只更新数据、不更新日历；桌面外壳本来就常驻托盘，最容易中招。宿主没问题——`splitByDay` 在零点把会话切成两段（真实数据里能看到 `end=start=00:00:00` 的两条）。改法：`NOW` 改成可变（`setNow()` 原地 `setTime`，所有闭包同时看到），`applyLiveState` 用 `payload.now` 推进它（轮询即翻页），再加一个 15 秒跨天看门狗（比对 `dayKey`，只有真的跨天才 `bumpPage()` + 重拉），所以停在设置页、睡眠唤醒、错过的零点定时器都能补上；窗口重新可见时（`visibilitychange`）也立刻补一次时钟 + 数据，免得后台节流后回来还看着昨天。`AllView`/`DetailView` 的 `anchor` 状态改成 `null = 跟随当前周期`（往回拖才固定，`↺` 回跟随），零点图表自动右移。顺带修头部「监控中 · 时长 · 时长」印两遍。验证：`render-check` 新增「midnight rollover」（13 号 23:30 → 14 号 01:00 → 15 号 00:30 三段，跨零会话各算各的天 + 今日卡片文案 + 看门狗返回值），五套全绿；另外用真实 `sessions.json` 跑了遍：13 号 23:59 今日 3时17分 → 14 号今日 1时39分。**只改客户端，刷新页面即可**（不是重启 DSH）。

- **2026-11-11 · 归属改按「启动入口」顺序（0.3.1）**：原来单安装游戏按「当前在线的启动器 + 全局 `rank`」归属，Steam 常驻就把绝区零记成 Steam，Playnite 常驻又把地平线 5 记成 Playnite。现在：`entries` 有内容就按数组顺序取**第一个在运行的启动器**，没有/都没跑就用**安装位置选的平台**；`platform.rank` 只影响显示顺序，和识别彻底无关。设置 → 游戏设置 → 启动入口前面加了拖动按钮（`⠿`，和平台列表同一个），顺序就是优先级。中间试过 CIM 父进程链（准但重、WMI 可能被拦），已按用户要求回退，**别再改回去**（见 §6）。验证：`host-check` 归属 9 条（顺序、跳过没运行、rank 无关、删平台、多安装）+ `render-check`；五套全跑。宿主 + 前端都改了，**要重启 DSH**。

- **0.3.0 发版（本次）**：把「保留全部历史 + 懒加载」和「首包幽灵修复」正式发出去。`package.json` 0.2.3 → 0.3.0，CHANGELOG 的「未发布」转成 `## 0.3.0 — 2026-11-10`，`dist/` 重新打包出 `dsh-plugin-game-time-0.3.0.zip` 与 `game-time-web-0.3.0.zip`。为什么是 minor 而不是 patch：这批改动新增了 `GET /api/game-time/sessions` 接口，并且改了「31 天后不再删数据」这个用户能感知的行为。验证：五套测试全绿后打包。（宿主有改动，装新版要重启 DSH。）

- **首包幽灵修复（本次）**：`applyLiveState` 现在只在 `LIVE` 已为 true 时才保留旧页——第一个 live 包直接从 demo 快照切到宿主数据，不会把 demo 里 366–399 天前的会话当成「懒加载旧页」；同时 `older` 和 `ensureHistory` 的响应都按当前 `GAMES` 过滤，删掉游戏的旧页不会再残留成幽灵切片。验证：`render-check` 的「first live payload」「lazy pages」两条 + 四套全跑。**宿主没改，只需刷新页面。**

- **保留全部 + 懒加载（本次，替代上一版日汇总）**：彻底删掉 31 天删除/日汇总，`sessions.json` 保存全部会话；`/state` 默认只回最近 `settings.historyDays`（默认 365 天，设置页「监控 → 历史加载窗口」可选 30–1825 天）的会话，另带 `historyFrom / firstStart / totals / lastPlayed`。`totalsFor(...,'all')` 用宿主算好的全量总数（含当前进行中会话），`lastPlayedAt` 用 `lastPlayed`，`clampAnchor` 用 `firstStart` 允许往回翻；`AllView`/`DetailView` 的 `useEffect` 在窗口越过已加载边界时调 `GET /api/game-time/sessions?from=&to=` 补一页，`ensureHistory()` 按 id 去重、`HISTORY_FROM` 只向前移，30 秒刷新会保留已加载的旧页。**日汇总方案已回退**：它 31 天后只有天级精度、双文件要保一致，且边界日曾丢过 30 分钟；实测一年只省 ~2×。验证：`host-check`（旧会话保留、/state 窗口、全量总计、切片接口、historyDays 钳制）+ `render-check`（窗口、总计、lastPlayed、懒加载补页、刷新保留）+ 四套全跑；宿主改了，**要重启 DSH**。

- **0.2.3 收尾状态（今天到此为止）**：网页版已有桌面外壳（`launcher.ps1` + `start.cmd` + `stop.cmd`），托盘实测能常驻（`Application.Run($form)` + 隐藏宿主窗体），`icon.ico` 16/20/24/32/40/48 换成简化版（紫圆角块 + 白手柄剪影）、64+ 用原插画，构建脚本校验 `launcher.ps1` 必须带 UTF-8 BOM。**卡在分发提示**：双击 `start.cmd` 弹「打开文件 - 安全警告（无法验证发布者 / Windows 命令脚本）」——截图确认是 **Mark-of-the-Web**。结论：属性里勾「解除锁定」只对当次解压有效；微信/QQ 传 zip 通常不带标记，浏览器/邮箱会带；7-Zip 解压不复制 ADS。备选「不要 .cmd」：本地新建快捷方式指向 `powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "<绝对路径>\launcher.ps1"`（快捷方式本身无标记）。
  - **未做（下次第一件）**：把自启改成走 launcher。现在注册表写的是 `"node.exe" "server.mjs"`，登录会留一个黑色控制台窗口；计划在独立版 `server.mjs` 里拦截 `POST /api/game-time/autostart`、自己写 `powershell ... -File launcher.ps1 -NoWindow`，这样不用改宿主、不用重启 DSH。
  - 另一个待确认：用户说 `start.cmd` 属性里**没有**「解除锁定」复选框（与截图矛盾，可能点到了文件夹）。若确实没有，就不是 MOTW，而是杀软/智能应用控制，处理方式不同。
- **测试小坑**：`cmd /c start.cmd` 会被 cmd 解析成 START 内建命令（报「找不到文件 .cmd」），验证双击请直接运行 `.cmd` 或从 PowerShell 里 `.\start.cmd`，不要用 `cmd /c`。

- **0.2.2 托盘可靠性**：用户实测「窗口打开了但没有托盘图标」。根因是 `[Windows.Forms.Application]::Run()` 无窗体时在部分宿主会立刻返回，托盘建好就随脚本退出；改成隐藏宿主 `Form` + `Run($form)`，退出走 `$form.Close()`。启动后弹气泡「已缩到托盘」（Win11 会把新图标折叠进 `^`）。新增 `stop.cmd`（`curl -X POST /shutdown`）作为托盘找不到时的干净退出。日志改到 `%LOCALAPPDATA%\GameTime\launcher.log`——解压目录可能只读，写在旁边会静默失败。
  - 教训：**launcher 常驻 + 45917 单实例**，我自己的测试进程会和用户手测抢端口，症状会互相污染；人工复现前先 `stop.cmd` 并确认 45917 空闲。

- **0.2.1 网页版桌面外壳**：`standalone/launcher.ps1`（由 `start.cmd` 隐藏启动）负责三件事——没服务就 `Start-Process node -WindowStyle Hidden` 起采集器并等 `/state` 通；用 `msedge --app=http://127.0.0.1:45917/ --window-size=1180,840` 开无地址栏窗口，没有 Edge 才退回默认浏览器；建 `NotifyIcon` 托盘（打开面板 / 开机自启 / 退出），`Local\GameTimeTray` 互斥量保证只有一个托盘。新增 `POST /api/game-time/shutdown`（仅本机、只接受 POST），托盘退出走它 → `server.close` → `process.exit` → `finaliseSync`，**不要用 Stop-Process 强杀**（会跳过退出钩子）。`standalone-check` 增加 shutdown 断言（GET 405 / POST 后进程 0 退出）。README 增加「解除锁定」步骤。

- **独立版 S3+S4（打包拆包，版本 0.2.0）**：`scripts/build.mjs` 从**同一棵树**出两个互不覆盖的包——`dist/dsh-plugin-game-time-0.2.0.zip`（宿主+客户端+四套测试，**刻意不含 `standalone/`**）与 `dist/game-time-web-0.2.0.zip`（`client.js` + `src/` + `standalone/` + `icon.png/ico` + 单独一份 `standalone-check`），网页包的 `package.json` 由构建生成（`name: game-time-web`，没有 `dsh` 段）。`standalone-check` 在缺 `standalone/` 的包里打印 skipped 并退出 0，所以插件包解压后仍是「四套全绿 + 一跳过」。自启勾选改成读注册表实际状态（`ENV.autostart.enabled`），修掉「配置说开、注册表没写」的假显示。网页版拖拽提示按 `ENV.standalone` 换成 `.url/.lnk 可拖、exe 用文件夹按钮`。新增 `standalone/start.cmd`（双击启动，找不到 node 会给提示）。
  - 两版是**共同引用**：`client.js` + `src/host/*` 只有一份，网页版外壳只是假 ctx 调同一个 `apply()`；改一处两边同时生效，没有同步步骤。数据也共用 `%USERPROFILE%\.dsh\storages\game-time\`。
  - 验收：解压副本里 DSH 包 4 套通过、web 包 `standalone-check` 通过。

- **独立版 S1（网页版骨架）**：新增 `standalone/`：`server.mjs` 用假 ctx（`logger/effect/webServer.register`）直接复用宿主 `apply()`，固定 `127.0.0.1:45917`，端口就是单实例锁（第二个进程只开浏览器、**不 import 宿主**，避免 `finaliseSync` 覆盖 `active.json`），Ctrl+C → `server.close` → `process.exit` 走同步落盘；`index.html` + `loader.js` 提供 `window.__ModuleLoader__`、`locale.register/bind`、`slots.inject/register`（`main` 挂到 `#root`，侧栏 Glyph 忽略），React/ReactDOM 18.3.1 UMD 走 `standalone/vendor/`（MIT，无 npm）。新增 `tests/standalone-check.mjs`：假 DOM 挂载 zh/en + HTTP 契约 + 第二实例退出 0。图标换成作者提供的 1024 图（`icon.png` / `icon.ico` 七档 / `standalone/icon-256.png`），**插件列表仍用 `icon.svg`**。
  - 已修：`$home` 是 PowerShell 只读变量，复制预览数据要用别的名字（踩了一次）；代理隧道下载 vendor 时响应是 `Transfer-Encoding: chunked`，漏解码后 JS 首行是 `1641` 尺寸行 → 浏览器 `Cannot read properties of undefined (reading 'createElement')`。现在 `standalone-check` 会用 `new vm.Script()` 编译两个 UMD 文件兜底。
  - 未做：拖拽降级「浏览…」、README/打包、双采集器互斥（现在只在检测到 `DeepSeek Harness.exe` 时打警告）。

- **折叠控件视觉引导**：分组标题整行变成按钮（hover 底色、焦点环、tooltip），右侧「详细设置 · N / 收起」后面加 Lucide `chevron-down`，收起时旋转 −90°，并带上折叠项数量与 `aria-expanded`；样式在 `.gt-group-head/.gt-group-toggle/.gt-chevron`。
- **重复提示文字改红**：`.gt-warn`（`#ff6b6b`）用于「已属于 X」「N 个已存在」「仍然添加？」等警告，成功提示仍是灰字。
- **设置页折叠 + 记住页面**：设置页的「启动平台」「游戏」默认只显示胶囊行（平台保留状态点；游戏用**游戏图标**，点击进该游戏设置）和「添加」按钮，详细行收进右侧「详细设置 / 收起」。面板切走再回来仍停在原页面（`LAST_ROUTE` 放模块级；刷新 / 重启才回起始页）。游戏胶囊样式全部走类名（`.gt-gamepills/.gt-gamepill/.gt-gamepill-icon/.gt-gamepill-name/.gt-gamepill-dup`），颜色来自 `--gt-pill` 自定义属性，方便微调。
- **开机自启（独立版专用）**：设置页新增「启动」分组。开关只在独立界面可操作；DSH 内恒为灰色，并在下方说明「为什么不可选 / 为什么建议开 / 关闭只移除本程序的登录项」。宿主新增 `GET/POST /api/game-time/autostart`；**注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 是唯一真源**，`settings.autostart` 只记录用户意图（`false` 时下次启动不再补写）。独立模式由 `GAME_TIME_STANDALONE=1` 判定，入口路径取 `GAME_TIME_STANDALONE_ENTRY`，默认 `<插件>/standalone/server.mjs`。
- **设置页直接拖入游戏**：把 exe / `.lnk` / `.url` 拖到设置页的「游戏」列表即可**新建游戏**（自动取名、平台、图标）；exe 已被某个游戏计时时不新建，提示「已经在『X』里计时」。查重结果现在有缓存（`duplicateMap()` 按 `configVersion + GAMES.length`），只在配置变化后重算一次，首次渲染（启动）就会算。
- **重复游戏标记 + 游戏设置删除**：同一 exe 路径只由**配置顺序里第一个**游戏计时，后面的游戏在标题后带红色「重复」标签（今日 / 全部 / 设置列表 / 详情 / 游戏设置都有），悬停提示「已在『X』里计时，这里不会再计时」；判定在 `duplicateMap()`。游戏设置页最后新增「删除这个游戏」，确认后删掉并**跳回时长列表**（从「全部」进来的回「全部」，其余回「今日」）。
- **路径输入统一可拖拽 + 重复路径提示**：`PathField` 现在是唯一带拖拽的路径控件（安装位置、启动入口、平台路径、新增平台），拖 exe/快捷方式即可；拖到「安装位置」卡片仍是新增一条，拖到某一行是填这一行。若 exe 已属于别的游戏，提示「已经在 X 里计时」并给「仍然添加」覆盖（同一进程只能归一个游戏，第二条会永远 0）。
- **自动归档**：设置里可开「N 天 / N 个月不玩自动归档」，默认关闭；按最后游玩时间**派生**（不写进 config），所以玩一次后 `lastPlayedAt` 前移、下次刷新自动回到列表。游戏设置里勾「不放入自动归档」可让单个游戏豁免。从未玩过的游戏不参与。
- **拖拽添加安装位置**：把 exe / `.lnk` / `.url` 拖到「安装位置」卡片即可新增，自动解析真实 exe、自动填游戏名（仅当名字还是「新游戏」）、自动取图标；同路径不重复添加。`.url` 里的 `steam://rungameid/<id>` 会经 `libraryfolders.vdf` + `appmanifest_<id>.acf` 找到安装目录再挑 exe。宿主新增 `GET /api/game-time/resolve`。顺带修掉 PowerShell 输出编码 bug（中文路径变成 `◆◆◆◆`）。
- **归档**：`game.archived` 只是把这一行折叠进「全部游戏」表和设置页游戏列表的「已归档游戏」条；**统计、图表、总计、今日页照常计入**，会话一条不删，取消勾选即回来。另有「归档已卸载 (N)」一键收起。
- **统计归组**：`game.group` 可空；非空时「平台分布」用这个名字代替平台，多个游戏同组自动并成一片；组名命中平台名或平台 id（如 `Steam`）直接并进该平台，不会出现两个同名切片。颜色自动分配（避开平台色）+ 可改。
- **设置页骨架**：`gt-fixed-head` 让设置 / 游戏设置的返回栏固定，只有内容区滚动；设置页游戏列表同样按归档折叠。
- **图表重做**（细节见 §7）：柱状按平台 / 游戏分色堆叠、Y 轴 4 档阶梯 + 极淡辅助线、平均虚线带贴轴刻度、hover 气泡、X 标注按文字宽度抽稀、标题与 X 轴左缘标注当前刻度单位、`↺` 重置。
- **时间窗与交互**：今日 = `00:00–23:00` 的 24 根小时柱；拖动一格 = 一根柱子（步长由**当前刻度**决定，不按视图写死）；滚轮一格 = 一级刻度（今日 1时/30分/10分、本月 天/周、全部 月/周/天，本周不缩放）；窗口可滚动，边界钳制到数据范围和周期末尾。
- **全部页分析区**：平台分布（含游戏分布条）、时长趋势（按游戏分色）、游玩时段（默认收起）三张卡，由 `ALL_SECTIONS` 注册表驱动，增删 / 换序只改那个数组。
- **宿主拆分**：`index.js` 从 1288 行变成 11 行入口，实现移到 `src/host/*`（7 个模块），行为无变化。
- **归属与落盘**：开局算一次归属、tick 只刷新 `lastSeen`（修 Playnite → 米哈游跳变）；30 秒 `active.json` 心跳 + 启动恢复；关局 1.5 秒防抖写、退出同步写。
- **按钮图标换套**：设置 / 刷新 / 返回改用 Lucide 内联 SVG（无新依赖），统一 21×21 方框、14px 图形、默认 `opacity .45`。

---

## 2. 运行环境与部署

| 项 | 值 |
|---|---|
| 插件包名 | `dsh-plugin-game-time` |
| 插件目录 | `<解压目录>\plugins\game-time`（DSH 里填这个路径） |
| 面板 id | `game-time` |
| 注册的 slot | `main`（主面板）+ `sidebar.panellist`（侧栏图标） |
| 安装方式 | DSH 设置 → 插件 → 添加插件 → 填本地目录路径 |

### 改动的生效规则（重要）

| 改了什么 | 怎么生效 |
|---|---|
| `index.js`（宿主） | **必须重启 DSH**（模块启动时 import 一次） |
| `client.js`（界面） | **刷新页面** 即可（`Ctrl+F5`） |
| 配置数据（游戏/平台/背景） | 立即生效，走 HTTP 接口 |
| 新增游戏 / 设置字段（如 `group`、`archived`） | 先加进 `src/host/config.js` 的白名单，**再重启**；否则保存时被洗掉 |

---

## 3. 文件地图

```
plugins/game-time/
  package.json        插件清单（dsh.bundle.patch + dsh.client）
  cordis.patch.yml    插入 ID 为 game-time 的插件行
  index.js            宿主入口（11 行，只 re-export src/host/main.js）
  src/host/
    main.js           采集循环、快照（含 playedDays 聚合）、路由装配（~770 行）
    constants.js      路径、默认配置、懒加载窗口、心跳过期
    values.js         取值/校验、JSON 与资产读写、路径工具
    config.js         v1/v2→v3 迁移、sanitizeConfig（白名单）、预置
    sessions.js       跨零点拆分 + 自然日索引 dayRangeOf（本地时区，整数天）
    processes.js      tasklist 扫描、路径查询、启动器归属（启动入口顺序 + 是否在运行）
    scripts.js        PowerShell：exe 图标、选文件、目录浏览
  client.js           前端：全部 UI（约 7k 行，未拆；内部分层见 §7）
  icon.png / icon.ico 作者提供的应用图标（1024 PNG；.ico 含 16–256 七档）；插件列表仍读 icon.svg
  locale/zh.json      插件管理器显示的名称/描述
  locale/en.json
  icon.svg            插件图标
  tests/render-check.mjs   渲染测试（Node + 假 React，约 60 条渲染路径）
  tests/host-check.mjs     宿主测试（路由、迁移、归属、一次完整 tick、playedDays）
  tests/exit-check.mjs     退出落盘（防抖 + process.exit 同步写）
  tests/restore-check.mjs  崩溃重启恢复（gone / running / dupe）
```

> 独立网页版在 0.14.0 整体删除（`standalone/`、`launcher.ps1`、`tests/standalone-check.mjs`、`docs/WEB-FROZEN.md` 都没了）；§1 里 0.14.0 之前的条目提到它们属于历史记录。

宿主依赖方向是单向的：`constants ← values ← config ← main`，`processes/scripts/sessions` 互不依赖。

---

## 4. 数据模型（config v3）

存储位置：`%USERPROFILE%\.dsh\storages\game-time\`

| 文件 | 内容 |
|---|---|
| `config.json` | 平台 + 游戏 + 设置 |
| `sessions.json` | 全部会话（**永久保留，不自动删除**；客户端按 `historyDays` 窗口懒加载） |
| `active.json` | 正在进行的会话心跳（崩溃/强杀后重启用来续上），干净退出会删除 |
| `presets.json` | 预置写入标记（`{version:1}`），防止删掉的预置游戏复活 |
| `assets/` | 背景图文件（sha1 命名），配置里只存 URL |

### platform

```js
{
  id, name, short, color,      // 显示用
  path,                        // 默认启动器 exe（可空）
  processes: [],               // 附加进程名（检测"在线"用，逗号分隔录入）
  icon,                        // data URL，可空
  rank                         // 排序权重，越小越优先
}
```

### game

```js
{
  id, name, glyph, color,
  group,                       // 统计归组名（可空）；空 = 按平台统计，非空 = 平台分布里用这个名字代替平台；填平台名或平台 id（如 Steam）直接并进该平台
  archived,                    // true = 归档：只在「全部游戏」表和设置列表里折叠，统计/图表/总计照常计入，会话一条不删
  noAutoArchive,               // true = 不参与「N 天不玩自动归档」
  icon,                        // data URL
  background, backgroundFit,   // 'cover' | 'tile'
  backgroundOpacity,           // 区块透明度（0–1），不是图片透明度
  backgroundMask, backgroundMaskOpacity,
  headerBackground,            // 该游戏的标题背景
  platforms: [],               // 由 installs + entries 推导，宿主会补
  installs: [{ id, platformId, path }],   // 游戏本体 exe，计时依据
  entries:  [{ id, platformId, name, path, args }]  // 启动入口；数组顺序 = 启动器优先级
}
```

### settings

```js
{
  intervalSec, autostart, density,               // autostart 只服务已冻结的网页版（界面 0.4.0 起注释掉）
  // foregroundOnly 已废弃（0.4.0）：从未实现过逻辑，设置界面已移除，宿主白名单里的那行也注释了
  historyDays,                                   // 懒加载窗口，默认 365，范围 30–1825
  statsDays,                                     // 列表提示（对比平均/平均每天/已玩）只显示给最近 N 天玩过的游戏，默认 7，范围 1–3650
  baseColor,                                   // 面板最底层的不透明纯色（替代原来的蒙版）
  background, backgroundFit, imageOpacity,      // 背景图 + 铺法 + 图片透明度（0–1）
  headerBackground, headerHeight, headerFade,
  surfaceColor,                                  // 卡片底色，默认 #000000
  groupColors,                                   // 归组名 → 颜色；没配就按组名排序取一个平台没占用的调色板色
  autoArchive                                    // { enabled, value, unit: 'day'|'month' }；1 个月按 30 天算
}
```

### session

```js
{ id, gameId, platformId, source, start, end }
// source：启动器名（如 "Playnite"）或 "自启动"
// start/end：epoch ms；跨零点会被拆成两条
```

---

## 5. HTTP 接口

全部挂在 DSH web server 上，基址是 `http://127.0.0.1:<当前端口>`（端口每次启动都变）。

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/game-time/state` | 全量快照（`sessions` 只是 `historyDays` 窗口；另带 `historyFrom`、`firstStart`、`totals`、`lastPlayed`、`playedDays`、`playedDaysTotal`、`active`、`env`、`lastError`） |
| GET | `/api/game-time/sessions?from=&to=` | 懒加载：返回与 `[from, to)` 重叠的会话（epoch ms）；客户端补旧页用 |
| GET/POST | `/api/game-time/autostart` | 查询 / 设置开机自启；不可写时（DSH、非 Windows、入口缺失）GET 返回 `supported:false`，POST 返回 409 |
| POST | `/api/game-time/shutdown` | **仅独立版**：托盘「退出」用，`server.close` → `process.exit` 同步落盘；GET 405 |
| POST | `/api/game-time/config` | 整份配置写入（带校验与迁移） |
| POST | `/api/game-time/asset` | 上传图片（body `{dataUrl}`），返回 `{url}` |
| GET | `/api/game-time/asset/<name>` | 读取图片 |
| GET | `/api/game-time/browse?dir=` | 列出目录下的 exe（深度 2，按体积排序） |
| GET | `/api/game-time/icon?path=` | 提取 exe 图标（原图标最大帧尺寸 16–256，PNG data URL，保留透明） |
| GET | `/api/game-time/pick-file` | 弹原生文件对话框（exe / lnk / url） |
| GET | `/api/game-time/resolve?path=` 或 `?url=` | 把 exe / `.lnk` / `.url` / `steam://rungameid/<id>` 解析成真实 exe，返回 `{ok, path, name, kind, platformId, warning}` |
| GET | `/api/game-time/reveal?path=` | 资源管理器定位 |
| GET | `/api/game-time/debug/processes` | **调试用**：采集器当前看到的进程名列表 |

排查口诀：**先看 `lastError`，再看 `debug/processes`，最后看 `config.json`。**

---

## 6. 宿主机制

### 采集循环（tick）

- 每 `intervalSec` 秒（默认 10）执行一次
- `tasklist /FO CSV` 拿全部进程名（→ `state.processes`，Map<name, pid[]>）
- `claimsByProcess()`：按 installs 里的 exe 文件名建立"进程名 → 游戏"映射
- 同名多游戏（如英雄联盟国服/日服）→ `queryProcessPath(pid)` 查一次完整路径，按目录区分
- 新出现的游戏 → `attributePlatform()` 决定平台，开一条 active 记录
- 进程消失 → 关闭会话，`splitByDay()` 按天切分后写入
- 单次会话短于 30 秒不记录；会话永久保留，不再按 31 天清理

### 落盘策略（2026-11 修的，重要）

宿主的退出链路是 `shutdown()` → 立刻 `process.exit()`，任何没 await 的异步写都会丢。所以：

1. **关一局 → 1.5 秒防抖写** `sessions.json`（`scheduleFlush`）；
2. **退出时同步写**：`process.on('exit')` + `writeFileSync` + `rename`（`flushSync`），覆盖关机/托盘退出/`app.quit()`；
3. **进行中的会话**每 30 秒写一次 `active.json` 心跳；启动时读回来——进程还在就接着计时，不在了就按 `lastSeen` 补一条（`restoreActive`，按 `gameId@start` 去重）；
4. 干净退出（`finaliseSync`）会先把还在跑的会话关掉、同步写 `sessions.json`，再删掉 `active.json`。

改这块的时候**必须**让 `tests/exit-check.mjs` 和 `tests/restore-check.mjs` 都过。

### 归属规则（2026-11-11 定稿：按「启动入口」顺序，平台 rank 不再参与）

1. **多安装位置**（如英雄联盟）→ 命中哪个安装就归哪个平台，`source = null`。路径是唯一证据，比入口列表准。
2. **单安装位置**（绝区零、地平线）：
   - `entries` 有内容 → 按数组顺序找**第一个「启动器在运行」的入口**，归它的平台，`source = 平台名`；
   - `entries` 为空，或里面的启动器都没在跑 → 归**安装位置里选的那个平台**；它的启动器在跑则 `source = 平台名`，否则 `source = "自启动"`。
3. 「启动器在运行」= 平台 `path` 的 exe 名或 `processes` 里的别名出现在 tasklist 里（排除游戏自己的 exe）。
4. **`platform.rank` 只决定设置页里平台的显示顺序，和归属完全无关**；改平台排序不会改变识别结果。
5. 入口的拖动顺序就是优先级（设置 → 游戏设置 → 启动入口），**下一局**生效；进行中的会话不改写。
6. 试过但没采用的方案：按全局「在线启动器 + rank」归属（0.3.0，会被常驻的 Steam/Playnite 抢走）、按 CIM 父进程链归属（0.3.1 内部版本，准但重、依赖 WMI、用户觉得太复杂）。**别再改回去**。

### 迁移与预置

- `migrate()` 把 v1/v2 转成 v3；会把 `lol-cn` + `lol-jp` 合并成一个「英雄联盟」
- 迁移时**保留游戏对象的所有字段**（曾经因为丢字段把背景清空过）
- `applyPresets()` 只在 `presets.json` 缺失/版本低时执行一次，补默认平台路径和预置游戏

### 素材

- 背景图上传后存 `assets/<sha1>.<ext>`，配置只存 `/api/game-time/asset/<name>`
- 图标存 data URL（小，96×96 PNG，保留透明）
- 图标提取：PowerShell 解析 exe/ico 图标资源，取最大帧尺寸（16–256）向 shell 取图，再用 `GetDIBits` 保留 alpha；Electron `getFileIcon`（最大 32px）只作兜底。改这块要重启 DSH。
- **PowerShell 返回字符串一律走 JSON 文件**（`runJsonScript`）：`-File` 的 stdout 用的是控制台代码页（中文系统 GBK），Node 按 UTF-8 解码会把中文路径变成 `◆◆◆◆`。图标脚本返回 base64（纯 ASCII）所以不受影响。

---

## 7. 前端结构

### 入口

`client.js` 用 `window.__ModuleLoader__.load({ id, factory })` 注册，`factory` 返回 `{ inject, apply }`。

### 路由（组件内状态，不是 URL）

```
today → all → game（详情）→ settings（总设置）→ game-settings（游戏设置）
```

`Page` 持有 `route`，各视图通过回调切换。

### 实时数据

- `loadLiveState(force)`：拉 `/state` 并**原地替换** `GAMES` / `PLATFORMS` / `SESSIONS`
- 每 30 秒自动刷新一次；在设置页时跳过（避免冲掉正在编辑的内容），除非手动刷新
- **「现在」是活的（0.3.2）**：`NOW` 是一个可变的 `Date`，`applyLiveState` 用 `payload.now` 推进它，另有一个 15 秒的跨天看门狗（比对 `dayKey(NOW)` 与真实日期）负责翻页。**不要再写 `const NOW = new Date()` 之外的静态时间**——今日 / 本周 / 最近游玩 / 图表窗口全从 `NOW` 派生，钉死它就会出现「开一整晚还是昨天」
- 图表窗口的 `anchor` 用 `null` 表示「跟随当前周期」，往回拖才落成固定日期；`↺` 把它设回 `null`
- 改动 → `touch()` → `saveConfig()`（500ms 防抖）→ POST 整份配置
- **保存必须带 `version: 3`**（曾经漏了，导致每次保存都被当旧格式迁移、背景字段被清空）

### 关键组件

| 组件 | 作用 |
|---|---|
| `Tile` | 游戏图标（有自定义图则 `<img>`，否则色块 + 首字） |
| `StatusDot` | 状态圆点：灰=离线、绿=计时中、红=路径错误、黄=挂起 |
| `PlatformPill` | 平台胶囊（全名 + 平台色） |
| `Dropdown` / `PlatformSelect` | 唯一的下拉实现（原生 select 太丑） |
| `ImageField` + `Cropper` | 图片选择 + 拖拽/缩放裁剪，固定比例导出 |
| `BackgroundControls` | 区块透明度、蒙版颜色、蒙版浓度 |
| `Confirm` | 删除确认弹窗 |
| `Chart` | 纯绘图：柱/线、堆叠分段、Y 轴、平均线、hover 气泡、拖动/滚轮 |
| `ChartCard` | 卡片壳 + 柱/线切换 + 单位标题 + `↺` 重置 |
| `ShareBar` / `ShareCard` | 占比条 + 图例 / 卡片壳 |
| `SessionsCard` | 可折叠的启停记录列表 |

### 图表与数据层（改图之前先读这一节）

**数据层只有一个序列构建器**，不要另写统计：

```
seriesFor(gameId, range, anchor, slice, grain)
  ├─ seriesWindows(range, anchor, grain)      窗口（今日 24 根、本周 7 根、本月 N 根、全部 12 根）
  ├─ sessionsInRange(...)                    取窗口内的会话
  └─ seriesPartsIn(...)                     按 slice 切成 {id, name, color, seconds}
```

- `slice` 只有两个：`BY_PLATFORM`（平台，`game.group` 非空时用组名/平台名）和 `BY_GAME`（游戏）。新增维度就再加一个 `{id, of, meta}`，不要改 `Chart`。
- `platformBreakdown / totalsByRange / seriesFor` 全部复用 `seriesPartsIn`，所以「占比条、堆叠、图例」天然一致。
- **小于 5% 的切片并入灰色「其他」**：`MIN_SHARE` + `keepSliceIds()`，灰色固定 `#9199a3`；平台条、游戏条、趋势图三处同一规则，改阈值只改一个常量。
- 时间粒度 `GRAIN_LEVELS`：今日 `[1时, 30分, 10分]`、本周 `[1天]`、本月 `[周, 天]`、全部 `[月, 周, 天]`；`base` 是打开时的默认级。

| 视图 | 打开时的窗口 | 拖动一格 | 滚轮级别 |
|---|---|---|---|
| 今日 | `00:00–23:00`（最近 24 小时） | 1 小时 | 1时 / 30分 / 10分 |
| 本周 | 周一–周日（最近 7 天） | 1 天 | 不缩放（只有一级） |
| 本月 | 1 号–月末（最近 31 天，按月份取 28–31） | 1 天 | 天 / 周 |
| 全部 | 最近 12 个月 | 1 个月 | 月 / 周 / 天 |

> 窗口长度按周期自动算，**不写死**（比如 2 月就是 28/29 格）；右端最多停在本周期末尾，左端停在第一条记录。没手动往回翻时窗口**跟随当前周期**（零点自动右移一天），`↺` 就是回到跟随。

**`Chart` 是纯函数式 SVG**，不认平台/游戏，只认每段的 `name/color/seconds`：

- Y 轴固定 **0 → 顶部 4 档**，档位来自 `AXIS_STEPS`（5/10/15/30 分 → 1/2/3/4/6/8/12/24 时…），保证「刻度值是好读整数 + 像素等距」；辅助线 `opacity .05`，不画 0 那条。
- 平均线：中性灰 `rgba(148,155,166,.5)`、0.75px、`2 3` 虚线，左端有贴轴短刻度（`x2 = 34`），数值标签与刻度同高；与阶梯标签冲突时**接管**那条标签。颜色可用 `--gt-chart-avg` 覆盖。
- 所有文字 `7–8px`、`fill:currentColor`（**必须写**，否则 SVG 默认黑色）、`tabular-nums`；X 标注按「格子宽度 ÷ 文字宽度」自动抽稀，24 小时视图全标。
- 交互：按住拖动（一格 = 一根柱子，`dx > 3px` 才算拖动并吞掉这次 click）、滚轮（一格 = 一级刻度，方向：上滚变粗）、hover 气泡（`useState`）、拖拽状态（`useRef`）、点击柱子钻取当天明细、`↺` 回默认窗口与默认级别。
- 标题写成 `时长趋势（1时）`，X 轴左缘也标一次单位（`.gt-chart-unit`），两处必须同步。

**懒加载（2026-11 加）**：`/state` 只带 `historyDays` 窗口；全量数字单独给——`totalsFor(...,'all')` 读 `payload.totals`（客户端再补进行中会话），`lastPlayedAt` 读 `payload.lastPlayed`，`clampAnchor` 的「最早」读 `payload.firstStart`。`AllView`/`DetailView` 用 `useEffect` 在窗口越过 `HISTORY_FROM` 时调 `ensureHistory(window.from)` → `GET /api/game-time/sessions?from=&to=`，按 id 去重后 append，`HISTORY_FROM` 只向前移；30 秒刷新用 `applyLiveState` 把 `end < historyFrom` 的旧页保留下来。窗口大小 = `settings.historyDays`（默认 365，30–1825，设置页「监控 → 历史加载窗口」）。

**全部页的卡片用注册表**，增删/换序只改这个数组：

```js
const ALL_SECTIONS = [
  { id: 'share',    Component: AllShareSection },
  { id: 'trend',    Component: AllTrendSection },
  { id: 'sessions', Component: AllSessionsSection },
]
```

**不要引 npm 图表库。** 依据：插件的 `require` 只能解析 `window.__ModuleLoader__` seed 表（react / cordis / zod / tanstack virtual / ui-slots / ui-primitives 等，**没有图表库**），解析不到直接抛 `missed the module table`；官方 practices 也禁止 require 宿主 client 包。要用库就得先加 esbuild 打包（等于先做待办 #1），而且 canvas 类库还要重做 `currentColor` 与 `--gt-surface-*` 主题适配。现自绘 SVG 已覆盖堆叠、轴、平均线、平移、缩放，够用。

### 样式

单段 CSS 字符串常量 `STYLE`，插在页面里。主题色全部用半透明灰 + `currentColor`，跟随明暗主题。

CSS 变量（在 `.gt-shell` 上设置）：

```
--gt-surface-alpha   区块透明度
--gt-surface-color   区块底色（rgb 三元组）
--gt-header-height   标题背景高度
--gt-header-fade     标题背景渐隐起点
```

### UI 约定（改界面之前先看这几条，别改回旧样子）

1. **下拉只有一个实现**：`Dropdown`（client.js）＋ `.gt-pselect*` 一套样式。排序、监控间隔、视觉密度、平台/安装位置全用它；**不要再写原生 `<select>`**。
2. **图标按钮只有一套规格**：21×21 方框、14px 图形、默认 `opacity .45`、无边框无底色；hover 只提亮到 `1`（不出底色）；按下 `scale(.96)`；键盘 `focus-visible` 才有焦点环。
3. **卡片头那个文字「返回」**保持文字样式，不要套图标按钮规则。
4. **图标来源 Lucide**（内联 SVG，ISC），不引依赖、不联网；同一 24px 网格、2px 描边。
5. 新增视觉控件时先找现成组件，没有就先抽一个，**不允许同一个控件出现两套实现**。
6. **归档 = 折叠**：`game.archived` 只让该游戏从「全部游戏」表（折叠条）和设置页游戏列表里收起，判定走 `isArchived()`；统计、图表、总计、今日页照常计入，会话一条不删。**不要把归档接进任何聚合/统计**，否则总计会和列表对不上。
   - 自动归档是**派生**：`autoArchived(game)` = 规则开 && 没勾 `noAutoArchive` && 最后游玩早于阈值；**不写入 config**（写进去就会和手动取消打架）。玩一次之后 `lastPlayedAt` 前移，自动失效。
7. **统计归组**：`game.group` 非空时 `BY_PLATFORM` 用组名当切片键；组名命中平台名或平台 id 时经 `platformIdForGroup()` 并进该平台，**不要再生成一个同名并列切片**。
8. **设置页返回栏固定**：`GlobalSettings`/`GameSettings` 根节点带 `gt-fixed-head`，只有 `.gt-settings` 滚动，头部不随内容滚走；游戏详情页 `DetailView` 的头部仍随内容滚动（有意，别顺手改）。
9. **图表不引第三方库**（理由见 §7）；要新形态优先让 `Chart`/`ChartCard` 参数化，别复制第二份画图代码。
10. **图表视觉**：平均线、辅助线用中性灰 + 低透明度，**不要借用游戏主题色**（会和平台色混淆）；SVG 轴文字必须写 `fill:currentColor`；刻度单位同时出现在标题和 X 轴左缘。
11. **图表交互**：拖动一格 = 一根柱子，滚轮一格 = 一级刻度；步长必须由「当前刻度」推出来，**按视图写死步长会导致今日一次跳一整天**。
12. **页面状态放模块级**：`LAST_ROUTE` 存"哪一页"，面板卸载重挂时恢复；**不要塞回 `Page` 的 `useState`**，否则切走面板就回起始页。设置页的展开状态（`gamesExpanded/platformsExpanded`）仍在组件内，切走会重置，这是有意的。`STATS_PERIOD`（本周/本月）同理放模块级。
13. **平均只有一个实现**：`averagePerDay()`（秒 ÷ 有玩天数）、`activeDaysOf()`（范围内有记录的天数）、`activeMean()`（非零桶的平均）、`comparePercent()`。图表平均线、列表提示、统计卡、详情页**四处都必须调它们**；新增一处平均就多一个口径，用户会看到两个不一样的「平均」。
14. **响应式按容器宽度**：`widthTier(shellWidth)` 写在 `.gt-shell` 的 `data-w` 上，隐藏顺序在 `STYLE` 末尾按档位级联（`[data-w="sm"] …`）。**禁止 `@media`**：面板是侧栏里的容器，窗口 1400 px 时面板可能只有 380 px。档位：`lg ≥ 840`（三段带灰字、chip 252 px）/ `md ≥ 700`（藏灰字，chip 136 px）/ `sm ≥ 640`（藏「总天数」，chip 104 px）/ `xs ≥ 580`（藏「平均/天」，只剩「比平均」，chip 64 px）/ `< 580`（全藏，名字吃满）。统计卡：圆轮在 `sm` 及以下隐藏，小字标签在 `sm` 隐藏，整段小字在 `xs` 隐藏。**档位是按行预算算的**：`.gt-root` 44 + `.gt-list-card` 16 + 行内边距 20 + 三个数字列 216 + 列间距 24 = 320，第一列 = 面板宽 − 320；dot/tile/间距固定约 60，名字 180，带标签的 chip 252 → 所以 lg 起点 840。
15. **红绿语义**：行提示里「超过平均 = 红，低于 = 绿」（`data-tone="over|under"`）。圆轮是**双轨百分比环**：内圈 0–100%（灰底绿弧 → 满绿 → ≥200% 时压暗的红），外圈 100–200%（红弧），中间百分比 >100% 变红、>999% 封顶。不要再给圆轮加第三层轨道，也别用同色系深浅区分超出量（对比不够，用户已经反馈过一次）。

> 判断一条 UI 改动要不要记下来：**下一个人不知道这条，会不会把它改回去？** 会，就记成约定；不会，就不用记。

---

## 8. 测试

```powershell
cd plugins/game-time
node tests/render-check.mjs    # 假 React 渲染全部视图，约 60 条路径 + 图表几何断言
node tests/host-check.mjs      # 路由、迁移、归属、完整 tick
node tests/exit-check.mjs      # 关一局的防抖落盘 + process.exit() 时的同步落盘
node tests/restore-check.mjs   # 崩溃重启：gone / running / dupe 三个场景
```

`render-check` 用 `globalThis.__GT_TEST__` 暴露内部函数；`host-check` 用 `__GT_HOST_TEST__` 暴露 `tick / setLister / sanitizeConfig / migrate / attributePlatform` 等（`setLister` 在模块加载时就可用，其余在 `apply()` 之后）。`__GT_TEST__.setNow(ms)` 可以把模块时钟拨到任意时刻——测跨天 / 跨周的行为用它，不要依赖真实系统时间（「midnight rollover」那条就是这么测的）。

假 React 只实现了 `createElement / useState / useRef / useEffect`，**没有调度器**：`setState` 是空操作，组件只渲染一次。所以测试只能验证「初始渲染 + 纯函数」，交互路径（拖拽、悬停、点击）靠人工验收；写组件时别依赖 `useEffect` 去产生渲染树。

**改宿主后至少跑一次 host-check + exit-check + restore-check；改 UI 后跑 render-check。** 都过再让你重启/刷新。

**打包**：`node scripts/build.mjs` 只出一个 DSH 插件包；别在解压目录里改代码（那边是快照，改了就和源码分叉）。

### 性能与内存（2026-11-10 实测）

合成数据：单游戏单平台、每条会话 15 分钟、JSON 2 空格缩进；`snapshot()` 是 `/state` 的主体，`window` 是实际下发的 `sessions`。测试机为当前开发机，数字用于看趋势，不是绝对承诺。

| 场景 | 总会话 | 下发窗口 | sessions.json | /state | snapshot | stringify | parse | 100 次过滤 | 宿主 heap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 年 × 4/天 | 1,460 | 1,460 | 0.21 MB | 157 KB | 0.7 ms | 1.4 ms | 0.6 ms | 3.3 ms | 5.4 MB |
| 3 年 × 4/天 | 4,380 | 1,464 | 0.63 MB | 157 KB | 1.7 ms | 1.5 ms | 0.7 ms | 3.1 ms | 6.1 MB |
| 10 年 × 4/天 | 14,600 | 1,464 | 2.11 MB | 157 KB | 2.9 ms | 1.4 ms | 0.8 ms | 3.0 ms | 8.8 MB |
| 10 年 × 30/天 | 109,500 | 10,980 | 15.91 MB | 1.17 MB | 10.6 ms | 11.1 ms | 8.7 ms | 23.7 ms | 34.2 MB |

- **真实宿主**（7 条会话、13 个游戏、图标约 300 KB）：`/state` **300.9 KB**；20 次请求 median **9.8 ms**（min 8.7 / max 42.9）。现在 payload 主要是**图标**，不是会话。
- 10 年 × 30/天 的启动：读 24.7 ms + `JSON.parse` 74.8 ms；整文件落盘：stringify 61.8 ms + write 11.6 ms（每次关局防抖写一次）。
- 日常估算（按 3.5 局/天、约 150–170 B/条）：
  - `sessions.json` **约 0.2 MB/年**，10 年约 2 MB。
  - `/state` ≈ 图标 0.3 MB + 最近 1 年窗口约 0.2 MB ≈ **0.5 MB**；30 秒一次约 1.4 GB/天（本机内存拷贝，不是外网）。
  - 宿主 heap 约 6–9 MB；客户端窗口解析约 0.3 MB；一次渲染的 100 次过滤约 3 ms。
- 重度 10 年 × 30/天才会到：`/state` ~1.5–1.9 MB、宿主 heap ~34 MB、启动 ~100 ms、每次关局写 ~75 ms、一次渲染查询 ~24 ms。
- 结论：**≤10 局/天，10 年内基本无感**；真正值得优化的是 30 局/天 × 10 年，或把 300 KB 图标压小（比再压会话收益大）。

---

## 9. 已知的坑（都真实踩过）

| 坑 | 症状 | 教训 |
|---|---|---|
| 保存配置用了 `version: 1` | 每次保存后背景/图标消失 | 保存必须带当前版本号 |
| `tick` 里用了未定义变量 | 进程在跑但永远"挂起" | 异常被 catch 吞掉；现在有 `lastError` 和 tick 测试 |
| 字符串替换匹配到多处 | 同一个模块被插了 2–3 份 | 改大文件必须用唯一锚点，改完跑测试 |
| 平台路径填了 `.lnk` | 永远检测不到"在线" | 现在 `.lnk` 直接标红 |
| 端口每次启动都变 | 脚本/请求连不上 | 用运行时给的 URL，或扫端口 |
| 按「运行中的启动器 + 全局 rank」归属 | Steam 常驻把绝区零记成 Steam；Playnite 常驻把地平线记成 Playnite | 归属只看**这个游戏自己的启动入口**（有顺序），没有就用安装位置；平台 rank 只影响显示 |
| 父进程溯源查询超时 | tick 中断 → 挂起 | 试过 CIM 父进程链（0.3.1 内部版本）：准但重、WMI 可能被拦；最终走「入口顺序 + 是否在运行」，见 §6 |
| 整文件重写 | 文件被拼重复、损坏一次 | 大改前先备份/先测；拆模块是根本解法 |
| 退出时 `flush()` 没 await | 正常关机/右键退出就丢掉「上次保存配置以来」的全部会话 | 宿主的 `process.exit()` 不等 Promise；退出必须同步写（`flushSync`） |
| 进行中的会话只存在 `active` Map | 崩溃/强杀丢掉当前这一局 | 30 秒心跳写 `active.json`，启动时恢复 |
| SVG `<text>` 没写 `fill` | 暗色主题下 Y 轴刻度是纯黑，和 X 轴不同色 | SVG 文字默认黑色，必须 `fill:currentColor` |
| i18n key 写错/漏定义 | UI 直接显示裸 key（真出现过 `all.archived.tag`） | 新增文案必须中英两份都加；渲染测试里 `t` 是恒等函数，**测不出缺 key**，只能靠对照 |
| 拖动步长按视图写死 | 「今日」拖一下直接跳到前一天 | 步长 = 一根柱子 = 当前刻度，由 `GRAIN` 推导 |
| 「现在」用模块加载时的 `const NOW = new Date()` | 面板开着一整晚，13 号玩到 14 号「今日」还是 13 号的数，怎么刷新都不变（桌面外壳常驻托盘最容易中招） | 「现在」必须是活的：`setNow()` 由轮询 / 跨天看门狗推进；任何从 `NOW` 派生的窗口（今日/本周/最近游玩/图表锚点）都跟着翻页。宿主是对的（`splitByDay` 零点切两段），别去改宿主 |
| 平均线借用游戏主题色 | 平均线和平台色分不清 | 改中性灰 + 0.75px 细虚线，颜色走 `--gt-chart-avg` |
| 把归档接进统计 | 「总计」和「共 N 款」对不上，用户无法理解口径 | 归档只是折叠：`isArchived()` 只用于列表拆分，**不进聚合** |
| 自动归档写成持久化状态 | 手动取消后又被规则写回，来回打架 | 自动归档只做派生判断，`archived` 只存手动决定 |
| 同一个 exe 加到两个游戏 | 不会双计，但后加的那条永远 0 分（`entries.find` 只取配置里第一个） | 标题后已标红「重复」；要保住历史就用合并，别直接删。判定必须跟宿主一致：**按配置顺序，先声明的那个赢** |
| 直接改 `GAMES` / `installs` 没走 `touch()` | 红标和查重结果不更新（缓存按 `configVersion + GAMES.length` 失效） | 任何直接改动都要调 `markConfigChanged()`；正常编辑走 `touch()` 已经包含 |
| 删除游戏会连带删会话 | `handleConfig` 里 `sessions.filter(keep)`，删了就找不回 | 卸载的游戏用**归档**，不要删；删除按钮的文案已写明不可恢复 |
| 为了省体积引入日汇总（试过，已回退） | 31 天后只有天级精度；双文件要保一致，边界日曾丢 30 分钟；实测一年只省 ~2× | 历史永久保留 + 懒加载；体积真成问题时按年分片/懒加载，不要丢精度 |
| 首个 live 包把 demo 旧页当懒加载页 | 全部趋势/平台分布出现 demo 幽灵，总计和切片对不上；删游戏后旧页也会残留 | `applyLiveState` 用 `wasLive` 守卫，`older` 与 `ensureHistory` 响应都按当前 `GAMES` 过滤 |
| `/sessions` 补页失败被 `.catch` 吞 | 图表静默少一段，刷新/重新翻页恢复；只有请求失败时触发 | 后续加一次重试或错误提示；别把 `HISTORY_FROM` 当成“已覆盖”的唯一证据 |
| host `totals` 不按平台过滤 | 改过平台/删过安装后，「总计」可能大于图表切片之和 | 先定产品口径（历史平台时长算不算总计），再决定是否按平台给 totals |
| `sanitizeConfig` 是白名单 | 新增的 `game.*` / `settings.*` 字段保存后凭空消失 | 加字段必须同步 `src/host/config.js` 的白名单，然后重启 |
| PowerShell stdout 编码 | 中文路径存进配置后变成 `◆◆◆◆`（或 `�`） | 路径/名称一律通过 UTF-8 JSON 文件回传，不要读 stdout |
| 拖拽被聊天附件抢走 | 文件拖到面板上却上传到了对话框 | 拖拽容器里 `preventDefault()` **且** `stopPropagation()`，否则 DSH 的 document 级 drop 会接手 |
| 代理隧道下载 vendor 忘了 de-chunk | 页面白屏，控制台 `Cannot read properties of undefined (reading 'createElement')`；JS 首行是 `1641` 这样的十六进制尺寸 | HTTP 是 `Transfer-Encoding: chunked`，必须按块解码；测试里用 `new vm.Script()` 编译一遍 vendor 文件 |
| 用任务管理器强杀网页版 | 当前这一局丢最多 30 秒（`process.exit` 钩子没跑） | 退出走托盘「退出」→ `POST /shutdown`；文档里写死这条 |
| 双击 `start.cmd` 弹「无法验证发布者」 | 这是 Mark-of-the-Web，不是杀软；属性里勾「解除锁定」只对当次解压有效 | 发 zip 用微信/QQ（通常不带标记）或让对方 7-Zip 解压；再不行就本地新建快捷方式指向 `powershell -File launcher.ps1` |
| 平均线的分母用「格子总数」 | 一周只玩两天，平均被摊成总量 ÷ 7，看起来像「每天才玩一会儿」 | 分母＝有记录的格子数（`activeMean` / `averagePerDay`）；「没玩」不是「玩了 0 分钟」 |
| 用 `@media` 做响应式 | 面板在侧栏里 380 px、窗口 1400 px 时，`@media` 完全不动 | 面板是容器不是窗口：`ResizeObserver` 量 `.gt-shell` → `data-w` → CSS 分档 |
| `snapshot()` 里每个会话 `new Date()` 两次 | 加上「已玩天数」后，`snapshot()` 慢一个数量级（11 万条会话：4.5 ms → 41 ms，冷启动测法） | 共享一个 `Date` + `getTimezoneOffset` 算整数日索引（`dayRangeOf`），热身后 11 万条 17.8 ms、日常 1.8 ms；热路径别按会话分配对象 |
| 新增的只读字段以为「不用重启」 | `/state` 不返回 `playedDays` 时，客户端会退回「用已加载窗口算」，老用户看不出问题、但和历史总计对不上 | 改动 `/state` 的字段一律按「宿主改动 → 重启 DSH」处理；客户端有窗口兜底但不要依赖它 |
| 详情页「全部」用窗口时长、头部用全量总计 | 两个数字对不上（历史超过 `historyDays` 时差一整段） | 范围 = `all` 时一律读 `totalsFor(all)` / `playedDaysFor()`（全量），不要用 `sessionsInRange` 的结果 |

---

## 10. 待办 / 建议下一步

**优先级高**

1. **拆分重构**：把 `client.js`/`index.js` 拆成小模块，用 esbuild 打包成现在的单文件产物。行为不变，靠现有测试兜底。**注意**：拆完就必须 build，会改变现在的「改完刷新」流程。
2. **真机确认**：归档折叠条、设置页固定返回栏、组名并入平台、图表拖动 / 滚轮 / 重置，以及**全部页往回翻 >1 年时自动补页**、设置页历史窗口。
3. **自动发现**：方案已定、**未实现**，照 §11 做，别重新调研。

**功能**

4. **双采集器互斥**：网页版启动时只会检测 `DeepSeek Harness.exe` 打警告；没有硬锁，两版同时开仍会各写一份会话。要硬锁得让宿主定期写一个带 pid/端口的心跳，双方都读。
5. `foregroundOnly`（仅前台计时）**0.4.0 已在界面上移除**（从未实现）。替代方案：游戏设置里单游戏「后台暂停」+ 设置里全局开关，实现要点是 `GetForegroundWindow` 取前台进程名、与游戏 exe 比对，**并进现有 tasklist 脚本一次调用**，别每 tick 多起一次 PowerShell
6. 图标裁剪已接到图标；可考虑给平台图标也用同一裁剪器
7. 归档目前只折叠、不停止计时；「归档即停表」是另一个开关，没做（容易误停）
8. 平台支持更多进程别名（目前已支持数组，UI 是逗号分隔输入）

**工程**

9. ~~**自启 launcher 化**（下次第一件）~~ **已冻结（0.4.0）**：只服务网页版，随网页版一起冻结，细节见 `docs/WEB-FROZEN.md`。
10. ~~**README 补 MOTW 分发说明**~~ **已冻结（0.4.0）**：MOTW 是网页版 zip 的问题，说明已搬进 `docs/WEB-FROZEN.md`。
11. 抽设计令牌（颜色/字号/间距）到一个地方
12. `client.js` 加 JSDoc + `tsc --checkJs`，消灭未定义变量类问题
13. 渲染快照测试（DOM 序列化比对），减少「靠人眼看」的次数；**顺便解决 i18n 缺 key 测不出来**的问题（现在 `t` 是恒等函数）
14. **超大历史优化**：**见下方「### 超大历史：按年分文件（未实现）」**。触发条件按实测收紧为 `sessions.json` > **5 MB**。**不要回到日汇总**（见 §9）
15. **懒加载补页失败**：`/sessions` 失败被吞，可能静默缺一段；加一次重试或错误提示（见 §9）
16. **总计与平台口径**：host `totals` 不按 `enabledPlatforms` 过滤；改平台/删安装后总计可能大于切片之和。先定口径，再决定是否让 host 按平台给 totals
17. **重修旧会话归属（可选，未实现）**：0.3.1 之前记的会话 `platformId` 可能是启动器（Playnite / Steam / Mod）。规则：游戏只有一个安装平台且 `session.platformId` 不是它 → 改成该安装平台、把原平台名写进 `source`；写之前**先备份 `sessions.json`**（用户数据，别自动跑）

### 超大历史：按年分文件（未实现）

> 2026-11-10 讨论定稿。**触发条件：`sessions.json` > 5 MB**（约 3 万条会话 / 3–4 年）。
> 现在只有 1.3 KB，**到阈值再动，别提前**。

**为什么是 5 MB**：全量重写 5 MB 约 50 ms、内存膨胀到 30–40 MB，从这里开始有感；18 MB 时关游戏会顿约 200 ms。

**目标结构**

```
storages/game-time/
  sessions-2026.json   ← 热：当年，每次关局全量重写（≤1.9 MB）
  sessions-2025.json   ← 冷：只读
  index.json           ← 每年的汇总头（几 KB）：年 → 各游戏秒数/条数 + 条数校验
  active.json          ← 心跳，不变
```

**读**：启动只读 `index.json` + `sessions-当年.json`。总计/周/月/年图表**全用 `index.json` 的汇总**，不碰往年明细。往回翻到往年时按文件懒加载（延续现有 `ensureHistory`，只是"缺页"从"时间段"变成"文件"）。

**写**：只重写 `sessions-当年.json`，仍是 `tmp → rename` 原子写。

**跨年滚动**（唯一需要仔细写测试的地方，顺序不能反）：

1. 第一次写新年数据前，确认 `sessions-<去年>.json` 已存在且可读
2. 把去年文件冻结（改名或直接不再写）
3. 更新 `index.json`（写去年汇总）
4. 创建 `sessions-<新年>.json` 并写入
5. 失败时回滚到"去年文件仍可读 + 汇总未改"，**不能出现两边都不认的中间态**

**三个坑（提前知道就不算坑）**

1. **删游戏/改名要遍历所有年份文件** —— 用"延迟删除"：只在 `config` 里标记，下次读该年文件时顺手清掉。
2. **`index.json` 算错 → 总计永久错** —— 头里存"条数 + 校验"，启动时对不上就全量重算一次（慢但正确）。
3. **跨年那一下** —— 见上面 5 步，顺序反了会丢一整年的数据。

**与懒加载的关系**：不冲突，是同一件事的两层。懒加载是"前端按时间范围要数据"，分片是"后端按文件存数据"。合并做法：**接口不变，把 `/state` 和 `/sessions` 的数据源从 `state.sessions` 换成一个 store 层**，前端 `client.js` **零改动**。

### 聚合块已经为分片留好接口（0.16.0，已实现）

`snapshot()` 里给客户端的「全量数字」这一块，字段全部是**可合并**的：

| 字段 | 合并方式 | 说明 |
|---|---|---|
| `totals.total` / `totals.game` / `totals.platform` | 相加 | 秒数 |
| `playedDays[gameId]` / `playedDaysTotal` | 相加 | **自然日**计数；一个日历日只属于一年，所以按年文件相加不会重复（跨零点的会话在 `splitByDay` 时已经拆到两天） |
| `firstStart` | 取 min | |
| `lastPlayed[gameId]` | 取 max | |

所以分片落地时**不用重新算**：`sessions-2026.json` 旁边存一份同形状的聚合头（或写进 `index.json`），读的时候把各年相加/取 min-max 即可，`/state` 现成的字段照旧下发（客户端零改动）。这是**现在就能定的接口**，不需要提前实现分片；真要提前做，只需把 `snapshot()` 里那段循环抽成 `aggregateOf(sessions)` 并给每份分片单独跑一次（约 30 行）。**不要**把日计数改成「按年存一个 Set 再求并集」——按年相加已经精确，存 Set 只会让文件变大。

**落地顺序（必须按这个来，任何时候都能回退）**

1. 加 store 层，**只读不写**：读旧 `sessions.json`，在内存里切成"年"视图 → 跑全部测试
2. 切换写入到年文件，保留"旧文件存在时仍能读"的兼容分支
3. 一次性迁移（**先备份 `sessions.json`**）+ 删旧逻辑
4. 跨年滚动 + 专用测试

**工作量 / 风险**：新增约 200–250 行（store）+ 改 `main.js` 约 80–120 行 + 迁移脚本约 60 行 + 测试 5–7 条；约 1.5–2 个工作日。风险**中等偏低**：不引入并发追加、不引入半行坏数据、不需要 compact，仍是原子写；新增的 bug 类型只有"时间边界 + 文件边界"，且都是确定性的、测试可覆盖。

---

## 11. 自动发现（已调研，未实现）

> 2026-11-09 讨论过：启动了没在插件里添加的游戏，也要自动计时。**结论：可行、中等工作量，暂缓。** 真要动手照这一节做，别重新调研。

### 平台有哪些「运行中」标记

| 平台 | 运行标记 | 安装清单 |
|---|---|---|
| Steam | `HKCU\Software\Valve\Steam\Apps\<appid>` 的 `Running=1`（Steam 自己写；离线 / 非 Steam 启动可能没有） | `steamapps\libraryfolders.vdf` 给库目录；`appmanifest_<appid>.acf` 给 `name` + `installdir` |
| Epic | 无 | `C:\ProgramData\Epic\UnrealEngineLauncher\LauncherInstalled.dat`（AppName + InstallLocation） |
| GOG | 无 | `HKLM\SOFTWARE\WOW6432Node\GOG.com\Games\<id>`（path + gameName） |
| EA / Ubisoft / 战网 | 无 | 各自注册表，仅安装 |

**统一用「进程」当运行标记**（tick 本来就在扫 tasklist），平台清单只负责「取名 + 归属」。

### 优先级（一个进程只归一个游戏，高的赢）

1. 显式 install 精确路径命中（含同名 exe 用路径区分）
2. 显式 install 进程名命中
3. 自动识别：路径落在 `<Steam库>\steamapps\common\`、`<Epic库>\Epic Games\`、GOG 注册表 path 的父目录下
4. 其余忽略（绝不把 `chrome.exe` 当游戏）

### 不重复计时的四条硬规则（每条都要测试）

1. **按 pid 去重**：一个 pid 一 tick 只开一局（现在是按 gameId 去重，双开同名进程会算两次）。
2. **按路径去重**：建自动条目前，把全表 `installs[].path` 规范化（小写 + 统一反斜杠）比一遍，命中就复用已有游戏。
3. **按 id 去重**：自动条目 `id = 'auto-' + sha1(规范化路径).slice(0,10)`，同一路径永远同一 id，重启不多一条。
4. **删除不复活**：用户删掉的自动条目记进 `autoIgnored`（路径或 id），下次不再建（同 `presets.json` 的思路）。

### 数据模型（改 `sanitizeConfig` 白名单，否则保存就丢）

```js
game.auto = true           // UI 标「自动」
game.id   = 'auto-<hash>'  // 内容寻址，稳定
game.name = appmanifest name || 目录名 || exe 名
```

宿主只在**新建自动条目**时写一次 `config.json`（`writeJson`，tmp→rename），不要每 tick 写；归属仍走现有 `attributePlatform()`。

### UI

全部页 / 详情页名称旁一个「自动」小标；设置页游戏列表可「确认」（清 `auto` 标）或删除（写入 `autoIgnored`）；「归档已卸载」照常能收它们。

### 预算与风险

| 版本 | 内容 | 工时 |
|---|---|---|
| A 最小 | Steam 库判定 + 自动建条目 + 四条去重 + 「自动」标 + 测试 | 2.5–3.5h，重启 1 次 |
| B | A + Epic/GOG 库 + appmanifest 真名 / 图标 | +1.5–2h |
| C | B + 「未识别进程」确认队列（不自动建，先问） | +2h |

风险：反作弊 / 启动器 exe 混在库目录（排除 `easyanticheat`、`unitycrashhandler`、`crashpad`、`steamwebhelper` 等）；先起 launcher 再起本体被当成两个游戏（同一 appid 只建一条）；目录名带版本号（有 appmanifest 就用真名，没有就允许改名）。建议先做 A 跑一周看误判。

---

## 12. 常用命令

```powershell
# 当前状态（端口从 DSH 运行时拿，或逐个试）
Invoke-RestMethod "http://127.0.0.1:<port>/api/game-time/state"

# 采集器看到了哪些进程
Invoke-RestMethod "http://127.0.0.1:<port>/api/game-time/debug/processes"

# 配置文件
Get-Content "$env:USERPROFILE\.dsh\storages\game-time\config.json" -Raw

# 重置（保留会话记录）
Remove-Item "$env:USERPROFILE\.dsh\storages\game-time\config.json"
Remove-Item "$env:USERPROFILE\.dsh\storages\game-time\presets.json"
```

---

## 13. 文档与回复约定（给下一个会话）

1. **每条回复开头先给难度**：`难度：★☆☆☆☆（很低）` / `★★★☆☆（中等）` 这样，5 星制 + 括号里一句理由。用户明确要求默认这样做，不要等被问。
2. **关键步骤当场记进 §1「最近改动」**：新增功能、改行为、加字段、改 UI 约定、踩到新坑，做完就在同一次答复里追加一条——写清「改了什么 / 影响什么 / 怎么验证」，不要攒到最后或只留在对话里。
3. **顺带更新对应小节**：新字段 → §4；新接口 → §5；新界面约定 → §7；新坑 → §9；待办变化 → §10。
4. **「最近改动」是无序列表，新条目加在最上面**，不要再改成编号——编号每加一条就要重排，之前已经乱过一次。
5. **成本**：这些全是纯文本追加，1–2 分钟，**没有任何运行时开销**（不读写配置、不请求接口）；相比下个会话重新翻对话，几乎免费。
6. **写完自检一句**：如果这句「一句话总结」写不出来，说明改动还没想清楚。
7. **面向非技术读者的写法（2026-11-14 用户要求，长期有效）**：每条答复按「**做了什么 / 什么作用 / 原理**」三段说；专业术语和英文首次出现时**在括号里给中文解释或翻译**，例如 `OAuth（一种「不用把密码给第三方」的授权方式）`、`topics（仓库的标签，决定它出现在哪些搜索里）`；需要用户复制的内容（README、命令、YAML）放在最后**单独一节**，并附中文对照。不要把英文原文和术语堆在正文里让用户自己猜。
8. **每次答复都要带「待办清单」（2026-11-14 用户要求）**：在末尾列出当轮所有待办，用 `- [x]` 表示已完成、`- [ ]` 表示未完成，未完成的写明卡在哪 / 下一步做什么。多轮任务时这份清单就是进度条，不要只在第一轮给。

---

## 14. 新会话交接提示词（复制到新窗口）

> 新会话把下面整段作为第一条消息发出去；把最后一行「本次任务」替换成要做的事。任务为空时，先读 HANDOFF、给建议，不要改代码。

```text
你在 DSH 工作区 C:\Users\10601\Documents\deepseek-harness\default-workspace 里维护插件 plugins/game-time（游戏时长）。

先读：
- plugins/game-time/HANDOFF.md（现状、坑、待办；§14 就是本提示）
- docs/plugin-design-template.md（设计约束）

当前状态（2026-11-14，源码 0.3.2）：
- 「现在」是活的（`setNow()` + 15 秒跨天看门狗），今日/本周/图表锚点都会在零点自动翻页；别再引入静态的模块级时间。
- 归属按每个游戏自己的「启动入口」顺序（0.3.1）。
- 会话永久保留（不再 31 天删除/日汇总）+ 懒加载（默认 1 年，设置可改 30–1825 天）。
- 宿主 /state 只回 settings.historyDays 窗口，另带 totals / firstStart / lastPlayed / historyFrom；GET /api/game-time/sessions?from=&to= 补旧页；客户端 ensureHistory 按 id 去重，只保留当前 GAMES 的页。
- git 仓库在 plugins/game-time/.git，main 分支；四套测试：render-check / host-check / exit-check / restore-check。

硬规则：
1. 不要删会话、不要恢复日汇总；「总计」必须保持全量。
2. 改宿主（index.js / src/host/*）要重启 DSH；只改 client.js 刷新页面即可。
3. 新设置/游戏字段先加 src/host/config.js 白名单，再重启。
4. 不要引 npm 图表库；图表/数据层只有一个序列构建器。
5. 改完跑对应测试：UI 改 client 跑 render-check；宿主跑 host + exit + restore。
6. 关键改动手记 HANDOFF §1；新坑记 §9；待办变化记 §10。

已知风险：
- /sessions 补页失败会被吞，图表可能静默缺一段（刷新可恢复）。
- host totals 与「按平台过滤」的口径未定，改平台/删安装后总计可能大于切片之和。
- 真实 React useEffect 没被假 React 覆盖，改懒加载后需要真机点一次「全部页往回翻 >1 年」。

git：完成一个可验证的检查点后自动 commit；push、改历史、删分支/标签先问我。不要提交 %USERPROFILE%\.dsh 里的游玩数据。

回复约定：每条答复开头给难度（★☆☆☆☆…）；最后用一句话总结「改了什么 / 影响什么 / 怎么验证」。

本次任务：<在这里写新任务；如果留空，就先读 HANDOFF 并给出下一步建议，不要改代码。>
```
