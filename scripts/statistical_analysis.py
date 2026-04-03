import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import os
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class StatisticalAnalyzer:
    """
    Performs rigorous statistical testing on the cleaned Bike Sharing Usage Behavior datasets.
    """

    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.dataset_dir = os.path.join(base_dir, 'Dataset')
        self.output_dir = os.path.join(base_dir, 'Reports')
        
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.df_hour: Optional[pd.DataFrame] = None
        self.df_day: Optional[pd.DataFrame] = None
        self.report_path = os.path.join(self.output_dir, 'statistical_analysis_report.txt')

    def load_cleaned_data(self):
        """Load cleaned CSV datasets."""
        logger.info("Loading cleaned datasets...")
        try:
            self.df_hour = pd.read_csv(os.path.join(self.dataset_dir, 'cleaned_hour.csv'))
            self.df_day = pd.read_csv(os.path.join(self.dataset_dir, 'cleaned_day.csv'))
            # Filter anomaly days if present
            if 'is_anomaly' in self.df_day.columns:
                self.df_day = self.df_day[self.df_day['is_anomaly'] == 0]
            logger.info("Cleaned datasets loaded successfully.")
        except FileNotFoundError as e:
            logger.error(f"Failed to load dataset: {e}. Ensure data_processing.py has been run.")
            raise

    def distribution_analysis(self) -> str:
        """Calculate skewness and kurtosis to check for normality."""
        if self.df_day is None:
            return ""
        
        logger.info("Performing Distribution Analysis...")
        results = ["=== 1. Distribution Analysis (Skewness & Kurtosis) ===\n"]
        
        columns_to_check = ['cnt', 'casual', 'registered']
        for col in columns_to_check:
            data = self.df_day[col].dropna()
            skew = stats.skew(data)
            kurtosis = stats.kurtosis(data, fisher=True) # Fisher: normal == 0.0
            
            # Shapiro-Wilk test for normality
            stat, p_val = stats.shapiro(data)
            
            results.append(f"Variable: {col}")
            results.append(f"  - Skewness: {skew:.4f} (Ideal: ~0)")
            results.append(f"  - Kurtosis: {kurtosis:.4f} (Ideal: ~0 for normal distribution)")
            results.append(f"  - Shapiro-Wilk p-value: {p_val:.4e}")
            results.append(f"  - Conclusion: {'Normal' if p_val > 0.05 else 'Non-normal'} distribution\n")
            
        return "\n".join(results)

    def correlation_analysis(self) -> str:
        """Pearson and Spearman correlation between weather and ridership."""
        if self.df_day is None:
            return ""
            
        logger.info("Performing Correlation Analysis...")
        results = ["\n=== 2. Correlation Analysis (Weather vs Rentals) ===\n"]
        
        weather_cols = ['temp_c', 'atemp_c', 'hum_pct', 'windspeed_kmh']
        target_cols = ['casual', 'registered', 'cnt']
        
        for tgt in target_cols:
            results.append(f"Target: {tgt}")
            for w_col in weather_cols:
                # Pearson (Linear relation)
                pearson_corr, p_p = stats.pearsonr(self.df_day[w_col], self.df_day[tgt])
                # Spearman (Monotonic relation - robust to non-normality)
                spearman_corr, p_s = stats.spearmanr(self.df_day[w_col], self.df_day[tgt])
                
                results.append(f"  {w_col}:")
                results.append(f"    Pearson:  {pearson_corr:.4f} (p={p_p:.4e})")
                results.append(f"    Spearman: {spearman_corr:.4f} (p={p_s:.4e})")
            results.append("")
            
        return "\n".join(results)

    def independent_t_tests(self) -> str:
        """Independent T-tests comparing working vs non-working days."""
        if self.df_day is None:
            return ""
            
        logger.info("Performing T-Tests...")
        results = ["\n=== 3. T-Tests (Working Day vs Non-Working Day) ===\n"]
        
        working = self.df_day[self.df_day['workingday'] == 1]
        non_working = self.df_day[self.df_day['workingday'] == 0]
        
        for col in ['casual', 'registered', 'cnt']:
            stat, p_val = stats.ttest_ind(working[col], non_working[col], equal_var=False) # Welch's t-test
            
            mean_w = working[col].mean()
            mean_nw = non_working[col].mean()
            
            results.append(f"Variable: {col}")
            results.append(f"  - Working Day Mean:     {mean_w:.1f}")
            results.append(f"  - Non-Working Day Mean: {mean_nw:.1f}")
            results.append(f"  - Welch t-statistic:    {stat:.4f}")
            results.append(f"  - p-value:              {p_val:.4e}")
            results.append(f"  - Significant Difference: {'Yes' if p_val < 0.05 else 'No'}\n")
            
        return "\n".join(results)

    def anova_tests(self) -> str:
        """ANOVA to test differences across seasons and weather situations."""
        if self.df_day is None:
            return ""
            
        logger.info("Performing ANOVA...")
        results = ["\n=== 4. One-Way ANOVA (Seasons & Weather) ===\n"]
        
        # 1. Seasons
        results.append("### Seasonal Differences (Target: cnt) ###")
        seasons = [self.df_day[self.df_day['season'] == s]['cnt'] for s in [1, 2, 3, 4]]
        f_stat, p_val = stats.f_oneway(*seasons)
        results.append(f"  F-statistic: {f_stat:.4f}")
        results.append(f"  p-value:     {p_val:.4e}")
        results.append(f"  Significant: {'Yes' if p_val < 0.05 else 'No'}\n")
        
        # 2. Weather Situation
        results.append("### Weather Situation Differences (Target: cnt) ###")
        # Ensure we only test weather situations that exist in the day data
        weather_sits = self.df_day['weathersit'].unique()
        weather_groups = [self.df_day[self.df_day['weathersit'] == w]['cnt'] for w in sorted(weather_sits)]
        
        if len(weather_groups) > 1:
            f_stat, p_val = stats.f_oneway(*weather_groups)
            results.append(f"  F-statistic: {f_stat:.4f}")
            results.append(f"  p-value:     {p_val:.4e}")
            results.append(f"  Significant: {'Yes' if p_val < 0.05 else 'No'}\n")
        else:
            results.append("  Not enough weather categories to perform ANOVA.\n")
            
        return "\n".join(results)

    def generate_visualizations(self):
        """Generate statistical visualizations (histograms, boxplots, correlation heatmaps)."""
        if self.df_day is None:
            return
            
        logger.info("Generating statistical visualizations...")
        self.vis_dir = os.path.join(self.output_dir, 'Visualizations')
        os.makedirs(self.vis_dir, exist_ok=True)
        sns.set_theme(style="whitegrid")
        
        # 1. Rental Distribution (Histogram with normal curve)
        plt.figure(figsize=(10, 6))
        sns.histplot(self.df_day['cnt'], bins=30, kde=True, color='purple', stat='density')
        # Overlay normal curve
        mu, std = stats.norm.fit(self.df_day['cnt'])
        xmin, xmax = plt.xlim()
        x = np.linspace(xmin, xmax, 100)
        p = stats.norm.pdf(x, mu, std)
        plt.plot(x, p, 'k', linewidth=2, label=f'Normal Fit ($\\mu={mu:.0f}, \\sigma={std:.0f}$)')
        plt.title('Distribution of Total Daily Rentals (cnt)')
        plt.legend()
        plt.savefig(os.path.join(self.vis_dir, 'rental_distribution.png'), bbox_inches='tight')
        plt.close()

        # 2. Outlier Detection (Box plot by season)
        plt.figure(figsize=(10, 6))
        season_map = {1: 'Spring', 2: 'Summer', 3: 'Fall', 4: 'Winter'}
        df_plot = self.df_day.copy()
        df_plot['season_lbl'] = df_plot['season'].map(season_map)
        sns.boxplot(data=df_plot, x='season_lbl', y='cnt', palette='Set2')
        plt.title('Outlier Detection: Total Rentals by Season')
        plt.savefig(os.path.join(self.vis_dir, 'outliers_by_season.png'), bbox_inches='tight')
        plt.close()

        # 3. Correlation Matrix Heatmap
        plt.figure(figsize=(8, 6))
        cols = ['temp_c', 'atemp_c', 'hum_pct', 'windspeed_kmh', 'cnt']
        corr = self.df_day[cols].corr()
        sns.heatmap(corr, annot=True, cmap='coolwarm', vmin=-1, vmax=1, fmt='.2f', square=True)
        plt.title('Correlation Matrix: Weather & Rentals')
        plt.savefig(os.path.join(self.vis_dir, 'correlation_matrix.png'), bbox_inches='tight')
        plt.close()
        
        logger.info(f"Visualizations saved to {self.vis_dir}")

    def run_analysis(self):
        """Run all statistical tests and save to a report."""
        self.load_cleaned_data()
        
        report_content = []
        report_content.append("BIKE SHARING STATISTICAL ANALYSIS REPORT\n")
        report_content.append("=" * 40 + "\n\n")
        
        report_content.append(self.distribution_analysis())
        report_content.append(self.correlation_analysis())
        report_content.append(self.independent_t_tests())
        report_content.append(self.anova_tests())
        
        self.generate_visualizations()
        
        full_report = "".join(report_content)
        
        with open(self.report_path, 'w') as f:
            f.write(full_report)
            
        logger.info(f"Analysis complete. Report saved to {self.report_path}")
        print(f"\nStatistical analysis finished successfully! Report generated at:\n{self.report_path}")

if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    analyzer = StatisticalAnalyzer(base_dir=project_root)
    analyzer.run_analysis()
