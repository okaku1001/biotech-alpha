# Veritas 后端快速启动指南

## 问题说明

由于 Python 3.14 太新，很多依赖包（如 pydantic-core）还不支持。我创建了一个简化版本，使用更少的依赖。

## 解决方案

### 方案 1：使用 Python 3.11/3.12（推荐）

如果您的系统有 Python 3.11 或 3.12：

```bash
# 删除旧的虚拟环境
rm -rf venv

# 使用 Python 3.11 创建新环境
python3.11 -m venv venv
# 或使用 Python 3.12
python3.12 -m venv venv

# 激活环境
source venv/bin/activate

# 安装依赖
pip install -r requirements-simple.txt

# 创建 .env 文件
cp .env.example .env
# 编辑 .env，填入您的 API Keys

# 启动服务器
python main-simple.py
```

### 方案 2：使用 Docker（最简单）

```bash
# 创建 Dockerfile
cat > Dockerfile <<EOF
FROM python:3.11-slim

WORKDIR /app

COPY requirements-simple.txt .
RUN pip install --no-cache-dir -r requirements-simple.txt

COPY . .

CMD ["python", "main-simple.py"]
EOF

# 构建镜像
docker build -t veritas-backend .

# 运行容器
docker run -p 8000:8000 --env-file .env veritas-backend
```

### 方案 3：直接运行（无虚拟环境）

```bash
# 全局安装依赖（不推荐，但可以快速测试）
pip3 install fastapi uvicorn anthropic python-dotenv httpx requests

# 创建 .env 文件
cp .env.example .env
# 编辑 .env，填入您的 API Keys

# 启动服务器
python3 main-simple.py
```

## 测试 API

启动后，访问：

```bash
# 健康检查
curl http://localhost:8000/

# 获取公司信息
curl http://localhost:8000/api/companies/LEGN

# 分析公司（需要 API Key）
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker": "LEGN"}'
```

## 简化版本的区别

**移除的功能：**
- ❌ sec-api 库（使用 SEC 官方 API 替代）
- ❌ ChromaDB（RAG 功能，后续添加）
- ❌ pypdf（PDF 解析，后续添加）

**保留的核心功能：**
- ✅ FastAPI 框架
- ✅ Claude API 集成
- ✅ SEC 数据获取
- ✅ 三个核心分析协议（Protocol A/B/C）

## 下一步

1. 确保后端能成功启动
2. 测试 API 端点
3. 前端连接后端
4. 验证端到端流程

## 故障排除

### 问题：端口 8000 被占用
```bash
# 查找占用端口的进程
lsof -i :8000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
python main-simple.py --port 8001
```

### 问题：ANTHROPIC_API_KEY 未设置
```bash
# 检查 .env 文件
cat .env

# 确保格式正确
ANTHROPIC_API_KEY=sk-ant-...
```

### 问题：CORS 错误
前端和后端必须在不同端口运行：
- 前端：http://localhost:3000
- 后端：http://localhost:8000
