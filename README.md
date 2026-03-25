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

