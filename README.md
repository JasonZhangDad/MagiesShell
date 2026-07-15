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

# 发版前：同步上游 CHANGELOG（过滤 GitHub 相关行）再构建
npm run build:release
```

单独同步更新日志：

```bash
npm run sync:changelog
```

产物输出到 `dist/`。

## 部署

将 `dist/` rsync 到源站（保留 `stats/`）：

```bash
rsync -avz --delete --exclude 'stats' --exclude 'stats/' dist/ zhoumi:/var/www/shell.magies.top/
```

Nginx 参考配置：`stats/deploy/shell.magies.top.conf`  
（HTML/changelog 短缓存，`/assets/*` 长缓存 immutable；图片/字体改内容时请换文件名以穿透 CDN。）

## 测试

```bash
npm test
```
