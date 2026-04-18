# 当前项目实现评审与改进建议

这份记录基于当前工作区代码重新评审，重点看 React、TypeScript、组件设计、mock 数据、拖拽集成、样式组织和工程化规范。

先说结论：项目已经具备一个看板应用的基本骨架，路由、布局、Board、Column、Item、mock 数据都已经拆出来了，这说明你已经开始建立“页面 -> 业务组件 -> 子组件 -> 数据来源”的分层意识。但当前实现还停留在“能展示、能点击新增”的阶段，距离更专业的前端写法主要差在类型模型、组件接口、拖拽闭环、数据职责边界和工程细节。

## 本次检查结果

- `pnpm lint`：通过。
- `pnpm build`：失败。
- 构建失败原因：`src/components/Board/components/BoardColumn.tsx:17` 的 `event` 参数是隐式 `any`。

这说明当前问题不只是风格优化，已经有一个会阻塞生产构建的 TypeScript 问题，需要优先处理。

## 1. 拖拽事件参数没有类型，已经阻塞构建

位置：

- `src/components/Board/components/BoardColumn.tsx:17`

当前问题：

```tsx
const dragEndHandler = event => {
  if (event.canceled) return;
};
```

为什么不够专业：

- TypeScript 项目里，事件处理函数不能依赖隐式 `any`。
- `lint` 通过但 `build` 失败，说明仅跑 `pnpm lint` 不足以验证项目健康度。
- 拖拽事件是业务交互的核心入口，如果这里没有类型，后续读 `source`、`target`、`canceled` 等字段时很容易写错。

更标准的写法方向：

```tsx
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';

const dragEndHandler = (event: DragEndEvent) => {
  if (event.canceled) return;
};
```

这里的关键不是“为了消掉报错而加类型”，而是让编辑器和 TypeScript 帮你确认拖拽事件到底有哪些字段。以后你写移动任务逻辑时，类型会反过来引导你理解 dnd-kit 的数据结构。

## 2. 拖拽功能目前只是接入了 API，还没有完成业务闭环

位置：

- `src/components/Board/components/BoardColumn.tsx:1`
- `src/components/Board/components/BoardColumn.tsx:21`
- `src/components/Board/components/BoardItem.tsx:8`
- `src/components/Board/components/BoardItem.tsx:9`

当前问题：

- `BoardColumn` 里包了 `DragDropProvider`。
- `BoardItem` 同时调用了 `useDraggable` 和 `useDroppable`。
- `dragEndHandler` 只判断了 `event.canceled`，没有真正更新任务所属列或任务顺序。

为什么不够专业：

- 拖拽库不是“给元素挂 hook 就完成了”，核心是拖拽结束后要根据源位置和目标位置更新状态。
- 现在每个列组件内部各自创建一个 `DragDropProvider`，这会让跨列拖拽很难做，因为跨列移动本质上需要一个更上层的统一拖拽上下文。
- `BoardItem` 同时是 draggable 和 droppable 不一定错，但如果没有明确的排序规则，会让后续逻辑变得混乱：到底是“拖到卡片上排序”，还是“拖到列里移动”？

更标准的设计方向：

- 把 `DragDropProvider` 放到 `Board` 层，让整个看板共享一个拖拽上下文。
- 给可拖拽项的 `id` 设计稳定且可区分的格式，例如 `task-1`、`column-1`，避免列和任务的数字 id 冲突。
- 在 `onDragEnd` 中明确三件事：
  - 谁被拖动了。
  - 拖到了哪里。
  - 状态数组应该如何不可变更新。

学习建议：

先不要急着做完整 Trello 式拖拽。更适合当前阶段的练习路径是：

1. 先实现“任务只能拖到另一个列末尾”。
2. 再实现“同列内排序”。
3. 最后实现“跨列排序 + 同列排序统一处理”。

这样每一步都能单独验证，不会一次引入太多复杂度。

## 3. 业务类型重复定义，后续维护成本会快速上升

位置：

- `src/components/Board/index.tsx:7`
- `src/components/Board/index.tsx:13`
- `src/components/Board/components/BoardColumn.tsx:4`
- `src/components/Board/components/BoardItem.tsx:2`
- `src/mocks/factories/board.ts:4`
- `src/mocks/fixtures/board.ts:2`

当前问题：

- `Task` 的结构在多个文件里重复写。
- `Column` 的结构也只在局部定义，没有形成共享的领域模型。
- mock 工厂和 fixture 也各自写了一份类似的对象类型。

为什么不够专业：

- 类型在前端项目里不只是“给变量标一下形状”，它应该表达业务模型。
- 当你后续增加 `priority`、`status`、`assignee`、`createdAt` 这类字段时，重复类型会导致全局多处修改，容易漏。
- 局部重复类型还会制造一种假象：几个对象看起来长得一样，但 TypeScript 不知道它们在业务上是同一个概念。

更标准的写法方向：

建议新建一个 board 领域类型文件，例如：

```tsx
// src/features/board/types.ts
export type TaskId = string;
export type ColumnId = string;

export type Task = {
  id: TaskId;
  title: string;
  description: string;
};

export type BoardColumn = {
  id: ColumnId;
  name: string;
  tasks: Task[];
};
```

然后组件 props 基于这些类型组合：

```tsx
type BoardItemProps = Task;

type BoardColumnProps = {
  column: BoardColumn;
  onAddTask: (columnId: ColumnId) => void;
};
```

这个改法能帮助你建立一个重要习惯：业务类型放在领域层，组件 props 只描述组件需要什么输入和输出。

## 4. `tasks` 不应该继续设计成可选字段

位置：

- `src/components/Board/index.tsx:16`
- `src/components/Board/index.tsx:32`
- `src/components/Board/components/BoardColumn.tsx:11`
- `src/mocks/factories/board.ts:26`
- `src/mocks/fixtures/board.ts:17`

当前问题：

```tsx
type BoardColumn = {
  id: number | string;
  name: string;
  tasks?: BoardItem[];
};
```

但你的工厂函数和 fixture 实际上都会提供 `tasks`：

```tsx
tasks: []
```

或者：

```tsx
tasks: [createTask()]
```

为什么不够专业：

- “字段不存在”和“列表为空”是两种不同语义。
- 对看板列来说，任务列表应该永远存在，只是可能为空数组。
- 现在写成 `tasks?`，会迫使业务代码写 `column.tasks || []`，这是一种被类型设计拖累的防御式代码。

更标准的写法方向：

```tsx
type BoardColumn = {
  id: ColumnId;
  name: string;
  tasks: Task[];
};
```

然后新增任务时就可以写得更直接：

```tsx
tasks: [...column.tasks, newTask]
```

这个细节很重要：好的类型设计会减少业务代码里的兜底判断，让代码更像在表达业务规则，而不是到处处理“不知道会不会存在”的数据。

## 5. 状态命名没有准确表达业务含义

位置：

- `src/components/Board/index.tsx:19`
- `src/components/Board/index.tsx:24`
- `src/components/Board/index.tsx:29`

当前问题：

```tsx
const [boardItemList, setBoardItem] = useState<BoardColumn[]>(createBoardColumn());
```

为什么不够专业：

- `boardItemList` 实际保存的是列，不是 item。
- `setBoardItem` 听起来像设置单个看板项，但实际是在设置整个列数组。
- 命名不准确会直接影响你对状态结构的理解，尤其是后续做拖拽、编辑、删除时。

更标准的写法方向：

```tsx
const [columns, setColumns] = useState<BoardColumn[]>(createBoardColumns());
```

命名建议：

- 装列数组：`columns`
- 设置列数组：`setColumns`
- 单个列：`column`
- 单个任务：`task`
- 新增任务事件：`handleAddTask`
- 新增列事件：`handleAddColumn`

命名不是表面功夫。对 React 状态来说，命名就是你给未来维护者画的数据地图。

## 6. 组件接口还不够业务化

位置：

- `src/components/Board/index.tsx:41`
- `src/components/Board/index.tsx:45`
- `src/components/Board/components/BoardColumn.tsx:9`
- `src/components/Board/components/BoardColumn.tsx:12`

当前问题：

```tsx
<BoardColumn
  key={item.id}
  name={item.name}
  tasks={item.tasks}
  addItem={addTask.bind(null, item.id)}
/>
```

为什么不够专业：

- `addItem` 这个名字太泛，真实业务里你加的是任务，不是任意 item。
- `bind` 能工作，但对学习和维护来说不够直观。
- 子组件不知道自己属于哪个 column，父组件提前把 columnId 绑定进函数里，后续要加“删除列”“修改列名”“移动任务”时，接口会越来越散。

更标准的写法方向：

```tsx
<BoardColumn
  key={column.id}
  column={column}
  onAddTask={handleAddTask}
/>
```

子组件内部：

```tsx
<Button onClick={() => onAddTask(column.id)}>添加任务</Button>
```

这个设计更清楚：`BoardColumn` 知道自己渲染的是哪一列，也知道点击按钮时要把自己的 `column.id` 交给父组件处理。

## 7. mock 工厂和 fixture 的职责已经分开，但还不够统一

位置：

- `src/mocks/factories/board.ts:1`
- `src/mocks/factories/board.ts:15`
- `src/mocks/fixtures/board.ts:1`
- `src/mocks/fixtures/board.ts:12`

当前做得比较好的地方：

- 你已经把动态创建数据放到了 `factories`。
- 你也已经把初始化数据放到了 `fixtures`。
- 这比把 mock 数据直接写死在组件里更规范。

还不够好的地方：

- `createMockTask` 和 `createTask` 生成的是同一种业务对象，但命名和实现分裂了。
- fixture 里的 `id: -999` 和 `id: 0` 是人为特殊值，后续拖拽、查找、删除时容易引入边界问题。
- 工厂函数内部使用模块级自增变量，简单项目可用，但测试和热更新场景下可能造成 id 不够可预测。

更标准的写法方向：

- `factory` 负责创建单个合法实体，例如 `createTask`、`createColumn`。
- `fixture` 负责组合稳定场景，例如 `createInitialBoardColumns`。
- fixture 也应该复用 factory，而不是另起一套对象结构。

示例思路：

```tsx
export function createInitialBoardColumns(): BoardColumn[] {
  return [
    createColumn({
      id: 'column-todo',
      name: '待处理',
      tasks: [
        createTask({
          id: 'task-setup',
          title: '搭建项目结构'
        })
      ]
    })
  ];
}
```

这样写的好处是：初始化数据稳定、业务含义清楚、id 不依赖神秘数字。

## 8. id 类型过宽，数字和字符串混用会影响后续复杂交互

位置：

- `src/components/Board/index.tsx:8`
- `src/components/Board/index.tsx:14`
- `src/components/Board/components/BoardColumn.tsx:5`
- `src/components/Board/components/BoardItem.tsx:3`

当前问题：

```tsx
id: number | string;
```

为什么不够专业：

- `number | string` 看起来灵活，但会把复杂度推给所有使用 id 的地方。
- 拖拽场景里尤其需要区分“列 id”和“任务 id”，否则两个 `1` 可能代表完全不同的实体。
- 类型越宽，TypeScript 能帮你发现的问题越少。

更标准的写法方向：

```tsx
export type TaskId = `task-${string}`;
export type ColumnId = `column-${string}`;
```

如果你觉得模板字符串类型暂时有点复杂，也可以先统一成普通字符串：

```tsx
export type TaskId = string;
export type ColumnId = string;
```

但不建议长期保留 `number | string`，因为它会让领域边界变模糊。

## 9. 标题层级和页面语义需要调整

位置：

- `src/components/Layout/Header.tsx:3`
- `src/components/Board/components/BoardColumn.tsx:23`
- `src/pages/404.tsx:2`

当前问题：

- 页面 Header 使用了 `h1`。
- 每个 BoardColumn 也使用了 `h1`。
- 404 页面只有一个裸 `h1`，没有复用布局或提供返回入口。

为什么不够专业：

- 页面通常应该有一个主要 `h1`，区域标题用 `h2` 或 `h3` 更合适。
- 标题层级会影响可访问性、文档结构和屏幕阅读器体验。
- 404 页面虽然简单，但也属于用户体验的一部分，不能只当作占位符。

更标准的写法方向：

- 页面主标题：`h1`
- 看板列标题：`h2`
- 任务卡标题：`h3` 或普通标题样式文本
- 404 页面：加入基本布局、说明文字和返回首页按钮

## 10. 样式使用 Tailwind 是对的，但目前还比较“临时拼接”

位置：

- `src/components/Board/index.tsx:39`
- `src/components/Board/index.tsx:48`
- `src/components/Board/components/BoardColumn.tsx:22`
- `src/components/Board/components/BoardItem.tsx:16`
- `src/index.css:1`

当前问题：

- Board、Column、Card 的 className 都直接写在组件里，短期没问题，但后续会越来越长。
- `m-2  flex` 中间有多余空格，说明格式化和样式整理还不够细。
- `align-middle` 对 flex 布局里的 div 没有你想象中的垂直居中效果，语义上也不合适。
- `index.css` 中混用了单引号和双引号，缩进也不统一。

为什么不够专业：

- Tailwind 项目不是不能写长 className，但要保持语义清楚、分组稳定。
- UI 组件越多，样式越需要有一致的尺寸、间距、边框、背景和状态规则。
- 全局 CSS 是项目的基础设施，格式不统一会降低维护观感。

更标准的写法方向：

- 简单项目可以继续内联 Tailwind，但要按布局、尺寸、颜色、状态的顺序整理 className。
- 复用频率高的样式可以抽成小组件，而不是抽成一堆 CSS 类。
- 对 shadcn 组件保持生成代码的风格，不建议随手混改格式。

## 11. 依赖选择偏重，部分库还没有真正用起来

位置：

- `package.json:13`
- `package.json:16`
- `package.json:19`
- `package.json:27`

当前问题：

- `@dnd-kit/react` 已经开始使用，但功能未闭环。
- `@tanstack/react-query`、`zustand`、`lucide-react` 当前没有在业务代码里体现。
- 对学习项目来说，一次引入太多库会分散注意力。

为什么不够专业：

- 依赖不是越多越专业。专业项目更关注“这个依赖是否解决了当前明确的问题”。
- 未使用依赖会增加学习噪音，也会让后续维护者误判项目架构方向。

建议：

- 当前阶段先把 React 本地状态、组件 props、类型建模、拖拽状态更新练清楚。
- 等出现跨页面共享状态时再引入 Zustand。
- 等出现服务端数据请求、缓存、刷新、错误重试时再引入 React Query。
- 图标库可以等按钮、空状态、菜单等 UI 明确需要图标时再系统使用。

## 12. README 仍是 Vite 模板，没有服务当前项目

位置：

- `README.md:1`

当前问题：

- README 还是默认的 React + TypeScript + Vite 模板说明。
- 没有说明项目目标、技术栈、目录结构、运行命令和当前学习重点。

为什么不够专业：

- README 是项目的入口文档。
- 即使是学习项目，也应该让未来的你快速知道：这个项目在练什么、怎么跑、代码从哪里看、下一步准备做什么。

建议 README 至少包含：

- 项目简介：项目管理看板练习项目。
- 技术栈：React、TypeScript、Vite、TailwindCSS、shadcn/ui、dnd-kit。
- 常用命令：`pnpm dev`、`pnpm lint`、`pnpm build`。
- 当前功能：展示列、展示任务、新增列、新增任务、拖拽实验中。
- 学习重点：组件拆分、类型建模、状态更新、拖拽交互。

## 推荐改进顺序

1. 先修 `BoardColumn.tsx` 的拖拽事件类型，让 `pnpm build` 恢复通过。
2. 抽出 `Task`、`BoardColumn`、`TaskId`、`ColumnId` 等共享业务类型。
3. 把 `tasks?: Task[]` 改成 `tasks: Task[]`，减少无意义兜底代码。
4. 把 `boardItemList/setBoardItem` 改成 `columns/setColumns`。
5. 调整 `BoardColumn` 的 props：传 `column` 和 `onAddTask`，不要传 `addItem.bind(...)`。
6. 统一 mock factory 和 fixture，让 fixture 复用 factory，并使用稳定字符串 id。
7. 把 `DragDropProvider` 上移到 `Board` 层，再实现最小可用的跨列移动。
8. 调整标题层级、404 页面和基础可访问性。
9. 整理 Tailwind className 和 `index.css` 格式。
10. 更新 README，把默认模板文档改成项目说明。

## 当前阶段最值得练的能力

这个项目现在最适合练三件事：

1. 类型建模：先把 `Task` 和 `Column` 这些业务概念定义清楚。
2. 状态更新：熟悉不可变更新数组、嵌套数组和根据 id 定位数据。
3. 组件边界：让父组件负责状态，子组件负责展示和发出明确事件。

不要急着把所有高级库都用上。一个专业的 React 项目，基础不是“用了多少库”，而是数据模型清楚、状态流清楚、组件职责清楚、类型能保护业务逻辑。

## 给你的下一步练习题

建议你下一步只做一个小目标：把构建修好，并抽出共享类型。

验收标准：

- `pnpm build` 通过。
- `Task` 和 `BoardColumn` 不再在多个组件里重复定义。
- `tasks` 是必填数组。
- `Board`、`BoardColumn`、`BoardItem` 都从同一个类型来源理解任务结构。

做完这一步以后，再继续处理拖拽。这样节奏更稳，也更容易真正理解每个改动的价值。
