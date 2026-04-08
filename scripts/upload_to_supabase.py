import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Supabase credentials not found in environment variables. Check your .env file.")

supabase: Client = create_client(url, key)

def upload_data():
    print("Starting data upload to Supabase...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, 'Dataset', 'cleaned_hour.csv')
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Data file not found: {csv_path}")

    print(f"Reading local dataset: {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Handle NaN values for appropriate JSON serialization into PostgreSQL
    df = df.replace({float('nan'): None})
    
    records = df.to_dict(orient='records')
    
    batch_size = 1000
    total_records = len(records)
    print(f"Total records to safely upload: {total_records}")
    
    for i in range(0, total_records, batch_size):
        batch = records[i:i + batch_size]
        print(f"Uploading batch {i} to {i + len(batch)}...")
        try:
            # Assumes table 'bike_sharing_data' is initialized in Supabase
            response = supabase.table('bike_sharing_data').insert(batch).execute()
        except Exception as e:
            print(f"Error uploading batch at index {i}: {e}")
            print("Ensure that the 'bike_sharing_data' table exists in your Supabase project using the provided SQL schema.")
            return

    print("\n✅ Secure Upload Complete! Your dataset is now hosted on your Supabase backend.")

if __name__ == "__main__":
    upload_data()
