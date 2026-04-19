# 项目管理看板

一个用于练习 React、TypeScript 和前端工程化基础的小型项目管理看板。项目重点不是完整产品功能，而是通过看板场景练习组件拆分、状态管理、类型建模和拖拽交互。

## 技术栈

- React 19
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- dnd-kit
- Zustand
- Immer

## 当前功能

- 展示阶段列表
- 展示任务卡片
- 新增阶段
- 新增任务
- 拖拽任务到阶段或任务位置
- 使用 mock 数据初始化看板

## 目录结构

```txt
src/
  app/                  # 路由配置
  components/           # 页面组件和通用 UI 组件
  features/board/       # 看板业务类型
  mocks/                # 本地 mock 数据
  pages/                # 页面入口
  store/                # Zustand 状态管理
```

## 常用命令

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm preview
```

## 学习重点

- 用 TypeScript 描述看板业务数据
- 区分业务 id 和拖拽 id
- 通过 props 设计表达组件职责
- 用 Zustand 管理看板状态
- 用 Immer 简化嵌套数组更新
- 用 dnd-kit 实现拖拽交互

## 当前可继续优化

- 将 `boardColumn` 命名为更自然的 `columns`
- 让 `onAddTask` 接收 `columnId`，减少父组件里的 `bind`
- 为拖拽 `data` 增加更明确的类型收窄
- 继续完善任务拖拽到无效目标时的边界处理
- 让 mock factory 和 fixture 更统一地复用业务类型
