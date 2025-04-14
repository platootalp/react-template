# LLM-UI 聊天界面 (React版)

这是一个使用 React + TypeScript 实现的类似 ChatGPT 的前端聊天界面，可以连接到任何兼容的 LLM API。

## 🌟 核心功能

- 高度仿真ChatGPT界面风格，包括侧边栏、消息气泡和输入框
- 支持发送消息和接收回复
- 支持 Markdown 渲染（包括代码高亮）
- 支持流式响应（类似 ChatGPT 打字效果）
- 支持多会话管理和历史记录
- 支持深色/浅色模式自动切换
- 响应式设计，适配移动端和桌面端
- 可配置 API 密钥和模型参数

## 🖥️ 界面预览

- **深色模式**: 默认模式，与ChatGPT界面高度一致
- **响应式设计**: 适配移动设备和桌面设备
- **会话管理**: 左侧边栏可管理多个会话
- **Markdown支持**: 支持代码块、表格、列表等格式化内容

## 🛠️ 技术栈

### 核心框架
- **React** - 使用函数式组件和Hooks
- **TypeScript** - 强类型，增强代码健壮性
- **Vite** - 更快的开发体验

### UI 组件库
- **Tailwind CSS** - 高效的 CSS 工具类框架

### 状态管理
- **Zustand** - 轻量级状态管理
- **Zustand Persist** - 状态持久化

### 通信与 API
- **Axios** - 处理 HTTP 请求，前后端通信
- **WebSocket** - 支持流式响应，类似 ChatGPT 流式对话
- **React-Markdown** - Markdown解析
- **React-Syntax-Highlighter** - 代码高亮
- **React Query** - 数据获取和缓存

## 📁 项目结构

```
llm-ui/
├── src/
│   ├── assets/        # 静态资源
│   ├── components/    # 组件
│   │   ├── chat/      # 聊天相关组件
│   │   └── common/    # 通用UI组件
│   ├── hooks/         # 自定义钩子
│   ├── services/      # API服务
│   ├── store/         # Zustand 状态管理
│   ├── types/         # TypeScript 类型定义
│   ├── pages/         # 页面视图
│   ├── App.tsx        # 主应用组件
│   └── main.tsx       # 应用入口
└── ...
```

## 🚀 如何开始

1. 安装依赖:
```bash
npm install
```

2. 配置环境变量:
   
创建 `.env.local` 文件并配置你的 API:
```
VITE_API_BASE_URL=https://你的api地址/api
VITE_WS_URL=wss://你的websocket地址/ws
```

3. 运行开发服务器:
```bash
npm run dev
```

4. 构建生产版本:
```bash
npm run build
```

## 📝 使用说明

1. **初始设置**: 
   - 首次使用时，点击右上角设置图标配置你的 API 密钥
   - 选择合适的 AI 模型和参数

2. **聊天功能**:
   - 创建新会话: 点击左侧边栏的"新对话"按钮
   - 发送消息: 在底部输入框输入内容，按回车键或点击发送按钮
   - 查看历史: 通过左侧会话列表切换不同的对话

3. **高级功能**:
   - 流式响应: 在设置中启用/禁用实时打字效果
   - 清空会话: 通过顶部工具栏的清空按钮删除当前会话的所有消息

## 🔌 API 集成

本项目可以连接到任何兼容的 LLM API，只要它支持以下端点:

- `/chat` - 发送消息并获取回复
- `/conversations` - 管理会话列表
- `/settings` - 更新用户设置

详细的 API 文档请参考 [API文档](API.md)

## 🔧 Vue转React重构说明

本项目是从Vue 3版本重构而来，主要完成了以下转换工作：

1. **框架转换**:
   - 从Vue 3的组合式API转换为React的函数式组件和Hooks
   - 从Vue模板系统转换为JSX
   
2. **状态管理**:
   - 从Pinia转换为Zustand
   - 保留了持久化存储功能
   
3. **路由系统**:
   - 从Vue Router转换为React Router
   - 保持了相同的路由结构
   
4. **样式系统**:
   - 保留了Tailwind CSS
   - CSS模块化逻辑从Vue SFC转为独立CSS或内联样式
   
5. **工具链**:
   - 保留Vite作为构建工具
   - 调整TypeScript配置以适应React

### 注意事项

- 部分TypeScript类型定义需要进一步完善
- 需要安装`@tailwindcss/typography`插件: `npm install -D @tailwindcss/typography`
- 如果遇到JSX相关的TypeScript错误，请确保`tsconfig.json`中的`jsx`设置为`react-jsx`

## 📄 许可证

MIT
