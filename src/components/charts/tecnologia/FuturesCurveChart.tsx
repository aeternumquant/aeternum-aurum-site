import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

type CurveDatum = { days: number; price: number; past: number };

export default function FuturesCurveChart({ data }: { data: CurveDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
        <XAxis dataKey="days" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={["dataMin", "dataMax"]} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <Line type="monotone" dataKey="price" stroke="#4CAF50" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="past" stroke="#F44336" strokeWidth={1} strokeDasharray="3 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
