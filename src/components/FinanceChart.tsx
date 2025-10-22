"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", Revenu: 4000, Dépense: 2400 },
  { name: "Fév", Revenu: 3000, Dépense: 1398 },
  { name: "Mar", Revenu: 2000, Dépense: 9800 },
  { name: "Avr", Revenu: 2780, Dépense: 3908 },
  { name: "Mai", Revenu: 1890, Dépense: 4800 },
  { name: "Juin", Revenu: 2390, Dépense: 3800 },
  { name: "Juil", Revenu: 3490, Dépense: 4300 },
  { name: "Aoû", Revenu: 3490, Dépense: 4300 },
  { name: "Sept", Revenu: 3490, Dépense: 4300 },
  { name: "Oct", Revenu: 3490, Dépense: 4300 },
  { name: "Nov", Revenu: 3490, Dépense: 4300 },
  { name: "Déc", Revenu: 3490, Dépense: 4300 },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-[400px] p-4 shadow-md">
      {/* Titre */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Finances Scolaires</h2>
        <Image
          src="/moreDark.png"
          alt="Plus"
          width={14}
          height={14}
          className="cursor-pointer"
        />
      </div>

      {/* Graphique */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" align="center" height={36} />
            <Line
              type="monotone"
              dataKey="Dépense"
              stroke="#facc15"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="Revenu" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceChart;
