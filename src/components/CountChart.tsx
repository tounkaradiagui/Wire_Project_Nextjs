"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      nombre: boys + girls,
      fill: "white",
    },
    {
      name: "Filles",
      nombre: girls,
      fill: "#facc15",
    },
    {
      name: "Garçons",
      nombre: boys,
      fill: "#16a34a",
    },
  ];

  return (
    // <div className="relative w-full h-[60%]">
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
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
  );
};

export default CountChart;
