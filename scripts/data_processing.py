import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
from datetime import datetime

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
OUTPUT_DIR = os.path.join(BASE_DIR, 'Reports', 'Visualizations')

# ── Load Data ──────────────────────────────────────────────────────────────
print("📂 Loading datasets...")
df_hour = pd.read_csv(os.path.join(DATASET_DIR, 'hour.csv'))
df_day = pd.read_csv(os.path.join(DATASET_DIR, 'day.csv'))

# ── 1. Cleaning Strategy ──────────────────────────────────────────────────
print("🧹 Cleaning data...")

# 1.1 Handle missing hours in hour.csv (Reindexing)
df_hour['dteday'] = pd.to_datetime(df_hour['dteday'])
all_hours = pd.date_range(start=df_hour['dteday'].min(), end=df_hour['dteday'].max(), freq='H')
# Note: Simple reindexing is complex due to the features, so we'll just log the gaps for now 
# and ensure cnt=0 if we were to impute. For this EDA, we use the raw hourly distribution.

# 1.2 Flag Hurricane Sandy (Oct 29-31, 2012)
sandy_mask = (df_day['dteday'] >= '2012-10-29') & (df_day['dteday'] <= '2012-10-31')
df_day['is_anomaly'] = sandy_mask.astype(int)

# 1.3 De-normalization
df_day['temp_c'] = df_day['temp'] * 41
df_day['atemp_c'] = df_day['atemp'] * 50
df_day['hum_pct'] = df_day['hum'] * 100
df_day['windspeed_kmh'] = df_day['windspeed'] * 67

df_hour['temp_c'] = df_hour['temp'] * 41
df_hour['atemp_c'] = df_hour['atemp'] * 50
df_hour['hum_pct'] = df_hour['hum'] * 100
df_hour['windspeed_kmh'] = df_hour['windspeed'] * 67

# 1.4 Categorical Labeling (for plotting)
season_map = {1: 'Spring', 2: 'Summer', 3: 'Fall', 4: 'Winter'}
weather_map = {1: 'Clear', 2: 'Mist', 3: 'Light Precip', 4: 'Heavy Precip'}
df_day['season_lbl'] = df_day['season'].map(season_map)
df_day['weather_lbl'] = df_day['weathersit'].map(weather_map)
df_hour['season_lbl'] = df_hour['season'].map(season_map)
df_hour['weather_lbl'] = df_hour['weathersit'].map(weather_map)

# ── 2. Feature Engineering ───────────────────────────────────────────────
print("⚙️ Engineering features...")

# 2.1 Day Segment
def get_segment(hr):
    if 0 <= hr < 6: return 'Night'
    if 6 <= hr < 12: return 'Morning'
    if 12 <= hr < 18: return 'Afternoon'
    return 'Evening'

df_hour['day_segment'] = df_hour['hr'].apply(get_segment)

# 2.2 Peak Hour Flag
df_hour['is_peak_hour'] = df_hour.apply(lambda x: 1 if (x['workingday'] == 1 and (7 <= x['hr'] <= 9 or 17 <= x['hr'] <= 19)) else 0, axis=1)

# 2.3 User Shares
df_day['casual_share'] = (df_day['casual'] / df_day['cnt']) * 100
df_day['registered_share'] = (df_day['registered'] / df_day['cnt']) * 100
df_hour['casual_share'] = (df_hour['casual'] / df_hour['cnt']) * 100
df_hour['registered_share'] = (df_hour['registered'] / df_hour['cnt']) * 100

# ── 3. Baseline EDA & Visualizations ────────────────────────────────────
print("📊 Generating visualizations...")
sns.set_theme(style="whitegrid")

# 3.1 Total Rentals over Time (Trend)
plt.figure(figsize=(12, 6))
sns.lineplot(data=df_day, x='dteday', y='cnt', color='teal')
plt.title('Daily Total Bike Rentals (2011-2012)')
plt.xticks(rotation=45)
plt.savefig(os.path.join(OUTPUT_DIR, 'daily_trend.png'), bbox_inches='tight')
plt.close()

# 3.2 Hourly Patterns by Day Type
plt.figure(figsize=(12, 6))
sns.pointplot(data=df_hour, x='hr', y='cnt', hue='workingday', palette='viridis')
plt.title('Average Hourly Rentals: Workday (1) vs Weekend/Holiday (0)')
plt.savefig(os.path.join(OUTPUT_DIR, 'hourly_pattern.png'), bbox_inches='tight')
plt.close()

# 3.3 Weather Impact (Temperature vs Count)
plt.figure(figsize=(10, 6))
sns.scatterplot(data=df_day, x='temp_c', y='cnt', hue='weather_lbl', palette='coolwarm')
plt.title('Impact of Temperature and Weather Situation on Rentals')
plt.savefig(os.path.join(OUTPUT_DIR, 'weather_impact.png'), bbox_inches='tight')
plt.close()

# 3.4 Seasonal Distribution (Casual vs Registered)
df_seasonal = df_day.groupby('season_lbl')[['casual', 'registered']].sum().reset_index()
df_seasonal = df_seasonal.melt(id_vars='season_lbl', var_name='User Type', value_name='Total Rentals')

plt.figure(figsize=(10, 6))
sns.barplot(data=df_seasonal, x='season_lbl', y='Total Rentals', hue='User Type', palette='muted')
plt.title('Seasonal Distribution: Casual vs Registered Users')
plt.savefig(os.path.join(OUTPUT_DIR, 'seasonal_distribution.png'), bbox_inches='tight')
plt.close()

# ── 4. Save Cleaned Data ────────────────────────────────────────────────
print("💾 Saving cleaned datasets...")
df_day.to_csv(os.path.join(DATASET_DIR, 'cleaned_day.csv'), index=False)
df_hour.to_csv(os.path.join(DATASET_DIR, 'cleaned_hour.csv'), index=False)

# ── 5. Data Quality Report Summary ──────────────────────────────────────
print("\n📝 Data Quality Report Summary")
print("-" * 30)
print(f"Total Daily Records: {len(df_day)}")
print(f"Total Hourly Records: {len(df_hour)}")
print(f"Anomalous Days (Sandy): {df_day['is_anomaly'].sum()}")
print(f"Missing Values: {df_hour.isnull().sum().sum()}")
print(f"Duplicates: {df_hour.duplicated().sum()}")
print("-" * 30)
print("✅ Processing complete!")
