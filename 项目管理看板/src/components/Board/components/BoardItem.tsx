type BoardItemProps = {
  id: number | string;
  title: string;
  description: string;
};
export const BoardItem = (props: BoardItemProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4 mb-4">
      <h3 className="font-bold">{props.title}</h3>
      <p className="text-sm text-gray-600">{props.description}</p>
    </div>
  );
};
