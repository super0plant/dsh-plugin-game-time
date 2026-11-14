# 发布到 npm（维护者操作手册）

> 目标：让 `dsh plugin add dsh-plugin-game-time` 直接可用，并让 DSH 的市场/插件管理器能按版本收录与升级。

## 一、发布前 30 秒自检

```powershell
cd C:\Users\10601\Documents\deepseek-harness\default-workspace\plugins\game-time
npm test                 # 四套测试，退出码必须是 0
node scripts/build.mjs   # 出 dist\dsh-plugin-game-time-<版本>.zip
npm pack --dry-run       # 看清单：约 30 个文件、< 400 KB
```

确认 `package.json` 里这几项（现在是齐的）：

| 字段 | 期望 |
|---|---|
| `name` | `dsh-plugin-game-time`（未被占用，已确认 404） |
| `version` | 与 `client.js` 的 `VERSION` 一致 |
| `repository` | 指回 GitHub |
| `license` | MIT |
| `files` | 不含 `standalone`、不含 `tests` |

## 二、登录（二选一）

### 方案 A：浏览器登录（推荐，一次性）

在**你自己的终端**里：

```powershell
npm login
```

会依次问：

```
Username: <你的 npm 用户名>
Password: <密码，输入时不显示>
Email: (this IS public) <邮箱>
```

然后浏览器会自动打开授权页，点 **Authorize**；终端出现 `Logged in as <用户名> on https://registry.npmjs.org/.` 即可。

验证：

```powershell
npm whoami
```

> 若开了 2FA，发布时要带一次性密码：`npm publish --otp=123456`。

### 方案 B：Access Token（免浏览器，适合以后自动化）

1. 打开 <https://www.npmjs.com/settings/~/tokens> → **Generate New Token** → 选 **Automation**（Read and write）
2. 复制 `npm_` 开头的 token（只显示一次）
3. 在终端里设置（**不要写进文件**）：

```powershell
$env:NPM_TOKEN = "npm_xxxxxxxx"
```

4. 告诉我 token 已设置，我用它发布（不会回显、不落盘）

## 三、发布

```powershell
cd plugins\game-time
npm publish
```

- 未加 scope 的包默认 public，不需要 `--access public`
- 成功输出类似：`+ dsh-plugin-game-time@0.15.0`

发布后立刻验证：

```powershell
npm view dsh-plugin-game-time version    # 应输出 0.15.0
npm view dsh-plugin-game-time dist.tarball
```

再装一次验证（不会碰你的 profile）：

```powershell
npm install --prefix $env:TEMP\gt-install --no-save dsh-plugin-game-time@0.15.0
```

## 四、常见错误对照

| 报错 | 原因 | 处理 |
|---|---|---|
| `ENEEDAUTH` | 没登录 | 走方案 A 或 B |
| `E402 Payment Required` | 账号需要先验证邮箱/开通 | 去 npm 邮箱验证 |
| `E409 Conflict` / `403 Forbidden` | 版本已存在或包名被占 | 升版本号；查 `npm view <name>` |
| `OTP required` / `EOTP` | 开了 2FA | `npm publish --otp=六位数字` |
| `EPUBLISHCONFLICT` | 同版本重复发布 | `npm version patch` 后重发 |
| `E404` 安装失败 | 刚发布，CDN 还没生效 | 等 1–2 分钟重试 |

## 五、发布之后

1. **GitHub Release**：本次发版照旧打 tag + 挂 zip（GitHub 与 npm 两条渠道并存，zip 仍是离线安装入口）
2. **README 徽章**（可选）：加 `npm` 版本/下载量徽章
3. **市场收录**：DSH 的市场索引若从 npm 抓取，收录需要时间；可在 DSH 的插件市场里搜一次确认
4. **升级路径**：用户以后用 DSH 的插件管理器即可升级，不再手动换 zip

## 六、需要知道的代价

- 包一旦公开，**任何人都能下载/反编译**（本来也是 MIT 开源）
- 发出去的版本**不能真正删除**：72 小时内可 `npm unpublish dsh-plugin-game-time@x.y.z`，之后只能 `npm deprecate` 标记
- 每次改代码都要**升版本号**才能再发（同版本会被拒）
- npm 账号泄露 = 别人可以发你的包：务必开 2FA

## 七、以后自动化（可选）

配置 GitHub Actions，打 tag 时自动发布：

```yaml
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }
      - run: npm test
      - run: npm publish
        env: { NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} }
```

需要先在 GitHub 仓库的 Secrets 里加 `NPM_TOKEN`。
