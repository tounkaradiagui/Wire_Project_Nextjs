"use client";
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

const AttendanceChart = ({
  data,
}: {
  data: { name: string; present: number; absent: number }[];
}) => {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
  );
};

export default AttendanceChart;
