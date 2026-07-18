# MagiesTerminal Website

MagiesTerminal 官方落地页（域名 [shell.magies.top](https://shell.magies.top)）。

## 开发

```bash
npm install
npm run dev
```

本地地址：http://localhost:5174

## 构建

```bash
# 日常构建
npm run build

# 发版前：同步上游中文 CHANGELOG（过滤 GitHub 相关行）再构建
npm run build:release
```

单独同步更新日志：

```bash
npm run sync:changelog
```

- `public/changelog.md` — 简体中文（同步脚本写入；UI `zh`）
- `public/changelog.en.md` — 英文（UI `en`；其它语言缺文件时回退）
- `public/changelog.{lang}.md` — 其它 UI 语言完整正文（`zh-TW` / `ja` / `ko` / `de` / `fr` / `es` / `pt` / `ru`）

官网弹窗「更新日志」随当前界面语言加载对应 markdown；切换语言时若弹窗已打开会自动重载。

法律页 `privacy.html` / `terms.html` 通过 `public/legal.js` 跟随 UI 语言（`?lang=` 或 `localStorage`），
并提供 **10 种语言完整正文**（zh / zh-TW / en / ja / ko / de / fr / es / pt / ru）。

## 部署

```bash
# 构建并 rsync 到 129（保留 stats/）
npm run deploy

# 先同步 changelog 再部署
npm run deploy:release
```

Nginx 参考配置：`stats/deploy/shell.magies.top.conf`  
（HTML/changelog 短缓存，`/assets/*` 长缓存 immutable；图片/字体改内容时请换文件名以穿透 CDN。）

GitHub Actions：`.github/workflows/sync-changelog.yml` 每日同步中文 changelog。

## 测试

```bash
npm test
```
