/**
 * Browser half of the Breeze voice bundle.
 *
 * Adds one avatar-faced button to the finalized-assistant action strip and a
 * small "now playing" chip below the composer. The button takes the reply text
 * from the live Chat snapshot, splits it into request-sized chunks, asks the
 * Host route for each piece of audio, and plays them in order, so the TTS
 * credential and endpoint stay on the Host.
 */

window.__ModuleLoader__.load({
  id: 'breezetts-dsh',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'breezettsDsh';
    /** Bound in apply; used by root-scoped components that receive no `t` prop. */
    let translate = (key) => key;
    const SPEAK_ROUTE = '/breezetts-dsh/speak';
    const VOICE_ROUTE = '/breezetts-dsh/voice';
    const AVATAR_ROUTE = '/breezetts-dsh/avatar';
    /** Bumped when the bundled portrait changes, so browsers drop the old image. */
    /** Bundled portrait, inlined so it renders even if the route or cache misbehaves. */
    const AVATAR_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAIcklEQVR42u3dSYikZwGA4beXjHGJJrgQRQUVRFARjOOG6E0xgoogbnhyI+J28CAKLqDgQUXFHcRL3D1E0eCCetBEg/uSk0gSF9wQg4mYzPTiob5iijaZ6e7o6PT3PND0Uunqmj//9/7fv1RVAQAAAAAAAAAAAAAAAOeEtUn/3V+u7lntrCyDrerO1SeqD1Ub1fbt/P7ytkurt1a3jp/dlu3q/Orr1Zuq9fF3b8vytuPVh8f97vf/09b4O++tPnWGxw9VbU76735ydcHt3PadfQy65W33HYN1P35/gPu9sLrkkP+2h0wedwTgjP5R3bXa3TMD2Kz+eYD7OTG22NunmQEc5n53Vj7W9/k7y79zi9UaATi99fGxGoDlzw6y5VxbuZ/1M/yttUM8xg4QgMP+HSa2bhGAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAPC/4dmACAAgAIAAAAIACAAgACAAFgEIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAPxfrUPWo3PUpkXAHbRjEQgA55aNart6efWa6sT42UGsVbdWN1e/ri6rTo6f7+5jvdsdjwEB4CxbG5/vWz38P3B/j6peOwKwH1t71sEdMwnHADj7ToyBd2JlEB7kY2tsxW/cx1Z/GZ0LqjdUT1iJwc6YgVgfzQA4yzOB9e7Ygbz1A+4+bFRvq45VP6yuqD5ZXb/nMdk9MAPgCNqt/jI+P6Z6e/Xz6vLqiSvHBtasnwLA0Z15ro2BvjV2C15UXVV9rbp0hGC5a7BmkQkAR3P923tG4KnVV0YIHjt+vtvBz1IgAJxDxyKWA3x7bPmfWl1dfay6ePx83WxAADjalmcDtsfXL6t+NHYRdswGBIB5QtA4RnC/FgcJP1Pda8TBGSwBYAKrxwieV11TPWWEYdMugQAwzzGCrerB1TdbXHm4tXI7AsAEs4Gdsd6+t/rI+HrXuiwAzLXOblWvqL5Y3XklDAgAE+wSbLZ48tEzqq9WF4qAADCX88ZM4MkjAheJgAAw33GBk9XjWjyx6NjKLAEBYJKZwMkxE/h0pw4KioAAMFkEnlN9oFNXEiIATBaBV46P5cVCCAATHRPYbnGdwBNGBMwEBIBJrI2P81q80tCFuVBIAJhuvd6qHjSOB+zkgKAAMN2uwFaLpxE/NwcFBYAp1++d6v0tnkZsV0AAmDAAF1dvtisgAMxnYwz8l1cPy6XCAsBUlm9VdqfqneNrswABYMJZwDOrx+eAoAAwneWW/y0r3wuARcBks4CnVcc79aYjAgCTWJ4FuMyiEADmnAXU4hmD9+nUexAKAExgrcXVgfeoXrAnCgIAk0RgdwRg+QalAgCT7QYcrx7Z5G81JgDMaPlGo09fmRUIAEy0G1B16fi8IwAw33p/SYsnCgkATDYD2KnuWj1aCWE+y63+kwQA5j0OcFwAYN4APHTsCggATBiA+1QPEACYLwC71fktXj1YAGAyywOBjxAAmNcDBQDmPQ5wfwGAed1bAGDeGcDFAgDzursAwLwzgLsIAMxrVwBg3oF/iwDAvG4UAJh3BvAHAQAzAAGACWcANwgAzEsAYOL1/1oBgPmm/2vVrdVvBQDm3P//U3W9AMCcAfhVdbMAwJwB+N7MC0EAmH3dv9pCgPm2/uvVP6qfCgDMZflioD9ucRnwugDAfPv/V84+DgSAGQf/RrVdfWVPEAQAJpn+f7/6xRgD2wIA88wA1qrPGQMCwJzT/xurz+6ZEQgAHHHbY+v/hRaXAG8IAMy1vu9WH7IoBID5tv7r1TeqnzT5wT8BYDbL9wB4657vBQAm2fp/qcWTfzZs/QWAOSxP+52s3mRxCABzbv0/WP3S1l8AmMfOGPC/q9421vcdi0UAmCcAa9WrW1z8s9bE1/0LALNN/Tery6srxtem/gLARFP/G6rX5Jy/ADCN3fGxVb2w+pup/+3btAg4olP/l7Z4vb/NEQPMADjitsaAf3f1cYNfAJhv8F9RvT7n+wWAaZwcg//b1fM7db7ffr8AMMGW/7zqqupZLd7rL4NfAJhn2v/t6tLqplztJwAcebsrg/+LY/D/3eAXAI6+5QDfrN5XPbu6xeAXAOaY8i8H+quq143v1wz+w3EhEOfKVn93rK/XVS8Z+/0bOdpvBnCO8BJUd2yrv9HiiT2PH4N/+eQeg18AOIK2V2apv2lxfv/F1Z9HDFzhJwAc0YG/fDbfdotX8rmkxRt5bIyZlCv8HAPgCNkdg3451a/F6b13VD8Y37u0VwA4goN+ObiXA//K6j3VN1du2zH4BYCjNc1fWxn0N40t/ker7+7ZPTXwBYAjZL269/j6mhbv0/f5Fq/es7zdfr4AnJXp5/I14xvfH/Sc8u7K793eab7D3O/q7x30vz/s4z/MhTQ7ez6f6W/V4pl7b6y+Vf145faNPbsFCMB/zfn9+xmQYysr4n6dN+7ndGdTjh1iWa/v4377Dzz+Y+NvHLsDW/Oqux3gd26u3rVnHbSPLwBn1c+qi/bMAJYvJfXHPVus023N/trizSa2TjPwlqe0rjvA47tp3O/2yiA704VEyyfH/OkAj/8P1bUrj/+gs5Tt6sS4j5MHXO92x+87nw8AAAAAAAAAAAAAAABwJv8CKM2ST3Mkkd8AAAAASUVORK5CYII=';
    /** Breeze rejects single requests above 1000 characters by default. */
    const CHUNK_LIMIT = 800;
    /** Bumped on every delivery so the Host log identifies the running page. */
    const CLIENT_VERSION = '36';
    const STREAM_ROUTE = '/breezetts-dsh/stream';
    const CONFIG_ROUTE = '/breezetts-dsh/config';
    const VOICES_ROUTE = '/breezetts-dsh/voices';
    const PREVIEW_ROUTE = '/breezetts-dsh/preview';
    const BALANCE_ROUTE = '/breezetts-dsh/balance';
    const CLI_STATUS_ROUTE = '/breezetts-dsh/cli/status';
    const CLI_LOGIN_ROUTE = '/breezetts-dsh/cli/login';
    const CLI_INSTALL_ROUTE = '/breezetts-dsh/cli/install';
    const CLI_LOGOUT_ROUTE = '/breezetts-dsh/cli/logout';
    const CLIP_TAKE_ROUTE = '/breezetts-dsh/clip/take';
    const CLIP_GET_ROUTE = '/breezetts-dsh/clip/get';
    const DESIGN_ROUTE = '/breezetts-dsh/design';
    const DESIGN_AUDIO_ROUTE = '/breezetts-dsh/design/audio';
    const DESIGN_SAVE_ROUTE = '/breezetts-dsh/design/save';
    const API_KEYS_URL = 'https://breezeblue.ai/app/developer/api-keys?code=GH3HVA';
    const PROMO_CODE = 'BREEZEBLUE';
    const PROMO_URL = 'https://breezeblue.ai/zh/app/subscription?gift=BREEZEBLUE';
    const DEBUG_ROUTE = '/breezetts-dsh/debug';
    const REQUEST_TIMEOUT_MS = 120000;

    const zh = {
      'action.speak': '朗读这条回复',
      'action.loading': '正在合成语音',
      'action.stop': '停止朗读',
      'action.empty': '这条回复没有可朗读的文字',
      'player.playing': '正在朗读',
      'player.voice': 'Breeze 语音',
      'auto.label': '自动朗读',
      'auto.hint': '每条新回复生成完就自动朗读',
      'settings.open': '打开 Breeze 设置',
      'settings.title': 'BreezeTTS2',
      'settings.close': '关闭',
      'settings.loadFailed': '读取配置失败',
      'cliHelp.title': 'Breeze CLI 能做什么',
      'cliHelp.read': '朗读：任意文字转语音，可指定音色、语速与情绪。',
      'cliHelp.voices': '音色：搜索、试听、描述生成（设计音色）与样本克隆。',
      'cliHelp.control': '控制：instructions 描述情绪与重音，speed 支持 0.5–2.0。',
      'cliHelp.auto': '自动朗读开启后，助手每条回复都会用当前音色念出来。',
      'cliHelp.hint': '想换音色：在下面搜索并「使用」，或在「设计音色」里生成一个。',

      'settings.voiceLoading': '正在读取音色信息…',
      'cli.keyAuto': '已通过 Breeze CLI 登录，Key 已自动填入',
      'cli.desc': '用 Breeze 账号一键登录：自动安装 CLI、打开浏览器授权，登录后不需要填写 API Key。',
      'cli.signout': '退出登录',
      'cli.signedOut': '已退出 Breeze CLI 登录',
      'cli.title': 'Breeze CLI',
      'cli.notInstalled': '未安装 CLI',
      'cli.notLoggedIn': '已安装，未登录',
      'cli.loggedIn': '已连接',
      'cli.connect': '连接 Breeze',
      'cli.installConnect': '安装并连接',
      'cli.connected': '已连接',
      'cli.working': '处理中…',
      'cli.starting': '正在启动登录…',
      'cli.installing': '正在安装 Breeze CLI…',
      'cli.browser': '已打开浏览器，请在浏览器里完成授权',
      'cli.waiting': '等待授权…',
      'cli.timeout': '等待超时，请重试',
      'cli.failed': '操作失败',
      'cli.engineAuto': '自动',
      'cli.engineCli': 'CLI 优先',
      'cli.engineHttp': 'API 优先',
      'settings.key': 'API Key',
      'settings.keySaved': '已保存；留空表示不修改',
      'settings.keyMissing': '还没有填写，粘贴 brz_ 开头的密钥',
      'settings.voice': '音色',
      'settings.search': '搜索音色（名称或描述）',
      'settings.searching': '搜索中…',
      'settings.empty': '没有找到音色',
      'settings.preview': '试听',
      'settings.stop': '停止',
      'settings.use': '使用',
      'settings.selected': '已选',
      'settings.speed': '语速',
      'settings.save': '保存',
      'settings.saving': '保存中…',
      'settings.saved': '已保存',
      'settings.balance': '余额',
      'design.new': '设计音色',
      'design.sub': '用一句话描述你想要的音色，Breeze 会生成 3 个候选供你试听',
      'design.pick': '选择一个音色',
      'design.voice': '音色',
      'design.title': '设计音色',
      'design.name': '音色名称',
      'design.desc': '音色描述',
      'design.descPlaceholder': '例如：温暖低沉的女声，语速从容，带一点沙哑',
      'design.sample': '试听台词（可选）',
      'design.samplePlaceholder': '例如：你好，很高兴认识你。',
      'design.generate': '生成 3 个预览',
      'design.generating': '生成中…',
      'design.preview': '试听',
      'design.stop': '停止',
      'design.namePlaceholder': '音色名称，例如：我的旁白音',
      'design.save': '保存并使用',
      'design.saving': '保存中…',
      'design.close': '关闭',
      'design.select': '先选一个预览',
      'design.saved': '新音色已保存并启用',
      'design.failed': '操作失败，请重试',
      'settings.signout': '退出登录',
      'settings.signedOut': '已退出登录，可以换账号了',
      'settings.failed': '保存失败',
      'promo.tag': '官方福利',
      'promo.giftSub': '填写 Key 后可领红包积分，口令 BREEZEBLUE',
      'promo.loginSub': '登录后自动创建官方 API Key，并领取新人积分',
      'promo.title': '1000–10000 积分免费送',
      'promo.sub': '登录 Breeze 控制台创建 API Key，粘贴到左侧领取福利',
      'promo.copy': '复制',
      'promo.copied': '已复制',
      'promo.login': '登录获取官方 Key 和免费积分',
      'promo.redeem': '去领取',
      'invite.title': '邀请朋友，双方得积分',
      'invite.sub': '把 Breeze 语音分享给朋友，好友注册后你也能拿到奖励积分',
      'invite.copy': '复制邀请文案',
      'invite.copied': '已复制，去粘贴给朋友',
      'invite.open': '打开邀请页',
      'invite.shareText': '我在用 BreezeTTS2 语音插件，Breeze 注册就送 1000–10000 积分（兑换码 BREEZEBLUE）：{url}',
      'error.failed': '朗读失败',
      'error.network': '无法连接本地语音服务',
      'error.emptyAudio': '语音服务没有返回音频',
      'error.timeout': '合成超时，请重试',
      'error.needKey': '请先登录 Breeze，或填入 API Key',
    };
    const en = {
      'action.speak': 'Read this reply aloud',
      'action.loading': 'Synthesizing audio',
      'action.stop': 'Stop reading',
      'action.empty': 'This reply has no readable text',
      'player.playing': 'Reading aloud',
      'player.voice': 'Breeze voice',
      'auto.label': 'Auto-read',
      'auto.hint': 'Read every new reply automatically',
      'settings.open': 'Open Breeze settings',
      'settings.title': 'BreezeTTS2',
      'settings.close': 'Close',
      'settings.loadFailed': 'Could not load settings',
      'cliHelp.title': 'What Breeze CLI can do',
      'cliHelp.read': 'Read aloud: any text to speech with a chosen voice, speed and emotion.',
      'cliHelp.voices': 'Voices: search, preview, design from a description, or clone from a sample.',
      'cliHelp.control': 'Control: instructions set emotion and stress; speed ranges 0.5–2.0.',
      'cliHelp.auto': 'With auto-read on, every assistant reply is spoken in the current voice.',
      'cliHelp.hint': 'To change voices, search below and press Use, or design one.',

      'settings.voiceLoading': 'Loading voice details…',
      'cli.keyAuto': 'Signed in through Breeze CLI — key imported automatically',
      'cli.desc': 'One-click sign-in with your Breeze account: installs the CLI, opens the browser, and needs no API key afterwards.',
      'cli.signout': 'Sign out',
      'cli.signedOut': 'Signed out of Breeze CLI',
      'cli.title': 'Breeze CLI',
      'cli.notInstalled': 'CLI not installed',
      'cli.notLoggedIn': 'Installed, not signed in',
      'cli.loggedIn': 'Connected',
      'cli.connect': 'Connect Breeze',
      'cli.installConnect': 'Install and connect',
      'cli.connected': 'Connected',
      'cli.working': 'Working…',
      'cli.starting': 'Starting sign-in…',
      'cli.installing': 'Installing Breeze CLI…',
      'cli.browser': 'Browser opened — finish authorization there',
      'cli.waiting': 'Waiting for authorization…',
      'cli.timeout': 'Timed out, please retry',
      'cli.failed': 'Something went wrong',
      'cli.engineAuto': 'Auto',
      'cli.engineCli': 'CLI first',
      'cli.engineHttp': 'API first',
      'settings.key': 'API Key',
      'settings.keySaved': 'Saved; leave empty to keep it',
      'settings.keyMissing': 'Not set — paste the brz_ key',
      'settings.voice': 'Voice',
      'settings.search': 'Search voices by name or description',
      'settings.searching': 'Searching…',
      'settings.empty': 'No voices found',
      'settings.preview': 'Preview',
      'settings.stop': 'Stop',
      'settings.use': 'Use',
      'settings.selected': 'Selected',
      'settings.speed': 'Speed',
      'settings.save': 'Save',
      'settings.saving': 'Saving…',
      'settings.saved': 'Saved',
      'settings.balance': 'Balance',
      'design.new': 'Design a voice',
      'design.sub': 'Describe the voice you want; Breeze generates three candidates to audition',
      'design.pick': 'Pick a voice',
      'design.voice': 'Voice',
      'design.title': 'Design a voice',
      'design.name': 'Voice name',
      'design.desc': 'Voice description',
      'design.descPlaceholder': 'e.g. warm low female voice, calm pacing, slightly husky',
      'design.sample': 'Preview line (optional)',
      'design.samplePlaceholder': 'e.g. Hello, nice to meet you.',
      'design.generate': 'Generate 3 previews',
      'design.generating': 'Generating…',
      'design.preview': 'Preview',
      'design.stop': 'Stop',
      'design.namePlaceholder': 'Voice name, e.g. My narration voice',
      'design.save': 'Save and use',
      'design.saving': 'Saving…',
      'design.close': 'Close',
      'design.select': 'Pick a preview first',
      'design.saved': 'New voice saved and activated',
      'design.failed': 'Something went wrong; try again',
      'settings.signout': 'Sign out',
      'settings.signedOut': 'Signed out — you can switch accounts now',
      'settings.failed': 'Could not save',
      'promo.tag': 'Official offer',
      'promo.giftSub': 'Add a key to claim bonus credits — code BREEZEBLUE',
      'promo.loginSub': 'Sign in to create an official API key and claim the new-user credits',
      'promo.title': '1,000–10,000 free credits',
      'promo.sub': 'Sign in to the Breeze console, create a key, paste it here',
      'promo.copy': 'Copy',
      'promo.copied': 'Copied',
      'promo.login': 'Sign in for an official key and free credits',
      'promo.redeem': 'Claim',
      'invite.title': 'Invite a friend, both get credits',
      'invite.sub': 'Share Breeze Voice with a friend — you earn reward credits when they sign up',
      'invite.copy': 'Copy invite message',
      'invite.copied': 'Copied — paste it to a friend',
      'invite.open': 'Open invite page',
      'invite.shareText': 'I use the BreezeTTS2 voice plugin. Breeze gives 1,000–10,000 free credits on signup (code BREEZEBLUE): {url}',
      'error.failed': 'Could not read aloud',
      'error.network': 'Cannot reach the local voice service',
      'error.emptyAudio': 'The voice service returned no audio',
      'error.timeout': 'Synthesis timed out; try again',
      'error.needKey': 'Sign in to Breeze or add an API key first',
    };

    const CSS = [
      '.bv_action{width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;justify-content:center;align-items:center;padding:6px;display:inline-flex}',
      '.bv_action svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px))}',
      '.bv_action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.bv_action:disabled{cursor:default;opacity:.4}',
      '.bv_action[data-active]{color:var(--dsw-alias-state-business-primary)}',
      '.bv_action:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
      '.bv_action[data-failed]{color:var(--dsw-alias-state-error-primary)}',
      '.bv_avatar{display:inline-block;border-radius:50%;object-fit:cover;flex:none;vertical-align:middle}',
      '.bv_monogram{display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3f7ad6,#2bb3a3);color:#fff;font-weight:600;line-height:1;letter-spacing:0}',
      '.bv_player{display:flex;align-self:center;align-items:center;gap:10px;box-sizing:border-box;width:100%;max-width:560px;margin:6px auto 0;padding:7px 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}',
      '.bv_meta{display:flex;flex-direction:column;flex:1;min-width:0;gap:1px}',
      '.bv_name{color:var(--dsw-alias-label-primary);font-size:13px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bv_state{color:var(--dsw-alias-label-caption);font-size:12px;line-height:16px}',
      '.bv_stop{width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer}',
      '.bv_stop:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.bv_stop svg{width:15px;height:15px}',
      '.bv_stop:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
      '.bv_bar{display:flex;justify-content:center;align-items:center;gap:8px;margin:6px auto 0}',
      '.bv_auto{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;background:0 0;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:12px;line-height:18px;cursor:pointer}',
      '.bv_auto:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.bv_auto[aria-checked="true"]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-secondary)}',
      '.bv_auto:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
      '.bv_autoDot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-border-l3);flex:none}',
      '.bv_autoDot[data-on]{background:var(--dsw-alias-state-business-primary)}',
      '.bv_overlay{position:fixed;inset:0;z-index:1000;pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}',
      '.bv_panel{box-sizing:border-box;width:min(600px,100%);max-height:min(680px,calc(100vh - 48px));overflow:auto;padding:18px 20px 20px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-panel);background:var(--dsw-alias-bg-layer-1);box-shadow:0 18px 48px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:14px}',
      '.bv_panelHead{display:flex;align-items:center;justify-content:space-between;gap:12px}',
      '.bv_panelTitle{font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.bv_close{width:28px;height:28px;border:none;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-tertiary);font-size:18px;line-height:1;cursor:pointer}',
      '.bv_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.bv_panelBody{display:flex;flex-direction:column;gap:16px}',
      '.bv_field{display:flex;flex-direction:column;gap:8px}',
      '.bv_fieldLabel{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary)}',
      '.bv_input{box-sizing:border-box;width:100%;height:36px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2,transparent);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none}',
      '.bv_input:focus{border-color:var(--dsw-alias-state-business-primary)}',
      '.bv_hint{font-size:12px;color:var(--dsw-alias-label-caption)}',
      '.bv_current{display:flex;align-items:center;gap:10px;padding:10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2,transparent)}',
      '.bv_currentBody{display:flex;flex-direction:column;flex:1;min-width:0;gap:2px}',
      '.bv_currentName{font-size:13px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bv_currentDesc{font-size:12px;color:var(--dsw-alias-label-caption);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bv_list{display:flex;flex-direction:column;gap:2px;max-height:240px;overflow:auto}',
      '.bv_item{display:flex;align-items:center;gap:10px;padding:6px 4px;border-radius:var(--dsw-radius-md)}',
      '.bv_item:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.bv_itemBody{display:flex;flex-direction:column;flex:1;min-width:0;gap:1px}',
      '.bv_itemName{font-size:13px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bv_itemDesc{font-size:12px;color:var(--dsw-alias-label-caption);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.bv_btn{height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:12px;cursor:pointer;flex:none}',
      '.bv_btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
      '.bv_btn:disabled{opacity:.5;cursor:default}',
      '.bv_link{border:none;background:0 0;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:12px;cursor:pointer;padding:0 4px;flex:none}',
      '.bv_link:hover{color:var(--dsw-alias-label-primary)}',
      '.bv_range{width:100%;accent-color:var(--dsw-alias-state-business-primary)}',
      '.bv_footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:4px}',
      '.bv_footerActions{display:flex;align-items:center;gap:8px}',
      '.bv_cancel{height:34px;padding:0 18px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:0 0;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;cursor:pointer}',
      '.bv_cancel:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.bv_cliCard{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:.5px solid rgba(63,122,214,.35);border-radius:12px;background:linear-gradient(135deg,rgba(63,122,214,.10),rgba(43,179,163,.10))}',
      '.bv_cliDone{display:flex;align-items:center;gap:6px;height:34px;font-size:13px;color:var(--dsw-alias-label-secondary)}',
      '.bv_dot{width:7px;height:7px;border-radius:50%;background:#34c759;box-shadow:0 0 0 3px rgba(52,199,89,.15)}',
      '.bv_cliHelp{display:flex;flex-direction:column;gap:6px;padding:2px 2px 0}',
      '.bv_cliHelpList{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px}',
      '.bv_cliHelpList li{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}',
      '.bv_cliHead{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.bv_cliTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.bv_cliState{font-size:12px;color:var(--dsw-alias-label-caption);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.bv_cliActions{display:flex;align-items:center;gap:8px}',
      '.bv_select{height:30px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px}',
      '.bv_cliBtn{height:30px;padding:0 14px;font-size:12px}',
      '.bv_status{font-size:12px;color:var(--dsw-alias-label-caption);flex:1;min-width:0}',
      '.bv_primary{height:34px;padding:0 16px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer}',
      '.bv_primary:disabled{opacity:.6;cursor:default}',
      '.bv_muted{font-size:12px;color:var(--dsw-alias-label-caption)}',
      '.bv_signinActions{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}',
      '.bv_invite{position:relative;display:flex;align-items:center;gap:14px;box-sizing:border-box;padding:14px 16px;border-radius:var(--dsw-radius-lg);background:linear-gradient(120deg,#6d5ef0 0%,#e0649a 100%);color:#fff;overflow:hidden}',
      '.bv_invite::after{content:"";position:absolute;left:-40px;bottom:-60px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.10);pointer-events:none}',
      '.bv_inviteBody{display:flex;flex-direction:column;gap:5px;flex:1;min-width:0}',
      '.bv_inviteTitle{font-size:16px;font-weight:600;line-height:22px}',
      '.bv_inviteSub{font-size:12px;line-height:18px;opacity:.9}',
      '.bv_inviteActions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:4px}',
      '.bv_inviteArt{width:104px;height:84px;flex:none;display:block}',
      '.bv_inviteBtn{height:30px;padding:0 12px;border:none;border-radius:999px;background:rgba(255,255,255,.2);color:#fff;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer}',
      '.bv_inviteBtn:hover{background:rgba(255,255,255,.3)}',
      '.bv_inviteLink{display:inline-flex;align-items:center;height:30px;padding:0 14px;border-radius:999px;background:#fff;color:#6a39a8;font-size:12px;font-weight:600;text-decoration:none}',
      '@media (max-width:520px){.bv_inviteArt{display:none}}',
      '.bv_keyRow{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}',
      '.bv_keyField{flex:1 1 240px;min-width:0}',
      '.bv_keyInputRow{display:flex;align-items:center;gap:8px}',
      '.bv_fieldHead{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.bv_designBtn{display:inline-flex;align-items:center;height:28px;padding:0 12px;border:none;border-radius:999px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-family:inherit;font-size:12px;font-weight:600;cursor:pointer}',
      '.bv_designBtn:hover{opacity:.9}',
      '.bv_designLayer{position:fixed;inset:0;z-index:1001;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-bg-mask-1)}',
      '.bv_designCard{box-sizing:border-box;width:min(560px,100%);max-height:calc(100vh - 48px);overflow:auto;display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:20px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 24px 64px rgba(0,0,0,.18)}',
      '.bv_designHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}',
      '.bv_designTitle{font-size:20px;font-weight:600;line-height:28px;color:var(--dsw-alias-label-primary)}',
      '.bv_designClose{width:32px;height:32px;margin-top:-4px;border:none;border-radius:50%;background:0 0;color:var(--dsw-alias-label-tertiary);font-size:20px;line-height:1;cursor:pointer}',
      '.bv_designClose:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.bv_designSub{margin-top:-10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-caption)}',
      '.bv_designField{position:relative;display:flex;flex-direction:column;gap:8px}',
      '.bv_designLabel{font-size:14px;font-weight:500;color:var(--dsw-alias-label-primary)}',
      '.bv_designTextarea,.bv_designInput{box-sizing:border-box;width:100%;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:14px;line-height:22px;outline:none;transition:border-color .12s,box-shadow .12s}',
      '.bv_designTextarea{min-height:104px;resize:vertical}',
      '.bv_designTextarea:focus,.bv_designInput:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}',
      '.bv_designTextarea::placeholder,.bv_designInput::placeholder{color:var(--dsw-alias-label-secondary);opacity:.75}',
      '.bv_designCount{position:absolute;right:12px;bottom:8px;font-size:11px;color:var(--dsw-alias-label-caption)}',
      '.bv_designActions{display:flex;justify-content:flex-end;gap:10px;margin-top:2px}',
      '.bv_designPrimary{height:40px;padding:0 24px;border:none;border-radius:999px;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}',
      '.bv_designPrimary:disabled{opacity:.4;cursor:default}',
      '.bv_designNote{font-size:12px;color:var(--dsw-alias-label-caption)}',
      '.bv_designResults{display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:.5px solid var(--dsw-alias-border-l4)}',
      '.bv_previewList{display:flex;flex-direction:column;gap:8px}',
      '.bv_previewRow{display:flex;align-items:center;gap:10px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l4);border-radius:12px;cursor:pointer}',
      '.bv_previewRow[data-selected]{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}',
      '.bv_previewRadio{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l3);flex:none}',
      '.bv_previewRadio[data-selected]{border-color:var(--dsw-alias-state-business-primary);background:radial-gradient(circle,var(--dsw-alias-state-business-primary) 0 4px,transparent 5px)}',
      '.bv_previewName{flex:1;font-size:14px;color:var(--dsw-alias-label-primary)}',
      '.bv_previewMeta{font-size:12px;color:var(--dsw-alias-label-caption)}',
      '.bv_saveKey{flex:none;height:36px;padding:0 14px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer}',
      '.bv_saveKey:disabled{opacity:.6;cursor:default}',
      '.bv_promo{position:relative;flex:1 1 250px;max-width:300px;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;padding:12px 14px;border-radius:var(--dsw-radius-lg);background:linear-gradient(135deg,#3f7ad6 0%,#2bb3a3 100%);color:#fff;overflow:hidden}',
      '.bv_promo::after{content:"";position:absolute;right:-36px;top:-52px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.14);pointer-events:none}',
      '.bv_promoTag{display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:.04em;opacity:.92}',
      '.bv_promoTag svg{width:13px;height:13px}',
      '.bv_promoTitle{font-size:16px;font-weight:600;line-height:22px}',
      '.bv_promoSub{font-size:12px;line-height:18px;opacity:.86}',
      '.bv_promoActions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:4px}',
      '.bv_promoCode{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border:none;border-radius:999px;background:rgba(255,255,255,.18);color:#fff;font-family:inherit;font-size:12px;font-weight:600;letter-spacing:.06em;cursor:pointer}',
      '.bv_promoCode:hover{background:rgba(255,255,255,.28)}',
      '.bv_promoCopy{font-weight:400;letter-spacing:0;opacity:.85}',
      '.bv_promoLink{display:inline-flex;align-items:center;height:32px;padding:0 14px;border:none;border-radius:999px;background:#fff;color:#1f5fb8;font-family:inherit;font-size:12px;font-weight:600;text-decoration:none;cursor:pointer}',
      '.bv_promoLink:hover{background:#eef6ff}',
      '@media (max-width:560px){.bv_promo{max-width:none}}',
      '.bv_spin{animation:bv-spin 1s linear infinite}',
      '@keyframes bv-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.bv_spin{animation:none}}',
    ].join('\n');

    /**
     * Keep the reply text from the final Assistant node of one message.
     * @param snapshot - Chat snapshot from the `useChat` hook.
     * @param messageId - the finalized message identity handed to the slot.
     * @returns the concatenated text blocks, or an empty string.
     */
    function replyTextOf(snapshot, messageId) {
      try {
        const turns = snapshot && snapshot.timeline ? snapshot.timeline.turns : undefined;
        if (turns && typeof turns.values === 'function') {
          for (const turn of turns.values()) {
            const tail = turn && turn.data && typeof turn.data.get === 'function'
              ? turn.data.get('turn-tail')
              : undefined;
            const closing = tail ? tail.closing : undefined;
            if (closing && closing.finalNode && closing.finalNode.messageId === messageId) {
              const text = joinTextBlocks(closing.blocks);
              if (text !== '') return text;
            }
            const steps = turn ? turn.steps : undefined;
            if (Array.isArray(steps)) {
              for (let index = steps.length - 1; index >= 0; index -= 1) {
                const step = steps[index];
                const data = step && step.data && typeof step.data.get === 'function'
                  ? step.data.get('assistant-step')
                  : undefined;
                if (data && data.finalNode && data.finalNode.messageId === messageId) {
                  const text = joinTextBlocks(data.blocks);
                  if (text !== '') return text;
                }
              }
            }
          }
        }
        const nodes = snapshot ? snapshot.nodes : undefined;
        if (nodes && typeof nodes.values === 'function') {
          for (const node of nodes.values()) {
            const data = node && node.kind === 'assistant-step' ? node.data : undefined;
            if (data && data.finalNode && data.finalNode.messageId === messageId) {
              const text = joinTextBlocks(data.blocks);
              if (text !== '') return text;
            }
          }
        }
      } catch {
        // A different Chat snapshot generation must not break the action strip.
      }
      return '';
    }

    /**
     * Join the plain text blocks of one Assistant message.
     * @param blocks - Assistant content blocks.
     * @returns the joined text.
     */
    function joinTextBlocks(blocks) {
      if (!Array.isArray(blocks)) return '';
      const parts = [];
      for (const block of blocks) {
        if (block && block.kind === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
          parts.push(block.text);
        }
      }
      return parts.join('\n\n');
    }

    /**
     * Drop markup that should not be spoken: code, tables, links, emphasis.
     * @param text - raw Markdown reply text.
     * @returns speakable plain text.
     */
    function speakable(text) {
      return String(text ?? '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/~~~[\s\S]*?~~~/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')
        .replace(/^\s{0,3}>\s?/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\|.*\|\s*$/gm, ' ')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    /**
     * Split text into request-sized pieces at sentence or paragraph boundaries.
     * @param text - speakable text.
     * @param limit - maximum characters per piece.
     * @returns the ordered pieces.
     */
    function chunkText(text, limit) {
      const chunks = [];
      let rest = String(text ?? '').trim();
      const marks = ['\n\n', '\n', '。', '！', '？', '；', '. ', '! ', '? ', '; ', '，', ', '];
      while (rest.length > limit) {
        const window = rest.slice(0, limit);
        let cut = -1;
        for (const mark of marks) {
          const at = window.lastIndexOf(mark);
          if (at >= limit * 0.4 && at + mark.length > cut) cut = at + mark.length;
        }
        if (cut <= 0) cut = limit;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      if (rest !== '') chunks.push(rest);
      return chunks.filter((chunk) => chunk !== '');
    }

    /**
     * Find the newest finalized assistant reply in the live Chat snapshot.
     * @param snapshot - Chat snapshot from the `useChat` hook.
     * @returns the reply text, or an empty string.
     */
    function latestReplyText(snapshot) {
      try {
        const timeline = snapshot ? snapshot.timeline : undefined;
        const turns = timeline ? timeline.turns : undefined;
        const order = timeline ? timeline.turnOrder : undefined;
        if (turns && Array.isArray(order)) {
          for (let index = order.length - 1; index >= 0; index -= 1) {
            const turn = turns.get(order[index]);
            const tail = turn && turn.data && typeof turn.data.get === 'function'
              ? turn.data.get('turn-tail')
              : undefined;
            const closing = tail ? tail.closing : undefined;
            if (closing && Array.isArray(closing.blocks)) {
              const text = joinTextBlocks(closing.blocks);
              if (text !== '') return text;
            }
            const steps = turn ? turn.steps : undefined;
            if (Array.isArray(steps)) {
              for (let stepIndex = steps.length - 1; stepIndex >= 0; stepIndex -= 1) {
                const step = steps[stepIndex];
                const data = step && step.data && typeof step.data.get === 'function'
                  ? step.data.get('assistant-step')
                  : undefined;
                if (data && data.finalNode && Array.isArray(data.blocks)) {
                  const text = joinTextBlocks(data.blocks);
                  if (text !== '') return text;
                }
              }
            }
          }
        }
      } catch {
        // An unknown snapshot generation simply hides the bar.
      }
      return '';
    }

    /**
     * Identity of the newest completed assistant reply, used to trigger auto-read once.
     * @param snapshot - Chat snapshot from the `useChat` hook.
     * @returns the message id, or an empty string while a turn is still running.
     */
    function latestReplyId(snapshot) {
      try {
        const timeline = snapshot ? snapshot.timeline : undefined;
        const turns = timeline ? timeline.turns : undefined;
        const order = timeline ? timeline.turnOrder : undefined;
        if (turns && Array.isArray(order)) {
          for (let index = order.length - 1; index >= 0; index -= 1) {
            const turn = turns.get(order[index]);
            const tail = turn && turn.data && typeof turn.data.get === 'function'
              ? turn.data.get('turn-tail')
              : undefined;
            const closing = tail ? tail.closing : undefined;
            const id = closing && closing.finalNode ? closing.finalNode.messageId : undefined;
            if (typeof id === 'string' && id !== '') return id;
          }
        }
      } catch {
        // Unknown snapshot shape: no auto-read identity.
      }
      return '';
    }

    const AUTO_KEY = 'breezetts-dsh.auto-read';

    /** Ask the Host whether the model queued a custom clip. */
    async function takeClipId() {
      try {
        const response = await fetch(CLIP_TAKE_ROUTE, {
          headers: { 'x-breeze-client': CLIENT_VERSION },
        });
        const data = await response.json();
        return typeof data.clipId === 'string' ? data.clipId : '';
      } catch {
        return '';
      }
    }

    /** Play a queued clip; resolves when playback ends or fails. */
    function playClipUrl(id) {
      return new Promise((resolve) => {
        const audio = new Audio(`${CLIP_GET_ROUTE}?id=${encodeURIComponent(id)}`);
        audio.addEventListener('ended', () => resolve(true), { once: true });
        audio.addEventListener('error', () => resolve(true), { once: true });
        audio.play().catch(() => resolve(true));
      });
    }

    /**
     * Read the saved auto-read preference; default on.
     * @returns whether auto-read is enabled.
     */
    function readAutoRead() {
      try {
        const saved = window.localStorage.getItem(AUTO_KEY);
        return saved === null ? true : saved === '1';
      } catch {
        return true;
      }
    }

    /**
     * Persist the auto-read preference.
     * @param on - whether auto-read is enabled.
     */
    function writeAutoRead(on) {
      try {
        window.localStorage.setItem(AUTO_KEY, on ? '1' : '0');
      } catch {
        // Private mode: keep the in-memory choice only.
      }
    }

    /**
     * Fire-and-forget diagnostic event to the Host log.
     * @param event - short event name.
     * @param detail - JSON-serializable fields.
     */
    function report(event, detail) {
      try {
        void fetch(DEBUG_ROUTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
          body: JSON.stringify({ event, ...(detail ?? {}) }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Diagnostics are best-effort.
      }
    }

    /**
     * Request one chunk of audio from the Host proxy.
     * @param text - one chunk.
     * @param signal - cancellation signal.
     * @returns the audio blob.
     */
    async function fetchChunk(text, signal) {
      const response = await fetch(SPEAK_ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
        body: JSON.stringify({ text }),
        signal,
      });
      if (!response.ok) {
        let detail = '';
        try {
          const payload = await response.json();
          detail = typeof payload.error === 'string' ? payload.error : '';
        } catch {
          detail = '';
        }
        throw new Error(detail || `HTTP ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.size === 0) {
        const error = new Error('empty audio');
        error.code = 'emptyAudio';
        throw error;
      }
      return blob;
    }

    /** Playback state shared by the action buttons, the bar, and the settings page. */
    const playback = {
      active: false,
      owner: null,
      started: false,
      listeners: new Set(),
      set(active, owner, started) {
        const nextOwner = active ? owner : null;
        const nextStarted = active ? started === true : false;
        if (this.active === active && this.owner === nextOwner && this.started === nextStarted) return;
        this.active = active;
        this.owner = nextOwner;
        this.started = nextStarted;
        for (const listener of this.listeners) listener();
      },
      subscribe(listener) {
        this.listeners.add(listener);
        return () => {
          this.listeners.delete(listener);
        };
      },
    };

    /** Voice display metadata shared by every button and the player chip. */
    const voiceInfo = {
      state: { loaded: false, name: '', hasAvatar: false, streaming: true, hasApiKey: true, canSpeak: true },
      listeners: new Set(),
      set(next) {
        this.state = next;
        for (const listener of this.listeners) listener();
      },
      subscribe(listener) {
        this.listeners.add(listener);
        return () => {
          this.listeners.delete(listener);
        };
      },
    };
    let voiceRequest = null;

    /**
     * Load voice display metadata once per page.
     * @returns the shared request.
     */
    function loadVoiceInfo() {
      if (voiceRequest) return voiceRequest;
      voiceRequest = fetch(VOICE_ROUTE, { headers: { 'x-breeze-client': CLIENT_VERSION } })
        .then(async (response) => {
          if (!response.ok) throw new Error('voice info failed');
          const data = await response.json();
          voiceInfo.set({
            loaded: true,
            name: typeof data.name === 'string' ? data.name : '',
            hasAvatar: data.hasAvatar === true,
            streaming: data.streaming !== false,
            hasApiKey: data.hasApiKey !== false,
            canSpeak: data.canSpeak !== false,
          });
        })
        .catch(() => {
          voiceInfo.set({ loaded: true, name: '', hasAvatar: false, streaming: true, hasApiKey: true, canSpeak: true });
        });
      return voiceRequest;
    }

    /** Reload voice metadata after the settings dialog changes it. */
    function refreshVoiceInfo() {
      voiceRequest = null;
      voiceInfo.set({ loaded: false, name: '', hasAvatar: false, streaming: true, hasApiKey: true, canSpeak: true });
      void loadVoiceInfo();
    }

    /**
     * Open the settings dialog once for a browser profile that has no key yet.
     * @returns nothing.
     */
    async function onboardIfNeeded() {
      try {
        const response = await fetch(CONFIG_ROUTE, { headers: { 'x-breeze-client': CLIENT_VERSION } });
        const data = await response.json();
        if (!response.ok || data.canSpeak !== false) return;
        settingsUi.set(true);
        report('onboard', {});
      } catch {
        // Offline: no prompt.
      }
    }

    /**
     * Whether a failure means the dialog can help (missing key, rejected key, quota).
     * @param message - failure text.
     * @returns true when the settings dialog should open.
     */
    function opensSettingsFor(message) {
      return /apiKey|AUTH_REQUIRED|401|额度|积分不足/i.test(String(message ?? ''));
    }

    /** Settings dialog visibility, shared by the bar and the overlay. */
    const settingsUi = {
      open: false,
      listeners: new Set(),
      set(open) {
        if (this.open === open) return;
        this.open = open;
        for (const listener of this.listeners) listener();
      },
      subscribe(listener) {
        this.listeners.add(listener);
        return () => {
          this.listeners.delete(listener);
        };
      },
    };

    /**
     * Subscribe to the settings dialog's open state.
     * @returns whether the dialog is open.
     */
    function useSettingsOpen() {
      const [open, setOpen] = React.useState(settingsUi.open);
      React.useEffect(() => settingsUi.subscribe(() => setOpen(settingsUi.open)), []);
      return open;
    }

    /**
     * Subscribe to whether audio is playing.
     * @returns the current playback flag.
     */
    function usePlayback() {
      const [state, setState] = React.useState({
        active: playback.active,
        owner: playback.owner,
        started: playback.started,
      });
      React.useEffect(() => playback.subscribe(() => setState({
        active: playback.active,
        owner: playback.owner,
        started: playback.started,
      })), []);
      return state;
    }

    /**
     * Subscribe to the configured voice's display metadata.
     * @returns the metadata.
     */
    function useVoiceInfo() {
      const [state, setState] = React.useState(voiceInfo.state);
      React.useEffect(() => {
        const off = voiceInfo.subscribe(() => setState(voiceInfo.state));
        void loadVoiceInfo();
        return off;
      }, []);
      return state;
    }

    /** One playback queue at a time across the whole page. */
    const player = {
      ctx: null,
      controller: null,
      timer: null,
      timedOut: false,
      source: null,
      audio: null,
      url: null,
      cancelPlay: null,
      owner: null,
      handlers: null,
      context() {
        if (this.ctx) return this.ctx;
        const Ctor = typeof AudioContext === 'function' ? AudioContext : undefined;
        if (!Ctor) return null;
        try {
          this.ctx = new Ctor();
        } catch {
          this.ctx = null;
        }
        return this.ctx;
      },
      stop() {
        const controller = this.controller;
        const timer = this.timer;
        const cancelPlay = this.cancelPlay;
        const source = this.source;
        const audio = this.audio;
        const url = this.url;
        const handlers = this.handlers;
        this.controller = null;
        this.timer = null;
        this.timedOut = false;
        this.cancelPlay = null;
        this.source = null;
        this.audio = null;
        this.url = null;
        this.owner = null;
        this.handlers = null;
        if (timer) clearTimeout(timer);
        if (controller) controller.abort();
        if (source) {
          try {
            source.onended = null;
            source.stop();
          } catch {
            // A source that never started is already stopped.
          }
        }
        if (audio) {
          try {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
          } catch {
            // A detached element is fine.
          }
        }
        if (url) URL.revokeObjectURL(url);
        if (cancelPlay) cancelPlay();
        playback.set(false);
        if (handlers) handlers.onDone();
      },
      play(owner, text, chunks, streaming, handlers) {
        if (streaming === false) {
          void this.playChunks(owner, chunks, handlers);
          return;
        }
        this.playStream(owner, text, handlers);
      },
      playStream(owner, text, handlers) {
        this.stop();
        const audio = new Audio();
        this.audio = audio;
        this.owner = owner;
        this.handlers = handlers;
        playback.set(true, owner, false);
        report('stream-start', { chars: text.length });
        let started = false;
        let settled = false;
        const finish = (error) => {
          if (settled) return;
          settled = true;
          audio.onplaying = null;
          audio.onended = null;
          audio.onerror = null;
          if (this.timer) clearTimeout(this.timer);
          this.timer = null;
          if (this.audio === audio) this.audio = null;
          if (this.owner === owner) this.owner = null;
          if (this.handlers === handlers) this.handlers = null;
          playback.set(false);
          try {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
          } catch {
            // A detached element is fine.
          }
          if (error) {
            report('stream-failed', { name: error.name, message: error.message });
            handlers.onError(error);
          } else {
            report('done', {});
            handlers.onDone();
          }
        };
        audio.onplaying = () => {
          if (started) return;
          started = true;
          if (this.timer) clearTimeout(this.timer);
          this.timer = null;
          report('play-start', { engine: 'stream' });
          playback.set(true, owner, true);
          handlers.onStarted();
        };
        audio.onended = () => finish(null);
        audio.onerror = () => finish(new Error('浏览器无法播放这段音频'));
        this.timer = setTimeout(() => {
          const timeout = new Error('timeout');
          timeout.code = 'timeout';
          finish(timeout);
        }, REQUEST_TIMEOUT_MS);
        audio.src = `${STREAM_ROUTE}?text=${encodeURIComponent(text)}`;
        let played;
        try {
          played = audio.play();
        } catch {
          finish(new Error('播放被浏览器阻止'));
          return;
        }
        if (played && typeof played.catch === 'function') {
          played.catch((error) => finish(error instanceof Error ? error : new Error('播放被浏览器阻止')));
        }
      },
      async playChunks(owner, chunks, handlers) {
        this.stop();
        const controller = new AbortController();
        const ctx = this.context();
        this.controller = controller;
        this.owner = owner;
        this.handlers = handlers;
        playback.set(true, owner, false);
        report('start', {
          chunks: chunks.length,
          chars: chunks.join('').length,
          engine: ctx ? 'webaudio' : 'audio',
          state: ctx ? ctx.state : 'none',
        });
        let resumed = null;
        if (ctx) {
          try {
            resumed = ctx.resume();
          } catch {
            resumed = null;
          }
        }
        this.timer = setTimeout(() => {
          this.timedOut = true;
          controller.abort();
        }, REQUEST_TIMEOUT_MS);
        let started = false;
        let pending = fetchChunk(chunks[0], controller.signal);
        try {
          if (resumed && typeof resumed.then === 'function') await resumed;
          if (ctx) report('context', { state: ctx.state });
          for (let index = 0; index < chunks.length; index += 1) {
            const blob = await pending;
            if (controller.signal.aborted) throw new Error('aborted');
            pending = index + 1 < chunks.length ? fetchChunk(chunks[index + 1], controller.signal) : null;
            report('chunk', { index, size: blob.size });
            await this.playBlob(blob, () => {
              if (started) return;
              started = true;
              report('play-start', { engine: ctx ? 'webaudio' : 'audio' });
              playback.set(true, owner, true);
              handlers.onStarted();
            }, ctx, controller.signal);
            if (controller.signal.aborted) throw new Error('aborted');
          }
          if (this.controller === controller) {
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
            this.controller = null;
            this.owner = null;
            this.handlers = null;
            playback.set(false);
            report('done', {});
            handlers.onDone();
          }
        } catch (error) {
          if (this.timer) clearTimeout(this.timer);
          this.timer = null;
          if (this.timedOut) {
            this.timedOut = false;
            report('timeout', {});
            this.stop();
            const timeout = new Error('timeout');
            timeout.code = 'timeout';
            handlers.onError(timeout);
            return;
          }
          if (controller.signal.aborted) return;
          report('play-failed', { name: error && error.name, message: error && error.message });
          this.stop();
          handlers.onError(error);
        }
      },
      async playBlob(blob, onPlay, ctx, signal) {
        if (ctx) {
          const data = await blob.arrayBuffer();
          if (signal && signal.aborted) return;
          const buffer = await ctx.decodeAudioData(data);
          if (signal && signal.aborted) return;
          await new Promise((resolve) => {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            this.source = source;
            let settled = false;
            const finish = () => {
              if (settled) return;
              settled = true;
              source.onended = null;
              if (this.source === source) this.source = null;
              if (this.cancelPlay === finish) this.cancelPlay = null;
              resolve();
            };
            this.cancelPlay = finish;
            source.onended = finish;
            onPlay();
            source.start();
          });
          return;
        }
        await new Promise((resolve) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          this.audio = audio;
          this.url = url;
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            audio.onended = null;
            audio.onerror = null;
            if (this.cancelPlay === finish) this.cancelPlay = null;
            if (this.audio === audio) this.audio = null;
            if (this.url === url) {
              this.url = null;
              URL.revokeObjectURL(url);
            }
            resolve();
          };
          this.cancelPlay = finish;
          audio.onended = finish;
          audio.onerror = finish;
          let played;
          try {
            played = audio.play();
          } catch {
            finish();
            return;
          }
          if (played && typeof played.then === 'function') played.then(onPlay, finish);
          else onPlay();
        });
      },
      release(owner) {
        if (this.owner === owner) this.stop();
      },
    };

    function SpeakerIcon() {
      return h('svg', {
        viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
      h('path', { d: 'M3 6.4h2.3L8.4 4v8L5.3 9.6H3z' }),
      h('path', { d: 'M10.5 5.7a3.1 3.1 0 0 1 0 4.6' }),
      h('path', { d: 'M12.1 4.1a5.3 5.3 0 0 1 0 7.8' }));
    }

    function StopIcon() {
      return h('svg', { viewBox: '0 0 16 16', 'aria-hidden': true },
        h('rect', { x: 4, y: 4, width: 8, height: 8, rx: 1.5, fill: 'currentColor' }));
    }

    function SpinnerIcon() {
      return h('svg', {
        viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', className: 'bv_spin',
      },
      h('path', { d: 'M8 2.2a5.8 5.8 0 1 0 5.8 5.8', opacity: 0.9 }));
    }

    /**
     * Round voice portrait: the configured image, or a monogram of the voice name.
     * @param props - target size and voice metadata.
     * @returns the avatar element.
     */
    /** Report the first avatar load result so a blank icon can be diagnosed. */
    let avatarReported = false;
    function reportAvatar(event) {
      if (avatarReported) return;
      avatarReported = true;
      report(event, {});
    }

    function Avatar(props) {
      const size = props.size;
      const info = props.info;
      const box = { width: size, height: size };
      const [failed, setFailed] = React.useState(false);
      React.useEffect(() => {
        setFailed(false);
      }, [info.hasAvatar, info.name]);
      if (info.hasAvatar && !failed) {
        return h('img', {
          className: 'bv_avatar',
          src: AVATAR_DATA,
          alt: info.name,
          draggable: false,
          style: box,
          onError: () => {
            reportAvatar('avatar-error');
            setFailed(true);
          },
          onLoad: () => reportAvatar('avatar-load'),
        });
      }
      const initial = Array.from((info.name || '?').trim())[0] || '?';
      return h('span', {
        className: 'bv_avatar bv_monogram',
        'aria-hidden': true,
        style: { ...box, fontSize: Math.round(size * 0.45) },
      }, initial);
    }

    /**
     * Read the current reply aloud.
     * @param props - owner message identity, standard slot props, and translations.
     * @returns the voice control.
     */
    function VoiceAction(props) {
      const messageId = props.messageId;
      const t = props.t;
      const useChat = props.useChat;
      const snapshotText = useChat((snapshot) => replyTextOf(snapshot, messageId));
      const text = React.useMemo(() => speakable(snapshotText), [snapshotText]);
      const chunks = React.useMemo(() => chunkText(text, CHUNK_LIMIT), [text]);
      const info = useVoiceInfo();
      const playbackState = usePlayback();

      const [status, setStatus] = React.useState('idle');
      const [failure, setFailure] = React.useState('');
      const alive = React.useRef(true);
      const owner = React.useRef({});
      const playing = playbackState.active && playbackState.owner === owner.current;

      React.useEffect(() => {
        const token = owner.current;
        alive.current = true;
        return () => {
          alive.current = false;
          player.release(token);
        };
      }, []);

      const toggle = React.useCallback(() => {
        if (status === 'loading') return;
        if (playing) {
          player.stop();
          return;
        }
        if (chunks.length === 0) {
          setStatus('error');
          setFailure(t('action.empty'));
          return;
        }
        setStatus('loading');
        setFailure('');
        void (async () => {
          const clipId = await takeClipId();
          if (clipId) {
            await playClipUrl(clipId);
            if (alive.current) setStatus('idle');
            return;
          }
          if (info.canSpeak === false) {
            setStatus('error');
            setFailure(t('error.needKey'));
            settingsUi.set(true);
            return;
          }
          void player.play(owner.current, text, chunks, info.streaming, {
            onStarted: () => {
              if (alive.current) setStatus('idle');
            },
            onDone: () => {
              if (alive.current) setStatus('idle');
            },
            onError: (error) => {
              if (!alive.current) return;
              const message = error && error.code === 'emptyAudio'
                ? t('error.emptyAudio')
                : error && error.code === 'timeout'
                  ? t('error.timeout')
                  : error instanceof Error && error.message !== ''
                    ? error.message
                    : t('error.failed');
              setStatus('error');
              setFailure(message);
              if (opensSettingsFor(message)) settingsUi.set(true);
            },
          });
        })();
      }, [chunks, info.canSpeak, info.streaming, playing, t, text]);

      const label = playing
        ? t('action.stop')
        : status === 'loading' ? t('action.loading') : t('action.speak');
      const disabled = chunks.length === 0 && status !== 'error';
      const title = failure !== '' ? failure : (chunks.length === 0 ? t('action.empty') : label);

      const face = playing
        ? h(StopIcon)
        : status === 'loading'
          ? h(SpinnerIcon)
          : (info.name !== '' || info.hasAvatar)
            ? h(Avatar, { size: 18, info })
            : h(SpeakerIcon);

      return h('button', {
        type: 'button',
        className: 'bv_action',
        onClick: toggle,
        disabled,
        title,
        'aria-label': title,
        'aria-pressed': playing ? 'true' : 'false',
        'data-active': playing ? '' : undefined,
        'data-failed': status === 'error' ? '' : undefined,
      }, face);
    }

    /**
     * Always-visible voice bar below the composer: launches the latest reply and
     * becomes the player while audio is running.
     * @param props - slot translations and standard slot props.
     * @returns the bar, or null without a readable reply.
     */
    function ComposerVoiceBar(props) {
      const t = props.t;
      const useChat = props.useChat;
      const latest = useChat((snapshot) => latestReplyText(snapshot));
      const latestId = useChat((snapshot) => latestReplyId(snapshot));
      const text = React.useMemo(() => speakable(latest), [latest]);
      const chunks = React.useMemo(() => chunkText(text, CHUNK_LIMIT), [text]);
      const playbackState = usePlayback();
      const info = useVoiceInfo();

      const [status, setStatus] = React.useState('idle');
      const [autoRead, setAutoRead] = React.useState(readAutoRead);
      const alive = React.useRef(true);
      const owner = React.useRef({});
      const auto = React.useRef({ primed: false, last: '' });
      const clipAudio = React.useRef(null);

      React.useEffect(() => {
        alive.current = true;
        return () => {
          alive.current = false;
          player.release(owner.current);
        };
      }, []);

      // Custom clips produced by breeze_speak: play as soon as they appear.
      React.useEffect(() => {
        let stopped = false;
        let busy = false;
        const timer = setInterval(async () => {
          if (stopped || busy) return;
          busy = true;
          try {
            const clipId = await takeClipId();
            if (!clipId) return;
            const audio = new Audio(`${CLIP_GET_ROUTE}?id=${encodeURIComponent(clipId)}`);
            audio.volume = 1;
            clipAudio.current = audio;
            try {
              await audio.play();
              report('clip-play', { bytes: audio.duration || 0 });
            } catch (error) {
              report('clip-play-error', { message: String(error && error.message ? error.message : error) });
            }
          } finally {
            busy = false;
          }
        }, 2500);
        return () => {
          stopped = true;
          clearInterval(timer);
        };
      }, []);


      React.useEffect(() => {
        if (!auto.current.primed) {
          auto.current.primed = true;
          auto.current.last = latestId;
          return;
        }
        if (!autoRead || latestId === '' || latestId === auto.current.last) return;
        auto.current.last = latestId;
        if (chunks.length === 0) return;
        if (status === 'loading') return;
        setStatus('loading');
        void (async () => {
          const clipId = await takeClipId();
          if (clipId) {
            await playClipUrl(clipId);
            if (alive.current) setStatus('idle');
            return;
          }
          if (info.canSpeak === false) return;
          void player.play(owner.current, text, chunks, info.streaming, {
            onStarted: () => {
              if (alive.current) setStatus('idle');
            },
            onDone: () => {
              if (alive.current) setStatus('idle');
            },
            onError: (error) => {
              if (alive.current) setStatus('idle');
              if (opensSettingsFor(error && error.message)) settingsUi.set(true);
            },
          });
        })();
      }, [autoRead, chunks, info.canSpeak, info.streaming, latestId, status, text]);

      const toggleAuto = React.useCallback(() => {
        setAutoRead((current) => {
          writeAutoRead(!current);
          return !current;
        });
      }, []);

      if (playbackState.active) {
        return h('div', { className: 'bv_player', role: 'status' },
          h(Avatar, { size: 32, info }),
          h('span', { className: 'bv_meta' },
            h('span', { className: 'bv_name' }, info.name || t('player.voice')),
            h('span', { className: 'bv_state' }, playbackState.started ? t('player.playing') : t('action.loading'))),
          h('button', {
            type: 'button',
            className: 'bv_stop',
            onClick: () => player.stop(),
            title: t('action.stop'),
            'aria-label': t('action.stop'),
          }, h(StopIcon)));
      }

      return h('div', { className: 'bv_bar' },
        h('button', {
          type: 'button',
          className: 'bv_auto',
          onClick: () => settingsUi.set(true),
          title: t('settings.open'),
          'aria-label': t('settings.open'),
        },
        h(SettingsIcon),
        h('span', null, 'BreezeTTS2')),
        h('button', {
          type: 'button',
          className: 'bv_auto',
          role: 'switch',
          'aria-checked': autoRead ? 'true' : 'false',
          onClick: toggleAuto,
          title: t('auto.hint'),
          'aria-label': t('auto.hint'),
        },
        h('span', { className: 'bv_autoDot', 'data-on': autoRead ? '' : undefined }),
        h('span', null, t('auto.label'))));
    }

    function InviteArt() {
      return h('svg', {
        className: 'bv_inviteArt',
        viewBox: '0 0 120 96',
        'aria-hidden': true,
        fill: 'none',
      },
      h('rect', { x: 4, y: 12, width: 60, height: 38, rx: 12, fill: '#ffffff', opacity: 0.95 }),
      h('path', { d: 'M18 50l-2 10 12-6', fill: '#ffffff', opacity: 0.95 }),
      h('rect', { x: 42, y: 36, width: 56, height: 34, rx: 11, fill: '#ffffff', opacity: 0.5 }),
      h('path', { d: 'M92 70l2 9-11-5', fill: '#ffffff', opacity: 0.5 }),
      h('rect', { x: 76, y: 60, width: 22, height: 17, rx: 3, fill: '#2b6fd0' }),
      h('path', { d: 'M87 60v17M76 67.5h22', stroke: '#ffffff', strokeWidth: 1.6 }),
      h('path', { d: 'M87 60s-3.4-7.4 0-8.4 3.4 8.4 0 8.4zM87 60s3.4-7.4 0-8.4-3.4 8.4 0 8.4z', fill: '#ffffff', opacity: 0.9 }),
      h('circle', { cx: 106, cy: 24, r: 3, fill: '#ffffff', opacity: 0.85 }),
      h('circle', { cx: 114, cy: 38, r: 2, fill: '#ffffff', opacity: 0.6 }),
      h('circle', { cx: 24, cy: 22, r: 2, fill: '#ffffff', opacity: 0.7 }));
    }

    function GiftIcon() {
      return h('svg', {
        viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
      h('rect', { x: 2.5, y: 6.5, width: 11, height: 7, rx: 1.2 }),
      h('path', { d: 'M2.5 9.5h11M8 6.5v7' }),
      h('path', { d: 'M8 6.5S6.6 2.6 4.9 3.5 5.8 6.5 8 6.5zM8 6.5s1.4-3.9 3.1-3 0 3-3.1 3z' }));
    }

    function SettingsIcon() {
      return h('svg', {
        viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
      h('circle', { cx: 8, cy: 8, r: 2.2 }),
      h('path', { d: 'M8 1.6v1.7M8 12.7v1.7M1.6 8h1.7M12.7 8h1.7M3.5 3.5l1.2 1.2M11.3 11.3l1.2 1.2M12.5 3.5l-1.2 1.2M4.7 11.3l-1.2 1.2' }));
    }

    /**
     * Breeze settings dialog: key, voice catalog, preview and speed.
     * @param props - slot translations when the host provides them.
     * @returns the dialog while open, otherwise null.
     */
    function SettingsDialog(props) {
      const t = props.t || translate;
      const open = useSettingsOpen();
      const [config, setConfig] = React.useState(null);
      const [error, setError] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [saving, setSaving] = React.useState(false);
      const [keyDraft, setKeyDraft] = React.useState('');
      const [voiceDraft, setVoiceDraft] = React.useState('');
      const [speedDraft, setSpeedDraft] = React.useState(1);
      const [query, setQuery] = React.useState('');
      const [results, setResults] = React.useState([]);
      const [searching, setSearching] = React.useState(false);
      const [previewing, setPreviewing] = React.useState('');
      const [copied, setCopied] = React.useState(false);
      const [invited, setInvited] = React.useState(false);
      const [balance, setBalance] = React.useState(null);
      const [designOpen, setDesignOpen] = React.useState(false);
      const [designDesc, setDesignDesc] = React.useState('');
      const [designText, setDesignText] = React.useState('');
      const [designing, setDesigning] = React.useState(false);
      const [designPreviews, setDesignPreviews] = React.useState([]);
      const [designSelected, setDesignSelected] = React.useState('');
      const [designName, setDesignName] = React.useState('');
      const [designSaving, setDesignSaving] = React.useState(false);
      const [designNote, setDesignNote] = React.useState('');
      const [designPlaying, setDesignPlaying] = React.useState('');
      const [switching, setSwitching] = React.useState(false);
      const [cli, setCli] = React.useState(null);
      const [cliBusy, setCliBusy] = React.useState(false);
      const [cliNote, setCliNote] = React.useState('');
      const cliPollRef = React.useRef(null);
      const designAudioRef = React.useRef(null);
      const previewRef = React.useRef(null);
      const copyTimer = React.useRef(null);
      const inviteTimer = React.useRef(null);

      React.useEffect(() => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current);
        if (inviteTimer.current) clearTimeout(inviteTimer.current);
        if (cliPollRef.current) clearInterval(cliPollRef.current);
        const audio = designAudioRef.current;
        if (audio) {
          try {
            audio.pause();
          } catch {
            // Already stopped.
          }
        }
      }, []);

      const loadCli = React.useCallback(async () => {
        try {
          const response = await fetch(CLI_STATUS_ROUTE, {
            headers: { 'x-breeze-client': CLIENT_VERSION },
          });
          const data = await response.json();
          if (response.ok) setCli(data);
          return data;
        } catch {
          return null;
        }
      }, []);

      React.useEffect(() => {
        if (open) void loadCli();
      }, [open, loadCli]);

      const connectCli = React.useCallback(async () => {
        setCliBusy(true);
        setCliNote(t('cli.starting'));
        try {
          const post = () => fetch(CLI_LOGIN_ROUTE, {
            method: 'POST',
            headers: { 'x-breeze-client': CLIENT_VERSION },
          });
          let response = await post();
          let data = await response.json();
          if (response.status === 409 && data.needsInstall) {
            setCliNote(t('cli.installing'));
            response = await fetch(CLI_INSTALL_ROUTE, {
              method: 'POST',
              headers: { 'x-breeze-client': CLIENT_VERSION },
            });
            data = await response.json();
            if (!response.ok) throw new Error(data.error || t('cli.failed'));
            response = await post();
            data = await response.json();
          }
          if (!response.ok) throw new Error(data.error || t('cli.failed'));
          setCliNote(data.url ? t('cli.browser') : t('cli.waiting'));
          if (cliPollRef.current) clearInterval(cliPollRef.current);
          let ticks = 0;
          cliPollRef.current = setInterval(async () => {
            ticks += 1;
            const status = await loadCli();
            if (status?.loggedIn) {
              clearInterval(cliPollRef.current);
              cliPollRef.current = null;
              setCliNote('');
              setNotice(t('cli.connected'));
              const fresh = await fetch(CONFIG_ROUTE, {
                headers: { 'x-breeze-client': CLIENT_VERSION },
              });
              setConfig(await fresh.json());
            } else if (ticks > 90) {
              clearInterval(cliPollRef.current);
              cliPollRef.current = null;
              setCliNote(t('cli.timeout'));
            }
          }, 2000);
        } catch (failure) {
          setCliNote(failure instanceof Error ? failure.message : t('cli.failed'));
        } finally {
          setCliBusy(false);
        }
      }, [loadCli, t]);

      const logoutCli = React.useCallback(async () => {
        setCliBusy(true);
        setCliNote('');
        try {
          const response = await fetch(CLI_LOGOUT_ROUTE, {
            method: 'POST',
            headers: { 'x-breeze-client': CLIENT_VERSION },
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || t('cli.failed'));
          setCli(data);
          setNotice(t('cli.signedOut'));
          const fresh = await fetch(CONFIG_ROUTE, { headers: { 'x-breeze-client': CLIENT_VERSION } });
          setConfig(await fresh.json());
        } catch (failure) {
          setCliNote(failure instanceof Error ? failure.message : t('cli.failed'));
        } finally {
          setCliBusy(false);
        }
      }, [t]);

      const changeEngine = React.useCallback(async (engine) => {
        setError('');
        try {
          const response = await fetch(CONFIG_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify({ engine }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || t('cli.failed'));
          setConfig(data);
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : t('cli.failed'));
        }
      }, [t]);

      const copyInvite = React.useCallback(() => {
        const done = () => {
          setInvited(true);
          if (inviteTimer.current) clearTimeout(inviteTimer.current);
          inviteTimer.current = setTimeout(() => setInvited(false), 2200);
        };
        try {
          if (typeof navigator === 'undefined' || !navigator.clipboard) return;
          const text = t('invite.shareText').replace('{url}', PROMO_URL);
          const result = navigator.clipboard.writeText(text);
          if (result && typeof result.then === 'function') result.then(done).catch(() => {});
        } catch {
          // Clipboard is unavailable; the copy stays a no-op.
        }
      }, [t]);

      const copyCode = React.useCallback(() => {
        const done = () => {
          setCopied(true);
          if (copyTimer.current) clearTimeout(copyTimer.current);
          copyTimer.current = setTimeout(() => setCopied(false), 2000);
        };
        try {
          if (typeof navigator === 'undefined' || !navigator.clipboard) return;
          const result = navigator.clipboard.writeText(PROMO_CODE);
          if (result && typeof result.then === 'function') result.then(done).catch(() => {});
        } catch {
          // Clipboard is unavailable; the code stays readable on screen.
        }
      }, []);

      React.useEffect(() => {
        if (!open || !config || !config.canSpeak) {
          setBalance(null);
          return undefined;
        }
        let cancelled = false;
        void (async () => {
          try {
            const response = await fetch(BALANCE_ROUTE, { headers: { 'x-breeze-client': CLIENT_VERSION } });
            const data = await response.json();
            if (!cancelled && response.ok && typeof data.balance === 'number') setBalance(data.balance);
          } catch {
            // Balance is optional information.
          }
        })();
        return () => {
          cancelled = true;
        };
      }, [open, config]);

      const signOut = React.useCallback(async () => {
        setSaving(true);
        setError('');
        setNotice('');
        try {
          const response = await fetch(CONFIG_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify({ apiKey: '' }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          setConfig(data);
          setBalance(null);
          setNotice(t('settings.signedOut'));
          refreshVoiceInfo();
        } catch (failure) {
          setError(failure instanceof Error && failure.message !== '' ? failure.message : t('settings.failed'));
        } finally {
          setSaving(false);
        }
      }, [t]);

      const stopDesignAudio = React.useCallback(() => {
        const audio = designAudioRef.current;
        designAudioRef.current = null;
        setDesignPlaying('');
        if (audio) {
          try {
            audio.pause();
          } catch {
            // Already stopped.
          }
        }
      }, []);

      const openDesign = React.useCallback(() => {
        setDesignDesc('温暖低沉的女声，语速从容，带一点轻微的沙哑');
        setDesignText('你好，很高兴认识你。这是我用新音色读的第一句话。');
        setDesignPreviews([]);
        setDesignSelected('');
        setDesignName('');
        setDesignNote('');
        setDesignOpen(true);
      }, []);

      const chooseVoice = React.useCallback(async (id) => {
        if (!config || config.voiceId === id || switching) return;
        setSwitching(true);
        setError('');
        setNotice('');
        try {
          const response = await fetch(CONFIG_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify({ voiceId: id }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          setConfig(data);
          setVoiceDraft(data.voiceId);
          setSpeedDraft(data.speed);
          setNotice(t('settings.saved'));
          refreshVoiceInfo();
        } catch (failure) {
          setError(failure instanceof Error && failure.message !== '' ? failure.message : t('settings.failed'));
        } finally {
          setSwitching(false);
        }
      }, [config, switching, t]);

      const closeDesign = React.useCallback(() => {
        stopDesignAudio();
        setDesignOpen(false);
      }, [stopDesignAudio]);

      const playDesignPreview = React.useCallback((id) => {
        if (designPlaying === id) {
          stopDesignAudio();
          return;
        }
        stopDesignAudio();
        const audio = new Audio(`${DESIGN_AUDIO_ROUTE}?id=${encodeURIComponent(id)}`);
        designAudioRef.current = audio;
        setDesignPlaying(id);
        const done = () => {
          if (designAudioRef.current === audio) {
            designAudioRef.current = null;
            setDesignPlaying('');
          }
        };
        audio.onended = done;
        audio.onerror = done;
        const played = audio.play();
        if (played && typeof played.catch === 'function') played.catch(done);
      }, [designPlaying, stopDesignAudio]);

      const generateDesign = React.useCallback(async () => {
        if (designDesc.trim().length < 3) return;
        setDesigning(true);
        setDesignNote('');
        setDesignPreviews([]);
        setDesignSelected('');
        try {
          const response = await fetch(DESIGN_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify({
              description: designDesc.trim(),
              text: designText.trim(),
              language: config && config.languageCode ? config.languageCode : 'zh',
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          const previews = Array.isArray(data.previews) ? data.previews : [];
          setDesignPreviews(previews);
          setDesignSelected(previews.length > 0 ? previews[0].id : '');
          if (previews.length > 0) playDesignPreview(previews[0].id);
        } catch (failure) {
          setDesignNote(failure instanceof Error && failure.message !== '' ? failure.message : t('design.failed'));
        } finally {
          setDesigning(false);
        }
      }, [config, designDesc, designText, playDesignPreview, t]);

      const saveDesign = React.useCallback(async () => {
        if (designSelected === '') return;
        setDesignSaving(true);
        setDesignNote('');
        try {
          const response = await fetch(DESIGN_SAVE_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify({
              id: designSelected,
              name: designName.trim(),
              description: designDesc.trim(),
              language: config && config.languageCode ? config.languageCode : 'zh',
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          const activated = await fetch(CONFIG_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify({ voiceId: data.voiceId }),
          });
          const next = await activated.json();
          if (activated.ok) {
            setConfig(next);
            setVoiceDraft(next.voiceId);
            setSpeedDraft(next.speed);
          }
          refreshVoiceInfo();
          stopDesignAudio();
          setDesignOpen(false);
          setNotice(t('design.saved'));
        } catch (failure) {
          setDesignNote(failure instanceof Error && failure.message !== '' ? failure.message : t('design.failed'));
        } finally {
          setDesignSaving(false);
        }
      }, [config, designDesc, designName, designSelected, stopDesignAudio, t]);

      const stopPreview = React.useCallback(() => {
        const audio = previewRef.current;
        previewRef.current = null;
        setPreviewing('');
        if (audio) {
          try {
            audio.pause();
          } catch {
            // Already stopped.
          }
        }
      }, []);

      React.useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        setError('');
        setNotice('');
        void (async () => {
          try {
            const response = await fetch(CONFIG_ROUTE, { headers: { 'x-breeze-client': CLIENT_VERSION } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (cancelled) return;
            setConfig(data);
            setVoiceDraft(data.voiceId);
            setSpeedDraft(data.speed);
            setKeyDraft('');
          } catch {
            if (!cancelled) setError(t('settings.loadFailed'));
          }
        })();
        return () => {
          cancelled = true;
        };
      }, [open, t]);

      React.useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        setSearching(true);
        const timer = setTimeout(async () => {
          try {
            const response = await fetch(`${VOICES_ROUTE}?page_size=10&search=${encodeURIComponent(query)}`, {
              headers: { 'x-breeze-client': CLIENT_VERSION },
            });
            const data = await response.json();
            if (cancelled) return;
            setResults(Array.isArray(data.voices) ? data.voices : []);
            if (!response.ok) setError(data.error || t('settings.loadFailed'));
          } catch {
            if (!cancelled) setError(t('settings.loadFailed'));
          } finally {
            if (!cancelled) setSearching(false);
          }
        }, 300);
        return () => {
          cancelled = true;
          clearTimeout(timer);
        };
      }, [open, query, t]);

      React.useEffect(() => () => stopPreview(), [stopPreview]);

      React.useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
          if (event.key === 'Escape') settingsUi.set(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [open]);

      const togglePreview = React.useCallback((voiceId) => {
        if (previewing === voiceId) {
          stopPreview();
          return;
        }
        stopPreview();
        const audio = new Audio(`${PREVIEW_ROUTE}?voice_id=${encodeURIComponent(voiceId)}`);
        previewRef.current = audio;
        setPreviewing(voiceId);
        const done = () => {
          if (previewRef.current === audio) {
            previewRef.current = null;
            setPreviewing('');
          }
        };
        audio.onended = done;
        audio.onerror = done;
        const played = audio.play();
        if (played && typeof played.catch === 'function') played.catch(done);
      }, [previewing, stopPreview]);

      const save = React.useCallback(async () => {
        if (!config) return;
        setSaving(true);
        setError('');
        setNotice('');
        const patch = { voiceId: voiceDraft || config.voiceId, speed: speedDraft };
        if (keyDraft.trim() !== '') patch.apiKey = keyDraft.trim();
        try {
          const response = await fetch(CONFIG_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-breeze-client': CLIENT_VERSION },
            body: JSON.stringify(patch),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          setConfig(data);
          setVoiceDraft(data.voiceId);
          setSpeedDraft(data.speed);
          setKeyDraft('');
          setNotice(t('settings.saved'));
          refreshVoiceInfo();
        } catch (failure) {
          setError(failure instanceof Error && failure.message !== '' ? failure.message : t('settings.failed'));
        } finally {
          setSaving(false);
        }
      }, [config, keyDraft, speedDraft, t, voiceDraft]);

      if (!open) return null;

      const status = error || notice;
      const rows = results.length === 0
        ? h('div', { className: 'bv_muted' }, searching ? t('settings.searching') : t('settings.empty'))
        : results.map((voice) => h('div', { className: 'bv_item', key: voice.id },
          h(Avatar, { size: 30, info: { name: voice.name, hasAvatar: false } }),
          h('span', { className: 'bv_itemBody' },
            h('span', { className: 'bv_itemName' }, voice.name),
            h('span', { className: 'bv_itemDesc' }, [voice.languageCode, voice.description].filter(Boolean).join(' · '))),
          h('button', { type: 'button', className: 'bv_link', onClick: () => togglePreview(voice.id) },
            previewing === voice.id ? t('settings.stop') : t('settings.preview')),
          h('button', {
            type: 'button',
            className: 'bv_btn bv_btnSmall',
            disabled: switching || config.voiceId === voice.id,
            onClick: () => chooseVoice(voice.id),
          }, config.voiceId === voice.id ? t('settings.selected') : t('settings.use'))));

      return h('div', { className: 'bv_overlay', onClick: () => settingsUi.set(false) },
        h('div', {
          className: 'bv_panel',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': t('settings.title'),
          onClick: (event) => event.stopPropagation(),
        },
        h('div', { className: 'bv_panelHead' },
          h('span', { className: 'bv_panelTitle' }, t('settings.title')),
          h('button', {
            type: 'button',
            className: 'bv_close',
            onClick: () => settingsUi.set(false),
            'aria-label': t('settings.close'),
          }, '×')),
        !config
          ? h('div', { className: 'bv_muted' }, error || '…')
          : h('div', { className: 'bv_panelBody' },
            h('div', { className: 'bv_cliCard' },
              h('div', { className: 'bv_cliHead' },
                h('span', { className: 'bv_cliTitle' }, t('cli.title')),
                h('span', { className: 'bv_cliState' },
                  cli === null
                    ? '…'
                    : !cli.installed
                      ? t('cli.notInstalled')
                      : !cli.loggedIn
                        ? t('cli.notLoggedIn')
                        : `${t('cli.loggedIn')}${cli.who ? ` · ${cli.who}` : ''}`)),
              h('span', { className: 'bv_hint' }, t('cli.desc')),
              h('div', { className: 'bv_cliActions' },
                h('select', {
                  className: 'bv_select',
                  value: (config && config.engine) || 'auto',
                  onChange: (event) => changeEngine(event.target.value),
                },
                h('option', { value: 'auto' }, t('cli.engineAuto')),
                h('option', { value: 'cli' }, t('cli.engineCli')),
                h('option', { value: 'http' }, t('cli.engineHttp'))),
                h('button', {
                  type: 'button',
                  className: 'bv_primary bv_cliBtn',
                  onClick: connectCli,
                  disabled: cliBusy || Boolean(cli && cli.loggedIn),
                }, cliBusy
                  ? t('cli.working')
                  : cli && cli.loggedIn
                    ? t('cli.connected')
                    : cli && cli.installed
                      ? t('cli.connect')
                      : t('cli.installConnect')),
                cli && cli.loggedIn
                  ? h('button', {
                    type: 'button',
                    className: 'bv_btn',
                    onClick: logoutCli,
                    disabled: cliBusy,
                  }, t('cli.signout'))
                  : null),
              cliNote === '' ? null : h('span', { className: 'bv_hint' }, cliNote)),
            h('div', { className: 'bv_cliHelp' },
              h('span', { className: 'bv_fieldLabel' }, t('cliHelp.title')),
              h('ul', { className: 'bv_cliHelpList' },
                h('li', null, t('cliHelp.read')),
                h('li', null, t('cliHelp.voices')),
                h('li', null, t('cliHelp.control')),
                h('li', null, t('cliHelp.auto'))),
              h('span', { className: 'bv_hint' }, t('cliHelp.hint'))),
            h('div', { className: 'bv_keyRow' },
              h('div', { className: 'bv_field bv_keyField' },
                h('span', { className: 'bv_fieldLabel' }, t('settings.key')),
                cli && cli.loggedIn
                  ? h('div', { className: 'bv_cliDone' },
                    h('span', { className: 'bv_dot' }),
                    t('cli.keyAuto'),
                    config.hasApiKey ? ` · ${config.apiKeyHint}` : '')
                  : h('div', { className: 'bv_keyInputRow' },
                    h('input', {
                      className: 'bv_input',
                      type: 'password',
                      value: keyDraft,
                      placeholder: config.apiKeyHint || 'brz_...',
                      autoComplete: 'off',
                      spellCheck: false,
                      onChange: (event) => setKeyDraft(event.target.value),
                    }),
                    h('button', {
                      type: 'button',
                      className: 'bv_saveKey',
                      onClick: save,
                      disabled: saving,
                    }, saving ? t('settings.saving') : t('settings.save'))),
                h('span', { className: 'bv_hint' },
                  (cli && cli.loggedIn
                    ? ''
                    : config.hasApiKey
                      ? t('settings.keySaved')
                      : t('settings.keyMissing'))
                  + (balance === null ? '' : ` · ${t('settings.balance')} ${Math.round(balance).toLocaleString()} 积分`)),
                config.hasApiKey && !(cli && cli.loggedIn)
                  ? h('div', { className: 'bv_signinActions' },
                    h('button', { type: 'button', className: 'bv_link', onClick: signOut }, t('settings.signout')))
                  : null),
              config.hasApiKey || (cli && cli.loggedIn)
                ? h('div', { className: 'bv_promo' },
                  h('span', { className: 'bv_promoTag' }, h(GiftIcon), t('promo.tag')),
                  h('span', { className: 'bv_promoTitle' }, t('promo.title')),
                  h('span', { className: 'bv_promoSub' }, t('promo.giftSub')),
                  h('div', { className: 'bv_promoActions' },
                    h('button', {
                      type: 'button',
                      className: 'bv_promoCode',
                      onClick: copyCode,
                      title: t('promo.copy'),
                    },
                    h('span', null, PROMO_CODE),
                    h('span', { className: 'bv_promoCopy' }, copied ? t('promo.copied') : t('promo.copy'))),
                    h('a', {
                      className: 'bv_promoLink',
                      href: PROMO_URL,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }, `${t('promo.redeem')} ↗`)))
                : h('div', { className: 'bv_promo' },
                  h('span', { className: 'bv_promoTag' }, h(GiftIcon), t('promo.tag')),
                  h('span', { className: 'bv_promoTitle' }, t('promo.title')),
                  h('span', { className: 'bv_promoSub' }, t('promo.loginSub')),
                  h('div', { className: 'bv_promoActions' },
                    h('a', {
                      className: 'bv_promoLink',
                      href: API_KEYS_URL,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }, `${t('promo.login')} ↗`)))),
            h('div', { className: 'bv_invite' },
              h('div', { className: 'bv_inviteBody' },
                h('span', { className: 'bv_inviteTitle' }, t('invite.title')),
                h('span', { className: 'bv_inviteSub' }, t('invite.sub')),
                h('div', { className: 'bv_inviteActions' },
                  h('button', {
                    type: 'button',
                    className: 'bv_inviteBtn',
                    onClick: copyInvite,
                    title: t('invite.copy'),
                  }, invited ? t('invite.copied') : t('invite.copy')),
                  h('a', {
                    className: 'bv_inviteLink',
                    href: PROMO_URL,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }, `${t('invite.open')} ↗`))),
              h(InviteArt)),
            h('div', { className: 'bv_field' },
              h('div', { className: 'bv_fieldHead' },
                h('span', { className: 'bv_fieldLabel' }, t('settings.voice')),
                config.hasApiKey
                  ? h('button', { type: 'button', className: 'bv_designBtn', onClick: openDesign }, t('design.new'))
                  : null),
              config.voiceName
                ? h('div', { className: 'bv_current' },
                  h(Avatar, { size: 36, info: { name: config.voiceName, hasAvatar: false } }),
                  h('span', { className: 'bv_currentBody' },
                    h('span', { className: 'bv_currentName' }, config.voiceName),
                    h('span', { className: 'bv_currentDesc' }, config.voiceDescription || config.voiceId || '')),
                  h('button', { type: 'button', className: 'bv_btn', onClick: () => togglePreview(config.voiceId) },
                    previewing === config.voiceId ? t('settings.stop') : t('settings.preview')))
                : h('span', { className: 'bv_hint' }, t('settings.voiceLoading')),
              h('input', {
                className: 'bv_input',
                type: 'search',
                value: query,
                placeholder: t('settings.search'),
                onChange: (event) => setQuery(event.target.value),
              }),
              h('div', { className: 'bv_list' }, rows)),
            h('label', { className: 'bv_field' },
              h('span', { className: 'bv_fieldLabel' }, `${t('settings.speed')} ${speedDraft.toFixed(2)}×`),
              h('input', {
                className: 'bv_range',
                type: 'range',
                min: 0.5,
                max: 2,
                step: 0.05,
                value: speedDraft,
                onChange: (event) => setSpeedDraft(Number(event.target.value)),
              })),
            h('div', { className: 'bv_footer' },
              h('span', { className: 'bv_status' }, status),
              h('div', { className: 'bv_footerActions' },
                h('button', {
                  type: 'button',
                  className: 'bv_cancel',
                  onClick: () => settingsUi.set(false),
                }, t('settings.close')),
                h('button', { type: 'button', className: 'bv_primary', onClick: save, disabled: saving },
                  saving ? t('settings.saving') : t('settings.save')))))),
        designOpen ? h('div', { className: 'bv_designLayer', onClick: closeDesign },
          h('div', { className: 'bv_designCard', onClick: (event) => event.stopPropagation() },
            h('div', { className: 'bv_designHead' },
              h('span', { className: 'bv_designTitle' }, t('design.title')),
              h('button', {
                type: 'button',
                className: 'bv_designClose',
                onClick: closeDesign,
                'aria-label': t('design.close'),
              }, '×')),
            h('span', { className: 'bv_designSub' }, t('design.sub')),
            h('label', { className: 'bv_designField' },
              h('span', { className: 'bv_designLabel' }, t('design.desc')),
              h('textarea', {
                className: 'bv_designTextarea',
                placeholder: t('design.descPlaceholder'),
                maxLength: 500,
                value: designDesc,
                onChange: (event) => setDesignDesc(event.target.value),
              }),
              h('span', { className: 'bv_designCount' }, `${designDesc.length}/500`)),
            h('label', { className: 'bv_designField' },
              h('span', { className: 'bv_designLabel' }, t('design.sample')),
              h('input', {
                className: 'bv_designInput',
                placeholder: t('design.samplePlaceholder'),
                maxLength: 500,
                value: designText,
                onChange: (event) => setDesignText(event.target.value),
              })),
            h('div', { className: 'bv_designActions' },
              h('button', {
                type: 'button',
                className: 'bv_designPrimary',
                onClick: generateDesign,
                disabled: designing || designDesc.trim().length < 3,
              }, designing ? t('design.generating') : t('design.generate'))),
            designNote === '' ? null : h('span', { className: 'bv_designNote' }, designNote),
            designPreviews.length === 0 ? null : h('div', { className: 'bv_designResults' },
              h('span', { className: 'bv_designLabel' }, t('design.pick')),
              h('div', { className: 'bv_previewList' },
                designPreviews.map((preview, index) => h('div', {
                  key: preview.id,
                  className: 'bv_previewRow',
                  'data-selected': designSelected === preview.id ? '' : undefined,
                  onClick: () => {
                    setDesignSelected(preview.id);
                    if (designPlaying !== preview.id) playDesignPreview(preview.id);
                  },
                },
                h('span', {
                  className: 'bv_previewRadio',
                  'data-selected': designSelected === preview.id ? '' : undefined,
                }),
                h('span', { className: 'bv_previewName' }, `${t('design.voice')} ${index + 1}`),
                h('span', { className: 'bv_previewMeta' }, preview.duration ? `${preview.duration.toFixed(1)}s` : ''),
                h('button', {
                  type: 'button',
                  className: 'bv_btn',
                  onClick: (event) => {
                    event.stopPropagation();
                    playDesignPreview(preview.id);
                  },
                }, designPlaying === preview.id ? t('design.stop') : t('design.preview'))))),
              h('label', { className: 'bv_designField' },
                h('span', { className: 'bv_designLabel' }, t('design.name')),
                h('input', {
                  className: 'bv_designInput',
                  placeholder: t('design.namePlaceholder'),
                  maxLength: 80,
                  value: designName,
                  onChange: (event) => setDesignName(event.target.value),
                })),
              h('div', { className: 'bv_designActions' },
                h('button', {
                  type: 'button',
                  className: 'bv_designPrimary',
                  onClick: saveDesign,
                  disabled: designSaving || designSelected === '',
                }, designSaving ? t('design.saving') : t('design.save')))))) : null);
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        report('load', {});
        translate = ctx.locale.bind(NS);
        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = 'breezetts-dsh';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => tag.remove();
        }, 'breeze-voice: styles');

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'breeze-voice: dictionaries');

        ctx.effect(() => {
          const timer = setTimeout(() => {
            void onboardIfNeeded();
          }, 2500);
          return () => clearTimeout(timer);
        }, 'breeze-voice: onboarding');

        ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
          name: 'conversation.chat.assistant-actions',
          id: 'breezetts-dsh',
          order: 20,
          locale: NS,
        }, VoiceAction));

        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'breezetts-dsh-player',
          order: 20,
          locale: NS,
        }, ComposerVoiceBar));

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'breezetts-dsh-settings',
          order: 50,
          locale: NS,
        }, SettingsDialog));
      },
    };
  },
});
