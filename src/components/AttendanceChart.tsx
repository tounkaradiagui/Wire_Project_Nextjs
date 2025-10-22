"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Lun", Présence: 40, Abscence: 20 },
  { name: "Mar", Présence: 30, Abscence: 8 },
  { name: "Mer", Présence: 60, Abscence: 7 },
  { name: "Jeu", Présence: 20, Abscence: 30 },
  { name: "Ven", Présence: 38, Abscence: 10 },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-md">
      {/* Bar title */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Assiduité</h2>
        <Image
          src="/moreDark.png"
          alt="Options du graphique d'assiduité"
          width={14}
          height={14}
          className="cursor-pointer"
        />
      </div>

      {/* Chart */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#f9fafb", borderRadius: "8px" }}
              labelStyle={{ color: "#374151" }}
            />
            <Legend />
            <Bar dataKey="Abscence" fill="#eab308" />
            <Bar dataKey="Présence" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
