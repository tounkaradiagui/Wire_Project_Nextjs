type Column<T> = {
  header: string;
  accessor: keyof T | string;
  className?: string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
};

const Table = <T,>({ columns, data, renderRow }: TableProps<T>) => {
  return (
    <div className="overflow-x-auto mt-4 rounded-md border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-blue-500 text-white font-semibold">
            {columns.map((col) => (
              <th
                key={String(col.accessor)}
                className={`p-4 text-sm ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700">
          {data.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
