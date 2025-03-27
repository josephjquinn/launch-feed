import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLoadingState } from "@/components/articles/ArticleLoadingState";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { semSearch } from "@recap/sdk";
import client from "../lib/foundry";

interface NewsArticle {
  title: string;
  abstract: string;
  byline: string | null;
  published_date: string;
  url: string;
  multimedia: Array<{
    url: string;
    type: string;
  }> | null;
}

const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [numArticles, setNumArticles] = useState(5);

  const searchArticles = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setProgress(0);
      setError(null);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 500);

      const result = await client(semSearch).executeFunction({
        topic: query,
        numArticles: numArticles,
      });

      clearInterval(interval);
      setProgress(100);

      if (Array.isArray(result)) {
        setResults(result);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      console.error("Error searching articles:", err);
      setError("Failed to fetch articles");
    } finally {
      setLoading(false);
      setProgress(0);
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Semantic News Search</h1>
                  <p className="text-sm text-muted-foreground">
                    Search news articles using semantic understanding
                  </p>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-background p-6 rounded-lg shadow-sm"
            >
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your search topic..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-background"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  Number of articles:
                </label>
                <select
                  value={numArticles}
                  onChange={(e) => setNumArticles(Number(e.target.value))}
                  className="bg-background border rounded-md px-2 py-1 text-sm"
                  disabled={loading}
                >
                  {[5, 10, 15, 20, 25, 30].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </form>

            {/* Progress */}
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-1" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Searching articles...</span>
                  </div>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <ArticleLoadingState key={i} />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((article, index) => (
                  <ArticleCard
                    key={index}
                    headline={article.title}
                    abstract={article.abstract}
                    byline={article.byline || "Unknown Author"}
                    pubDate={new Date(
                      article.published_date
                    ).toLocaleDateString()}
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

export default SemanticSearch;
