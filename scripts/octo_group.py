import pandas as pd
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
file_path = os.path.join(project_root, "data", "nyt-metadata_cleaned.csv")

print(f"Looking for file at: {file_path}")
print(f"File exists: {os.path.exists(file_path)}")

print("\nLoading CSV file...")
df = pd.read_csv(file_path)
print(f"Successfully loaded CSV with {len(df):,} rows and {len(df.columns)} columns")
print("Columns:", ", ".join(df.columns))

part_size = len(df) // 8
print(f"\nTotal rows: {len(df):,}")
print(f"Part size: {part_size:,} rows")

print("\nStarting to split and save parts...")
for i in range(8):
    start_idx = i * part_size
    end_idx = start_idx + part_size if i < 7 else len(df)

    print(f"\nProcessing part {i+1}/8...")
    df_part = df.iloc[start_idx:end_idx]
    output_file = f"dataset_part{i+1}.csv"

    print(f"Saving to {output_file}...")
    df_part.to_csv(output_file, index=False)

    if os.path.exists(output_file):
        file_size = os.path.getsize(output_file)
        print(f"✓ Successfully saved part {i+1}")
        print(f"  - Rows: {start_idx:,} to {end_idx:,} ({len(df_part):,} rows)")
        print(f"  - File size: {file_size / (1024*1024):.2f} MB")
    else:
        print(f"✗ Error: Failed to save part {i+1}")

print("\nProcess completed!")
