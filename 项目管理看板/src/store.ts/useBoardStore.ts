import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createMockBoardColumn, createMockTask } from '@/mocks/factories/board';
import { createBoardColumn } from '@/mocks/fixtures/board';
export type BoardItem = {
  id: number | string;
  title: string;
  description: string;
};

export type BoardColumn = {
  id: number | string;
  name: string;
  tasks?: BoardItem[];
};

export type BoardState = {
  boardItemList: BoardColumn[];
  addBoardColumn: () => void;
  addTask: (columnId: number | string) => void;
  moveTask: (
    taskId: number | string,
    targetId: number | string,
    targetType: string
  ) => void;
};

export const useBoardStore = create<BoardState>()(
  immer(set => ({
    boardItemList: createBoardColumn(),
    addBoardColumn: () => {
      const newColumn: BoardColumn = createMockBoardColumn();
      set(state => {
        state.boardItemList.push(newColumn);
      });
    },
    addTask: (columnId: number | string) => {
      const newTask: BoardItem = createMockTask();
      set(state => {
        const column = state.boardItemList.find(col => col.id === columnId);
        if (column) {
          column.tasks = column.tasks || [];
          column.tasks.push(newTask);
        }
      });
    },
    moveTask: (
      taskId: number | string,
      targetId: number | string,
      targetType: string
    ) => {
      set(state => {
        let task: BoardItem | undefined;
        for (const column of state.boardItemList) {
          const taskIndex = column.tasks?.findIndex(task => task.id === taskId);
          if (taskIndex !== undefined && taskIndex > -1) {
            task = column.tasks!.splice(taskIndex, 1)[0];
          }
        }

        if (targetType === 'column') {
          for (const column of state.boardItemList) {
            if (column.id === targetId) {
              column.tasks = column.tasks || [];
              column.tasks.push(task);
              break;
            }
          }
        } else if (targetType === 'task') {
          for (const column of state.boardItemList) {
            const taskIndex = column.tasks?.findIndex(
              task => task.id === targetId
            );
            if (taskIndex !== undefined && taskIndex > -1) {
              column.tasks = column.tasks || [];
              column.tasks.splice(taskIndex, 0, task);
              break;
            }
          }
        }
      });
    }
  }))
);
