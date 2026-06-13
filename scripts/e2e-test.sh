#!/usr/bin/env bash
# 丢呗 API 端到端测试脚本
set -e
BASE=http://localhost:3000/api
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red() { printf '\033[31m%s\033[0m\n' "$1"; }
bold() { printf '\033[1m%s\033[0m\n' "$1"; }

assert_code() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    green "  ✓ $name"
    PASS=$((PASS + 1))
  else
    red "  ✗ $name (期望 code=$expected, 实际 code=$actual)"
    FAIL=$((FAIL + 1))
  fi
}

json() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null; }

bold "========== 丢呗 API 测试 =========="
echo ""

# 1. 健康检查 - 小区列表
bold "1. 基础数据"
COMM_RES=$(curl -s "$BASE/communities")
COMM_CODE=$(echo "$COMM_RES" | json "d['code']")
assert_code "获取小区列表" "0" "$COMM_CODE"
COMMUNITY_ID=$(echo "$COMM_RES" | json "d['data'][0]['id']")
COMMUNITY_NAME=$(echo "$COMM_RES" | json "d['data'][0]['name']")
echo "     小区: $COMMUNITY_NAME ($COMMUNITY_ID)"

PLAN_RES=$(curl -s "$BASE/packages/plans")
PLAN_CODE=$(echo "$PLAN_RES" | json "d['code']")
assert_code "获取套餐列表" "0" "$PLAN_CODE"
PLAN_COUNT=$(echo "$PLAN_RES" | json "len(d['data'])")
echo "     套餐数: $PLAN_COUNT"

REVIEW_RES=$(curl -s "$BASE/reviews?limit=3")
REVIEW_CODE=$(echo "$REVIEW_RES" | json "d['code']")
assert_code "获取用户评价" "0" "$REVIEW_CODE"

echo ""

# 2. 微信登录
bold "2. 用户登录"
LOGIN_RES=$(curl -s -X POST "$BASE/auth/wx/login" -H 'Content-Type: application/json' -d '{"code":"test-user"}')
LOGIN_CODE=$(echo "$LOGIN_RES" | json "d['code']")
assert_code "微信登录" "0" "$LOGIN_CODE"
TOKEN=$(echo "$LOGIN_RES" | json "d['data']['token']")
USER_ID=$(echo "$LOGIN_RES" | json "d['data']['user']['id']")
MEMBER_ID=$(echo "$LOGIN_RES" | json "d['data']['user']['memberId']")
echo "     用户ID: $USER_ID | 会员ID: $MEMBER_ID"
AUTH="Authorization: Bearer $TOKEN"

echo ""

# 3. 地址管理
bold "3. 地址管理"
ADDR_RES=$(curl -s -X POST "$BASE/addresses" -H 'Content-Type: application/json' -H "$AUTH" \
  -d "{\"communityId\":\"$COMMUNITY_ID\",\"building\":\"3栋\",\"unit\":\"2\",\"room\":\"1201\",\"contactName\":\"张先生\",\"contactPhone\":\"13800138000\",\"isDefault\":true}")
ADDR_CODE=$(echo "$ADDR_RES" | json "d['code']")
assert_code "新增地址" "0" "$ADDR_CODE"
ADDRESS_ID=$(echo "$ADDR_RES" | json "d['data']['id']")

LIST_ADDR=$(curl -s "$BASE/addresses" -H "$AUTH")
assert_code "地址列表" "0" "$(echo "$LIST_ADDR" | json "d['code']")"

echo ""

# 4. 购买套餐
bold "4. 套餐购买"
PKG_RES=$(curl -s -X POST "$BASE/packages/purchase" -H 'Content-Type: application/json' -H "$AUTH" \
  -d '{"planId":"plan-month"}')
PKG_CODE=$(echo "$PKG_RES" | json "d['code']")
assert_code "购买月卡" "0" "$PKG_CODE"
REMAINING=$(echo "$PKG_RES" | json "d['data']['remainingTimes']")
PLAN_NAME=$(echo "$PKG_RES" | json "d['data']['planName']")
echo "     $PLAN_NAME 剩余次数: $REMAINING"

MY_PKG=$(curl -s "$BASE/packages/my" -H "$AUTH")
assert_code "查询当前套餐" "0" "$(echo "$MY_PKG" | json "d['code']")"

echo ""

# 5. 套餐抵扣下单
bold "5. 套餐抵扣下单"
ORDER_PKG=$(curl -s -X POST "$BASE/orders" -H 'Content-Type: application/json' -H "$AUTH" \
  -d "{\"communityId\":\"$COMMUNITY_ID\",\"addressId\":\"$ADDRESS_ID\",\"garbageType\":\"kitchen\",\"quantity\":1,\"usePackage\":true}")
ORDER_PKG_CODE=$(echo "$ORDER_PKG" | json "d['code']")
assert_code "套餐下单" "0" "$ORDER_PKG_CODE"
ORDER_ID=$(echo "$ORDER_PKG" | json "d['data']['id']")
ORDER_STATUS=$(echo "$ORDER_PKG" | json "d['data']['status']")
ORDER_PAY=$(echo "$ORDER_PKG" | json "d['data']['payMethod']")
ORDER_AMOUNT=$(echo "$ORDER_PKG" | json "d['data']['totalAmount']")
echo "     订单: $ORDER_ID | 状态: $ORDER_STATUS | 支付: $ORDER_PAY | 金额: $ORDER_AMOUNT"

if [ "$ORDER_STATUS" = "paid" ] && [ "$ORDER_AMOUNT" = "0" ]; then
  green "  ✓ 套餐抵扣逻辑正确"
  PASS=$((PASS + 1))
else
  red "  ✗ 套餐抵扣逻辑异常"
  FAIL=$((FAIL + 1))
fi

AFTER_PKG=$(curl -s "$BASE/packages/my" -H "$AUTH")
AFTER_TIMES=$(echo "$AFTER_PKG" | json "d['data']['remainingTimes']")
echo "     扣次后剩余: $AFTER_TIMES"
if [ "$AFTER_TIMES" = "$((REMAINING - 1))" ]; then
  green "  ✓ 套餐次数扣减正确"
  PASS=$((PASS + 1))
else
  red "  ✗ 套餐次数扣减异常 (期望 $((REMAINING - 1)), 实际 $AFTER_TIMES)"
  FAIL=$((FAIL + 1))
fi

echo ""

# 6. 单次付费下单
bold "6. 单次付费下单"
ORDER_SINGLE=$(curl -s -X POST "$BASE/orders" -H 'Content-Type: application/json' -H "$AUTH" \
  -d "{\"communityId\":\"$COMMUNITY_ID\",\"addressId\":\"$ADDRESS_ID\",\"garbageType\":\"other\",\"quantity\":2,\"usePackage\":false}")
SINGLE_CODE=$(echo "$ORDER_SINGLE" | json "d['code']")
assert_code "单次下单" "0" "$SINGLE_CODE"
SINGLE_ID=$(echo "$ORDER_SINGLE" | json "d['data']['id']")
SINGLE_STATUS=$(echo "$ORDER_SINGLE" | json "d['data']['status']")

PAY_RES=$(curl -s -X POST "$BASE/orders/$SINGLE_ID/pay" -H "$AUTH")
assert_code "模拟微信支付" "0" "$(echo "$PAY_RES" | json "d['code']")"
echo "     单次订单: $SINGLE_ID | 支付后状态: $(echo "$PAY_RES" | json "d['data']['status']")"

echo ""

# 7. SAAS 派单流程
bold "7. SAAS 派单流程"
ASSIGN_RES=$(curl -s -X POST "$BASE/orders/$ORDER_ID/assign" -H 'Content-Type: application/json' \
  -d '{"riderId":"rider-demo-001"}')
assert_code "派单给骑手" "0" "$(echo "$ASSIGN_RES" | json "d['code']")"

for STATUS in picked_up disposed completed; do
  STATUS_RES=$(curl -s -X PATCH "$BASE/orders/$ORDER_ID/status" -H 'Content-Type: application/json' \
    -d "{\"status\":\"$STATUS\"}")
  assert_code "订单状态 → $STATUS" "0" "$(echo "$STATUS_RES" | json "d['code']")"
done

echo ""

# 8. 订单评价
bold "8. 订单评价"
REVIEW_ORDER=$(curl -s -X POST "$BASE/orders/$ORDER_ID/review" -H 'Content-Type: application/json' -H "$AUTH" \
  -d '{"rating":5,"content":"非常满意"}')
assert_code "提交评价" "0" "$(echo "$REVIEW_ORDER" | json "d['code']")"

echo ""

# 9. 订单列表 Tab
bold "9. 订单列表"
ALL_ORDERS=$(curl -s "$BASE/orders?userId=$USER_ID" -H "$AUTH")
assert_code "全部订单" "0" "$(echo "$ALL_ORDERS" | json "d['code']")"
TOTAL=$(echo "$ALL_ORDERS" | json "d['data']['total']")
echo "     订单总数: $TOTAL"

ONGOING=$(curl -s "$BASE/orders?userId=$USER_ID&tab=ongoing" -H "$AUTH")
DONE=$(curl -s "$BASE/orders?userId=$USER_ID&tab=done" -H "$AUTH")
assert_code "进行中 Tab" "0" "$(echo "$ONGOING" | json "d['code']")"
assert_code "已完成 Tab" "0" "$(echo "$DONE" | json "d['code']")"
echo "     进行中: $(echo "$ONGOING" | json "d['data']['total']") | 已完成: $(echo "$DONE" | json "d['data']['total']")"

echo ""

# 10. SAAS 登录
bold "10. SAAS 运营端"
SAAS_LOGIN=$(curl -s -X POST "$BASE/auth/admin/login" -H 'Content-Type: application/json' \
  -d '{"username":"tenant","password":"tenant123"}')
assert_code "租户管理员登录" "0" "$(echo "$SAAS_LOGIN" | json "d['code']")"

echo ""
bold "========== 测试结果 =========="
green "通过: $PASS"
if [ "$FAIL" -gt 0 ]; then
  red "失败: $FAIL"
  exit 1
else
  green "全部通过 ✓"
  exit 0
fi
