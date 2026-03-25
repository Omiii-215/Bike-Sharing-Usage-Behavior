# 🚲 Bike Sharing Usage Behavior Analysis

> **Analyzing bike-sharing rental patterns to optimize urban mobility through data-driven insights.**

---

## Project Overview

This project analyzes bike-sharing usage patterns from Washington D.C.'s Capital Bikeshare system (2011–2012) to understand how temporal factors (hour, day, season) and environmental conditions (temperature, humidity, weather) affect rental behavior across different user segments (casual vs. registered).

### Objectives
- Understand hourly, daily, and seasonal rental trends
- Quantify weather impact on bike-sharing demand
- Compare casual vs. registered user behavior patterns
- Deliver actionable insights for operational optimization

---

## Stakeholders

| Role | Responsibility |
|------|---------------|
| **City Mobility Team** | Strategic planning, infrastructure decisions |
| **Operations Team** | Bike redistribution, maintenance scheduling, staffing |
| **Researchers** | Lavanya Yadawad, Om S Habib |

---

## Problem Statement

Bike-sharing systems generate massive amounts of data, but the challenge lies in extracting actionable insights regarding the impact of environmental (weather) and temporal (time/season) factors on different user segments. This project provides data-driven insights to optimize bike availability and operational efficiency.

---

## Analytical Questions

1. How do hourly and daily rental patterns change across the dataset?
2. To what extent do weather conditions (temperature, humidity, wind speed) impact total rentals?
3. How does casual user behavior compare to registered subscribers (peak hours, seasonal variance)?
4. What are the peak usage hours, and how do they shift between weekdays and weekends?
5. Are there identifiable seasonal trends or demand spikes?

---

## Tech Stack

| Category | Tools |
|----------|-------|
| **Analysis** | Python (Pandas, NumPy, Matplotlib, Seaborn, SciPy) |
| **Notebooks** | Jupyter Notebook |
| **Dashboard** | Power BI / Tableau |
| **Version Control** | Git + GitHub |

---

## Project Structure

```
Bike-Sharing-Usage-Behavior/
├── Dataset/
│   ├── day.csv                      # Daily aggregated bike rentals (731 records)
│   ├── hour.csv                     # Hourly aggregated bike rentals (17,379 records)
│   └── Readme.txt                   # Original UCI dataset description
├── Diagrams/
│   ├── Consumer Flow Diagram.png    # Stakeholder-to-optimization flow
│   ├── Data Flow Diagram.png        # Data pipeline visualization
│   ├── HLD - HIgh level Diagram.png # High-level architecture
│   └── LLD - Final.png             # Low-level module design
└── README.md                       # This file
```

---

## Dataset

- **Source**: [UCI Machine Learning Repository — Bike Sharing Dataset](https://archive.ics.uci.edu/ml/datasets/Bike+Sharing+Dataset)
- **Original Author**: Hadi Fanaee-T, LIAAD / INESC Porto, University of Porto
- **System**: Capital Bikeshare, Washington D.C., USA
- **Period**: January 2011 – December 2012

| File | Granularity | Records | Columns | Size |
|------|-------------|---------|---------|------|
| `day.csv` | Daily | 731 rows | 16 | ~57 KB |
| `hour.csv` | Hourly | 17,379 rows | 17 (includes `hr`) | ~1.1 MB |

---

## Data Dictionary

### Identifiers & Date
| Variable | Type | Description |
|----------|------|-------------|
| `instant` | Integer | Record index (auto-increment) |
| `dteday` | Date | Date of observation (YYYY-MM-DD) |

### Temporal Features
| Variable | Type | Values | Description |
|----------|------|--------|-------------|
| `season` | Categorical | 1=Spring, 2=Summer, 3=Fall, 4=Winter | Season of the year |
| `yr` | Binary | 0=2011, 1=2012 | Year |
| `mnth` | Integer | 1–12 | Month |
| `hr`* | Integer | 0–23 | Hour of the day (**hour.csv only**) |
| `holiday` | Binary | 0/1 | Whether it is a public holiday |
| `weekday` | Integer | 0–6 | Day of the week (0=Sunday) |
| `workingday` | Binary | 0/1 | 1 if neither weekend nor holiday |

### Weather Features (Normalized)
| Variable | Type | Range | Description |
|----------|------|-------|-------------|
| `weathersit` | Categorical | 1–4 | Weather situation (see codes below) |
| `temp` | Float | 0–1 | Normalized temperature (actual / 41°C) |
| `atemp` | Float | 0–1 | Normalized feeling temperature (actual / 50°C) |
| `hum` | Float | 0–1 | Normalized humidity (actual / 100%) |
| `windspeed` | Float | 0–1 | Normalized wind speed (actual / 67 km/h) |

### Target Variables
| Variable | Type | Description |
|----------|------|-------------|
| `casual` | Integer | Count of casual (walk-up) users |
| `registered` | Integer | Count of registered subscribers |
| `cnt` | Integer | Total rental count (`casual + registered`) |

### Weather Situation Codes

| Code | Category | Description |
|------|----------|-------------|
| 1 | **Clear** | Clear, Few clouds, Partly cloudy |
| 2 | **Mist** | Mist + Cloudy, Mist + Broken clouds |
| 3 | **Light Precip** | Light Snow, Light Rain + Thunderstorm |
| 4 | **Heavy Precip** | Heavy Rain + Ice Pallets + Snow + Fog |

### De-normalization Formulas

| Field | Formula | Unit |
|-------|---------|------|
| `temp` | value × 41 | °C |
| `atemp` | value × 50 | °C |
| `hum` | value × 100 | % |
| `windspeed` | value × 67 | km/h |

---

## Dataset Understanding

### Key Observations

- **Growth Year-over-Year**: 2012 rentals are substantially higher than 2011 across all months
- **Strong Seasonality**: Fall & Summer show highest usage; Spring is lowest
- **Registered Dominance**: Registered users account for ~81% of all rides; casual ~19%
- **Weather Sensitivity**: `weathersit=4` (heavy rain/snow) virtually kills demand (e.g., Oct 29, 2012: cnt=22)
- **Holiday Dip**: Rental counts generally dip on holidays, especially for registered commuters
- **Temperature Correlation**: Strong positive correlation between `temp`/`atemp` and `cnt`
- **Humidity Inverse**: Higher humidity generally correlates with lower ridership

### Weekday vs Weekend Patterns
- **Weekdays** (workingday=1): Dominated by registered users (commute pattern)
- **Weekends** (workingday=0): Casual user share increases significantly (leisure pattern)

### Hourly Patterns (hour.csv)
- **Morning Rush**: 7–9 AM (registered-heavy, commute)
- **Evening Rush**: 5–7 PM (registered-heavy, commute)
- **Midday on Weekends**: 10 AM–4 PM (casual-heavy, recreation)
- **Bimodal commute peaks** on workdays; **unimodal wide midday peak** on weekends
- `hr=17` (5 PM) consistently has the highest average `cnt`

### Numerical Summary (day.csv)

| Statistic | temp | atemp | hum | windspeed | casual | registered | cnt |
|-----------|------|-------|-----|-----------|--------|------------|-----|
| Min | 0.059 | 0.079 | 0.0 | 0.022 | 2 | 20 | 22 |
| Max | 0.862 | 0.841 | 0.973 | 0.507 | 3,410 | 6,946 | 8,714 |
| Mean | ~0.496 | ~0.474 | ~0.628 | ~0.190 | ~848 | ~3,656 | ~4,504 |

---

## Known Caveats & Data Quality

### Null & Missing Values
- **No null values** in either CSV
- Some hours (typically 3–5 AM) are absent from `hour.csv` — likely had zero rentals and were dropped

### Outliers & Anomalies

| Record | Date | Issue | Likely Cause |
|--------|------|-------|--------------|
| day.csv row 668 | 2012-10-29 | `cnt = 22` | **Hurricane Sandy** |
| day.csv row 669 | 2012-10-30 | `cnt = 1096` | Post-hurricane recovery |
| day.csv row 70 | 2011-03-10 | `hum = 0.0` | Sensor error |

### Encoding Notes
- Season `1` labeled "springer" (sic) in original — means **Spring**
- Weekday `0` = Sunday (differs from Python's `datetime.weekday()` where 0 = Monday)
- `weathersit = 4` rare in hourly, effectively absent from daily aggregation
- Year `0/1` instead of `2011/2012` — needs mapping

### Temporal Notes
- DST transitions not explicitly handled
- Feb 29, 2012 included (leap year)
- 2012 has systematically higher counts (system growth), which should be accounted for in models

### Data Integrity ✅
- `cnt == casual + registered` — 100% pass on all rows
- Unique `instant` values — no duplicates
- 731 consecutive days — no gaps
- Column count matches documentation (day=16, hour=17)

---
