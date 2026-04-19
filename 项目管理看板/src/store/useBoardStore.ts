import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createMockBoardColumn, createMockTask } from '@/mocks/factories/board';
import { createBoardColumn } from '@/mocks/fixtures/board';
import type { BoardColumn, BoardItem } from '@/features/board/types';

export type BoardState = {
  boardColumn: BoardColumn[];
  addBoardColumn: () => void;
  addTask: (columnId: number) => void;
  moveTask: (
    taskId: number,
    targetId: number,
    targetType: 'column' | 'task'
  ) => void;
};

export const useBoardStore = create<BoardState>()(
  immer(set => ({
    boardColumn: createBoardColumn(),
    addBoardColumn: () => {
      const newColumn: BoardColumn = createMockBoardColumn();
      set(state => {
        state.boardColumn.push(newColumn);
      });
    },
    addTask: (columnId: number) => {
      const newTask: BoardItem = createMockTask();
      set(state => {
        const column = state.boardColumn.find(col => col.id === columnId);
        if (column) {
          column.tasks.push(newTask);
        }
      });
    },
    moveTask: (
      taskId: number,
      targetId: number,
      targetType: 'column' | 'task'
    ) => {
      set(state => {
        let task: BoardItem | undefined;
        if (targetType === 'task' && taskId === targetId) return;
        for (const column of state.boardColumn) {
          const taskIndex = column.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== undefined && taskIndex > -1) {
            task = column.tasks.splice(taskIndex, 1)[0];
          }
        }
        if (!task) return;
        if (targetType === 'column') {
          for (const column of state.boardColumn) {
            if (column.id === targetId) {
              column.tasks.push(task);
              break;
            }
          }
        } else if (targetType === 'task') {
          for (const column of state.boardColumn) {
            const taskIndex = column.tasks.findIndex(
              task => task.id === targetId
            );
            if (taskIndex !== undefined && taskIndex > -1) {
              column.tasks.splice(taskIndex, 0, task);
              break;
            }
          }
        }
      });
    }
  }))
);
