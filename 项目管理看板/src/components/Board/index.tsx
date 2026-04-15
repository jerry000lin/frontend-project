import { useState } from 'react';
import { BoardColumn } from './components/BoardColumn';
import { Button } from '../ui/button';
import {
  createMockBoardColumn,
  createMockTask
} from '@/app/mocks/factories/board';

type BoardItem = {
  id: number | string;
  title: string;
  description: string;
};

type BoardColumn = {
  id: number | string;
  name: string;
  tasks?: BoardItem[];
};
export const Board = () => {
  const [boardItemList, setBoardItem] = useState<BoardColumn[]>([]);

  const addBoardColumn = () => {
    const newColumn: BoardColumn = createMockBoardColumn();
    setBoardItem(prev => [...prev, newColumn]);
  };

  const addTask = (columnId: number | string) => {
    const newTask: BoardItem = createMockTask();
    setBoardItem(prev =>
      prev.map(column =>
        column.id === columnId
          ? { ...column, tasks: [...(column.tasks || []), newTask] }
          : column
      )
    );
  };

  return (
    <div className="flex-1 flex border-4 border-gray-200 overflow-x-auto">
      {boardItemList.map(item => (
        <BoardColumn
          key={item.id}
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
    </div>
  );
};
