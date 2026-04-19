# 当前实现评审与改进建议

这份记录基于当前工作区最新实现整理，重点看 React 组件边界、TypeScript 类型设计、Zustand store、dnd-kit 拖拽逻辑和 mock 数据结构。

## 当前状态

- `pnpm build` 已通过。
- `pnpm lint` 中发现的 `column.tasks = column.tasks` 自赋值已清理。
- `src/store.ts/` 已迁移为 `src/store/`，目录命名比之前更合理。
- `BoardItem` / `BoardColumn` 业务类型已抽到 `src/features/board/types.ts`。
- 业务 id 使用 `number`，拖拽 id 使用 `column-${id}` / `task-${id}` 字符串，这个方向是合理的。

## 做得更好的地方

### 1. 业务类型开始集中

当前类型在 `src/features/board/types.ts`：

```ts
export type BoardItem = {
  id: number;
  title: string;
  description: string;
};

export type BoardColumn = {
  id: number;
  name: string;
  tasks: BoardItem[];
};
```

这比组件、store、mock 各自重复定义结构更好。当前阶段保持 `id: number` 是可以的，不需要为了类型严谨强行改成复杂的模板字符串类型。

### 2. 组件语义比之前清楚

`BoardColumn` 已经从 `div + h1` 改成了 `section + h2`，更符合页面结构语义。

`BoardColumn` 也开始接收完整 `column` 对象：

```tsx
type BoardColumnProps = {
  column: BoardColumnType;
  onAddTask: () => void;
};
```

这比拆成 `id/name/tasks` 更像业务组件。

### 3. `tasks` 已经被当成必填数组使用

`BoardColumn` 里已经可以直接：

```tsx
column.tasks.map(...)
```

store 里也不再需要 `tasks || []`。这是一个重要进步：类型和业务事实保持一致后，组件会更干净。

### 4. 无用依赖开始清理

`package.json` 里已经移除了暂时没有使用的 `@tanstack/react-query` 和 `lucide-react`。学习项目里依赖越少，主线越清楚。

## 仍然不够专业的地方

### 1. `boardColumn` 命名不够自然

位置：

- `src/store/useBoardStore.ts`
- `src/components/Board/index.tsx`

当前状态名是：

```ts
boardColumn: BoardColumn[];
```

问题是它保存的是“多个列”，命名上更自然应该是复数：

```ts
columns: BoardColumn[];
```

对应 action 也可以更短：

```ts
addColumn: () => void;
```

这不是纯粹命名洁癖。状态名越贴近业务，后面拖拽、排序、删除列时越容易理解。

### 2. `onAddTask` 仍然由父组件提前 bind

位置：

- `src/components/Board/index.tsx`
- `src/components/Board/components/BoardColumn.tsx`

当前写法：

```tsx
<BoardColumn
  column={item}
  key={item.id}
  onAddTask={addTask.bind(null, item.id)}
/>
```

可以工作，但组件 API 还可以更清楚。更推荐：

```tsx
type BoardColumnProps = {
  column: BoardColumnType;
  onAddTask: (columnId: number) => void;
};
```

然后在 `BoardColumn` 内部：

```tsx
<Button onClick={() => onAddTask(column.id)}>添加任务</Button>
```

这样父组件提供能力，子组件基于自己的 `column.id` 发起事件，职责更清楚。

### 3. 拖拽 data 还缺少明确类型

位置：

- `src/components/Board/index.tsx`
- `src/components/Board/components/BoardColumn.tsx`
- `src/components/Board/components/BoardItem.tsx`

现在拖拽数据是：

```tsx
data: { id: column.id, type: 'column' }
data: { id: props.id, type: 'task' }
```

这个思路是对的：dnd-kit 的 `id` 用带前缀字符串避免冲突，`data.id` 保留业务 id。

下一步可以加一个简单类型：

```ts
export type BoardDragType = 'column' | 'task';

export type BoardDragData = {
  id: number;
  type: BoardDragType;
};
```

不需要过度设计成复杂模板字符串类型。当前项目只要避免 `targetType` 变成任意 `string` 就够。

### 4. `moveTask` 仍然有目标不存在时的边界风险

位置：

- `src/store/useBoardStore.ts`

现在已经处理了“拖到自己身上”的情况：

```ts
if (targetType === 'task' && taskId === targetId) return;
```

但还有一个边界：当前逻辑先从源列删除任务，再找目标位置。如果目标任务或目标列不存在，任务可能已经被移除了但没有插回去。

更稳的思路是：

1. 先找到源任务位置。
2. 再找到目标位置。
3. 两边都存在时，才真正执行删除和插入。

当前学习阶段可以先记住这个风险，等拖拽功能继续完善时再重构。

### 5. mock factory 和 fixture 还没有完全统一

位置：

- `src/mocks/factories/board.ts`
- `src/mocks/fixtures/board.ts`

fixture 已经开始使用共享业务类型，这是对的。但 factory 里仍然在写匿名类型：

```ts
Partial<{ id: number; title: string; description: string }>
```

建议后续改成：

```ts
import type { BoardColumn, BoardItem } from '@/features/board/types';

export const createMockTask = (
  override?: Partial<BoardItem>
): BoardItem => {
  // ...
};
```

这样 factory、fixture、store、组件都会围绕同一套业务类型运转。

另外，fixture 里的 `id: -999` 和 `id: 0` 虽然能用，但业务含义不直观。可以换成更自然的稳定 id，例如 `1`、`1001`，或者专门留一段 mock id 范围。

### 6. 调试日志还在业务组件中

位置：

- `src/components/Board/index.tsx`

当前还保留了：

```tsx
console.log('拖动结束', event);
console.log('源ID', ...);
console.log('目标ID', ...);
console.log('目标类型', ...);
```

调试阶段可以保留，但提交正式版本前建议删除，或者用更明确的开发调试开关控制。长期留在组件里会降低代码质量。

## 推荐下一步顺序

1. 把 `boardColumn` 改成 `columns`。
2. 把 `onAddTask` 改成接收 `columnId`，移除父组件里的 `bind`。
3. 增加简单的 `BoardDragData` / `BoardDragType` 类型。
4. 清理 `Board` 里的拖拽调试日志。
5. 让 mock factory 使用 `BoardItem` / `BoardColumn` 类型。
6. 后续再重构 `moveTask`，先定位源和目标，再执行移动。

## 总结

当前实现已经可以作为一个阶段性版本提交。它的主要价值是：组件结构更清楚、状态管理迁移到 store、业务类型开始集中、基础检查能通过。

下一阶段不要急着继续堆功能，重点应该是把命名、事件回调、拖拽数据类型和移动边界再打磨一轮。
