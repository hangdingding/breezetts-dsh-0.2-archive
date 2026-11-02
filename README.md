# BreezeTTS for DSH（breezetts-dsh）

DeepSeek Harness 官方 Breeze 语音插件：把助手回复读出来。

优先走 **Breeze CLI**（`breeze` 命令，设备登录、无需粘贴 Key），CLI 不可用时回退到 **Breeze API**（`brz_` Key）。

## 安装

- GitHub：`github:hangdingding/breezetts-dsh`
- 或把本目录安装进 DSH 插件目录

## 第一次连接

打开插件设置 → 「Breeze CLI」卡片 → 点 **连接 Breeze**：

1. 没装 CLI 会自动执行官方安装脚本；
2. CLI 自己打开浏览器，你在浏览器里点授权；
3. 插件轮询到登录成功后显示「已连接」。

CLI 凭据存在 `~/.breeze/credentials.json`，插件不读取、不保存 Key。

引擎可以切换：

| 引擎 | 说明 |
|---|---|
| 自动（默认） | CLI 已登录就优先 CLI，否则用 API |
| CLI 优先 | 只用 CLI，失败不降级 |
| API 优先 | 只用 HTTP API，需要 `brz_` Key |

无浏览器的服务器：用 `breeze login --no-browser`，或者给进程设 `BREEZE_API_KEY`。

## 功能

- 每条回复的朗读按钮，可随时停止；
- 自动朗读开关；
- 音色搜索、试听、立即切换；
- 音色设计（描述 → 3 个预览 → 保存并使用）；
- 语速、语言、发音指导；
- 余额显示、邀请与福利入口。

## 配置

设置面板里可以改：API Key、音色、语速、语言、发音指导、引擎、CLI 路径。其余项在 `cordis.patch.yml`。

## 让模型用语音说话（breeze_speak 工具）

插件注册了一个模型工具 `breeze_speak`：

```
breeze_speak(text, voice_id?, instructions?, speed?)
```

用户说「用大肥鱼机灵版、温柔一点念这段话」时，模型会调用它。插件用 Breeze CLI 合成音频放进待播队列，
回复结束后浏览器自动播放这段定制音频，而不是用默认音色朗读文字。

- 工具没被调用时，行为不变：自动朗读/朗读按钮用设置里的音色；
- 队列是全局的，适合单人使用；多会话并发会按先后顺序播放。
