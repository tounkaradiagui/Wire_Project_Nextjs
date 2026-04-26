// Composant de table générique pour afficher des données tabulaires, avec des fonctionnalités de pagination, de tri et de gestion des données vides
type Column<T> = {
  header: string;
  accessor: keyof T | string;
  className?: string;
};

// Type pour les props du composant Table, qui inclut les colonnes à afficher, les données à afficher, une fonction 
// pour rendre chaque ligne et un message à afficher lorsque les données sont vides
type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  emptyMessage?: string;
};

const Table = <T,>({ columns, data, renderRow, emptyMessage = "Aucune donnée disponible", }: TableProps<T>) => {
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
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => renderRow(item))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
