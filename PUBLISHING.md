# 发布与分发

目标：用户能直接用一个链接（Git 仓库 / Release 压缩包 / npm 包名）安装插件，也能在 Gitee、GitHub 上看到源码。

## 仓库结构

插件包已经放在仓库根目录（`package.json` 在根），这样 `github:用户/breeze-voice` 能直接解析到包：

```
breeze-voice/
├── package.json        # dsh.bundle.patch + dsh.client
├── cordis.patch.yml
├── index.js            # Host 半
├── client.js           # 浏览器半
├── locale/
├── avatar.png / icon.png
├── README.md
├── LICENSE
└── .gitignore          # 已忽略 settings.json / debug.log / *.tgz
```

> `settings.json` 里是用户自己的 API Key，**已经在 .gitignore 里**，不要提交。

## 一、发布到 GitHub

```bash
cd breeze-voice
git init
git add .
git commit -m "feat: BreezeTTS2 DSH plugin v1.0.0"
git branch -M main
git remote add origin git@github.com:YOUR_NAME/breeze-voice.git
git push -u origin main
```

### 打版本 + Release

```bash
# 1. 改 package.json 的 version，例如 1.0.1
# 2. 重新打包
npm pack --pack-destination dist
# 3. 提交并打 tag
git add package.json
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

在 GitHub 的 Releases 页面新建 `v1.0.1`，把 `dist/local-breeze-voice-1.0.1.tgz` 作为附件上传。
（有 `gh` CLI 的话：`gh release create v1.0.1 dist/*.tgz --title v1.0.1`）

## 二、同步到 Gitee

两种方式，任选：

1. **导入镜像（推荐）**：Gitee → 新建仓库 → 「导入已有仓库」→ 填 GitHub 地址，之后可手动/自动同步；
2. **双远端推送**：

```bash
git remote add gitee git@gitee.com:YOUR_NAME/breeze-voice.git
git push gitee main --tags
```

Gitee 的「发行版」页面上传同一个 `.tgz` 附件。

## 三、用户如何安装

### 方式 A：Git 链接（最方便）

在 DSH 的插件安装入口（或让 Agent 调 `plugin_manager install_bundle`）使用安装标识：

```
github:YOUR_NAME/breeze-voice
github:YOUR_NAME/breeze-voice#v1.0.1        # 锁定版本
git+https://gitee.com/YOUR_NAME/breeze-voice.git
git+https://gitee.com/YOUR_NAME/breeze-voice.git#v1.0.1
```

`install_bundle` 会把标识交给 pnpm 解析；纯 JS 包没有构建步骤，clone 后即可用。

### 方式 B：Release 压缩包

把 `local-breeze-voice-x.y.z.tgz` 的下载地址给用户：

```bash
tar -xzf local-breeze-voice-1.0.1.tgz -C ~/Downloads
# 然后在插件管理页安装 ~/Downloads/package 这个目录
```

### 方式 C：npm（可选）

需要先把 `package.json` 里的 `"private": true` 去掉，并改成公开的包名（例如 `@breezeblue/dsh-breeze-voice`）：

```bash
npm login
npm publish --access public
```

之后用户用包名安装，例如 `@breezeblue/dsh-breeze-voice` 或 `@breezeblue/dsh-breeze-voice@1.0.1`。

## 四、WorkBuddy 技能包

技能的 zip 也建议一起发版：

```bash
zip -r dist/breeze-tts-skill.zip breeze-tts -x '*.DS_Store'
```

- 作为 Release 附件上传，用户下载后到 WorkBuddy 开放平台「技能」上传；
- 或者直接由官方账号在平台上架，用户从技能市场一键安装。

## 五、每次发版的清单

1. 改 `package.json` 的 `version`；
2. `npm pack --pack-destination dist` 验证包内容（`tar -tzf`，确认没有 `settings.json`、`debug.log`、密钥）；
3. `git commit` + `git tag vX.Y.Z` + 推 GitHub / Gitee；
4. 两边 Release 上传 tgz（和技能 zip）；
5. 在 README 顶部更新「安装」里的版本号；
6. 跑一遍：全新安装 → 未填 Key 弹面板 → 填 Key → 余额 → 朗读。

## 注意

- **不要提交密钥**：`settings.json` 已忽略；`.env`、`dist/` 也不要进仓库。
- DSH 的图形化安装页如果只接受本地目录，就把 Release 的 tgz 给用户解压安装；`install_bundle` 支持 Git 标识，两者可以并存。
- 授权用 MIT（已附 `LICENSE`），版权方写的是 `Breeze Blue`，可按需修改。
