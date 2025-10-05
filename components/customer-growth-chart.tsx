"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CustomerGrowthChartProps {
  data: Array<{
    month: string
    customers: number
    stamps: number
  }>
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} name="Customers" />
        <Line type="monotone" dataKey="stamps" stroke="hsl(var(--secondary))" strokeWidth={2} name="Stamps" />
      </LineChart>
    </ResponsiveContainer>
  )
}
