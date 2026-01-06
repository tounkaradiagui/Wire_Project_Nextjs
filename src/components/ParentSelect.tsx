"use client";

import { useEffect, useState } from "react";

type Parent = {
  id: string;
  username: string;
  name: string;
  surname: string;
};

const ParentSelect = ( {
  onSelect,
}: {
  onSelect: (parentId: string) => void;
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
        className="input"
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="text-xs">Recherche...</p>}

      {results.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded shadow">
          {results.map((parent) => (
            <li
              key={parent.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect({ id: "parentId1" })}
              // onClick={() => {
              //   onSelect(parent.id);
              //   setResults([]);
              // }}
            >
              Sélectionner parentId1
              {/* {parent.username} – {parent.name} {parent.surname} */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ParentSelect;
