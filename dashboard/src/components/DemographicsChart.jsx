import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

const DemographicsChart = ({ data }) => {
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const week = Array.from({length: 7}, (_, i) => ({ day: days[i], casual: 0, registered: 0, count: 0 }));
    data.forEach(row => {
      week[row.weekday].casual += row.casual;
      week[row.weekday].registered += row.registered;
      week[row.weekday].count += 1;
    });
    return week.map(d => ({
      name: d.day,
      Casual: Math.round(d.casual / d.count) || 0,
      Registered: Math.round(d.registered / d.count) || 0
    }));
  }, [data]);

  return (
    <div className="glass-card card-third animate-fade-in" style={{animationDelay: '0.2s'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
        <div style={{background: 'rgba(138, 43, 226, 0.1)', padding: '12px', borderRadius: '12px'}}>
          <Users color="var(--accent-purple)" size={28} />
        </div>
        <div>
          <h2 style={{fontSize: '1.6rem', marginBottom: '4px'}}>Targeted Marketing</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Casual vs Registered Conversions</p>
        </div>
      </div>
      
      <div style={{height: '320px', width: '100%'}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
            <Bar dataKey="Registered" stackId="a" fill="var(--accent-blue)" radius={[0,0,6,6]} animationDuration={1500} />
            <Bar dataKey="Casual" stackId="a" fill="var(--accent-purple)" radius={[6,6,0,0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default DemographicsChart;
