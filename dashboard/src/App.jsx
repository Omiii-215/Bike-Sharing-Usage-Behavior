import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CapacityChart from './components/CapacityChart';
import DemographicsChart from './components/DemographicsChart';
import WeatherImpact from './components/WeatherImpact';
import EDAGallery from './components/EDAGallery';
import MLPredictor from './components/MLPredictor';
import { LayoutDashboard, FileImage, BrainCircuit } from 'lucide-react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allData = [];
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: chunk, error } = await supabase
            .from('bike_sharing_data')
            .select('*')
            .range(offset, offset + limit - 1);
          
          if (error) throw error;
          
          if (chunk.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...chunk];
            offset += limit;
          }
          if (offset > 20000) break;
        }
        setData(allData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <h2 className="gradient-text">Syncing Live Data from Supabase...</h2>
      <p style={{color: 'var(--text-secondary)'}}>Securely downloading 17,000+ machine learning records</p>
    </div>
  );

  if (error) return <div style={{color: '#ff4d4d', margin: '2rem', padding: '20px', border: '1px solid #ff4d4d', borderRadius: '10px'}}>Error establishing secure connection: {error}. Please ensure your Supabase backend is active!</div>;

  return (
    <div className="app-container">
      <header className="dashboard-header animate-fade-in" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
          <div>
            <h1 className="dashboard-title"><span className="gradient-text">Capital Bikeshare</span> Analytics</h1>
            <p className="dashboard-subtitle">Machine Learning & Behavior Impact Dashboard</p>
          </div>
          <div className="glass-card" style={{padding: '12px 24px', flexDirection: 'row', gap: '20px', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Live DB Records</span>
              <strong style={{fontSize: '1.4rem', color: 'var(--accent-blue)'}}>{data.length.toLocaleString()}</strong>
            </div>
            <div style={{height: '35px', width: '1px', background: 'var(--border-color)'}}></div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px'}}>System Protocol</span>
              <strong style={{fontSize: '1.4rem', color: '#00ff88'}}>Healthy</strong>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{display: 'flex', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', width: '100%'}}>
           <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={20}/> Supabase Data Story</button>
           <button onClick={() => setActiveTab('eda')} className={`tab-btn ${activeTab === 'eda' ? 'active' : ''}`}><FileImage size={20}/> EDA Image Reports</button>
           <button onClick={() => setActiveTab('ml')} className={`tab-btn ${activeTab === 'ml' ? 'active' : ''}`}><BrainCircuit size={20}/> Interactive ML Predictor</button>
        </div>
      </header>

      <main className="dashboard-grid">
        {activeTab === 'dashboard' && (
           <>
              <CapacityChart data={data} />
              <DemographicsChart data={data} />
              <WeatherImpact data={data} />
           </>
        )}
        
        {activeTab === 'eda' && <EDAGallery />}
        
        {activeTab === 'ml' && <MLPredictor />}
      </main>
    </div>
  );
}
export default App;
