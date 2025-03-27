import { nytDailyReport, recapSentiment } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { Newspaper, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const DailyReport: React.FC = () => {
  // Simple state management
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Update the date state to use Date object
  const [date, setDate] = useState<Date>(new Date());

  // Update date navigation functions
  const goToDate = (newDate: Date) => {
    if (newDate <= new Date()) {
      setDate(newDate);
    }
  };

  const goBack = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    goToDate(newDate);
  };

  const goForward = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    goToDate(newDate);
  };

  // Update useEffect to use date string
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

        const dateString = format(date, "yyyy-MM-dd");
        const result = await client(nytDailyReport).executeFunction({
          selectedDate: dateString,
        });

        clearInterval(interval);
        setProgress(100);

        if (typeof result === "string") {
          setSummary(result.trim());

          // Get sentiment analysis
          const sentimentResult = await client(recapSentiment).executeFunction({
            recap: result.trim(),
          });

          if (typeof sentimentResult === "string") {
            setSentiment(parseFloat(sentimentResult));
          }
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

  // Update date formatting
  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 px-3 py-2 bg-background"
                      disabled={loading}
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(newDate: Date | undefined) =>
                        newDate && goToDate(newDate)
                      }
                      disabled={(date: Date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-muted-foreground">
                      {formatDate(date)}
                    </CardTitle>
                    {sentiment !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Sentiment:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            sentiment > 0
                              ? "text-green-500"
                              : sentiment < 0
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {sentiment.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
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
