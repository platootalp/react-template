# LLM-UI API 集成文档

本文档详细说明了前端应用如何与 LLM 后端服务进行交互。

## 基础配置

在 `.env` 或 `.env.local` 文件中配置以下环境变量：

```
VITE_API_BASE_URL=http://localhost:3000/api  # REST API 基础地址
VITE_WS_URL=ws://localhost:3000/ws           # WebSocket 连接地址
```

## API 端点

### 1. 聊天接口

#### 发送消息 (HTTP)

```
POST /chat
```

请求体:
```json
{
  "message": "你好，请帮我解释什么是机器学习？",
  "conversation_id": "conv_123456",  // 可选，不提供则创建新会话
  "model": "gpt-3.5-turbo",          // 可选，使用的模型
  "temperature": 0.7,                // 可选，创造性参数
  "stream": true                     // 可选，是否使用流式响应
}
```

响应 (非流式):
```json
{
  "id": "msg_789012",
  "content": "机器学习是人工智能的一个子领域...",
  "conversation_id": "conv_123456",
  "created_at": "2023-11-01T12:34:56Z",
  "role": "assistant"
}
```

#### 流式响应 (WebSocket)

连接:
```
WebSocket: ${VITE_WS_URL}/chat
```

发送消息:
```json
{
  "message": "你好，请帮我解释什么是机器学习？",
  "conversation_id": "conv_123456",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7
}
```

接收响应 (多个事件):
```json
{
  "type": "chunk",
  "id": "msg_789012",
  "content": "机器",
  "conversation_id": "conv_123456",
  "role": "assistant"
}
// 后续多个 chunk 事件
{
  "type": "done",
  "id": "msg_789012",
  "conversation_id": "conv_123456"
}
```

### 2. 会话管理

#### 获取会话列表

```
GET /conversations
```

响应:
```json
{
  "conversations": [
    {
      "id": "conv_123456",
      "title": "关于机器学习的讨论",
      "created_at": "2023-11-01T12:30:00Z",
      "updated_at": "2023-11-01T12:45:00Z"
    },
    // 更多会话...
  ]
}
```

#### 获取单个会话详情

```
GET /conversations/{conversation_id}
```

响应:
```json
{
  "id": "conv_123456",
  "title": "关于机器学习的讨论",
  "messages": [
    {
      "id": "msg_123",
      "content": "你好，请帮我解释什么是机器学习？",
      "role": "user",
      "created_at": "2023-11-01T12:34:00Z"
    },
    {
      "id": "msg_789012",
      "content": "机器学习是人工智能的一个子领域...",
      "role": "assistant",
      "created_at": "2023-11-01T12:34:56Z"
    }
    // 更多消息...
  ],
  "created_at": "2023-11-01T12:30:00Z",
  "updated_at": "2023-11-01T12:45:00Z"
}
```

#### 创建新会话

```
POST /conversations
```

请求体:
```json
{
  "title": "新会话标题"  // 可选，不提供则自动生成
}
```

响应:
```json
{
  "id": "conv_789012",
  "title": "新会话标题",
  "created_at": "2023-11-02T09:00:00Z",
  "updated_at": "2023-11-02T09:00:00Z"
}
```

#### 更新会话标题

```
PATCH /conversations/{conversation_id}
```

请求体:
```json
{
  "title": "更新后的标题"
}
```

响应:
```json
{
  "id": "conv_123456",
  "title": "更新后的标题",
  "updated_at": "2023-11-02T10:00:00Z"
}
```

#### 删除会话

```
DELETE /conversations/{conversation_id}
```

响应:
```
Status: 204 No Content
```

### 3. 用户设置

#### 获取当前设置

```
GET /settings
```

响应:
```json
{
  "default_model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "api_key": "sk-***",  // 通常会被隐藏或部分展示
  "theme": "auto",
  "language": "zh-CN"
}
```

#### 更新设置

```
PUT /settings
```

请求体:
```json
{
  "default_model": "gpt-4",
  "temperature": 0.5,
  "api_key": "sk-newkey123456",
  "theme": "dark",
  "language": "en-US"
}
```

响应:
```json
{
  "default_model": "gpt-4",
  "temperature": 0.5,
  "api_key": "sk-***",
  "theme": "dark",
  "language": "en-US"
}
```

## 错误处理

所有 API 在出错时返回相应的 HTTP 状态码和 JSON 格式的错误信息:

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "提供的 API 密钥无效或已过期",
    "status": 401
  }
}
```

常见错误代码:
- `invalid_api_key`: API 密钥无效
- `rate_limited`: 请求频率受限
- `not_found`: 资源不存在
- `server_error`: 服务器内部错误
- `validation_error`: 请求参数验证失败

## 模型支持

当前支持的模型列表可通过以下接口获取:

```
GET /models
```

响应:
```json
{
  "models": [
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "description": "OpenAI 的 GPT-3.5 Turbo 模型",
      "max_tokens": 4096,
      "price_per_1k_tokens": 0.002
    },
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "description": "OpenAI 的 GPT-4 模型",
      "max_tokens": 8192,
      "price_per_1k_tokens": 0.06
    }
    // 更多模型...
  ]
}
``` 