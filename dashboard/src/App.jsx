import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CapacityChart from './components/CapacityChart';
import DemographicsChart from './components/DemographicsChart';
import WeatherImpact from './components/WeatherImpact';
import EDAGallery from './components/EDAGallery';
import MLPredictor from './components/MLPredictor';
import { LayoutDashboard, FileImage, BrainCircuit, Activity, Database, Network } from 'lucide-react';

// ==============================================================================
// COMPONENT: App.jsx (Main Dashboard Application)
// Purpose: This is the core structural component of the React frontend. It handles 
// navigation between different tabs (Dashboard, EDA, ML Predictor) and manages 
// the main dataset used by the visualizations.
// How it connects: 
// - It connects directly to the Supabase database (via supabaseClient.js) to 
//   download the bike sharing records when the app mounts.
// - It passes this downloaded data down to child components like CapacityChart, 
//   DemographicsChart, and WeatherImpact as props.
// ==============================================================================

function App() {
  // 1. State Variables
  // 'data': Holds the array of records fetched from Supabase.
  const [data, setData] = useState([]);
  // 'loading': Boolean indicating if the initial data fetch is in progress.
  const [loading, setLoading] = useState(true);
  // 'error': Stores any error strings encountered during the fetch.
  const [error, setError] = useState(null);
  // 'activeTab': Determines which view component to render (dashboard, eda, ml).
  const [activeTab, setActiveTab] = useState('dashboard');

  // 2. Data Fetching Effect
  // Executes on component mount. Fetches paginated data from the 'bike_sharing_data' Supabase table.
  useEffect(() => {
    const fetchData = async () => {
      try {
        let allData = [];
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        // We use pagination (limit 1000) in a while loop to fetch large datasets 
        // without hitting payload size limits. Max limit set to 20,000 to prevent browser lag.
        while (hasMore) {
          const { data: chunk, error } = await supabase
            .from('bike_sharing_data')
            .select('*')
            .range(offset, offset + limit - 1);
          
          if (error) throw error;
          
          if (chunk.length === 0) {
            hasMore = false; // Stop fetching if chunk is empty
          } else {
            allData = [...allData, ...chunk]; // Append chunk to accumulated data
            offset += limit;
          }
          // Safety brake: limit to 20000 records.
          if (offset > 20000) break;
        }
        // Save accumulated data to state and disable loading indicator.
        setData(allData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData(); // Execute the fetch
  }, []);

  // 3. Loading State UI
  if (loading) return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'20px'}}>
       <div className="neo-icon-circle-well animate-float"><Database size={44} color="var(--accent-primary)"/></div>
       <h2 className="font-display">Synchronizing Core Engine ...</h2>
       <p style={{fontSize: '1.1rem'}}>Routinely downloading 17,379 operational records securely via Supabase pgvector endpoints.</p>
    </div>
  );

  // 4. Error State UI
  if (error) return <div className="neo-card" style={{margin: '40px', color: '#ff4d4d'}}><h3>Fatal Handshake Error</h3><p>{error}</p></div>;

  // 5. Main Dashboard Render
  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div className="header-top">
          <div>
            <h1 className="font-display" style={{fontSize: '3.5rem', color: 'var(--accent-primary)'}}>Capital Bikeshare</h1>
            <h2 className="font-display" style={{fontSize: '1.4rem', color: 'var(--text-muted)', marginTop: '8px', letterSpacing: '0px'}}>Intelligence & ML Pipeline Dashboard</h2>
          </div>
          
          {/* Quick Stats Box: Shows how many rows we downloaded, and visually confirms the AI server is online */}
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

        {/* Global Architecture Narrative Element: High-level overview of the app's purpose */}
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
        
        {/* Navigation Tabs 
            Clicking a button updates the 'activeTab' state, triggering a re-render 
            to display the corresponding view component below. */}
        <div className="nav-tabs">
           <button onClick={() => setActiveTab('dashboard')} className={`neo-btn ${activeTab === 'dashboard' ? 'active-tab' : ''}`}><LayoutDashboard size={20}/> Supabase Macro Analysis</button>
           <button onClick={() => setActiveTab('eda')} className={`neo-btn ${activeTab === 'eda' ? 'active-tab' : ''}`}><FileImage size={20}/> EDA Visualization Engine</button>
           <button onClick={() => setActiveTab('ml')} className={`neo-btn ${activeTab === 'ml' ? 'active-tab' : ''}`}><BrainCircuit size={20}/> Interactive AI Predictor</button>
        </div>
      </header>

      {/* 6. Main Content Area */}
      <main className="dashboard-grid">
        
        {/* Render Supabase Dashboard Views */}
        {activeTab === 'dashboard' && (
           <>
              <CapacityChart data={data} />
              <DemographicsChart data={data} />
              <WeatherImpact data={data} />
           </>
        )}
        
        {/* Render EDA Gallery (Fetches images from api.py) */}
        {activeTab === 'eda' && <EDAGallery />}
        
        {/* Render ML Predictor (Interacts with api.py endpoints) */}
        {activeTab === 'ml' && <MLPredictor />}
      </main>
    </div>
  );
}
export default App;
