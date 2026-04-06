import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import joblib

def load_data(filepath):
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    return df

def train_demand_prediction(df):
    print("\n--- Model 1: Demand Prediction (Random Forest) ---")
    features = ['hr', 'season', 'weathersit', 'temp_c', 'workingday']
    target = 'cnt'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"RMSE: {rmse:.2f}")
    print(f"R2 Score: {r2:.4f}")
    return model

def train_user_type_classifier(df):
    print("\n--- Model 2: User Type Classifier (Logistic Regression) ---")
    # Target: 1 if Casual > Registered, else 0 (Registered Dominant)
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
    print("\n--- Model 3: Anomaly Detection (IsolationForest) ---")
    features = ['cnt']
    X = df[features]
    
    print("Training Isolation Forest...")
    # contamination=0.01 means we expect ~1% of data to be anomalies
    model = IsolationForest(contamination=0.01, random_state=42)
    model.fit(X)
    
    # Predict (-1 for anomaly, 1 for normal)
    df['anomaly'] = model.predict(X)
    
    n_anomalies = (df['anomaly'] == -1).sum()
    pct_anomalies = (n_anomalies / len(df)) * 100
    
    print(f"Detected {n_anomalies} anomalies ({pct_anomalies:.2f}% of data).")
    
    print("Sample anomalies (hourly counts):")
    anomalies_sample = df[df['anomaly'] == -1][['dteday', 'hr', 'cnt', 'weathersit']].head()
    print(anomalies_sample.to_string(index=False))
    
    return model

def main():
    # Setup paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'Dataset', 'cleaned_hour.csv')
    
    df = load_data(data_path)
    
    # Train models
    rf_model = train_demand_prediction(df)
    lr_model = train_user_type_classifier(df)
    iso_model = train_anomaly_detection(df)
    
    # Save models
    models_dir = os.path.join(base_dir, 'Models')
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"\nSaving models to {models_dir}...")
    joblib.dump(rf_model, os.path.join(models_dir, 'rf_demand_model.pkl'))
    joblib.dump(lr_model, os.path.join(models_dir, 'lr_user_type_model.pkl'))
    joblib.dump(iso_model, os.path.join(models_dir, 'iso_anomaly_model.pkl'))
    print("Done!")

if __name__ == "__main__":
    main()
