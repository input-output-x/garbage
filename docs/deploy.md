# 极简部署指南（100 人以内）

一台服务器 + Docker，约 10 分钟上线。

## 服务器要求

- 系统：Linux（Ubuntu 22.04 推荐）或 macOS 本地试跑
- 配置：2核 2G 即可
- 软件：Docker + Docker Compose

```bash
# Ubuntu 安装 Docker（官方脚本）
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

## 一键部署

```bash
cd /path/to/garbage

# 1. 配置环境变量
cp .env.production.example .env
# 编辑 .env，修改 JWT_SECRET

# 2. 构建并启动
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

启动后：

| 服务 | 地址 |
|------|------|
| SAAS 运营端 | `http://服务器IP/` |
| API | `http://服务器IP/api/` |
| Swagger | `http://服务器IP/api/docs` |

默认账号：`tenant` / `tenant123`

## 绑定域名 + HTTPS（可选）

1. 域名 A 记录指向服务器 IP
2. 安装 certbot：

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

3. 把证书挂到 Nginx（可改用 `docker/nginx-ssl.conf`，或宿主机 Nginx 反代到 80 端口）

小程序 `apps/miniprogram/utils/config.js`：

```js
const API_BASE = 'https://yourdomain.com/api';
```

微信公众平台 → 开发 → 服务器域名 → 填 `yourdomain.com`

## 小程序

1. 微信开发者工具打开 `apps/miniprogram`
2. 改 `utils/config.js` 为线上 API 地址
3. 上传代码 → 提交审核

## 运维命令

```bash
docker compose logs -f      # 看日志
docker compose restart      # 重启
docker compose down         # 停止
docker compose up -d --build  # 更新代码后重新部署
```

## 说明

- 当前使用**内存数据库**，容器重启后订单/用户数据会清空（100 人内测可接受）
- 支付为**模拟支付**，正式收款需后续接入微信商户号
- 管理端（5174）未纳入 Docker，小规模只用 SAAS 即可
