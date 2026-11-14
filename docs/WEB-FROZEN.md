# 独立网页版（已冻结）

> 状态：**0.4.0 起暂停维护**。这个文档把网页版的所有信息集中在这里，主线（DSH 插件）的 README 不再提它。
>
> 冻结不等于删除：代码、脚本、素材都还在仓库里，动手 10 分钟就能重新跑起来。

## 为什么冻结

- 主线只有 DSH 插件：用户都在 DSH 里用，网页版要额外装 Node、解压、处理 Windows 的「无法验证发布者」提示。
- 网页版自带一整套与插件无关的工程量（托盘、Edge 独立窗口、开机自启注册表、端口单实例），维护成本远高于收益。
- 数据完全共用，所以「先只做插件」不会丢任何用户数据；以后想复活，历史会话照样在。

## 仓库里还留着什么（看起来没用，但先别删）

| 路径 | 作用 | 删掉的后果 |
|---|---|---|
| `standalone/server.mjs` | 网页版入口：假 ctx 复用宿主 `apply()`，固定 `127.0.0.1:45917` | 想复活要重写外壳（约 1 天） |
| `standalone/launcher.ps1` | 桌面外壳：隐藏起服务、用 Edge `--app` 开独立窗口、托盘菜单 | 同上，而且托盘/自启是调了好几轮才稳的 |
| `standalone/start.cmd` / `stop.cmd` | 双击启动 / 兜底退出（`POST /shutdown`） | 同上 |
| `standalone/index.html` / `loader.js` | 页面壳 + `__ModuleLoader__` shim（locale / slots / 挂载） | 网页版白屏 |
| `standalone/vendor/react*.js` | React 18.3.1 UMD（MIT），离线可用 | 网页版白屏 |
| `tests/standalone-check.mjs` | 网页版回归测试（挂载 zh/en + HTTP 契约 + 单实例） | 少了唯一能验证外壳的测试 |
| `scripts/build.mjs` 的 web 分支 | 出 `dist/game-time-web-*.zip` | 不再有网页版安装包（这正是现在想要的） |
| `client.js` 里注释掉的「开机自启」设置块 | 见下方「恢复步骤」第 3 步 | 恢复时要把注释打开 |

`package.json` 的 `files` 仍然包含 `standalone`（网页版冻结所以没动），因此 npm 包里会多约 700 KB——已知且接受；真要瘦身时把那一条删掉即可。

## 恢复步骤（约 10 分钟）

1. 取消 `client.js` 里注释掉的开机自启设置块（搜 `冻结（0.4.0）：开机自启`），文案键 `settings.autostart*` 一直都在。
2. `scripts/build.mjs` 的 web 分支本来就还在，直接 `node scripts/build.mjs` 就会重新产出 `dist/game-time-web-<版本>.zip`。
3. `npm test` 里包含 `tests/standalone-check.mjs`，照常跑就能验证外壳。
4. 在 README 恢复「独立网页版」章节（本文档下方有原文）。

## 使用说明（冻结前的原文）

网页版是**另一个包**（`game-time-web-<版本>.zip`），和 DSH 插件包分开解压、分开存放，互不覆盖。

1. **先解除锁定**，否则 Windows 会弹「此文件来自其他计算机」：右键 zip → 属性 → 勾「解除锁定」→ 确定，然后再解压。已经解压过的，可以对 zip 运行 `Unblock-File .\game-time-web-0.2.1.zip` 后重新解压。
   > 未签名的 `.cmd` / `.exe` 都会这样，和程序本身无关；点「仍要运行」也能用，只是每次重新解压都会再问一次。
2. 解压到任意目录，例如 `D:\Tools\game-time`。
3. 双击 `start.cmd`：弹一个**独立窗口**（Edge 的 app 模式：没有地址栏、没有标签页，任务栏有自己的图标）；右下角出现**托盘图标**，右键菜单是「打开面板 / 开机自启 / 退出」；没有控制台黑框，**关掉窗口不会停表**。
4. **关掉窗口 ≠ 退出**：X 只关窗口，采集器还在后台跑。要停表用托盘右键「退出」，或双击 `stop.cmd`（干净退出，先落盘）。
5. **Win11 托盘图标默认折叠**：新图标会藏在任务栏右下角的 `^` 里，可以拖到任务栏常驻。
6. 再次双击 `start.cmd`：只会把已有窗口叫出来，不会起第二个采集器。
7. 需要开机就在计时：托盘菜单或设置 → 启动里打开「开机自启」。

> 出问题看 `%LOCALAPPDATA%\GameTime\launcher.log`（启动、托盘、退出都会记一行）。

> 进阶：不想用 Edge 窗口时，可以直接 `node standalone\server.mjs` 起服务，浏览器访问 <http://127.0.0.1:45917/>；退出用 Ctrl+C。

**和插件的关系**

| 项 | 说明 |
|---|---|
| 前端 / 后端代码 | **同一份**（`client.js` + `src/host/*`）。网页版只是多了一个外壳调同一个 `apply()`，不存在第二套实现。 |
| 数据 | **同一份**：`%USERPROFILE%\.dsh\storages\game-time\`，两版切换历史都在。 |
| 采集器 | **同一时间只能开一个**。DSH 里装着插件时再开网页版，两个进程都会计时并写同一个 `sessions.json`（这就是 HANDOFF 里「双采集器互斥」待办的由来）。 |
| 拖拽 | 浏览器只能拿到文件名，所以网页版里 `.url` / `.lnk` 可拖入，`.exe` 要用文件夹按钮。 |
| 端口 | 网页版固定 `127.0.0.1:45917`（端口即单实例锁）；DSH 里端口随启动变化。 |

## 历史踩过的坑（复活前先读，能省半天）

| 坑 | 症状 | 结论 |
|---|---|---|
| Mark-of-the-Web（文件来自其他计算机） | 双击 `start.cmd` 弹「无法验证发布者」 | 属性里勾「解除锁定」只对当次解压有效；用 7-Zip 解压或从微信/QQ 传 zip 通常不带标记 |
| `[Windows.Forms.Application]::Run()` 无窗体 | 窗口打开但没有托盘图标 | 改成隐藏宿主 `Form` + `Run($form)` 才稳 |
| 托盘被 Win11 折叠 | 用户以为没启动 | 启动时弹气泡提示，README 教用户去 `^` 里拖出来 |
| 用任务管理器强杀 | 当前这一局丢最多 30 秒 | 退出走托盘 → `POST /api/game-time/shutdown` → `process.exit` → 同步落盘 |
| 第二个实例 | 两个进程各写一份会话 | 端口即锁：第二个进程只开浏览器、不 import 宿主 |
| `launcher.ps1` 存成无 BOM 的 UTF-8 | PowerShell 5.1 把中文读成乱码、脚本语法错 | 构建脚本强制校验 UTF-8 BOM |
| 自启写注册表 | 登录后留一个黑色控制台窗口 | 计划改成写 `powershell -File launcher.ps1 -NoWindow`（未做，已随本版冻结） |
