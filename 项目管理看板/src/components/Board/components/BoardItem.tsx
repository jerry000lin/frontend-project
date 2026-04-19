import type { BoardItem as BoardItemType } from '@/features/board/types';
import { useDraggable, useDroppable } from '@dnd-kit/react';
type BoardItemProps = BoardItemType;
export const BoardItem = (props: BoardItemProps) => {
  const { ref: dragRef } = useDraggable({
    id: `task-${props.id}`,
    data: { id: props.id, type: 'task' }
  });
  const { ref: droppableRef } = useDroppable({
    id: `task-${props.id}`,
    data: { id: props.id, type: 'task' }
  });
  return (
    <div
      ref={node => {
        dragRef(node);
        droppableRef(node);
      }}
      className="bg-white rounded-lg border border-gray-300 p-4 mb-4"
    >
      <h3 className="font-bold">{props.title}</h3>
      <p className="text-sm text-gray-600">{props.description}</p>
    </div>
  );
};
