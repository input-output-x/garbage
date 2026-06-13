# 丢呗 · 微信小程序

用户端小程序，需在 **微信开发者工具** 中运行（不能像 SAAS 那样用浏览器打开）。

## 快速启动

### 1. 启动后端（必须）

```bash
cd /Users/master/garbage
npx pnpm@9 dev:api
```

API 地址：`http://localhost:3000/api`

### 2. 打开微信开发者工具

**方式 A：命令行（Mac）**

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project "/Users/master/garbage/apps/miniprogram"
```

**方式 B：手动**

1. 打开「微信开发者工具」
2. 导入项目 → 目录选择：
   ```
   /Users/master/garbage/apps/miniprogram
   ```
3. AppID 选「测试号」或「游客模式」（项目里默认 `touristappid`）

### 3. 开发设置（重要）

在微信开发者工具右上角 **详情 → 本地设置**，勾选：

- ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
- ✅ 不校验 Secure Connection

否则无法访问 `http://localhost:3000`。

## 体验流程

1. **首页** → 选小区「保利学府」
2. **套餐服务** → 购买月卡
3. **单次服务** → 选垃圾类型 → 下单（可勾选套餐抵扣）
4. **订单 Tab** → 查看订单
5. **我的** → 地址管理、联系客服

## 与 SAAS 联动

| 端 | 地址 | 账号 |
|---|---|---|
| 小程序 | 微信开发者工具 | 自动微信登录 |
| SAAS 运营端 | http://localhost:5173/login | tenant / tenant123 |
| API | http://localhost:3000/api/docs | — |

在 SAAS 端给订单「派单」后，小程序订单状态会更新。

## 配置

API 地址：`utils/config.js` → `API_BASE`

上线前改为 HTTPS 域名，并在微信公众平台配置 request 合法域名。
