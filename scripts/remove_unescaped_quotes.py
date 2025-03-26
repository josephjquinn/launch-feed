import pandas as pd


def check_csv_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        end_line = min(len(lines), 13774 + 5)

        print(f"\nChecking lines {start_line + 1} to {end_line + 1}:")
        for i in range(start_line, end_line):
            print(f"\nLine {i + 1}:")
            print(lines[i].strip())

        return True
    except Exception as e:
        print(f"Error reading {file_path}:")
        print(str(e))
        return False


def clean_csv_file(file_path):
    try:
        df = pd.read_csv(file_path)

        output_file = file_path.replace(".csv", "_cleaned.csv")

        df.to_csv(output_file, index=False, quoting=1)

        print(f"Successfully created cleaned file: {output_file}")
        return True
    except Exception as e:
        print(f"Error processing {file_path}:")
        print(str(e))
        return False


def main():
    file_path = "../data/nyt-metadata.csv"
    print(f"\nChecking {file_path}...")
    check_csv_file(file_path)

    print(f"\nProcessing {file_path}...")
    clean_csv_file(file_path)


if __name__ == "__main__":
    main()
