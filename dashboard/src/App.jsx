import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CapacityChart from './components/CapacityChart';
import DemographicsChart from './components/DemographicsChart';
import WeatherImpact from './components/WeatherImpact';
import EDAGallery from './components/EDAGallery';
import MLPredictor from './components/MLPredictor';
import { LayoutDashboard, FileImage, BrainCircuit, Activity, Database, Network } from 'lucide-react';

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
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'20px'}}>
       <div className="neo-icon-circle-well animate-float"><Database size={44} color="var(--accent-primary)"/></div>
       <h2 className="font-display">Synchronizing Core Engine ...</h2>
       <p style={{fontSize: '1.1rem'}}>Routinely downloading 17,379 operational records securely via Supabase pgvector endpoints.</p>
    </div>
  );

  if (error) return <div className="neo-card" style={{margin: '40px', color: '#ff4d4d'}}><h3>Fatal Handshake Error</h3><p>{error}</p></div>;

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div className="header-top">
          <div>
            <h1 className="font-display" style={{fontSize: '3.5rem', color: 'var(--accent-primary)'}}>Capital Bikeshare</h1>
            <h2 className="font-display" style={{fontSize: '1.4rem', color: 'var(--text-muted)', marginTop: '8px', letterSpacing: '0px'}}>Intelligence & ML Pipeline Dashboard</h2>
          </div>
          
          <div className="neo-card" style={{padding: '24px 40px', display: 'flex', gap: '40px', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'}}>Valid Records</span>
              <strong className="font-display" style={{fontSize: '2rem', color: 'var(--text-primary)'}}>{data.length.toLocaleString()}</strong>
            </div>
            <div className="neo-inset-well" style={{padding: '2px', width: '2px', height: '50px', borderRadius: '4px'}}></div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'}}>FastAPI AI Server</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <div style={{width: '12px', height: '12px', background: 'var(--accent-secondary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-secondary)'}}></div>
                 <strong className="font-display" style={{fontSize: '1.5rem', color: 'var(--text-primary)'}}>Online</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Global Architecture Narrative Element */}
        <div className="neo-card card-wide" style={{padding: '40px', display: 'flex', gap: '30px', alignItems: 'flex-start'}}>
           <div className="neo-icon-well"><Network color="var(--accent-primary)" size={36}/></div>
           <div>
              <h3 className="font-display" style={{fontSize: '1.6rem', marginBottom: '16px'}}>Welcome to the Capital Bikeshare Dashboard!</h3>
              <p style={{fontSize: '1.1rem', maxWidth: '1300px'}}>
                 This tool helps us understand how millions of riders use the city's bike network every day. Our goal is to make sure bikes are always available when and where people need them.
                 <br/><br/>
                 Behind the scenes, we securely pull live data from our databases, while our smart <strong>Artificial Intelligence</strong> helps predict future demand and rider habits in real-time!
              </p>
           </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="nav-tabs">
           <button onClick={() => setActiveTab('dashboard')} className={`neo-btn ${activeTab === 'dashboard' ? 'active-tab' : ''}`}><LayoutDashboard size={20}/> Supabase Macro Analysis</button>
           <button onClick={() => setActiveTab('eda')} className={`neo-btn ${activeTab === 'eda' ? 'active-tab' : ''}`}><FileImage size={20}/> EDA Visualization Engine</button>
           <button onClick={() => setActiveTab('ml')} className={`neo-btn ${activeTab === 'ml' ? 'active-tab' : ''}`}><BrainCircuit size={20}/> Interactive AI Predictor</button>
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
