import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

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

  if (loading) return <div className="glass-card card-wide" style={{textAlign: 'center'}}>Loading Deep Visualizations...</div>;

  return (
    <div className="card-wide animate-fade-in">
      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px'}}>
        <div style={{background: 'rgba(0, 210, 255, 0.1)', padding: '12px', borderRadius: '12px'}}>
          <Camera color="var(--accent-blue)" size={28} />
        </div>
        <div>
          <h2 style={{fontSize: '1.6rem', marginBottom: '4px'}}>Exploratory Data Analysis Gallery</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Comprehensive static reports generated during the initial EDA pipeline.</p>
        </div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
        {images.map(img => (
          <div key={img} className="glass-card" style={{padding: '10px', height: 'auto', display: 'flex', flexDirection: 'column'}}>
             <img 
               src={`http://localhost:8000/static/${img}`} 
               alt={img} 
               style={{width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '10px'}} 
               onError={(e) => e.target.style.display = 'none'}
             />
             <h4 style={{textAlign: 'center', fontSize: '1rem', color: 'var(--text-secondary)'}}>
               {img.replace('.png', '').replace(/_/g, ' ')}
             </h4>
          </div>
        ))}
        {images.length === 0 && <p>No visualizations matched securely in the backend.</p>}
      </div>
    </div>
  );
};
export default EDAGallery;
