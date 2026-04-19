import { BoardColumn } from './components/BoardColumn';
import { Button } from '../ui/button';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';

import { useBoardStore } from '@/store/useBoardStore';

export const Board = () => {
  const { boardColumn, addBoardColumn, addTask, moveTask } = useBoardStore();

  const dragEndHandler = (event: DragEndEvent) => {
    if (event.canceled) return;
    console.log('拖动结束', event);
    console.log('源ID', event.operation.source?.data.id);
    console.log('目标ID', event.operation.target?.data.id);
    console.log('目标类型', event.operation.target?.data.type);
    if (
      event.operation.source == undefined ||
      event.operation.target == undefined
    )
      return;

    moveTask(
      event.operation.source?.data.id,
      event.operation.target?.data.id,
      event.operation.target?.data.type
    );
  };

  return (
    <div className="flex-1 flex border-4 border-gray-200 overflow-x-auto">
      <DragDropProvider onDragEnd={dragEndHandler}>
        {boardColumn.map(item => (
          <BoardColumn
            column={item}
            key={item.id}
            onAddTask={addTask.bind(null, item.id)}
          />
        ))}
        <div className="w-32 m-2 flex flex-col justify-center">
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
