#!/bin/bash

echo "========================================="
echo "Veritas 端到端集成测试"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试后端健康检查
echo "1. 测试后端健康检查..."
HEALTH=$(curl -s http://localhost:8000/)
if echo "$HEALTH" | grep -q "Veritas API"; then
    echo -e "${GREEN}✓ 后端服务器运行正常${NC}"
else
    echo -e "${RED}✗ 后端服务器未响应${NC}"
    exit 1
fi
echo ""

# 测试获取公司信息
echo "2. 测试获取公司信息 (LEGN)..."
COMPANY=$(curl -s http://localhost:8000/api/companies/LEGN)
if echo "$COMPANY" | grep -q "Legend Biotech"; then
    echo -e "${GREEN}✓ 公司信息获取成功${NC}"
    echo "$COMPANY" | python3 -m json.tool | head -8
else
    echo -e "${RED}✗ 公司信息获取失败${NC}"
    exit 1
fi
echo ""

# 测试分析端点
echo "3. 测试分析端点..."
ANALYSIS=$(curl -s -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker": "LEGN"}')

JOB_ID=$(echo "$ANALYSIS" | python3 -c "import sys, json; print(json.load(sys.stdin).get('job_id', ''))" 2>/dev/null)

if [ -n "$JOB_ID" ]; then
    echo -e "${GREEN}✓ 分析任务创建成功${NC}"
    echo "   Job ID: $JOB_ID"
else
    echo -e "${RED}✗ 分析任务创建失败${NC}"
    echo "$ANALYSIS"
    exit 1
fi
echo ""

# 获取分析结果
echo "4. 获取分析结果..."
RESULT=$(curl -s "http://localhost:8000/api/analyze/$JOB_ID")
STATUS=$(echo "$RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', ''))" 2>/dev/null)

if [ "$STATUS" = "completed" ]; then
    echo -e "${GREEN}✓ 分析完成${NC}"
    echo ""
    echo "=== 分析结果摘要 ==="
    echo "$RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'result' in data and data['result']:
    r = data['result']
    print(f\"公司: {r['company_name']} ({r['ticker']})\")
    print(f\"\\n业务实质还原:\")
    print(f\"  叙事身份: {r['analysis']['reality']['narrative_label']}\")
    print(f\"  经济身份: {r['analysis']['reality']['economic_label']}\")
    print(f\"  现实差距: {r['analysis']['reality']['reality_gap_score']}/10\")
    print(f\"\\n财务生存透视:\")
    print(f\"  现金跑道: {r['analysis']['survival']['runway_months']} 个月\")
    print(f\"  财务健康: {r['analysis']['survival']['financial_health']}\")
    print(f\"\\n战场推演:\")
    print(f\"  竞争对手: {', '.join(r['analysis']['competition']['competitors'])}\")
    print(f\"  Kill Switch: {r['analysis']['competition']['kill_switch']}\")
"
else
    echo -e "${RED}✗ 分析失败${NC}"
    echo "$RESULT" | python3 -m json.tool
    exit 1
fi
echo ""

# 测试前端
echo "5. 测试前端页面..."
FRONTEND=$(curl -s http://localhost:3000/ 2>&1)
if echo "$FRONTEND" | grep -q "Veritas"; then
    echo -e "${GREEN}✓ 前端页面加载成功${NC}"
else
    echo -e "${RED}✗ 前端页面加载失败${NC}"
    exit 1
fi
echo ""

# 测试前端测试页面
echo "6. 测试前端测试页面..."
TEST_PAGE=$(curl -s http://localhost:3000/test 2>&1)
if echo "$TEST_PAGE" | grep -q "API 测试页面"; then
    echo -e "${GREEN}✓ 测试页面加载成功${NC}"
else
    echo -e "${RED}✗ 测试页面加载失败${NC}"
    exit 1
fi
echo ""

echo "========================================="
echo -e "${GREEN}✓ 所有测试通过!${NC}"
echo "========================================="
echo ""
echo "访问地址:"
echo "  主页面: http://localhost:3000"
echo "  测试页面: http://localhost:3000/test"
echo "  API 文档: http://localhost:8000/docs"
echo ""
