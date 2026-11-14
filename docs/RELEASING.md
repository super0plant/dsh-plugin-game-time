# 发布流程（维护者用）

> 目标：每次发版 10 分钟，不靠记忆；出错能一键回退。

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

## 2. 发版步骤

1. 改代码 → `npm test`（五套全绿，**看退出码**，别只截几行输出）
2. 改 `CHANGELOG.md`（新版本加在最上面，写「用户能感知的变化」，不写实现细节）
3. 同步 `HANDOFF.md` §1 最近改动（写给下一个维护者看的内情）
4. 改两处版本号
5. `node scripts/build.mjs`（出两个 zip 到 `dist/`）
6. 提交：`git commit -m "feat|fix|style: ..."`
7. 打标签：`git tag -a vX.Y.Z -m "..."`，推送 `main` 和标签
8. GitHub Release：只挂 **`dsh-plugin-game-time.zip`**（资产名**不带版本号**，这样 `latest/download/dsh-plugin-game-time.zip` 永远有效）
9. 发坏了：把那个 Release 标成 **Pre-release** 并在说明里写「请用 X.Y.Z」，**不要删**，同时在 `CHANGELOG` 里标一句

## 3. 发布文案怎么分

| 位置 | 写什么 | 谁看 |
|---|---|---|
| `CHANGELOG.md` | 中文、按版本、每条一句、说「用户看到的变化」 | 用户 + 未来的你 |
| GitHub Release notes | 英文为主（或中英各一段），只写这一版的变化 + 已知限制 | 下载页访客 |
| `HANDOFF.md` §1 | 实现细节、根因、验证方式、要不要重启 | 下一个维护者 |
| commit message | 一句话标题 + 一段「为什么」 | 未来的你 `git log` |
| README | 长期不变的内容：功能、安装、数据位置、限制 | 第一次来的人 |

## 4. 还没做的发布渠道

- **npm 发布**：`npm publish` 后包名 `dsh-plugin-game-time` 才被市场索引收录；目前卡在 npm 账号注册（见 HANDOFF 待办）。发布前确认 `repository` 字段指回 GitHub。
- **awesome-dsh-plugin 投稿**：文件 `publish/data-plugins-super0plant__dsh-plugin-game-time.yml`，`category: fun`，仓库需满 1 天。
- **英文 README**：marketplace 与 awesome 的评审主要看英文，建议至少给一个精简英文版（见 `docs/RELEASE-NEXT.md` 末尾的清单）。

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
