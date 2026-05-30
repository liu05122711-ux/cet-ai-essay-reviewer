# Docker 部署文档

## 1. 准备环境变量

```powershell
Copy-Item backend/.env.example backend/.env
```

按需修改 `backend/.env`：

```env
JWT_SECRET=please-change-this-secret-at-least-16-chars
OPENAI_API_KEY=你的 OpenAI 兼容 API Key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

如果不配置 `OPENAI_API_KEY`，系统会使用本地启发式批改兜底，方便演示和开发。

## 2. 启动

```powershell
docker compose up --build
```

访问：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8000`
- API 文档：`http://localhost:8000/docs`

## 3. 默认管理员

- 邮箱：`admin@example.com`
- 密码：`Admin123456`

首次启动后后端会自动创建 SQLite 数据库和管理员账号。

## 4. 数据持久化

SQLite 数据库位于容器 `/app/data/app.db`，通过 `backend_data` volume 持久化。

清空数据：

```powershell
docker compose down -v
```

