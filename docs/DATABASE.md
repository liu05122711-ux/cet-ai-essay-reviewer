# 数据库设计

当前使用 SQLite，连接串通过 `DATABASE_URL` 配置：

```env
DATABASE_URL=sqlite:///./data/app.db
```

后期切换 PostgreSQL 时，可改为类似：

```env
DATABASE_URL=postgresql+psycopg://user:password@db:5432/cet_essay
```

届时需要补充 PostgreSQL 驱动并引入 Alembic 迁移。

## users

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Integer PK | 用户 ID |
| email | String unique | 登录邮箱 |
| name | String | 用户昵称 |
| hashed_password | String | bcrypt 密码哈希 |
| is_admin | Boolean | 是否管理员 |
| created_at | DateTime | 创建时间 |

## essay_reviews

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Integer PK | 批改记录 ID |
| user_id | ForeignKey(users.id) | 所属用户 |
| title | String | 作文标题 |
| prompt | Text nullable | 作文题目 |
| original_text | Text | 原文 |
| result | JSON | AI 批改结果 |
| created_at | DateTime | 创建时间 |

`result` 使用 JSON 字段保存评分、错误高亮、解释、推荐表达、润色版本、高分范文和翻译优化结果。这样在 SQLite 下可直接运行，迁移到 PostgreSQL 时可自然映射为 JSON/JSONB。

