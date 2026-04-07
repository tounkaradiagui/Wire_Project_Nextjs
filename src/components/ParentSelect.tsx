"use client";

import { useEffect, useState } from "react";

type Parent = {
  id: string;
  username: string;
  name: string;
  surname: string;
};

const ParentSelect = ({
  onSelect,
  defaultValue
}: {
  onSelect: (parentId: string) => void;
  defaultValue?: string;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) return;

    const fetchParents = async () => {
      setLoading(true);
      const res = await fetch(`/api/parents?q=${query}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    };

    fetchParents();
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Rechercher un parent (username, nom...)"
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="text-xs">Recherche...</p>}

      {results.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded shadow">
          {results.map((parent) => (
            <li
              key={parent.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(parent.id);
                setResults([]);
              }}
            >
              Sélectionner identifiant:
              {parent.id} – {parent.name} {parent.surname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ParentSelect;
