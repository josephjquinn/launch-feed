import { nytDailyReport } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { ArticleErrorState } from "@/components/articles/ArticleErrorState";
import { Newspaper, Calendar } from "lucide-react";

const DailyReport: React.FC = () => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("2024-12-31");

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        const result = await client(nytDailyReport).executeFunction({
          selectedDate,
        });

        console.log("Raw API Response:", result);
        console.log("Response type:", typeof result);

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
      }
    };

    fetchDailyReport();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
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
                className="px-3 py-1 border rounded-md bg-background"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </div>
        ) : error ? (
          <ArticleErrorState message={error} />
        ) : (
          <div className="prose prose-lg max-w-none">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-muted-foreground mb-4">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="whitespace-pre-wrap text-foreground">
                {summary}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DailyReport;
