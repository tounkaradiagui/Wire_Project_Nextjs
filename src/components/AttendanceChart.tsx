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

type AttendanceChartData = {
  name: string;
  present: number;
  absent: number;
  late: number;
};

const AttendanceChart = ({ data }: { data: AttendanceChartData[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />

        <Bar dataKey="present" name="Présents" fill="#22c55e" />
        <Bar dataKey="late" name="Retards" fill="#eab308" />
        <Bar dataKey="absent" name="Absents" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;