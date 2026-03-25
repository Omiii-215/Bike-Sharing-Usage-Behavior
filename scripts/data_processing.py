import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BikeSharingProcessor:
    """
    Consolidated data processing and EDA for the Bike Sharing Usage Behavior project.
    Handles data cleaning, feature engineering, and baseline visualization.
    """

    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.dataset_dir = os.path.join(base_dir, 'Dataset')
        self.output_dir = os.path.join(base_dir, 'Reports', 'Visualizations')
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.df_hour: Optional[pd.DataFrame] = None
        self.df_day: Optional[pd.DataFrame] = None

        # Configuration Constants
        self.SEASON_MAP = {1: 'Spring', 2: 'Summer', 3: 'Fall', 4: 'Winter'}
        self.WEATHER_MAP = {1: 'Clear', 2: 'Mist', 3: 'Light Precip', 4: 'Heavy Precip'}

    def load_data(self):
        """Load raw CSV datasets from the Dataset directory."""
        logger.info("Loading datasets...")
        try:
            self.df_hour = pd.read_csv(os.path.join(self.dataset_dir, 'hour.csv'))
            self.df_day = pd.read_csv(os.path.join(self.dataset_dir, 'day.csv'))
            logger.info("Datasets loaded successfully.")
        except FileNotFoundError as e:
            logger.error(f"Failed to load dataset: {e}")
            raise

    def clean_data(self):
        """Apply data cleaning strategies including de-normalization and anomaly flagging."""
        if self.df_hour is None or self.df_day is None:
            logger.error("DataFrames not loaded. Call load_data() first.")
            return

        # Explicitly narrow type for analyzer
        df_hour: pd.DataFrame = self.df_hour
        df_day: pd.DataFrame = self.df_day

        logger.info("Cleaning and pre-processing data...")
        
        # 1. Convert dates
        df_hour['dteday'] = pd.to_datetime(df_hour['dteday'])
        df_day['dteday'] = pd.to_datetime(df_day['dteday'])

        # 2. Flag Hurricane Sandy Anomaly (Oct 29-31, 2012)
        sandy_mask = (df_day['dteday'] >= '2012-10-29') & (df_day['dteday'] <= '2012-10-31')
        df_day['is_anomaly'] = sandy_mask.astype(int)

        # 3. De-normalization of weather/env variables
        for df in [df_day, df_hour]:
            df['temp_c'] = df['temp'] * 41
            df['atemp_c'] = df['atemp'] * 50
            df['hum_pct'] = df['hum'] * 100
            df['windspeed_kmh'] = df['windspeed'] * 67
            
            # Map categorical labels
            df['season_lbl'] = df['season'].map(self.SEASON_MAP)
            df['weather_lbl'] = df['weathersit'].map(self.WEATHER_MAP)

    def engineer_features(self):
        """Apply feature engineering for temporal segments and user metrics."""
        if self.df_hour is None or self.df_day is None:
            logger.error("DataFrames not loaded. Call load_data() first.")
            return
            
        df_hour: pd.DataFrame = self.df_hour
        df_day: pd.DataFrame = self.df_day

        logger.info("Executing feature engineering blueprint...")
        
        # 1. Day Segments (Hourly only)
        def _get_segment(hr: int) -> str:
            if 0 <= hr < 6: return 'Night'
            if 6 <= hr < 12: return 'Morning'
            if 12 <= hr < 18: return 'Afternoon'
            return 'Evening'

        df_hour['day_segment'] = df_hour['hr'].apply(_get_segment)

        # 2. Peak Hour Flag (Commute peaks on workdays)
        df_hour['is_peak_hour'] = df_hour.apply(
            lambda x: 1 if (x['workingday'] == 1 and (7 <= x['hr'] <= 9 or 17 <= x['hr'] <= 19)) else 0, 
            axis=1
        )

        # 3. User Type Shares
        for df in [df_day, df_hour]:
            df['casual_share'] = (df['casual'] / df['cnt']) * 100
            df['registered_share'] = (df['registered'] / df['cnt']) * 100

    def generate_eda(self):
        """Generate and save baseline visualizations to the Reports directory."""
        if self.df_hour is None or self.df_day is None:
            logger.error("DataFrames not loaded. Call load_data() first.")
            return

        df_hour: pd.DataFrame = self.df_hour
        df_day: pd.DataFrame = self.df_day

        logger.info("Generating EDA visualizations...")
        sns.set_theme(style="whitegrid")

        # Visual 1: Daily Total Trend
        plt.figure(figsize=(12, 6))
        sns.lineplot(data=df_day, x='dteday', y='cnt', color='teal')
        plt.title('Daily Total Bike Rentals (2011-2012)')
        plt.xticks(rotation=45)
        plt.savefig(os.path.join(self.output_dir, 'daily_trend.png'), bbox_inches='tight')
        plt.close()

        # Visual 2: Hourly Patterns
        plt.figure(figsize=(12, 6))
        sns.pointplot(data=df_hour, x='hr', y='cnt', hue='workingday', palette='viridis')
        plt.title('Average Hourly Rentals: Workday vs Weekend/Holiday')
        plt.savefig(os.path.join(self.output_dir, 'hourly_pattern.png'), bbox_inches='tight')
        plt.close()

        # Visual 3: Weather/Temp Impact
        plt.figure(figsize=(10, 6))
        sns.scatterplot(data=df_day, x='temp_c', y='cnt', hue='weather_lbl', palette='coolwarm')
        plt.title('Environmental Impact on Rental Counts')
        plt.savefig(os.path.join(self.output_dir, 'weather_impact.png'), bbox_inches='tight')
        plt.close()

        # Visual 4: Seasonal Distribution
        df_seasonal = df_day.groupby('season_lbl')[['casual', 'registered']].sum().reset_index()
        df_seasonal = df_seasonal.melt(id_vars='season_lbl', var_name='User Type', value_name='Total Rentals')
        plt.figure(figsize=(10, 6))
        sns.barplot(data=df_seasonal, x='season_lbl', y='Total Rentals', hue='User Type', palette='muted')
        plt.title('Seasonal User Segmentation')
        plt.savefig(os.path.join(self.output_dir, 'seasonal_distribution.png'), bbox_inches='tight')
        plt.close()

    def save_results(self):
        """Save cleaned datasets to CSV files."""
        if self.df_hour is None or self.df_day is None:
            logger.error("DataFrames not loaded. Call load_data() first.")
            return

        logger.info("Saving cleaned datasets...")
        self.df_day.to_csv(os.path.join(self.dataset_dir, 'cleaned_day.csv'), index=False)
        self.df_hour.to_csv(os.path.join(self.dataset_dir, 'cleaned_hour.csv'), index=False)
        logger.info("Data export complete.")

    def run_pipeline(self):
        """Execute the full processing pipeline."""
        self.load_data()
        self.clean_data()
        self.engineer_features()
        self.generate_eda()
        self.save_results()
        
        # Summary Report
        if self.df_hour is not None and self.df_day is not None:
            df_hour: pd.DataFrame = self.df_hour
            df_day: pd.DataFrame = self.df_day
            print("\nDATA QUALITY REPORT SUMMARY")
            print("=" * 30)
            print(f"Total Daily Records        : {len(df_day)}")
            print(f"Total Hourly Records       : {len(df_hour)}")
            print(f"Anomalous Days (Sandy)     : {df_day['is_anomaly'].sum()}")
            print(f"Null Values Detected       : {df_hour.isnull().sum().sum()}")
            print(f"Duplicate Rows Detected    : {df_hour.duplicated().sum()}")
            print("=" * 30)
            logger.info("Processing pipeline executed successfully.")
        else:
            logger.error("Pipeline failed: DataFrames are missing.")

if __name__ == "__main__":
    # Define project root (one level up from scripts directory)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    processor = BikeSharingProcessor(base_dir=project_root)
    processor.run_pipeline()
