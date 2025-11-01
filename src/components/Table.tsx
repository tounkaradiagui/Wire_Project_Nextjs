const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="overflow-x-auto mt-4 rounded-md border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-blue-500 text-white font-semibold">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className={`p-4 text-sm font-semibold ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">{data.map(renderRow)}</tbody>
      </table>
    </div>
  );
};
export default Table;
