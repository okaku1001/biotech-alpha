#!/bin/bash

# Veritas 停止服务器脚本

echo "停止 Veritas 服务器..."

# 停止端口 8000 (后端)
echo "停止后端服务器 (端口 8000)..."
lsof -ti :8000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ 后端服务器已停止"
else
    echo "  (没有运行中的后端服务器)"
fi

# 停止端口 3000 (前端)
echo "停止前端服务器 (端口 3000)..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ 前端服务器已停止"
else
    echo "  (没有运行中的前端服务器)"
fi

echo ""
echo "所有服务器已停止"
