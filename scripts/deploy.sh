#!/usr/bin/env bash
# 丢呗 · 一键 Docker 部署
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[33m%s\033[0m\n' "$1"; }
red() { printf '\033[31m%s\033[0m\n' "$1"; }

if ! command -v docker >/dev/null 2>&1; then
  red "未安装 Docker，请先安装: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  red "未安装 Docker Compose v2"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.production.example .env
  yellow "已生成 .env，请编辑 JWT_SECRET 后重新运行 deploy.sh"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a
HTTP_PORT="${HTTP_PORT:-80}"

if grep -q 'please-change-this' .env 2>/dev/null; then
  yellow "警告: JWT_SECRET 仍是默认值，生产环境请修改 .env"
fi

green "========== 构建并启动 =========="
docker compose build --no-cache
docker compose up -d

green "等待服务就绪..."
sleep 5

if curl -sf "http://127.0.0.1:${HTTP_PORT}/api/communities" >/dev/null; then
  green "✓ API 正常"
else
  yellow "API 可能仍在启动，请稍后访问"
fi

PORT="${HTTP_PORT}"
green ""
green "========== 部署完成 =========="
green "SAAS 运营端:  http://127.0.0.1:${PORT}/"
green "              登录 tenant / tenant123"
green "API 接口:     http://127.0.0.1:${PORT}/api/communities"
green "API 文档:     http://127.0.0.1:${PORT}/api/docs"
green ""
yellow "小程序 config.js 改为:"
yellow "  const API_BASE = 'https://你的域名.com/api';"
yellow ""
yellow "常用命令:"
yellow "  查看日志  docker compose logs -f"
yellow "  停止      docker compose down"
yellow "  重启      docker compose restart"
