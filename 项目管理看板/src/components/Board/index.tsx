import { useState } from 'react';
import { BoardColumn } from './components/BoardColumn';
import { Button } from '../ui/button';
import { createMockBoardColumn, createMockTask } from '@/mocks/factories/board';
import { createBoardColumn } from '@/mocks/fixtures/board';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import type {
  BoardColumn as BoardColumnType,
  BoardItem
} from '@/store.ts/useBoardStore';
import { useBoardStore } from '@/store.ts/useBoardStore';

export const Board = () => {
  const { boardItemList, addBoardColumn, addTask, moveTask } = useBoardStore();

  const dragEndHandler = (event: DragEndEvent) => {
    if (event.canceled) return;
    console.log('拖动结束', event);
    console.log('源ID', event.operation.source?.id);
    console.log('目标ID', event.operation.target?.id);
    console.log('目标类型', event.operation.target?.type);
    if (
      event.operation.source == undefined ||
      event.operation.target == undefined ||
      event.operation.source.id === event.operation.target.id
    )
      return;

    moveTask(
      event.operation.source?.id as number | string,
      event.operation.target?.id as number | string,
      event.operation.target?.type as string
    );
  };

  return (
    <div className="flex-1 flex border-4 border-gray-200 overflow-x-auto">
      <DragDropProvider onDragEnd={dragEndHandler}>
        {boardItemList.map(item => (
          <BoardColumn
            key={item.id}
            id={item.id}
            name={item.name}
            tasks={item.tasks}
            addItem={addTask.bind(null, item.id)}
          />
        ))}
        <div className="w-32 m-2  flex flex-col justify-center align-middle">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={addBoardColumn}
          >
            添加阶段
          </Button>
        </div>
      </DragDropProvider>
    </div>
  );
};
