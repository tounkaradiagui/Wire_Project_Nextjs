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
  absent: number;
  late: number;
};

const AttendanceChart = ({ data }: { data: AttendanceChartData[] }) => {
  const maxValue = Math.max(
    ...data.flatMap(d => [d.absent, d.late])
  );

  const roundedMax = Math.ceil(maxValue / 10) * 10;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            allowDecimals={false}
            ticks={[0, 5, 10, 20, 30, 40, 50]}
            domain={[0, 50]}
          // ticks={[0, 5, 10, 20, 30, 40, 50]}
          // domain={[0, roundedMax || 50]}
          />
          <Tooltip />
          <Legend />

          <Bar dataKey="late" name="Retards" fill="#eab308" />
          <Bar dataKey="absent" name="Absents" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;