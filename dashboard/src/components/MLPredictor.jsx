import React, { useState } from 'react';
import { BrainCircuit, Activity, Cpu, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// ==============================================================================
// COMPONENT: MLPredictor.jsx
// Purpose: This is the interactive interface for the Machine Learning models. 
// It allows users to input specific parameters (date, hour, temperature, etc.) 
// and get predictions for expected bike demand and primary user type.
// How it connects: 
// 1. It fetches real-time weather and holiday data from external APIs based on the selected date.
// 2. It sends these parameters to the FastAPI backend (api.py) via POST requests.
// 3. It displays the returned predictions from the Python ML models.
// ==============================================================================

const MLPredictor = () => {
  // 1. State Variables
  // 'form' holds the current input parameters selected by the user.
  const [form, setForm] = useState({
    hr: 12,
    season: 2,
    weathersit: 1,
    temp_c: 20.0,
    workingday: 1,
    holiday: 0
  });
  const [dateOnly, setDateOnly] = useState('');
  const [hour, setHour] = useState(12);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  const [demandResult, setDemandResult] = useState(null);
  const [userResult, setUserResult] = useState(null);
  const [dailyWeather, setDailyWeather] = useState(null);
  const [dailyDemand, setDailyDemand] = useState(null);
  const [loading, setLoading] = useState(false);

  // Determine API URL based on environment (Vite dev server vs production)
  const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

  // 2. Submit Handler (handleSubmit)
  // Executes when the user clicks to initialize ML inferences.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Turn on the loading spinner
    try {
      // Prepare a batch of 24 requests (one for each hour) to generate the daily forecast chart.
      let batchRequests = [];
      if (dailyWeather && dailyWeather.time.length >= 24) {
          for (let i = 0; i < 24; i++) {
              let wCode = dailyWeather.weathercode[i];
              let wSit = 1;
              if ([0, 1, 2, 3].includes(wCode)) wSit = 1;
              else if ([45, 48].includes(wCode)) wSit = 2;
              else if ([51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82].includes(wCode)) wSit = 3;
              else wSit = 4;

              batchRequests.push({
                  hr: i,
                  season: form.season,
                  weathersit: wSit,
                  temp_c: dailyWeather.temperature_2m[i],
                  workingday: form.workingday
              });
          }
      } else {
          for (let i = 0; i < 24; i++) {
              batchRequests.push({...form, hr: i});
          }
      }

      // 3. API Calls to FastAPI backend (api.py)
      // We use Promise.all to execute three prediction requests concurrently.
      // 1. Demand: Predict bike count for the specific hour.
      // 2. UserType: Predict dominant user type for the specific hour.
      // 3. Demand Batch: Predict bike counts for all 24 hours.
      const [demandRes, userRes, batchRes] = await Promise.all([
        fetch(`${API_BASE}/predict/demand`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hr: form.hr, season: form.season, weathersit: form.weathersit, temp_c: form.temp_c, workingday: form.workingday })
        }),
        fetch(`${API_BASE}/predict/usertype`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hr: form.hr, season: form.season, weathersit: form.weathersit, holiday: form.holiday })
        }),
        fetch(`${API_BASE}/predict/demand_batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests: batchRequests })
        })
      ]);
      
      const demandData = await demandRes.json();
      const userData = await userRes.json();
      const batchData = await batchRes.json();
      
      // 4. State Update
      // Save the returned predictions to state to update the UI.
      setDemandResult(demandData.predicted_demand);
      setUserResult(userData.dominant_user_type);
      
      // Format the 24-hour batch data for the Recharts AreaChart.
      if (batchData.predicted_demands) {
          const chartData = batchData.predicted_demands.map((demand, index) => ({
              name: `${String(index).padStart(2, '0')}:00`,
              "Predicted Bikes": demand
          }));
          setDailyDemand(chartData);
      }
    } catch (err) {
      console.error("FastAPI Target Error:", err);
      alert("Failed backend resolution. Ensure Uvicorn server is running locally on port 8000.");
    }
    setLoading(false); // Turn off the loading spinner
  };

  // 5. External Data Fetcher (fetchDerivedData)
  // Automatically fetches weather data (Open-Meteo API) and holiday data (Nager.Date API) 
  // based on the user's selected date, populating the form automatically.
  const fetchDerivedData = async (dateStr, hrVal) => {
    if (!dateStr) return;

    setIsFetchingWeather(true);
    // Parse the date components locally to avoid timezone shifting
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr); // 1-12
    const day = parseInt(dayStr);
    
    // Create date at noon local time to avoid timezone edge cases
    const selectedDate = new Date(year, month - 1, day, 12, 0, 0);
    
    let season = 1;
    if (month >= 3 && month <= 5) season = 2;
    else if (month >= 6 && month <= 8) season = 3;
    else if (month >= 9 && month <= 11) season = 4;
    
    const dayOfWeek = selectedDate.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    let isHoliday = false;
    try {
       const holRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`);
       if (holRes.ok) {
           const holidays = await holRes.json();
           isHoliday = holidays.some(h => h.date === dateStr);
       }
    } catch (err) { console.warn("Could not fetch holidays", err); }
    
    const holiday = isHoliday ? 1 : 0;
    const workingday = (!isWeekend && !isHoliday) ? 1 : 0;

    let temp_c = form.temp_c; 
    let weathersit = form.weathersit;
    try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=38.8951&longitude=-77.0364&hourly=temperature_2m,weathercode&start_date=${dateStr}&end_date=${dateStr}`);
        if (weatherRes.ok) {
            const wData = await weatherRes.json();
            if (wData && wData.hourly) {
                setDailyWeather(wData.hourly);
            }
            
            const timeString = `${dateStr}T${String(hrVal).padStart(2, '0')}:00`;
            const hourIndex = wData.hourly.time.indexOf(timeString);
            
            if (hourIndex !== -1) {
                temp_c = wData.hourly.temperature_2m[hourIndex];
                const wmoCode = wData.hourly.weathercode[hourIndex];
                
                if ([0, 1, 2, 3].includes(wmoCode)) weathersit = 1;
                else if ([45, 48].includes(wmoCode)) weathersit = 2;
                else if ([51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82].includes(wmoCode)) weathersit = 3;
                else weathersit = 4;
            }
        } else {
            throw new Error("Weather API returned an error (likely future/unsupported date).");
        }
    } catch (err) { 
        console.warn("Falling back to simulated weather curve:", err);
        let baseTemp = 15;
        if (season === 1) baseTemp = 5;
        else if (season === 2) baseTemp = 15;
        else if (season === 3) baseTemp = 28;
        else if (season === 4) baseTemp = 18;
        
        const pseudoRandomCode = (day + month) % 4 === 0 ? 3 : ((day + month) % 3 === 0 ? 2 : 1);
        
        const simulatedHourlyTemp = Array.from({length: 24}, (_, i) => {
             return Number((baseTemp + (Math.sin((i - 8) * Math.PI / 12) * 8)).toFixed(1));
        });
        const simulatedHourlyWeatherCode = Array.from({length: 24}, () => pseudoRandomCode === 3 ? 51 : (pseudoRandomCode === 2 ? 45 : 0));
        
        const mockHourly = {
            time: Array.from({length: 24}, (_, i) => `${dateStr}T${String(i).padStart(2, '0')}:00`),
            temperature_2m: simulatedHourlyTemp,
            weathercode: simulatedHourlyWeatherCode
        };
        
        setDailyWeather(mockHourly);
        temp_c = mockHourly.temperature_2m[hrVal];
        weathersit = pseudoRandomCode;
    }
    
    setForm({ hr: hrVal, season, weathersit, temp_c, workingday, holiday });
    setIsFetchingWeather(false);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setDateOnly(val);
    fetchDerivedData(val, hour);
  };

  const handleHourChange = (e) => {
    const newHr = parseInt(e.target.value);
    setHour(newHr);
    
    setForm(prevForm => {
        let temp_c = prevForm.temp_c;
        let weathersit = prevForm.weathersit;

        if (dailyWeather && dailyWeather.time && dailyWeather.time.length > newHr) {
            temp_c = dailyWeather.temperature_2m[newHr];
            const wmoCode = dailyWeather.weathercode[newHr];
            if ([0, 1, 2, 3].includes(wmoCode)) weathersit = 1;
            else if ([45, 48].includes(wmoCode)) weathersit = 2;
            else if ([51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82].includes(wmoCode)) weathersit = 3;
            else weathersit = 4;
        }
        
        return { ...prevForm, hr: newHr, temp_c, weathersit };
    });
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
        <form onSubmit={handleSubmit} style={{flex: 1.2, display: 'flex', flexDirection: 'column', gap: '24px'}}>
          
          <div style={{display: 'flex', gap: '20px', flexDirection: 'row'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', flex: 1}}>
              <label style={{color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, paddingLeft: '5px'}}>
                Select Date <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'normal'}}>(Fetches context!)</span>
              </label>
              <input 
                type="date" 
                className="neo-input" 
                style={{padding: '16px', fontSize: '1.1rem'}}
                value={dateOnly} 
                onChange={handleDateChange} 
                required
              />
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', flex: 1}}>
              <label style={{color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, paddingLeft: '5px', display: 'flex', justifyContent: 'space-between'}}>
                <span>Select Hour</span>
                <span style={{color: 'var(--accent-primary)'}}>{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="23" 
                className="neo-input" 
                style={{padding: '16px 0', cursor: 'pointer', accentColor: 'var(--accent-primary)'}}
                value={hour} 
                onChange={handleHourChange} 
              />
            </div>
          </div>

          <div className="neo-inset-well" style={{padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase'}}>Temperature</span>
              <strong style={{fontSize: '1.2rem', color: 'var(--accent-primary)'}}>{isFetchingWeather ? 'Fetching...' : `${form.temp_c}°C`}</strong>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase'}}>Weather Status</span>
              <strong style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>
                {isFetchingWeather ? 'Fetching...' : form.weathersit === 1 ? 'Clear / Calm' : form.weathersit === 2 ? 'Misty / Cloudy' : form.weathersit === 3 ? 'Light Rain / Snow' : 'Severe Weather'}
              </strong>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase'}}>Season</span>
              <strong style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>
                {form.season === 1 ? 'Winter' : form.season === 2 ? 'Spring' : form.season === 3 ? 'Summer' : 'Fall'}
              </strong>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase'}}>Workday Status</span>
              <strong style={{fontSize: '1.2rem', color: 'var(--text-primary)'}}>
                {form.holiday === 1 ? 'Public Holiday' : form.workingday === 1 ? 'Active Workday' : 'Weekend'}
              </strong>
            </div>
          </div>

          <div style={{marginTop: '10px'}}>
            <button type="submit" disabled={loading || isFetchingWeather || !dateOnly} className="neo-btn-primary" style={{width: '100%', fontSize: '1.2rem', padding: '20px'}}>
              {loading ? "Establishing Py Socket & Executing .predict()..." : "Initialize ML Model Inferences"}
            </button>
          </div>
        </form>

        {/* Prediction Results Board */}         <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '24px'}}>
             <div className="neo-inset-well" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '220px'}}>
                 <span style={{color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 700}}>Predicted Total Rentals</span>
                 <strong className="font-display" style={{fontSize: '4.5rem', color: 'var(--accent-primary)', marginTop: '5px'}}>
                    {demandResult !== null ? demandResult.toLocaleString() : "---"}
                 </strong>
                 <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Cpu size={16}/> Estimated Total Bikes Needed
                 </span>
             </div>
             
             <div className="neo-inset-well" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '220px'}}>
                 <span style={{color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 700}}>Main Rider Type</span>
                 <strong className="font-display" style={{fontSize: '3.5rem', color: 'var(--text-primary)', marginTop: '5px'}}>
                    {userResult !== null ? userResult : "---"}
                 </strong>
                 <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Activity size={16}/> Expected User Majority
                 </span>
             </div>
         </div>
        
      </div>

      {demandResult !== null && userResult !== null && (
        <div className="neo-card animate-fade-in" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', animationDelay: '0.2s'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <div className="neo-icon-well"><Lightbulb color="var(--accent-primary)" size={24}/></div>
              <h3 className="font-display" style={{fontSize: '1.5rem'}}>AI Insight & Reasoning</h3>
           </div>
           
           <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
              <div style={{flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px'}}>
                 <div className="neo-inset-well" style={{padding: '24px'}}>
                    <h4 className="font-display" style={{marginBottom: '12px', color: 'var(--text-primary)', fontSize: '1.2rem', letterSpacing: '0.5px'}}>Why this matters for your shop</h4>
                    <p style={{color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem'}}>
                       By anticipating exactly <strong>{demandResult}</strong> rentals, you can perfectly optimize staff shifts and bike maintenance schedules today. 
                       Since the algorithm predicts <strong>{userResult}</strong> riders will dominate the hour, you can tailor your approach: 
                       {userResult === 'Casual' ? ' focus on upselling helmets, water bottles, and scenic tour maps for ad-hoc riders.' : ' prioritize rapid checkouts, balancing stations near transit hubs, and focusing on commuter reliability.'}
                    </p>
                 </div>
                 <div className="neo-inset-well" style={{padding: '24px'}}>
                    <h4 className="font-display" style={{marginBottom: '12px', color: 'var(--text-primary)', fontSize: '1.2rem', letterSpacing: '0.5px'}}>How we analyzed the data</h4>
                    <p style={{color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.05rem'}}>
                       Our <strong>Random Forest Regressor</strong> processes historical interactions between the temperature ({form.temp_c}°C), the exact hour ({form.hr}:00), and specific weather codes to scale the expected fleet utilization. Concurrently, a <strong>Logistic Regression</strong> model classifies the expected demographic by projecting these same variables against known commuter vs. tourist behavioral boundaries.
                    </p>
                 </div>
              </div>

              <div style={{flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column'}}>
                 <div className="neo-inset-well" style={{flex: 1, padding: '24px', display: 'flex', flexDirection: 'column'}}>
                    <h4 className="font-display" style={{textAlign: 'center', marginBottom: '20px', color: 'var(--text-primary)', fontSize: '1.1rem'}}>24-Hour Demand Forecast</h4>
                    <div style={{flex: 1, minHeight: '220px'}}>
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dailyDemand || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                                   <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val, i) => i % 2 === 0 ? val : ''} />
                             <RechartsTooltip cursor={{stroke: 'var(--text-muted)', strokeWidth: 1, strokeDasharray: '4 4'}} contentStyle={{backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-neumorphic)', boxShadow: 'var(--shadow-extruded)'}} />
                             <Area type="monotone" dataKey="Predicted Bikes" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default MLPredictor;
