import { useState, useEffect } from "react";
import { Search, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLoadingState } from "@/components/articles/ArticleLoadingState";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

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

const SORT_OPTIONS = [
  { value: "relevancy", label: "Relevancy" },
  { value: "popularity", label: "Popularity" },
  { value: "publishedAt", label: "Published Date" },
];

const NewsSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevancy");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

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
        setSources(data.sources);
      } catch (err) {
        console.error("Error fetching sources:", err);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

  const searchArticles = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        q: query,
        language: "en",
        sortBy,
        apiKey: import.meta.env.VITE_NEWS_API_KEY,
      });

      if (fromDate) {
        params.append("from", format(fromDate, "yyyy-MM-dd"));
      }
      if (toDate) {
        params.append("to", format(toDate, "yyyy-MM-dd"));
      }
      if (selectedSources.length > 0) {
        params.append("sources", selectedSources.join(","));
      }

      const response = await fetch(
        `https://newsapi.org/v2/everything?${params.toString()}`
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

      setResults(formattedArticles);
    } catch (err) {
      console.error("Error searching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchArticles();
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
                  <h1 className="text-2xl font-bold">News Search</h1>
                  <p className="text-sm text-muted-foreground">
                    Search across multiple news sources
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                  }
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? (
                          format(fromDate, "PPP")
                        ) : (
                          <span>From date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "PPP") : <span>To date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(true)}
                  disabled={loading}
                  className="bg-background"
                >
                  {selectedSources.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span>Sources ({selectedSources.length})</span>
                      <Badge variant="secondary" className="ml-2">
                        {selectedSources.length}
                      </Badge>
                    </div>
                  ) : (
                    "Select Sources"
                  )}
                </Button>
              </div>
            </form>

            {/* Sources Command Dialog */}
            <Command open={open} onOpenChange={setOpen}>
              <CommandInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search sources..."
              />
              <CommandList>
                {loadingSources ? (
                  <div className="py-6 text-center text-sm text-slate-500">
                    Loading sources...
                  </div>
                ) : filteredSources.length === 0 ? (
                  <CommandEmpty>No sources found.</CommandEmpty>
                ) : (
                  filteredSources.map((source) => (
                    <CommandItem
                      key={source.id}
                      onSelect={() => handleSourceSelect(source.id)}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                          selectedSources.includes(source.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-slate-300 dark:border-slate-700"
                        )}
                      >
                        {selectedSources.includes(source.id) && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-slate-500">
                          {source.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))
                )}
              </CommandList>
            </Command>

            {/* Selected Sources */}
            {selectedSources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSources.map((sourceId) => {
                  const source = sources.find((s) => s.id === sourceId);
                  return (
                    <Badge
                      key={sourceId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {source?.name}
                      <button
                        onClick={() => handleSourceSelect(sourceId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <ArticleLoadingState key={i} />
                ))}
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
