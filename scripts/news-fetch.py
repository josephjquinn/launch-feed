from newsapi import NewsApiClient

# Init
newsapi = NewsApiClient(api_key="90288d928a4941b1969d1caa1b26ab5d")


# /v2/top-headlines
top_headlines = newsapi.get_top_headlines(
    language="en",
)

# /v2/everything
all_articles = newsapi.get_everything(
    q="bitcoin",
    domains="bbc.co.uk,techcrunch.com",
    language="en",
    sort_by="relevancy",
    page=2,
)

# /v2/top-headlines/sources
sources = newsapi.get_sources()
print(top_headlines)
