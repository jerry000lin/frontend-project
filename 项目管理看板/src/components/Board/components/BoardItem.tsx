import { useDraggable, useDroppable } from '@dnd-kit/react';
type BoardItemProps = {
  id: number | string;
  title: string;
  description: string;
};
export const BoardItem = (props: BoardItemProps) => {
  const { ref: dragRef } = useDraggable({ id: props.id, type: 'task' });
  const { ref: droppableRef } = useDroppable({ id: props.id, type: 'task' });
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
