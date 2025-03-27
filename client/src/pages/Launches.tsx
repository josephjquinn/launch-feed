import { NytWosArticle } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLoadingState } from "@/components/articles/ArticleLoadingState";
import { ArticleErrorState } from "@/components/articles/ArticleErrorState";
import { Newspaper, Filter, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Progress } from "@/components/ui/progress";

interface Article {
  headline: string;
  abstract: string;
  byline: string;
  pubDate: string;
  webUrl: string;
  section: string;
  wordCount: number;
  year: number;
  documentType: string;
  newsDesk: string;
  typeOfMaterial: string;
  leadParagraph: string;
  keywords: string;
  uri: string;
}

const SECTIONS = [
  "World",
  "U.S.",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Arts",
  "Books",
  "Style",
  "Opinion",
  "Education",
  "Climate",
  "Obituaries",
];

const NewsArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [stats, setStats] = useState<{
    totalArticles: number;
    averageWordCount: number;
    uniqueSections: number;
    yearlyData: { year: number; articles: number }[];
  }>({
    totalArticles: 0,
    averageWordCount: 0,
    uniqueSections: 0,
    yearlyData: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Build the filter conditions
        const filterConditions: Record<string, unknown> = {
          pubDate: { $isNull: false },
          headline: { $isNull: false },
          abstract: { $isNull: false },
        };

        if (selectedSection !== "all") {
          filterConditions.sectionName = selectedSection;
        }

        // Handle date filtering
        const dateConditions: Record<string, unknown> = {};
        if (selectedYear !== "all") {
          dateConditions.$gte = new Date(selectedYear, 0, 1);
          dateConditions.$lt = new Date(selectedYear + 1, 0, 1);
        }
        if (fromDate) {
          dateConditions.$gte = fromDate;
        }
        if (toDate) {
          dateConditions.$lte = toDate;
        }
        if (Object.keys(dateConditions).length > 0) {
          filterConditions.pubDate = dateConditions;
        }

        // Fetch articles with pagination
        const page = await client(NytWosArticle)
          .where(filterConditions)
          .fetchPage({
            $pageSize: 10000,
          });

        const articles = page.data;
        const processedArticles = articles.map((article) => {
          const pubDate = article.pubDate
            ? new Date(article.pubDate)
            : new Date();
          return {
            headline: article.headline || "No headline",
            abstract: article.abstract || "No abstract available",
            byline: article.byline || "No author",
            pubDate: format(pubDate, "yyyy-MM-dd"),
            webUrl: article.webUrl || "#",
            section: article.sectionName || "General",
            wordCount: article.wordCount || 0,
            year: pubDate.getFullYear(),
            documentType: article.documentType || "Unknown",
            newsDesk: article.newsDesk || "General",
            typeOfMaterial: article.typeOfMaterial || "Unknown",
            leadParagraph: article.leadParagraph || "",
            keywords: article.keywords || "",
            uri: article.uri || "",
          };
        });

        setArticles(processedArticles);

        // Calculate statistics on the client side
        const totalArticles = processedArticles.length;
        const averageWordCount = Math.round(
          processedArticles.reduce(
            (sum, article) => sum + article.wordCount,
            0
          ) / totalArticles
        );
        const uniqueSections = new Set(
          processedArticles.map((article) => article.section)
        ).size;

        // Calculate yearly data
        const yearlyData = processedArticles.reduce((acc, article) => {
          const year = article.year;
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const yearlyDataArray = Object.entries(yearlyData)
          .map(([year, count]) => ({
            year: parseInt(year),
            articles: count,
          }))
          .sort((a, b) => a.year - b.year);

        setStats({
          totalArticles,
          averageWordCount,
          uniqueSections,
          yearlyData: yearlyDataArray,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch articles. Please check your authentication.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSection, selectedYear, fromDate, toDate]);

  // Filter articles based on search query only (since other filters are handled server-side)
  const filteredArticles = articles.filter((article) => {
    if (!searchQuery) return true;
    return (
      article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get unique years for the year selector from the stats
  const years = stats.yearlyData.map((d) => d.year).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Latest News Articles</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {SECTIONS.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) =>
                    setSelectedYear(value === "all" ? "all" : parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[180px] justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
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
                      className="w-[180px] justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalArticles}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Word Count</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.averageWordCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unique Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.uniqueSections}</p>
            </CardContent>
          </Card>
        </div>

        {stats.yearlyData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Articles Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(value) => value.toString()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => `Year: ${value}`}
                      formatter={(value) => [`${value} articles`, "Articles"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="articles"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Loading articles...</span>
            </div>
            <Progress className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ArticleLoadingState key={i} />
              ))}
            </div>
          </div>
        ) : error ? (
          <ArticleErrorState message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={index} {...article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsArticles;
