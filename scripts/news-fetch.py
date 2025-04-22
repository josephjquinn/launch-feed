import os
from pathlib import Path
from dotenv import load_dotenv
from newsapi import NewsApiClient

SCRIPT_DIR = Path(__file__).resolve().parent

load_dotenv(SCRIPT_DIR / '.env')

api_key = os.getenv('NEWS_API_KEY')
if not api_key:
    raise ValueError("NEWS_API_KEY environment variable is not set")

newsapi = NewsApiClient(api_key=api_key)


top_headlines = newsapi.get_top_headlines(
    language="en",
)

all_articles = newsapi.get_everything(
    q="bitcoin",
    domains="bbc.co.uk,techcrunch.com",
    language="en",
    sort_by="relevancy",
    page=2,
)

sources = newsapi.get_sources()
print(top_headlines)
