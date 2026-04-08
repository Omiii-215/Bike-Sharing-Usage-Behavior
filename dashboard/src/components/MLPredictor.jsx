import React, { useState } from 'react';
import { BrainCircuit, Activity } from 'lucide-react';

const MLPredictor = () => {
  const [form, setForm] = useState({
    hr: 12,
    season: 2,
    weathersit: 1,
    temp_c: 20.0,
    workingday: 1,
    holiday: 0
  });

  const [demandResult, setDemandResult] = useState(null);
  const [userResult, setUserResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Execute 2 concurrent secure backend requests
      const [demandRes, userRes] = await Promise.all([
        fetch('http://localhost:8000/predict/demand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hr: form.hr, season: form.season, weathersit: form.weathersit, temp_c: form.temp_c, workingday: form.workingday })
        }),
        fetch('http://localhost:8000/predict/usertype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hr: form.hr, season: form.season, weathersit: form.weathersit, holiday: form.holiday })
        })
      ]);
      
      const demandData = await demandRes.json();
      const userData = await userRes.json();
      
      setDemandResult(demandData.predicted_demand);
      setUserResult(userData.dominant_user_type);
    } catch (err) {
      console.error("Inference Error:", err);
      alert("Failed to hit FastAPI backend. Is it running alongside Vite?");
    }
    setLoading(false);
  };

  const inputStyle = {
    background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--border-color)', 
    padding: '10px 14px', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', width: '100%', 
    fontSize: '1rem', marginTop: '6px'
  };

  return (
    <div className="glass-card card-wide animate-fade-in" style={{padding: '30px 40px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
        <div style={{background: 'rgba(138, 43, 226, 0.1)', padding: '12px', borderRadius: '12px'}}>
          <BrainCircuit color="var(--accent-purple)" size={28} />
        </div>
        <div>
          <h2 style={{fontSize: '1.6rem', marginBottom: '4px'}}>Machine Learning Predictor</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Interactive Real-Time Inference using Random Forest & Logistic Regression</p>
        </div>
      </div>
      
      <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
        <form onSubmit={handleSubmit} style={{flex: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Hour of Day (0-23)</label>
            <input type="number" min="0" max="23" value={form.hr} onChange={e => setForm({...form, hr: parseInt(e.target.value)})} style={inputStyle} />
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Temperature (°C)</label>
            <input type="number" step="0.1" value={form.temp_c} onChange={e => setForm({...form, temp_c: parseFloat(e.target.value)})} style={inputStyle} />
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Season (1:Spring, 2:Summer, 3:Fall, 4:Winter)</label>
            <select value={form.season} onChange={e => setForm({...form, season: parseInt(e.target.value)})} style={inputStyle}>
              <option value="1">Spring</option><option value="2">Summer</option><option value="3">Fall</option><option value="4">Winter</option>
            </select>
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Weather (1:Clear, 4:Severe)</label>
            <select value={form.weathersit} onChange={e => setForm({...form, weathersit: parseInt(e.target.value)})} style={inputStyle}>
              <option value="1">Clear</option><option value="2">Misty</option><option value="3">Light Rain</option><option value="4">Severe Storm</option>
            </select>
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Working Day?</label>
            <select value={form.workingday} onChange={e => setForm({...form, workingday: parseInt(e.target.value)})} style={inputStyle}>
              <option value="1">Yes (Commute)</option><option value="0">No (Weekend/Holiday)</option>
            </select>
          </div>
          <div>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Holiday?</label>
            <select value={form.holiday} onChange={e => setForm({...form, holiday: parseInt(e.target.value)})} style={inputStyle}>
              <option value="0">No</option><option value="1">Yes</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{
              gridColumn: '1 / -1', background: 'var(--accent-blue)', color: '#000', padding: '14px', 
              fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', 
              boxShadow: '0 4px 15px rgba(0, 210, 255, 0.4)', marginTop: '10px', transition: 'all 0.3s ease'
          }}>
            {loading ? "Running Inference..." : "Predict Demand & User Base"}
          </button>
        </form>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '20px'}}>
             <div className="glass-card" style={{flex: 1, padding: '30px', border: '1px solid rgba(0, 210, 255, 0.3)', background: 'rgba(0, 210, 255, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                 <span style={{color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem'}}>Predicted Total Demand</span>
                 <strong style={{fontSize: '4rem', color: '#fff', textShadow: '0 0 20px rgba(0, 210, 255, 0.6)'}}>
                    {demandResult !== null ? demandResult : "--"}
                 </strong>
                 <span style={{color: 'var(--accent-blue)', marginTop: '5px'}}><Activity size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> Random Forest Inference</span>
             </div>
             
             <div className="glass-card" style={{flex: 1, padding: '30px', border: '1px solid rgba(138, 43, 226, 0.3)', background: 'rgba(138, 43, 226, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                 <span style={{color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem'}}>Dominant User Base</span>
                 <strong style={{fontSize: '2.5rem', color: '#fff', textShadow: '0 0 20px rgba(138, 43, 226, 0.6)', marginTop: '10px'}}>
                    {userResult !== null ? userResult : "--"}
                 </strong>
                 <span style={{color: 'var(--accent-purple)', marginTop: '15px'}}>Logistic Regression Inference</span>
             </div>
        </div>
      </div>
    </div>
  );
};
export default MLPredictor;
