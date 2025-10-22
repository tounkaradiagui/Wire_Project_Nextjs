"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Totql",
    nombre: 86,
    fill: "white",
  },
  {
    name: "Filles",
    nombre: 34,
    fill: "#facc15",
  },
  {
    name: "Garçons",
    nombre: 52,
    fill: "#16a34a",
  },
];

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const CountChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-md">
      {/* Bar title */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Elèves</h2>
        <Image
          src="/moreDark.png"
          alt="Eleves"
          width={14}
          height={14}
          className="cursor-pointer"
        />
      </div>
      {/* Chart */}
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar background dataKey="nombre" />
            {/* <Legend iconSize={10} layout="vertical" verticalAlign="middle" /> */}
          </RadialBarChart>
        </ResponsiveContainer>
        <Image
          src="/maleFemale.png"
          alt="Eleves"
          width={70}
          height={70}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      {/* Bottom */}
      <div className="flex justify-center gap-16">
        <div className=" flex flex-col gap-1">
          <div className="w-5 h-5 bg-green-500 rounded-full" />
          <h1 className="text-bold">2400</h1>
          <h1 className="text-bold text-gray-600">Garçons 55%</h1>
        </div>
        <div className=" flex flex-col gap-1">
          <div className="w-5 h-5 bg-yellow-500 rounded-full" />
          <h1 className="text-bold">1700</h1>
          <h1 className="text-bold text-gray-700">Filles 45%</h1>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
