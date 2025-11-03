# Module Federation 使用 demo

[![Deploy Status](https://github.com/wy2010344/module-federation-demo/actions/workflows/deploy-all.yml/badge.svg)](https://github.com/wy2010344/mf-circular-demo/actions)
[![MF1 Demo](https://img.shields.io/badge/MF1-Live%20Demo-green)](https://mf1-6az.pages.dev/)
[![MF2 Demo](https://img.shields.io/badge/MF2-Live%20Demo-blue)](https://mf2-8nl.pages.dev/)
[![MF3 Demo](https://img.shields.io/badge/MF3-Live%20Demo-pink)](https://mf3-6sa.pages.dev/)

一个展示 Module Federation 循环依赖的实际项目，包含两个相互消费组件的独立应用，部署在 Cloudflare Pages 上。

## 在线演示

- **MF1 应用**: https://mf1-6az.pages.dev/ - Module Federation 动态管理器
- **MF2 应用**: https://mf2-8nl.pages.dev/ - 电商仪表板应用
- **MF3 应用**: https://mf3-6sa.pages.dev/ - 组件库应用

## 项目特点

- 🚀 **动态管理器**: MF1 提供可视化的 Module Federation 管理界面
- 🔄 **循环依赖**: MF2 和 MF3 应用相互消费对方的组件
- ⚡ **动态加载**: 运行时动态加载远程组件
- 🏷️ **组件标识**: 每个组件都有来源标识
- 📋 **自动发现**: 自动获取远程模块的可用组件列表
- 🎯 **一键切换**: 支持生产环境和本地开发环境切换
- 🚀 **自动部署**: GitHub Actions + Cloudflare Pages

## 技术栈

- **Module Federation**: 微前端架构
- **Rsbuild**: 构建工具 (基于 Rspack)
- **React 18**: 前端框架
- **TypeScript**: 类型安全
- **Cloudflare Pages**: 部署平台

## 快速开始

### 安装依赖

```bash
git clone https://github.com/wy2010344/mf-circular-demo.git
cd mf-circular-demo
pnpm install
```

### 本地开发

```bash
# 启动 MF1 - 动态管理器 (端口 3002)
cd packages/mf_project_1
pnpm dev

# 启动 MF3 - 组件库 (端口 3000)
cd packages/mf_project_3
pnpm dev

# 启动 MF2 - 仪表板 (端口 3001)
cd packages/mf_project_2
pnpm dev
```

### 构建部署

```bash
# 构建所有项目
pnpm build

# 部署到 Cloudflare Pages
pnpm deploy
```

## 项目结构

```
├── packages/
│   ├── mf_project_1/          # MF1 - 动态管理器
│   │   ├── src/components/
│   │   │   ├── ModuleFederationManager.tsx  # 主管理器组件
│   │   │   ├── EntryForm.tsx               # Entry 表单组件
│   │   │   └── EntrySelector.tsx           # Entry 选择器组件
│   │   └── module-federation.config.ts
│   ├── mf_project_2/          # MF2 - 电商仪表板
│   │   ├── src/components/
│   │   │   ├── Dashboard.tsx      # 仪表板组件
│   │   │   └── CircularDemo.tsx   # 循环依赖演示
│   │   └── module-federation.config.ts
│   └── mf_project_3/          # MF3 - 组件库
│       ├── src/components/
│       │   ├── Button.tsx         # 按钮组件
│       │   ├── Tab.tsx           # 标签页组件
│       │   ├── ShoppingCart.tsx  # 购物车组件
│       │   └── RemoteComponentShowcase.tsx
│       └── module-federation.config.ts
└── .github/workflows/deploy-all.yml
```

## Module Federation 配置

### MF1 配置 (动态管理器)

```typescript
export default createModuleFederationConfig({
  name: 'mf_project_1',
  exposes: {
    './ModuleFederationManager': './src/components/ModuleFederationManager.tsx',
  },
  // 不依赖固定的远程模块，支持动态加载任意远程组件
})
```

### MF2 配置 (电商仪表板)

```typescript
export default createModuleFederationConfig({
  name: 'mf_project_2',
  exposes: {
    './Dashboard': './src/components/Dashboard.tsx',
    './CircularDemo': './src/components/CircularDemo.tsx',
  },
  remotes: {
    provider: 'mf_project_3@https://mf3-6sa.pages.dev/mf-manifest.json',
  },
})
```

### MF3 配置 (组件库)

```typescript
export default createModuleFederationConfig({
  name: 'mf_project_3',
  exposes: {
    './Button': './src/components/Button.tsx',
    './Tab': './src/components/Tab.tsx',
    './ShoppingCart': './src/components/ShoppingCart.tsx',
  },
  remotes: {
    provider: 'mf_project_2@https://mf2-8nl.pages.dev/mf-manifest.json',
  },
})
```

## 应用功能说明

### MF1 - 动态管理器

**核心功能**：

- 🎯 **可视化管理**: 提供直观的 Module Federation 管理界面
- 📋 **自动发现**: 自动获取远程模块的 manifest 文件并解析可用组件
- 🔄 **动态加载**: 支持运行时动态加载任意远程组件
- 💾 **配置持久化**: Entry 配置自动保存到 localStorage
- 🌐 **环境切换**: 预置生产和本地开发环境配置
- ⚡ **实时预览**: 选择组件后立即加载和展示

**使用场景**：

- Module Federation 项目的调试和测试
- 远程组件的快速预览和验证
- 不同环境下的组件兼容性测试

### MF2 - 电商仪表板

**核心功能**：

- 📊 **数据仪表板**: 展示电商相关的统计数据
- 🛒 **购物车集成**: 使用 MF3 的购物车组件
- 🎨 **UI 组件库**: 使用 MF3 的 Button、Tab 等基础组件

### MF3 - 组件库

**核心功能**：

- 🧩 **基础组件**: 提供 Button、Tab 等通用 UI 组件
- 🛒 **业务组件**: 提供 ShoppingCart 等业务相关组件
- 🔄 **远程展示**: 可以动态加载和展示其他应用的组件

## 循环依赖演示

1. **MF1** 可以动态加载 MF2 和 MF3 的任意组件
2. **MF2** 使用 MF3 的 Button、Tab、ShoppingCart 组件
3. **MF3** 可以动态加载 MF2 的 Dashboard、CircularDemo 组件
4. 形成完整的循环：MF1 ⇄ MF2 ⇄ MF3

## 自动部署

项目使用 GitHub Actions 自动部署到 Cloudflare Pages：

- 检测变化的项目
- 只构建和部署修改的应用
- 支持并行部署
- 配置驱动，易于扩展

## 环境要求

- Node.js 18+
- pnpm 8+

## 许可证

MIT
