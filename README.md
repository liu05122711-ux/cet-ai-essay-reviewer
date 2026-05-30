# 大学英语四六级AI作文批改系统

一个完整可运行的全栈项目：Next.js 15 + TypeScript + Tailwind CSS 前端，FastAPI + Python 3.12 后端，SQLite 数据库，支持 OpenAI 兼容 API 作文批改。

## 功能

- 注册、登录、JWT 认证
- 粘贴英语作文自动评分
- 总分、词汇、语法、句式、逻辑、任务完成度评分
- 四级、六级预测分数
- 当前作文等级
- 基于近10年四六级真题评分口径的差距分析
- 提升到 80 分、90 分的修改清单
- 80 分版本作文、90 分版本作文、满分参考范文
- 原文展示与错误高亮
- 语法错误、拼写错误解释
- 高级表达和替换词汇推荐
- 改进建议
- AI 润色版本
- AI 高分范文版本
- AI 翻译优化
- 一键复制结果
- 保存并查看历史批改记录
- 后台统计用户数量和批改次数
- Docker 与 docker-compose 部署

## 项目结构

```text
.
├── backend
│   ├── app
│   │   ├── api
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── deps.py
│   │   │   └── essays.py
│   │   ├── core
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models
│   │   │   ├── essay.py
│   │   │   ├── init_db.py
│   │   │   └── user.py
│   │   ├── schemas
│   │   │   ├── auth.py
│   │   │   └── essay.py
│   │   ├── services
│   │   │   └── ai_review.py
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend
│   ├── app
│   │   ├── dashboard
│   │   ├── login
│   │   ├── register
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   ├── lib
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docs
│   ├── API.md
│   ├── DATABASE.md
│   └── DOCKER.md
└── docker-compose.yml
```

## 本地开发

### 后端

```powershell
cd backend
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端地址：`http://localhost:8000`

### 前端

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

前端地址：`http://localhost:3000`

## AI 配置

在 `backend/.env` 中配置 OpenAI 兼容 API：

```env
OPENAI_API_KEY=你的Key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

兼容其它服务商时，只要服务商支持 `/chat/completions` 格式，修改 `OPENAI_BASE_URL` 和 `OPENAI_MODEL` 即可。

未配置 `OPENAI_API_KEY` 时，后端会使用本地启发式评分兜底，保证项目可直接运行。

## Docker 运行

```powershell
Copy-Item backend/.env.example backend/.env
docker compose up --build
```

访问 `http://localhost:3000`。

## 默认管理员

- 邮箱：`admin@example.com`
- 密码：`Admin123456`

## 文档

- API 文档：[docs/API.md](docs/API.md)
- 数据库设计：[docs/DATABASE.md](docs/DATABASE.md)
- Docker 部署：[docs/DOCKER.md](docs/DOCKER.md)
