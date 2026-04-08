import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CapacityChart = ({ data }) => {
  const chartData = useMemo(() => {
    const hours = Array.from({length: 24}, (_, i) => ({ hr: i, riders: 0, count: 0 }));
    data.forEach(row => {
      hours[row.hr].riders += row.cnt;
      hours[row.hr].count += 1;
    });
    return hours.map(h => ({
      hour: `${h.hr.toString().padStart(2, '0')}:00`,
      avgRiders: Math.round(h.riders / h.count) || 0
    }));
  }, [data]);

  return (
    <div className="glass-card card-two-thirds animate-fade-in" style={{animationDelay: '0.1s'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
        <div style={{background: 'rgba(0, 210, 255, 0.1)', padding: '12px', borderRadius: '12px'}}>
          <TrendingUp color="var(--accent-blue)" size={28} />
        </div>
        <div>
          <h2 style={{fontSize: '1.6rem', marginBottom: '4px'}}>Capacity Optimization</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Peak Commute Bimodal Temporal Distribution (Avg Riders / Hour)</p>
        </div>
      </div>
      
      <div style={{height: '320px', width: '100%'}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRiders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="hour" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip />
            <Area type="monotone" dataKey="avgRiders" name="Avg Riders" stroke="var(--accent-blue)" strokeWidth={4} fillOpacity={1} fill="url(#colorRiders)" activeDot={{ r: 8, fill: "var(--accent-blue)", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default CapacityChart;
