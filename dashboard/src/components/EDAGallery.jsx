import React, { useState, useEffect } from 'react';
import { Camera, Layers, Calendar, Cloud, BarChart3 } from 'lucide-react';

const EDAGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/images')
      .then(res => res.json())
      .then(data => {
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load images from FastAPI", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="neo-card card-wide" style={{textAlign: 'center', color: 'var(--text-muted)'}}>Loading Pandas Data Visualizations via FastAPI routing...</div>;

  // Defining storytelling segregations specifically targeted for exact files exported by the Jupyter/Python pipeline
  const categories = [
    {
      title: "Time & Day Patterns",
      icon: <Layers size={24} color="var(--accent-primary)"/>,
      desc: "These charts look at how ridership changes depending on the hour of the day or the day of the week. You can see the big difference between busy weekday commutes and more relaxed weekend rides.",
      files: ["hourly_pattern.png", "daily_trend.png"]
    },
    {
      title: "Seasonal Changes",
      icon: <Calendar size={24} color="var(--accent-primary)"/>,
      desc: "Biking is an outdoor activity, so the seasons matter! These graphics highlight the massive surge of riders during the beautiful Spring and warm Summer months compared to freezing Winters.",
      files: ["seasonal_distribution.png", "outliers_by_season.png"]
    },
    {
      title: "Weather Activity",
      icon: <Cloud size={24} color="var(--accent-primary)"/>,
      desc: "Nobody likes getting caught in a storm. This graph proves how heavily dark clouds, heavy rain, and snow negatively affect how many people want to rent our bikes.",
      files: ["weather_impact.png"]
    },
    {
      title: "Deep Data Connections",
      icon: <BarChart3 size={24} color="var(--accent-primary)"/>,
      desc: "This graphic looks at all our hidden data variables and highlights the strongest connections—like how 'temperature' is the single strongest factor in driving up daily rentals!",
      files: ["correlation_matrix.png", "rental_distribution.png"]
    }
  ];

  return (
    <div className="card-wide animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '40px'}}>
      
      <div className="neo-card" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <div className="neo-icon-well"><Camera color="var(--accent-primary)" size={28} /></div>
          <h2 className="font-display" style={{fontSize: '1.8rem'}}>Our Data Stories & Graphic Visuals</h2>
        </div>
        <p style={{fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '1200px'}}>
           We've generated plenty of fun and easy-to-read graphical charts to help visualize the millions of bike rides generated daily. Browse the graphic gallery below to learn neat facts about the behavior of our riders and our city!
        </p>
      </div>

      {categories.map((cat, idx) => (
         <div key={idx} className="neo-card" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '20px'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  {cat.icon}
                  <h3 className="font-display" style={{fontSize: '1.4rem'}}>{cat.title}</h3>
               </div>
               <p style={{color: 'var(--text-muted)'}}>{cat.desc}</p>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', paddingTop: '10px'}}>
               {cat.files.map(file => {
                  if (!images.includes(file)) return null;
                  return (
                     <div key={file} className="neo-inset-well" style={{padding: '16px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                         <img 
                           src={`http://localhost:8000/static/${file}`} 
                           alt={file} 
                           style={{width: '100%', height: 'auto', borderRadius: '12px', boxShadow: 'var(--shadow-extruded-small)'}} 
                         />
                         <span style={{textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '10px'}}>
                           {file.replace('.png', '').replace(/_/g, ' ')}
                         </span>
                     </div>
                  );
               })}
            </div>
         </div>
      ))}
      
    </div>
  );
};
export default EDAGallery;
