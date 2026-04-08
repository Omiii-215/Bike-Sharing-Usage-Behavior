-- Execute this entire query in your Supabase SQL Editor to rapidly prepare your table for the ML uploads

CREATE TABLE IF NOT EXISTS bike_sharing_data (
    instant SERIAL PRIMARY KEY,
    dteday DATE,
    season INTEGER,
    yr INTEGER,
    mnth INTEGER,
    hr INTEGER,
    holiday INTEGER,
    weekday INTEGER,
    workingday INTEGER,
    weathersit INTEGER,
    temp FLOAT,
    atemp FLOAT,
    hum FLOAT,
    windspeed FLOAT,
    casual INTEGER,
    registered INTEGER,
    cnt INTEGER,
    temp_c FLOAT,
    atemp_c FLOAT,
    hum_pct FLOAT,
    windspeed_kmh FLOAT,
    season_lbl TEXT,
    weather_lbl TEXT,
    day_segment TEXT,
    is_peak_hour INTEGER,
    casual_share FLOAT,
    registered_share FLOAT
);

-- Note: Ensure RLS policies are appropriately scoped (or disabled) if you plan on querying without authenticated sessions.
