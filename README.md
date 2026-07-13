# MagiesShell Website

MagiesShell 官方落地页（对应桌面客户端 [MagiesTerminal](https://github.com/JasonZhangDad/MgTerminal)）。

## 开发

```bash
npm install
npm run dev
```

本地地址：http://localhost:5174

## 构建

```bash
npm run build
npm run preview
```

产物输出到 `dist/`，可直接部署到静态托管。

## 官方下载镜像

下载区支持 **官方服务器** / **GitHub** 双源。默认走官方镜像：

- 清单：`https://shell.magies.top/releases/latest.json`
- 安装包：`https://shell.magies.top/releases/latest/<文件名>`

服务器用 `scripts/sync-github-releases.sh` 从 GitHub Release 拉取最新包，写入 `/var/www/shell.magies.top/releases/`，并删除旧版本目录。

### 部署步骤

1. 更新 nginx（`stats/deploy/shell.magies.top.conf`），确保包含 `/releases/` location 后 reload。
2. 把同步脚本放到服务器，例如 `/opt/magies-shell-site/scripts/sync-github-releases.sh`，并 `chmod +x`。
3. 首次手动同步：

```bash
sudo mkdir -p /var/www/shell.magies.top/releases
sudo chown ubuntu:ubuntu /var/www/shell.magies.top/releases
/opt/magies-shell-site/scripts/sync-github-releases.sh
```

4. 安装 systemd 定时任务（默认每 15 分钟检查一次）：

```bash
sudo cp stats/deploy/magies-shell-release-sync.service /etc/systemd/system/
sudo cp stats/deploy/magies-shell-release-sync.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now magies-shell-release-sync.timer
```

可选：在 `/etc/magies-shell/release-sync.env` 配置 `GITHUB_TOKEN=...` 以提高 GitHub API 限额，并取消 service 里 `EnvironmentFile` 行的注释。
