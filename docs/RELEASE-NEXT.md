# 发布文案（GitHub Release 用）

> 用途：发版时整段贴进 GitHub Release。`CHANGELOG.md` 里仍按版本分条保留完整中文记录。
> 资产只挂一个：`dsh-plugin-game-time.zip`（名字不带版本号，`latest/download/` 永久有效）。

---

## Game Time 0.16.1

### English

Docs and packaging only — no behaviour changes. Restart is **not** needed.

- The npm description no longer mentions a standalone web app (removed back in 0.14.0).
- Search metadata: the npm description and keywords now carry "game stats" / "playtime stats" and the Chinese terms 游戏时长 / 游玩时长 / 游戏统计 / 时长统计 / 游戏计时, so the plugin can be found by those words.
- The README drops two settings that are not in the UI any more (foreground-only timing, autostart) and documents the two that are there (language, row hints).
- The English README now has npm and zip install steps plus a settings table.

**Known limits**: Windows only; no game auto-discovery; no "foreground only" timing; data stays local in `%USERPROFILE%\.dsh\storages\game-time\`.

### 中文（简版）

只改文档和打包，没有功能改动，**不用重启 DSH**。

- npm 包描述不再写「独立网页版」（0.14.0 已删除）。
- 搜索关键词：npm 描述与关键词补上 game stats / playtime stats 和「游戏时长、游玩时长、游戏统计、时长统计、游戏计时」，市场里能按这些词搜到。
- README 去掉两个界面上已经不在的设置项（仅前台计时、开机自启），补上语言和列表提示。
- 英文 README 补了安装步骤和设置表。

**已知限制**：仅 Windows；没有自动发现游戏；没有"仅前台计时"；数据只在本机。

---

## Game Time 0.16.0

### English

Every "average" in the panel now means the same thing: **the average of days you actually played**. A day with no play is not a zero-minute day, so it no longer drags the average down.

- **Averages**: the chart's average line, the game detail page, the row hints and the stat rings all call one helper. The chart line also skips empty buckets (a week with two played days is "average per played day", not "total ÷ 7").
- **Row hints**: each row carries `avg/day`, `days played` and `vs average` (+/- %) in a small boxed chip. Values are full-strength and the same size as the row's number columns; rows stay aligned at any panel width, and the chip sheds items as the panel narrows (labels first, then days, then avg/day).
- **Hints only for recent games**: Settings → Interface → "Row hints" (1/3/7/14/30/90/365 days, default 7). Games you finished and stopped playing keep a plain row.
- **Stat cards**: Today shows the day's total next to the average per day; This week shows its total next to **last week's total** (not an average) and switches to This month when clicked; Total shows the all-time total plus days played of the recorded span.
- **Ring gauges**: two tracks — the inner ring is 0–100 % of the baseline, the outer thin track is the overflow (100–200 %), drawing the second hundred *outside* the circle. The middle prints the real percentage (red past 100 %, `999%+` above a thousand).
- **Detail page**: adds "days played" (follows the selected range) and renames average to "average per day"; the All range now reads the all-time total instead of the loaded one-year window.
- **Smaller text, fewer sizes**: type is four sizes (10/11/13/20 px) and two accents (green/red), the stat sub-line sits next to the time, and the list gets a soft card frame.
- **Responsive by panel width, not window width**: a ResizeObserver measures the panel and hides items in a fixed order.

Requires a **DSH restart** once (the host adds two read-only fields to `/state`: `playedDays`, `playedDaysTotal`), then a page refresh.

**Known limits**: Windows only; no game auto-discovery; no "foreground only" timing; plays are detected by process name; data stays local in `%USERPROFILE%\.dsh\storages\game-time\`.

### 中文（简版）

这一版统一了「平均」的口径：**只按有玩的那一天算**，没玩的日子不进分母；图表平均线、详情页、列表提示、统计卡圆轮共用同一套算法。

- 列表每行多了 `平均/天`、`总天数`、`比平均` 三个小数据（固定在白色细边小框里，随面板变窄依次收起；设置里可限定只给最近 7 天内玩过的游戏显示）。
- 今日页三张卡变成对比式：本日 vs 平均每天、本周 vs 上周总和（点一下切本月）、总计 + 总天数。
- 圆轮改成双轨：内圈 0–100%，外圈细轨表示超出的 100–200%，中间显示真实百分比。
- 详情页新增「已玩天数」，「平均」改成「平均每天」。
- 字号收敛成 4 档、强调色收敛成 2 个；列表加了圆角外框。

需要**重启一次 DSH**（宿主多返回两个只读字段），之后刷新页面即可。

**已知限制**：仅 Windows；没有自动发现游戏；没有"仅前台计时"；数据只在本机。
