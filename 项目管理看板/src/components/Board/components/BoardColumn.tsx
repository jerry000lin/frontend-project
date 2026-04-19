import { useDroppable } from '@dnd-kit/react';
import { BoardItem } from './BoardItem';
import { Button } from '@/components/ui/button';
import type { BoardColumn as BoardColumnType } from '@/features/board/types';

type BoardColumnProps = {
  column: BoardColumnType;
  onAddTask: () => void;
};

export const BoardColumn = (props: BoardColumnProps) => {
  const { column, onAddTask } = props;
  const { ref: droppableRef } = useDroppable({
    id: `column-${column.id}`,
    data: { id: column.id, type: 'column' }
  });
  return (
    <section
      className="w-64 m-2 rounded border-2 border-gray-300 flex flex-col shrink-0"
      ref={droppableRef}
    >
      <h2 className="text-center border-b border-gray-300 pb-2">
        {column.name}
      </h2>
      <div className="p-2">
        <div className="flex flex-col mt-2">
          {column.tasks.map(task => (
            <BoardItem key={task.id} {...task} />
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        className="cursor-pointer rounded-none"
        onClick={onAddTask}
      >
        添加任务
      </Button>
    </section>
  );
};
