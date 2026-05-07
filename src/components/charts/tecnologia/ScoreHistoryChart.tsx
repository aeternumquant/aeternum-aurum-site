import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

type ScoreDatum = { d: string; mom: number; vol: number };

export default function ScoreHistoryChart({
  data,
  dataKey,
  stroke,
}: {
  data: ScoreDatum[];
  dataKey: "mom" | "vol";
  stroke: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <XAxis dataKey="d" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <Line type="stepAfter" dataKey={dataKey} stroke={stroke} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
