import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloudRain } from 'lucide-react';

const WeatherImpact = ({ data }) => {
  const chartData = useMemo(() => {
    const weather = [
      { name: 'Clear/Partly Cloudy', count: 0, total: 0 },
      { name: 'Mist/Cloudy', count: 0, total: 0 },
      { name: 'Light Rain/Snow', count: 0, total: 0 },
      { name: 'Heavy Storm', count: 0, total: 0 }
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

  const COLORS = ['#00d2ff', '#3a86ff', '#8a2be2', '#ff4d4d'];

  return (
    <div className="glass-card card-wide animate-fade-in" style={{animationDelay: '0.3s', flexDirection: 'row', alignItems: 'center', padding: '30px 40px'}}>
      <div style={{flex: 1.2}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}>
          <div style={{background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '12px'}}>
            <CloudRain color="#ff4d4d" size={28} />
          </div>
          <div>
            <h2 style={{fontSize: '1.6rem', marginBottom: '4px'}}>Operations & ML Anomalies</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Drop-Off During Adverse Weather Situations</p>
          </div>
        </div>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '85%'}}>
          The Machine Learning <strong>Isolation Forest</strong> algorithm completely flagged "Weather Situation 4" conditions as systemic operational anomalies. 
          Ridership dramatically plummets, alerting ground dispatch teams to immediately halt standard station rebalancing routes and safely commence storm preservation tactics for the entire Capital fleet.
        </p>
      </div>
      
      <div style={{height: '250px', flex: 0.8}}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              animationDuration={2000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} Riders/Hour`, 'Utility Baseline']}
              contentStyle={{background: 'rgba(15, 17, 26, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px'}}
            />
            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '13px', color: '#fff'}} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default WeatherImpact;
