import React, { useState } from "react";
import { Search, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLoadingState } from "@/components/articles/ArticleLoadingState";
import { ArticleErrorState } from "@/components/articles/ArticleErrorState";

interface NewsArticle {
  title: string;
  description: string;
  author: string | null;
  publishedAt: string;
  url: string;
  urlToImage: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string;
    description: string | null;
    author: string | null;
    publishedAt: string;
    url: string;
    urlToImage: string | null;
  }>;
  message?: string;
}

const NewsSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchArticles = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          query
        )}&language=en&sortBy=publishedAt&apiKey=${
          import.meta.env.VITE_NEWS_API_KEY
        }`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = (await response.json()) as NewsApiResponse;

      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch articles");
      }

      const formattedArticles = data.articles.map((article) => ({
        title: article.title,
        description: article.description || "No description available",
        author: article.author,
        publishedAt: new Date(article.publishedAt).toLocaleDateString(),
        url: article.url,
        urlToImage: article.urlToImage,
      }));

      setArticles(formattedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchArticles();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">News Search</h1>
                <p className="text-sm text-muted-foreground">
                  Search for news articles on any topic
                </p>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your search topic..."
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <ArticleLoadingState key={i} />
                ))}
              </div>
            ) : error ? (
              <ArticleErrorState message={error} />
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article, index) => (
                  <ArticleCard
                    key={index}
                    headline={article.title}
                    abstract={article.description}
                    byline={article.author || "Unknown Author"}
                    pubDate={article.publishedAt}
                    webUrl={article.url}
                  />
                ))}
              </div>
            ) : query ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-muted-foreground">
                    No articles found for your search. Try a different topic.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsSearch;
