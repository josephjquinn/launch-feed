import dask.dataframe as dd


def split_csv_to_parquet(input_csv, output_dir, chunk_size):
    # Define column types for NYT metadata
    dtype_dict = {
        "article_id": "object",  # string
        "headline": "object",  # string
        "abstract": "object",  # string
        "section_name": "object",  # string
        "subsection_name": "object",  # string
        "byline": "object",  # string
        "document_type": "object",  # string
        "type_of_material": "object",  # string
        "pub_date": "object",  # string (will be parsed as datetime later if needed)
        "word_count": "float64",  # float (some values might be NaN)
        "print_page": "object",  # string (can contain non-numeric values)
        "print_section": "object",  # string
        "print_column": "object",  # string
        "source": "object",  # string
        "keywords": "object",  # string
        "web_url": "object",  # string
        "uri": "object",  # string
        "news_desk": "object",  # string
        "print_headline": "object",  # string
        "lead_paragraph": "object",  # string
    }

    # Read large CSV file with explicit dtypes
    dask_df = dd.read_csv(input_csv, blocksize=chunk_size, dtype=dtype_dict)

    # Save Dask DF to output dir
    dask_df.to_parquet(output_dir, engine="pyarrow", compression="snappy")
    print(f"CSV file has been split and saved to Parquet files in {output_dir}")


if __name__ == "__main__":
    input_csv = "../../../Downloads/data/nyt-metadata.csv"  # Path to CSV in Downloads
    output_dir = "../../../Downloads/data/v2"  # Output directory in Downloads
    chunk_size = 900e6

    split_csv_to_parquet(input_csv, output_dir, chunk_size)
