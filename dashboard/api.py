from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="Bike Sharing ML Predictive API")

# Setup CORS to allow Vite React UI to freely hit the python backend locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safely resolve absolute path exactly pointing back to the parent `Models/` directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rf_model_path = os.path.join(base_dir, 'Models', 'rf_demand_model.pkl')
lr_model_path = os.path.join(base_dir, 'Models', 'lr_user_type_model.pkl')

print(f"Loading Demand Model: {rf_model_path}")
rf_model = joblib.load(rf_model_path)

print(f"Loading User Type Model: {lr_model_path}")
lr_model = joblib.load(lr_model_path)

from fastapi.staticfiles import StaticFiles

viz_path = os.path.join(base_dir, 'Reports', 'Visualizations')
app.mount("/static", StaticFiles(directory=viz_path), name="static")

@app.get("/api/images")
def get_images():
    if not os.path.exists(viz_path):
        return {"images": []}
    images = [img for img in os.listdir(viz_path) if img.endswith('.png')]
    return {"images": images}

class DemandRequest(BaseModel):
    hr: int
    season: int
    weathersit: int
    temp_c: float
    workingday: int

class UserTypeRequest(BaseModel):
    hr: int
    season: int
    weathersit: int
    holiday: int

@app.post("/predict/demand")
def predict_demand(req: DemandRequest):
    df = pd.DataFrame([req.model_dump()])
    prediction = rf_model.predict(df)[0]
    return {"predicted_demand": max(0, round(prediction))}

@app.post("/predict/usertype")
def predict_user_type(req: UserTypeRequest):
    df = pd.DataFrame([req.model_dump()])
    # Model returns 1 if Casual > Registered, else 0 (Registered Dominant)
    prediction = lr_model.predict(df)[0]
    dominant = "Casual" if prediction == 1 else "Registered"
    return {"dominant_user_type": dominant}

@app.get("/")
def health():
    return {"status": "healthy", "message": "ML FastAPI Backend is Operational."}
