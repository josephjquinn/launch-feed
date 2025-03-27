import { nytDailyReport } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { Newspaper, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const DailyReport: React.FC = () => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("2024-12-31");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        setLoading(true);
        setProgress(0);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);

        const result = await client(nytDailyReport).executeFunction({
          selectedDate,
        });

        clearInterval(progressInterval);
        setProgress(100);

        if (typeof result === "string") {
          setSummary(result.trim());
        } else {
          setError("Unexpected response format from the API");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          "Failed to fetch daily report. Please check your authentication."
        );
      } finally {
        setLoading(false);
        setProgress(0);
      }
    };

    fetchDailyReport();
  }, [selectedDate]);

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Daily News Report</h1>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading && (
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Loading your daily report... {progress}%
          </p>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {summary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyReport;
