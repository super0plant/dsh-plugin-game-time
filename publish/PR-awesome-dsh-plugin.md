# PR 文案：把 game-time 投进 awesome-dsh-plugin

> 用法：fork `awesome-dsh-plugin/awesome-dsh-plugin`，把同目录的
> `data-plugins-super0plant__dsh-plugin-game-time.yml` 放到仓库的
> `data/plugins/super0plant__dsh-plugin-game-time.yml`，**只加这一个文件**，
> 然后把下面「标题」和「正文」分别粘进 PR 的标题框和描述框。
> 两个 README 是脚本生成的，不要手改。

## 标题

```text
Add super0plant/dsh-plugin-game-time (fun)
```

> **不要带 `#`**。`#` 是 Markdown 标题符号，粘进 GitHub 的标题框会原样变成「#Add …」（PR #17155 就是这样：标题显示成 `#Add super0plant/dsh-plugin-game-time (fun)`）。PR 一旦合并，GitHub 不再提供编辑标题的入口，只能靠下一份别再写错。

## 正文

```markdown
- [x] I added **one file** at `data/plugins/super0plant__dsh-plugin-game-time.yml` — that single file is the whole submission.

Repo: https://github.com/super0plant/dsh-plugin-game-time
npm: https://www.npmjs.com/package/dsh-plugin-game-time
Category: `fun`

**What it does.** A DSH sidebar panel that times each game by its own running process (not the launcher) and charts today / last 7 days / last 30 days / all-time totals. Games can be grouped by platform, and archived games keep their numbers while folding out of the list. Everything is stored locally in `%USERPROFILE%\.dsh\storages\game-time\` — no account, no network, no telemetry.

**Checklist**

- [x] `package.json` declares `dsh.bundle` (`{ "patch": "./cordis.patch.yml" }`) and `cordis.patch.yml` sits at the repo root
- [x] Installable with `dsh plugin add dsh-plugin-game-time` (published on npm, 0.16.x)
- [x] Repo created 2026-11-13, so it is past the 1-day bar
- [x] `dsh-plugin` topic added to the repo
- [x] The description matches the code: per-process timing, day/week/month/all-time charts, local storage — no claim beyond that
- [x] Windows only, and the description says Windows; that is a platform limit, not a missing feature

The icon points at a GitHub-hosted ~180px PNG in the repo (`assets/icon-180.png`).
```

---

## 后续：删掉条目里的警告句（等 0.16.3 发布后再提）

维护者 fkysly 合并 #17155 后，直接在 main 上给条目描述追加了一句（英文在前、中文在后）：

> Its HTTP routes have no DSH access check, so a web page open in your browser could call them.
>
> 它的 HTTP 路由没有 DSH 的访问检查，浏览器里打开的网页可以调用它们。

他留的原话是「Add that check and open a PR to remove the sentence」。0.16.3 补上 `ctx.connection.requestRejection` 并发布之后，提一个**只改这一个文件的 PR**：

- 分支：在自己 fork 的 `main` 上直接编辑 `data/plugins/super0plant__dsh-plugin-game-time.yml`（GitHub 网页编辑即可，不用本地 clone）。
- 改动：把 `description.en` 和 `description.zh` 末尾那两句删掉，恢复成 `data-plugins-super0plant__dsh-plugin-game-time.yml` 里的原文（YAML 里单引号里的 `''` 是一个 `'`，别顺手改掉）。
- 标题：`super0plant/dsh-plugin-game-time: drop the access-check note`（同样不带 `#`）。
- 正文：

```markdown
The access check now exists. Since 0.16.3 every `/api/game-time/*` route calls `ctx.connection.requestRejection(req)` before it reads a path or a body and answers 401/403 on a failed Host/Origin or browser-authentication check; it is published on npm as `dsh-plugin-game-time@0.16.3` (commit `<填 0.16.3 的提交短哈希>`). The added sentence no longer describes the code, so this PR removes it from `description.en` and `description.zh` only.
```

