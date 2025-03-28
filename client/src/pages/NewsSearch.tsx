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
  const [hasSearched, setHasSearched] = useState(false);

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
      setHasSearched(true);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">News Search</h1>
          <p className="text-muted-foreground">
            Search articles from trusted news sources
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for news..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                disabled={loading}
              >
                <SelectTrigger>
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "MMM d, yyyy") : "From"}
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
                    className="w-full justify-start"
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "MMM d, yyyy") : "To"}
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

              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
                disabled={loading}
                className="w-full justify-between"
              >
                Sources{" "}
                {selectedSources.length > 0 && `(${selectedSources.length})`}
              </Button>
            </div>

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
          </form>
        </div>

        {/* Results */}
        <div className="max-w-6xl mx-auto mt-8">
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
          ) : hasSearched ? (
            <div className="text-center">
              <p className="text-muted-foreground">
                No articles found. Try different keywords or filters.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sources Dialog */}
      <Command open={open} onOpenChange={setOpen}>
        <div className="border-b px-3 py-2">
          <h2 className="font-semibold">Select Sources</h2>
        </div>
        <CommandInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search sources..."
        />
        <CommandList>
          {loadingSources ? (
            <div className="py-4 text-center text-muted-foreground">
              Loading sources...
            </div>
          ) : filteredSources.length === 0 ? (
            <CommandEmpty>No sources found.</CommandEmpty>
          ) : (
            filteredSources.map((source) => (
              <CommandItem
                key={source.id}
                onSelect={() => handleSourceSelect(source.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-4 w-4 rounded-sm border",
                      selectedSources.includes(source.id)
                        ? "bg-primary border-primary"
                        : "border-muted"
                    )}
                  >
                    {selectedSources.includes(source.id) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <span>{source.name}</span>
                </div>
              </CommandItem>
            ))
          )}
        </CommandList>
      </Command>
    </div>
  );
};

export default NewsSearch;
