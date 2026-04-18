import { useDroppable } from '@dnd-kit/react';
import { BoardItem } from './BoardItem';
import { Button } from '@/components/ui/button';
type SubBoardItem = {
  id: number | string;
  title: string;
  description: string;
};
type BoardColumnProps = {
  id: number | string;
  name: string;
  tasks?: SubBoardItem[];
  addItem: () => void;
};

export const BoardColumn = (props: BoardColumnProps) => {
  const { id, name, tasks, addItem } = props;
  const { ref: droppableRef } = useDroppable({ id: id, type: 'column' });
  return (
    <div
      className="w-64 m-2 rounded border-2 border-gray-300 flex flex-col shrink-0"
      ref={droppableRef}
    >
      <h1 className="text-center border-b border-gray-300 pb-2">{name}</h1>
      <div className="p-2">
        {tasks && (
          <div className="flex flex-col mt-2">
            {tasks.map(task => (
              <BoardItem key={task.id} {...task} />
            ))}
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className="cursor-pointer rounded-none"
        onClick={addItem}
      >
        添加任务
      </Button>
    </div>
  );
};
