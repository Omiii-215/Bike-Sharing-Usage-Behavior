import React, { useState } from 'react';
import { BrainCircuit, Activity, Cpu } from 'lucide-react';

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
      console.error("FastAPI Target Error:", err);
      alert("Failed backend resolution. Ensure Uvicorn server is running locally on port 8000.");
    }
    setLoading(false);
  };

  return (
    <div className="neo-card card-wide animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
      
      <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
        <div className="neo-icon-well">
          <BrainCircuit color="var(--accent-primary)" size={32} />
        </div>
        <div>
          <h2 className="font-display" style={{fontSize: '1.8rem', marginBottom: '8px'}}>AI Usage Predictor</h2>
          <p style={{fontSize: '1.1rem', maxWidth: '1100px'}}>
             Ever wonder how busy the bikes will be depending on the weather or the time of day? 
             <br/><br/>
             Use the tools below to set up your perfect test scenario. Pick the hour, the temperature, and the season! Once you hit the button, our smart <strong>Artificial Intelligence</strong> model will automatically look at your choices and predict exactly how many bikes will be rented out, and who will be riding them!
          </p>
        </div>
      </div>
      
      <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '20px'}}>
        <form onSubmit={handleSubmit} style={{flex: 1.2, display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '24px'}}>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label style={{color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, paddingLeft: '5px'}}>Target Hour (0-23)</label>
            <input type="number" min="0" max="23" className="neo-input" value={form.hr} onChange={e => setForm({...form, hr: parseInt(e.target.value)})} />
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label style={{color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, paddingLeft: '5px'}}>Core Temperature (°C)</label>
            <input type="number" step="0.1" className="neo-input" value={form.temp_c} onChange={e => setForm({...form, temp_c: parseFloat(e.target.value)})} />
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label style={{color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, paddingLeft: '5px'}}>Environmental Season</label>
            <select className="neo-input" value={form.season} onChange={e => setForm({...form, season: parseInt(e.target.value)})}>
              <option value="1">Spring</option><option value="2">Summer</option><option value="3">Fall</option><option value="4">Winter</option>
            </select>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label style={{color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, paddingLeft: '5px'}}>Atmospheric Code</label>
            <select className="neo-input" value={form.weathersit} onChange={e => setForm({...form, weathersit: parseInt(e.target.value)})}>
              <option value="1">Code 1 (Clear / Calm)</option>
              <option value="2">Code 2 (Misty / Dark)</option>
              <option value="3">Code 3 (Light Rain)</option>
              <option value="4">Code 4 (Severe Anomaly)</option>
            </select>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label style={{color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, paddingLeft: '5px'}}>Commuting Constraint</label>
            <select className="neo-input" value={form.workingday} onChange={e => setForm({...form, workingday: parseInt(e.target.value)})}>
              <option value="1">Active Workday Route</option><option value="0">Weekend Relaxation</option>
            </select>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label style={{color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, paddingLeft: '5px'}}>Holiday Exemption</label>
            <select className="neo-input" value={form.holiday} onChange={e => setForm({...form, holiday: parseInt(e.target.value)})}>
              <option value="0">Standard Volume</option><option value="1">Official Holiday</option>
            </select>
          </div>

          <div style={{gridColumn: '1 / -1', marginTop: '20px'}}>
            <button type="submit" disabled={loading} className="neo-btn-primary" style={{width: '100%', fontSize: '1.2rem', padding: '20px'}}>
              {loading ? "Establishing Py Socket & Executing .predict()..." : "Initialize ML Model Inferences"}
            </button>
          </div>
        </form>

        {/* Prediction Results Board */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '24px'}}>
             <div className="neo-inset-well" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '220px'}}>
                 <span style={{color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 700}}>Random Forest Scaling Demand Outlier</span>
                 <strong className="font-display" style={{fontSize: '4.5rem', color: 'var(--accent-primary)', marginTop: '5px'}}>
                    {demandResult !== null ? demandResult.toLocaleString() : "---"}
                 </strong>
                 <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Cpu size={16}/> Hardware Inference Output
                 </span>
             </div>
             
             <div className="neo-inset-well" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '220px'}}>
                 <span style={{color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 700}}>Logistic Regression Target Cohort</span>
                 <strong className="font-display" style={{fontSize: '3.5rem', color: 'var(--text-primary)', marginTop: '5px'}}>
                    {userResult !== null ? userResult : "---"}
                 </strong>
                 <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Activity size={16}/> Binary Demographic Classification
                 </span>
             </div>
        </div>
        
      </div>
    </div>
  );
};
export default MLPredictor;
