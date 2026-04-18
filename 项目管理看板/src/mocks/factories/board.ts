let taskID = 0;
let columnID = 0;
export const createMockTask = (
  override?: Partial<{ id: number; title: string; description: string }>
) => {
  ++taskID;
  return {
    id: taskID,
    title: `任务 ${taskID}`,
    description: `任务描述 ${taskID}`,
    ...override
  };
};

export const createMockBoardColumn = (
  override?: Partial<{
    id: number;
    name: string;
    tasks: ReturnType<typeof createMockTask>[];
  }>
) => {
  ++columnID;
  return {
    id: columnID,
    name: `阶段 ${columnID}`,
    tasks: [],
    ...override
  };
};
