# 丢呗 · 代扔垃圾 SaaS 平台

面向忙碌人群的**上门代扔垃圾**微信小程序，参考「丢呗」类产品模式，支持多城市、多小区运营商加盟的 SaaS 架构。

## 产品端

| 端 | 目录 | 使用者 | 说明 |
|---|---|---|---|
| 微信小程序 | `apps/miniprogram` | C 端用户 | 下单、支付、订单跟踪、地址管理 |
| SAAS 运营端 | `apps/saas-web` | 加盟商/物业/运营公司 | 接单、派单、定价、小区配置、骑手管理 |
| 平台管理端 | `apps/admin-web` | 平台方 | 租户开通、计费、全局配置、数据大盘 |
| API 服务 | `apps/api` | — | 统一后端，多租户隔离 |

## 核心业务流程

```
用户下单 → 选择垃圾类型/袋数/时段 → 微信支付
    → 运营端自动/手动派单 → 骑手上门取袋（用户已分好类）
    → 骑手投放到指定点位 → 用户确认完成 → 评价/积分
```

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 9
- MySQL 8 / Redis（生产环境）
- 微信开发者工具

### 安装依赖

```bash
pnpm install
```

### 启动 API（开发模式，内存库）

```bash
pnpm dev:api
# http://localhost:3000/api
# Swagger: http://localhost:3000/api/docs
```

### 启动 SAAS / 管理端

```bash
pnpm dev:saas    # http://localhost:5173
pnpm dev:admin   # http://localhost:5174
```

### 微信小程序

1. 用微信开发者工具打开 `apps/miniprogram`
2. 在 `project.config.json` 填入你的 AppID
3. 开发阶段可勾选「不校验合法域名」，API 指向 `http://localhost:3000`

## 配置说明

复制环境变量模板：

```bash
cp apps/api/.env.example apps/api/.env
```

关键项：`WECHAT_APP_ID`、`WECHAT_APP_SECRET`、数据库连接、JWT 密钥。

## 目录结构

```
garbage/
├── apps/
│   ├── api/           # NestJS 后端
│   ├── miniprogram/   # 微信小程序
│   ├── saas-web/      # SAAS 运营端
│   └── admin-web/     # 平台管理端
├── packages/
│   └── shared/        # 共享类型与常量
└── docs/
    └── architecture.md
```

## 商业模式参考（滴垃/丢呗类）

- **代扔服务费**：按袋/按公斤，如 3kg 内餐厨/其他垃圾 3 元/袋
- **大件垃圾**：床、衣柜等单独报价
- **回收**：纸皮、塑料瓶等有偿回收
- **SaaS 订阅**：向运营商收取月费 + 订单抽成

## 许可证

MIT
# garbage
