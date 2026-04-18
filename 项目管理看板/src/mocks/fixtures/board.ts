export function createTask(
  override?: Partial<{ id: number; title: string; description: string }>
) {
  return {
    id: 0,
    title: '默认任务',
    description: '这是一个默认的任务描述',
    ...override
  };
}

export function createBoardColumn() {
  return [
    {
      id: -999,
      name: '默认阶段',
      tasks: [createTask()]
    }
  ];
}
