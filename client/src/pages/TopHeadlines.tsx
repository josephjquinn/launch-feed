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
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

interface Source {
  name: string;
  url: string;
}

interface FormattedArticle {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  url: string;
  urlToImage: string | null;
}

const TopHeadlines: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FormattedArticle[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Combined effect for initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingSources(true);
        setLoadingProgress(0);

        // Start progress interval
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

        // Make a single API call
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?apikey=${
            import.meta.env.VITE_GNEWS_API_KEY
          }&lang=en&country=us&max=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = (await response.json()) as GNewsResponse;

        // Process headlines
        const formattedArticles = data.articles.map((article) => ({
          title: article.title,
          description: article.description || "No description available",
          author: article.source.name,
          publishedAt: new Date(article.publishedAt).toLocaleDateString(),
          url: article.url,
          urlToImage: article.image,
        }));

        // Process sources from the same data
        const uniqueSources = Array.from(
          new Set(data.articles.map((article) => article.source.name))
        ).map((name) => ({
          name,
          url:
            data.articles.find((article) => article.source.name === name)
              ?.source.url || "",
        }));

        setResults(formattedArticles);
        setSources(uniqueSources);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingSources(false);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array since we only want to fetch once on mount

  // Separate effect for fetching headlines when sources change
  useEffect(() => {
    const fetchHeadlines = async () => {
      if (selectedSources.length === 0) return; // Skip if no sources selected

      try {
        setLoading(true);
        const params = new URLSearchParams({
          apikey: import.meta.env.VITE_GNEWS_API_KEY,
          lang: "en",
          country: "us",
          max: "10",
        });

        if (selectedSources.length > 0) {
          // Format sources as a comma-separated list
          params.append("sources", selectedSources.join(","));
        }

        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.errors?.q || "Failed to fetch top headlines"
          );
        }

        const data = (await response.json()) as GNewsResponse;

        const formattedArticles = data.articles.map((article) => ({
          title: article.title,
          description: article.description || "No description available",
          author: article.source.name,
          publishedAt: new Date(article.publishedAt).toLocaleDateString(),
          url: article.url,
          urlToImage: article.image,
        }));

        setResults(formattedArticles);
      } catch (err) {
        console.error("Error fetching top headlines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadlines();
  }, [selectedSources]);

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

            {selectedSources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSources.map((sourceId) => {
                  const source = sources.find((s) => s.name === sourceId);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Select News Sources</DialogTitle>
            <DialogDescription>
              Choose from our curated list of trusted news sources
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
                      filteredSources.map((source) => source.name)
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
                      key={source.name}
                      onClick={() => handleSourceSelect(source.name)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                        "hover:bg-muted/50",
                        selectedSources.includes(source.name) && "bg-muted/30"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-sm border mt-1 flex items-center justify-center flex-shrink-0",
                          selectedSources.includes(source.name)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedSources.includes(source.name) && (
                          <Filter className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="font-medium truncate">
                          {source.name}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {source.url}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

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
