import { nytDailyReport } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { Newspaper, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const DailyReport: React.FC = () => {
  // Simple state management
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Get today's date in YYYY-MM-DD format
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  // Start with today's date
  const [date, setDate] = useState(today);

  // Simple date navigation
  const goToDate = (newDate: string) => {
    if (newDate <= today) {
      setDate(newDate);
    }
  };

  // Simple date change handlers
  const goBack = () => {
    const [year, month, day] = date.split("-").map(Number);
    const current = new Date(year, month - 1, day);
    current.setDate(current.getDate() - 1);
    const newDate = current.toISOString().split("T")[0];
    goToDate(newDate);
  };

  const goForward = () => {
    const [year, month, day] = date.split("-").map(Number);
    const current = new Date(year, month - 1, day);
    current.setDate(current.getDate() + 1);
    const newDate = current.toISOString().split("T")[0];
    goToDate(newDate);
  };

  // Fetch report when date changes
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setProgress(0);
        setError(null);

        // Simulate progress
        const interval = setInterval(() => {
          setProgress((p) => (p >= 90 ? 90 : p + 10));
        }, 500);

        const result = await client(nytDailyReport).executeFunction({
          selectedDate: date,
        });

        clearInterval(interval);
        setProgress(100);

        if (typeof result === "string") {
          setSummary(result.trim());
        } else {
          setError("Unexpected response format");
        }
      } catch {
        setError("Failed to fetch report");
      } finally {
        setLoading(false);
        setProgress(0);
      }
    };

    fetchReport();
  }, [date]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    <div className="min-h-[calc(100vh-4rem)] bg-muted/50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Newspaper className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Daily News Report</h1>
                  <p className="text-sm text-muted-foreground">
                    Stay informed with your daily news summary
                  </p>
                </div>
              </div>

              {/* Date Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goBack}
                  className="h-9 w-9"
                  disabled={loading}
                >
                  ←
                </Button>
                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => goToDate(e.target.value)}
                    max={today}
                    className="bg-transparent focus:outline-none text-sm"
                    disabled={loading}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goForward}
                  className="h-9 w-9"
                  disabled={loading || date === today}
                >
                  →
                </Button>
              </div>
            </div>

            {/* Progress */}
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-1" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Loading your daily report...</span>
                  </div>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-muted-foreground">
                    {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {summary}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
