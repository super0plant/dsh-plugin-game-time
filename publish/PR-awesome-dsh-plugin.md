# PR 文案：把 game-time 投进 awesome-dsh-plugin

> 用法：fork `awesome-dsh-plugin/awesome-dsh-plugin`，把同目录的
> `data-plugins-super0plant__dsh-plugin-game-time.yml` 放到仓库的
> `data/plugins/super0plant__dsh-plugin-game-time.yml`，**只加这一个文件**，
> 然后把下面「标题」和「正文」分别粘进 PR 的标题框和描述框。
> 两个 README 是脚本生成的，不要手改。

## 标题

```text
#Add super0plant/dsh-plugin-game-time (fun)
```

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
