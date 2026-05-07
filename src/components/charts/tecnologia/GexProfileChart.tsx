import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type GexDatum = { strike: number; put: number; call: number };

export default function GexProfileChart({ data }: { data: GexDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }} barCategoryGap={1}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="strike" tick={{ fill: "#8A8A8A", fontSize: 10 }} axisLine={false} tickLine={false} />
        <RTooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "10px" }} />
        <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
        <Bar dataKey="put" fill="#F44336" stackId="a" />
        <Bar dataKey="call" fill="#4CAF50" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
