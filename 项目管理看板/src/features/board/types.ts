export type BoardItem = {
  id: number;
  title: string;
  description: string;
};

export type BoardColumn = {
  id: number;
  name: string;
  tasks: BoardItem[];
};
