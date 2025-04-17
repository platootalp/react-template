# 依赖问题与解决方案

## 问题描述

本项目在依赖安装过程中遇到了依赖冲突问题。主要冲突是：

1. `@antv/l7-react@2.4.3` 要求 React 16.8.6 或 17.0.2 版本
2. `antd-style@3.7.1` 要求 React 18 版本

错误信息:
```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: ant-design-pro@6.0.0
npm error Found: react@18.3.1
npm error node_modules/react
npm error   react@"^18.2.0" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@"^16.8.6 || ^17.0.2" from @antv/l7-react@2.4.3
npm error node_modules/@antv/l7-react
npm error   @antv/l7-react@"^2.4.3" from the root project
```

## 解决方案

我们考虑了以下几种解决方案：

### 方案1：降级 React 到 17.x 版本

这个方案尝试将 React 降级到 17.0.2 版本，以满足 `@antv/l7-react` 的要求。但是这会导致与 `antd-style` 的新冲突，因为它要求 React 18。

修改 package.json:
```json
"react": "^17.0.2",
"react-dom": "^17.0.2",
"@types/react": "^17.0.38",
"@types/react-dom": "^17.0.11"
```

### 方案2：升级 @antv/l7-react 到支持 React 18 的版本

经查找，目前 `@antv/l7-react` 最新版本 (2.4.3) 仍然不支持 React 18。

### 方案3：使用 --legacy-peer-deps 标志（最终采用）

使用 `--legacy-peer-deps` 标志安装依赖，忽略对等依赖冲突。这是临时解决方案，但对于当前情况是最实用的。

```bash
npm install --legacy-peer-deps
```

或者使用 yarn:
```bash
yarn install --ignore-engines
```

## 潜在风险

使用 `--legacy-peer-deps` 标志可能会导致一些运行时兼容性问题，特别是在 React 组件交互方面。如果遇到奇怪的渲染问题或组件行为异常，这可能是依赖冲突导致的。

## 依赖冲突导致的路由问题

### 问题描述

在使用 `--legacy-peer-deps` 安装依赖后，项目启动时出现了路由错误：

```
Uncaught Error: Absolute route path "/*" nested under path "/user" is not valid. An absolute child route path must start with the combined path of all its parent routes.
```

这个错误是由于 React Router 版本兼容性问题导致的。在 React Router v6 中，嵌套路由不应该使用绝对路径（如 `/*`），而应该使用相对路径（如 `*`）。

### 解决方案

在 `config/routes.ts` 文件中，将 `/user` 路由下的 404 路由路径从绝对路径改为相对路径：

```diff
{
  component: '404',
- path: '/*',
+ path: '*',
},
```

## 长期解决方案

1. 等待 `@antv/l7-react` 更新支持 React 18
2. 考虑替换 `@antv/l7-react` 为其他支持 React 18 的地图组件库
3. 如果 `@antv/l7-react` 功能对项目至关重要，考虑降级整个项目到 React 17，并相应调整其他依赖

## 后续监控

在项目的开发和测试过程中，需要密切关注是否有因为依赖冲突导致的问题。如果发现，记录在此文档中，并探索更彻底的解决方案。 