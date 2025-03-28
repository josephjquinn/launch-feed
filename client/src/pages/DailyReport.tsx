import React, { useEffect, useState } from "react";
import { Newspaper, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fetchDailyReport } from "@/lib/api";
import { motion } from "framer-motion";

interface DailyReportData {
  summary: string;
  topics: string[];
  sentiment: number | null;
}

const DailyReport: React.FC = () => {
  const [data, setData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [inputDate, setInputDate] = useState<string>("2024-12-31");
  const [progress, setProgress] = useState(0);

  // Update date navigation functions
  const goToDate = (newDate: Date) => {
    if (newDate <= new Date()) {
      // Ensure we're working with the local date
      const localDate = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate()
      );
      setDate(localDate);
      setInputDate(format(localDate, "yyyy-MM-dd"));
    }
  };

  const handleSearch = () => {
    // Create date in local timezone by adding time component
    const parsedDate = new Date(inputDate + "T00:00:00");
    if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
      goToDate(parsedDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputDate(e.target.value);
  };

  const goBack = () => {
    if (!date) return;
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 1
    );
    goToDate(newDate);
  };

  const goForward = () => {
    if (!date) return;
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );
    goToDate(newDate);
  };

  // Update useEffect to use the new API service
  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      if (!date) return;

      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Start progress simulation
        const progressInterval = setInterval(() => {
          setProgress((p) => (p >= 90 ? 90 : p + 10));
        }, 500);

        const reportData = await fetchDailyReport(date);

        if (isMounted) {
          clearInterval(progressInterval);
          setProgress(100);
          setData(reportData);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching report:", err);
          setError(
            err instanceof Error ? err.message : "Failed to fetch report"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setProgress(0);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [date]);

  // Update date formatting
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  // Add sentiment label helper function
  const getSentimentLabel = (value: number) => {
    if (value <= 2) return { text: "Very Negative", color: "#ef4444" };
    if (value <= 4) return { text: "Negative", color: "#f87171" };
    if (value <= 6) return { text: "Neutral", color: "#eab308" };
    if (value <= 8) return { text: "Positive", color: "#4ade80" };
    return { text: "Very Positive", color: "#22c55e" };
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Newspaper className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold">Daily News Report</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Stay informed with your daily news summary
              </p>
            </div>

            {/* Date Controls */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={goBack}
                className="h-9 w-9"
                disabled={loading}
              >
                ←
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={inputDate}
                  onChange={handleDateChange}
                  onKeyDown={handleKeyDown}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="h-9 px-3 py-2 border rounded-md bg-background text-foreground"
                  disabled={loading}
                />
                <Button
                  variant="default"
                  onClick={handleSearch}
                  disabled={loading || !inputDate}
                >
                  Search
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={goForward}
                className="h-9 w-9"
                disabled={loading || date >= new Date()}
              >
                →
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Clock className="h-4 w-4" />
                      </motion.div>
                      <span>Fetching your daily report...</span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-3 rounded-full bg-primary/5"
                    />
                    <div className="flex justify-center mt-2">
                      <span className="text-2xl font-bold text-primary">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {!date ? (
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Enter a date and click Search to view the daily report
                  </div>
                </CardContent>
              </Card>
            ) : loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : data && !loading ? (
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-muted-foreground">
                      {formatDate(date)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data.sentiment !== null && (
                    <div className="flex flex-col items-center justify-center space-y-4 border-b pb-6">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={getSentimentLabel(data.sentiment).color}
                            strokeWidth="8"
                            strokeDasharray={`${
                              (data.sentiment / 10) * 283
                            } 283`}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {data.sentiment.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Sentiment
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="text-sm font-medium"
                          style={{
                            color: getSentimentLabel(data.sentiment).color,
                          }}
                        >
                          {getSentimentLabel(data.sentiment).text}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {data.sentiment <= 2
                            ? "Extremely unfavorable news coverage"
                            : data.sentiment <= 4
                            ? "Generally unfavorable coverage"
                            : data.sentiment <= 6
                            ? "Balanced and neutral coverage"
                            : data.sentiment <= 8
                            ? "Generally favorable coverage"
                            : "Extremely favorable news coverage"}
                        </div>
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="topics">Topics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="mt-4">
                      <div className="prose prose-lg max-w-none pt-4">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                          {data.summary}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="topics" className="mt-4">
                      <div className="space-y-4">
                        {data.topics.map((topic, index) => {
                          const [title, content] = topic
                            .split(":")
                            .map((part) => part.trim());
                          return (
                            <div
                              key={index}
                              className="p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <h3 className="font-semibold text-lg mb-2 text-primary">
                                {title}
                              </h3>
                              <p className="text-foreground/90">{content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
