# Veritas Backend API

FastAPI 后端服务，提供财报分析功能。

## 安装

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 环境变量

创建 `.env` 文件：

```env
ANTHROPIC_API_KEY=your_key_here
SEC_API_KEY=your_key_here
```

## 运行

```bash
uvicorn main:app --reload --port 8000
```

## API 端点

- `GET /` - 健康检查
- `GET /api/companies/{ticker}` - 获取公司基本信息
- `POST /api/analyze` - 分析公司财报
- `GET /api/analyze/{job_id}` - 查询分析结果
