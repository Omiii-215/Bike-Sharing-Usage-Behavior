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
    <div className="neo-card card-wide animate-fade-in" style={{animationDelay: '0.1s', display: 'flex', gap: '40px', alignItems: 'center'}}>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px'}}>
          <div className="neo-icon-well">
            <TrendingUp color="var(--accent-primary)" size={28} />
          </div>
          <div>
            <h2 className="font-display" style={{fontSize: '1.6rem', marginBottom: '4px'}}>Rush Hour Demand</h2>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Understanding when the city rides</p>
          </div>
        </div>
        
        <p style={{color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7}}>
          This chart shows the average number of bikes rented throughout the day. It's easy to see when the city is busiest!
          <br/><br/>
          Notice the huge spikes at <strong>8:00 AM</strong> and <strong>5:00 PM</strong>? These are our core commuter rush hours. During these times, our team works constantly to move bikes around the city so that no station is ever empty when someone needs a ride to work or home.
        </p>
      </div>
      
      <div className="neo-inset-well" style={{height: '400px', flex: 1.5}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRiders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickMargin={15} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickMargin={15} />
            <Tooltip />
            <Area type="monotone" dataKey="avgRiders" name="Avg Riders" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRiders)" activeDot={{ r: 8, fill: "var(--accent-primary)", stroke: "var(--bg-neumorphic)", strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default CapacityChart;
