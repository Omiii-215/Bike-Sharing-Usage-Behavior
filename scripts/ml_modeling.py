import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import joblib

# ==============================================================================
# FILE: ml_modeling.py (Machine Learning Training Pipeline)
# Purpose: This script is responsible for loading the historical bike sharing data, 
# training three different Machine Learning models, and saving them to disk.
# Models trained:
# 1. Random Forest Regressor (Predicts total bike demand)
# 2. Logistic Regression (Classifies dominant user type: Casual vs Registered)
# 3. Isolation Forest (Detects anomalous/unusual days)
# How it connects: The trained models are saved into the 'Models' directory as 
# '.pkl' files. These exact files are later loaded by `dashboard/api.py` to 
# make real-time predictions for the dashboard.
# ==============================================================================

def load_data(filepath):
    # Data loader function. Attempts to fetch data directly from Supabase via pgvector endpoints.
    # Fallback mechanism loads a local static CSV if the database connection fails.
    from supabase import create_client, Client
    from dotenv import load_dotenv
    
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if url and key:
        print("Found Supabase credentials! Querying backend database...")
        try:
            supabase: Client = create_client(url, key)
            
            all_data = []
            offset = 0
            limit = 1000
            
            print("Paginating and downloading chunks from Supabase...")
            # Pagination block: Fetch records in chunks of 1000 to prevent timeout/memory drops.
            while True:
                response = supabase.table('bike_sharing_data').select('*').range(offset, offset + limit - 1).execute()
                data = response.data
                if not data:
                    break
                all_data.extend(data)
                if len(data) < limit:
                    break
                offset += limit
            
            if all_data:
                df = pd.DataFrame(all_data)
                print(f"✅ Successfully loaded {len(df)} operational records directly from Supabase!")
                return df
            else:
                print("⚠️ Connected to Supabase, but no data was returned! Did you run `upload_to_supabase.py` first?")
                print(f"Falling back to local static file: {filepath}...\n")
        except Exception as e:
            print(f"⚠️ Failed to pull from Supabase ({e}). Ensure the table 'bike_sharing_data' is created and accessible.")
            print(f"Falling back to local static file: {filepath}...\n")
    else:
        print(f"No Supabase credentials detected. Loading statically from {filepath}...")
    
    # Fallback to local CSV load
    df = pd.read_csv(filepath)
    return df

def train_demand_prediction(df):
    # ==============================================================================
    # MODEL 1: Demand Prediction (Random Forest Regressor)
    # Uses ensemble learning (multiple decision trees) to accurately forecast total 
    # bike demand based on temporal and weather features.
    # ==============================================================================
    print("\n--- Model 1: Demand Prediction (Random Forest) ---")
    features = ['hr', 'season', 'weathersit', 'temp_c', 'workingday']
    target = 'cnt'
    
    X = df[features] # Feature variables
    y = df[target]   # Target variable
    
    # Split dataset into 80% training and 20% testing sets.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train) # Fit the model to training data
    
    # Evaluate model performance using unseen test data.
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred)) # Root Mean Squared Error
    r2 = r2_score(y_test, y_pred) # Coefficient of Determination
    
    print(f"RMSE: {rmse:.2f}")
    print(f"R2 Score: {r2:.4f}")
    return model

def train_user_type_classifier(df):
    # ==============================================================================
    # MODEL 2: User Type Classification (Logistic Regression)
    # A binary classification algorithm determining if a given scenario will be 
    # dominated by 'Casual' (1) or 'Registered' (0) users based on time and weather.
    # ==============================================================================
    print("\n--- Model 2: User Type Classifier (Logistic Regression) ---")
    
    # Create a binary target feature: 1 if casual rentals exceed registered, else 0.
    df['is_casual_dominant'] = (df['casual'] > df['registered']).astype(int)
    
    features = ['hr', 'season', 'weathersit', 'holiday']
    target = 'is_casual_dominant'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Logistic Regression...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {acc:.4f}")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Registered Dominant', 'Casual Dominant']))
    return model

def train_anomaly_detection(df):
    # ==============================================================================
    # MODEL 3: Anomaly Detection (Isolation Forest)
    # Unsupervised learning model to identify statistically anomalous data points.
    # It detects outliers based on the 'cnt' (rental count) feature.
    # ==============================================================================
    print("\n--- Model 3: Anomaly Detection (IsolationForest) ---")
    features = ['cnt']
    X = df[features]
    
    print("Training Isolation Forest...")
    # Define contamination rate (expected percentage of outliers in dataset).
    model = IsolationForest(contamination=0.01, random_state=42)
    model.fit(X)
    
    # Generate anomaly labels: -1 represents anomalies, 1 represents normal points.
    df['anomaly'] = model.predict(X)
    
    n_anomalies = (df['anomaly'] == -1).sum()
    pct_anomalies = (n_anomalies / len(df)) * 100
    
    print(f"Detected {n_anomalies} anomalies ({pct_anomalies:.2f}% of data).")
    
    print("Sample anomalies (hourly counts):")
    anomalies_sample = df[df['anomaly'] == -1][['dteday', 'hr', 'cnt', 'weathersit']].head()
    print(anomalies_sample.to_string(index=False))
    
    return model

def main():
    # Setup dynamic absolute paths to ensure execution from any directory context.
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'Dataset', 'cleaned_hour.csv')
    
    # 1. Execute data loading pipeline.
    df = load_data(data_path)
    
    # 2. Train ML models sequentially.
    rf_model = train_demand_prediction(df)
    lr_model = train_user_type_classifier(df)
    iso_model = train_anomaly_detection(df)
    
    # 3. Serialize and save models for production deployment.
    # Uses joblib to dump models into the 'Models' directory for API consumption.
    models_dir = os.path.join(base_dir, 'Models')
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"\nSaving models to {models_dir}...")
    joblib.dump(rf_model, os.path.join(models_dir, 'rf_demand_model.pkl'))
    joblib.dump(lr_model, os.path.join(models_dir, 'lr_user_type_model.pkl'))
    joblib.dump(iso_model, os.path.join(models_dir, 'iso_anomaly_model.pkl'))
    print("Done! Models are compiled and ready for the FastAPI server.")

if __name__ == "__main__":
    main()
