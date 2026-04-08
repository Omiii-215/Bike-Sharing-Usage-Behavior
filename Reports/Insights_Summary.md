# Bike Sharing Usage Insights & Impact Summary

> **Note**: This report was generated dynamically using data queried directly from the **Supabase PostgreSQL backend**.

## 1. Capacity Planning (Infrastructure Scaling)
To prevent station exhaustion, massive operations rebalancing MUST occur before the absolute peak hours. The top 5 busiest hours of the day (average total riders) are:
```text
hr
17    461.452055
18    425.510989
8     359.011004
16    311.983562
19    311.523352
```
*Action*: Rebalance bikes extensively at 17:00 (5 PM) and 18:00 (6 PM) to handle the absolute peak commute surges.

## 2. Targeted Marketing (Casual Conversions)
Casual riders represent the largest revenue growth opportunity via subscription conversions. Their highest average usage by weekday (0=Sunday, 6=Saturday) is:
```text
weekday
6    61.246815
0    56.163469
5    31.458786
1    28.553449
4    24.872521
2    23.580514
3    23.159192
```
*Action*: Launch heavy promotional subscription discounts specifically heavily targeted on **Weekends (Saturday/Sunday)**, when Casual utility is overwhelmingly at its highest.

## 3. Operations Resiliency (Weather Disruptions)
System utility severely degrades predictably based on terminal weather conditions. Average hourly ridership across Weather categories (1=Clear, 4=Heavy Rain/Snow):
```text
weathersit
1    204.869272
2    175.165493
3    111.579281
4     74.333333
```
*Action*: Weather Situation '4' causes complete system paralysis (averaging only 74 riders). Dispatch teams should halt standard maintenance operations and pivot to extreme weather preservation of the bike fleet.
