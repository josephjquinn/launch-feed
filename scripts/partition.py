import dask.dataframe as dd

input_csv = "../../../Downloads/data/nyt-metadata.csv"
output_dir = "../../../Downloads/data/v2"
chunk_size = 900e6

def split_csv_to_parquet(input_csv, output_dir, chunk_size):
    dtype_dict = {
        "article_id": "object",  
        "headline": "object",  
        "abstract": "object",  
        "section_name": "object",  
        "subsection_name": "object",  
        "byline": "object",  
        "document_type": "object",  
        "type_of_material": "object",  
        "pub_date": "object",  
        "word_count": "float64",  
        "print_page": "object",  
        "print_section": "object",  
        "print_column": "object",  
        "source": "object",  
        "keywords": "object",  
        "web_url": "object",  
        "uri": "object",  
        "news_desk": "object",  
        "print_headline": "object",  
        "lead_paragraph": "object",  
    }

    dask_df = dd.read_csv(input_csv, blocksize=chunk_size, dtype=dtype_dict)

    dask_df.to_parquet(output_dir, engine="pyarrow", compression="snappy")
    print(f"CSV file has been split and saved to Parquet files in {output_dir}")


if __name__ == "__main__":
    split_csv_to_parquet(input_csv, output_dir, chunk_size)
