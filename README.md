# 游戏时长（Game Time）

在 DSH 侧边栏里按游戏统计每天、每周、每月和累计游玩时长。数据全部留在本机，不联网。

作者：**super0plant**（茄子超人） · MIT

---

## 功能

- **按进程计时**：游戏本体在跑就开始，关掉就结束；不依赖启动器是否开着。
- **多平台合并**：同一款游戏可以挂多个安装位置（如国服 / 日服），统计时合并，也能按平台拆分。
- **今日 / 本周 / 本月 / 全部**：柱状或曲线，按平台或按游戏分色堆叠；支持拖动换窗口、滚轮换刻度、点柱子看当天明细。面板一直开着也会在零点自动翻页：跨零那一局，零前算昨天、零后算今天。
- **游戏管理**：拖 exe / `.lnk` / `.url` 直接添加；自动取名、取图标；支持图标裁剪、背景图、标题背景。
- **统计归组**：几个小游戏可以并进一个组，或并进某个平台。
- **归档**：卸载的游戏可以折叠起来，统计照常保留；也可按「N 天不玩」自动收起。

## 环境要求

- Windows 10 / 11（采集依赖 `tasklist`、PowerShell 与注册表，暂不支持其他系统）。
- 已安装 DSH，且支持「本地目录插件」；插件跑在 DSH 宿主里，**不需要 Node.js**。

## 安装（DSH 插件）

**直接下载 zip（不需要 npm）**

- 插件包：[dsh-plugin-game-time.zip](https://github.com/super0plant/dsh-plugin-game-time/releases/latest/download/dsh-plugin-game-time.zip) → 解压，然后按下面「从目录安装」添加。
- 独立网页版：[game-time-web.zip](https://github.com/super0plant/dsh-plugin-game-time/releases/latest/download/game-time-web.zip) → 解压，双击 `start.cmd`。

这两个链接永远指向**最新版**（文件名不带版本号，所以不会随发版失效）。

**从 npm 安装（推荐）**

- 桌面端：DSH → 设置 → 插件 → 搜索 `dsh-plugin-game-time` → 安装 → 重启 DSH。
- 命令行：`dsh plugin --profile <profile> add dsh-plugin-game-time`，`<profile>` 换成你实际在用的名字（桌面端通常是 `desktop`）。

**从目录安装（不走 npm）**

1. 解压本包到任意目录，例如 `D:\Tools\dsh-plugin-game-time`。
2. 打开 DSH → 设置 → 插件 → 添加插件 → 填写解压后的目录路径。
3. 重启 DSH（宿主代码在启动时加载一次）。
4. 侧边栏出现「游戏时长」图标。

> 目录可以放在任何位置，但**不要删除或移动**：DSH 的 profile 里记录的是这个路径的链接。

> 仓库里的 `standalone/` 是**已暂停维护的网页版**外壳，和 DSH 插件无关，可以忽略；想复活看 `docs/WEB-FROZEN.md`。

## 首次使用

安装后是空列表，需要手动添加游戏：

1. 进入「游戏时长」→ 设置。
2. 把游戏的 `exe`、快捷方式 `.lnk` 或 `.url` **直接拖到设置页的游戏列表**，会自动新建游戏、取名、填平台、取图标。
3. 如果同一个 exe 已经属于另一个游戏，会提示「已经在『X』里计时」——同一进程只会归一个游戏。
4. 平台（Steam / 米哈游 / WeGame …）默认不带启动器路径。**一局算哪个平台**：游戏设置里的「启动入口」从上往下，取第一个启动器正在运行的；没有入口、或都没在跑，就用「安装位置」左边选的平台。平台列表的排序只影响显示，不影响识别。

开始游戏后，面板顶部会出现「监控中」和正在计时的游戏；关掉游戏约 1.5 秒后落盘。

## 设置说明

| 设置 | 说明 |
|---|---|
| 监控间隔 | 轮询进程的间隔，默认 10 秒；越短起止越准，开销略高。 |
| 历史加载窗口 | 启动时只加载最近这段记录，默认 1 年（可选 1 个月到 5 年）；往回翻时按需加载更早的，总计不受影响。 |
| 仅在游戏窗口位于前台时计时 | **当前版本尚未实现**，开关不会影响计时。 |
| 开机自启 | 仅独立界面可操作。DSH 内为灰色：插件由 DSH 启动，这里写系统自启只会变成「让 DSH 随登录启动」，不属于本插件。详见下方说明。 |
| 界面密度 | 舒适 / 紧凑。 |
| 背景、标题背景 | 全局外观，支持裁剪与区块透明度。 |
| 自动归档 | 超过 N 天（或 N 个月）没玩的游戏自动折叠；玩一次自动恢复。 |

### 关于开机自启

- **默认不写登录项**：只有你在独立版里打开这个开关时才会写入（注册表是唯一真源，界面显示的就是注册表的实际状态）。
- **DSH 里不可选**：DSH 自己会启动本插件，再写一条登录项没有意义，还会和你的 DSH 启动方式冲突。
- **不开自启的后果**：只有手动打开程序后才开始计时，从开机到你打开之间的游玩不会计入。
- **关闭的影响**：只移除本程序自己的登录启动项（`HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 下的 `GameTime`），不影响其他软件，之后随时可以再打开。

## 数据与隐私

- 位置：`%USERPROFILE%\.dsh\storages\game-time\`（尊重 `DSH_HOME` 环境变量）。
- 文件：`config.json`（平台/游戏/设置）、`sessions.json`（全部会话，**不会自动删除**）、`active.json`（进行中的心跳，干净退出会删除）、`assets/`（背景图）。
- **不联网、无遥测、无账号**。所有统计都在本机完成。
- 删除 `game-time` 目录即可清空全部数据；卸载插件不会自动删数据。

## 备份与还原

改设置、升级版本前先备份，出问题一条命令回去：

- **备份**：双击 `backup.cmd`（或 `powershell -File scripts\backup.ps1`）
  会把 `config.json / sessions.json / active.json / presets.json` 复制到 `backups\<时间>\`，并给当前代码打一个 `backup-<时间>` 的 git tag。
- **还原**：双击 `restore.cmd`，按提示输入时间（直接回车 = 最近一次）
  会**先把当前数据另存**再覆盖，然后把代码 `git reset --hard` 回那个 tag；宿主代码变了要重启 DSH。
- 只想回退某一版代码：`git checkout v0.9.0 -- client.js`，或从 GitHub Releases 下载对应版本。
## 已知限制

- 仅 Windows。
- **没有自动发现**：新游戏需要手动添加（拖 exe 即可）。自动识别的方案已调研但未实现。
- **没有「仅前台计时」**：挂着游戏但切到桌面时，时间照常累计。按游戏暂停 / 全局暂停在计划里。
- 历史记录永久保留；面板默认只加载最近 1 年，翻更早时按需加载（可在设置里改窗口）。
- 关游戏、关面板都不会丢数据；程序被强杀最多丢 30 秒（心跳间隔）。

## 卸载

- DSH → 设置 → 插件 → 移除「游戏时长」，重启 DSH。
- 如需清空数据，删除 `%USERPROFILE%\.dsh\storages\game-time\`。

## 开发

```powershell
cd <插件目录>
node tests/render-check.mjs    # 假 React 渲染全部视图（约 60 条路径 + 图表几何）
node tests/host-check.mjs      # 路由、迁移、归属、配置读写、一次完整 tick
node tests/exit-check.mjs      # 关一局的防抖落盘 + process.exit 时同步落盘
node tests/restore-check.mjs   # 崩溃重启：gone / running / dupe
node tests/standalone-check.mjs # 网页版外壳（已冻结，保留回归）
node scripts/build.mjs         # 打包：dist/dsh-plugin-game-time-*.zip（网页包仍在，只是不宣传）
```

改 `index.js` / `src/host/*` 需要**重启 DSH**；改 `client.js` 只需刷新页面。

---

作者：super0plant（茄子超人） · MIT
