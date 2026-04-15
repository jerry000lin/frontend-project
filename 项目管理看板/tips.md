# 当前实现评审记录

这次检查的结论先放前面：

- `pnpm lint` 已通过
- `pnpm build` 已通过
- 当前版本已经比前一版更规范，尤其是这几项做得对：
  - `Board` 文件名已经改回 [src/components/Board/index.tsx](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:1)
  - 任务列表字段已经改成 `tasks`，不再滥用 `children`
  - `Date.now()` 已经从组件里移除，开始改用 mock 工厂生成数据
  - `button.tsx` 不再导出 `buttonVariants`，`react-refresh` 冲突已消失

当前没有阻塞构建的问题，下面主要是“还能写得更标准”的地方。

## 1. 工厂函数里的编号逻辑有错位

- 位置：
  - [src/app/mocks/factories/board.ts:7](/home/jerry/project/learn/项目管理看板/src/app/mocks/factories/board.ts:7)
  - [src/app/mocks/factories/board.ts:8](/home/jerry/project/learn/项目管理看板/src/app/mocks/factories/board.ts:8)
  - [src/app/mocks/factories/board.ts:22](/home/jerry/project/learn/项目管理看板/src/app/mocks/factories/board.ts:22)
  - [src/app/mocks/factories/board.ts:23](/home/jerry/project/learn/项目管理看板/src/app/mocks/factories/board.ts:23)
- 问题：
  - 现在 `id` 用的是自增前的值，但 `title`、`description`、`name` 用的是自增后的值。
  - 例如第一条任务会出现 `id = 0`，标题却是 `任务 1`。
- 为什么这不够标准：
  - mock 数据的目标是“可预测、可调试”，编号错位会让你后面排查状态更新时很别扭。
  - 这种问题在学习阶段尤其要避免，因为它会干扰你理解“数据到底是怎么流动的”。
- 更好的写法思路：
  - 先拿到一个本次要用的稳定编号，再用这个编号同时生成 `id` 和显示文案。
  - 简单说：一次创建，只计算一次编号。

## 2. 现在只有“工厂函数”，还没有真正落地“固定夹具”

- 位置：
  - [src/components/Board/index.tsx:21](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:21)
- 问题：
  - `boardItemList` 初始化还是空数组。
  - 这说明你现在只做了“新增时如何造数据”，还没有做“页面一打开就有一组稳定演示数据”。
- 为什么这不够标准：
  - 你前面想学的是“工厂函数 + 固定夹具”。
  - 只有工厂，没有夹具，页面初始化体验会比较空，UI 调试价值也会下降。
- 更好的写法思路：
  - `factories` 负责造“单条合法数据”
  - `fixtures` 负责准备“一整组稳定演示数据”
  - 页面初始状态优先从 `fixtures` 来，新增交互再走 `factories`
- 这样写好的原因：
  - 你以后别的项目也能复用这套结构，不会每次都从空数组开始手写 mock。

## 3. 类型定义重复了三遍，后面会越来越难维护

- 位置：
  - [src/components/Board/index.tsx:9](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:9)
  - [src/components/Board/index.tsx:15](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:15)
  - [src/components/Board/components/BoardColumn.tsx:4](/home/jerry/project/learn/项目管理看板/src/components/Board/components/BoardColumn.tsx:4)
  - [src/components/Board/components/BoardItem.tsx:1](/home/jerry/project/learn/项目管理看板/src/components/Board/components/BoardItem.tsx:1)
- 问题：
  - `Task` 的结构在 `Board`、`BoardColumn`、`BoardItem` 里都各写了一份。
  - 现在字段少还不明显，后面一旦加 `status`、`priority`、`assignee`，重复维护成本会迅速上升。
- 为什么这不够标准：
  - 类型应该是“领域模型”，不是“哪个组件用到就在哪再写一份”。
  - 前端项目里最常见的维护问题之一，就是类型散落在组件文件里，导致改一个字段要全局找。
- 更好的写法思路：
  - 把 `Task`、`Column` 这类业务类型单独抽到 `src/types` 或 `src/features/board/types.ts`
  - 组件 props 再基于这些类型组合，而不是重新声明一套近似类型
- 你能学到什么：
  - 这能帮助你建立“业务类型”和“组件 props”分层的意识，这在 React + TypeScript 里很重要。

## 4. `tasks` 不需要继续写成可选字段

- 位置：
  - [src/components/Board/index.tsx:18](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:18)
  - [src/components/Board/components/BoardColumn.tsx:11](/home/jerry/project/learn/项目管理看板/src/components/Board/components/BoardColumn.tsx:11)
  - [src/app/mocks/factories/board.ts:24](/home/jerry/project/learn/项目管理看板/src/app/mocks/factories/board.ts:24)
- 问题：
  - 你现在的工厂函数每次都会给列创建 `tasks: []`，说明从业务语义看，`tasks` 实际上总是存在。
  - 但类型里仍然写成了 `tasks?: ...`，所以你后面每次更新都还要写 `(column.tasks || [])`。
- 为什么这不够标准：
  - 类型应该尽量表达真实数据约束。
  - 如果业务上“这个字段永远有，只是可能为空数组”，那就应该用 `tasks: Task[]`，而不是可选字段。
- 更好的写法思路：
  - “空列表”和“字段不存在”是两回事。
  - 在看板这种场景里，更推荐把任务列表设计为必有字段，空时就是 `[]`。

## 5. 列组件的标题层级不够语义化

- 位置：
  - [src/components/Layout/Header.tsx:3](/home/jerry/project/learn/项目管理看板/src/components/Layout/Header.tsx:3)
  - [src/components/Board/components/BoardColumn.tsx:19](/home/jerry/project/learn/项目管理看板/src/components/Board/components/BoardColumn.tsx:19)
- 问题：
  - 页面主标题已经是 `h1`，每一列标题也继续用 `h1`。
- 为什么这不够标准：
  - 一个页面通常应有一个主 `h1`，子区域标题更适合使用 `h2`、`h3` 或普通文本标签。
  - 这不只是“HTML 洁癖”，而是语义结构和可访问性的一部分。
- 更好的写法思路：
  - 页面级标题用 `h1`
  - 看板列标题用 `h2` 或 `h3`
  - 任务标题再根据结构使用更低层级标题或普通文本

## 6. `bind` 传参能用，但不是最清晰的组件接口

- 位置：
  - [src/components/Board/index.tsx:46](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:46)
  - [src/components/Board/components/BoardColumn.tsx:12](/home/jerry/project/learn/项目管理看板/src/components/Board/components/BoardColumn.tsx:12)
- 问题：
  - 现在通过 `addTask.bind(null, item.id)` 给列组件传事件处理函数。
- 为什么这不够标准：
  - 这不是错误，但对学习来说不够直观。
  - 你后面如果再加“删除列”“编辑列”“拖拽列”，组件的输入输出会越来越别扭。
- 更好的写法思路：
  - 让 `BoardColumn` 的接口更明确，例如：
  - “我是谁”用 `columnId`
  - “点击后要做什么”用 `onAddTask`
  - 这样组件 API 会更像业务组件，而不是一个只接收匿名回调的渲染块

## 7. 状态变量命名已经进步了，但还能更准确

- 位置：
  - [src/components/Board/index.tsx:21](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:21)
  - [src/components/Board/index.tsx:25](/home/jerry/project/learn/项目管理看板/src/components/Board/index.tsx:25)
- 问题：
  - `boardItemList` 实际装的是“列”，不是“item”。
  - `setBoardItem` 这个 setter 名字也和实际数据不完全匹配。
- 为什么这不够标准：
  - 命名是帮助你建立数据模型的第一层工具。
  - 如果状态里装的是列，名字就应该尽量让你一眼看出来是 `columns`，不是模糊的 `boardItemList`。
- 更好的写法思路：
  - 状态名优先贴近业务含义，而不是贴近页面长相。
  - 看板里最核心的数据单位通常是 `columns` 和 `tasks`，命名围绕这个展开更清楚。

## 8. 当前卡片结构已经比之前好，但还可以更像真实业务

- 位置：
  - [src/components/Board/components/BoardItem.tsx:8](/home/jerry/project/learn/项目管理看板/src/components/Board/components/BoardItem.tsx:8)
- 问题：
  - 现在卡片只有标题和描述，适合入门，但还不够像真正的项目看板。
- 为什么这仍值得优化：
  - 看板类产品很适合练习“类型设计 + UI 信息层级”。
  - 如果后续只加一个字段，我建议优先加 `status` 或 `priority`，因为它能让你同时练习：
    - 类型枚举
    - 条件样式
    - 卡片信息层级
- 更好的写法思路：
  - 学习项目里不要只追求“能渲染”
  - 也要让数据结构尽量贴近真实业务，这样你的练习价值会更高

## 建议的下一步顺序

1. 先修正 mock 工厂里的编号错位问题，让数据稳定可预测。
2. 补上 `fixtures`，让页面初始就有一组固定看板数据。
3. 抽离共享类型，把 `Task` / `Column` 从组件里拿出来。
4. 再优化组件接口和语义标签，例如 `columnId + onAddTask`、`h1/h2` 层级。
5. 最后再扩展卡片字段，比如 `status`、`priority`、`assignee`。

## 本次检查依据

- 已执行：
  - `pnpm lint`
  - `pnpm build`
- 结果：
  - 两者均通过
- 说明：
  - 当前问题主要是“结构和规范优化”，不是“构建失败”
