import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloudRain } from 'lucide-react';

// ==============================================================================
// COMPONENT: WeatherImpact.jsx
// Purpose: This component shows how different weather conditions affect bike rentals.
// How it connects: It receives the dataset from App.jsx, groups the rides by the 
// 'weathersit' (weather situation) code, and renders a PieChart showing the 
// proportion of rides under each weather condition.
// ==============================================================================

const WeatherImpact = ({ data }) => {
  const chartData = useMemo(() => {
    const weather = [
      { name: 'Clear / Partly Cloudy', count: 0, total: 0 },
      { name: 'Mist / Broken Clouds', count: 0, total: 0 },
      { name: 'Light Rain / Snow', count: 0, total: 0 },
      { name: 'Heavy Storms', count: 0, total: 0 }
    ];
    
    data.forEach(row => {
      const idx = row.weathersit - 1;
      if (idx >= 0 && idx < 4) {
        weather[idx].count += row.cnt;
        weather[idx].total += 1;
      }
    });
    
    return weather.map(w => ({
      name: w.name,
      value: Math.round(w.count / (w.total || 1))
    })).filter(w => w.value > 0);
  }, [data]);

  const COLORS = ['#6C63FF', '#8B84FF', '#A3B1C6', '#3D4852'];

  return (
    <div className="neo-card card-half animate-fade-in" style={{animationDelay: '0.3s', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px'}}>
          <div className="neo-icon-well">
            <CloudRain color="var(--accent-primary)" size={28} />
          </div>
          <div>
            <h2 className="font-display" style={{fontSize: '1.6rem', marginBottom: '4px'}}>The Weather Impact</h2>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>How rain and snow affect riding...</p>
          </div>
        </div>
        
        <p style={{color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '30px'}}>
          As you might expect, the weather plays a massive role in how many people choose to bike on any given day. 
          <br/><br/>
          While nice, clear days bring out the most riders, heavy storms, rain, and snow cause ridership to completely drop off. We monitor these weather patterns closely to ensure our bikes and our riders stay safe during extreme conditions.
        </p>

      <div className="neo-inset-well" style={{height: '350px', width: '100%', marginTop: 'auto'}}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              stroke="var(--bg-neumorphic)"
              strokeWidth={3}
              animationDuration={2000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} Riders/Hour`, 'Utility Baseline']}
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '13px'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default WeatherImpact;
