import type {
  BoardColumn as BoardColumnType,
  BoardItem
} from '@/features/board/types';
let taskID = 0;
let columnID = 0;
export const createMockTask = (override?: Partial<BoardItem>) => {
  ++taskID;
  return {
    id: taskID,
    title: `任务 ${taskID}`,
    description: `任务描述 ${taskID}`,
    ...override
  };
};

export const createMockBoardColumn = (override?: Partial<BoardColumnType>) => {
  ++columnID;
  return {
    id: columnID,
    name: `阶段 ${columnID}`,
    tasks: [],
    ...override
  };
};
