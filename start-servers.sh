#!/bin/bash

# Veritas 快速启动脚本
# 用于启动前端和后端服务器

echo "========================================="
echo "Veritas 快速启动"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查并停止旧的服务器
echo "1. 清理旧的服务器进程..."
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
sleep 1
echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# 启动后端服务器
echo "2. 启动后端服务器 (端口 8000)..."
cd /Users/zeyuansun/veritas-demo/backend
python3 main-simple.py > /tmp/veritas-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# 检查后端是否启动成功
if curl -s http://localhost:8000/ | grep -q "Veritas API"; then
    echo -e "${GREEN}✓ 后端服务器启动成功 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ 后端服务器可能未正常启动,请检查日志: /tmp/veritas-backend.log${NC}"
fi
echo ""

# 启动前端服务器
echo "3. 启动前端服务器 (端口 3000)..."
cd /Users/zeyuansun/veritas-demo
npm run dev > /tmp/veritas-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# 检查前端是否启动成功
if curl -s http://localhost:3000/ 2>&1 | grep -q "Veritas"; then
    echo -e "${GREEN}✓ 前端服务器启动成功 (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ 前端服务器可能未正常启动,请检查日志: /tmp/veritas-frontend.log${NC}"
fi
echo ""

echo "========================================="
echo -e "${GREEN}✓ 启动完成!${NC}"
echo "========================================="
echo ""
echo "访问地址:"
echo "  主页面:   http://localhost:3000"
echo "  测试页面: http://localhost:3000/test"
echo "  API 文档: http://localhost:8000/docs"
echo ""
echo "进程信息:"
echo "  后端 PID: $BACKEND_PID"
echo "  前端 PID: $FRONTEND_PID"
echo ""
echo "日志文件:"
echo "  后端日志: /tmp/veritas-backend.log"
echo "  前端日志: /tmp/veritas-frontend.log"
echo ""
echo "停止服务:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  或运行: ./stop-servers.sh"
echo ""
