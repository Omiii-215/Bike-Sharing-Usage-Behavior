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
    <div className="neo-card card-half animate-fade-in" style={{animationDelay: '0.2s', display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px'}}>
        <div className="neo-icon-well">
          <Users color="var(--accent-primary)" size={28} />
        </div>
        <div>
          <h2 className="font-display" style={{fontSize: '1.6rem', marginBottom: '4px'}}>Who's Riding Today?</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Registered Members vs Casual Riders</p>
        </div>
      </div>
      
      <p style={{color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '30px'}}>
        Our riders fall into two main groups: loyal <em>Registered</em> members who use the bikes daily to get to work, and <em>Casual</em> riders who rent bikes mostly for fun or occasional trips.
        <br/><br/>
        As you can see, while our registered members keep the system busy consistently on weekdays, our casual riders completely take over and love riding the bikes over the weekend!
      </p>
      
      <div className="neo-inset-well" style={{height: '350px', width: '100%', marginTop: 'auto'}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} />
            <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '13px', color: 'var(--text-primary)'}} />
            <Bar dataKey="Registered" stackId="a" fill="var(--text-primary)" radius={[0,0,10,10]} animationDuration={1500} />
            <Bar dataKey="Casual" stackId="a" fill="var(--accent-primary)" radius={[10,10,0,0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default DemographicsChart;
