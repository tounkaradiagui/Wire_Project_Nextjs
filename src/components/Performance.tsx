"use client";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Performance", value: 92 },
  { name: "Reste", value: 8 },
];

const COLORS = ["#3b82f6", "#e5e7eb"]; // bleu principal + gris clair

const Performance = ({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) => {
  return (
    <div className="bg-white p-5 rounded-md shadow-sm h-80 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Performance Globale
        </h2>
        <Image
          src="/moreDark.png"
          alt="Plus"
          width={16}
          height={16}
          className="cursor-pointer opacity-70 hover:opacity-100 transition"
        />
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={isAnimationActive}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Texte au centre */}
        <div className="absolute text-center">
          <h1 className="text-2xl font-bold text-gray-800">92%</h1>
          <span className="text-sm text-gray-500">Performance</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500 font-medium text-center">
        1er trimestre – 3e trimestre
      </p>
    </div>
  );
};

export default Performance;
