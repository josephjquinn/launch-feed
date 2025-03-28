import { useState, useEffect } from "react";
import { Newspaper, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLoadingState } from "@/components/articles/ArticleLoadingState";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface Source {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

interface SourcesResponse {
  status: string;
  sources: Source[];
  message?: string;
}

const TopHeadlines: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Fetch available sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/sources?apiKey=${
            import.meta.env.VITE_NEWS_API_KEY
          }`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sources");
        }
        const data = (await response.json()) as SourcesResponse;
        if (data.status === "error") {
          throw new Error(data.message || "Failed to fetch sources");
        }
        // Add artificial delay to match loading animation
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setSources(data.sources);
      } catch (err) {
        console.error("Error fetching sources:", err);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

  // Simulate loading progress for sources
  useEffect(() => {
    if (loadingSources) {
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const next = prev + 4;
          if (next >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return next;
        });
      }, 60);

      return () => clearInterval(progressInterval);
    }
  }, [loadingSources]);

  // Fetch top headlines on component mount and when sources change
  useEffect(() => {
    fetchTopHeadlines();
  }, [selectedSources]);

  const fetchTopHeadlines = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        country: "us",
        apiKey: import.meta.env.VITE_NEWS_API_KEY,
      });

      if (selectedSources.length > 0) {
        params.append("sources", selectedSources.join(","));
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch top headlines");
      }

      const data = (await response.json()) as NewsApiResponse;

      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch top headlines");
      }

      const formattedArticles = data.articles.map((article) => ({
        title: article.title,
        description: article.description || "No description available",
        author: article.author,
        publishedAt: new Date(article.publishedAt).toLocaleDateString(),
        url: article.url,
        urlToImage: article.urlToImage,
      }));

      // Add artificial delay to match loading animation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResults(formattedArticles);
    } catch (err) {
      console.error("Error fetching top headlines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const filteredSources = sources.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Top Headlines</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Stay updated with the latest news from trusted sources
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">News Sources</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedSources([])}
              >
                Reset All
              </Button>
            </div>

            {/* Selected Sources Tags */}
            {selectedSources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSources.map((sourceId) => {
                  const source = sources.find((s) => s.id === sourceId);
                  return (
                    <Badge
                      key={sourceId}
                      variant="secondary"
                      className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {source?.name}
                      <button
                        onClick={() => handleSourceSelect(sourceId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Filter className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
              className="w-full justify-between bg-background"
            >
              {selectedSources.length === 0 ? (
                <span className="text-muted-foreground">
                  Select news sources...
                </span>
              ) : (
                <span>
                  {selectedSources.length}{" "}
                  {selectedSources.length === 1 ? "source" : "sources"} selected
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="space-y-8">
              <div className="max-w-lg mx-auto space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Loading headlines...</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <ArticleLoadingState key={i} />
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((article, index) => (
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
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">
                No headlines available. Try selecting different news sources.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sources Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Select News Sources</DialogTitle>
            <DialogDescription>
              Choose from our curated list of trusted news sources
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Clear */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search sources..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedSources(
                      filteredSources.map((source) => source.id)
                    )
                  }
                  className="text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  Select All
                </Button>
                {selectedSources.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSources([])}
                    className="text-muted-foreground hover:text-foreground whitespace-nowrap"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Sources List */}
            <ScrollArea className="h-[400px] rounded-md border bg-muted/5">
              {loadingSources ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-sm space-y-4 p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {Math.round(loadingProgress)}%
                        </span>
                      </div>
                      <Progress value={loadingProgress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 animate-pulse"
                        >
                          <div className="h-4 w-4 rounded-sm bg-muted/20 mt-1" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-2/3 bg-muted/20 rounded" />
                            <div className="space-y-1">
                              <div className="h-3 w-full bg-muted/20 rounded" />
                              <div className="h-3 w-4/5 bg-muted/20 rounded" />
                            </div>
                            <div className="flex gap-2">
                              <div className="h-5 w-16 bg-muted/20 rounded-full" />
                              <div className="h-5 w-12 bg-muted/20 rounded-full" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : filteredSources.length === 0 ? (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-2">
                    <Filter className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      No sources found matching "{searchQuery}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 gap-3">
                  {filteredSources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleSourceSelect(source.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                        "hover:bg-muted/50",
                        selectedSources.includes(source.id) && "bg-muted/30"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-sm border mt-1 flex items-center justify-center flex-shrink-0",
                          selectedSources.includes(source.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedSources.includes(source.id) && (
                          <Filter className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="font-medium truncate">
                          {source.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {source.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge
                            variant="outline"
                            className="capitalize bg-muted/30"
                          >
                            {source.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="uppercase bg-muted/30"
                          >
                            {source.country}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Selected Count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedSources.length}{" "}
                {selectedSources.length === 1 ? "source" : "sources"} selected
              </span>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopHeadlines;
