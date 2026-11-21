# 发布流程（维护者用）

> 目标：每次发版 10–15 分钟，不靠记忆；出错能一键回退。网络和登录态不出问题时，实际就是 10 分钟。

## 1. 版本号

语义化版本（semver）：`主.次.修`

| 改了什么 | 升哪位 | 例子 |
|---|---|---|
| 只修 bug | 修 | 0.11.5 → 0.11.6 |
| 新功能 / 行为变化 | 次 | 0.11.6 → 0.12.0 |
| 1.0 之后的破坏性改动 | 主 | 1.x → 2.0 |

**版本号只改两处**，必须同时改，否则界面署名和包版本会不一致：

- `package.json` → `version`
- `client.js` → `const VERSION = '...'`

## 2. 发版步骤（照顺序，别跳）

1. 改代码 → `npm test`（四套全绿：render / host / exit / restore，**看退出码**，别只截几行输出）
2. 改 `CHANGELOG.md`（新版本加在最上面，写「用户能感知的变化」，不写实现细节）
3. 同步 `HANDOFF.md` §1 最近改动（写给下一个维护者看的内情）
4. **先查号**：`npm view dsh-plugin-game-time version` —— 本地的号必须比它大；同号已占就只能往上加（0.16.2 已发过，所以 2026-11-22 这次发的是 0.16.3）
5. 改两处版本号：`package.json` 的 `version` + `client.js` 的 `const VERSION`
6. `npm whoami`：401 就 `npm login`（浏览器授权），别硬发
7. 提交：`git commit -m "feat|fix|style: ..."`
8. **先探路**：`git ls-remote origin`；不通就开代理/VPN 或 `git config --global http.proxy ...`，通了再推
9. 推送：`git push origin main`，然后 `git tag vX.Y.Z && git push origin vX.Y.Z`
10. `npm publish`（2FA：浏览器确认或 `--otp=123456`）；`prepublishOnly` 会再跑一遍四套测试
11. 校验：`npm view dsh-plugin-game-time version`；`npm view dsh-plugin-game-time@X.Y.Z gitHead` 要等于 `git rev-parse HEAD`
12. `node scripts/build.mjs` → 产物在**工作区根目录** `dist/dsh-plugin-game-time-X.Y.Z.zip`
13. GitHub Release：tag 选刚推的 `vX.Y.Z`，附件**改名成 `dsh-plugin-game-time.zip`**（不带版本号，`latest/download/dsh-plugin-game-time.zip` 才永久有效）
14. **目录同步**：`publish/` 里的条目描述必须和 npm 实际行为一致；代码行为变了，就提一个只改这一个文件的 PR
15. 发坏了：把 Release 标成 **Pre-release**，说明写「请用 X.Y.Z」，**不要删**，同时在 `CHANGELOG` 里标一句

## 3. 发布文案怎么分

| 位置 | 写什么 | 谁看 |
|---|---|---|
| `CHANGELOG.md` | 中文、按版本、每条一句、说「用户看到的变化」 | 用户 + 未来的你 |
| GitHub Release notes | 英文为主（或中英各一段），只写这一版的变化 + 已知限制 | 下载页访客 |
| `HANDOFF.md` §1 | 实现细节、根因、验证方式、要不要重启 | 下一个维护者 |
| commit message | 一句话标题 + 一段「为什么」 | 未来的你 `git log` |
| README | 长期不变的内容：功能、安装、数据位置、限制 | 第一次来的人 |

## 4. 发布链路：三个地方，各管什么

| 地方 | 是什么 | 更新靠什么 | 谁来做 |
|---|---|---|---|
| npm 官方源 | 本体；用户 `dsh plugin add` 装的就是它 | `npm publish` + 2FA | **你**（验证码/浏览器确认在手上） |
| GitHub 仓库 + Release | 源码、tag、免 npm 的 zip | `git push` + 建 Release | 可交给 agent（需要一次全权限跑凭据助手） |
| awesome-dsh-plugin 目录 | 市场 / 官方「发现」读的清单 | 一个 yml 一个 PR | 可交给 agent，合并由维护者 |

凭据与网络（2026-11-22 实测）：

- **npm**：`npm whoami` 返回 401 = 登录态过期，`npm login` 走浏览器授权。2FA 是账号级的，每次 `publish` 都要现取 6 位码（`EOTP` 就是这个，不是登录坏了）。
- **git push**：HTTPS 用 Windows 的 Git Credential Manager。在 DSH 沙箱里它起不来（`couldn't create signal pipe` → `could not read Username`）：要么在**自己的终端**里推，要么让 agent 用一次 `danger-full-access` 执行。
- **github.com 网络**：会间歇性被重置/超时（`Recv failure: Connection was reset`、21 秒超时），而 `api.github.com` 往往还是通的。**先 `git ls-remote origin` 一秒探路**，别连着盲试。
- **重启后端口会变**：DSH 重启后 GUI 可能换端口（7060 → 1514 就发生过），验接口要用**当前**地址，别用旧书签。

### 4.1 安全检查（0.16.3 的教训）

插件用 `ctx.webServer.register` 自己注册的 `/api/game-time/*` 路由，**默认不过 DSH 的鉴权**。DSH 的门在 `connection` 服务：

- **`ctx.connection.requestRejection(req)`**：Host / Origin 校验（防 DNS rebinding 和跨站调用）+ 浏览器登录态。官方 `open-in-app` 等插件都这么用。
- 新加路由时，`inject` 带上 `connection`，handler 第一行就 `requestRejection`；失败直接 401/403 返回，路径和 body 都不读。
- 没有 `connection` 服务的组合按 401 拒绝（fail closed），不要退回裸奔。
- 验证：重启 DSH 后，在 PowerShell（没有浏览器 cookie）请求 `GET /api/game-time/state` 必须返回 **401**；同时面板里数据正常加载。
- 一句话原理：本地 HTTP 面不是「只有本机所以安全」——你浏览器里打开的**任意网页**都能向 `127.0.0.1` 发请求（简单请求不过预检），DNS rebinding 还能读到响应。鉴权是唯一可靠的门。

## 5. 回退

- 整版回退：`git reset --hard vX.Y.Z`（本地立即生效；远端需强推，慎重）
- 单次改动回退：`git revert <commit>`
- 数据回退：`backup.cmd` / `restore.cmd`（`backups/` 已 gitignore，不会进仓库）

## 6. CI（在网页上启用，不需要本地权限）

GitHub 的 OAuth token 缺少 `workflow` scope 时，命令行推不动 `.github/workflows`。在网页上添加即可：

1. 打开 <https://github.com/super0plant/dsh-plugin-game-time/new/main?filename=.github/workflows/test.yml>
2. 粘贴：

```yaml
name: test
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm test
```

3. Commit → 之后每次 push 自动跑四套测试，README 可加徽章。

## 7. 发布前检查清单（每次发版照着勾）

- [ ] `npm test` 退出码 0（render / host / exit / restore）
- [ ] 两处版本号一致（`package.json` / `client.js`），且大于 `npm view dsh-plugin-game-time version`
- [ ] `CHANGELOG.md` 有本版条目
- [ ] `npm whoami` 不是 401
- [ ] `git ls-remote origin` 能通
- [ ] `node scripts/build.mjs` 出包到**工作区根目录** `dist/`
- [ ] tag `vX.Y.Z` 已推送到远端
- [ ] Release 只挂 `dsh-plugin-game-time.zip`（资产名不带版本号）
- [ ] 说明里写清是否需要重启 DSH
- [ ] 若行为/描述变了：awesome 条目同步，并提一个只改这个文件的 PR（标题不带 `#`）
- [ ] 发布后：无凭据请求插件接口得到 401/403，同时面板数据正常

## 8. 这次踩过的坑（0.16.3，2026-11-22）

| 现象 | 原因 | 处理 |
|---|---|---|
| `git push` 报 `Recv failure: Connection was reset` / 21 秒超时 | github.com 连接被间歇性重置；同时 `api.github.com` 还能通 | 先 `git ls-remote` 探路；开代理/VPN 或稍后重试 |
| 沙箱里 push 报 `couldn't create signal pipe` + `could not read Username` | Git Credential Manager 在沙箱内起不来（命名管道被禁） | 在自己的终端推，或批准一次全权限 |
| `npm whoami` 报 E401，`npm publish` 跟着报 404 | 登录态过期（404 是未认证 PUT 的假象，不是包名没了） | `npm login` 后重发 |
| 本地 HANDOFF 写「0.16.2 未发布」，npm 上其实已有 | 文档没跟上发版事实 | 发版前先 `npm view <pkg> version`；这次因此只能发 0.16.3 |
| PowerShell 验 401 时输出空白 | 用的是重启前的 7060，连接被拒、异常里没有 Response | 用 DSH 当前地址；`Invoke-WebRequest -SkipHttpErrorCheck` |
| PR 标题显示成 `#Add ...` | 模板把 Markdown 标题符号抄进了 GitHub 标题框 | 标题不带 `#`；已合并的改不了，只能下次不犯 |

**分工一句话**：**2FA 和重启 DSH 归你，push / Release / 目录 PR / 验证归我。**
