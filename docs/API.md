# API 文档

服务地址：`http://localhost:8000`

交互式文档：

- Swagger UI：`http://localhost:8000/docs`
- OpenAPI JSON：`http://localhost:8000/api/openapi.json`

## 认证

所有作文、历史、后台接口都需要请求头：

```http
Authorization: Bearer <access_token>
```

### 注册

`POST /api/auth/register`

```json
{
  "name": "Li Hua",
  "email": "lihua@example.com",
  "password": "Password123"
}
```

返回：

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

### 登录

`POST /api/auth/login`

```json
{
  "email": "lihua@example.com",
  "password": "Password123"
}
```

### 当前用户

`GET /api/auth/me`

## 作文批改

### 创建批改

`POST /api/essays/review`

```json
{
  "title": "CET Writing Practice",
  "prompt": "Should college students use AI tools to improve English writing?",
  "text": "Nowadays, English writing plays an important role..."
}
```

返回字段包含：

- `scores.total`：总分 0-100
- `scores.vocabulary`：词汇丰富度
- `scores.grammar`：语法准确性
- `scores.sentence_variety`：句式多样性
- `scores.coherence`：逻辑连贯性
- `scores.task_completion`：任务完成度
- `scores.cet6_prediction`：六级预测分数
- `scores.cet4_prediction`：四级预测分数
- `current_level`：当前作文等级
- `excellent_gap_analysis`：与优秀范文差距分析
- `improve_to_80`：提升到 80 分需要修改的内容
- `improve_to_90`：提升到 90 分需要修改的内容
- `highlights`：原文错误高亮位置
- `grammar_errors`：语法错误解释
- `spelling_errors`：拼写错误解释
- `advanced_expressions`：高级表达推荐
- `vocabulary_replacements`：替换词汇推荐
- `improvement_suggestions`：改进建议
- `polished_version`：AI 润色版本
- `high_score_sample`：AI 高分范文版本
- `optimized_translation`：AI 翻译优化
- `version_80`：80 分版本作文
- `version_90`：90 分版本作文
- `full_score_sample`：满分参考范文

### 历史列表

`GET /api/essays`

### 历史详情

`GET /api/essays/{review_id}`

## 后台管理

默认管理员：

- 邮箱：`admin@example.com`
- 密码：`Admin123456`

### 统计

`GET /api/admin/stats`

返回用户数量、批改次数和最近批改记录。
