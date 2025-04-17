# Ant Design Pro

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.

## Environment Prepare

Install `node_modules`:

```bash
npm install --legacy-peer-deps
```

> **注意**: 本项目存在依赖冲突，`@antv/l7-react@2.4.3` 要求 React 16 或 17 版本，而 `antd-style` 要求 React 18 版本。我们使用 `--legacy-peer-deps` 标志安装依赖以忽略这些冲突。
>
> 由于依赖冲突，项目可能会遇到一些与React Router相关的路由问题。详细解决方案请参阅 `docs/dependency-issues.md` 文档。

or

```bash
yarn install --ignore-engines
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
npm start
```

### Build project

```bash
npm run build
```

### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

### Test code

```bash
npm test
```

## More

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).
